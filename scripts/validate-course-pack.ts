/**
 * 课程包校验工具
 * 检查课程数据完整性、依赖有效性、发布门禁
 * 运行: npx ts-node scripts/validate-course-pack.ts <pack-name>
 */
import * as fs from 'fs';
import * as path from 'path';

const MINIPROGRAM_ROOT = path.resolve(__dirname, '../miniprogram');

interface ValidationError {
  file: string;
  id: string;
  field: string;
  reason: string;
  suggestion: string;
}

function loadPack(packName: string): Record<string, any> {
  const packDir = path.join(MINIPROGRAM_ROOT, 'data/course-packs', packName);
  if (!fs.existsSync(packDir)) {
    console.error(`课程包不存在: ${packDir}`);
    process.exit(1);
  }
  const files = fs.readdirSync(packDir).filter(f => f.endsWith('.json'));
  const data: Record<string, any> = {};
  files.forEach(f => {
    const name = f.replace('.json', '');
    data[name] = JSON.parse(fs.readFileSync(path.join(packDir, f), 'utf-8'));
  });
  return data;
}

function validate(packName: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const data = loadPack(packName);

  const lessons = data.lessons || [];
  const units = data.units || [];
  const phonemes = data.phonemes || [];
  const words = data.words || [];
  const readers = data.readers || [];

  const lessonIds = new Set(lessons.map((l: any) => l.id));
  const unitIds = new Set(units.map((u: any) => u.id));
  const phonemeIds = new Set(phonemes.map((p: any) => p.id));
  const wordIds = new Set(words.map((w: any) => w.id));

  // 1. 检查 lessonId 重复
  const seenIds = new Set<string>();
  lessons.forEach((l: any) => {
    if (seenIds.has(l.id)) {
      errors.push({ file: 'lessons.json', id: l.id, field: 'id', reason: '课节ID重复', suggestion: '使用唯一ID' });
    }
    seenIds.add(l.id);
  });

  // 2. 检查 unitId 存在
  lessons.forEach((l: any) => {
    if (l.unitId && !unitIds.has(l.unitId)) {
      errors.push({ file: 'lessons.json', id: l.id, field: 'unitId', reason: `单元 ${l.unitId} 不存在`, suggestion: '确认单元ID有效' });
    }
  });

  // 3. 检查前置课节存在
  lessons.forEach((l: any) => {
    (l.prerequisiteLessonIds || []).forEach((preId: string) => {
      if (!lessonIds.has(preId)) {
        errors.push({ file: 'lessons.json', id: l.id, field: 'prerequisiteLessonIds', reason: `前置课节 ${preId} 不存在`, suggestion: '确认前置课节ID' });
      }
    });
  });

  // 4. 检查目标词存在
  lessons.forEach((l: any) => {
    (l.targetWordIds || []).forEach((wid: string) => {
      if (!wordIds.has(wid)) {
        errors.push({ file: 'lessons.json', id: l.id, field: 'targetWordIds', reason: `单词 ${wid} 不存在`, suggestion: '确认单词存在于词库' });
      }
    });
  });

  // 5. 检查目标音素存在
  lessons.forEach((l: any) => {
    (l.targetPhonemeIds || []).forEach((pid: string) => {
      if (!phonemeIds.has(pid)) {
        errors.push({ file: 'lessons.json', id: l.id, field: 'targetPhonemeIds', reason: `音素 ${pid} 不存在`, suggestion: '确认音素ID有效' });
      }
    });
  });

  // 6. 检查步骤类型
  const validStepTypes = ['phoneme_intro','sound_discrimination','audio_choice','phoneme_blending','blend_word','word_segmenting','segment_word','pronunciation','mini_game','decodable_reading','lesson_reward','assessment'];
  lessons.forEach((l: any) => {
    (l.steps || []).forEach((s: any) => {
      if (!validStepTypes.includes(s.type)) {
        errors.push({ file: 'lessons.json', id: l.id, field: `steps.${s.id}.type`, reason: `不支持的步骤类型 ${s.type}`, suggestion: `使用以下之一: ${validStepTypes.join(', ')}` });
      }
    });
  });

  // 7. 检查可解码短文
  readers.forEach((r: any) => {
    (r.targetWordIds || []).forEach((wid: string) => {
      if (!wordIds.has(wid)) errors.push({ file: 'readers.json', id: r.id, field: 'targetWordIds', reason: `单词 ${wid} 不存在`, suggestion: '确认单词ID' });
    });
    if (!r.sentences || r.sentences.length === 0) {
      errors.push({ file: 'readers.json', id: r.id, field: 'sentences', reason: '缺少句子内容', suggestion: '添加至少2句' });
    }
  });

  // 8. 检查依赖循环
  const deps = new Map<string, Set<string>>();
  lessons.forEach((l: any) => {
    deps.set(l.id, new Set(l.prerequisiteLessonIds || []));
  });
  lessons.forEach((l: any) => {
    const visited = new Set<string>();
    function dfs(id: string): boolean {
      if (visited.has(id)) return true; // 循环
      visited.add(id);
      const pre = deps.get(id);
      if (!pre) return false;
      for (const p of pre) {
        if (dfs(p)) return true;
      }
      visited.delete(id);
      return false;
    }
    if (dfs(l.id)) {
      errors.push({ file: 'lessons.json', id: l.id, field: 'prerequisiteLessonIds', reason: '存在依赖循环', suggestion: '移除循环依赖' });
    }
  });

  return errors;
}

const packName = process.argv[2] || 'starter-satpi';
const errors = validate(packName);

console.log(`\n========== 课程包校验: ${packName} ==========`);
console.log(`错误数: ${errors.length}\n`);

if (errors.length === 0) {
  console.log('✅ 所有校验通过！课程包可以发布。');
} else {
  errors.forEach((e, i) => {
    console.log(`${i + 1}. [${e.file}] ${e.id}.${e.field}`);
    console.log(`   原因: ${e.reason}`);
    console.log(`   建议: ${e.suggestion}\n`);
  });
  console.log(`❌ 发现 ${errors.length} 个错误，课程包未通过校验。`);
}

// 保存报告
const reportsDir = path.resolve(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(path.join(reportsDir, `course-validation-${packName}.json`), JSON.stringify(errors, null, 2));
console.log(`\n报告已保存至: reports/course-validation-${packName}.json`);
