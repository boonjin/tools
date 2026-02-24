"use strict";

const STORAGE_KEY = "psle_grammar_super_app.v1.state";

export function createState() {
  return {
    manifest: null,
    selection: {
      moduleId: "",
      topicId: "",
      subskillId: ""
    },
    meta: null,
    examples: [],
    examplePage: 0,
    pageSize: 8,
    practiceFormat: "multiple_choice_grammar",
    questions: [],
    questionIndex: 0,
    selectedOptionId: "",
    checked: false,
    feedback: null,
    progress: {}
  };
}

export function hydrateState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

export function persistState(state) {
  const payload = {
    selection: state.selection,
    practiceFormat: state.practiceFormat,
    progress: state.progress
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    return;
  }
}

export function applyPersistedState(state, persisted) {
  if (!persisted || typeof persisted !== "object") {
    return;
  }

  if (persisted.selection && typeof persisted.selection === "object") {
    state.selection = {
      moduleId: String(persisted.selection.moduleId || ""),
      topicId: String(persisted.selection.topicId || ""),
      subskillId: String(persisted.selection.subskillId || "")
    };
  }

  if (typeof persisted.practiceFormat === "string") {
    state.practiceFormat = persisted.practiceFormat;
  }

  if (persisted.progress && typeof persisted.progress === "object") {
    state.progress = persisted.progress;
  }
}

export function resetQuestionState(state) {
  state.questionIndex = 0;
  state.selectedOptionId = "";
  state.checked = false;
  state.feedback = null;
}

export function setQuestionIndex(state, nextIndex) {
  if (!Array.isArray(state.questions) || !state.questions.length) {
    state.questionIndex = 0;
    return;
  }
  const total = state.questions.length;
  let index = Number(nextIndex) || 0;
  if (index < 0) {
    index = total - 1;
  }
  state.questionIndex = index % total;
}

export function recordResult(state, isCorrect) {
  const subskillId = state.selection.subskillId;
  const format = state.practiceFormat;

  if (!subskillId) {
    return;
  }

  if (!state.progress[subskillId]) {
    state.progress[subskillId] = {
      attempted: 0,
      correct: 0,
      byFormat: {}
    };
  }

  const bucket = state.progress[subskillId];
  bucket.attempted += 1;
  if (isCorrect) {
    bucket.correct += 1;
  }

  if (!bucket.byFormat[format]) {
    bucket.byFormat[format] = {
      attempted: 0,
      correct: 0
    };
  }

  bucket.byFormat[format].attempted += 1;
  if (isCorrect) {
    bucket.byFormat[format].correct += 1;
  }
}

export function getOverallProgressPercent(state) {
  const ids = Object.keys(state.progress || {});
  if (!ids.length) {
    return 0;
  }

  let attempted = 0;
  let correct = 0;

  ids.forEach((id) => {
    attempted += Number(state.progress[id].attempted || 0);
    correct += Number(state.progress[id].correct || 0);
  });

  if (!attempted) {
    return 0;
  }

  return Math.round((correct / attempted) * 100);
}
