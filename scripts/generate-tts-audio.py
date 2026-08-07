#!/usr/bin/env python3
"""
SATPI TTS 批量音频生成器
使用 Microsoft Edge TTS (免费) 生成 8 个单词发音 + 2 篇短文句子朗读
运行: python3 scripts/generate-tts-audio.py
"""

import asyncio
import os
import sys

# 目标目录
AUDIO_ROOT = os.path.join(os.path.dirname(__file__), '../miniprogram/assets/audio')

# 美式英语女声，语速 0.85x 适合儿童
VOICE = "en-US-JennyNeural"
RATE = "-15%"  # 稍慢

# ===== 单词正常发音 (8 个) =====
WORDS = [
    ("sat", "sat", "words/sat-normal.mp3"),
    ("sit", "sit", "words/sit-normal.mp3"),
    ("tap", "tap", "words/tap-normal.mp3"),
    ("pat", "pat", "words/pat-normal.mp3"),
    ("pit", "pit", "words/pit-normal.mp3"),
    ("tip", "tip", "words/tip-normal.mp3"),
    ("sip", "sip", "words/sip-normal.mp3"),
    ("sap", "sap", "words/sap-normal.mp3"),
]

# ===== 句子朗读 (2 篇短文，每篇 4 句) =====
SENTENCES = [
    ("dr01-s01", "Sat, sat, sat.", "sentences/dr01-s01.mp3"),
    ("dr01-s02", "Sit, sit, sit.", "sentences/dr01-s02.mp3"),
    ("dr01-s03", "Pat sat.", "sentences/dr01-s03.mp3"),
    ("dr01-s04", "Pat sits.", "sentences/dr01-s04.mp3"),
    ("dr02-s01", "Tap, tap, tap.", "sentences/dr02-s01.mp3"),
    ("dr02-s02", "Pat, pat, pat.", "sentences/dr02-s02.mp3"),
    ("dr02-s03", "Tap it, Pat.", "sentences/dr02-s03.mp3"),
    ("dr02-s04", "Pat sat.", "sentences/dr02-s04.mp3"),
]


async def generate_audio(text: str, output_path: str, label: str) -> bool:
    """使用 edge-tts 生成单个音频文件"""
    import edge_tts

    full_path = os.path.join(AUDIO_ROOT, output_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)

    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(full_path)

    size_kb = os.path.getsize(full_path) / 1024
    print(f"  ✅ {label}: {output_path} ({size_kb:.1f}KB)")
    return True


async def main():
    print("=" * 50)
    print("SATPI TTS 音频批量生成器")
    print(f"声音: {VOICE} | 语速: {RATE}")
    print("=" * 50)

    total = len(WORDS) + len(SENTENCES)
    success = 0

    # 生成单词音频
    print(f"\n📖 单词正常发音 ({len(WORDS)} 个)")
    print("-" * 30)
    for word, text, path in WORDS:
        try:
            await generate_audio(text, path, word)
            success += 1
        except Exception as e:
            print(f"  ❌ {word}: {e}")

    # 生成句子音频
    print(f"\n📄 句子朗读 ({len(SENTENCES)} 句)")
    print("-" * 30)
    for sid, text, path in SENTENCES:
        try:
            await generate_audio(text, path, sid)
            success += 1
        except Exception as e:
            print(f"  ❌ {sid}: {e}")

    print(f"\n{'=' * 50}")
    print(f"完成: {success}/{total}")
    if success == total:
        print("🎉 全部生成成功！")
    else:
        print(f"⚠️  {total - success} 个文件生成失败，请检查网络连接。")
    print(f"\n文件位置: {AUDIO_ROOT}")
    print(f"\n下一步:")
    print(f"  1. 试听检查发音质量")
    print(f"  2. 运行: npx ts-node scripts/import-resources.ts")
    print(f"  3. 运行: npx ts-node scripts/validate-resources.ts")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except ImportError:
        print("❌ 缺少 edge-tts 库，请先安装:")
        print("   pip3 install edge-tts")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n已取消")
