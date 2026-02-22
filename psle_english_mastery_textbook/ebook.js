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
  var KEY_TERMS = [
    "past perfect",
    "subject-verb agreement",
    "subject",
    "verb",
    "connector",
    "contrast",
    "condition",
    "collocation",
    "phrasal verb",
    "article",
    "preposition",
    "timeline",
    "check",
    "answer",
    "strategy",
    "revision"
  ];

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

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function emphasizeKeyTerms(text) {
    var safe = escapeHtml(text);
    var sorted = KEY_TERMS.slice().sort(function (a, b) {
      return b.length - a.length;
    });
    var pattern = new RegExp("\\b(" + sorted.map(escapeRegExp).join("|") + ")\\b", "gi");
    return safe.replace(pattern, function (match) {
      return "<strong class='term'>" + match + "</strong>";
    });
  }

  function createParagraph(text, klass, rich) {
    var p = document.createElement("p");
    if (klass) {
      p.className = klass;
    }
    if (rich) {
      p.innerHTML = text;
    } else {
      p.textContent = text;
    }
    return p;
  }

  function createLabeledParagraph(label, text, klass) {
    var html = "<strong class='label'>" + escapeHtml(label) + ":</strong> " + emphasizeKeyTerms(text);
    return createParagraph(html, klass, true);
  }

  function createStepsParagraph(steps, klass) {
    var segments = [];
    for (var i = 0; i < steps.length; i += 1) {
      segments.push("<strong class='label'>Step " + (i + 1) + ".</strong> " + emphasizeKeyTerms(steps[i]));
    }
    return createParagraph(segments.join(" "), klass, true);
  }

  function addLinearWorkedExamples(page, target) {
    var examples = page.workedExamples || [];
    for (var i = 0; i < examples.length; i += 1) {
      var ex = examples[i];
      var exampleLabel = "Worked Example " + String.fromCharCode(65 + (i % 26));
      target.appendChild(createLabeledParagraph(exampleLabel, ex.prompt, "example-line"));
      target.appendChild(createStepsParagraph(ex.steps, "steps-line"));
      target.appendChild(createLabeledParagraph("Answer", ex.answer, "answer-line"));
    }
  }

  function addRevisionPrompts(page, target) {
    var items = page.practiceItems || [];
    if (!items.length) {
      return;
    }

    target.appendChild(createParagraph("<strong class='label'>Quick Revision Prompts:</strong>", "section-line", true));
    for (var i = 0; i < items.length; i += 1) {
      target.appendChild(createLabeledParagraph("Prompt " + (i + 1), items[i].prompt, "prompt-line"));
    }
  }

  function renderReader() {
    var page = pageByNo(state.currentPage);
    var chapter = chapterByPage(state.currentPage);

    dom.pageMeta.textContent = "Page " + page.pageNo + " of " + BOOK_META.totalPages + " | " + chapter.title;
    dom.pageTitle.textContent = page.title;
    dom.pageInput.value = String(page.pageNo);
    dom.chapterSelect.value = chapter.id;

    dom.bookParagraphs.innerHTML = "";

    dom.bookParagraphs.appendChild(createParagraph("<strong class='label'>Focus Skills:</strong> " + emphasizeKeyTerms((page.tags || []).join(", ")), "section-line", true));
    dom.bookParagraphs.appendChild(createLabeledParagraph("Learning Goal", page.learningGoal, "section-line"));
    dom.bookParagraphs.appendChild(createParagraph(emphasizeKeyTerms(page.teachText), "reading-para", true));

    addLinearWorkedExamples(page, dom.bookParagraphs);
    addRevisionPrompts(page, dom.bookParagraphs);

    dom.bookParagraphs.appendChild(createLabeledParagraph("Common Mistake", page.commonMistake, "section-line"));
    dom.bookParagraphs.appendChild(createLabeledParagraph("Remember This", page.recap, "section-line"));

    setStatus("Reading page " + page.pageNo + ". Use Previous/Next for linear reading.");
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

  function renderDirectory() {
    dom.directoryList.innerHTML = "";

    for (var i = 0; i < CHAPTERS.length; i += 1) {
      (function () {
        var chapter = CHAPTERS[i];
        var li = document.createElement("li");
        var button = document.createElement("button");
        button.type = "button";
        button.className = "btn directory-item";
        button.textContent = "Chapter " + (i + 1) + ": " + chapter.title + " (Pages " + chapter.startPage + "-" + chapter.endPage + ")";
        button.addEventListener("click", function () {
          goToPage(chapter.startPage);
          setView("reader");
        });
        li.appendChild(button);
        dom.directoryList.appendChild(li);
      })();
    }

    dom.continueReadingBtn.textContent = "Continue From Page " + state.currentPage;
  }

  function initSwipe() {
    var startX = null;
    var startY = null;

    dom.readerPage.addEventListener("touchstart", function (event) {
      if (!event.touches || !event.touches.length) {
        return;
      }
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    }, { passive: true });

    dom.readerPage.addEventListener("touchend", function (event) {
      if (startX === null || startY === null || !event.changedTouches || !event.changedTouches.length) {
        return;
      }

      var endX = event.changedTouches[0].clientX;
      var endY = event.changedTouches[0].clientY;
      var dx = endX - startX;
      var dy = endY - startY;

      startX = null;
      startY = null;

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
      setStatus("Directory open. Choose a chapter.");
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

    dom.prevPageBtn.addEventListener("click", function () {
      prevPage();
      setView("reader");
    });

    dom.nextPageBtn.addEventListener("click", function () {
      nextPage();
      setView("reader");
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
    var lines = [];

    function test(name, fn) {
      try {
        fn();
        lines.push("PASS: " + name);
      } catch (error) {
        lines.push("FAIL: " + name + " -> " + error.message);
      }
    }

    test("Book page count", function () {
      if (PAGES.length !== BOOK_META.totalPages) {
        throw new Error("Expected " + BOOK_META.totalPages + ", got " + PAGES.length);
      }
    });

    test("Directory exists", function () {
      if (!dom.directoryList) {
        throw new Error("directoryList missing");
      }
    });

    test("Reader paragraph container exists", function () {
      if (!dom.bookParagraphs) {
        throw new Error("bookParagraphs missing");
      }
    });

    test("Fullscreen and back controls", function () {
      if (!dom.fullscreenToggle) {
        throw new Error("fullscreenToggle missing");
      }
      if (!document.querySelector("a[href='../index.html']")) {
        throw new Error("Back to Projects link missing");
      }
    });

    setStatus(lines.join(" | "));
  }

  function cacheDom() {
    dom.ebookShell = byId("ebookShell");
    dom.fullscreenToggle = byId("fullscreenToggle");

    dom.directoryBtn = byId("directoryBtn");
    dom.readerBtn = byId("readerBtn");
    dom.prevPageBtn = byId("prevPageBtn");
    dom.nextPageBtn = byId("nextPageBtn");
    dom.chapterSelect = byId("chapterSelect");
    dom.pageInput = byId("pageInput");
    dom.goPageBtn = byId("goPageBtn");
    dom.fontDownBtn = byId("fontDownBtn");
    dom.fontUpBtn = byId("fontUpBtn");

    dom.directoryView = byId("directoryView");
    dom.readerView = byId("readerView");
    dom.directoryList = byId("directoryList");
    dom.startReadingBtn = byId("startReadingBtn");
    dom.continueReadingBtn = byId("continueReadingBtn");

    dom.readerPage = byId("readerPage");
    dom.pageMeta = byId("pageMeta");
    dom.pageTitle = byId("pageTitle");
    dom.bookParagraphs = byId("bookParagraphs");

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
