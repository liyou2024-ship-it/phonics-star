#!/usr/bin/env python3
import json, hashlib, os

ROOT = "/Users/liyou/WorkBuddy/2026-08-06-00-18-23/phonics-star"
MANIFEST = os.path.join(ROOT, "miniprogram/data/resource-manifest.json")
IMG_DIR = os.path.join(ROOT, "miniprogram/assets/images/words")

# word -> source clipboard file (None = reuse sit)
SRC_MAP = {
    "sap": "clipboard-2026-08-06T13-12-58-359Z-97067a68.jpg",
    "sip": "clipboard-2026-08-06T13-12-58-360Z-2ea731f3.jpg",
    "tip": "clipboard-2026-08-06T13-12-58-361Z-f2042ad2.jpg",
    "pit": "clipboard-2026-08-06T13-12-58-361Z-ee968e95.jpg",
    "pat": "clipboard-2026-08-06T13-12-58-362Z-62253c74.jpg",
    "sit": "clipboard-2026-08-06T13-12-58-362Z-9908ce9c.jpg",
    "tap": "clipboard-2026-08-06T13-12-58-363Z-240ccf07.jpg",
    "sat": None,  # reuse sit
}

CLIP = "/Users/liyou/.workbuddy/clipboard-images"

def md5(path):
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

m = json.load(open(MANIFEST, encoding="utf-8"))
res = m["resources"]

updated = []
for r in res:
    if r.get("resourceType") != "image_word":
        continue
    word = r["resourceId"].replace("img_w_", "")
    webp = os.path.join(IMG_DIR, f"{word}.webp")
    if not os.path.exists(webp):
        print("MISSING FILE:", webp)
        continue
    size = os.path.getsize(webp)
    cs = md5(webp)
    r["actualPath"] = f"/assets/images/words/{word}.webp"
    r["status"] = "imported"
    r["sourceType"] = "chatgpt_image" if word != "sat" else "reuse_sit"
    r["license"] = "ai_generated"
    r["fileSize"] = size
    r["reviewStatus"] = "pending"
    r["checksum"] = cs
    if word == "sat":
        r["note"] = "sat 配图（复用 sit 图）"
    updated.append((word, size, cs))

json.dump(m, open(MANIFEST, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

print("Updated", len(updated), "image_word entries:")
for w, sz, cs in updated:
    print(f"  {w:4} {sz:7d}B  {cs}")
