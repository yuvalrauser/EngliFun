#!/usr/bin/env python3
"""
Phase 5 Batch 6 SQL generator — Units 7/8/9/10. Outputs 4 chunks per unit.

UUID convention (continues Batch 5):
  Unit N:           00000000-0000-0000-0001-00000000000{N}  (N=7..A; for N=10 → ...00000000000a)
  Lessons:          00000000-0000-0008-0002-NNNNNNNNNNNN
    Unit 7: 061..065   Unit 8: 071..075   Unit 9: 081..085   Unit 10: 091..095
  Exercises:        00000000-0000-0008-0003-NNNNNNNNNNNN
    Unit 7: 301..350  Unit 8: 351..400  Unit 9: 401..450  Unit 10: 451..500
  Pair groups:      b0000000-0008-0004-0000-NNNNNNNNNNNN
    Unit 7: 241..280  Unit 8: 281..320  Unit 9: 321..360  Unit 10: 361..400
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONTENT = ROOT / "docs" / "content"
OUT = ROOT / "scripts" / "_batch6_out"
OUT.mkdir(parents=True, exist_ok=True)

COURSE_ID = "00000000-0000-0000-0000-000000000001"

UNIT_CFG = {
    7:  dict(unit_id="00000000-0000-0000-0001-000000000007", lesson_base=61, ex_base=301, pair_base=241,
             prev_checkpoint_lesson_id="00000000-0000-0008-0002-000000000055", order_index=6),
    8:  dict(unit_id="00000000-0000-0000-0001-000000000008", lesson_base=71, ex_base=351, pair_base=281,
             prev_checkpoint_lesson_id="00000000-0000-0008-0002-000000000065", order_index=7),
    9:  dict(unit_id="00000000-0000-0000-0001-000000000009", lesson_base=81, ex_base=401, pair_base=321,
             prev_checkpoint_lesson_id="00000000-0000-0008-0002-000000000075", order_index=8),
    10: dict(unit_id="00000000-0000-0000-0001-00000000000a", lesson_base=91, ex_base=451, pair_base=361,
             prev_checkpoint_lesson_id="00000000-0000-0008-0002-000000000085", order_index=9),
}

def lesson_id(unit_n, lesson_idx):
    n = UNIT_CFG[unit_n]["lesson_base"] + lesson_idx
    return f"00000000-0000-0008-0002-{n:012d}"

def exercise_id(unit_n, global_ex_idx):
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
    out.append(f"-- Stage 1+2: insert unit {unit_n} + 5 lessons")
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
    out.append(f"insert into public.lessons (id, unit_id, title, description, order_index, is_checkpoint) values")
    rows = []
    for li, lesson in enumerate(data["lessons"]):
        rows.append(f"  ('{lesson_id(unit_n,li)}', '{cfg['unit_id']}', {sql_str(lesson['title_he'])}, {sql_str(lesson['description_he'])}, {li}, {sql_bool(lesson['is_checkpoint'])})")
    out.append(",\n".join(rows) + ";")
    return "\n".join(out)

def gen_exercise_block(unit_n, data, lesson_indices):
    out = []
    ex_rows = []
    opt_rows = []
    matching_pair_counter = 0
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
                    opt_rows.append(
                        f"  ('{ex_uuid}', {sql_str(pair['en'])}, 'en', true, '{pg}', {pi*2})"
                    )
                    opt_rows.append(
                        f"  ('{ex_uuid}', {sql_str(pair['he'])}, 'he', true, '{pg}', {pi*2+1})"
                    )
                matching_pair_counter += 4
            else:
                for oi, opt in enumerate(ex.get("options", [])):
                    opt_rows.append(
                        f"  ('{ex_uuid}', {sql_str(opt['text'])}, {sql_str(opt['language'])}, "
                        f"{sql_bool(opt['is_correct'])}, null, {oi})"
                    )
    out.append(f"-- exercises for L{lesson_indices[0]}..L{lesson_indices[-1]}")
    out.append("insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index) values")
    out.append(",\n".join(ex_rows) + ";")
    out.append("")
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

for unit_n in (7,8,9,10):
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
