/* Animated circuit-trace backdrop: faint PCB traces with signal pulses running along them. */
(function () {
  const canvas = document.getElementById('backdrop');
  const ctx = canvas.getContext('2d');
  const GRID = 46;
  const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  let W = 0, H = 0, dpr = 1, traces = [], paused = false, last = performance.now();

  function rand(a, b) { return a + Math.random() * (b - a); }
  function randInt(a, b) { return Math.floor(rand(a, b + 1)); }

  function makeTrace() {
    const cols = Math.ceil(W / GRID), rows = Math.ceil(H / GRID);
    let x = randInt(0, cols) * GRID, y = randInt(0, rows) * GRID;
    let dir = randInt(0, 3) * 2;                       // start straight
    const pts = [[x, y]];
    const segs = randInt(3, 6);
    for (let s = 0; s < segs; s++) {
      const len = randInt(2, 7) * GRID;
      const [dx, dy] = DIRS[dir];
      x += dx * len; y += dy * len;
      pts.push([x, y]);
      dir = (dir + (Math.random() < .5 ? 1 : 7)) % 8;    // turn 45°
    }
    const lens = [0];
    for (let i = 1; i < pts.length; i++) {
      lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    const gold = Math.random() < .28;
    return {
      pts, lens, total: lens[lens.length - 1], gold,
      pulses: Array.from({ length: randInt(0, 2) }, () => ({ d: rand(0, 1), speed: rand(70, 170), wait: rand(0, 4) }))
    };
  }

  function pointAt(t, d) {
    for (let i = 1; i < t.lens.length; i++) {
      if (d <= t.lens[i]) {
        const k = (d - t.lens[i - 1]) / (t.lens[i] - t.lens[i - 1] || 1);
        return [t.pts[i - 1][0] + (t.pts[i][0] - t.pts[i - 1][0]) * k, t.pts[i - 1][1] + (t.pts[i][1] - t.pts[i - 1][1]) * k];
      }
    }
    return t.pts[t.pts.length - 1];
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((W * H) / 52000);
    traces = Array.from({ length: Math.max(18, count) }, makeTrace);
    traces.forEach(t => t.pulses.forEach(p => { p.d *= t.total; }));
  }

  function draw(dt) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const t of traces) {
      ctx.beginPath();
      ctx.moveTo(t.pts[0][0], t.pts[0][1]);
      for (let i = 1; i < t.pts.length; i++) ctx.lineTo(t.pts[i][0], t.pts[i][1]);
      ctx.strokeStyle = t.gold ? 'rgba(234,200,131,.08)' : 'rgba(111,211,204,.07)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      for (const end of [t.pts[0], t.pts[t.pts.length - 1]]) {
        ctx.beginPath(); ctx.arc(end[0], end[1], 3.2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(111,211,204,.16)'; ctx.lineWidth = 1.4; ctx.stroke();
      }
      for (const p of t.pulses) {
        if (!paused) {
          if (p.wait > 0) { p.wait -= dt; } else { p.d += p.speed * dt; }
          if (p.d > t.total + 90) { p.d = 0; p.wait = rand(1, 6); }
        }
        if (p.wait > 0) continue;
        const color = t.gold ? '234,200,131' : '111,211,204';
        const tail = 90, steps = 10;
        for (let s = 0; s < steps; s++) {
          const d0 = p.d - tail * (s / steps), d1 = p.d - tail * ((s + 1) / steps);
          if (d1 > t.total || d0 < 0) continue;
          const a = pointAt(t, Math.max(0, Math.min(t.total, d0)));
          const b = pointAt(t, Math.max(0, Math.min(t.total, d1)));
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
          ctx.strokeStyle = `rgba(${color},${(0.55 * (1 - s / steps)).toFixed(3)})`;
          ctx.lineWidth = 2.2; ctx.stroke();
        }
        if (p.d <= t.total) {
          const h = pointAt(t, p.d);
          const g = ctx.createRadialGradient(h[0], h[1], 0, h[0], h[1], 14);
          g.addColorStop(0, `rgba(${color},.75)`); g.addColorStop(1, `rgba(${color},0)`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(h[0], h[1], 14, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
  }

  function loop(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    draw(dt);
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(loop);
  window.Backdrop = { setPaused(v) { paused = v; } };
})();
