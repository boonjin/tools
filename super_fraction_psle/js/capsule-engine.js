(function () {
  "use strict";

  function normalizeModules(raw) {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.filter(function (item) {
      return item && typeof item === "object";
    }).map(function (item) {
      return {
        moduleId: item.moduleId || "module",
        title: item.title || "Untitled capsule",
        objective: item.objective || "",
        concept: item.concept || "",
        methodA: item.methodA || "",
        methodB: item.methodB || "",
        methodC: item.methodC || "",
        pitfall: item.pitfall || "",
        diagnostic: item.diagnostic || "",
        extension: item.extension || "",
        reflection: item.reflection || "",
        targetDifficulty: item.targetDifficulty || 2,
        masteryTag: item.masteryTag || ""
      };
    });
  }

  window.createSuperFractionCapsuleEngine = function createSuperFractionCapsuleEngine() {
    function bank() {
      return window.SUPER_FRACTION_CONTENT_BANK || null;
    }

    function modulesFor(subtypeId) {
      var b = bank();
      if (!b || !b.entries || !b.entries[subtypeId]) {
        return [];
      }
      return normalizeModules(b.entries[subtypeId]);
    }

    function capsuleFor(subtypeId, index) {
      var modules = modulesFor(subtypeId);
      if (!modules.length) {
        return {
          index: 0,
          total: 0,
          module: null
        };
      }

      var normalized = typeof index === "number" ? index : 0;
      if (normalized < 0) {
        normalized = 0;
      }
      normalized = normalized % modules.length;

      return {
        index: normalized,
        total: modules.length,
        module: modules[normalized]
      };
    }

    return {
      modulesFor: modulesFor,
      capsuleFor: capsuleFor,
      hasBank: function () {
        var b = bank();
        return !!(b && b.entries);
      }
    };
  };
})();
