#!/usr/bin/env python3
"""Phase 5 Batch 6 validator. Read-only. Extends Batch 5 with Unit 10 no-new-vocab gate."""
import json, sys, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONTENT = ROOT / "docs" / "content"

REGULAR_DIST  = {"multiple_choice":3, "complete_sentence":2, "word_bank":2, "matching":2, "type_answer":1}
CHECKPOINT_DIST = {"multiple_choice":3, "complete_sentence":0, "word_bank":3, "matching":2, "type_answer":2}

BLOCK_EN_LEFT = {"am","is","are","be","to be","was","were","do","don't","does"}
PRONOUN_HE = {"אני","אתה","את","הוא","היא","אנחנו","אתם","אתן","הם","הן"}

errors = 0
warns = 0

def fail(unit, path, msg):
    global errors
    errors += 1
    print(f"FAIL [unit={unit}] {path}: {msg}")

def warn(unit, path, msg):
    global warns
    warns += 1
    print(f"warn [unit={unit}] {path}: {msg}")

def has_hebrew(s):
    return any(0x0590 <= ord(c) <= 0x05FF for c in s)

# --- Gather all English vocab tokens from Units 1-9 for U10 leak check ---
def english_tokens_from_data(data):
    """Tokenize English strings (option text, correct_answer, tiles, pairs.en) to a set of lowercased words."""
    toks = set()
    def add_string(s):
        if not s: return
        # Strip trailing punctuation, lowercase, split
        for w in re.findall(r"[A-Za-z']+", s):
            toks.add(w.lower())
    for lesson in data["lessons"]:
        for ex in lesson["exercises"]:
            add_string(ex.get("correct_answer"))
            for alt in ex.get("correct_answer_alternatives", []):
                add_string(alt)
            for t in ex.get("word_bank_words", []):
                add_string(t)
            for opt in ex.get("options", []):
                if opt.get("language") == "en":
                    add_string(opt.get("text"))
            for pair in ex.get("pairs", []):
                add_string(pair.get("en"))
            # also add English from prompt_text if prompt_language=en
            if ex.get("prompt_language") == "en":
                add_string(ex.get("prompt_text"))
    return toks

# Build known vocab from Units 1-9
known_en_vocab = set()
for n in range(1,10):
    p = CONTENT / f"beginner_unit_{n}.json"
    with open(p, encoding="utf-8") as f:
        known_en_vocab |= english_tokens_from_data(json.load(f))

# Allow common English glue words that may appear in U10 prompts even if unusual
GLUE_ALWAYS_OK = {"a","an","the","is","am","are","i","you","he","she","we","they","it","my","your","his","her","our","their","this","that","and","or","not","in","on","at","with","to","of","from","be","do","does","don't","was","were","here","there"}

