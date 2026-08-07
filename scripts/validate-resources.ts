/**
 * 资源校验工具（增强版）
 * 检查文件存在/格式/大小/时长/授权/review状态/checksum
 * 运行: npx ts-node scripts/validate-resources.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const MINIPROGRAM_ROOT = path.resolve(__dirname, '../miniprogram');
const MANIFEST_PATH = path.join(MINIPROGRAM_ROOT, 'data/resource-manifest.json');
const REPORTS_DIR = path.resolve(__dirname, '../reports');

interface ResourceEntry {
  resourceId: string;
  resourceType: string;
  relatedId: string;
  expectedPath: string;
  actualPath: string;
  status: string;
  duration?: number;
  fileSize?: number;
}

interface ValidationReport {
  missing: ResourceEntry[];
  duplicateNames: string[];
  orphanedRefs: string[];
  unusedFiles: string[];
  invalidFormats: string[];
  oversize: ResourceEntry[];
  missingAuth: ResourceEntry[];
  notReviewed: ResourceEntry[];
  abnormalDuration: ResourceEntry[];
  missingChecksum: ResourceEntry[];
  summary: { total: number; ready: number; missing: number; invalid: number; blocking: number };
}

function loadManifest(): { resources: ResourceEntry[] } {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('资源清单文件不存在:', MANIFEST_PATH);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
}

function validate(): ValidationReport {
  const manifest = loadManifest();
  const resources = manifest.resources || [];
  const report: ValidationReport = {
    missing: [],
    duplicateNames: [],
    orphanedRefs: [],
    unusedFiles: [],
    invalidFormats: [],
    oversize: [],
    summary: { total: resources.length, ready: 0, missing: 0, invalid: 0, blocking: 0 },
  };

  // Phase 4 增强检查
  report.missingAuth = [];
  report.notReviewed = [];
  report.abnormalDuration = [];
  report.missingChecksum = [];

  // 音频时长建议范围 (秒)
  const DURATION_RANGES: Record<string, [number, number]> = {
    audio_phoneme: [0.3, 2.0],
    audio_letter_name: [0.3, 2.0],
    audio_word_normal: [0.4, 3.0],
    audio_word_blend: [1.0, 6.0],
    audio_sentence: [1.0, 15.0],
    audio_ui: [0.1, 3.0],
  };

  // 1. 检查每个资源
  const pathSet = new Set<string>();
  resources.forEach(r => {
    const fullPath = path.join(MINIPROGRAM_ROOT, r.expectedPath);

    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      report.missing.push(r);
      report.summary.missing++;
    } else {
      const stat = fs.statSync(fullPath);

      // 检查文件大小
      const sizeKB = stat.size / 1024;
      r.fileSize = stat.size;

      // 音频格式检查
      if (r.resourceType.startsWith('audio_')) {
        const ext = path.extname(r.expectedPath).toLowerCase();
        if (!['.mp3', '.wav', '.m4a'].includes(ext)) {
          report.invalidFormats.push(r);
          report.summary.invalid++;
        }
        // 单词音频 < 100KB
        if (r.resourceType === 'audio_word_normal' && sizeKB > 100) {
          report.oversize.push(r);
        }
        // 句子音频 < 300KB
        if (r.resourceType === 'audio_sentence' && sizeKB > 300) {
          report.oversize.push(r);
        }
      }

      if (r.resourceType === 'image_word') {
        const ext = path.extname(r.expectedPath).toLowerCase();
        if (!['.png', '.webp', '.jpg', '.jpeg'].includes(ext)) {
          report.invalidFormats.push(r);
          report.summary.invalid++;
        }
        if (sizeKB > 150) {
          report.oversize.push(r);
        }
      }

      report.summary.ready++;
    }

    // Phase 4: 检查授权完整性
    if (!r.sourceType || !r.license || r.license === '') {
      report.missingAuth.push(r);
    }

    // Phase 4: 检查 reviewStatus
    if (r.reviewStatus && r.reviewStatus !== 'approved' && r.reviewStatus !== 'pending') {
      report.notReviewed.push(r);
    }

    // Phase 4: 检查音频时长
    const range = DURATION_RANGES[r.resourceType];
    if (range && r.duration > 0) {
      if (r.duration < range[0] || r.duration > range[1]) {
        report.abnormalDuration.push(r);
      }
    }

    // Phase 4: 检查 checksum
    if (r.status !== 'missing' && !r.checksum) {
      report.missingChecksum.push(r);
    }

    // 阻断发布的条件
    if (r.status === 'missing' && r.resourceType !== 'image_word') {
      report.summary.blocking++;
    }

    // 检查重复命名
    if (pathSet.has(r.expectedPath)) {
      report.duplicateNames.push(r.expectedPath);
    }
    pathSet.add(r.expectedPath);
  });

  // 2. 检查 JSON 数据中引用的资源是否在 manifest 中
  validateReferences(report);

  // 3. 检查未使用的资源文件
  validateUnusedFiles(report, pathSet);

  return report;
}

function validateReferences(report: ValidationReport): void {
  const dataDir = path.join(MINIPROGRAM_ROOT, 'data');
  const jsonFiles = findJsonFiles(dataDir);
  const manifestPaths = new Set(
    (JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')).resources as ResourceEntry[])
      .map(r => r.expectedPath)
  );

  jsonFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      // 检查 audioUrl 和 imageUrl 引用
      const pathRegex = /"audioUrl":\s*"([^"]+)"/g;
      let match;
      while ((match = pathRegex.exec(content)) !== null) {
        const refPath = match[1];
        if (refPath && refPath.startsWith('/assets/') && !manifestPaths.has(refPath)) {
          report.orphanedRefs.push(`${file}: ${refPath}`);
        }
      }
    } catch { /* skip */ }
  });
}

