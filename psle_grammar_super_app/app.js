"use strict";

import { createState, hydrateState, applyPersistedState, persistState, resetQuestionState, setQuestionIndex, recordResult, getOverallProgressPercent } from "./js/state.js";
import { loadManifest, loadSubskillMeta, loadExamples, loadQuestions } from "./js/data-loader.js";
import { createRouter } from "./js/router.js";
import { renderRulePanel, renderExamplesPanel } from "./js/render-learn.js";
import { renderPracticePanel, formatLabel } from "./js/render-practice.js";
import { evaluateSelection } from "./js/feedback-engine.js";
import { initFullscreenToggle } from "./js/fullscreen.js";

const PRACTICE_FORMATS = [
  "multiple_choice_grammar",
  "grammar_cloze",
  "editing_spelling_grammar",
  "synthesis_transformation",
  "short_writing_application"
];

const state = createState();

const dom = {
  appShell: document.getElementById("appShell"),
  fullscreenToggle: document.getElementById("fullscreenToggle"),
  moduleSelect: document.getElementById("moduleSelect"),
  topicSelect: document.getElementById("topicSelect"),
  subskillSelect: document.getElementById("subskillSelect"),
  coverageChip: document.getElementById("coverageChip"),
  exampleCountChip: document.getElementById("exampleCountChip"),
  questionCountChip: document.getElementById("questionCountChip"),
  progressChip: document.getElementById("progressChip"),
  appStatus: document.getElementById("appStatus"),
  footerStatus: document.getElementById("footerStatus"),
  subskillTitle: document.getElementById("subskillTitle"),
  ruleText: document.getElementById("ruleText"),
  shortcutText: document.getElementById("shortcutText"),
  tipText: document.getElementById("tipText"),
  confusionText: document.getElementById("confusionText"),
  examplesPrevBtn: document.getElementById("examplesPrevBtn"),
  examplesNextBtn: document.getElementById("examplesNextBtn"),
  examplesPageLabel: document.getElementById("examplesPageLabel"),
  exampleList: document.getElementById("exampleList"),
  formatTabs: document.getElementById("formatTabs"),
  questionIndexLabel: document.getElementById("questionIndexLabel"),
  questionStem: document.getElementById("questionStem"),
  optionList: document.getElementById("optionList"),
  checkAnswerBtn: document.getElementById("checkAnswerBtn"),
  nextQuestionBtn: document.getElementById("nextQuestionBtn"),
  feedbackBox: document.getElementById("feedbackBox"),
  selectedFeedback: document.getElementById("selectedFeedback"),
  correctFeedback: document.getElementById("correctFeedback"),
  confusionFeedback: document.getElementById("confusionFeedback"),
  resolvedBox: document.getElementById("resolvedBox"),
  resolvedSentence: document.getElementById("resolvedSentence"),
  memoryTip: document.getElementById("memoryTip")
};

let router = null;

function setStatus(message) {
  dom.appStatus.textContent = message;
  dom.footerStatus.textContent = message;
}

function getModuleTopicTitles(selection) {
  if (!state.manifest) {
    return { moduleTitle: "-", topicTitle: "-" };
  }
  const moduleRecord = state.manifest.modules.find((moduleItem) => moduleItem.id === selection.moduleId);
  const topicRecord = moduleRecord
    ? moduleRecord.topics.find((topicItem) => topicItem.id === selection.topicId)
    : null;

  return {
    moduleTitle: moduleRecord ? moduleRecord.title : "-",
    topicTitle: topicRecord ? topicRecord.title : "-"
  };
}

function updateChips() {
  const titles = getModuleTopicTitles(state.selection);
  const progressPercent = getOverallProgressPercent(state);

  dom.coverageChip.textContent = `Coverage: ${titles.moduleTitle} / ${titles.topicTitle}`;
  dom.exampleCountChip.textContent = `Examples: ${state.examples.length}`;
  dom.questionCountChip.textContent = `Questions (${formatLabel(state.practiceFormat)}): ${state.questions.length}`;
  dom.progressChip.textContent = `Progress: ${progressPercent}%`;
}

function renderExamples() {
  const info = renderExamplesPanel(dom, state.examples, state.examplePage, state.pageSize);
  state.examplePage = info.page;
}

