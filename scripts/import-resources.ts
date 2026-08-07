/**
 * 资源导入工具
 * 扫描指定目录 → 匹配 resourceId → 格式检查 → 更新 manifest
 * 运行: npx ts-node scripts/import-resources.ts <import-dir>
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

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
  fileSize: number;
  duration: number;
  checksum: string;
  [key: string]: any;
}

interface ImportReport {
  imported: string[];
  skipped: string[];
  rejected: { file: string; reason: string }[];
  duplicateFiles: string[];
  unknownFiles: string[];
  summary: { total: number; imported: number; skipped: number; rejected: number };
}

interface ManifestFile {
  version: string;
  updatedAt: string;
  resources: ResourceEntry[];
}

// ---- 配置 ----
const ALLOWED_AUDIO_EXT = ['.mp3', '.wav'];
const ALLOWED_IMAGE_EXT = ['.webp', '.png', '.jpg'];
const MAX_AUDIO_WORD_KB = 100;
const MAX_AUDIO_SENTENCE_KB = 300;
const MAX_IMAGE_KB = 150;

function loadManifest(): ManifestFile {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('资源清单不存在:', MANIFEST_PATH);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
}

function saveManifest(manifest: ManifestFile): void {
  manifest.updatedAt = new Date().toISOString().split('T')[0];
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function computeChecksum(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

function matchResource(fileName: string, manifest: ManifestFile): ResourceEntry | null {
  // 通过 expectedPath 的 basename 匹配
  return manifest.resources.find(r => {
    const expectedName = path.basename(r.expectedPath);
    return expectedName.toLowerCase() === fileName.toLowerCase();
  }) || null;
}

function validateFormat(filePath: string, resource: ResourceEntry): string | null {
  const ext = path.extname(filePath).toLowerCase();

  if (resource.resourceType.startsWith('audio_')) {
    if (!ALLOWED_AUDIO_EXT.includes(ext)) {
      return `不支持的音频格式: ${ext}（允许: ${ALLOWED_AUDIO_EXT.join(', ')}）`;
    }
  } else if (resource.resourceType.startsWith('image_')) {
    if (!ALLOWED_IMAGE_EXT.includes(ext)) {
      return `不支持的图片格式: ${ext}（允许: ${ALLOWED_IMAGE_EXT.join(', ')}）`;
    }
  }
  return null;
}

function validateSize(filePath: string, resource: ResourceEntry): string | null {
  const stat = fs.statSync(filePath);
  const sizeKB = stat.size / 1024;

  if (resource.resourceType === 'audio_word_normal' && sizeKB > MAX_AUDIO_WORD_KB) {
    return `单词音频过大: ${sizeKB.toFixed(0)}KB > ${MAX_AUDIO_WORD_KB}KB`;
  }
  if (resource.resourceType === 'audio_word_blend' && sizeKB > MAX_AUDIO_WORD_KB * 1.5) {
    return `慢速拼读音频过大: ${sizeKB.toFixed(0)}KB > ${MAX_AUDIO_WORD_KB * 1.5}KB`;
  }
  if (resource.resourceType === 'audio_sentence' && sizeKB > MAX_AUDIO_SENTENCE_KB) {
    return `句子音频过大: ${sizeKB.toFixed(0)}KB > ${MAX_AUDIO_SENTENCE_KB}KB`;
  }
  if (resource.resourceType === 'image_word' && sizeKB > MAX_IMAGE_KB) {
    return `图片过大: ${sizeKB.toFixed(0)}KB > ${MAX_IMAGE_KB}KB`;
  }
  return null;
}

function importFile(sourcePath: string, resource: ResourceEntry, manifest: ManifestFile): void {
  // 复制文件到目标位置
  const targetDir = path.dirname(path.join(MINIPROGRAM_ROOT, resource.expectedPath));
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetPath = path.join(MINIPROGRAM_ROOT, resource.expectedPath);
  fs.copyFileSync(sourcePath, targetPath);

  const stat = fs.statSync(targetPath);

  // 更新 manifest
  resource.actualPath = resource.expectedPath;
  resource.fileSize = stat.size;
  resource.status = 'imported';
  resource.checksum = computeChecksum(targetPath);
}

function importFromDir(importDir: string): ImportReport {
  if (!fs.existsSync(importDir)) {
    console.error('导入目录不存在:', importDir);
    process.exit(1);
  }

  const manifest = loadManifest();
  const report: ImportReport = {
    imported: [],
    skipped: [],
    rejected: [],
    duplicateFiles: [],
    unknownFiles: [],
    summary: { total: 0, imported: 0, skipped: 0, rejected: 0 },
  };

  const files = fs.readdirSync(importDir).filter(f => !f.startsWith('.'));
  report.summary.total = files.length;

  files.forEach(fileName => {
    const sourcePath = path.join(importDir, fileName);
    const resource = matchResource(fileName, manifest);

    if (!resource) {
      report.unknownFiles.push(fileName);
      report.summary.rejected++;
      report.rejected.push({ file: fileName, reason: '未在 manifest 中找到匹配资源' });
      return;
    }

    // 检查是否已导入
    if (resource.status === 'approved' || resource.status === 'ready') {
      report.skipped.push(resource.resourceId);
      report.summary.skipped++;
      return;
    }

    // 格式检查
    const formatError = validateFormat(sourcePath, resource);
    if (formatError) {
      report.summary.rejected++;
      report.rejected.push({ file: fileName, reason: formatError });
      return;
    }

    // 大小检查
    const sizeError = validateSize(sourcePath, resource);
    if (sizeError) {
      report.summary.rejected++;
      report.rejected.push({ file: fileName, reason: sizeError });
      return;
    }

    // 执行导入
    try {
      importFile(sourcePath, resource, manifest);
      report.imported.push(resource.resourceId);
      report.summary.imported++;
    } catch (err) {
      report.summary.rejected++;
      report.rejected.push({ file: fileName, reason: (err as Error).message });
    }
  });

  // 保存 manifest
  saveManifest(manifest);

  // 保存导入报告
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(REPORTS_DIR, 'import-report.json'),
    JSON.stringify(report, null, 2)
  );

  return report;
}

function printReport(report: ImportReport): void {
  console.log('\n========== 资源导入报告 ==========');
  console.log(`总文件: ${report.summary.total}`);
  console.log(`已导入: ${report.summary.imported}`);
  console.log(`已跳过: ${report.summary.skipped}`);
  console.log(`已拒绝: ${report.summary.rejected}\n`);

  if (report.imported.length > 0) {
    console.log(`--- 成功导入 (${report.imported.length}) ---`);
    report.imported.forEach(id => console.log(`  ✅ ${id}`));
  }

  if (report.rejected.length > 0) {
    console.log(`\n--- 拒绝 (${report.rejected.length}) ---`);
    report.rejected.forEach(r => console.log(`  ❌ ${r.file}: ${r.reason}`));
  }

  if (report.unknownFiles.length > 0) {
    console.log(`\n--- 未识别文件 (${report.unknownFiles.length}) ---`);
    report.unknownFiles.forEach(f => console.log(`  ❓ ${f}`));
  }

  console.log('\n报告已保存至: reports/import-report.json');
}

// 执行
const importDir = process.argv[2];
if (!importDir) {
  console.log('用法: npx ts-node scripts/import-resources.ts <导入目录>');
  console.log('示例: npx ts-node scripts/import-resources.ts ~/Desktop/satpi-resources/');
  process.exit(0);
}

const report = importFromDir(importDir);
printReport(report);