def validate_unit(unit_num, data):
    u = data["unit"]
    for k in ("title_he","icon_emoji","color_hex","order_index"):
        if not u.get(k):
            fail(unit_num, "unit", f"missing {k}")
    lessons = data["lessons"]
    if len(lessons) != 5:
        fail(unit_num, "lessons", f"expected 5 lessons, got {len(lessons)}")
    for li, lesson in enumerate(lessons):
        is_cp = lesson["is_checkpoint"]
        if li == 4 and not is_cp:
            fail(unit_num, f"L{li}", "L5 should be is_checkpoint=true")
        if li != 4 and is_cp:
            fail(unit_num, f"L{li}", "non-final lesson is_checkpoint=true")
        exs = lesson["exercises"]
        if len(exs) != 10:
            fail(unit_num, f"L{li}", f"expected 10 exercises, got {len(exs)}")
        dist = {}
        for e in exs:
            dist[e["type"]] = dist.get(e["type"], 0) + 1
        expected = CHECKPOINT_DIST if is_cp else REGULAR_DIST
        for t,n in expected.items():
            if dist.get(t,0) != n:
                fail(unit_num, f"L{li}", f"type {t}: expected {n}, got {dist.get(t,0)}")
        for ei, ex in enumerate(exs):
            p = f"L{li}E{ei}({ex['type']})"
            if not ex.get("prompt_text"): fail(unit_num, p, "empty prompt")
            if not ex.get("explanation_he"): fail(unit_num, p, "empty explanation_he")
            t = ex["type"]
            if t == "multiple_choice":
                opts = ex["options"]
                if len(opts) != 4: fail(unit_num, p, f"MC needs 4 options, got {len(opts)}")
                corr = [o for o in opts if o["is_correct"]]
                if len(corr) != 1: fail(unit_num, p, f"MC needs exactly 1 correct, got {len(corr)}")
                texts = [o["text"] for o in opts]
                if len(set(texts)) != len(texts):
                    fail(unit_num, p, f"duplicate option texts: {texts}")
            elif t == "complete_sentence":
                opts = ex["options"]
                if len(opts) != 3: fail(unit_num, p, f"CS needs 3 options, got {len(opts)}")
                corr = [o for o in opts if o["is_correct"]]
                if len(corr) != 1: fail(unit_num, p, f"CS needs exactly 1 correct, got {len(corr)}")
                if "___" not in ex["prompt_text"]:
                    fail(unit_num, p, "CS prompt must contain '___'")
                if not has_hebrew(ex["prompt_text"]):
                    fail(unit_num, p, "CS prompt has no Hebrew context")
                if not ex.get("correct_answer"):
                    fail(unit_num, p, "CS missing correct_answer")
            elif t == "word_bank":
                ca = ex.get("correct_answer","")
                if not ca: fail(unit_num, p, "WB missing correct_answer")
                if len(ca.split()) < 2: fail(unit_num, p, f"WB correct_answer must be multi-token: {ca!r}")
                tiles = ex.get("word_bank_words", [])
                if not tiles: fail(unit_num, p, "WB missing word_bank_words")
                tokens = ca.split()
                missing = [tok for tok in tokens if tok not in tiles]
                if missing: fail(unit_num, p, f"WB tokens not in tiles: {missing} (tiles={tiles})")
            elif t == "matching":
                pairs = ex.get("pairs", [])
                if len(pairs) != 4: fail(unit_num, p, f"matching needs 4 pairs, got {len(pairs)}")
                for pi, pair in enumerate(pairs):
                    en = pair.get("en","").strip().lower()
                    he = pair.get("he","").strip()
                    if en in BLOCK_EN_LEFT and he in PRONOUN_HE:
                        fail(unit_num, p, f"BLOCK pair {pi}: copula→pronoun: {en} = {he}")
                    if not en or not he:
                        fail(unit_num, p, f"empty pair {pi}")
            elif t == "type_answer":
                if not ex.get("correct_answer"):
                    fail(unit_num, p, "TA missing correct_answer")

    # Unit 10: no-new-vocab gate
    if unit_num == 10:
        u10_tokens = english_tokens_from_data(data)
        new_tokens = sorted(u10_tokens - known_en_vocab - GLUE_ALWAYS_OK)
        if new_tokens:
            # These are tokens not seen in Units 1-9 nor in glue list
            for tok in new_tokens:
                fail(10, "vocab-gate", f"Unit 10 uses new vocab not in Units 1-9: {tok!r}")

# Run
for n in (7,8,9,10):
    path = CONTENT / f"beginner_unit_{n}.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    print(f"\n=== Validating Unit {n}: {data['unit']['title_he']} ({data['unit']['title_en']}) ===")
    pre_err = errors
    validate_unit(n, data)
    all_ex = [ex for l in data["lessons"] for ex in l["exercises"]]
    n_match = sum(1 for ex in all_ex if ex["type"]=="matching")
    n_opts = sum(len(ex.get("options",[])) for ex in all_ex) + n_match*8
    status = "PASS" if errors == pre_err else "FAIL"
    print(f"  {status}: 5 lessons, {len(all_ex)} exercises, ~{n_opts} options, {n_match*4} pair groups")

print(f"\n=== TOTAL: {errors} errors, {warns} warnings ===")
sys.exit(0 if errors == 0 else 1)
