/* Wires the page together: overlays, focus handling, sound controls, celebration lifecycle. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var gameOv = $("gameOverlay"), greetOv = $("greetOverlay");
  var toggle = $("soundToggle"), label = $("soundLabel"), enableBtn = $("enableSound");
  var lastFocus = null, openOv = null, soundsReady = false;

  function openOverlay(ov, focusEl) {
    lastFocus = document.activeElement;
    ov.hidden = false;
    void ov.offsetWidth;                       // allow the transition to start
    ov.classList.add("open");
    openOv = ov;
    var panel = ov.querySelector(".panel");
    (focusEl || panel).focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
  }
  function closeOverlay(ov, cb) {
    ov.classList.remove("open");
    setTimeout(function () {
      ov.hidden = true;
      if (openOv === ov) { openOv = null; document.body.style.overflow = ""; }
      if (cb) cb();
    }, 450);
  }

  function startCelebration() {
    DeepawaliFireworks.start($("fireworks"), DeepawaliAudio.burst);
    DeepawaliAudio.chime();
  }
  function endCelebration() {
    DeepawaliFireworks.stop();
    DeepawaliAudio.fadeOutAll(500);
  }

  function closeGame() { closeOverlay(gameOv, function () { if (lastFocus) lastFocus.focus(); }); }
  function closeGreeting() {
    endCelebration();
    closeOverlay(greetOv, function () { if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); });
  }

  DeepawaliGame.init({
    onLight: function () { DeepawaliAudio.chime(); },
    onComplete: function () {
      // Close the game panel, then open the greeting. The user's final tap is the gesture that unlocks audio.
      gameOv.classList.remove("open");
      gameOv.hidden = true; openOv = null;
      openOverlay(greetOv, $("againBtn"));
      startCelebration();
    }
  });

  $("playBtn").addEventListener("click", function () {
    DeepawaliGame.reset();
    openOverlay(gameOv, DeepawaliGame.firstUnlit());
  });
  $("againBtn").addEventListener("click", function () {
    endCelebration();
    closeOverlay(greetOv, function () {
      DeepawaliGame.reset();
      openOverlay(gameOv, DeepawaliGame.firstUnlit());
    });
  });
  document.querySelectorAll("[data-close]").forEach(function (b) {
    b.addEventListener("click", function () { b.getAttribute("data-close") === "game" ? closeGame() : closeGreeting(); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && openOv) { openOv === gameOv ? closeGame() : closeGreeting(); }
    if (e.key === "Tab" && openOv) {           // keep focus inside the open dialog
      var f = openOv.querySelectorAll("button:not([hidden])");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  [gameOv, greetOv].forEach(function (ov) {
    ov.addEventListener("click", function (e) { if (e.target === ov) { ov === gameOv ? closeGame() : closeGreeting(); } });
  });

  /* Sound controls */
  function paintToggle() {
    var m = DeepawaliAudio.isMuted();
    toggle.setAttribute("aria-pressed", String(m));
    if (!soundsReady) {
      toggle.setAttribute("aria-disabled", "true");
      label.textContent = "Sound unavailable";
      toggle.setAttribute("aria-label", "Sound unavailable: no audio files installed");
      toggle.title = "Add the recorded clips listed in ASSETS-LICENSES.md to enable sound";
    } else {
      toggle.removeAttribute("aria-disabled");
      label.textContent = m ? "Sound off" : "Sound on";
      toggle.setAttribute("aria-label", m ? "Sound off. Turn sound on" : "Sound on. Turn sound off");
      toggle.title = "";
    }
  }
  toggle.addEventListener("click", function () {
    if (!soundsReady) return;
    DeepawaliAudio.setMuted(!DeepawaliAudio.isMuted());
    paintToggle();
  });
  enableBtn.addEventListener("click", function () { DeepawaliAudio.retryEnable(); });
  DeepawaliAudio.on("blocked", function (b) { enableBtn.hidden = !b; });
  DeepawaliAudio.on("availability", function (any) { soundsReady = any; paintToggle(); });
  paintToggle();
  DeepawaliAudio.probe();

  window.addEventListener("pagehide", function () { DeepawaliFireworks.stop(); DeepawaliAudio.stopAll(); });
})();
