(function () {
  "use strict";

  var data = window.PSLE_ENGLISH_BOOK;
  if (!data || !data.BOOK_META || !data.CHAPTERS || !data.PAGES) {
    return;
  }

  var BOOK_META = data.BOOK_META;
  var CHAPTERS = data.CHAPTERS;
  var PAGES = data.PAGES;
  var STORAGE_KEY = "psle_english_textbook.v1.ebook";

  var state = {
    currentPage: 1,
    view: "directory",
    fontSize: 1.08
  };

  var dom = {};

  function byId(id) {
    return document.getElementById(id);
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      var parsed = JSON.parse(raw);
      state.currentPage = clamp(Number(parsed.currentPage) || 1, 1, BOOK_META.totalPages);
      state.view = parsed.view === "reader" ? "reader" : "directory";
      state.fontSize = clamp(Number(parsed.fontSize) || 1.08, 0.92, 1.45);
    } catch (error) {
      return;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentPage: state.currentPage,
        view: state.view,
        fontSize: state.fontSize
      }));
    } catch (error) {
      return;
    }
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

  function pageByNo(pageNo) {
    return PAGES[pageNo - 1];
  }

  function setStatus(text) {
    dom.statusLine.textContent = text;
  }

  function setView(view) {
    state.view = view;
    if (view === "reader") {
      dom.directoryView.classList.add("hidden");
      dom.readerView.classList.remove("hidden");
    } else {
      dom.readerView.classList.add("hidden");
      dom.directoryView.classList.remove("hidden");
    }
    saveState();
  }

  function applyFontSize() {
    dom.readerPage.style.setProperty("--reader-size", state.fontSize.toFixed(2) + "rem");
    saveState();
  }

  function renderWorkedExamples(page) {
    dom.workedExamples.innerHTML = "";
    var examples = page.workedExamples || [];

    for (var i = 0; i < examples.length; i += 1) {
      var ex = examples[i];
      var card = document.createElement("article");
      card.className = "worked-card";

      var head = document.createElement("h4");
      head.textContent = "Example " + String.fromCharCode(65 + (i % 26));
      card.appendChild(head);

      var prompt = document.createElement("p");
      prompt.textContent = ex.prompt;
      card.appendChild(prompt);

      var steps = document.createElement("ol");
      for (var j = 0; j < ex.steps.length; j += 1) {
        var li = document.createElement("li");
        li.textContent = ex.steps[j];
        steps.appendChild(li);
      }
      card.appendChild(steps);

      var ans = document.createElement("p");
      ans.className = "worked-answer";
      ans.textContent = "Answer: " + ex.answer;
      card.appendChild(ans);

      dom.workedExamples.appendChild(card);
    }
  }

  function renderRevisionPrompts(page) {
    dom.revisionList.innerHTML = "";
    var items = page.practiceItems || [];

    for (var i = 0; i < items.length; i += 1) {
      var li = document.createElement("li");
      li.textContent = items[i].prompt;
      dom.revisionList.appendChild(li);
    }
  }

  function renderReader() {
    var page = pageByNo(state.currentPage);
    var chapter = chapterByPage(state.currentPage);

    dom.pageCounter.textContent = "Page " + page.pageNo + " of " + BOOK_META.totalPages;
    dom.chapterLabel.textContent = chapter.title;
    dom.pageTitle.textContent = page.title;
    dom.learningGoal.textContent = page.learningGoal;
    dom.teachText.textContent = page.teachText;
    dom.commonMistake.textContent = page.commonMistake;
    dom.quickRecap.textContent = page.recap;
    dom.pageInput.value = String(page.pageNo);
    dom.chapterSelect.value = chapter.id;

    renderWorkedExamples(page);
    renderRevisionPrompts(page);

    setStatus("Showing page " + page.pageNo + ". Swipe left/right to turn pages.");
    saveState();
  }

  function goToPage(pageNo) {
    state.currentPage = clamp(Number(pageNo) || 1, 1, BOOK_META.totalPages);
    renderReader();
  }

  function nextPage() {
    goToPage(state.currentPage + 1);
  }

  function prevPage() {
    goToPage(state.currentPage - 1);
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

  function buildChapterCard(chapter) {
    var card = document.createElement("article");
    card.className = "chapter-card";

    var title = document.createElement("h3");
    title.textContent = chapter.title;
    card.appendChild(title);

    var pages = document.createElement("p");
    pages.textContent = "Pages " + chapter.startPage + " to " + chapter.endPage;
    card.appendChild(pages);

    var actions = document.createElement("div");
    actions.className = "actions";

    var startBtn = document.createElement("button");
    startBtn.type = "button";
    startBtn.className = "btn btn-soft";
    startBtn.textContent = "Open Start";
    startBtn.addEventListener("click", function () {
      goToPage(chapter.startPage);
      setView("reader");
    });

    var mid = Math.floor((chapter.startPage + chapter.endPage) / 2);
    var midBtn = document.createElement("button");
    midBtn.type = "button";
    midBtn.className = "btn btn-soft";
    midBtn.textContent = "Open Middle";
    midBtn.addEventListener("click", function () {
      goToPage(mid);
      setView("reader");
    });

    actions.appendChild(startBtn);
    actions.appendChild(midBtn);
    card.appendChild(actions);

    return card;
  }

  function renderDirectory() {
    dom.chapterGrid.innerHTML = "";
    for (var i = 0; i < CHAPTERS.length; i += 1) {
      dom.chapterGrid.appendChild(buildChapterCard(CHAPTERS[i]));
    }

    dom.continueReadingBtn.textContent = "Continue From Page " + state.currentPage;
  }

  function initSwipe() {
    var touchStartX = null;
    var touchStartY = null;

    dom.readerPage.addEventListener("touchstart", function (event) {
      if (!event.touches || !event.touches.length) {
        return;
      }
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, { passive: true });

    dom.readerPage.addEventListener("touchend", function (event) {
      if (touchStartX === null || touchStartY === null || !event.changedTouches || !event.changedTouches.length) {
        return;
      }

      var endX = event.changedTouches[0].clientX;
      var endY = event.changedTouches[0].clientY;
      var dx = endX - touchStartX;
      var dy = endY - touchStartY;

      touchStartX = null;
      touchStartY = null;

      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) {
        return;
      }

      if (dx < 0) {
        nextPage();
      } else {
        prevPage();
      }
    }, { passive: true });
  }

  function initFullscreenToggle() {
    var shell = dom.ebookShell;
    var toggle = dom.fullscreenToggle;
    var pseudo = false;

    function nativeElement() {
      return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    }

    function updateButton() {
      var active = !!nativeElement() || pseudo;
      toggle.textContent = active ? "Exit Full Screen" : "Enter Full Screen";
      toggle.setAttribute("aria-pressed", active ? "true" : "false");
    }

    function enterPseudo() {
      pseudo = true;
      document.documentElement.classList.add("pseudo-fullscreen");
      document.body.classList.add("pseudo-fullscreen");
      shell.classList.add("pseudo-fullscreen");
      updateButton();
    }

    function exitPseudo() {
      pseudo = false;
      document.documentElement.classList.remove("pseudo-fullscreen");
      document.body.classList.remove("pseudo-fullscreen");
      shell.classList.remove("pseudo-fullscreen");
      updateButton();
    }

    function requestNative() {
      if (shell.requestFullscreen) {
        return shell.requestFullscreen();
      }
      if (shell.webkitRequestFullscreen) {
        shell.webkitRequestFullscreen();
        return Promise.resolve();
      }
      if (shell.msRequestFullscreen) {
        shell.msRequestFullscreen();
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
    dom.directoryBtn.addEventListener("click", function () {
      renderDirectory();
      setView("directory");
      setStatus("Directory open. Choose a chapter to start.");
    });

    dom.readerBtn.addEventListener("click", function () {
      setView("reader");
      renderReader();
    });

    dom.startReadingBtn.addEventListener("click", function () {
      goToPage(1);
      setView("reader");
    });

    dom.continueReadingBtn.addEventListener("click", function () {
      setView("reader");
      renderReader();
    });

    dom.chapterSelect.addEventListener("change", function () {
      var id = dom.chapterSelect.value;
      for (var i = 0; i < CHAPTERS.length; i += 1) {
        if (CHAPTERS[i].id === id) {
          goToPage(CHAPTERS[i].startPage);
          setView("reader");
          return;
        }
      }
    });

    dom.goPageBtn.addEventListener("click", function () {
      goToPage(dom.pageInput.value);
      setView("reader");
    });

    dom.pageInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        goToPage(dom.pageInput.value);
        setView("reader");
      }
    });

    dom.prevPageBtn.addEventListener("click", function () {
      prevPage();
      setView("reader");
    });

    dom.nextPageBtn.addEventListener("click", function () {
      nextPage();
      setView("reader");
    });

    dom.bottomPrevBtn.addEventListener("click", prevPage);
    dom.bottomNextBtn.addEventListener("click", nextPage);

    dom.fontDownBtn.addEventListener("click", function () {
      state.fontSize = clamp(state.fontSize - 0.05, 0.92, 1.45);
      applyFontSize();
      setStatus("Text size updated.");
    });

    dom.fontUpBtn.addEventListener("click", function () {
      state.fontSize = clamp(state.fontSize + 0.05, 0.92, 1.45);
      applyFontSize();
      setStatus("Text size updated.");
    });

    document.addEventListener("keydown", function (event) {
      if (state.view !== "reader") {
        return;
      }
      if (event.key === "ArrowRight") {
        nextPage();
      }
      if (event.key === "ArrowLeft") {
        prevPage();
      }
    });
  }

  function runSmokeChecks() {
    var checks = [];

    function test(name, fn) {
      try {
        fn();
        checks.push("PASS: " + name);
      } catch (error) {
        checks.push("FAIL: " + name + " -> " + error.message);
      }
    }

    test("Book data available", function () {
      if (PAGES.length !== BOOK_META.totalPages) {
        throw new Error("Expected " + BOOK_META.totalPages + " pages, got " + PAGES.length);
      }
    });

    test("Directory controls exist", function () {
      if (!dom.chapterGrid || !dom.directoryBtn) {
        throw new Error("Directory controls missing");
      }
    });

    test("Fullscreen and back controls exist", function () {
      if (!dom.fullscreenToggle) {
        throw new Error("fullscreenToggle missing");
      }
      if (!document.querySelector("a[href='../index.html']")) {
        throw new Error("Back to Projects link missing");
      }
    });

    test("Worked examples on all pages", function () {
      for (var i = 0; i < PAGES.length; i += 1) {
        if (!PAGES[i].workedExamples || PAGES[i].workedExamples.length < 3) {
          throw new Error("Worked examples missing on page " + PAGES[i].pageNo);
        }
      }
    });

    dom.statusLine.textContent = checks.join(" | ");
  }

  function cacheDom() {
    dom.ebookShell = byId("ebookShell");
    dom.fullscreenToggle = byId("fullscreenToggle");

    dom.directoryBtn = byId("directoryBtn");
    dom.readerBtn = byId("readerBtn");
    dom.chapterSelect = byId("chapterSelect");
    dom.pageInput = byId("pageInput");
    dom.goPageBtn = byId("goPageBtn");
    dom.prevPageBtn = byId("prevPageBtn");
    dom.nextPageBtn = byId("nextPageBtn");
    dom.fontDownBtn = byId("fontDownBtn");
    dom.fontUpBtn = byId("fontUpBtn");

    dom.directoryView = byId("directoryView");
    dom.readerView = byId("readerView");
    dom.chapterGrid = byId("chapterGrid");
    dom.startReadingBtn = byId("startReadingBtn");
    dom.continueReadingBtn = byId("continueReadingBtn");

    dom.readerPage = byId("readerPage");
    dom.pageCounter = byId("pageCounter");
    dom.chapterLabel = byId("chapterLabel");
    dom.pageTitle = byId("pageTitle");
    dom.learningGoal = byId("learningGoal");
    dom.teachText = byId("teachText");
    dom.workedExamples = byId("workedExamples");
    dom.revisionList = byId("revisionList");
    dom.commonMistake = byId("commonMistake");
    dom.quickRecap = byId("quickRecap");

    dom.bottomPrevBtn = byId("bottomPrevBtn");
    dom.bottomNextBtn = byId("bottomNextBtn");
    dom.statusLine = byId("statusLine");
  }

  function init() {
    loadState();
    cacheDom();
    populateChapterSelect();
    bindEvents();
    initSwipe();
    initFullscreenToggle();

    dom.pageInput.setAttribute("max", String(BOOK_META.totalPages));

    applyFontSize();
    renderDirectory();
    renderReader();
    setView(state.view);
    runSmokeChecks();
  }

  init();
})();
