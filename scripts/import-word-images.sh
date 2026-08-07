#!/usr/bin/env bash
set -e
cd /Users/liyou/WorkBuddy/2026-08-06-00-18-23/phonics-star
SRC=/Users/liyou/.workbuddy/clipboard-images
DST=miniprogram/assets/images/words
mkdir -p "$DST"
FF=/Users/liyou/bin/ffmpeg

convert() {
  local word="$1" src="$2"
  local out="$DST/$word.webp"
  "$FF" -y -i "$src" -vf "scale=512:512:force_original_aspect_ratio=increase,crop=512:512" -quality 90 -compression_level 4 "$out" >/dev/null 2>&1
  printf "%-10s <- %s : %s bytes\n" "$word.webp" "$(basename "$src")" "$(stat -f%z "$out")"
}

convert sap "$SRC/clipboard-2026-08-06T13-12-58-359Z-97067a68.jpg"
convert sip "$SRC/clipboard-2026-08-06T13-12-58-360Z-2ea731f3.jpg"
convert tip "$SRC/clipboard-2026-08-06T13-12-58-361Z-f2042ad2.jpg"
convert pit "$SRC/clipboard-2026-08-06T13-12-58-361Z-ee968e95.jpg"
convert pat "$SRC/clipboard-2026-08-06T13-12-58-362Z-62253c74.jpg"
convert sit "$SRC/clipboard-2026-08-06T13-12-58-362Z-9908ce9c.jpg"
convert tap "$SRC/clipboard-2026-08-06T13-12-58-363Z-240ccf07.jpg"

cp "$DST/sit.webp" "$DST/sat.webp"
printf "%-10s (reuse sit) : %s bytes\n" "sat.webp" "$(stat -f%z "$DST/sat.webp")"
