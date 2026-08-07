#!/usr/bin/env python3
"""生成 8 个可选音效:
- 5 个字母名 (ess/ay/tee/pee/eye) 用 edge-tts (en-US-JennyNeural)
- 3 个 UI 提示音 (correct/incorrect/complete) 用 ffmpeg 合成
"""
import os, asyncio, subprocess, sys

ROOT = "/Users/liyou/WorkBuddy/2026-08-06-00-18-23/phonics-star"
AUDIO = os.path.join(ROOT, "miniprogram/assets/audio")
FF = "/Users/liyou/bin/ffmpeg"
VOICE = "en-US-JennyNeural"
RATE = "-15%"

# 字母名: (text, out_rel_path)
LETTERS = [
    ("ess", "letter-names/s.mp3"),
    ("ay",  "letter-names/a.mp3"),
    ("tee", "letter-names/t.mp3"),
    ("pee", "letter-names/p.mp3"),
    ("eye", "letter-names/i.mp3"),
]

async def tts(text, rel):
    import edge_tts
    out = os.path.join(AUDIO, rel)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    await edge_tts.Communicate(text, VOICE, rate=RATE).save(out)
    print(f"  ✅ letter {rel} ({os.path.getsize(out)//1024}KB)")

def _src(freq, dur):
    """生成单个音符的 lavfi 输入参数 (list)。"""
    return ["-f", "lavfi", "-i",
            f"aevalsrc='sin(2*PI*{freq}*t)*exp(-3*t)':s=44100:d={dur}"]

def _seq(out, notes):
    """notes: list of (freq, start_sec, dur_sec)，合成后混音输出 mp3。"""
    inputs = []
    fc = []
    for idx, (f, start, dur) in enumerate(notes):
        inputs += _src(f, dur)
        fc.append(f"[{idx}]adelay={int(start*1000)}|{int(start*1000)}[n{idx}]")
    mix = "".join(f"[n{i}]" for i in range(len(notes))) + f"amix=inputs={len(notes)}:duration=longest"
    end = max(s+d for _,s,d in notes)
    fade_st = max(0.0, end - 0.08)
    subprocess.run([FF, "-y", *inputs,
        "-filter_complex", ";".join(fc) + ";" + mix + f",afade=t=out:st={fade_st:.2f}:d=0.08",
        out], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(f"  ✅ {os.path.relpath(out, AUDIO)} ({os.path.getsize(out)//1024}KB)")

def synth_ui():
    """用 ffmpeg 合成 3 个 UI 提示音。"""
    ui_dir = os.path.join(AUDIO, "ui")
    os.makedirs(ui_dir, exist_ok=True)
    # correct: 上行双音 C6→E6 明亮清脆
    _seq(os.path.join(ui_dir, "correct.mp3"),
         [(1046.5, 0.00, 0.18), (1318.5, 0.16, 0.22)])
    # incorrect: 下行双低音
    _seq(os.path.join(ui_dir, "incorrect.mp3"),
         [(311.1, 0.00, 0.16), (233.1, 0.14, 0.28)])
    # complete: 上行四音阶 C5 E5 G5 C6 欢快
    _seq(os.path.join(ui_dir, "complete.mp3"),
         [(523.25, 0.00, 0.16), (659.25, 0.16, 0.16), (783.99, 0.32, 0.16), (1046.5, 0.48, 0.34)])

async def main():
    print("=== 可选音效生成 ===")
    print("字母名 (edge-tts):")
    for text, rel in LETTERS:
        try:
            await tts(text, rel)
        except Exception as e:
            print(f"  ❌ {rel}: {e}")
    print("UI 提示音 (ffmpeg 合成):")
    try:
        synth_ui()
    except Exception as e:
        print(f"  ❌ UI 合成失败: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except ImportError:
        print("❌ 缺少 edge-tts，先 pip install edge-tts")
        sys.exit(1)