function renderPractice() {
  const question = state.questions[state.questionIndex] || null;

  renderPracticePanel(dom, {
    formats: PRACTICE_FORMATS,
    activeFormat: state.practiceFormat,
    question,
    questionIndex: state.questionIndex,
    questionTotal: state.questions.length,
    selectedOptionId: state.selectedOptionId,
    checked: state.checked,
    feedback: state.feedback,
    onFormatSelect: async (format) => {
      if (state.practiceFormat === format) {
        return;
      }
      state.practiceFormat = format;
      await loadQuestionSet(true);
      persistState(state);
    },
    onOptionSelect: (optionId) => {
      state.selectedOptionId = optionId;
      if (state.checked) {
        state.checked = false;
        state.feedback = null;
      }
      renderPractice();
    }
  });
}

function renderAll() {
  renderRulePanel(dom, state.meta);
  renderExamples();
  renderPractice();
  updateChips();
}

async function loadQuestionSet(reset) {
  const subskillId = state.selection.subskillId;
  setStatus(`Loading ${formatLabel(state.practiceFormat)} questions...`);
  state.questions = await loadQuestions(subskillId, state.practiceFormat);

  if (reset) {
    resetQuestionState(state);
  } else {
    setQuestionIndex(state, state.questionIndex);
    state.selectedOptionId = "";
    state.checked = false;
    state.feedback = null;
  }

  updateChips();
  renderPractice();
  setStatus("Questions ready.");
}

async function loadSubskill(subskillId) {
  setStatus("Loading subskill content...");

  const [meta, examples, questions] = await Promise.all([
    loadSubskillMeta(subskillId),
    loadExamples(subskillId),
    loadQuestions(subskillId, state.practiceFormat)
  ]);

  state.meta = meta;
  state.examples = examples;
  state.examplePage = 0;
  state.questions = questions;
  resetQuestionState(state);

  renderAll();
  setStatus("Subskill ready.");
}

function handleCheckAnswer() {
  const question = state.questions[state.questionIndex];
  if (!question) {
    setStatus("No question loaded.");
    return;
  }

  if (!state.selectedOptionId) {
    setStatus("Select one option before checking.");
    return;
  }

  state.feedback = evaluateSelection(question, state.selectedOptionId);
  state.checked = true;
  recordResult(state, state.feedback.isCorrect);
  persistState(state);
  updateChips();
  renderPractice();

  const statusWord = state.feedback.isCorrect ? "Correct" : "Try again";
  setStatus(`${statusWord}: feedback updated.`);
}

function handleNextQuestion() {
  if (!state.questions.length) {
    return;
  }
  setQuestionIndex(state, state.questionIndex + 1);
  state.selectedOptionId = "";
  state.checked = false;
  state.feedback = null;
  renderPractice();
}

function bindCoreEvents() {
  dom.examplesPrevBtn.addEventListener("click", () => {
    state.examplePage -= 1;
    renderExamples();
  });

  dom.examplesNextBtn.addEventListener("click", () => {
    state.examplePage += 1;
    renderExamples();
  });

  dom.checkAnswerBtn.addEventListener("click", handleCheckAnswer);
  dom.nextQuestionBtn.addEventListener("click", handleNextQuestion);
}

async function init() {
  initFullscreenToggle(dom.appShell, dom.fullscreenToggle);
  bindCoreEvents();

  const persisted = hydrateState();
  applyPersistedState(state, persisted);

  const manifest = await loadManifest();
  state.manifest = manifest;

  if (!PRACTICE_FORMATS.includes(state.practiceFormat)) {
    state.practiceFormat = PRACTICE_FORMATS[0];
  }

  router = createRouter(
    manifest,
    {
      moduleSelect: dom.moduleSelect,
      topicSelect: dom.topicSelect,
      subskillSelect: dom.subskillSelect
    },
    state.selection,
    async (selection) => {
      state.selection = { ...selection };
      persistState(state);
      await loadSubskill(selection.subskillId);
    }
  );

  state.selection = router.getSelection();
  persistState(state);
  await loadSubskill(state.selection.subskillId);
}

init().catch((error) => {
  setStatus(`Error: ${error.message}`);
});
