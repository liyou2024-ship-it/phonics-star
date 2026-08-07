#!/usr/bin/env python3
"""
SATPI 补充音频生成器（第二轮）
生成 10 个扩展词发音 + 2 本绘本整段朗读，补齐课程数据里缺失的引用。
运行: python3 scripts/generate-satpi-extra-audio.py
"""
import asyncio
import os
import sys

AUDIO_ROOT = os.path.join(os.path.dirname(__file__), '../miniprogram/assets/audio')
VOICE = "en-US-JennyNeural"
RATE = "-15%"

# 10 个扩展词（A001 评估课 targetWordIds 直接引用）
EXT_WORDS = [
    ("at", "at", "words/at-normal.mp3"),
    ("it", "it", "words/it-normal.mp3"),
    ("as", "as", "words/as-normal.mp3"),
    ("is", "is", "words/is-normal.mp3"),
    ("pass", "pass", "words/pass-normal.mp3"),
    ("past", "past", "words/past-normal.mp3"),
    ("taps", "taps", "words/taps-normal.mp3"),
    ("tips", "tips", "words/tips-normal.mp3"),
    ("sits", "sits", "words/sits-normal.mp3"),
    ("spat", "spat", "words/spat-normal.mp3"),
]

# 2 本绘本整段朗读
READERS = [
    ("dr_sat_sit", "Sat, sat, sat. Sit, sit, sit. Pat sat. Pat sits.", "readers/sat-sit.mp3"),
    ("dr_tap_pat", "Tap, tap, tap. Pat, pat, pat. Tap it, Pat. Pat sat.", "readers/tap-pat.mp3"),
]


async def generate_audio(text: str, output_path: str, label: str) -> bool:
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
    print("SATPI 补充音频生成器（扩展词 + 绘本）")
    print(f"声音: {VOICE} | 语速: {RATE}")
    print("=" * 50)

    total = len(EXT_WORDS) + len(READERS)
    success = 0

    print(f"\n📖 扩展词发音 ({len(EXT_WORDS)} 个)")
    print("-" * 30)
    for word, text, path in EXT_WORDS:
        try:
            await generate_audio(text, path, word)
            success += 1
        except Exception as e:
            print(f"  ❌ {word}: {e}")

    print(f"\n📚 绘本整段朗读 ({len(READERS)} 本)")
    print("-" * 30)
    for rid, text, path in READERS:
        try:
            await generate_audio(text, path, rid)
            success += 1
        except Exception as e:
            print(f"  ❌ {rid}: {e}")

    print(f"\n{'=' * 50}")
    print(f"完成: {success}/{total}")
    print(f"{'🎉 全部生成成功！' if success == total else f'⚠️  {total - success} 个失败'}")
    print(f"文件位置: {AUDIO_ROOT}")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except ImportError:
        print("❌ 缺少 edge-tts 库，请先安装: pip3 install edge-tts")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n已取消")
