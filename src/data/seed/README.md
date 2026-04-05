# Seed Data Format

Each lesson has its own JSON file for easy review and editing.

## File naming: `unit{N}-lesson{M}.json`

## Exercise JSON format:
```json
{
  "type": "multiple_choice | word_bank | type_answer | matching | complete_sentence",
  "prompt_text": "The question or prompt shown to the user",
  "prompt_language": "en | he",
  "correct_answer": "For type_answer, word_bank, complete_sentence",
  "correct_answer_alternatives": ["alternative correct answers"],
  "word_bank_words": ["word", "tiles", "including", "distractors"],
  "explanation_he": "Hebrew explanation shown on wrong answer",
  "options": [
    {
      "option_text": "Option text",
      "option_language": "en | he",
      "is_correct": true,
      "pair_group_id": "matching-pair-id (matching type only)"
    }
  ]
}
```

## Rules:
- Each lesson: exactly 10 exercises
- At least 3 different exercise types per lesson
- Target distribution: 3 MC, 2 word_bank, 2 type_answer/complete_sentence, 2 matching, 1 flexible
- Distractors must be plausible (same semantic category)
- Hebrew explanations: 1-2 sentences, no grammar jargon for beginners
- Words from exercises 1-3 should reappear in exercises 7-10
