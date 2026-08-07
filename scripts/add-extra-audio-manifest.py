#!/usr/bin/env python3
"""把 12 个补充音频登记进 resource-manifest.json，标记 imported。"""
import json, hashlib, os, datetime

M = "miniprogram/data/resource-manifest.json"
A = "miniprogram/assets"
m = json.load(open(M, encoding="utf-8"))

def md5(p):
    h = hashlib.md5()
    with open(p, "rb") as f:
        for c in iter(lambda: f.read(65536), b""):
            h.update(c)
    return h.hexdigest()

# (resourceId, resourceType, relatedId, rel_path, note)
NEW = [
    # 10 扩展词
    ("audio_w_at_n",  "audio_word_normal", "w_at",   "audio/words/at-normal.mp3",   "at 正常发音（扩展词）"),
    ("audio_w_it_n",  "audio_word_normal", "w_it",   "audio/words/it-normal.mp3",   "it 正常发音（扩展词）"),
    ("audio_w_as_n",  "audio_word_normal", "w_as",   "audio/words/as-normal.mp3",   "as 正常发音（扩展词）"),
    ("audio_w_is_n",  "audio_word_normal", "w_is",   "audio/words/is-normal.mp3",   "is 正常发音（扩展词）"),
    ("audio_w_pass_n","audio_word_normal", "w_pass", "audio/words/pass-normal.mp3", "pass 正常发音（扩展词）"),
    ("audio_w_past_n","audio_word_normal", "w_past", "audio/words/past-normal.mp3", "past 正常发音（扩展词）"),
    ("audio_w_taps_n","audio_word_normal", "w_taps", "audio/words/taps-normal.mp3", "taps 正常发音（扩展词）"),
    ("audio_w_tips_n","audio_word_normal", "w_tips", "audio/words/tips-normal.mp3", "tips 正常发音（扩展词）"),
    ("audio_w_sits_n","audio_word_normal", "w_sits", "audio/words/sits-normal.mp3", "sits 正常发音（扩展词）"),
    ("audio_w_spat_n","audio_word_normal", "w_spat", "audio/words/spat-normal.mp3", "spat 正常发音（扩展词）"),
    # 2 绘本整段朗读（新类型）
    ("audio_r_sat_sit", "audio_reader", "dr_sat_sit", "audio/readers/sat-sit.mp3", "绘本 dr_sat_sit 整段朗读"),
    ("audio_r_tap_pat", "audio_reader", "dr_tap_pat", "audio/readers/tap-pat.mp3", "绘本 dr_tap_pat 整段朗读"),
]

existing_ids = {r["resourceId"] for r in m["resources"]}
added = 0
for rid, rtype, relid, rel, note in NEW:
    full = os.path.join(A, rel)
    if not os.path.exists(full):
        print(f"  ⚠️ 文件缺失跳过: {rel}")
        continue
    if rid in existing_ids:
        print(f"  ⏭️ 已存在跳过: {rid}")
        continue
    entry = {
        "resourceId": rid,
        "resourceType": rtype,
        "relatedId": relid,
        "expectedPath": "/assets/" + rel,
        "actualPath": "/assets/" + rel,
        "status": "imported",
        "sourceType": "edge_tts",
        "license": "ai_tts",
        "accent": "us",
        "duration": 0,
        "fileSize": os.path.getsize(full),
        "reviewer": "",
        "reviewStatus": "pending",
        "note": note,
        "required": True,
        "referenced": True,
        "blocksRelease": "reviewing",
        "blocksPublished": True,
        "checksum": md5(full),
    }
    m["resources"].append(entry)
    existing_ids.add(rid)
    added += 1

m["updatedAt"] = datetime.date.today().isoformat()
json.dump(m, open(M, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"\n✅ 新增 {added} 条 imported 条目")
print(f"清单资源总数: {len(m['resources'])}")
