"use strict";

function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

export function renderRulePanel(elements, meta) {
  if (!meta) {
    elements.subskillTitle.textContent = "-";
    elements.ruleText.textContent = "-";
    elements.shortcutText.textContent = "-";
    elements.tipText.textContent = "-";
    elements.confusionText.textContent = "-";
    return;
  }

  elements.subskillTitle.textContent = meta.title;
  elements.ruleText.textContent = meta.short_rule;
  elements.shortcutText.textContent = meta.shortcut;
  elements.tipText.textContent = meta.tip;
  elements.confusionText.textContent = meta.common_confusion;
}

export function renderExamplesPanel(elements, examples, page, pageSize) {
  const total = Array.isArray(examples) ? examples.length : 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = clamp(page, 0, pageCount - 1);

  const start = safePage * pageSize;
  const end = Math.min(start + pageSize, total);

  elements.exampleList.innerHTML = "";

  if (!total) {
    const empty = document.createElement("p");
    empty.textContent = "No examples found.";
    elements.exampleList.appendChild(empty);
  } else {
    for (let i = start; i < end; i += 1) {
      const item = examples[i];
      const card = document.createElement("article");
      card.className = "example-item";

      const sentence = document.createElement("p");
      sentence.innerHTML = item.sentence_html;

      const vocab = document.createElement("p");
      vocab.className = "vocab-line";
      vocab.textContent = `${item.vocab_context_hint} ${item.micro_tip}`;

      card.appendChild(sentence);
      card.appendChild(vocab);
      elements.exampleList.appendChild(card);
    }
  }

  elements.examplesPageLabel.textContent = `Page ${safePage + 1} of ${pageCount}`;

  return {
    page: safePage,
    pageCount,
    total
  };
}
