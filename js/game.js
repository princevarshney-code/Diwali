/* Light the Five Diyas: each diya can be lit once; completion fires exactly once per round. */
(function (global) {
  "use strict";
  var TOTAL = 5, lit = 0, finished = false, timer = 0, onComplete = null, onLight = null;
  var row, items, progress, fill, note;

  function init(cfg) {
    onComplete = cfg.onComplete; onLight = cfg.onLight;
    row = document.getElementById("diyaRow");
    items = Array.prototype.slice.call(row.querySelectorAll(".diya"));
    progress = document.getElementById("progress");
    fill = document.getElementById("barFill");
    note = document.getElementById("doneNote");
    items.forEach(function (btn, i) {
      btn.addEventListener("click", function () { light(btn, i); });
    });
    render();
  }

  function light(btn, i) {
    if (finished || btn.classList.contains("lit")) return;   // duplicate clicks never add progress
    btn.classList.add("lit");
    btn.setAttribute("aria-pressed", "true");
    btn.setAttribute("aria-label", "Diya " + (i + 1) + ", lit");
    lit++;
    render();
    if (onLight) onLight(lit);
    if (lit === TOTAL) {
      finished = true;
      note.hidden = false;
      timer = setTimeout(function () { timer = 0; if (onComplete) onComplete(); }, 1100);
    }
  }

  function render() {
    progress.textContent = lit + " of " + TOTAL + " diyas lit";
    fill.style.width = (lit / TOTAL * 100) + "%";
  }

  function reset() {
    clearTimeout(timer); timer = 0;
    lit = 0; finished = false;
    note.hidden = true;
    items.forEach(function (btn, i) {
      btn.classList.remove("lit");
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("aria-label", "Diya " + (i + 1) + ", unlit");
    });
    render();
  }

  function firstUnlit() { return items.filter(function (b) { return !b.classList.contains("lit"); })[0] || items[0]; }

  global.DeepawaliGame = { init: init, reset: reset, firstUnlit: firstUnlit, count: function () { return lit; } };
})(window);
