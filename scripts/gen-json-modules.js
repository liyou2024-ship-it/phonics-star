#!/usr/bin/env node
/**
 * gen-json-modules.js
 * 本项目用 useCompilerPlugins:[] + 手动 tsc 编译，DevTools 不会再自动把
 * `require('../data/x.json')` 转成可加载的模块。运行时实际去找 `x.json.js`，
 * 因此这里为每个 data/ 下的 .json 生成同名的 .json.js 模块 (module.exports = <json>)。
 *
 * 用法: node scripts/gen-json-modules.js <miniprogram 目录>
 * 例:   node scripts/gen-json-modules.js miniprogram
 */
const fs = require('fs');
const path = require('path');

const mini = path.resolve(process.argv[2] || 'miniprogram');
if (!fs.existsSync(mini)) {
  console.error('找不到 miniprogram 目录:', mini);
  process.exit(1);
}

// 只处理位于某个名为 data 的目录(或其子目录)下的 .json，避免误伤
// 组件/页面的框架配置文件 (如 bottom-nav.json)。
function isUnderDataDir(dir) {
  let p = dir;
  while (true) {
    if (path.basename(p) === 'data') return true;
    const parent = path.dirname(p);
    if (parent === p) return false;
    p = parent;
  }
}

let count = 0;
const skipped = [];

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full);
    } else if (e.name.endsWith('.json') && isUnderDataDir(dir)) {
      const txt = fs.readFileSync(full, 'utf8');
      let body;
      try {
        JSON.parse(txt); // 校验合法性
        body = txt.trim();
      } catch (err) {
        skipped.push(full + ' -> ' + err.message);
        continue;
      }
      const out = full.slice(0, -5) + '.json.js';
      fs.writeFileSync(out, 'module.exports = ' + body + ';\n', 'utf8');
      count++;
    }
  }
}

walk(mini);
console.log('已生成 .json.js 模块数:', count);
if (skipped.length) {
  console.log('跳过(非标准 JSON):');
  skipped.forEach((s) => console.log('  ' + s));
}
