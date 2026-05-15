#!/usr/bin/env python3
"""
Phase 5 Batch 5 — generate SQL chunks for Units 4/5/6.

Outputs 4 chunks per unit into scripts/_batch5_out/:
  unit{N}_a_unit_lessons.sql
  unit{N}_b_l0_l1.sql
  unit{N}_c_l2_l3.sql
  unit{N}_d_l4_continuity.sql

UUID conventions (continuing Batch 4):
  Unit N:           00000000-0000-0000-0001-00000000000{N}
  Lessons (U=unit, L=order_index): 00000000-0000-0008-0002-0000000000{U}{L+1}  (zero-padded to 12 hex)
    Unit 4: ..031..035   Unit 5: ..041..045   Unit 6: ..051..055
  Exercises:        00000000-0000-0008-0003-000000000{NNN}
    Unit 4: 151..200    Unit 5: 201..250    Unit 6: 251..300
  Pair groups:      b0000000-0008-0004-0000-000000000{NNN}
    Unit 4: 121..160    Unit 5: 161..200    Unit 6: 201..240
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONTENT = ROOT / "docs" / "content"
OUT = ROOT / "scripts" / "_batch5_out"
OUT.mkdir(parents=True, exist_ok=True)

COURSE_ID = "00000000-0000-0000-0000-000000000001"

UNIT_CFG = {
    4: dict(unit_id="00000000-0000-0000-0001-000000000004",
            lesson_base=31, ex_base=151, pair_base=121,
            prev_checkpoint_lesson_id="00000000-0000-0008-0002-000000000025",
            order_index=3),
    5: dict(unit_id="00000000-0000-0000-0001-000000000005",
            lesson_base=41, ex_base=201, pair_base=161,
            prev_checkpoint_lesson_id="00000000-0000-0008-0002-000000000035",
            order_index=4),
    6: dict(unit_id="00000000-0000-0000-0001-000000000006",
            lesson_base=51, ex_base=251, pair_base=201,
            prev_checkpoint_lesson_id="00000000-0000-0008-0002-000000000045",
            order_index=5),
}

def lesson_id(unit_n, lesson_idx):
    cfg = UNIT_CFG[unit_n]
    n = cfg["lesson_base"] + lesson_idx
    return f"00000000-0000-0008-0002-{n:012d}"

def exercise_id(unit_n, global_ex_idx):
    # global_ex_idx: 0..49 within the unit
    n = UNIT_CFG[unit_n]["ex_base"] + global_ex_idx
    return f"00000000-0000-0008-0003-{n:012d}"

def pair_group_id(unit_n, pg_idx):
    n = UNIT_CFG[unit_n]["pair_base"] + pg_idx
    return f"b0000000-0008-0004-0000-{n:012d}"

def sql_str(s):
    if s is None: return "null"
    return "'" + s.replace("'", "''") + "'"

def sql_jsonb(obj):
    return "'" + json.dumps(obj, ensure_ascii=False).replace("'", "''") + "'::jsonb"

def sql_bool(b): return "true" if b else "false"

def gen_unit_lessons(unit_n, data):
    cfg = UNIT_CFG[unit_n]
    u = data["unit"]
    out = []
    out.append(f"-- Stage 1: insert unit {unit_n}")
    out.append(f"insert into public.units (id, course_id, title, description, icon_emoji, color_hex, order_index)")
    out.append(f"values (")
    out.append(f"  '{cfg['unit_id']}', '{COURSE_ID}',")
    out.append(f"  {sql_str(u['title_he'])},")
    out.append(f"  {sql_str(u.get('objective_he',''))},")
    out.append(f"  {sql_str(u['icon_emoji'])},")
    out.append(f"  {sql_str(u['color_hex'])},")
    out.append(f"  {u['order_index']}")
    out.append(f");")
    out.append("")
    out.append(f"-- Stage 2: insert 5 lessons for unit {unit_n}")
    out.append(f"insert into public.lessons (id, unit_id, title, description, order_index, is_checkpoint) values")
    rows = []
    for li, lesson in enumerate(data["lessons"]):
        rows.append(f"  ('{lesson_id(unit_n,li)}', '{cfg['unit_id']}', {sql_str(lesson['title_he'])}, {sql_str(lesson['description_he'])}, {li}, {sql_bool(lesson['is_checkpoint'])})")
    out.append(",\n".join(rows) + ";")
    return "\n".join(out)

def gen_exercise_block(unit_n, data, lesson_indices):
    """Emit exercises + exercise_options for the given lesson_indices (0..4)."""
    out = []
    ex_rows = []
    opt_rows = []
    matching_pair_counter = 0  # running across the whole unit's matching exs
    # Need to compute matching counter from scratch for correctness:
    # We assign pair_group_ids in document order across matching exercises in the WHOLE UNIT,
    # so we need to compute the starting counter based on lessons before this block.
    for li_before in range(lesson_indices[0]):
        for ex in data["lessons"][li_before]["exercises"]:
            if ex["type"] == "matching":
                matching_pair_counter += 4
    for li in lesson_indices:
        lesson = data["lessons"][li]
        for ei, ex in enumerate(lesson["exercises"]):
            global_ex_idx = li * 10 + ei
            ex_uuid = exercise_id(unit_n, global_ex_idx)
            l_uuid = lesson_id(unit_n, li)
            corr = ex.get("correct_answer")
            alts = ex.get("correct_answer_alternatives", [])
            tiles = ex.get("word_bank_words", [])
            ex_rows.append(
                f"  ('{ex_uuid}', '{l_uuid}', {sql_str(ex['type'])}, {sql_str(ex['prompt_text'])}, "
                f"{sql_str(ex.get('prompt_language','en'))}, "
                f"{sql_str(corr)}, "
                f"{sql_jsonb(alts)}, "
                f"{sql_jsonb(tiles)}, "
                f"{sql_str(ex['explanation_he'])}, "
                f"{ei})"
            )
            if ex["type"] == "matching":
                for pi, pair in enumerate(ex["pairs"]):
                    pg = pair_group_id(unit_n, matching_pair_counter + pi)
                    # en option (order = pi*2)
                    opt_rows.append(
                        f"  ('{ex_uuid}', {sql_str(pair['en'])}, 'en', true, '{pg}', {pi*2})"
                    )
                    opt_rows.append(
                        f"  ('{ex_uuid}', {sql_str(pair['he'])}, 'he', true, '{pg}', {pi*2+1})"
                    )
                matching_pair_counter += 4
            else:
                # MC / CS — has explicit 'options' array; TA / WB have none
                for oi, opt in enumerate(ex.get("options", [])):
                    opt_rows.append(
                        f"  ('{ex_uuid}', {sql_str(opt['text'])}, {sql_str(opt['language'])}, "
                        f"{sql_bool(opt['is_correct'])}, null, {oi})"
                    )
    out.append(f"-- exercises for L{lesson_indices[0]}..L{lesson_indices[-1]}")
    out.append("insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index) values")
    out.append(",\n".join(ex_rows) + ";")
    out.append("")
    out.append("-- exercise_options")
    out.append("insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values")
    out.append(",\n".join(opt_rows) + ";")
    return "\n".join(out)

def gen_continuity_unlock(unit_n):
    cfg = UNIT_CFG[unit_n]
    new_l0 = lesson_id(unit_n, 0)
    prev_cp = cfg["prev_checkpoint_lesson_id"]
    return f"""-- Stage 4: unlock L0 of unit {unit_n} for users who already completed previous unit's checkpoint
