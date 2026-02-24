#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_ROOT = path.join(ROOT, "data");
const MANIFEST_PATH = path.join(DATA_ROOT, "manifest.json");

const REQUIRED_FORMATS = [
  "multiple_choice_grammar",
  "grammar_cloze",
  "editing_spelling_grammar",
  "synthesis_transformation",
  "short_writing_application"
];

const LIMITS = {
  metaRule: 220,
  metaShortcut: 140,
  metaTip: 180,
  metaConfusion: 180,
  optionFeedback: 220,
  confusionNote: 280,
  memoryTip: 160,
  vocabHint: 120,
  microTip: 160
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nearKey(text) {
  return normalizeText(text)
    .replace(/\bcheckpoint\s+\d+\b/g, "checkpoint")
    .replace(/\bquestion\s+\d+\b/g, "question");
}

function assert(condition, message, errors) {
  if (!condition) {
    errors.push(message);
  }
}

function checkMaxLength(value, limit, fieldName, errors) {
  if (String(value || "").length > limit) {
    errors.push(`${fieldName} exceeds ${limit} characters`);
  }
}

function validateExamples(subskillId, examplesPayload, errors, warnings) {
  const items = Array.isArray(examplesPayload.items) ? examplesPayload.items : [];
  assert(items.length >= 200, `${subskillId}: examples < 200`, errors);

  const seen = new Set();
  const nearSeen = new Map();

  items.forEach((item, index) => {
    const prefix = `${subskillId} examples[${index}]`;

    assert(typeof item.id === "string" && item.id.length > 0, `${prefix}: missing id`, errors);
    assert(typeof item.sentence_html === "string" && item.sentence_html.length > 0, `${prefix}: missing sentence_html`, errors);
    assert(typeof item.focus === "string" && item.focus.length > 0, `${prefix}: missing focus`, errors);
    assert(typeof item.vocab === "string" && item.vocab.length > 0, `${prefix}: missing vocab`, errors);
    assert(typeof item.vocab_context_hint === "string" && item.vocab_context_hint.length > 0, `${prefix}: missing vocab_context_hint`, errors);
    assert(typeof item.micro_tip === "string" && item.micro_tip.length > 0, `${prefix}: missing micro_tip`, errors);

    checkMaxLength(item.vocab_context_hint, LIMITS.vocabHint, `${prefix}: vocab_context_hint`, errors);
    checkMaxLength(item.micro_tip, LIMITS.microTip, `${prefix}: micro_tip`, errors);

    assert(item.sentence_html.includes("<strong>"), `${prefix}: sentence_html missing <strong>`, errors);

    const normalized = normalizeText(item.sentence_html);
    if (seen.has(normalized)) {
      errors.push(`${prefix}: duplicate sentence detected`);
    }
    seen.add(normalized);

    const nKey = nearKey(item.sentence_html);
    nearSeen.set(nKey, (nearSeen.get(nKey) || 0) + 1);
  });

  let nearCount = 0;
  nearSeen.forEach((count) => {
    if (count > 1) {
      nearCount += count - 1;
    }
  });

  if (nearCount > 0) {
    warnings.push(`${subskillId}: ${nearCount} potential near-duplicate examples (manual review suggested)`);
  }
}

function validateQuestions(subskillId, format, questionsPayload, errors, warnings) {
  const items = Array.isArray(questionsPayload.items) ? questionsPayload.items : [];
  assert(items.length >= 200, `${subskillId}/${format}: questions < 200`, errors);

  const seen = new Set();
  const nearSeen = new Map();

  items.forEach((item, index) => {
    const prefix = `${subskillId}/${format}[${index}]`;

    assert(item.format === format, `${prefix}: format mismatch`, errors);
    assert(typeof item.id === "string" && item.id.length > 0, `${prefix}: missing id`, errors);
    assert(typeof item.stem_html === "string" && item.stem_html.length > 0, `${prefix}: missing stem_html`, errors);
    assert(typeof item.resolved_sentence_html === "string" && item.resolved_sentence_html.length > 0, `${prefix}: missing resolved_sentence_html`, errors);
    assert(typeof item.vocab === "string" && item.vocab.length > 0, `${prefix}: missing vocab`, errors);
    assert(typeof item.correct_confusion_note === "string" && item.correct_confusion_note.length > 0, `${prefix}: missing correct_confusion_note`, errors);
    assert(typeof item.memory_tip === "string" && item.memory_tip.length > 0, `${prefix}: missing memory_tip`, errors);

    checkMaxLength(item.correct_confusion_note, LIMITS.confusionNote, `${prefix}: correct_confusion_note`, errors);
    checkMaxLength(item.memory_tip, LIMITS.memoryTip, `${prefix}: memory_tip`, errors);

    assert(item.resolved_sentence_html.includes("<strong>"), `${prefix}: resolved sentence missing <strong>`, errors);

    assert(Array.isArray(item.options), `${prefix}: options missing`, errors);
    if (Array.isArray(item.options)) {
      assert(item.options.length === 4, `${prefix}: options length is not 4`, errors);
      const correctCount = item.options.filter((opt) => !!opt.is_correct).length;
      assert(correctCount === 1, `${prefix}: must have exactly one correct option`, errors);

      item.options.forEach((opt, optIndex) => {
        const optPrefix = `${prefix} option[${optIndex}]`;
        assert(typeof opt.id === "string" && opt.id.length > 0, `${optPrefix}: missing id`, errors);
        assert(typeof opt.text === "string" && opt.text.length > 0, `${optPrefix}: missing text`, errors);
        assert(typeof opt.feedback === "string" && opt.feedback.length > 0, `${optPrefix}: missing feedback`, errors);
        checkMaxLength(opt.feedback, LIMITS.optionFeedback, `${optPrefix}: feedback`, errors);
      });
    }

    const normalized = normalizeText(item.stem_html);
    if (seen.has(normalized)) {
      errors.push(`${prefix}: duplicate stem detected`);
    }
    seen.add(normalized);

    const nKey = nearKey(item.stem_html);
    nearSeen.set(nKey, (nearSeen.get(nKey) || 0) + 1);
  });

  let nearCount = 0;
  nearSeen.forEach((count) => {
    if (count > 1) {
      nearCount += count - 1;
    }
  });

  if (nearCount > 0) {
    warnings.push(`${subskillId}/${format}: ${nearCount} potential near-duplicate stems (manual review suggested)`);
  }
}

function validateMeta(subskillId, meta, errors) {
  assert(typeof meta.title === "string" && meta.title.length > 0, `${subskillId}: meta title missing`, errors);
  assert(typeof meta.short_rule === "string" && meta.short_rule.length > 0, `${subskillId}: meta short_rule missing`, errors);
  assert(typeof meta.shortcut === "string" && meta.shortcut.length > 0, `${subskillId}: meta shortcut missing`, errors);
  assert(typeof meta.tip === "string" && meta.tip.length > 0, `${subskillId}: meta tip missing`, errors);
  assert(typeof meta.common_confusion === "string" && meta.common_confusion.length > 0, `${subskillId}: meta common_confusion missing`, errors);

  checkMaxLength(meta.short_rule, LIMITS.metaRule, `${subskillId}: meta short_rule`, errors);
  checkMaxLength(meta.shortcut, LIMITS.metaShortcut, `${subskillId}: meta shortcut`, errors);
  checkMaxLength(meta.tip, LIMITS.metaTip, `${subskillId}: meta tip`, errors);
  checkMaxLength(meta.common_confusion, LIMITS.metaConfusion, `${subskillId}: meta common_confusion`, errors);
}

function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Manifest not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifest = readJson(MANIFEST_PATH);
  const errors = [];
  const warnings = [];

  assert(Array.isArray(manifest.practiceFormats), "manifest.practiceFormats missing", errors);
  REQUIRED_FORMATS.forEach((format) => {
    assert(manifest.practiceFormats.includes(format), `manifest missing format: ${format}`, errors);
  });

  const subskillIds = Object.keys(manifest.subskillsIndex || {});
  assert(subskillIds.length === 114, `expected 114 subskills, found ${subskillIds.length}`, errors);

  let exampleCount = 0;
  let questionCount = 0;

  subskillIds.forEach((subskillId) => {
    const entry = manifest.subskillsIndex[subskillId];
    const metaPath = path.join(ROOT, entry.paths.meta.replace(/^\.\//, ""));
    const examplesPath = path.join(ROOT, entry.paths.examples.replace(/^\.\//, ""));

    const meta = readJson(metaPath);
    const examples = readJson(examplesPath);

    validateMeta(subskillId, meta, errors);
    validateExamples(subskillId, examples, errors, warnings);
    exampleCount += Array.isArray(examples.items) ? examples.items.length : 0;

    REQUIRED_FORMATS.forEach((format) => {
      const qPath = path.join(ROOT, entry.paths.questions[format].replace(/^\.\//, ""));
      const qPayload = readJson(qPath);
      validateQuestions(subskillId, format, qPayload, errors, warnings);
      questionCount += Array.isArray(qPayload.items) ? qPayload.items.length : 0;
    });
  });

  console.log(`Validated subskills: ${subskillIds.length}`);
  console.log(`Validated examples: ${exampleCount}`);
  console.log(`Validated questions: ${questionCount}`);

  if (warnings.length) {
    console.log(`Warnings: ${warnings.length}`);
    warnings.slice(0, 20).forEach((item) => {
      console.log(`- ${item}`);
    });
    if (warnings.length > 20) {
      console.log(`- ... ${warnings.length - 20} more warnings omitted`);
    }
  }

  if (errors.length) {
    console.error(`Validation failed with ${errors.length} issue(s):`);
    errors.slice(0, 40).forEach((item) => {
      console.error(`- ${item}`);
    });
    if (errors.length > 40) {
      console.error(`- ... ${errors.length - 40} more errors omitted`);
    }
    process.exit(1);
  }

  console.log("Validation passed.");
}

main();
