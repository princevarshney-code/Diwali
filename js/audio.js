/* Audio: plays ONLY real recorded clips from assets/audio/. Nothing is synthesised.
   Clips that are not present are skipped silently and the site stays fully usable. */
(function (global) {
  "use strict";

  var CLIPS = [
    { id: "crackle", src: "assets/audio/fireworks-crackling.mp3", volume: 0.5, role: "burst" },
    { id: "distant", src: "assets/audio/distant-fireworks.mp3", volume: 0.4, role: "burst" },
    { id: "bell", src: "assets/audio/diya-bell.mp3", volume: 0.45, role: "chime" }
  ];

  var pool = {};          // id -> prepared <audio> template
  var available = {};     // id -> true when the file loaded
  var active = [];        // currently playing clones
  var muted = false;
  var master = 1;
  var lastBurst = 0;
  var blocked = false;
  var listeners = { blocked: [], availability: [] };

  function emit(name, arg) { listeners[name].forEach(function (fn) { fn(arg); }); }
  function on(name, fn) { listeners[name].push(fn); }

  function probe() {
    var pending = CLIPS.length;
    CLIPS.forEach(function (c) {
      var a = new Audio();
      a.preload = "auto";
      a.addEventListener("canplaythrough", function () { available[c.id] = true; pool[c.id] = a; done(); }, { once: true });
      a.addEventListener("error", function () { available[c.id] = false; done(); }, { once: true });
      a.src = c.src;
      a.load();
    });
    function done() { if (--pending === 0) emit("availability", hasAny()); }
  }

  function hasAny() { return Object.keys(available).some(function (k) { return available[k]; }); }
  function hasBursts() { return CLIPS.some(function (c) { return c.role === "burst" && available[c.id]; }); }

  function play(id, gain) {
    var c = CLIPS.filter(function (x) { return x.id === id; })[0];
    if (!c || !available[id] || muted) return;
    var a = pool[id].cloneNode();
    a.volume = Math.min(1, c.volume * (gain || 1) * master);
    a.playbackRate = 0.96 + Math.random() * 0.08;  // slight natural variation of a real recording
    active.push(a);
    a.addEventListener("ended", function () { active = active.filter(function (x) { return x !== a; }); });
    var p = a.play();
    if (p && p.catch) p.catch(function (err) {
      active = active.filter(function (x) { return x !== a; });
      if (err && err.name === "NotAllowedError") { blocked = true; emit("blocked", true); }
    });
  }

  /* Called by the fireworks module for each burst. Throttled and randomised so the result
     is a sparse, comfortable crackle rather than a constant barrage. */
  function burst(size) {
    var now = Date.now();
    if (muted || now - lastBurst < 900 || Math.random() < 0.25) return;
    lastBurst = now;
    var ids = CLIPS.filter(function (c) { return c.role === "burst" && available[c.id]; });
    if (!ids.length) return;
    var pick = ids[Math.floor(Math.random() * ids.length)];
    play(pick.id, 0.55 + 0.45 * Math.min(1, size || 0.6));
  }

  function chime() { play("bell", 1); }

  function fadeOutAll(ms) {
    var list = active.slice(), steps = 10, i = 0;
    var t = setInterval(function () {
      i++;
      list.forEach(function (a) { a.volume = Math.max(0, a.volume * (1 - i / steps)); });
      if (i >= steps) { clearInterval(t); stopAll(); }
    }, (ms || 400) / steps);
  }
  function stopAll() { active.forEach(function (a) { a.pause(); }); active = []; }

  function setMuted(m) { muted = !!m; if (muted) stopAll(); }
  function isMuted() { return muted; }
  function retryEnable() {  // user gesture: unlock and confirm playback works
    blocked = false;
    emit("blocked", false);
    chime();
  }

  global.DeepawaliAudio = { probe: probe, burst: burst, chime: chime, fadeOutAll: fadeOutAll, stopAll: stopAll,
    setMuted: setMuted, isMuted: isMuted, hasAny: hasAny, hasBursts: hasBursts, on: on, retryEnable: retryEnable,
    isBlocked: function () { return blocked; } };
})(window);
