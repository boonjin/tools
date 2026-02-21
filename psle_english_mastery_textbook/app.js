(function () {
  "use strict";

  var data = window.PSLE_ENGLISH_BOOK;
  if (!data || !data.BOOK_META || !data.CHAPTERS || !data.PAGES) {
    return;
  }

  var BOOK_META = data.BOOK_META;
  var CHAPTERS = data.CHAPTERS;
  var PAGES = data.PAGES;
  var WEAK_TAGS = data.WEAK_TAGS || [];
  var TAG_RULES = data.TAG_RULES || {};

  var STORAGE_KEYS = {
    progress: "psle_english_textbook.v1.progress",
    notebook: "psle_english_textbook.v1.notebook",
    settings: "psle_english_textbook.v1.settings"
  };

  var state = {
    currentPage: 1,
    completedPages: {},
    answerLog: {},
    notebook: [],
    settings: {
      lastSearch: ""
    },
    practiceHub: {
      index: 0,
      correct: 0,
      total: 0
    },
    mockExam: {
      running: false,
      questions: [],
      index: 0,
      correct: 0,
      timerSeconds: 900,
      timerId: null,
      lastResult: null
    }
  };

  var dom = {};

  function byId(id) {
    return document.getElementById(id);
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) {
        return fallback;
      }
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      return;
    }
  }

  function hydrateState() {
    var progress = loadJson(STORAGE_KEYS.progress, {});
    var notebook = loadJson(STORAGE_KEYS.notebook, []);
    var settings = loadJson(STORAGE_KEYS.settings, {});

    state.currentPage = clamp(Number(progress.currentPage) || 1, 1, BOOK_META.totalPages);
    state.completedPages = progress.completedPages || {};
    state.answerLog = progress.answerLog || {};

    if (progress.practiceHub) {
      state.practiceHub.index = Number(progress.practiceHub.index) || 0;
      state.practiceHub.correct = Number(progress.practiceHub.correct) || 0;
      state.practiceHub.total = Number(progress.practiceHub.total) || 0;
    }

    state.notebook = Array.isArray(notebook) ? notebook : [];
    state.settings.lastSearch = settings.lastSearch || "";
  }

  function persistProgress() {
    saveJson(STORAGE_KEYS.progress, {
      currentPage: state.currentPage,
      completedPages: state.completedPages,
      answerLog: state.answerLog,
      practiceHub: state.practiceHub
    });
  }

  function persistNotebook() {
    saveJson(STORAGE_KEYS.notebook, state.notebook);
  }

  function persistSettings() {
    saveJson(STORAGE_KEYS.settings, state.settings);
  }

  function chapterByPage(pageNo) {
    for (var i = 0; i < CHAPTERS.length; i += 1) {
      var chapter = CHAPTERS[i];
      if (pageNo >= chapter.startPage && pageNo <= chapter.endPage) {
        return chapter;
      }
    }
    return CHAPTERS[CHAPTERS.length - 1];
  }

  function pageByNumber(pageNo) {
    return PAGES[pageNo - 1];
  }

  function normalizeAnswer(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[.?!]$/, "")
      .replace(/\s+/g, " ");
  }

  function isCorrectAnswer(item, userAnswer) {
    var expected = item.answer;
    if (Array.isArray(expected)) {
      for (var i = 0; i < expected.length; i += 1) {
        if (normalizeAnswer(userAnswer) === normalizeAnswer(expected[i])) {
          return true;
        }
      }
      return false;
    }
    return normalizeAnswer(userAnswer) === normalizeAnswer(expected);
  }

  function getDueBucket() {
    var buckets = ["Today", "3 days", "7 days"];
    return buckets[state.notebook.length % buckets.length];
  }

  function findTagRule(tag) {
    if (tag && TAG_RULES[tag]) {
      return TAG_RULES[tag];
    }
    return TAG_RULES.function_words || {
      recap: "Read the sentence and check grammar clues first."
    };
  }

  function addNotebookEntry(source, page, item, studentAnswer) {
    var tagRule = findTagRule(item.tag);
    var entry = {
      id: Date.now() + "_" + Math.floor(Math.random() * 10000),
      source: source,
      pageNo: page ? page.pageNo : "-",
      pageTitle: page ? page.title : source,
      prompt: item.prompt,
      studentAnswer: String(studentAnswer || "(blank)"),
      correctAnswer: Array.isArray(item.answer) ? item.answer.join(" / ") : String(item.answer),
      fixRule: tagRule.recap,
      dueBucket: getDueBucket(),
      createdAt: new Date().toISOString()
    };

    state.notebook.unshift(entry);
    if (state.notebook.length > 500) {
      state.notebook.length = 500;
    }

    persistNotebook();
    renderNotebook();
    renderSnapshot();
  }

  function answerLogKey(pageNo, itemId) {
    return pageNo + "::" + itemId;
  }

  function updateAnswerLog(pageNo, itemId, isCorrect, userAnswer) {
    var key = answerLogKey(pageNo, itemId);
    var current = state.answerLog[key] || {
      attempts: 0,
      correctCount: 0,
      lastCorrect: false,
      lastAnswer: ""
    };

    current.attempts += 1;
    if (isCorrect) {
      current.correctCount += 1;
    }
    current.lastCorrect = isCorrect;
    current.lastAnswer = String(userAnswer || "");
    state.answerLog[key] = current;
    persistProgress();
  }

  function isPageComplete(page) {
    for (var i = 0; i < page.practiceItems.length; i += 1) {
      var item = page.practiceItems[i];
      var result = state.answerLog[answerLogKey(page.pageNo, item.id)];
      if (!result || !result.lastCorrect) {
        return false;
      }
    }
    return true;
  }

  function updatePageCompletion(page) {
    if (isPageComplete(page)) {
      state.completedPages[String(page.pageNo)] = true;
    } else {
      delete state.completedPages[String(page.pageNo)];
    }
    persistProgress();
    renderSnapshot();
    renderChapterProgress();
    renderToc();
  }

  function makeOptionList(item, name) {
    var wrap = document.createElement("div");
    wrap.className = "option-list";

    for (var i = 0; i < item.options.length; i += 1) {
      var option = item.options[i];
      var id = name + "_" + i;

      var label = document.createElement("label");
      label.className = "option-label";
      label.setAttribute("for", id);

      var input = document.createElement("input");
      input.type = "radio";
      input.name = name;
      input.value = option;
      input.id = id;

      var span = document.createElement("span");
      span.textContent = option;

      label.appendChild(input);
      label.appendChild(span);
      wrap.appendChild(label);
    }

    return wrap;
  }

  function extractUserAnswer(container, item, inputName) {
    if (item.options && item.options.length) {
      var checked = container.querySelector("input[name='" + inputName + "']:checked");
      return checked ? checked.value : "";
    }

    var input = container.querySelector("input[data-role='free-answer']");
    return input ? input.value : "";
  }

  function disableInputs(container) {
    var controls = container.querySelectorAll("input, button");
    for (var i = 0; i < controls.length; i += 1) {
      var control = controls[i];
      if (control.getAttribute("data-keep") === "true") {
        continue;
      }
      control.disabled = true;
    }
  }

  function createInteractiveCard(item, config) {
    var card = document.createElement("article");
    card.className = "practice-item";

    var heading = document.createElement("h4");
    heading.textContent = config.title;
    card.appendChild(heading);

    var prompt = document.createElement("p");
    prompt.className = "prompt";
    prompt.textContent = item.prompt;
    card.appendChild(prompt);

    var inputName = config.inputName;

    if (item.options && item.options.length) {
      card.appendChild(makeOptionList(item, inputName));
    } else {
      var freeInput = document.createElement("input");
      freeInput.type = "text";
      freeInput.setAttribute("data-role", "free-answer");
      freeInput.placeholder = "Type your answer";
      freeInput.autocomplete = "off";
      freeInput.spellcheck = false;
      card.appendChild(freeInput);
    }

    var actionRow = document.createElement("div");
    actionRow.className = "actions-row";

    var checkBtn = document.createElement("button");
    checkBtn.type = "button";
    checkBtn.className = "btn btn-soft";
    checkBtn.textContent = "Check";

    var hintBtn = document.createElement("button");
    hintBtn.type = "button";
    hintBtn.className = "btn btn-soft";
    hintBtn.textContent = "Hint";

    actionRow.appendChild(checkBtn);
    actionRow.appendChild(hintBtn);
    card.appendChild(actionRow);

    var feedback = document.createElement("p");
    feedback.className = "feedback";
    card.appendChild(feedback);

    var hint = document.createElement("p");
    hint.className = "hint-box hidden";
    hint.textContent = "Hint: " + item.hint;
    card.appendChild(hint);

    hintBtn.addEventListener("click", function () {
      hint.classList.toggle("hidden");
    });

    checkBtn.addEventListener("click", function () {
      var userAnswer = extractUserAnswer(card, item, inputName);
      if (!normalizeAnswer(userAnswer)) {
        feedback.className = "feedback bad";
        feedback.textContent = "Please enter or select an answer first.";
        return;
      }

      var correct = isCorrectAnswer(item, userAnswer);
      feedback.className = correct ? "feedback good" : "feedback bad";
      feedback.textContent = correct
        ? "Correct. " + item.explanation
        : "Not yet. " + item.explanation;

      if (typeof config.onCheck === "function") {
        config.onCheck(correct, userAnswer, item, card);
      }
    });

    return card;
  }

  function renderPage(pageNo) {
    var page = pageByNumber(pageNo);
    var chapter = chapterByPage(pageNo);

    state.currentPage = pageNo;
    persistProgress();

    dom.pageCounter.textContent = "Page " + page.pageNo + " of " + BOOK_META.totalPages;
    dom.chapterLabel.textContent = chapter.title;
    dom.pageTitle.textContent = page.title;
    dom.learningGoal.textContent = page.learningGoal;
    dom.teachText.textContent = page.teachText;
    dom.workedPrompt.textContent = page.workedExample.prompt;
    dom.workedAnswer.textContent = page.workedExample.answer;
    dom.commonMistake.textContent = page.commonMistake;
    dom.quickRecap.textContent = page.recap;

    dom.currentPageLabel.textContent = String(page.pageNo);
    dom.pageJumpInput.value = String(page.pageNo);
    dom.chapterSelect.value = chapter.id;

    dom.workedSteps.innerHTML = "";
    for (var i = 0; i < page.workedExample.steps.length; i += 1) {
      var li = document.createElement("li");
      li.textContent = page.workedExample.steps[i];
      dom.workedSteps.appendChild(li);
    }

    dom.practiceItems.innerHTML = "";

    for (var j = 0; j < page.practiceItems.length; j += 1) {
      (function () {
        var item = page.practiceItems[j];
        var inputName = "page_" + page.pageNo + "_" + j;

        var card = createInteractiveCard(item, {
          title: "Try It " + (j === 0 ? "A" : "B"),
          inputName: inputName,
          onCheck: function (correct, userAnswer) {
            updateAnswerLog(page.pageNo, item.id, correct, userAnswer);
            if (!correct) {
              addNotebookEntry("Textbook Page", page, item, userAnswer);
            }
            updatePageCompletion(page);
            updateStatusMessage(page);
          }
        });

        var prior = state.answerLog[answerLogKey(page.pageNo, item.id)];
        if (prior && prior.lastCorrect) {
          var priorFeedback = card.querySelector(".feedback");
          priorFeedback.className = "feedback good";
          priorFeedback.textContent = "Already completed correctly on this page.";
        }

        dom.practiceItems.appendChild(card);
      })();
    }

    updateStatusMessage(page);
    renderSnapshot();
    renderChapterProgress();
    renderToc();
  }

  function updateStatusMessage(page) {
    if (isPageComplete(page)) {
      dom.pageStatusMessage.textContent = "Great work. This page is completed.";
      dom.pageStatusMessage.style.color = "#1e8b4f";
    } else {
      dom.pageStatusMessage.textContent = "Complete both Try It questions to mark this page done.";
      dom.pageStatusMessage.style.color = "#245e45";
    }
  }

  function completedCount() {
    return Object.keys(state.completedPages).length;
  }

  function accuracyStats() {
    var keys = Object.keys(state.answerLog);
    var correct = 0;
    var total = 0;

    for (var i = 0; i < keys.length; i += 1) {
      var row = state.answerLog[keys[i]];
      total += Number(row.attempts || 0);
      correct += Number(row.correctCount || 0);
    }

    return {
      correct: correct,
      total: total,
      percent: total ? Math.round((correct / total) * 100) : 0
    };
  }

  function chapterCompletion(chapter) {
    var done = 0;
    var total = chapter.endPage - chapter.startPage + 1;

    for (var pageNo = chapter.startPage; pageNo <= chapter.endPage; pageNo += 1) {
      if (state.completedPages[String(pageNo)]) {
        done += 1;
      }
    }

    return {
      done: done,
      total: total,
      percent: Math.round((done / total) * 100)
    };
  }

  function renderSnapshot() {
    var stats = accuracyStats();
    dom.completedCount.textContent = String(completedCount());
    dom.totalPagesLabel.textContent = String(BOOK_META.totalPages);
    dom.accuracyLabel.textContent = stats.percent + "%";
    dom.notebookCount.textContent = String(state.notebook.length);
    dom.currentPageLabel.textContent = String(state.currentPage);
  }

  function renderChapterProgress() {
    dom.chapterProgressList.innerHTML = "";

    for (var i = 0; i < CHAPTERS.length; i += 1) {
      var chapter = CHAPTERS[i];
      var info = chapterCompletion(chapter);

      var row = document.createElement("article");
      row.className = "progress-row";

      var meta = document.createElement("div");
      meta.className = "progress-meta";

      var left = document.createElement("span");
      left.textContent = chapter.title;

      var right = document.createElement("span");
      right.textContent = info.done + "/" + info.total + " pages";

      meta.appendChild(left);
      meta.appendChild(right);

      var track = document.createElement("div");
      track.className = "progress-track";

      var fill = document.createElement("div");
      fill.className = "progress-fill";
      fill.style.width = info.percent + "%";

      track.appendChild(fill);
      row.appendChild(meta);
      row.appendChild(track);

      dom.chapterProgressList.appendChild(row);
    }
  }

  function renderNotebook() {
    dom.notebookList.innerHTML = "";
    if (!state.notebook.length) {
      var empty = document.createElement("p");
      empty.textContent = "No entries yet. Wrong answers will appear here with quick fix rules.";
      dom.notebookList.appendChild(empty);
      return;
    }

    for (var i = 0; i < state.notebook.length; i += 1) {
      var entry = state.notebook[i];
      var card = document.createElement("article");
      card.className = "note-card";

      var head = document.createElement("p");
      head.innerHTML = "<strong>Source:</strong> " + entry.source + " | <strong>Revisit:</strong> " + entry.dueBucket;

      var page = document.createElement("p");
      page.innerHTML = "<strong>Page:</strong> " + entry.pageNo + " - " + entry.pageTitle;

      var prompt = document.createElement("p");
      prompt.innerHTML = "<strong>Question:</strong> " + entry.prompt;

      var you = document.createElement("p");
      you.innerHTML = "<strong>Your answer:</strong> " + entry.studentAnswer;

      var correct = document.createElement("p");
      correct.innerHTML = "<strong>Correct answer:</strong> " + entry.correctAnswer;

      var fix = document.createElement("p");
      fix.innerHTML = "<strong>Fix rule:</strong> " + entry.fixRule;

      card.appendChild(head);
      card.appendChild(page);
      card.appendChild(prompt);
      card.appendChild(you);
      card.appendChild(correct);
      card.appendChild(fix);

      dom.notebookList.appendChild(card);
    }
  }

  function renderToc() {
    dom.tocList.innerHTML = "";

    for (var i = 0; i < CHAPTERS.length; i += 1) {
      var chapter = CHAPTERS[i];
      var info = chapterCompletion(chapter);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "toc-btn";
      btn.textContent = chapter.title + " (" + chapter.startPage + "-" + chapter.endPage + ") - " + info.percent + "%";
      if (state.currentPage >= chapter.startPage && state.currentPage <= chapter.endPage) {
        btn.classList.add("active");
      }

      (function (targetPage) {
        btn.addEventListener("click", function () {
          goToPage(targetPage);
          closeDrawer();
        });
      })(chapter.startPage);

      dom.tocList.appendChild(btn);
    }
  }

  function populateChapterSelect() {
    dom.chapterSelect.innerHTML = "";
    for (var i = 0; i < CHAPTERS.length; i += 1) {
      var chapter = CHAPTERS[i];
      var option = document.createElement("option");
      option.value = chapter.id;
      option.textContent = chapter.title + " (" + chapter.startPage + "-" + chapter.endPage + ")";
      dom.chapterSelect.appendChild(option);
    }
  }

  function goToPage(pageNo) {
    var target = clamp(Number(pageNo) || 1, 1, BOOK_META.totalPages);
    renderPage(target);
  }

  function searchPages(term) {
    var query = normalizeAnswer(term);
    if (!query) {
      return null;
    }

    var maybeNumber = Number(query);
    if (!Number.isNaN(maybeNumber) && maybeNumber >= 1 && maybeNumber <= BOOK_META.totalPages) {
      return pageByNumber(maybeNumber);
    }

    for (var i = 0; i < PAGES.length; i += 1) {
      var page = PAGES[i];
      var haystack = [
        page.title,
        page.learningGoal,
        page.teachText,
        page.commonMistake,
        page.recap,
        (page.tags || []).join(" ")
      ].join(" ").toLowerCase();
      if (haystack.indexOf(query) !== -1) {
        return page;
      }
    }

    return null;
  }

  function runSearch() {
    var term = dom.searchInput.value;
    state.settings.lastSearch = term;
    persistSettings();

    var result = searchPages(term);
    if (!result) {
      dom.pageStatusMessage.textContent = "No page found for: " + term;
      dom.pageStatusMessage.style.color = "#c74242";
      return;
    }

    goToPage(result.pageNo);
    dom.pageStatusMessage.textContent = "Found match on page " + result.pageNo + ".";
    dom.pageStatusMessage.style.color = "#1e8b4f";
  }

  function buildHubQuestion() {
    var targetTag = WEAK_TAGS[state.practiceHub.index % WEAK_TAGS.length];
    var seed = state.practiceHub.index * 13 + 7;

    for (var i = 0; i < PAGES.length; i += 1) {
      var page = PAGES[(seed + i) % PAGES.length];
      for (var j = 0; j < page.practiceItems.length; j += 1) {
        var item = page.practiceItems[j];
        if (item.tag === targetTag) {
          var copy = deepClone(item);
          copy.id = "hub_" + state.practiceHub.index + "_" + item.id;
          copy.originPageNo = page.pageNo;
          copy.originPageTitle = page.title;
          return copy;
        }
      }
    }

    var fallbackItem = deepClone(PAGES[seed % PAGES.length].practiceItems[0]);
    fallbackItem.id = "hub_" + state.practiceHub.index + "_fallback";
    fallbackItem.originPageNo = PAGES[seed % PAGES.length].pageNo;
    fallbackItem.originPageTitle = PAGES[seed % PAGES.length].title;
    return fallbackItem;
  }

  function renderHubQuestion() {
    state.practiceHub.index += 1;
    persistProgress();

    var item = buildHubQuestion();
    dom.hubQuestionWrap.innerHTML = "";

    var card = createInteractiveCard(item, {
      title: "Mixed Drill",
      inputName: "hub_input_" + item.id,
      onCheck: function (correct, userAnswer) {
        state.practiceHub.total += 1;
        if (correct) {
          state.practiceHub.correct += 1;
        } else {
          addNotebookEntry("Practice Hub", {
            pageNo: item.originPageNo,
            title: item.originPageTitle
          }, item, userAnswer);
        }
        persistProgress();

        var score = state.practiceHub.total
          ? Math.round((state.practiceHub.correct / state.practiceHub.total) * 100)
          : 0;

        dom.hubStatus.textContent = "Hub score: " + state.practiceHub.correct + "/" + state.practiceHub.total + " (" + score + "%).";
      }
    });

    dom.hubQuestionWrap.appendChild(card);
  }

  function formatTime(seconds) {
    var safe = Math.max(0, seconds);
    var min = Math.floor(safe / 60);
    var sec = safe % 60;
    return String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  }

  function stopMockTimer() {
    if (state.mockExam.timerId) {
      clearInterval(state.mockExam.timerId);
      state.mockExam.timerId = null;
    }
  }

  function buildMockQuestions() {
    var questions = [];
    for (var i = 0; i < 10; i += 1) {
      var tag = WEAK_TAGS[i % WEAK_TAGS.length];
      var seed = i * 19 + 3;

      for (var p = 0; p < PAGES.length; p += 1) {
        var page = PAGES[(seed + p) % PAGES.length];
        for (var k = 0; k < page.practiceItems.length; k += 1) {
          var item = page.practiceItems[k];
          if (item.tag === tag) {
            var copy = deepClone(item);
            copy.id = "mock_" + i + "_" + copy.id;
            copy.originPageNo = page.pageNo;
            copy.originPageTitle = page.title;
            questions.push(copy);
            p = PAGES.length;
            break;
          }
        }
      }
    }
    return questions;
  }

  function finishMock(message) {
    stopMockTimer();
    state.mockExam.running = false;

    var scoreLine = "Mock score: " + state.mockExam.correct + "/" + state.mockExam.questions.length + ".";
    dom.mockStatus.textContent = message ? message + " " + scoreLine : scoreLine;
    dom.mockQuestionWrap.innerHTML = "";
  }

  function renderMockQuestion() {
    if (!state.mockExam.running) {
      return;
    }

    if (state.mockExam.index >= state.mockExam.questions.length) {
      finishMock("Mock completed.");
      return;
    }

    var item = state.mockExam.questions[state.mockExam.index];
    dom.mockQuestionWrap.innerHTML = "";

    var card = document.createElement("article");
    card.className = "practice-item";

    var heading = document.createElement("h4");
    heading.textContent = "Question " + (state.mockExam.index + 1) + " of " + state.mockExam.questions.length;
    card.appendChild(heading);

    var prompt = document.createElement("p");
    prompt.className = "prompt";
    prompt.textContent = item.prompt;
    card.appendChild(prompt);

    var inputName = "mock_input_" + state.mockExam.index;

    if (item.options && item.options.length) {
      card.appendChild(makeOptionList(item, inputName));
    } else {
      var freeInput = document.createElement("input");
      freeInput.type = "text";
      freeInput.setAttribute("data-role", "free-answer");
      freeInput.placeholder = "Type your answer";
      freeInput.autocomplete = "off";
      freeInput.spellcheck = false;
      card.appendChild(freeInput);
    }

    var actions = document.createElement("div");
    actions.className = "actions-row";

    var submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.className = "btn btn-primary";
    submitBtn.textContent = "Submit";

    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "btn btn-soft";
    nextBtn.textContent = state.mockExam.index === state.mockExam.questions.length - 1 ? "Finish" : "Next";
    nextBtn.disabled = true;

    var hintBtn = document.createElement("button");
    hintBtn.type = "button";
    hintBtn.className = "btn btn-soft";
    hintBtn.textContent = "Hint";

    actions.appendChild(submitBtn);
    actions.appendChild(nextBtn);
    actions.appendChild(hintBtn);
    card.appendChild(actions);

    var feedback = document.createElement("p");
    feedback.className = "feedback";
    card.appendChild(feedback);

    var hint = document.createElement("p");
    hint.className = "hint-box hidden";
    hint.textContent = "Hint: " + item.hint;
    card.appendChild(hint);

    hintBtn.addEventListener("click", function () {
      hint.classList.toggle("hidden");
    });

    submitBtn.addEventListener("click", function () {
      var userAnswer = extractUserAnswer(card, item, inputName);
      if (!normalizeAnswer(userAnswer)) {
        feedback.className = "feedback bad";
        feedback.textContent = "Please enter or select an answer first.";
        return;
      }

      var correct = isCorrectAnswer(item, userAnswer);
      if (correct) {
        state.mockExam.correct += 1;
      } else {
        addNotebookEntry("Mock Exam", {
          pageNo: item.originPageNo,
          title: item.originPageTitle
        }, item, userAnswer);
      }

      state.mockExam.lastResult = {
        answered: true
      };

      feedback.className = correct ? "feedback good" : "feedback bad";
      feedback.textContent = (correct ? "Correct. " : "Not correct. ") + item.explanation;

      disableInputs(card);
      nextBtn.disabled = false;
      nextBtn.setAttribute("data-keep", "true");
      nextBtn.disabled = false;
    });

    nextBtn.addEventListener("click", function () {
      state.mockExam.index += 1;
      renderMockQuestion();
    });

    dom.mockQuestionWrap.appendChild(card);
    dom.mockStatus.textContent = "Current score: " + state.mockExam.correct + "/" + state.mockExam.questions.length + ".";
  }

  function startMockExam() {
    stopMockTimer();

    state.mockExam.running = true;
    state.mockExam.questions = buildMockQuestions();
    state.mockExam.index = 0;
    state.mockExam.correct = 0;
    state.mockExam.timerSeconds = 900;

    dom.mockTimer.textContent = formatTime(state.mockExam.timerSeconds);

    state.mockExam.timerId = setInterval(function () {
      state.mockExam.timerSeconds -= 1;
      dom.mockTimer.textContent = formatTime(state.mockExam.timerSeconds);
      if (state.mockExam.timerSeconds <= 0) {
        finishMock("Time is up.");
      }
    }, 1000);

    renderMockQuestion();
  }

  function onQuickLinkClick(event) {
    var target = event.target.getAttribute("data-target");
    if (!target) {
      return;
    }

    var node = byId(target);
    if (!node) {
      return;
    }

    node.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openDrawer() {
    dom.appShell.classList.add("drawer-open");
    dom.drawerToggle.setAttribute("aria-expanded", "true");
    dom.drawerOverlay.hidden = false;
  }

  function closeDrawer() {
    dom.appShell.classList.remove("drawer-open");
    dom.drawerToggle.setAttribute("aria-expanded", "false");
    dom.drawerOverlay.hidden = true;
  }

  function toggleDrawer() {
    if (dom.appShell.classList.contains("drawer-open")) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  function initFullscreenToggle() {
    var appShell = dom.appShell;
    var toggle = dom.fullscreenToggle;
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
    dom.chapterSelect.addEventListener("change", function () {
      var selectedId = dom.chapterSelect.value;
      for (var i = 0; i < CHAPTERS.length; i += 1) {
        if (CHAPTERS[i].id === selectedId) {
          goToPage(CHAPTERS[i].startPage);
          return;
        }
      }
    });

    dom.pageJumpBtn.addEventListener("click", function () {
      goToPage(Number(dom.pageJumpInput.value));
    });

    dom.pageJumpInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        goToPage(Number(dom.pageJumpInput.value));
      }
    });

    dom.prevPageBtn.addEventListener("click", function () {
      goToPage(state.currentPage - 1);
    });

    dom.nextPageBtn.addEventListener("click", function () {
      goToPage(state.currentPage + 1);
    });

    dom.searchBtn.addEventListener("click", runSearch);
    dom.searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        runSearch();
      }
    });

    dom.quickLinks.addEventListener("click", onQuickLinkClick);

    dom.hubNextBtn.addEventListener("click", renderHubQuestion);
    dom.mockStartBtn.addEventListener("click", startMockExam);

    dom.clearNotebookBtn.addEventListener("click", function () {
      state.notebook = [];
      persistNotebook();
      renderNotebook();
      renderSnapshot();
    });

    dom.drawerToggle.addEventListener("click", toggleDrawer);
    dom.drawerOverlay.addEventListener("click", closeDrawer);

    window.addEventListener("resize", function () {
      if (window.innerWidth > 840) {
        closeDrawer();
      }
    });
  }

  function cacheDom() {
    dom.appShell = byId("appShell");
    dom.fullscreenToggle = byId("fullscreenToggle");
    dom.chapterSelect = byId("chapterSelect");
    dom.pageJumpInput = byId("pageJumpInput");
    dom.pageJumpBtn = byId("pageJumpBtn");
    dom.prevPageBtn = byId("prevPageBtn");
    dom.nextPageBtn = byId("nextPageBtn");
    dom.searchInput = byId("searchInput");
    dom.searchBtn = byId("searchBtn");
    dom.quickLinks = document.querySelector(".quick-links");
    dom.tocList = byId("tocList");

    dom.pageCounter = byId("pageCounter");
    dom.chapterLabel = byId("chapterLabel");
    dom.pageTitle = byId("pageTitle");
    dom.learningGoal = byId("learningGoal");
    dom.teachText = byId("teachText");
    dom.workedPrompt = byId("workedPrompt");
    dom.workedSteps = byId("workedSteps");
    dom.workedAnswer = byId("workedAnswer");
    dom.practiceItems = byId("practiceItems");
    dom.commonMistake = byId("commonMistake");
    dom.quickRecap = byId("quickRecap");
    dom.pageStatusMessage = byId("pageStatusMessage");

    dom.completedCount = byId("completedCount");
    dom.totalPagesLabel = byId("totalPagesLabel");
    dom.accuracyLabel = byId("accuracyLabel");
    dom.notebookCount = byId("notebookCount");
    dom.currentPageLabel = byId("currentPageLabel");

    dom.hubNextBtn = byId("hubNextBtn");
    dom.hubQuestionWrap = byId("hubQuestionWrap");
    dom.hubStatus = byId("hubStatus");

    dom.mockStartBtn = byId("mockStartBtn");
    dom.mockTimer = byId("mockTimer");
    dom.mockQuestionWrap = byId("mockQuestionWrap");
    dom.mockStatus = byId("mockStatus");

    dom.clearNotebookBtn = byId("clearNotebookBtn");
    dom.notebookList = byId("notebookList");
    dom.chapterProgressList = byId("chapterProgressList");

    dom.drawerToggle = byId("drawerToggle");
    dom.drawerOverlay = byId("drawerOverlay");
    dom.smokeStatus = byId("smokeStatus");
  }

  function runSmokeChecks() {
    var lines = [];

    function test(name, fn) {
      try {
        fn();
        lines.push("PASS: " + name);
      } catch (error) {
        lines.push("FAIL: " + name + " -> " + error.message);
      }
    }

    test("220 pages exist", function () {
      if (PAGES.length !== 220) {
        throw new Error("Expected 220 pages, got " + PAGES.length);
      }
    });

    test("Page numbers are contiguous", function () {
      for (var i = 0; i < PAGES.length; i += 1) {
        if (PAGES[i].pageNo !== i + 1) {
          throw new Error("Gap at index " + i);
        }
      }
    });

    test("Each page has minimum 2 practice items", function () {
      for (var i = 0; i < PAGES.length; i += 1) {
        if (!PAGES[i].practiceItems || PAGES[i].practiceItems.length < 2) {
          throw new Error("Practice items missing on page " + PAGES[i].pageNo);
        }
      }
    });

    test("Fullscreen and back button exist", function () {
      if (!byId("fullscreenToggle")) {
        throw new Error("fullscreenToggle missing");
      }
      if (!document.querySelector("a[href='../index.html']")) {
        throw new Error("Back to Projects missing");
      }
    });

    var failed = lines.some(function (line) {
      return line.indexOf("FAIL") === 0;
    });

    dom.smokeStatus.textContent = failed
      ? "Smoke checks: issues found. " + lines.join(" | ")
      : "Smoke checks passed. " + lines.join(" | ");
  }

  function init() {
    hydrateState();
    cacheDom();
    populateChapterSelect();
    bindEvents();
    initFullscreenToggle();

    dom.searchInput.value = state.settings.lastSearch || "";

    renderNotebook();
    renderSnapshot();
    renderChapterProgress();
    renderToc();
    goToPage(state.currentPage);

    runSmokeChecks();
  }

  init();
})();
