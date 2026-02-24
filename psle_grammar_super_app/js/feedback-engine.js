"use strict";

export function evaluateSelection(question, selectedOptionId) {
  if (!question || !Array.isArray(question.options)) {
    return {
      isCorrect: false,
      selectedFeedback: "No question available.",
      correctFeedback: "",
      confusionFeedback: ""
    };
  }

  const selected = question.options.find((option) => option.id === selectedOptionId);
  const correct = question.options.find((option) => option.is_correct);

  if (!selected) {
    return {
      isCorrect: false,
      selectedFeedback: "Select one option first.",
      correctFeedback: "",
      confusionFeedback: ""
    };
  }

  const isCorrect = !!selected.is_correct;

  const selectedPrefix = isCorrect ? "Correct choice." : "Wrong choice.";
  const selectedFeedback = `${selectedPrefix} ${selected.feedback}`;

  const correctFeedback = correct
    ? `Correct answer (${correct.id}): ${correct.text}. ${correct.feedback}`
    : "Correct answer not found in data.";

  const confusionFeedback = question.correct_confusion_note
    ? `Why this can confuse you: ${question.correct_confusion_note}`
    : "";

  return {
    isCorrect,
    selectedFeedback,
    correctFeedback,
    confusionFeedback
  };
}
