#!/usr/bin/env bash
# 构建脚本：把 TypeScript 编译成 JS，并为 data/ 下的 JSON 生成可 require 的 .json.js 模块。
# 本项目用 useCompilerPlugins:[]（关闭 DevTools 的 TS 编译插件），所以改完 .ts 后必须手动跑这个脚本，
# 否则小程序会白屏或报 "module '...json.js' is not defined"。
#
# 用法（在 phonics-star/ 根目录执行）:
#   bash scripts/build.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== 1/2 编译 TypeScript (tsc -> miniprogram 下的 .js) =="
./node_modules/.bin/tsc -p tsconfig.json --declaration false --declarationMap false

echo "== 2/2 生成 data/*.json.js 模块包装 =="
node scripts/gen-json-modules.js miniprogram

echo "== 构建完成 ✅ 回到微信开发者工具点「编译」即可 =="
