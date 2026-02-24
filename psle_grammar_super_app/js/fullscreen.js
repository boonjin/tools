"use strict";

export function initFullscreenToggle(appShell, toggleButton) {
  if (!appShell || !toggleButton) {
    return;
  }

  let pseudo = false;

  function nativeElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
  }

  function updateButton() {
    const enabled = !!nativeElement() || pseudo;
    toggleButton.textContent = enabled ? "Exit Full Screen" : "Enter Full Screen";
    toggleButton.setAttribute("aria-pressed", enabled ? "true" : "false");
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
    return Promise.reject(new Error("Native fullscreen unavailable"));
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

  toggleButton.addEventListener("click", () => {
    if (nativeElement()) {
      exitNative().catch(() => exitPseudo()).finally(updateButton);
      return;
    }

    if (pseudo) {
      exitPseudo();
      return;
    }

    requestNative().then(updateButton).catch(enterPseudo);
  });

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && pseudo) {
      exitPseudo();
    }
    updateButton();
  });
  document.addEventListener("webkitfullscreenchange", updateButton);
  document.addEventListener("msfullscreenchange", updateButton);

  updateButton();
}