function validateUnusedFiles(report: ValidationReport, manifestPaths: Set<string>): void {
  const audioDir = path.join(MINIPROGRAM_ROOT, 'assets/audio');
  const imageDir = path.join(MINIPROGRAM_ROOT, 'assets/images');

  [audioDir, imageDir].forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = walkDir(dir);
    files.forEach(file => {
      const relPath = '/' + path.relative(MINIPROGRAM_ROOT, file);
      if (!manifestPaths.has(relPath)) {
        report.unusedFiles.push(relPath);
      }
    });
  });
}

function findJsonFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules') {
      results.push(...findJsonFiles(full));
    } else if (e.name.endsWith('.json')) {
      results.push(full);
    }
  });
  return results;
}

function walkDir(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) results.push(...walkDir(full));
    else results.push(full);
  });
  return results;
}

function printReport(report: ValidationReport): void {
  console.log('\n========== 资源校验报告 ==========');
  console.log(`总计: ${report.summary.total} | 就绪: ${report.summary.ready} | 缺失: ${report.summary.missing} | 阻断: ${report.summary.blocking}\n`);

  if (report.missing.length > 0) {
    console.log(`--- 缺失资源 (${report.missing.length}) [阻断发布] ---`);
    report.missing.filter(r => r.resourceType !== 'image_word').forEach(r => console.log(`  ❌ ${r.resourceId}: ${r.expectedPath}`));
  }

  if (report.missingAuth.length > 0) {
    console.log(`\n--- 缺少授权信息 (${report.missingAuth.length}) ---`);
    report.missingAuth.forEach(r => console.log(`  ⚠️  ${r.resourceId}: 缺少 sourceType/license`));
  }

  if (report.notReviewed.length > 0) {
    console.log(`\n--- 未通过审核 (${report.notReviewed.length}) ---`);
    report.notReviewed.forEach(r => console.log(`  ⚠️  ${r.resourceId}: reviewStatus=${r.reviewStatus}`));
  }

  if (report.abnormalDuration.length > 0) {
    console.log(`\n--- 异常时长 (${report.abnormalDuration.length}) ---`);
    report.abnormalDuration.forEach(r => console.log(`  ⚠️  ${r.resourceId}: ${r.duration}秒`));
  }

  if (report.missingChecksum.length > 0) {
    console.log(`\n--- 缺少校验码 (${report.missingChecksum.length}) ---`);
    report.missingChecksum.forEach(r => console.log(`  ⚠️  ${r.resourceId}`));
  }

  if (report.duplicateNames.length > 0) {
    console.log(`\n--- 重复命名 (${report.duplicateNames.length}) ---`);
    report.duplicateNames.forEach(d => console.log(`  ⚠️  ${d}`));
  }

  if (report.invalidFormats.length > 0) {
    console.log(`\n--- 不支持的格式 (${report.invalidFormats.length}) ---`);
    report.invalidFormats.forEach(r => console.log(`  ⚠️  ${r.resourceId}: ${r.expectedPath}`));
  }

  if (report.oversize.length > 0) {
    console.log(`\n--- 文件过大 (${report.oversize.length}) ---`);
    report.oversize.forEach(r => console.log(`  ⚠️  ${r.resourceId}: ${r.expectedPath} (${(r.fileSize! / 1024).toFixed(1)}KB)`));
  }

  if (report.orphanedRefs.length > 0) {
    console.log(`\n--- 孤立引用 (${report.orphanedRefs.length}) ---`);
    report.orphanedRefs.slice(0, 20).forEach(o => console.log(`  ⚠️  ${o}`));
  }

  if (report.unusedFiles.length > 0) {
    console.log(`\n--- 未注册资源文件 (${report.unusedFiles.length}) ---`);
    report.unusedFiles.slice(0, 20).forEach(u => console.log(`  ℹ️  ${u}`));
  }

  // 保存报告
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(REPORTS_DIR, 'resource-validation.json'), JSON.stringify(report, null, 2));
  console.log(`\n报告已保存至: reports/resource-validation.json`);
}

// 执行
const report = validate();
printReport(report);