insert into public.user_lesson_progress (user_id, lesson_id, status)
select ulp.user_id, '{new_l0}'::uuid, 'unlocked'
from public.user_lesson_progress ulp
where ulp.lesson_id = '{prev_cp}'::uuid
  and ulp.status = 'completed'
  and not exists (
    select 1 from public.user_lesson_progress ulp2
    where ulp2.user_id = ulp.user_id and ulp2.lesson_id = '{new_l0}'::uuid
  );"""

for unit_n in (4,5,6):
    with open(CONTENT / f"beginner_unit_{unit_n}.json", encoding="utf-8") as f:
        data = json.load(f)
    a = gen_unit_lessons(unit_n, data)
    b = gen_exercise_block(unit_n, data, [0,1])
    c = gen_exercise_block(unit_n, data, [2,3])
    d_ex = gen_exercise_block(unit_n, data, [4])
    d = d_ex + "\n\n" + gen_continuity_unlock(unit_n)
    (OUT / f"unit{unit_n}_a_unit_lessons.sql").write_text(a, encoding="utf-8")
    (OUT / f"unit{unit_n}_b_l0_l1.sql").write_text(b, encoding="utf-8")
    (OUT / f"unit{unit_n}_c_l2_l3.sql").write_text(c, encoding="utf-8")
    (OUT / f"unit{unit_n}_d_l4_continuity.sql").write_text(d, encoding="utf-8")
    print(f"Unit {unit_n}: wrote 4 chunks")

print("Done.")
