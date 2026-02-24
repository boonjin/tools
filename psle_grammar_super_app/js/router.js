"use strict";

function byId(list, id) {
  return list.find((item) => item.id === id);
}

function makeOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function setSelectOptions(select, items) {
  select.innerHTML = "";
  items.forEach((item) => {
    select.appendChild(makeOption(item.value, item.label));
  });
}

function getModule(manifest, moduleId) {
  return byId(manifest.modules, moduleId);
}

function getTopic(moduleRecord, topicId) {
  if (!moduleRecord) {
    return null;
  }
  return byId(moduleRecord.topics, topicId);
}

function normalizeSelection(manifest, rawSelection) {
  const firstModule = manifest.modules[0];
  const moduleRecord = getModule(manifest, rawSelection.moduleId) || firstModule;
  const firstTopic = moduleRecord.topics[0];
  const topicRecord = getTopic(moduleRecord, rawSelection.topicId) || firstTopic;
  const firstSubskill = topicRecord.subskills[0];
  const subskillRecord = byId(topicRecord.subskills, rawSelection.subskillId) || firstSubskill;

  return {
    moduleId: moduleRecord.id,
    topicId: topicRecord.id,
    subskillId: subskillRecord.id
  };
}

function buildModuleOptions(manifest) {
  return manifest.modules.map((moduleRecord) => ({
    value: moduleRecord.id,
    label: moduleRecord.title
  }));
}

function buildTopicOptions(moduleRecord) {
  return moduleRecord.topics.map((topicRecord) => ({
    value: topicRecord.id,
    label: topicRecord.title
  }));
}

function buildSubskillOptions(topicRecord) {
  return topicRecord.subskills.map((subskillRecord) => ({
    value: subskillRecord.id,
    label: subskillRecord.title
  }));
}

export function createRouter(manifest, elements, initialSelection, onSelectionChange) {
  let selection = normalizeSelection(manifest, initialSelection || {});

  function renderSelectors() {
    const moduleRecord = getModule(manifest, selection.moduleId);
    const topicRecord = getTopic(moduleRecord, selection.topicId);

    setSelectOptions(elements.moduleSelect, buildModuleOptions(manifest));
    setSelectOptions(elements.topicSelect, buildTopicOptions(moduleRecord));
    setSelectOptions(elements.subskillSelect, buildSubskillOptions(topicRecord));

    elements.moduleSelect.value = selection.moduleId;
    elements.topicSelect.value = selection.topicId;
    elements.subskillSelect.value = selection.subskillId;
  }

  function emitChange() {
    if (typeof onSelectionChange === "function") {
      onSelectionChange({ ...selection });
    }
  }

  function setSelection(nextSelection, emit) {
    selection = normalizeSelection(manifest, nextSelection || selection);
    renderSelectors();
    if (emit) {
      emitChange();
    }
  }

  elements.moduleSelect.addEventListener("change", () => {
    const nextModule = getModule(manifest, elements.moduleSelect.value);
    const nextTopic = nextModule.topics[0];
    const nextSubskill = nextTopic.subskills[0];
    setSelection(
      {
        moduleId: nextModule.id,
        topicId: nextTopic.id,
        subskillId: nextSubskill.id
      },
      true
    );
  });

  elements.topicSelect.addEventListener("change", () => {
    const moduleRecord = getModule(manifest, selection.moduleId);
    const nextTopic = getTopic(moduleRecord, elements.topicSelect.value);
    const nextSubskill = nextTopic.subskills[0];
    setSelection(
      {
        moduleId: selection.moduleId,
        topicId: nextTopic.id,
        subskillId: nextSubskill.id
      },
      true
    );
  });

  elements.subskillSelect.addEventListener("change", () => {
    setSelection(
      {
        moduleId: selection.moduleId,
        topicId: selection.topicId,
        subskillId: elements.subskillSelect.value
      },
      true
    );
  });

  renderSelectors();

  return {
    getSelection() {
      return { ...selection };
    },
    setSelection
  };
}
