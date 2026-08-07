/**
 * 生成人工审核 HTML 页面
 * 运行: npx ts-node scripts/generate-review-html.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const MINIPROGRAM_ROOT = path.resolve(__dirname, '../miniprogram');
const MANIFEST_PATH = path.join(MINIPROGRAM_ROOT, 'data/resource-manifest.json');
const REVIEW_PATH = path.resolve(__dirname, '../reports/resource-review.html');

interface ResourceEntry {
  resourceId: string;
  resourceType: string;
  relatedId: string;
  expectedPath: string;
  actualPath: string;
  status: string;
  note: string;
  accent: string;
  sourceType: string;
  license: string;
  duration: number;
  fileSize: number;
  checksum: string;
  reviewer: string;
  reviewStatus: string;
}

function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
}

function generateHTML(): string {
  const manifest = loadManifest();
  const resources: ResourceEntry[] = manifest.resources || [];

  // 按类型分组
  const groups: Record<string, ResourceEntry[]> = {};
  resources.forEach(r => {
    const group = r.resourceType.startsWith('audio_') ? '音频' : '图片';
    if (!groups[group]) groups[group] = [];
    groups[group].push(r);
  });

  const typeLabels: Record<string, string> = {
    audio_phoneme: '字母音', audio_letter_name: '字母名称',
    audio_word_normal: '单词发音', audio_word_blend: '慢速拼读',
    audio_sentence: '句子朗读', audio_ui: 'UI音效',
    image_word: '单词配图',
  };

  let rows = '';
  Object.entries(groups).forEach(([groupName, items]) => {
    rows += `<h2>${groupName} (${items.length})</h2>`;
    rows += '<table><tr><th>ID</th><th>类型</th><th>关联</th><th>路径</th><th>状态</th><th>大小</th><th>时长</th><th>操作</th></tr>';
    items.forEach(r => {
      const statusClass = r.status === 'ready' ? 'ready' : r.status === 'missing' ? 'missing' : 'pending';
      const audioPath = path.join(MINIPROGRAM_ROOT, r.actualPath || r.expectedPath);
      const fileExists = fs.existsSync(audioPath);

      rows += `<tr class="${statusClass}">
        <td>${r.resourceId}</td>
        <td>${typeLabels[r.resourceType] || r.resourceType}</td>
        <td>${r.relatedId}</td>
        <td><code>${r.expectedPath}</code></td>
        <td class="status-${r.status}">${r.status}</td>
        <td>${r.fileSize > 0 ? (r.fileSize / 1024).toFixed(1) + 'KB' : '-'}</td>
        <td>${r.duration > 0 ? r.duration + 's' : '-'}</td>
        <td>
          ${r.resourceType.startsWith('audio_') && fileExists
            ? `<audio controls src="${r.actualPath}" style="width:200px;height:24px"></audio>`
            : r.resourceType.startsWith('image_') && fileExists
              ? `<img src="${r.actualPath}" style="width:48px;height:48px;object-fit:contain" />`
              : '📭'}
          <select class="review-select" data-id="${r.resourceId}">
            <option value="pending" ${r.reviewStatus === 'pending' ? 'selected' : ''}>待审核</option>
            <option value="approved" ${r.reviewStatus === 'approved' ? 'selected' : ''}>✅ 通过</option>
            <option value="rejected" ${r.reviewStatus === 'rejected' ? 'selected' : ''}>❌ 拒绝</option>
          </select>
          <input class="review-note" data-id="${r.resourceId}" placeholder="审核备注" value="${r.reviewer || ''}" />
        </td>
      </tr>`;
    });
    rows += '</table>';
  });

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>资源审核 — 自然拼读星 SATPI</title>
<style>
body{font-family:-apple-system,sans-serif;max-width:1200px;margin:0 auto;padding:20px;background:#fafafa}
h1{color:#7C3AED}
h2{margin-top:32px;color:#1F2937;border-bottom:2px solid #E5E7EB;padding-bottom:8px}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);margin-bottom:24px}
th{background:#F5F3FF;color:#7C3AED;font-weight:700;padding:12px;text-align:left;font-size:13px}
td{padding:10px 12px;border-bottom:1px solid #F3F4F6;font-size:13px}
tr.ready{background:#F0FDF4}
tr.missing{background:#FEF2F2}
.status-ready{color:#10B981;font-weight:700}
.status-missing{color:#EF4444;font-weight:700}
.status-imported{color:#F59E0B;font-weight:700}
.status-needs_review{color:#3B82F6;font-weight:700}
code{background:#F3F4F6;padding:2px 6px;border-radius:4px;font-size:11px}
.review-select{padding:4px 8px;border-radius:6px;border:1px solid #D1D5DB;margin:4px 0;display:block}
.review-note{padding:4px 8px;border-radius:6px;border:1px solid #D1D5DB;margin:4px 0;display:block;width:150px;font-size:12px}
button{background:#7C3AED;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:16px;cursor:pointer;margin-top:16px}
button:hover{background:#6D28D9}
.summary{background:#fff;padding:20px;border-radius:12px;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.summary-item{display:inline-block;margin-right:24px}
.summary-value{font-size:28px;font-weight:900;color:#7C3AED}
.summary-label{font-size:14px;color:#6B7280}
</style>
</head>
<body>
<h1>🎵 资源审核 — 自然拼读星 SATPI</h1>
<div class="summary">
  <div class="summary-item"><span class="summary-value">${resources.length}</span><br><span class="summary-label">总资源</span></div>
  <div class="summary-item"><span class="summary-value">${resources.filter(r => r.status === 'ready' || r.status === 'approved').length}</span><br><span class="summary-label">已就绪</span></div>
  <div class="summary-item"><span class="summary-value">${resources.filter(r => r.status === 'missing').length}</span><br><span class="summary-label">缺失</span></div>
  <div class="summary-item"><span class="summary-value">${resources.filter(r => r.reviewStatus === 'approved').length}</span><br><span class="summary-label">已审核</span></div>
</div>
<p>双击播放音频预览，选择审核状态并填写备注，完成后点击保存。</p>
${rows}
<button onclick="saveReview()">💾 保存审核结果</button>
<script>
// 审核结果收集
function saveReview() {
  const results = [];
  document.querySelectorAll('.review-select').forEach(select => {
    const id = select.dataset.id;
    const note = document.querySelector(\`.review-note[data-id="\${id}"]\`).value;
    results.push({ resourceId: id, reviewStatus: select.value, reviewer: note });
  });
  const blob = new Blob([JSON.stringify(results, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'resource-review.json';
  a.click();
  alert('审核结果已保存！请将 resource-review.json 放入 reports/ 目录');
}
</script>
</body>
</html>`;
}

// 生成
const html = generateHTML();
const dir = path.dirname(REVIEW_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(REVIEW_PATH, html);
console.log(`审核页面已生成: ${REVIEW_PATH}`);
console.log(`用浏览器打开此文件，可播放音频、预览图片、标记审核状态。`);
