# PSLE Grammar Super App (Singapore English)

Mobile-first standalone web app covering PSLE P6 grammar scope with modular, lazy-loaded static content shards.

## Key Features

- Full syllabus hierarchy: Module -> Topic -> Subskill
- `201` examples per subskill (strictly unique per subskill)
- `201` MCQs per subskill for each format:
  - `multiple_choice_grammar`
  - `grammar_cloze`
  - `editing_spelling_grammar`
  - `synthesis_transformation`
  - `short_writing_application`
- Per-option feedback for wrong and correct choices
- Short rules and memory tips in simple English
- Full-screen toggle with native + pseudo-fullscreen fallback (mobile/iPad safe)
- Top-right `Back to Projects` control

## Data Layout

- `data/manifest.json`
- `data/subskills/<subskill-id>/meta.json`
- `data/subskills/<subskill-id>/examples.json`
- `data/subskills/<subskill-id>/questions.<format>.json`

## Runtime API

Implemented in [`js/data-loader.js`](/Users/jingoh/dev/tools/psle_grammar_super_app/js/data-loader.js):

- `loadManifest(): Promise<Manifest>`
- `loadSubskillMeta(subskillId): Promise<SubskillMeta>`
- `loadExamples(subskillId): Promise<ExampleItem[]>`
- `loadQuestions(subskillId, format): Promise<QuestionItem[]>`

## Scripts

Build static content shards:

```bash
node ./scripts/build-content.js
```

Validate all content constraints:

```bash
node ./scripts/validate-content.js
```

## Notes

- Content is static JSON and lazy-loaded by subskill/format.
- No backend is required.
- Learner progress is stored in `localStorage`.
