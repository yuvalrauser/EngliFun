#!/usr/bin/env python3
"""Phase 5 Batch 5 validator. Read-only — no DB writes."""
import json, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONTENT = ROOT / "docs" / "content"

REGULAR_DIST  = {"multiple_choice":3, "complete_sentence":2, "word_bank":2, "matching":2, "type_answer":1}
CHECKPOINT_DIST = {"multiple_choice":3, "complete_sentence":0, "word_bank":3, "matching":2, "type_answer":2}

# Block list: matching pair MUST NOT translate copula/aux to pronoun or meta-text.
BLOCK_EN_LEFT = {"am","is","are","be","to be","was","were"}
PRONOUN_HE = {"אני","אתה","את","הוא","היא","אנחנו","אתם","אתן","הם","הן"}

def fail(unit, path, msg):
    print(f"FAIL [unit={unit}] {path}: {msg}")
    return 1

def warn(unit, path, msg):
    print(f"warn [unit={unit}] {path}: {msg}")

def validate_unit(unit_num, data):
    errors = 0
    u = data["unit"]
    for k in ("title_he","icon_emoji","color_hex","order_index"):
        if not u.get(k):
            errors += fail(unit_num, "unit", f"missing {k}")
    lessons = data["lessons"]
    if len(lessons) != 5:
        errors += fail(unit_num, "lessons", f"expected 5 lessons, got {len(lessons)}")
    for li, lesson in enumerate(lessons):
        is_cp = lesson["is_checkpoint"]
        if li == 4 and not is_cp:
            errors += fail(unit_num, f"L{li}", "L5 should be is_checkpoint=true")
        if li != 4 and is_cp:
            errors += fail(unit_num, f"L{li}", "non-final lesson is_checkpoint=true")
        exs = lesson["exercises"]
        if len(exs) != 10:
            errors += fail(unit_num, f"L{li}", f"expected 10 exercises, got {len(exs)}")
        dist = {}
        for e in exs:
            dist[e["type"]] = dist.get(e["type"], 0) + 1
        expected = CHECKPOINT_DIST if is_cp else REGULAR_DIST
        for t,n in expected.items():
            if dist.get(t,0) != n:
                errors += fail(unit_num, f"L{li}", f"type {t}: expected {n}, got {dist.get(t,0)}")
        for ei, ex in enumerate(exs):
            p = f"L{li}E{ei}({ex['type']})"
            if not ex.get("prompt_text"): errors += fail(unit_num, p, "empty prompt")
            if not ex.get("explanation_he"): errors += fail(unit_num, p, "empty explanation_he")
            t = ex["type"]
            if t == "multiple_choice":
                opts = ex["options"]
                if len(opts) != 4: errors += fail(unit_num, p, f"MC needs 4 options, got {len(opts)}")
                corr = [o for o in opts if o["is_correct"]]
                if len(corr) != 1: errors += fail(unit_num, p, f"MC needs exactly 1 correct, got {len(corr)}")
                texts = [o["text"] for o in opts]
                if len(set(texts)) != len(texts):
                    errors += fail(unit_num, p, f"duplicate option texts: {texts}")
            elif t == "complete_sentence":
                opts = ex["options"]
                if len(opts) != 3: errors += fail(unit_num, p, f"CS needs 3 options, got {len(opts)}")
                corr = [o for o in opts if o["is_correct"]]
                if len(corr) != 1: errors += fail(unit_num, p, f"CS needs exactly 1 correct, got {len(corr)}")
                if "___" not in ex["prompt_text"]:
                    errors += fail(unit_num, p, "CS prompt must contain '___'")
                # Hebrew context check: prompt should have some Hebrew chars
                has_he = any(0x0590 <= ord(c) <= 0x05FF for c in ex["prompt_text"])
                if not has_he:
                    errors += fail(unit_num, p, "CS prompt has no Hebrew context")
                if not ex.get("correct_answer"):
                    errors += fail(unit_num, p, "CS missing correct_answer")
            elif t == "word_bank":
                ca = ex.get("correct_answer","")
                if not ca: errors += fail(unit_num, p, "WB missing correct_answer")
                if len(ca.split()) < 2: errors += fail(unit_num, p, f"WB correct_answer must be multi-token: {ca!r}")
                tiles = ex.get("word_bank_words", [])
                if not tiles: errors += fail(unit_num, p, "WB missing word_bank_words")
                # Buildability: all tokens of correct_answer must be in tiles
                tokens = ca.split()
                missing = [tok for tok in tokens if tok not in tiles]
                if missing: errors += fail(unit_num, p, f"WB tokens not in tiles: {missing} (tiles={tiles})")
            elif t == "matching":
                pairs = ex.get("pairs", [])
                if len(pairs) != 4: errors += fail(unit_num, p, f"matching needs 4 pairs, got {len(pairs)}")
                for pi, pair in enumerate(pairs):
                    en = pair.get("en","").strip().lower()
                    he = pair.get("he","").strip()
                    if en in BLOCK_EN_LEFT and he in PRONOUN_HE:
                        errors += fail(unit_num, p, f"BLOCK pair {pi}: copula→pronoun: {en} = {he}")
                    if not en or not he:
                        errors += fail(unit_num, p, f"empty pair {pi}")
            elif t == "type_answer":
                if not ex.get("correct_answer"):
                    errors += fail(unit_num, p, "TA missing correct_answer")
    return errors

total_errors = 0
for n in (4,5,6):
    path = CONTENT / f"beginner_unit_{n}.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    print(f"\n=== Validating Unit {n}: {data['unit']['title_he']} ({data['unit']['title_en']}) ===")
    e = validate_unit(n, data)
    total_errors += e
    if e == 0:
        # Print stats
        all_ex = [ex for l in data["lessons"] for ex in l["exercises"]]
        n_match = sum(1 for ex in all_ex if ex["type"]=="matching")
        n_opts = sum(len(ex.get("options",[])) for ex in all_ex) + n_match*8
        print(f"  PASS: 5 lessons, {len(all_ex)} exercises, ~{n_opts} options, {n_match*4} pair groups")

print(f"\n=== TOTAL ERRORS: {total_errors} ===")
sys.exit(0 if total_errors == 0 else 1)
