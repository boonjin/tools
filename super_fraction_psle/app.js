(function () {
  "use strict";

  var STORAGE_KEYS = {
    mastery: "super_fraction_psle_v1_mastery",
    session: "super_fraction_psle_v1_session",
    settings: "super_fraction_psle_v1_settings"
  };

  var STRANDS = [
    { id: "s1", label: "Strand 1: Meaning, Forms, Number Line", short: "Meaning & Forms" },
    { id: "s2", label: "Strand 2: Compare and Order", short: "Compare & Order" },
    { id: "s3", label: "Strand 3: Add and Subtract", short: "Add & Subtract" },
    { id: "s4", label: "Strand 4: Multiply and Divide", short: "Multiply & Divide" },
    { id: "s5", label: "Strand 5: Fraction of Quantity and Whole", short: "Fraction of Quantity" },
    { id: "s6", label: "Strand 6: Mixed Context PSLE Problems", short: "Mixed Context" },
    { id: "s7", label: "Strand 7: Fraction Algebra", short: "Fraction Algebra" },
    { id: "s8", label: "Strand 8: Exam Strategy and Diagnostics", short: "Exam Strategy" }
  ];

  var STRAND_MAP = {};
  STRANDS.forEach(function (strand) {
    STRAND_MAP[strand.id] = strand;
  });

  var SUBTYPE_META = {
    s1_forms: { strand: "s1", label: "Proper / Improper / Mixed Conversion", tags: ["conversion", "representation"] },
    s1_equivalent: { strand: "s1", label: "Equivalent Fractions and Simplification", tags: ["equivalent", "simplify"] },
    s1_numberline: { strand: "s1", label: "Number Line Positioning", tags: ["number-line", "benchmark"] },

    s2_compare: { strand: "s2", label: "Compare Fractions", tags: ["compare", "cross-product"] },
    s2_order: { strand: "s2", label: "Order Fractions", tags: ["order", "benchmark"] },

    s3_add_unlike: { strand: "s3", label: "Add Unlike Fractions", tags: ["add", "common-denominator"] },
    s3_subtract_mixed: { strand: "s3", label: "Subtract Mixed Numbers", tags: ["subtract", "borrowing"] },

    s4_multiply: { strand: "s4", label: "Multiply Fractions", tags: ["multiply", "cross-cancel"] },
    s4_divide: { strand: "s4", label: "Divide Fractions", tags: ["divide", "reciprocal"] },

    s5_fraction_of_quantity: { strand: "s5", label: "Find Fraction of Quantity", tags: ["quantity", "unitary"] },
    s5_whole_from_part: { strand: "s5", label: "Find Whole from Fractional Part", tags: ["whole", "equation"] },

    s6_before_after: { strand: "s6", label: "Before / After Fraction Change", tags: ["context", "before-after"] },
    s6_remainder: { strand: "s6", label: "Remainder / Used / Left", tags: ["context", "remainder"] },
    s6_sequential: { strand: "s6", label: "Sequential Fraction Changes", tags: ["context", "sequential"] },
    s6_same_total: { strand: "s6", label: "Same Total Different Shares", tags: ["context", "share-compare"] },
    s6_word_algebra: { strand: "s6", label: "Word Problem with Unknown", tags: ["context", "unknown"] },

    s7_alg_inverse: { strand: "s7", label: "x/a + b/c = d/e", tags: ["algebra", "inverse"] },
    s7_alg_bracket: { strand: "s7", label: "(x + p)/a = q", tags: ["algebra", "bracket"] },
    s7_alg_coefficient: { strand: "s7", label: "(m/n)x = p/q", tags: ["algebra", "coefficient"] },
    s7_alg_plusminus: { strand: "s7", label: "x +/- a/b = c/d", tags: ["algebra", "plus-minus"] },
    s7_alg_twostep: { strand: "s7", label: "Two-step Bracket Algebra", tags: ["algebra", "two-step"] },

    s8_estimation: { strand: "s8", label: "Estimation Bounds", tags: ["strategy", "estimate"] },
    s8_inverse_check: { strand: "s8", label: "Inverse-Check Strategy", tags: ["strategy", "inverse-check"] },
    s8_simplify_enforce: { strand: "s8", label: "Simplification Enforcement", tags: ["strategy", "simplify"] },
    s8_misconception: { strand: "s8", label: "Misconception Detection", tags: ["strategy", "misconception"] }
  };

  var SUBTYPE_IDS = Object.keys(SUBTYPE_META);

  var DIAGNOSTIC_BLUEPRINT = [
    "s1_forms",
    "s1_equivalent",
    "s2_compare",
    "s2_order",
    "s3_add_unlike",
    "s3_subtract_mixed",
    "s4_multiply",
    "s4_divide",
    "s5_fraction_of_quantity",
    "s6_remainder",
    "s7_alg_inverse",
    "s8_estimation"
  ];

  var state = {
    atlas: {
      subtypeId: null,
      question: null
    },
    guided: {
      inDiagnostic: false,
      queueIds: [],
      index: 0,
      current: null,
      graded: false,
      selectedChoice: null,
      hintLevel: 0,
      journeyOrder: STRANDS.map(function (s) { return s.id; }),
      milestoneIndex: 0
    },
    operations: {
      methodMode: "A"
    },
    algebra: {
      current: null,
      graded: false,
      hintLevel: 0,
      revealSteps: 0
    },
    practice: {
      current: null,
      graded: false,
      selectedChoice: null,
      hintLevel: 0
    },
    exam: {
      active: false,
      mode: "A",
      questions: [],
      index: 0,
      correct: 0,
      timeLeft: 0,
      timerRef: null,
      selectedChoice: null,
      lock: false,
      results: []
    },
    fixPack: [],
    capsuleCursor: {
      guided: { subtypeId: null, index: 0 },
      atlas: { subtypeId: null, index: 0 },
      practice: { subtypeId: null, index: 0 }
    }
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function clampInt(value, min, max, fallback) {
    var num = parseInt(value, 10);
    if (isNaN(num)) {
      return fallback;
    }
    if (num < min) {
      return min;
    }
    if (num > max) {
      return max;
    }
    return num;
  }

  function safeSetText(id, text) {
    var el = byId(id);
    if (el) {
      el.textContent = text;
    }
  }

  function listToHtml(items) {
    if (!items || !items.length) {
      return "<li>-</li>";
    }
    return items.map(function (item) {
      return "<li>" + item + "</li>";
    }).join("");
  }

  function setList(id, items) {
    var el = byId(id);
    if (el) {
      el.innerHTML = listToHtml(items || []);
    }
  }

  function gcd(a, b) {
    var x = Math.abs(a);
    var y = Math.abs(b);
    while (y) {
      var t = x % y;
      x = y;
      y = t;
    }
    return x || 1;
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function frac(n, d) {
    if (d === 0) {
      return { n: 0, d: 1 };
    }
    var nn = n;
    var dd = d;
    if (dd < 0) {
      nn = -nn;
      dd = -dd;
    }
    if (nn === 0) {
      return { n: 0, d: 1 };
    }
    var g = gcd(nn, dd);
    return { n: nn / g, d: dd / g };
  }

  function addFrac(a, b) {
    return frac(a.n * b.d + b.n * a.d, a.d * b.d);
  }

  function subFrac(a, b) {
    return frac(a.n * b.d - b.n * a.d, a.d * b.d);
  }

  function mulFrac(a, b) {
    return frac(a.n * b.n, a.d * b.d);
  }

  function divFrac(a, b) {
    if (b.n === 0) {
      return { n: 0, d: 1 };
    }
    return frac(a.n * b.d, a.d * b.n);
  }

  function cmpFrac(a, b) {
    var diff = a.n * b.d - b.n * a.d;
    if (diff > 0) {
      return 1;
    }
    if (diff < 0) {
      return -1;
    }
    return 0;
  }

  function equalFrac(a, b) {
    return a.n === b.n && a.d === b.d;
  }

  function fractionValue(f) {
    return f.n / f.d;
  }

  function formatFrac(f, preferMixed) {
    if (!f || typeof f.n !== "number" || typeof f.d !== "number") {
      return "-";
    }

    var n = f.n;
    var d = f.d;
    if (d === 1) {
      return String(n);
    }

    var sign = n < 0 ? "-" : "";
    var absN = Math.abs(n);

    if (preferMixed && absN > d) {
      var whole = Math.floor(absN / d);
      var rem = absN % d;
      if (rem === 0) {
        return sign + whole;
      }
      return sign + whole + " " + rem + "/" + d;
    }

    return sign + absN + "/" + d;
  }

  function asPercent(value) {
    return Math.round(value * 100);
  }

  function parseAnswer(raw) {
    if (!raw) {
      return null;
    }

    var input = String(raw).replace(/,/g, "").trim();
    if (!input) {
      return null;
    }

    var mixed = input.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
    if (!mixed) {
      mixed = input.match(/^(-?\d+)_(\d+)\/(\d+)$/);
    }
    if (mixed) {
      var whole = parseInt(mixed[1], 10);
      var numer = parseInt(mixed[2], 10);
      var denom = parseInt(mixed[3], 10);
      if (denom === 0) {
        return null;
      }
      var sign = whole < 0 ? -1 : 1;
      var absWhole = Math.abs(whole);
      return {
        fraction: frac(sign * (absWhole * denom + numer), denom),
        source: "mixed",
        isSimplestInput: gcd(numer, denom) === 1,
        raw: input
      };
    }

    var fr = input.match(/^(-?\d+)\/(\-?\d+)$/);
    if (fr) {
      var n = parseInt(fr[1], 10);
      var d = parseInt(fr[2], 10);
      if (d === 0) {
        return null;
      }
      return {
        fraction: frac(n, d),
        source: "fraction",
        isSimplestInput: gcd(n, d) === 1,
        raw: input
      };
    }

    if (/^-?\d+\.\d+$/.test(input)) {
      var sign2 = input.indexOf("-") === 0 ? -1 : 1;
      var clean = input.replace("-", "");
      var parts = clean.split(".");
      var wholePart = parseInt(parts[0], 10);
      var decimals = parts[1];
      var denom2 = Math.pow(10, decimals.length);
      var numer2 = wholePart * denom2 + parseInt(decimals, 10);
      return {
        fraction: frac(sign2 * numer2, denom2),
        source: "decimal",
        isSimplestInput: true,
        raw: input
      };
    }

    if (/^-?\d+$/.test(input)) {
      return {
        fraction: frac(parseInt(input, 10), 1),
        source: "integer",
        isSimplestInput: true,
        raw: input
      };
    }

    return null;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[randInt(0, arr.length - 1)];
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i -= 1) {
      var j = randInt(0, i);
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function unique(arr) {
    var seen = {};
    return arr.filter(function (item) {
      if (seen[item]) {
        return false;
      }
      seen[item] = true;
      return true;
    });
  }

  function settingsForDifficulty(level) {
    var l = parseInt(level, 10) || 2;
    if (l <= 1) {
      return { maxDen: 8, maxWhole: 4, level: 1 };
    }
    if (l === 2) {
      return { maxDen: 12, maxWhole: 6, level: 2 };
    }
    return { maxDen: 16, maxWhole: 9, level: 3 };
  }

  function makeProper(maxDen) {
    var d = randInt(2, maxDen);
    var n = randInt(1, d - 1);
    return frac(n, d);
  }

  function makeImproper(maxDen) {
    var d = randInt(2, maxDen);
    var n = randInt(d + 1, d * 2 + randInt(1, d));
    return frac(n, d);
  }

  function makeMixed(maxDen, maxWhole) {
    var whole = randInt(1, maxWhole);
    var proper = makeProper(maxDen);
    return {
      whole: whole,
      proper: proper,
      fraction: addFrac(frac(whole, 1), proper)
    };
  }

  function subtypeIdsForStrand(strandId) {
    return SUBTYPE_IDS.filter(function (id) {
      return SUBTYPE_META[id].strand === strandId;
    });
  }

  function buildHints(question) {
    var hints = [];
    if (question.methodsA && question.methodsA[0]) {
      hints.push(question.methodsA[0]);
    }
    if (question.methodsB && question.methodsB[0]) {
      hints.push(question.methodsB[0]);
    }
    if (question.methodsC && question.methodsC[0]) {
      hints.push(question.methodsC[0]);
    }
    while (hints.length < 3) {
      hints.push("Use denominator structure first, then simplify your final answer.");
    }
    return hints.slice(0, 3);
  }

  function makeQuestion(subtypeId, difficulty, payload) {
    var meta = SUBTYPE_META[subtypeId];
    var question = {
      id: subtypeId + "-" + Date.now() + "-" + randInt(1000, 9999),
      strand: meta.strand,
      subtype: subtypeId,
      difficulty: difficulty || 2,
      prompt: "",
      answer: frac(0, 1),
      answerMode: "fraction_simplest",
      choices: [],
      methodsA: [],
      methodsB: [],
      methodsC: [],
      shortcut: "-",
      pitfall: "-",
      whyItWorks: "-",
      checks: "-",
      tags: (meta.tags || []).slice(),
      hints: [],
      preferMixed: false,
      lanes: null,
      substitution: ""
    };

    Object.keys(payload || {}).forEach(function (key) {
      question[key] = payload[key];
    });

    if (!question.hints || !question.hints.length) {
      question.hints = buildHints(question);
    }

    return question;
  }

  function makeChoiceSet(correctLabel, distractors) {
    var options = [correctLabel].concat((distractors || []).slice(0, 3));
    var shuffled = shuffle(options.slice());
    var choices = shuffled.map(function (label, index) {
      return {
        id: String.fromCharCode(65 + index),
        label: label
      };
    });
    var answerId = choices.filter(function (choice) {
      return choice.label === correctLabel;
    })[0].id;

    return {
      choices: choices,
      answerId: answerId
    };
  }

  function findChoiceLabel(question, choiceId) {
    if (!question || !question.choices) {
      return "";
    }
    var found = question.choices.filter(function (choice) {
      return choice.id === choiceId;
    })[0];
    return found ? found.label : "";
  }

  function formatCanonicalAnswer(question) {
    if (question.answerMode === "choice") {
      return findChoiceLabel(question, question.answer);
    }
    return formatFrac(question.answer, !!question.preferMixed);
  }

  function markQuestion(question, response) {
    if (question.answerMode === "choice") {
      if (!response) {
        return {
          isValid: false,
          isEquivalent: false,
          isSimplest: true,
          isCorrect: false,
          feedbackCode: "invalid",
          canonicalAnswerText: formatCanonicalAnswer(question)
        };
      }

      var isChoiceCorrect = response === question.answer;
      return {
        isValid: true,
        isEquivalent: isChoiceCorrect,
        isSimplest: true,
        isCorrect: isChoiceCorrect,
        feedbackCode: isChoiceCorrect ? "correct" : "incorrect",
        canonicalAnswerText: formatCanonicalAnswer(question)
      };
    }

    var parsed = parseAnswer(response);
    if (!parsed) {
      return {
        isValid: false,
        isEquivalent: false,
        isSimplest: false,
        isCorrect: false,
        feedbackCode: "invalid",
        canonicalAnswerText: formatCanonicalAnswer(question)
      };
    }

    var equivalent = equalFrac(parsed.fraction, question.answer);
    if (!equivalent) {
      return {
        isValid: true,
        isEquivalent: false,
        isSimplest: parsed.isSimplestInput,
        isCorrect: false,
        feedbackCode: "incorrect",
        canonicalAnswerText: formatCanonicalAnswer(question)
      };
    }

    if (question.answer.d !== 1 && (parsed.source === "fraction" || parsed.source === "mixed") && !parsed.isSimplestInput) {
      return {
        isValid: true,
        isEquivalent: true,
        isSimplest: false,
        isCorrect: true,
        feedbackCode: "equivalent_not_simplest",
        canonicalAnswerText: formatCanonicalAnswer(question)
      };
    }

    if (question.preferMixed && parsed.source === "fraction" && Math.abs(parsed.fraction.n) > parsed.fraction.d) {
      return {
        isValid: true,
        isEquivalent: true,
        isSimplest: true,
        isCorrect: true,
        feedbackCode: "equivalent_mixed_preferred",
        canonicalAnswerText: formatCanonicalAnswer(question)
      };
    }

    return {
      isValid: true,
      isEquivalent: true,
      isSimplest: true,
      isCorrect: true,
      feedbackCode: "correct",
      canonicalAnswerText: formatCanonicalAnswer(question)
    };
  }

  function setFeedback(id, message, kind) {
    var el = byId(id);
    if (!el) {
      return;
    }
    el.textContent = message;
    el.className = "feedback" + (kind ? " " + kind : "");
  }

  function ensureMasteryShape(raw) {
    var bySubtype = {};
    var byStrand = {};

    SUBTYPE_IDS.forEach(function (subtypeId) {
      var found = raw && raw.bySubtype && raw.bySubtype[subtypeId];
      bySubtype[subtypeId] = {
        correct: found && typeof found.correct === "number" ? Math.max(0, found.correct) : 0,
        total: found && typeof found.total === "number" ? Math.max(0, found.total) : 0
      };
    });

    STRANDS.forEach(function (strand) {
      var found = raw && raw.byStrand && raw.byStrand[strand.id];
      byStrand[strand.id] = {
        correct: found && typeof found.correct === "number" ? Math.max(0, found.correct) : 0,
        total: found && typeof found.total === "number" ? Math.max(0, found.total) : 0
      };
    });

    return {
      byStrand: byStrand,
      bySubtype: bySubtype,
      streaks: {
        current: raw && raw.streaks && typeof raw.streaks.current === "number" ? Math.max(0, raw.streaks.current) : 0,
        best: raw && raw.streaks && typeof raw.streaks.best === "number" ? Math.max(0, raw.streaks.best) : 0
      },
      recentErrors: raw && Array.isArray(raw.recentErrors) ? raw.recentErrors.slice(0, 120) : [],
      diagnosticDone: !!(raw && raw.diagnosticDone),
      enlightenmentScore: raw && typeof raw.enlightenmentScore === "number" ? Math.max(0, Math.min(100, raw.enlightenmentScore)) : 0,
      lastSessionAt: raw && raw.lastSessionAt ? raw.lastSessionAt : null
    };
  }

  function loadJson(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // ignore storage write failure
    }
  }

  var mastery = ensureMasteryShape(loadJson(STORAGE_KEYS.mastery));
  var capsuleEngine = null;

  function loadSession() {
    var raw = loadJson(STORAGE_KEYS.session) || {};

    if (raw.guided) {
      if (Array.isArray(raw.guided.queueIds)) {
        state.guided.queueIds = raw.guided.queueIds.filter(function (id) {
          return !!SUBTYPE_META[id];
        });
      }
      if (typeof raw.guided.index === "number") {
        state.guided.index = Math.max(0, raw.guided.index);
      }
      state.guided.inDiagnostic = !!raw.guided.inDiagnostic;

      if (Array.isArray(raw.guided.journeyOrder)) {
        var ordered = raw.guided.journeyOrder.filter(function (id) {
          return !!STRAND_MAP[id];
        });
        if (ordered.length === STRANDS.length) {
          state.guided.journeyOrder = ordered;
        }
      }

      if (typeof raw.guided.milestoneIndex === "number") {
        state.guided.milestoneIndex = Math.max(0, Math.min(STRANDS.length - 1, raw.guided.milestoneIndex));
      }
    }

    if (Array.isArray(raw.fixPack)) {
      state.fixPack = raw.fixPack.filter(function (id) {
        return !!SUBTYPE_META[id];
      }).slice(0, 32);
    }

    if (raw.examMode === "A" || raw.examMode === "B") {
      state.exam.mode = raw.examMode;
    }
  }

  function saveSession() {
    var payload = {
      guided: {
        inDiagnostic: state.guided.inDiagnostic,
        queueIds: state.guided.queueIds.slice(0, 24),
        index: state.guided.index,
        journeyOrder: state.guided.journeyOrder.slice(),
        milestoneIndex: state.guided.milestoneIndex
      },
      fixPack: state.fixPack.slice(0, 32),
      examMode: state.exam.mode
    };
    saveJson(STORAGE_KEYS.session, payload);
  }

  function loadSettings() {
    var settings = loadJson(STORAGE_KEYS.settings) || {};
    var focus = settings.practiceFocus || "auto";
    var difficulty = settings.practiceDifficulty || "2";

    if (byId("practiceFocus")) {
      byId("practiceFocus").value = focus;
    }
    if (byId("practiceDifficulty")) {
      byId("practiceDifficulty").value = difficulty;
    }
    if (byId("examMode")) {
      byId("examMode").value = state.exam.mode;
    }
  }

  function saveSettings() {
    var payload = {
      practiceFocus: byId("practiceFocus") ? byId("practiceFocus").value : "auto",
      practiceDifficulty: byId("practiceDifficulty") ? byId("practiceDifficulty").value : "2"
    };
    saveJson(STORAGE_KEYS.settings, payload);
  }

  function subtypeStats(subtypeId) {
    return mastery.bySubtype[subtypeId] || { correct: 0, total: 0 };
  }

  function subtypeAccuracy(subtypeId) {
    var stats = subtypeStats(subtypeId);
    return stats.total ? stats.correct / stats.total : 0;
  }

  function strandStats(strandId) {
    return mastery.byStrand[strandId] || { correct: 0, total: 0 };
  }

  function strandAccuracy(strandId) {
    var stats = strandStats(strandId);
    return stats.total ? stats.correct / stats.total : 0;
  }

  function recalcEnlightenment() {
    var subtypeAttempted = SUBTYPE_IDS.filter(function (id) {
      return subtypeStats(id).total > 0;
    }).length;

    var strandAttempted = STRANDS.filter(function (strand) {
      return strandStats(strand.id).total > 0;
    }).length;

    var totalAttempts = 0;
    var totalCorrect = 0;

    SUBTYPE_IDS.forEach(function (id) {
      totalAttempts += subtypeStats(id).total;
      totalCorrect += subtypeStats(id).correct;
    });

    var coverage = subtypeAttempted / SUBTYPE_IDS.length;
    var breadth = strandAttempted / STRANDS.length;
    var accuracy = totalAttempts ? totalCorrect / totalAttempts : 0;
    var consistency = Math.min(1, mastery.streaks.current / 14) * 0.6 + Math.min(1, mastery.streaks.best / 30) * 0.4;

    var score = Math.round((accuracy * 0.5 + coverage * 0.25 + breadth * 0.15 + consistency * 0.1) * 100);
    mastery.enlightenmentScore = Math.max(0, Math.min(100, score));
  }

  function masteryLabel(score) {
    if (score >= 92) {
      return score + "% - Enlightened mastery";
    }
    if (score >= 80) {
      return score + "% - Exam-ready trajectory";
    }
    if (score >= 65) {
      return score + "% - Strong conceptual growth";
    }
    if (score >= 40) {
      return score + "% - Foundations connecting";
    }
    return score + "% - Warming up";
  }

  function appendRecentError(question, inputText, markResult) {
    mastery.recentErrors.unshift({
      at: new Date().toISOString(),
      strand: question.strand,
      subtype: question.subtype,
      tag: (question.tags && question.tags[0]) || "general",
      prompt: question.prompt,
      answer: formatCanonicalAnswer(question),
      userInput: inputText || "(blank)",
      feedbackCode: markResult.feedbackCode
    });
    mastery.recentErrors = mastery.recentErrors.slice(0, 120);
  }

  function updateMastery(question, isCorrect, inputText, markResult) {
    if (!question) {
      return;
    }

    var subtypeBlock = mastery.bySubtype[question.subtype];
    var strandBlock = mastery.byStrand[question.strand];

    subtypeBlock.total += 1;
    strandBlock.total += 1;

    if (isCorrect) {
      subtypeBlock.correct += 1;
      strandBlock.correct += 1;
      mastery.streaks.current += 1;
      if (mastery.streaks.current > mastery.streaks.best) {
        mastery.streaks.best = mastery.streaks.current;
      }
    } else {
      mastery.streaks.current = 0;
      appendRecentError(question, inputText, markResult || { feedbackCode: "incorrect" });
    }

    mastery.lastSessionAt = new Date().toISOString();
    recalcEnlightenment();
    saveJson(STORAGE_KEYS.mastery, mastery);

    renderStatusStrip();
    renderMilestones();
    renderNotebook();
  }

  function milestoneProgress(strandId) {
    var ids = subtypeIdsForStrand(strandId);
    var completed = ids.filter(function (subtypeId) {
      var stats = subtypeStats(subtypeId);
      var accuracy = stats.total ? stats.correct / stats.total : 0;
      return stats.total >= 12 && accuracy >= 0.85;
    }).length;

    return {
      completed: completed,
      total: ids.length
    };
  }

  function isMilestoneUnlocked(strandId) {
    var progress = milestoneProgress(strandId);
    return progress.completed === progress.total;
  }

  function advanceGuidedMilestones() {
    while (
      state.guided.milestoneIndex < state.guided.journeyOrder.length - 1 &&
      isMilestoneUnlocked(state.guided.journeyOrder[state.guided.milestoneIndex])
    ) {
      state.guided.milestoneIndex += 1;
    }
  }

  function weakestStrandOrder() {
    return STRANDS
      .slice()
      .sort(function (a, b) {
        var accA = strandAccuracy(a.id);
        var accB = strandAccuracy(b.id);
        var totalA = strandStats(a.id).total;
        var totalB = strandStats(b.id).total;

        if (totalA === 0 && totalB > 0) {
          return -1;
        }
        if (totalB === 0 && totalA > 0) {
          return 1;
        }
        if (accA !== accB) {
          return accA - accB;
        }
        return totalA - totalB;
      })
      .map(function (strand) {
        return strand.id;
      });
  }

  function pickWeakSubtypeFromList(ids, statsSource) {
    var source = statsSource || mastery.bySubtype;
    var sorted = ids.slice().sort(function (left, right) {
      var a = source[left] || { correct: 0, total: 0 };
      var b = source[right] || { correct: 0, total: 0 };

      var aNeeds = a.total < 12;
      var bNeeds = b.total < 12;

      if (aNeeds && !bNeeds) {
        return -1;
      }
      if (!aNeeds && bNeeds) {
        return 1;
      }

      if (a.total !== b.total) {
        return a.total - b.total;
      }

      var accA = a.total ? a.correct / a.total : 0;
      var accB = b.total ? b.correct / b.total : 0;
      return accA - accB;
    });

    return sorted[0] || pick(ids);
  }

  function chooseGuidedSubtype() {
    if (state.guided.inDiagnostic) {
      return state.guided.queueIds[state.guided.index] || null;
    }

    advanceGuidedMilestones();
    var activeStrand = state.guided.journeyOrder[state.guided.milestoneIndex] || state.guided.journeyOrder[0];
    var candidates = subtypeIdsForStrand(activeStrand);

    if (!candidates.length) {
      return pickWeakSubtypeFromList(SUBTYPE_IDS);
    }

    return pickWeakSubtypeFromList(candidates);
  }

  function routeSummaryText() {
    if (!mastery.diagnosticDone) {
      return "Run 12-question diagnostic to unlock your adaptive path.";
    }

    advanceGuidedMilestones();
    var currentStrand = state.guided.journeyOrder[state.guided.milestoneIndex];
    var strandLabel = STRAND_MAP[currentStrand] ? STRAND_MAP[currentStrand].short : "Guided practice";
    var progress = milestoneProgress(currentStrand);

    if (state.guided.milestoneIndex === state.guided.journeyOrder.length - 1 && progress.completed === progress.total) {
      return "All milestones unlocked. Continue precision refinement across weakest subtypes.";
    }

    return "Current milestone: " + strandLabel + " (" + progress.completed + "/" + progress.total + " subtypes at target).";
  }

  function renderStatusStrip() {
    safeSetText("enlightenmentLabel", masteryLabel(mastery.enlightenmentScore));
    safeSetText("routeLabel", routeSummaryText());
  }

  function renderMilestones() {
    var wrap = byId("milestoneList");
    if (!wrap) {
      return;
    }

    wrap.innerHTML = "";

    state.guided.journeyOrder.forEach(function (strandId, index) {
      var strand = STRAND_MAP[strandId];
      var progress = milestoneProgress(strandId);
      var done = progress.completed === progress.total;
      var item = document.createElement("div");
      item.className = "milestone-item";

      if (index > state.guided.milestoneIndex) {
        item.className += " locked";
      }
      if (index === state.guided.milestoneIndex) {
        item.className += " active";
      }

      var stateText = done ? "Unlocked" : "Locked until 85% & 12 attempts/subtype";

      item.innerHTML =
        "<strong>" + strand.label + "</strong>" +
        "<div class=\"meta\">Progress: " + progress.completed + "/" + progress.total + " subtypes | " + stateText + "</div>";

      wrap.appendChild(item);
    });

    if (!mastery.diagnosticDone) {
      safeSetText("diagnosticStatus", state.guided.inDiagnostic
        ? "Diagnostic in progress: question " + (state.guided.index + 1) + " of " + state.guided.queueIds.length + "."
        : "Diagnostic has not started.");
    } else if (state.guided.inDiagnostic) {
      safeSetText("diagnosticStatus", "Diagnostic in progress: question " + (state.guided.index + 1) + " of " + state.guided.queueIds.length + ".");
    } else {
      safeSetText("diagnosticStatus", "Diagnostic completed. Guided path now follows weak-to-strong milestones.");
    }
  }

  function renderChoices(containerId, question, selectedId, onPick) {
    var wrap = byId(containerId);
    if (!wrap) {
      return;
    }

    wrap.innerHTML = "";

    (question.choices || []).forEach(function (choice) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn" + (choice.id === selectedId ? " active" : "");
      btn.textContent = choice.id + ". " + choice.label;
      btn.addEventListener("click", function () {
        onPick(choice.id);
      });
      wrap.appendChild(btn);
    });
  }

  function applyTeachingDepth(prefix, question) {
    setList(prefix + "MethodA", question.methodsA);
    setList(prefix + "MethodB", question.methodsB);
    setList(prefix + "MethodC", question.methodsC);
    safeSetText(prefix + "Shortcut", question.shortcut || "-");
    safeSetText(prefix + "Pitfall", question.pitfall || "-");
    safeSetText(prefix + "Why", question.whyItWorks || "-");
    safeSetText(prefix + "CheckRule", question.checks || "-");
  }

  function resetCapsule(prefix, message) {
    safeSetText(prefix + "CapsuleTitle", message || "No capsule available.");
    setList(prefix + "CapsuleList", []);
    safeSetText(prefix + "CapsuleMeta", "-");
  }

  function renderCapsule(prefix, subtypeId) {
    if (!capsuleEngine || !subtypeId) {
      resetCapsule(prefix, "No capsule available for this view.");
      return;
    }

    var cursor = state.capsuleCursor[prefix];
    if (!cursor) {
      return;
    }

    if (cursor.subtypeId !== subtypeId) {
      cursor.subtypeId = subtypeId;
      cursor.index = 0;
    }

    var capsule = capsuleEngine.capsuleFor(subtypeId, cursor.index);
    if (!capsule || !capsule.module) {
      resetCapsule(prefix, "No deep capsules loaded for this subtype.");
      return;
    }

    var module = capsule.module;
    safeSetText(prefix + "CapsuleTitle", module.title + " - " + module.objective);
    setList(prefix + "CapsuleList", [
      "Concept: " + module.concept,
      "Method A focus: " + module.methodA,
      "Method B focus: " + module.methodB,
      "Method C focus: " + module.methodC,
      "Pitfall watch: " + module.pitfall,
      "Diagnostic check: " + module.diagnostic,
      "Extension: " + module.extension,
      "Reflection: " + module.reflection
    ]);
    safeSetText(
      prefix + "CapsuleMeta",
      "Capsule " + (capsule.index + 1) + "/" + capsule.total +
      " | Target difficulty: " + module.targetDifficulty +
      " | Tag: " + module.masteryTag
    );
  }

  function nextCapsule(prefix) {
    if (!capsuleEngine) {
      return;
    }

    var cursor = state.capsuleCursor[prefix];
    if (!cursor || !cursor.subtypeId) {
      return;
    }

    var total = capsuleEngine.modulesFor(cursor.subtypeId).length;
    if (!total) {
      return;
    }

    cursor.index = (cursor.index + 1) % total;
    renderCapsule(prefix, cursor.subtypeId);
  }

  function feedbackFromMark(question, markResult, revealOnly) {
    if (revealOnly) {
      return "Answer: " + markResult.canonicalAnswerText;
    }

    if (!markResult.isValid) {
      return "Enter a valid answer first.";
    }

    if (markResult.isCorrect && markResult.feedbackCode === "equivalent_not_simplest") {
      return "Correct value. Correct value, simplify for PSLE final answer.";
    }

    if (markResult.isCorrect && markResult.feedbackCode === "equivalent_mixed_preferred") {
      return "Correct value. For this prompt, mixed form is preferred in final written answers.";
    }

    if (markResult.isCorrect) {
      return "Correct.";
    }

    return "Not yet. Correct answer: " + markResult.canonicalAnswerText;
  }

  function renderGuidedQuestion() {
    var question = state.guided.current;

    if (!question) {
      safeSetText("guidedSubtype", "Subtype");
      safeSetText("guidedPrompt", "Press \"Start 12-Question Diagnostic\" to begin your guided route.");
      byId("guidedChoiceWrap").classList.add("hidden");
      byId("guidedInputRow").classList.remove("hidden");
      byId("guidedInput").value = "";
      applyTeachingDepth("guided", {
        methodsA: [], methodsB: [], methodsC: [], shortcut: "-", pitfall: "-", whyItWorks: "-", checks: "-"
      });
      safeSetText("guidedHintOutput", "Hints appear here progressively (Hint 1-3).");
      setFeedback("guidedFeedback", "", "");
      resetCapsule("guided", "Deep curriculum capsule will appear for this subtype.");
      return;
    }

    var strandLabel = STRAND_MAP[question.strand] ? STRAND_MAP[question.strand].short : "Strand";
    safeSetText("guidedSubtype", strandLabel + " - " + SUBTYPE_META[question.subtype].label);
    safeSetText("guidedDifficulty", "Difficulty " + question.difficulty);
    safeSetText("guidedPrompt", question.prompt);

    state.guided.selectedChoice = null;

    if (question.answerMode === "choice") {
      byId("guidedInputRow").classList.add("hidden");
      byId("guidedChoiceWrap").classList.remove("hidden");
      var chooseGuidedChoice = function (choiceId) {
        state.guided.selectedChoice = choiceId;
        renderChoices("guidedChoiceWrap", question, choiceId, chooseGuidedChoice);
      };
      renderChoices("guidedChoiceWrap", question, state.guided.selectedChoice, chooseGuidedChoice);
    } else {
      byId("guidedChoiceWrap").classList.add("hidden");
      byId("guidedInputRow").classList.remove("hidden");
      byId("guidedInput").value = "";
      byId("guidedInput").placeholder = "Type answer";
      byId("guidedInput").focus();
    }

    state.guided.hintLevel = 0;
    state.guided.graded = false;
    byId("guidedHintBtn").textContent = "Hint 1";
    safeSetText("guidedHintOutput", "Hints appear here progressively (Hint 1-3).");
    setFeedback("guidedFeedback", "", "");
    applyTeachingDepth("guided", question);
    renderCapsule("guided", question.subtype);
  }

  function newGuidedQuestion() {
    var subtypeId = chooseGuidedSubtype();
    if (!subtypeId) {
      return;
    }

    state.guided.current = generateQuestion(subtypeId, 2);
    renderGuidedQuestion();
    saveSession();
    renderMilestones();
  }

  function startDiagnostic() {
    state.guided.inDiagnostic = true;
    state.guided.queueIds = DIAGNOSTIC_BLUEPRINT.slice();
    state.guided.index = 0;
    state.guided.milestoneIndex = 0;
    mastery.diagnosticDone = false;

    saveJson(STORAGE_KEYS.mastery, mastery);
    saveSession();

    newGuidedQuestion();
    renderStatusStrip();
    renderMilestones();
  }

  function finishDiagnostic() {
    state.guided.inDiagnostic = false;
    state.guided.queueIds = [];
    state.guided.index = 0;
    mastery.diagnosticDone = true;

    state.guided.journeyOrder = weakestStrandOrder();
    state.guided.milestoneIndex = 0;

    recalcEnlightenment();
    saveJson(STORAGE_KEYS.mastery, mastery);
    saveSession();

    renderStatusStrip();
    renderMilestones();
  }

  function checkGuided(revealOnly) {
    var question = state.guided.current;
    if (!question) {
      setFeedback("guidedFeedback", "Generate a guided question first.", "bad");
      return;
    }

    if (!revealOnly && state.guided.graded) {
      setFeedback("guidedFeedback", "This question is already graded. Click Next Guided Question.", "");
      return;
    }

    var response;
    if (question.answerMode === "choice") {
      response = state.guided.selectedChoice;
    } else {
      response = byId("guidedInput").value;
    }

    var markResult = markQuestion(question, response);

    if (revealOnly) {
      setFeedback("guidedFeedback", feedbackFromMark(question, markResult, true), "");
      if (state.guided.inDiagnostic && !state.guided.graded) {
        state.guided.graded = true;
        updateMastery(question, false, "[revealed]", { feedbackCode: "revealed" });
      }
      return;
    }

    if (!markResult.isValid) {
      setFeedback("guidedFeedback", "Enter a valid answer first.", "bad");
      return;
    }

    state.guided.graded = true;
    updateMastery(question, markResult.isCorrect, String(response || ""), markResult);

    if (markResult.isCorrect) {
      setFeedback("guidedFeedback", feedbackFromMark(question, markResult, false), "good");
    } else {
      setFeedback("guidedFeedback", feedbackFromMark(question, markResult, false), "bad");
    }
  }

  function nextGuidedStep() {
    if (!state.guided.current) {
      newGuidedQuestion();
      return;
    }

    if (state.guided.inDiagnostic) {
      if (!state.guided.graded) {
        setFeedback("guidedFeedback", "Check or reveal this diagnostic question before moving on.", "bad");
        return;
      }

      state.guided.index += 1;
      if (state.guided.index >= state.guided.queueIds.length) {
        finishDiagnostic();
        newGuidedQuestion();
      } else {
        newGuidedQuestion();
      }
      return;
    }

    newGuidedQuestion();
  }

  function revealHintFor(prefix, question, levelRef) {
    if (!question) {
      return;
    }

    var nextLevel = Math.min(3, levelRef.value + 1);
    levelRef.value = nextLevel;

    var visibleHints = (question.hints || []).slice(0, nextLevel);
    safeSetText(prefix + "HintOutput", "Hint " + nextLevel + ": " + visibleHints.join(" | "));
  }

  function renderAtlas() {
    var grid = byId("atlasGrid");
    if (!grid) {
      return;
    }

    grid.innerHTML = "";

    STRANDS.forEach(function (strand) {
      var box = document.createElement("div");
      box.className = "atlas-strand";

      var heading = document.createElement("h4");
      heading.textContent = strand.label;
      box.appendChild(heading);

      subtypeIdsForStrand(strand.id).forEach(function (subtypeId) {
        var btn = document.createElement("button");
        btn.className = "subtype-btn";
        btn.type = "button";

        var stats = subtypeStats(subtypeId);
        var pct = stats.total ? asPercent(stats.correct / stats.total) : 0;
        btn.textContent = SUBTYPE_META[subtypeId].label + "  (" + stats.correct + "/" + stats.total + " | " + pct + "%)";

        btn.addEventListener("click", function () {
          state.atlas.subtypeId = subtypeId;
          state.atlas.question = generateQuestion(subtypeId, 2);
          renderAtlasDetail();
        });

        box.appendChild(btn);
      });

      grid.appendChild(box);
    });
  }

  function renderAtlasDetail() {
    if (!state.atlas.subtypeId) {
      safeSetText("atlasTitle", "Select a subtype");
      safeSetText("atlasPrompt", "Atlas preview appears here.");
      applyTeachingDepth("atlas", {
        methodsA: [], methodsB: [], methodsC: [], shortcut: "-", pitfall: "-", whyItWorks: "-", checks: "-"
      });
      resetCapsule("atlas", "Select a subtype to open deep curriculum modules.");
      return;
    }

    if (!state.atlas.question) {
      state.atlas.question = generateQuestion(state.atlas.subtypeId, 2);
    }

    var question = state.atlas.question;
    safeSetText("atlasTitle", STRAND_MAP[question.strand].short + " - " + SUBTYPE_META[question.subtype].label);
    safeSetText("atlasPrompt", question.prompt + "\nSample answer: " + formatCanonicalAnswer(question));
    applyTeachingDepth("atlas", question);
    renderCapsule("atlas", question.subtype);
  }

  function renderOperationBars(container, fractionValue, fillClass, title) {
    var absN = Math.abs(fractionValue.n);
    var d = Math.max(1, fractionValue.d);
    var units = Math.max(1, Math.min(4, Math.ceil(absN / d)));
    var remaining = absN;

    var wrap = document.createElement("div");
    wrap.className = "bar-group";

    var head = document.createElement("div");
    head.className = "bar-title";
    head.textContent = title + " = " + formatFrac(fractionValue, true);
    wrap.appendChild(head);

    for (var u = 0; u < units; u += 1) {
      var row = document.createElement("div");
      row.className = "bar-row";
      row.style.gridTemplateColumns = "repeat(" + d + ", minmax(0, 1fr))";

      for (var i = 0; i < d; i += 1) {
        var seg = document.createElement("span");
        seg.className = "seg";
        if (remaining > 0) {
          seg.className += " " + fillClass;
          remaining -= 1;
        }
        row.appendChild(seg);
      }

      wrap.appendChild(row);
    }

    container.appendChild(wrap);
  }

  function renderNumberLineModel(a, b) {
    var box = byId("modelNumberLine");
    if (!box) {
      return;
    }

    box.innerHTML = "";

    var maxValue = Math.max(1, Math.ceil(Math.max(fractionValue(a), fractionValue(b), 1)));

    var line = document.createElement("div");
    line.className = "numberline";

    var track = document.createElement("div");
    track.className = "numberline-track";
    line.appendChild(track);

    for (var t = 0; t <= maxValue; t += 1) {
      var left = (t / maxValue) * 100;

      var tick = document.createElement("span");
      tick.className = "numberline-tick";
      tick.style.left = left + "%";
      line.appendChild(tick);

      var lbl = document.createElement("span");
      lbl.className = "numberline-label";
      lbl.style.left = left + "%";
      lbl.textContent = String(t);
      line.appendChild(lbl);
    }

    function addPoint(value, cls, label) {
      var point = document.createElement("span");
      point.className = "numberline-point " + cls;
      point.style.left = Math.max(0, Math.min(100, (fractionValue(value) / maxValue) * 100)) + "%";
      var caption = document.createElement("span");
      caption.textContent = label;
      point.appendChild(caption);
      line.appendChild(point);
    }

    addPoint(a, "a", "A: " + formatFrac(a, true));
    addPoint(b, "b", "B: " + formatFrac(b, true));

    box.appendChild(line);
  }

  function renderAreaCard(container, title, f, fillClass) {
    var absN = Math.abs(f.n);
    var d = Math.max(1, f.d);
    var units = Math.max(1, Math.min(2, Math.ceil(absN / d)));
    var remaining = absN;

    var card = document.createElement("div");
    card.className = "area-card";

    var heading = document.createElement("div");
    heading.className = "bar-title";
    heading.textContent = title + " = " + formatFrac(f, true);
    card.appendChild(heading);

    var grid = document.createElement("div");
    grid.className = "area-cell-grid";
    grid.style.gridTemplateColumns = "repeat(" + d + ", minmax(0, 1fr))";

    for (var u = 0; u < units; u += 1) {
      for (var i = 0; i < d; i += 1) {
        var cell = document.createElement("span");
        cell.className = "area-cell";
        if (remaining > 0) {
          cell.className += " " + fillClass;
          remaining -= 1;
        }
        grid.appendChild(cell);
      }
    }

    card.appendChild(grid);
    container.appendChild(card);
  }

  function renderAreaModel(a, b) {
    var box = byId("modelArea");
    if (!box) {
      return;
    }

    box.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "area-grid-wrap";
    renderAreaCard(wrap, "A", a, "fill-a");
    renderAreaCard(wrap, "B", b, "fill-b");
    box.appendChild(wrap);
  }

  function operationQuestion(a, b, op) {
    if (op === "add") {
      var lAdd = lcm(a.d, b.d);
      var aScaled = frac(a.n * (lAdd / a.d), lAdd);
      var bScaled = frac(b.n * (lAdd / b.d), lAdd);
      var resultAdd = addFrac(a, b);
      return {
        result: resultAdd,
        methodsA: [
          "Find LCM(" + a.d + ", " + b.d + ") = " + lAdd + ".",
          formatFrac(a, false) + " -> " + formatFrac(aScaled, false) + " and " + formatFrac(b, false) + " -> " + formatFrac(bScaled, false) + ".",
          "Add numerators and simplify to get " + formatFrac(resultAdd, true) + "."
        ],
        methodsB: [
          "Use butterfly: (" + a.n + "x" + b.d + " + " + b.n + "x" + a.d + ") / (" + a.d + "x" + b.d + ").",
          "Simplify the resulting fraction.",
          "Check answer should be larger than both addends."
        ],
        methodsC: [
          "Benchmark quickly: both are around " + formatFrac(frac(1, 2), false) + " to estimate range.",
          "Since it is addition, result should exceed 1 if sum of estimates > 1.",
          "Do exact method only after rough estimate check."
        ],
        shortcut: "When one denominator is a multiple of the other, use the larger denominator directly.",
        pitfall: "Adding denominators directly.",
        why: "Equivalent fractions preserve value, so addition works once parts are made equal in size."
      };
    }

    if (op === "sub") {
      var lSub = lcm(a.d, b.d);
      var aScaledSub = frac(a.n * (lSub / a.d), lSub);
      var bScaledSub = frac(b.n * (lSub / b.d), lSub);
      var resultSub = subFrac(a, b);
      return {
        result: resultSub,
        methodsA: [
          "Find LCM(" + a.d + ", " + b.d + ") = " + lSub + ".",
          "Rewrite fractions: " + formatFrac(aScaledSub, false) + " and " + formatFrac(bScaledSub, false) + ".",
          "Subtract numerators and simplify to " + formatFrac(resultSub, true) + "."
        ],
        methodsB: [
          "Butterfly subtraction: (" + a.n + "x" + b.d + " - " + b.n + "x" + a.d + ")/(" + a.d + "x" + b.d + ").",
          "Simplify after subtraction.",
          "If result negative, verify which original fraction is bigger."
        ],
        methodsC: [
          "Estimate with benchmarks first (0, 1/2, 1).",
          "Check whether result should be near 0 or much larger.",
          "Then compute exactly and compare with estimate."
        ],
        shortcut: "If denominators are equal, subtract numerators only.",
        pitfall: "Subtracting denominator from denominator.",
        why: "Subtraction removes equal-sized parts, so matching denominators is required."
      };
    }

    if (op === "mul") {
      var resultMul = mulFrac(a, b);
      var g1 = gcd(Math.abs(a.n), b.d);
      var g2 = gcd(Math.abs(b.n), a.d);
      return {
        result: resultMul,
        methodsA: [
          "Multiply numerators and multiply denominators.",
          "Raw product simplifies to " + formatFrac(resultMul, true) + ".",
          "Write final answer in lowest terms."
        ],
        methodsB: [
          "Cross-cancel before multiplying.",
          "Cancellation factors available: " + g1 + " and " + g2 + ".",
          "Multiply reduced numbers for fewer arithmetic errors."
        ],
        methodsC: [
          "Estimate whether product should shrink or grow.",
          "Multiplying by fraction less than 1 should reduce magnitude.",
          "Use estimate to detect multiplication mistakes quickly."
        ],
        shortcut: "Always attempt cross-cancel first.",
        pitfall: "Forgetting to simplify after multiplication.",
        why: "Fraction multiplication scales the original quantity by a ratio."
      };
    }

    if (b.n === 0) {
      return {
        result: null,
        methodsA: ["Division by zero is undefined."],
        methodsB: ["Set Fraction B to a non-zero value."],
        methodsC: ["In PSLE exams, always check divisor is not 0."],
        shortcut: "Dividing by 0 is not allowed.",
        pitfall: "Ignoring zero divisor.",
        why: "No number multiplied by 0 can recover a non-zero dividend."
      };
    }

    var resultDiv = divFrac(a, b);
    return {
      result: resultDiv,
      methodsA: [
        "Keep first fraction, flip second fraction.",
        formatFrac(a, false) + " / " + formatFrac(b, false) + " = " + formatFrac(a, false) + " x " + formatFrac(frac(b.d, b.n), false) + ".",
        "Multiply and simplify to " + formatFrac(resultDiv, true) + "."
      ],
      methodsB: [
        "Interpret as multiplying by reciprocal.",
        "Cross-cancel if possible before multiplying.",
        "Check reasonableness: dividing by <1 should increase value."
      ],
      methodsC: [
        "Estimate with decimal sense before exact work.",
        "If divisor is close to 1/2, result should be roughly double.",
        "Use this to catch incorrect reciprocal flips."
      ],
      shortcut: "KFC: Keep, Flip, Change to multiply.",
      pitfall: "Flipping the wrong fraction.",
      why: "Division asks how many groups fit; reciprocal converts that count into multiplication."
    };
  }

  function renderOperationsLab() {
    var a = frac(
      clampInt(byId("opANum").value, 0, 40, 0),
      clampInt(byId("opADen").value, 1, 40, 1)
    );
    var b = frac(
      clampInt(byId("opBNum").value, 0, 40, 0),
      clampInt(byId("opBDen").value, 1, 40, 1)
    );

    byId("opANum").value = String(a.n);
    byId("opADen").value = String(a.d);
    byId("opBNum").value = String(b.n);
    byId("opBDen").value = String(b.d);

    var op = byId("opType").value;
    var model = byId("opModel").value;
    var detail = operationQuestion(a, b, op);

    safeSetText("opResult", detail.result ? "Result: " + formatFrac(detail.result, true) : "Result: Undefined");

    byId("modelBars").classList.toggle("hidden", model !== "bars");
    byId("modelNumberLine").classList.toggle("hidden", model !== "numberline");
    byId("modelArea").classList.toggle("hidden", model !== "area");

    if (model === "bars") {
      var bars = byId("modelBars");
      bars.innerHTML = "";
      renderOperationBars(bars, a, "a-fill", "Fraction A");
      renderOperationBars(bars, b, "b-fill", "Fraction B");
    } else if (model === "numberline") {
      renderNumberLineModel(a, b);
    } else {
      renderAreaModel(a, b);
    }

    var mode = state.operations.methodMode;
    var stepList = detail["methods" + mode] || detail.methodsA;
    setList("opMethodSteps", stepList);
    safeSetText("opMethodMeta", "Shortcut: " + detail.shortcut + " | Pitfall: " + detail.pitfall + " | Why: " + detail.why);
  }

  function renderOperationMethodButtons() {
    var buttons = document.querySelectorAll(".method-btn");
    for (var i = 0; i < buttons.length; i += 1) {
      var btn = buttons[i];
      btn.classList.toggle("active", btn.getAttribute("data-op-method") === state.operations.methodMode);
    }
  }

  function adaptiveFocusPool(focus) {
    if (focus === "operations") {
      return SUBTYPE_IDS.filter(function (id) {
        return ["s2", "s3", "s4"].indexOf(SUBTYPE_META[id].strand) >= 0;
      });
    }
    if (focus === "word") {
      return SUBTYPE_IDS.filter(function (id) {
        return ["s5", "s6"].indexOf(SUBTYPE_META[id].strand) >= 0;
      });
    }
    if (focus === "algebra") {
      return SUBTYPE_IDS.filter(function (id) {
        return SUBTYPE_META[id].strand === "s7";
      });
    }
    return SUBTYPE_IDS.slice();
  }

  function chooseAdaptiveSubtype(focus) {
    if (focus === "fixpack") {
      if (state.fixPack.length) {
        var next = state.fixPack.shift();
        saveSession();
        return next;
      }
      return pickWeakSubtypeFromList(SUBTYPE_IDS);
    }

    if (focus === "weak") {
      return pickWeakSubtypeFromList(SUBTYPE_IDS);
    }

    if (focus === "auto") {
      if (mastery.recentErrors.length && Math.random() < 0.6) {
        var hot = {};
        mastery.recentErrors.slice(0, 30).forEach(function (entry) {
          hot[entry.subtype] = (hot[entry.subtype] || 0) + 1;
        });
        var hotIds = Object.keys(hot).sort(function (a, b) {
          return hot[b] - hot[a];
        });
        if (hotIds.length) {
          return hotIds[0];
        }
      }

      var weakStrand = weakestStrandOrder()[0];
      return pickWeakSubtypeFromList(subtypeIdsForStrand(weakStrand));
    }

    var pool = adaptiveFocusPool(focus);
    return pickWeakSubtypeFromList(pool);
  }

  function renderPracticeQuestion() {
    var question = state.practice.current;

    if (!question) {
      safeSetText("practiceSubtype", "Subtype");
      safeSetText("practiceTag", "Tag");
      safeSetText("practicePrompt", "Generate a question to begin adaptive practice.");
      byId("practiceChoiceWrap").classList.add("hidden");
      byId("practiceInputRow").classList.remove("hidden");
      byId("practiceInput").value = "";
      setFeedback("practiceFeedback", "", "");
      safeSetText("practiceHintOutput", "Hints appear here progressively (Hint 1-3).");
      applyTeachingDepth("practice", {
        methodsA: [], methodsB: [], methodsC: [], shortcut: "-", pitfall: "-", whyItWorks: "-", checks: "-"
      });
      resetCapsule("practice", "Generate a question to map into curriculum capsules.");
      return;
    }

    safeSetText("practiceSubtype", SUBTYPE_META[question.subtype].label);
    safeSetText("practiceTag", (question.tags && question.tags[0]) || "general");
    safeSetText("practicePrompt", question.prompt);

    if (question.answerMode === "choice") {
      byId("practiceInputRow").classList.add("hidden");
      byId("practiceChoiceWrap").classList.remove("hidden");
      var choosePracticeChoice = function (choiceId) {
        state.practice.selectedChoice = choiceId;
        renderChoices("practiceChoiceWrap", question, choiceId, choosePracticeChoice);
      };
      renderChoices("practiceChoiceWrap", question, state.practice.selectedChoice, choosePracticeChoice);
    } else {
      byId("practiceChoiceWrap").classList.add("hidden");
      byId("practiceInputRow").classList.remove("hidden");
      byId("practiceInput").value = "";
      byId("practiceInput").placeholder = "Type answer";
      byId("practiceInput").focus();
    }

    state.practice.hintLevel = 0;
    state.practice.graded = false;
    state.practice.selectedChoice = null;
    byId("practiceHintBtn").textContent = "Hint 1";

    setFeedback("practiceFeedback", "", "");
    safeSetText("practiceHintOutput", "Hints appear here progressively (Hint 1-3).");
    applyTeachingDepth("practice", question);
    renderCapsule("practice", question.subtype);
  }

  function newPracticeQuestion() {
    var focus = byId("practiceFocus").value;
    var difficulty = parseInt(byId("practiceDifficulty").value, 10) || 2;
    var subtypeId = chooseAdaptiveSubtype(focus);

    state.practice.current = generateQuestion(subtypeId, difficulty);
    renderPracticeQuestion();
    saveSettings();
    renderFixPackStatus();
  }

  function checkPractice(revealOnly) {
    var question = state.practice.current;
    if (!question) {
      setFeedback("practiceFeedback", "Generate a question first.", "bad");
      return;
    }

    if (!revealOnly && state.practice.graded) {
      setFeedback("practiceFeedback", "This question is already graded. Generate a new one.", "");
      return;
    }

    var response = question.answerMode === "choice" ? state.practice.selectedChoice : byId("practiceInput").value;
    var markResult = markQuestion(question, response);

    if (revealOnly) {
      setFeedback("practiceFeedback", feedbackFromMark(question, markResult, true), "");
      return;
    }

    if (!markResult.isValid) {
      setFeedback("practiceFeedback", "Enter a valid answer first.", "bad");
      return;
    }

    state.practice.graded = true;
    updateMastery(question, markResult.isCorrect, String(response || ""), markResult);

    if (markResult.isCorrect) {
      setFeedback("practiceFeedback", feedbackFromMark(question, markResult, false), "good");
    } else {
      setFeedback("practiceFeedback", feedbackFromMark(question, markResult, false), "bad");
    }
  }

  function renderAlgebraQuestion() {
    var question = state.algebra.current;

    if (!question) {
      safeSetText("algebraSubtype", "Algebra subtype");
      safeSetText("algebraPrompt", "Press \"New Algebra Question\".");
      byId("algebraInput").value = "";
      setFeedback("algebraFeedback", "", "");
      safeSetText("algebraHintOutput", "Hints appear here progressively (Hint 1-3).");
      safeSetText("algebraShortcut", "-");
      safeSetText("algebraPitfall", "-");
      safeSetText("algebraWhy", "-");
      safeSetText("algebraCheckRule", "-");
      setList("algebraReverseSteps", ["Press reveal to show steps."]);
      setList("algebraClearSteps", ["Press reveal to show steps."]);
      return;
    }

    safeSetText("algebraSubtype", SUBTYPE_META[question.subtype].label);
    safeSetText("algebraPrompt", question.prompt);
    byId("algebraInput").value = "";
    byId("algebraInput").focus();
    setFeedback("algebraFeedback", "", "");
    byId("algebraHintBtn").textContent = "Hint 1";
    safeSetText("algebraHintOutput", "Hints appear here progressively (Hint 1-3).");
    safeSetText("algebraShortcut", question.shortcut);
    safeSetText("algebraPitfall", question.pitfall);
    safeSetText("algebraWhy", question.whyItWorks);
    safeSetText("algebraCheckRule", question.checks);

    state.algebra.revealSteps = 0;
    renderAlgebraLanes();
  }

  function renderAlgebraLanes() {
    var question = state.algebra.current;
    if (!question || !question.lanes) {
      setList("algebraReverseSteps", ["Press reveal to show steps."]);
      setList("algebraClearSteps", ["Press reveal to show steps."]);
      return;
    }

    var reverse = question.lanes.reverse.slice(0, state.algebra.revealSteps);
    var clear = question.lanes.clear.slice(0, state.algebra.revealSteps);

    if (!reverse.length) {
      reverse = ["Press reveal to show steps."];
    }
    if (!clear.length) {
      clear = ["Press reveal to show steps."];
    }

    setList("algebraReverseSteps", reverse);
    setList("algebraClearSteps", clear);
  }

  function newAlgebraQuestion() {
    var algebraSubtypes = SUBTYPE_IDS.filter(function (id) {
      return SUBTYPE_META[id].strand === "s7";
    });

    var subtypeId = pickWeakSubtypeFromList(algebraSubtypes);
    var difficulty = parseInt(byId("practiceDifficulty").value, 10) || 2;

    state.algebra.current = generateQuestion(subtypeId, difficulty);
    state.algebra.graded = false;
    state.algebra.hintLevel = 0;

    renderAlgebraQuestion();
  }

  function checkAlgebra(revealOnly) {
    var question = state.algebra.current;
    if (!question) {
      setFeedback("algebraFeedback", "Generate an algebra question first.", "bad");
      return;
    }

    if (!revealOnly && state.algebra.graded) {
      setFeedback("algebraFeedback", "Already graded. Generate a new algebra question.", "");
      return;
    }

    var response = byId("algebraInput").value;
    var markResult = markQuestion(question, response);

    if (revealOnly) {
      setFeedback("algebraFeedback", "Answer: x = " + markResult.canonicalAnswerText, "");
      return;
    }

    if (!markResult.isValid) {
      setFeedback("algebraFeedback", "Enter a valid value for x.", "bad");
      return;
    }

    state.algebra.graded = true;
    updateMastery(question, markResult.isCorrect, response, markResult);

    var message = feedbackFromMark(question, markResult, false);
    if (markResult.isCorrect) {
      message += " Substitute x back: " + (question.substitution || "both sides should match exactly.");
      setFeedback("algebraFeedback", message, "good");
    } else {
      setFeedback("algebraFeedback", message, "bad");
    }
  }

  function examBlueprint(mode) {
    if (mode === "B") {
      return [
        "s1_equivalent",
        "s1_numberline",
        "s2_compare",
        "s3_add_unlike",
        "s3_subtract_mixed",
        "s4_divide",
        "s5_whole_from_part",
        "s6_remainder",
        "s6_word_algebra",
        "s7_alg_inverse",
        "s7_alg_twostep",
        "s8_simplify_enforce"
      ];
    }

    var modeA = [
      "s1_forms", "s1_equivalent", "s2_compare", "s2_order", "s3_add_unlike",
      "s3_subtract_mixed", "s4_multiply", "s4_divide", "s5_fraction_of_quantity", "s5_whole_from_part",
      "s6_before_after", "s6_remainder", "s6_sequential", "s6_same_total", "s6_word_algebra",
      "s7_alg_inverse", "s7_alg_bracket", "s7_alg_coefficient", "s8_estimation", "s8_misconception"
    ];

    return modeA;
  }

  function renderExamTimer() {
    var secondsLeft = state.exam.timeLeft;
    if (!state.exam.active && secondsLeft <= 0) {
      var mode = byId("examMode") ? byId("examMode").value : state.exam.mode;
      secondsLeft = mode === "B" ? 30 * 60 : 25 * 60;
    }
    var minutes = Math.floor(secondsLeft / 60);
    var seconds = secondsLeft % 60;
    safeSetText("examTimer", String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0"));
  }

  function renderExamQuestion() {
    if (!state.exam.active) {
      return;
    }

    var question = state.exam.questions[state.exam.index];
    if (!question) {
      return;
    }

    safeSetText("examSubtype", SUBTYPE_META[question.subtype].label);
    safeSetText("examPrompt", question.prompt);
    safeSetText("examProgress", "Question " + (state.exam.index + 1) + " of " + state.exam.questions.length);

    state.exam.selectedChoice = null;

    if (question.answerMode === "choice") {
      byId("examInputRow").classList.add("hidden");
      byId("examChoiceWrap").classList.remove("hidden");
      var chooseExamChoice = function (choiceId) {
        state.exam.selectedChoice = choiceId;
        renderChoices("examChoiceWrap", question, choiceId, chooseExamChoice);
      };
      renderChoices("examChoiceWrap", question, state.exam.selectedChoice, chooseExamChoice);
    } else {
      byId("examChoiceWrap").classList.add("hidden");
      byId("examInputRow").classList.remove("hidden");
      byId("examInput").value = "";
      byId("examInput").placeholder = "Type answer";
      byId("examInput").focus();
    }

    setFeedback("examFeedback", "", "");
  }

  function finishExam(reason) {
    state.exam.active = false;
    state.exam.lock = false;

    if (state.exam.timerRef) {
      clearInterval(state.exam.timerRef);
      state.exam.timerRef = null;
    }

    var total = state.exam.questions.length;
    var score = state.exam.correct;
    var pct = total ? Math.round((score / total) * 100) : 0;

    var perStrand = {};
    var wrongSubtypeCounts = {};

    state.exam.results.forEach(function (entry) {
      if (!perStrand[entry.strand]) {
        perStrand[entry.strand] = { correct: 0, total: 0 };
      }
      perStrand[entry.strand].total += 1;
      if (entry.correct) {
        perStrand[entry.strand].correct += 1;
      } else {
        wrongSubtypeCounts[entry.subtype] = (wrongSubtypeCounts[entry.subtype] || 0) + 1;
      }
    });

    var weakLines = Object.keys(perStrand).map(function (strandId) {
      var block = perStrand[strandId];
      var strandPct = block.total ? Math.round((block.correct / block.total) * 100) : 0;
      return "<li>" + STRAND_MAP[strandId].short + ": " + block.correct + "/" + block.total + " (" + strandPct + "%)</li>";
    });

    var retry = Object.keys(wrongSubtypeCounts)
      .sort(function (a, b) {
        return wrongSubtypeCounts[b] - wrongSubtypeCounts[a];
      })
      .slice(0, 8);

    state.fixPack = retry;
    saveSession();

    var heading = reason === "time" ? "Time is up." : "Exam complete.";
    byId("examReport").innerHTML =
      "<strong>" + heading + " Score: " + score + "/" + total + " (" + pct + "%).</strong>" +
      "<ul>" +
        "<li>Target for confidence: 80%+.</li>" +
        "<li>Mastery and notebook were updated using exam responses.</li>" +
        "<li>Retry set generated: " + (retry.length ? retry.map(function (id) { return SUBTYPE_META[id].label; }).join(", ") : "No retry set needed.") + "</li>" +
      "</ul>" +
      "<strong>Strand analytics:</strong><ul>" + weakLines.join("") + "</ul>";

    safeSetText("examProgress", "Exam finished.");
    renderFixPackStatus();
  }

  function startExam() {
    if (state.exam.timerRef) {
      clearInterval(state.exam.timerRef);
      state.exam.timerRef = null;
    }

    state.exam.mode = byId("examMode").value;
    var blueprint = examBlueprint(state.exam.mode);

    state.exam.questions = blueprint.map(function (subtypeId, idx) {
      var difficulty = state.exam.mode === "A" ? 2 : (idx > 7 ? 3 : 2);
      return generateQuestion(subtypeId, difficulty);
    });

    state.exam.active = true;
    state.exam.index = 0;
    state.exam.correct = 0;
    state.exam.results = [];
    state.exam.selectedChoice = null;
    state.exam.lock = false;
    state.exam.timeLeft = state.exam.mode === "A" ? 25 * 60 : 30 * 60;

    byId("examReport").textContent = "Exam in progress. Work for precision and pace.";

    renderExamTimer();
    renderExamQuestion();

    state.exam.timerRef = setInterval(function () {
      state.exam.timeLeft -= 1;
      renderExamTimer();
      if (state.exam.timeLeft <= 0) {
        finishExam("time");
      }
    }, 1000);

    saveSession();
  }

  function gradeExamResponse(markResult, rawInput) {
    var question = state.exam.questions[state.exam.index];

    state.exam.results.push({
      strand: question.strand,
      subtype: question.subtype,
      correct: markResult.isCorrect
    });

    if (markResult.isCorrect) {
      state.exam.correct += 1;
    }

    updateMastery(question, markResult.isCorrect, rawInput, markResult);
  }

  function submitExam() {
    if (!state.exam.active || state.exam.lock) {
      return;
    }

    var question = state.exam.questions[state.exam.index];
    if (!question) {
      return;
    }

    var response = question.answerMode === "choice" ? state.exam.selectedChoice : byId("examInput").value;
    var markResult = markQuestion(question, response);

    if (!markResult.isValid) {
      setFeedback("examFeedback", "Enter a valid response first.", "bad");
      return;
    }

    gradeExamResponse(markResult, String(response || ""));

    if (markResult.isCorrect) {
      setFeedback("examFeedback", "Correct.", "good");
    } else {
      setFeedback("examFeedback", "Incorrect. Correct answer: " + markResult.canonicalAnswerText, "bad");
    }

    state.exam.lock = true;
    setTimeout(function () {
      state.exam.lock = false;
      state.exam.index += 1;
      if (state.exam.index >= state.exam.questions.length) {
        finishExam("done");
      } else {
        renderExamQuestion();
      }
    }, 550);
  }

  function skipExamQuestion() {
    if (!state.exam.active || state.exam.lock) {
      return;
    }

    var question = state.exam.questions[state.exam.index];
    if (!question) {
      return;
    }

    var markResult = {
      isValid: true,
      isCorrect: false,
      feedbackCode: "skipped",
      canonicalAnswerText: formatCanonicalAnswer(question)
    };

    gradeExamResponse(markResult, "[skipped]");
    setFeedback("examFeedback", "Skipped. Correct answer: " + markResult.canonicalAnswerText, "bad");

    state.exam.lock = true;
    setTimeout(function () {
      state.exam.lock = false;
      state.exam.index += 1;
      if (state.exam.index >= state.exam.questions.length) {
        finishExam("done");
      } else {
        renderExamQuestion();
      }
    }, 480);
  }

  function loadRetryIntoPractice() {
    if (!state.fixPack.length) {
      safeSetText("fixPackStatus", "No retry set yet. Generate one from exam or notebook.");
      activateTab("practice");
      return;
    }

    byId("practiceFocus").value = "fixpack";
    saveSettings();
    activateTab("practice");
    newPracticeQuestion();
  }

  function overallAttemptsAndCorrect() {
    var total = 0;
    var correct = 0;

    SUBTYPE_IDS.forEach(function (id) {
      var stats = subtypeStats(id);
      total += stats.total;
      correct += stats.correct;
    });

    return { total: total, correct: correct };
  }

  function renderFixPackStatus() {
    var label;
    if (!state.fixPack.length) {
      label = "Fix pack not generated yet.";
    } else {
      label = "Fix pack ready with " + state.fixPack.length + " subtype(s): " + state.fixPack.map(function (id) {
        return SUBTYPE_META[id].label;
      }).join(", ") + ".";
    }
    safeSetText("fixPackStatus", label);
  }

  function renderNotebook() {
    var masteryGrid = byId("strandMasteryGrid");
    if (masteryGrid) {
      masteryGrid.innerHTML = "";

      STRANDS.forEach(function (strand) {
        var block = strandStats(strand.id);
        var pct = block.total ? Math.round((block.correct / block.total) * 100) : 0;

        var row = document.createElement("div");
        row.className = "mastery-row";
        row.innerHTML =
          "<strong>" + strand.label + "</strong>" +
          "<div class=\"track\"><div class=\"fill\" style=\"width:" + pct + "%\"></div></div>" +
          "<div class=\"track-label\">" + block.correct + "/" + block.total + " correct (" + pct + "%)</div>";
        masteryGrid.appendChild(row);
      });
    }

    var totals = overallAttemptsAndCorrect();
    if (totals.total === 0) {
      safeSetText("masterySummary", "No graded attempts yet.");
    } else {
      safeSetText("masterySummary", "Total: " + totals.correct + "/" + totals.total + " correct | Enlightenment: " + mastery.enlightenmentScore + "%");
    }

    var errors = byId("errorList");
    if (errors) {
      errors.innerHTML = "";

      if (!mastery.recentErrors.length) {
        var empty = document.createElement("li");
        empty.textContent = "No recent errors. Keep challenging harder levels.";
        errors.appendChild(empty);
      } else {
        mastery.recentErrors.slice(0, 22).forEach(function (entry) {
          var li = document.createElement("li");
          li.textContent =
            "[" + (entry.tag || "general") + "] " +
            (SUBTYPE_META[entry.subtype] ? SUBTYPE_META[entry.subtype].label : entry.subtype) +
            " | Your input: " + entry.userInput + " | Answer: " + entry.answer;
          errors.appendChild(li);
        });
      }
    }

    renderFixPackStatus();
  }

  function generateFixPack() {
    var counts = {};

    mastery.recentErrors.slice(0, 60).forEach(function (entry) {
      if (SUBTYPE_META[entry.subtype]) {
        counts[entry.subtype] = (counts[entry.subtype] || 0) + 1;
      }
    });

    var top = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a];
    }).slice(0, 8);

    if (top.length < 8) {
      var fallback = SUBTYPE_IDS.slice().sort(function (a, b) {
        var sa = subtypeStats(a);
        var sb = subtypeStats(b);
        if (sa.total !== sb.total) {
          return sa.total - sb.total;
        }
        var aa = sa.total ? sa.correct / sa.total : 0;
        var ab = sb.total ? sb.correct / sb.total : 0;
        return aa - ab;
      });

      top = unique(top.concat(fallback)).slice(0, 8);
    }

    state.fixPack = top;
    saveSession();
    renderFixPackStatus();
  }

  function runSmokeTests() {
    var lines = [];

    function test(name, fn) {
      try {
        fn();
        lines.push("PASS: " + name);
      } catch (err) {
        lines.push("FAIL: " + name + " -> " + err.message);
      }
    }

    test("Fraction engine reduce/sign", function () {
      var a = frac(4, -6);
      if (!(a.n === -2 && a.d === 3)) {
        throw new Error("Expected -2/3");
      }
    });

    test("Fraction engine add/sub/mul/div", function () {
      var x = frac(1, 2);
      var y = frac(3, 4);
      if (!equalFrac(addFrac(x, y), frac(5, 4))) {
        throw new Error("Add mismatch");
      }
      if (!equalFrac(subFrac(y, x), frac(1, 4))) {
        throw new Error("Subtract mismatch");
      }
      if (!equalFrac(mulFrac(x, y), frac(3, 8))) {
        throw new Error("Multiply mismatch");
      }
      if (!equalFrac(divFrac(y, x), frac(3, 2))) {
        throw new Error("Divide mismatch");
      }
    });

    test("Input parser accepted forms", function () {
      if (!equalFrac(parseAnswer("3/4").fraction, frac(3, 4))) {
        throw new Error("3/4 parse failed");
      }
      if (!equalFrac(parseAnswer("1 2/3").fraction, frac(5, 3))) {
        throw new Error("mixed parse failed");
      }
      if (!equalFrac(parseAnswer("1_2/3").fraction, frac(5, 3))) {
        throw new Error("underscore mixed parse failed");
      }
      if (!equalFrac(parseAnswer("0.75").fraction, frac(3, 4))) {
        throw new Error("decimal parse failed");
      }
      if (parseAnswer("3//4")) {
        throw new Error("invalid form should fail");
      }
    });

    test("Marking equivalent with simplification nudge", function () {
      var q = makeQuestion("s1_equivalent", 2, {
        prompt: "Simplify 2/4",
        answer: frac(1, 2),
        answerMode: "fraction_simplest",
        methodsA: [],
        methodsB: [],
        methodsC: []
      });
      var mark = markQuestion(q, "2/4");
      if (!mark.isCorrect || mark.feedbackCode !== "equivalent_not_simplest") {
        throw new Error("Expected equivalent_not_simplest");
      }
    });

    test("Adaptive routing picks weakest subtype", function () {
      var demoStats = {
        s1_forms: { correct: 10, total: 10 },
        s1_equivalent: { correct: 0, total: 0 },
        s1_numberline: { correct: 3, total: 10 }
      };
      var pickId = pickWeakSubtypeFromList(["s1_forms", "s1_equivalent", "s1_numberline"], demoStats);
      if (pickId !== "s1_equivalent") {
        throw new Error("Expected unseen subtype to be picked first");
      }
    });

    test("Registry coverage returns valid question", function () {
      SUBTYPE_IDS.forEach(function (id) {
        var q = generateQuestion(id, 2);
        if (!q || q.subtype !== id || !q.prompt || !q.methodsA || !q.methodsB || !q.methodsC) {
          throw new Error("Bad question shape for " + id);
        }
      });
    });

    test("Fullscreen and back controls exist", function () {
      if (!byId("fullscreenToggle")) {
        throw new Error("fullscreenToggle missing");
      }
      var back = document.querySelector("a[href='../index.html']");
      if (!back) {
        throw new Error("Back to Projects link missing");
      }
    });

    test("Session persistence key available", function () {
      saveSession();
      var raw = loadJson(STORAGE_KEYS.session);
      if (!raw) {
        throw new Error("Session did not persist");
      }
    });

    byId("smokeOutput").textContent = lines.join("\n");
  }

  function initTabs() {
    var buttons = document.querySelectorAll(".tab-btn");

    function activate(tab) {
      for (var i = 0; i < buttons.length; i += 1) {
        var btn = buttons[i];
        var isActive = btn.getAttribute("data-tab") === tab;
        btn.classList.toggle("active", isActive);
      }

      var panels = document.querySelectorAll(".panel");
      for (var j = 0; j < panels.length; j += 1) {
        var panel = panels[j];
        panel.classList.toggle("active", panel.getAttribute("data-panel") === tab);
      }
    }

    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].addEventListener("click", function () {
        activate(this.getAttribute("data-tab"));
      });
    }

    activate("guided");
  }

  function activateTab(tabId) {
    var trigger = document.querySelector(".tab-btn[data-tab='" + tabId + "']");
    if (trigger) {
      trigger.click();
    }
  }

  function initFullscreenToggle() {
    var appShell = byId("appShell");
    var toggle = byId("fullscreenToggle");
    var pseudo = false;

    function nativeElement() {
      return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    }

    function updateButton() {
      var on = !!nativeElement() || pseudo;
      toggle.textContent = on ? "Exit Full Screen" : "Enter Full Screen";
      toggle.setAttribute("aria-pressed", on ? "true" : "false");
    }

    function enterPseudo() {
      pseudo = true;
      document.documentElement.classList.add("pseudo-fullscreen");
      document.body.classList.add("pseudo-fullscreen");
      appShell.classList.add("pseudo-fullscreen");
      updateButton();
    }

    function exitPseudo() {
      pseudo = false;
      document.documentElement.classList.remove("pseudo-fullscreen");
      document.body.classList.remove("pseudo-fullscreen");
      appShell.classList.remove("pseudo-fullscreen");
      updateButton();
    }

    function requestNative() {
      if (appShell.requestFullscreen) {
        return appShell.requestFullscreen();
      }
      if (appShell.webkitRequestFullscreen) {
        appShell.webkitRequestFullscreen();
        return Promise.resolve();
      }
      if (appShell.msRequestFullscreen) {
        appShell.msRequestFullscreen();
        return Promise.resolve();
      }
      return Promise.reject(new Error("No native fullscreen"));
    }

    function exitNative() {
      if (document.exitFullscreen) {
        return document.exitFullscreen();
      }
      if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        return Promise.resolve();
      }
      if (document.msExitFullscreen) {
        document.msExitFullscreen();
        return Promise.resolve();
      }
      return Promise.resolve();
    }

    toggle.addEventListener("click", function () {
      if (nativeElement()) {
        exitNative().catch(function () {
          exitPseudo();
        }).finally(updateButton);
        return;
      }

      if (pseudo) {
        exitPseudo();
        return;
      }

      requestNative().then(updateButton).catch(function () {
        enterPseudo();
      });
    });

    document.addEventListener("fullscreenchange", function () {
      if (!document.fullscreenElement && pseudo) {
        exitPseudo();
      }
      updateButton();
    });
    document.addEventListener("webkitfullscreenchange", updateButton);
    document.addEventListener("msfullscreenchange", updateButton);

    updateButton();
  }

  function bindEvents() {
    byId("diagnosticStartBtn").addEventListener("click", startDiagnostic);
    byId("guidedNextBtn").addEventListener("click", nextGuidedStep);
    byId("guidedCheckBtn").addEventListener("click", function () { checkGuided(false); });
    byId("guidedRevealBtn").addEventListener("click", function () { checkGuided(true); });
    byId("guidedHintBtn").addEventListener("click", function () {
      revealHintFor("guided", state.guided.current, {
        get value() { return state.guided.hintLevel; },
        set value(v) { state.guided.hintLevel = v; }
      });
      byId("guidedHintBtn").textContent = "Hint " + Math.min(3, state.guided.hintLevel + 1);
    });
    byId("guidedCapsuleNextBtn").addEventListener("click", function () {
      nextCapsule("guided");
    });

    byId("guidedInput").addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        ev.preventDefault();
        checkGuided(false);
      }
    });

    byId("atlasRegenerateBtn").addEventListener("click", function () {
      if (!state.atlas.subtypeId) {
        return;
      }
      state.atlas.question = generateQuestion(state.atlas.subtypeId, 2);
      renderAtlasDetail();
    });
    byId("atlasCapsuleNextBtn").addEventListener("click", function () {
      nextCapsule("atlas");
    });

    ["opANum", "opADen", "opBNum", "opBDen", "opType", "opModel"].forEach(function (id) {
      byId(id).addEventListener("input", renderOperationsLab);
      byId(id).addEventListener("change", renderOperationsLab);
    });

    var methodButtons = document.querySelectorAll(".method-btn");
    for (var i = 0; i < methodButtons.length; i += 1) {
      methodButtons[i].addEventListener("click", function () {
        state.operations.methodMode = this.getAttribute("data-op-method");
        renderOperationMethodButtons();
        renderOperationsLab();
      });
    }

    byId("algebraNewBtn").addEventListener("click", newAlgebraQuestion);
    byId("algebraCheckBtn").addEventListener("click", function () { checkAlgebra(false); });
    byId("algebraRevealBtn").addEventListener("click", function () { checkAlgebra(true); });
    byId("algebraHintBtn").addEventListener("click", function () {
      revealHintFor("algebra", state.algebra.current, {
        get value() { return state.algebra.hintLevel; },
        set value(v) { state.algebra.hintLevel = v; }
      });
      byId("algebraHintBtn").textContent = "Hint " + Math.min(3, state.algebra.hintLevel + 1);
    });
    byId("algebraStepRevealBtn").addEventListener("click", function () {
      if (!state.algebra.current || !state.algebra.current.lanes) {
        return;
      }
      var maxSteps = Math.max(state.algebra.current.lanes.reverse.length, state.algebra.current.lanes.clear.length);
      state.algebra.revealSteps = Math.min(maxSteps, state.algebra.revealSteps + 1);
      renderAlgebraLanes();
    });
    byId("algebraInput").addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        ev.preventDefault();
        checkAlgebra(false);
      }
    });

    byId("practiceNewBtn").addEventListener("click", newPracticeQuestion);
    byId("practiceCheckBtn").addEventListener("click", function () { checkPractice(false); });
    byId("practiceRevealBtn").addEventListener("click", function () { checkPractice(true); });
    byId("practiceHintBtn").addEventListener("click", function () {
      revealHintFor("practice", state.practice.current, {
        get value() { return state.practice.hintLevel; },
        set value(v) { state.practice.hintLevel = v; }
      });
      byId("practiceHintBtn").textContent = "Hint " + Math.min(3, state.practice.hintLevel + 1);
    });
    byId("practiceCapsuleNextBtn").addEventListener("click", function () {
      nextCapsule("practice");
    });
    byId("practiceInput").addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        ev.preventDefault();
        checkPractice(false);
      }
    });

    byId("practiceFocus").addEventListener("change", function () {
      saveSettings();
      renderFixPackStatus();
    });
    byId("practiceDifficulty").addEventListener("change", saveSettings);

    byId("examStartBtn").addEventListener("click", startExam);
    byId("examSubmitBtn").addEventListener("click", submitExam);
    byId("examSkipBtn").addEventListener("click", skipExamQuestion);
    byId("examLoadRetryBtn").addEventListener("click", loadRetryIntoPractice);
    byId("examMode").addEventListener("change", function () {
      state.exam.mode = byId("examMode").value;
      saveSession();
      renderExamTimer();
    });
    byId("examInput").addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        ev.preventDefault();
        submitExam();
      }
    });

    byId("fixPackBtn").addEventListener("click", generateFixPack);
    byId("loadFixPackBtn").addEventListener("click", function () {
      if (!state.fixPack.length) {
        safeSetText("fixPackStatus", "Generate a fix pack first.");
        return;
      }
      byId("practiceFocus").value = "fixpack";
      saveSettings();
      activateTab("practice");
      newPracticeQuestion();
    });

    byId("runSmokeBtn").addEventListener("click", runSmokeTests);
  }

  var GENERATOR_REGISTRY = {};

  function initGeneratorRegistry() {
    if (typeof window.createSuperFractionGeneratorRegistry !== "function") {
      throw new Error("Generator module is missing. Ensure ./js/generator-registry.js is loaded before app.js.");
    }

    GENERATOR_REGISTRY = window.createSuperFractionGeneratorRegistry({
      makeMixed: makeMixed,
      makeImproper: makeImproper,
      makeProper: makeProper,
      makeQuestion: makeQuestion,
      makeChoiceSet: makeChoiceSet,
      formatFrac: formatFrac,
      frac: frac,
      addFrac: addFrac,
      subFrac: subFrac,
      mulFrac: mulFrac,
      divFrac: divFrac,
      cmpFrac: cmpFrac,
      equalFrac: equalFrac,
      gcd: gcd,
      lcm: lcm,
      randInt: randInt,
      shuffle: shuffle,
      fractionValue: fractionValue
    });
  }

  function initCapsuleEngine() {
    if (typeof window.createSuperFractionCapsuleEngine === "function") {
      capsuleEngine = window.createSuperFractionCapsuleEngine();
    } else {
      capsuleEngine = null;
    }
  }

  function generateQuestion(subtypeId, difficulty) {
    var settings = settingsForDifficulty(difficulty);
    var fn = GENERATOR_REGISTRY[subtypeId];
    if (typeof fn !== "function") {
      throw new Error("Unknown generator subtype: " + subtypeId);
    }
    var question = fn(settings, difficulty);

    if (!question || question.subtype !== subtypeId) {
      throw new Error("Generator mismatch for " + subtypeId);
    }

    if (!question.methodsA || !question.methodsB || !question.methodsC) {
      throw new Error("Teaching depth missing for " + subtypeId);
    }

    if (!question.hints || question.hints.length < 3) {
      question.hints = buildHints(question);
    }

    return question;
  }


  function initStateFromSession() {
    loadSession();

    if (state.guided.inDiagnostic && state.guided.queueIds.length) {
      var subtypeId = state.guided.queueIds[state.guided.index];
      if (subtypeId) {
        state.guided.current = generateQuestion(subtypeId, 2);
      }
    }
  }

  function initialRender() {
    renderStatusStrip();
    renderMilestones();

    renderGuidedQuestion();
    renderAtlas();
    renderAtlasDetail();

    renderOperationMethodButtons();
    renderOperationsLab();

    renderAlgebraQuestion();
    renderPracticeQuestion();
    renderNotebook();

    renderExamTimer();
    safeSetText("examProgress", "Exam not started.");
    safeSetText("examPrompt", "Press \"Start Exam\".");
  }

  function init() {
    loadSettings();
    initGeneratorRegistry();
    initCapsuleEngine();
    initStateFromSession();

    initTabs();
    initFullscreenToggle();
    bindEvents();
    initialRender();

    if (!state.guided.current) {
      if (mastery.diagnosticDone) {
        newGuidedQuestion();
      }
    }

    if (!state.algebra.current) {
      newAlgebraQuestion();
    }

    if (!state.practice.current) {
      newPracticeQuestion();
    }
  }

  init();
})();
