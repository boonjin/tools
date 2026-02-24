"use strict";

let manifestCache = null;
let manifestPromise = null;

const jsonCache = new Map();

async function fetchJson(path) {
  if (jsonCache.has(path)) {
    return jsonCache.get(path);
  }

  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  const payload = await response.json();
  jsonCache.set(path, payload);
  return payload;
}

function requireManifest() {
  if (!manifestCache) {
    throw new Error("Manifest not loaded. Call loadManifest() first.");
  }
  return manifestCache;
}

function getSubskillEntry(subskillId) {
  const manifest = requireManifest();
  const entry = manifest.subskillsIndex[subskillId];
  if (!entry) {
    throw new Error(`Unknown subskill: ${subskillId}`);
  }
  return entry;
}

function toItems(payload) {
  if (payload && Array.isArray(payload.items)) {
    return payload.items;
  }
  return Array.isArray(payload) ? payload : [];
}

export async function loadManifest() {
  if (manifestCache) {
    return manifestCache;
  }

  if (manifestPromise) {
    return manifestPromise;
  }

  manifestPromise = fetchJson("./data/manifest.json").then((manifest) => {
    manifestCache = manifest;
    return manifest;
  });

  return manifestPromise;
}

export async function loadSubskillMeta(subskillId) {
  if (!manifestCache) {
    await loadManifest();
  }
  const entry = getSubskillEntry(subskillId);
  return fetchJson(entry.paths.meta);
}

export async function loadExamples(subskillId) {
  if (!manifestCache) {
    await loadManifest();
  }
  const entry = getSubskillEntry(subskillId);
  const payload = await fetchJson(entry.paths.examples);
  return toItems(payload);
}

export async function loadQuestions(subskillId, format) {
  if (!manifestCache) {
    await loadManifest();
  }
  const entry = getSubskillEntry(subskillId);
  if (!entry.paths.questions || !entry.paths.questions[format]) {
    throw new Error(`Unknown format "${format}" for subskill ${subskillId}`);
  }
  const payload = await fetchJson(entry.paths.questions[format]);
  return toItems(payload);
}
