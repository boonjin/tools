"use strict";

const FORMAT_LABELS = {
  multiple_choice_grammar: "Multiple Choice Grammar",
  grammar_cloze: "Grammar Cloze",
  editing_spelling_grammar: "Editing, Spelling, Grammar",
  synthesis_transformation: "Synthesis Transformation",
  short_writing_application: "Short Writing Application"
};

function createFormatButton(format, activeFormat, onSelect) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `format-tab${format === activeFormat ? " active" : ""}`;
  button.textContent = FORMAT_LABELS[format] || format;
  button.addEventListener("click", () => onSelect(format));
  return button;
}

function createOptionButton(option, selectedOptionId, checked, onSelect) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "option-btn";
  button.dataset.optionId = option.id;

  if (option.id === selectedOptionId) {
    button.classList.add("selected");
  }

  if (checked) {
    if (option.is_correct) {
      button.classList.add("correct");
    } else if (option.id === selectedOptionId) {
      button.classList.add("wrong");
    }
  }

  const badge = document.createElement("span");
  badge.className = "option-id";
  badge.textContent = option.id;

  const text = document.createElement("span");
  text.textContent = option.text;

  button.appendChild(badge);
  button.appendChild(text);
  button.addEventListener("click", () => onSelect(option.id));
  return button;
}

export function renderPracticePanel(elements, params) {
  const {
    formats,
    activeFormat,
    question,
    questionIndex,
    questionTotal,
    selectedOptionId,
    checked,
    feedback,
    onFormatSelect,
    onOptionSelect
  } = params;

  elements.formatTabs.innerHTML = "";
  formats.forEach((format) => {
    elements.formatTabs.appendChild(createFormatButton(format, activeFormat, onFormatSelect));
  });

  if (!question) {
    elements.questionIndexLabel.textContent = "Question -";
    elements.questionStem.textContent = "No question loaded.";
    elements.optionList.innerHTML = "";
    elements.feedbackBox.hidden = true;
    elements.resolvedBox.hidden = true;
    return;
  }

  elements.questionIndexLabel.textContent = `Question ${questionIndex + 1} of ${questionTotal}`;
  elements.questionStem.innerHTML = question.stem_html;

  elements.optionList.innerHTML = "";
  question.options.forEach((option) => {
    elements.optionList.appendChild(
      createOptionButton(option, selectedOptionId, checked, onOptionSelect)
    );
  });

  if (!checked || !feedback) {
    elements.feedbackBox.hidden = true;
    elements.resolvedBox.hidden = true;
    return;
  }

  elements.feedbackBox.hidden = false;
  elements.selectedFeedback.textContent = feedback.selectedFeedback;
  elements.correctFeedback.textContent = feedback.correctFeedback;
  elements.confusionFeedback.textContent = feedback.confusionFeedback;

  elements.resolvedBox.hidden = false;
  elements.resolvedSentence.innerHTML = question.resolved_sentence_html;
  elements.memoryTip.textContent = `Memory tip: ${question.memory_tip}`;
}

export function formatLabel(format) {
  return FORMAT_LABELS[format] || format;
}
