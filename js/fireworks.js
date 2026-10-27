/* Canvas fireworks: rockets with trails, bursts with fading sparks. Restrained counts, no flashing. */
(function (global) {
  "use strict";

  var COLORS = [[236, 212, 147], [240, 162, 58], [255, 244, 220], [201, 162, 77], [168, 52, 62]];
  var MAX_PARTICLES = 420;

  var canvas, ctx, w, h, dpr, raf = 0, running = false, lastT = 0, nextLaunch = 0;
  var rockets = [], sparks = [], onBurst = null;
  var reduced = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    dpr = Math.min(global.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function launch() {
    var size = 0.45 + Math.random() * 0.55;
    rockets.push({ x: w * (0.12 + Math.random() * 0.76), y: h + 10, vy: -(h * (0.55 + Math.random() * 0.2)) / 1.1,
      vx: (Math.random() - 0.5) * 40, targetY: h * (0.14 + Math.random() * 0.3), size: size,
      color: COLORS[Math.floor(Math.random() * 3)] });
  }

  function explode(r) {
    var n = Math.round(46 + 70 * r.size), base = r.color, accent = COLORS[Math.floor(Math.random() * COLORS.length)];
    if (sparks.length + n > MAX_PARTICLES) n = Math.max(0, MAX_PARTICLES - sparks.length);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, s = (40 + Math.random() * 150) * (0.55 + r.size * 0.6);
      sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, decay: 0.38 + Math.random() * 0.4,
        color: Math.random() < 0.8 ? base : accent, px: r.x, py: r.y });
    }
    if (onBurst) onBurst(r.size);
  }

  function frame(t) {
    if (!running) return;
    var dt = Math.min(0.05, (t - lastT) / 1000 || 0.016); lastT = t;

    // soft fade (no bright flashes): trails persist briefly
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    if (t > nextLaunch && rockets.length < 2) { launch(); nextLaunch = t + 1100 + Math.random() * 1700; }

    for (var i = rockets.length - 1; i >= 0; i--) {
      var r = rockets[i];
      r.vy += 90 * dt; r.x += r.vx * dt; r.y += r.vy * dt;
      ctx.fillStyle = "rgba(" + r.color.join(",") + ",0.9)";
      ctx.fillRect(r.x - 1.5, r.y - 1.5, 3, 8);
      if (r.vy >= -30 || r.y <= r.targetY) { explode(r); rockets.splice(i, 1); }
    }
    for (var j = sparks.length - 1; j >= 0; j--) {
      var p = sparks[j];
      p.px = p.x; p.py = p.y;
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 70 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= p.decay * dt;
      if (p.life <= 0) { sparks.splice(j, 1); continue; }
      ctx.strokeStyle = "rgba(" + p.color.join(",") + "," + Math.min(1, p.life * 1.4).toFixed(3) + ")";
      ctx.lineWidth = 2.4 * p.life + 0.8; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    raf = global.requestAnimationFrame(frame);
  }

  function start(el, burstCb) {
    canvas = el; onBurst = burstCb || null;
    ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx || reduced) return false;     // graceful fallback: static dark gradient background remains
    resize(); global.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    rockets = []; sparks = []; running = true; lastT = performance.now(); nextLaunch = lastT + 500;
    raf = global.requestAnimationFrame(frame);
    return true;
  }
  function onVis() {
    if (document.hidden) { running = false; global.cancelAnimationFrame(raf); }
    else if (canvas && ctx && !running && canvas.offsetParent !== null) { running = true; lastT = performance.now(); raf = global.requestAnimationFrame(frame); }
  }
  function stop() {
    running = false; global.cancelAnimationFrame(raf);
    global.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVis);
    rockets = []; sparks = [];
    if (ctx && canvas) ctx.clearRect(0, 0, w, h);
  }

  global.DeepawaliFireworks = { start: start, stop: stop, supported: function () { return !reduced; } };
})(window);
