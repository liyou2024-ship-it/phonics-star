/**
 * 资源汇总报告生成器
 * 运行: npx ts-node scripts/generate-resource-report.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const MINIPROGRAM_ROOT = path.resolve(__dirname, '../miniprogram');
const MANIFEST_PATH = path.join(MINIPROGRAM_ROOT, 'data/resource-manifest.json');
const REPORTS_DIR = path.resolve(__dirname, '../reports');

interface ResourceEntry {
  resourceId: string;
  resourceType: string;
  status: string;
  reviewStatus: string;
  expectedPath: string;
  actualPath: string;
  fileSize: number;
  duration: number;
  checksum: string;
  sourceType: string;
  license: string;
  note: string;
}

function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
}

function generate() {
  const manifest = loadManifest();
  const resources: ResourceEntry[] = manifest.resources || [];

  // 按状态分类
  const byStatus: Record<string, ResourceEntry[]> = {
    missing: [],
    imported: [],
    needs_review: [],
    approved: [],
    ready: [],
    rejected: [],
  };
  resources.forEach(r => {
    const s = r.status || 'missing';
    if (byStatus[s]) byStatus[s].push(r); else byStatus.missing.push(r);
  });

  // 按类型分类
  const byType: Record<string, ResourceEntry[]> = {};
  resources.forEach(r => {
    if (!byType[r.resourceType]) byType[r.resourceType] = [];
    byType[r.resourceType].push(r);
  });

  // 缺失资源（阻断发布）
  const blockingMissing = resources.filter(r =>
    r.status === 'missing' && r.resourceType !== 'image_word'
  );

  // 授权不完整
  const authIncomplete = resources.filter(r =>
    r.status !== 'missing' && (!r.sourceType || !r.license)
  );

  // 审核未完成
  const reviewIncomplete = resources.filter(r =>
    r.status !== 'missing' && r.reviewStatus !== 'approved'
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    total: resources.length,
    byStatus: Object.fromEntries(Object.entries(byStatus).map(([k, v]) => [k, v.length])),
    byType: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, v.length])),
    blockingCount: blockingMissing.length,
    authIncompleteCount: authIncomplete.length,
    reviewIncompleteCount: reviewIncomplete.length,
    canPublish: blockingMissing.length === 0 && authIncomplete.length === 0 && reviewIncomplete.length === 0,
    publishBlockers: [
      ...(blockingMissing.length > 0 ? [`${blockingMissing.length}个必需资源缺失`] : []),
      ...(authIncomplete.length > 0 ? [`${authIncomplete.length}个资源授权不完整`] : []),
      ...(reviewIncomplete.length > 0 ? [`${reviewIncomplete.length}个资源未通过审核`] : []),
    ],
    missingAudio: resources.filter(r => r.status === 'missing' && r.resourceType.startsWith('audio_')).map(r => ({
      id: r.resourceId, type: r.resourceType, path: r.expectedPath, note: r.note
    })),
    missingImages: resources.filter(r => r.status === 'missing' && r.resourceType.startsWith('image_')).map(r => ({
      id: r.resourceId, path: r.expectedPath, note: r.note
    })),
    importedAudio: resources.filter(r => r.status !== 'missing' && r.resourceType.startsWith('audio_')).map(r => ({
      id: r.resourceId, status: r.status, review: r.reviewStatus, size: r.fileSize, duration: r.duration
    })),
    importedImages: resources.filter(r => r.status !== 'missing' && r.resourceType.startsWith('image_')).map(r => ({
      id: r.resourceId, status: r.status, review: r.reviewStatus, size: r.fileSize
    })),
  };

  // 保存报告
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const reportPath = path.join(REPORTS_DIR, 'resource-summary.json');
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));

  // 打印摘要
  console.log('\n========== 资源汇总报告 ==========');
  console.log(`总资源: ${summary.total}`);
  console.log(`就绪: ${summary.byStatus.ready || 0 + summary.byStatus.approved || 0}`);
  console.log(`缺失: ${summary.byStatus.missing}`);
  console.log(`阻断数: ${summary.blockingCount}\n`);

  if (!summary.canPublish) {
    console.log('❌ 课程包不可发布。阻断原因:');
    summary.publishBlockers.forEach(b => console.log(`  • ${b}`));
  } else {
    console.log('✅ 所有门禁通过，课程包可以发布！');
  }

  console.log(`\n报告已保存至: ${reportPath}`);
}

generate();
