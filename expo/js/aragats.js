/* Aragats: the four summits of the SemiTec mark as a 3D contour mountain.
   Shared by the expo deck (scene "Our symbol") and the website (section 02, 2D view).

   One timeline, in seconds:
     0 – 3.2    contour lines appear, seen from above (a topographic map)
     3.2 – 6.2  the camera tilts: the map rises into a mountain
     6.2 – 14.2 the four summits, two seconds each (Education, Science, Industry, Community)
     14.2 – 17  the camera drops to the horizon: the contour rings become the silhouette
     17 – 19    the silhouette fills with the colours of the SemiTec mark
   Aragats.create(canvas, opts) → { draw(t), peakAt(x, y), END, tourStart(k) }        */
(function () {
  // the logo's four triangles, in its 1270 × 842 box (y down); apex, base from/to, colour
  const PEAKS = [
    { name: 0, ax: 306, ay: 438, l: 0,   r: 610,  z: 150,   fill: '#17262c' },   // Education
    { name: 1, ax: 635, ay: 0,   l: 0,   r: 1270, z: -230, fill: '#b08a45' },   // Science
    { name: 2, ax: 889, ay: 335, l: 508, r: 1270, z: 110,   fill: '#17262c' },   // Industry
    { name: 3, ax: 557, ay: 500, l: 225, r: 889,  z: 330,  fill: '#8b2c10' }    // Community
  ];
  PEAKS.forEach(p => { p.H = 842 - p.ay; p.sl = p.H / (p.ax - p.l); p.sr = p.H / (p.r - p.ax); });
  const LOGO = [   // drawing order of the mark: gold, left dark, red, right dark
    { pts: [[635, 0], [0, 842], [1270, 842]], fill: '#b08a45' },
    { pts: [[306, 438], [0, 842], [610, 842]], fill: '#17262c' },
    { pts: [[557, 500], [674, 621], [508, 842], [225, 842]], fill: '#8b2c10' },
    { pts: [[889, 335], [1270, 842], [508, 842]], fill: '#17262c' }
  ];
  const T0 = 3.2, T1 = 6.2, TP = 2, T2 = 14.2, T3 = 17, T4 = 19, END = 19.6;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const seg = (t, a, b) => ease(clamp((t - a) / (b - a), 0, 1));
  const mix = (a, b, k) => a + (b - a) * k;
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const rgb = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;

  function height(x, z) {
    let best = 0, owner = -1;
    for (let i = 0; i < 4; i++) {
      const p = PEAKS[i], dx = x - p.ax, s = dx < 0 ? p.sl : p.sr, dz = z - p.z;
      let h = p.H - Math.sqrt(dx * dx * s * s + dz * dz * 2.6);
      if (h > best) { best = h; owner = i; }
    }
    if (best > 0) best += 7 * Math.sin(x * .021 + z * .013) * Math.sin(z * .029 - x * .007) * Math.min(1, best / 120);
    return [Math.max(0, best), owner];
  }

  /* contour lines by marching squares, computed once per resolution */
  const STEP = 24, LV = [];
  for (let L = 8; L < 842; L += STEP) LV.push(L);
  const SETS = {};
  // levels every `step` units, sampled on a grid of `D` units → { levels, segs[level][owner] = Float32Array x,z pairs }
  function contourSet(step, D) {
    const key = step + ':' + D;
    if (SETS[key]) return SETS[key];
    const levels = [];
    for (let L = 8; L < 842; L += step) levels.push(L);
    const X0 = -120, X1 = 1390, Z0 = -480, Z1 = 480;
    const nx = Math.round((X1 - X0) / D) + 1, nz = Math.round((Z1 - Z0) / D) + 1;
    const H = new Float32Array(nx * nz), O = new Int8Array(nx * nz);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const [h, o] = height(X0 + i * D, Z0 + j * D); H[j * nx + i] = h; O[j * nx + i] = o;
    }
    const PAIRS = { 1: [[3, 2]], 2: [[2, 1]], 3: [[3, 1]], 4: [[0, 1]], 5: [[3, 0], [2, 1]], 6: [[0, 2]], 7: [[3, 0]],
      8: [[3, 0]], 9: [[0, 2]], 10: [[0, 1], [3, 2]], 11: [[0, 1]], 12: [[3, 1]], 13: [[2, 1]], 14: [[3, 2]] };
    const out = levels.map(() => [[], [], [], []]);
    levels.forEach((L, li) => {
      for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
        const a = H[j * nx + i], b = H[j * nx + i + 1], c = H[(j + 1) * nx + i + 1], d = H[(j + 1) * nx + i];
        const k = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
        if (k === 0 || k === 15) continue;
        const x = X0 + i * D, z = Z0 + j * D;
        const e = [[x + D * (L - a) / (b - a), z], [x + D, z + D * (L - b) / (c - b)], [x + D * (L - d) / (c - d), z + D], [x, z + D * (L - a) / (d - a)]];
        const own = Math.max(0, O[j * nx + i] < 0 ? O[(j + 1) * nx + i + 1] : O[j * nx + i]);
        PAIRS[k].forEach(([p, q]) => out[li][own].push(e[p][0], e[p][1], e[q][0], e[q][1]));
      }
    });
    return (SETS[key] = { levels, segs: out.map(row => row.map(a => new Float32Array(a))) });
  }
  const contours = () => contourSet(STEP, 9).segs;

  /* the camera over the timeline (with an optional "hold" on one summit) */
  function camera(t) {
    const tilt = seg(t, T0, T1), flat = seg(t, T2, T3);
    let elev = mix(Math.PI / 2, .5, tilt), yaw = mix(-.9, -.32, tilt);
    yaw += .62 * clamp((t - T1) / (T2 - T1), 0, 1);
    elev = mix(elev, 0, flat); yaw = mix(yaw, 0, flat);
    const zoom = mix(mix(.86, .9, tilt), 1, flat);
    return { elev, yaw, zoom, persp: 1 - flat, dy: -110 * tilt * (1 - flat) };
  }
  // how strongly summit k is "on" at time t (smooth bump over its two seconds)
  function focus(t, k) {
    const a = T1 + k * TP, b = a + TP;
    if (t < a - .4 || t > b + .1) return 0;
    return Math.min(clamp((t - a + .4) / .6, 0, 1), clamp((b + .1 - t) / .6, 0, 1));
  }

  function create(canvas, opts) {
    opts = Object.assign({ theme: 'dark', labels: () => ['', '', '', ''], font: 'DM Sans, system-ui, sans-serif' }, opts || {});
    const ctx = canvas.getContext('2d');
    const dark = opts.theme === 'dark';
    const C = dark
      ? { lo: hex('#397b80'), hi: hex('#eac883'), on: hex('#ffe3a6'), text: '#f1eee6', muted: 'rgba(241,238,230,.62)', dot: 'rgba(151,176,179,.32)', beam: '#eac883', edge: 'rgba(234,200,131,.55)' }
      : { lo: hex('#6f9a9c'), hi: hex('#b08a45'), on: hex('#8b5a12'), text: '#14262c', muted: 'rgba(20,38,44,.6)', dot: 'rgba(20,38,44,.16)', beam: '#b08a45', edge: 'rgba(20,38,44,0)' };
    let W = 0, Hh = 0, sc = 1, last = [];

    function size() {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round((r.width || canvas.width) * (opts.fixed ? 1 : dpr)), h = Math.round((r.height || canvas.height) * (opts.fixed ? 1 : dpr));
      if (!opts.fixed && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; }
      W = canvas.width; Hh = canvas.height; sc = Math.min(W / 1720, Hh / 1180);
    }
    function proj(cam, x, h, z) {
      const X = x - 635, cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
      const xr = X * cy - z * sy, zr = X * sy + z * cy;
      const ce = Math.cos(cam.elev), se = Math.sin(cam.elev);
      const Y = zr * se - (h - 421) * ce, depth = zr * ce + (h - 421) * se;
      const f = 1 / (1 - cam.persp * depth / 3400);
      const s = sc * cam.zoom * f;
      return [W / 2 + xr * s, Hh * .53 + (Y + cam.dy) * s];
    }

    function draw(t) {
      size();
      const cam = camera(t), cont = contours();
      ctx.clearRect(0, 0, W, Hh);
      const lw = Math.max(1, sc * 2.1);
      const fade = 1 - .82 * seg(t, T3, T4);             // contour lines step back when the mark fills in
      const tourOn = clamp((t - T1 + .4) / .6, 0, 1) * (1 - seg(t, T2 - .3, T2 + .6));
      const foc = [0, 1, 2, 3].map(k => focus(t, k));

      // ground dots (a faint grid on the plain around the mountain)
      const g = 1 - seg(t, T2, T3);
      if (g > 0.01) {
        ctx.fillStyle = C.dot; ctx.globalAlpha = g * seg(t, 0, 1.2);
        for (let x = -120; x <= 1390; x += 60) for (let z = -480; z <= 480; z += 60) {
          if (height(x, z)[0] > 2) continue;
          const [px, py] = proj(cam, x, 0, z); ctx.fillRect(px - lw * .6, py - lw * .6, lw * 1.2, lw * 1.2);
        }
        ctx.globalAlpha = 1;
      }

      // contour rings, low to high
      LV.forEach((L, li) => {
        const reveal = clamp((t - .15 - li * .075) / .5, 0, 1);
        if (reveal <= 0) return;
        const k = L / 842, base = [mix(C.lo[0], C.hi[0], k), mix(C.lo[1], C.hi[1], k), mix(C.lo[2], C.hi[2], k)];
        for (let o = 0; o < 4; o++) {
          const segs = cont[li][o]; if (!segs.length) continue;
          const f = foc[o], dim = 1 - .62 * tourOn * (1 - f);
          const a = reveal * fade * (dark ? .78 : .9) * (dark ? dim : .25 + .75 * dim);
          ctx.beginPath();
          for (let i = 0; i < segs.length; i += 4) {
            const p = proj(cam, segs[i], L, segs[i + 1]), q = proj(cam, segs[i + 2], L, segs[i + 3]);
            ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]);
          }
          ctx.strokeStyle = rgb(f > 0 ? [mix(base[0], C.on[0], f), mix(base[1], C.on[1], f), mix(base[2], C.on[2], f)] : base, a);
          ctx.lineWidth = lw * (1 + .7 * f);
          ctx.stroke();
          if (f > .05 && dark) { ctx.strokeStyle = rgb(C.on, .12 * f * reveal); ctx.lineWidth = lw * 5; ctx.stroke(); }
        }
      });

      // the mark fills in
      const fill = seg(t, T3, T4);
      if (fill > 0) {
        LOGO.forEach((sh, i) => {
          ctx.beginPath();
          sh.pts.forEach(([X, Y], j) => { const p = proj(cam, X, 842 - Y, 0); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
          ctx.closePath();
          ctx.globalAlpha = clamp(fill * 1.25 - i * .08, 0, 1);
          ctx.fillStyle = sh.fill; ctx.fill();
          if (dark) { ctx.strokeStyle = C.edge; ctx.lineWidth = lw; ctx.stroke(); }
        });
        ctx.globalAlpha = 1;
        // a light sweep across the finished mark
        const sw = (t - T4 + .9) / 1.4;
        if (sw > 0 && sw < 1) {
          ctx.save(); ctx.beginPath();
          LOGO.forEach(sh => sh.pts.forEach(([X, Y], j) => { const p = proj(cam, X, 842 - Y, 0); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }));
          ctx.clip();
          const x0 = mix(-.2, 1.2, sw) * W, gr = ctx.createLinearGradient(x0 - W * .12, 0, x0 + W * .12, 0);
          gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,244,214,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gr; ctx.fillRect(0, 0, W, Hh); ctx.restore();
        }
      }

      // summits: beam + label while touring, a quiet legend once the mark is complete
      const labels = opts.labels(), legend = seg(t, T4 - .6, T4 + .4);
      ctx.textBaseline = 'middle';
      last = [];
      PEAKS.forEach((p, k) => {
        const f = foc[k];
        const top = proj(cam, p.ax, p.H, p.z);
        last.push(top);
        if (f > 0.01) {
          const up = proj(cam, p.ax, p.H + (k === 1 ? 0 : 230), p.z);
          ctx.strokeStyle = C.beam; ctx.globalAlpha = f; ctx.lineWidth = lw * 1.4;
          ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(top[0], mix(top[1], up[1], f)); ctx.stroke();
          ctx.fillStyle = C.beam; ctx.beginPath(); ctx.arc(top[0], top[1], lw * (4 + 3 * Math.sin(t * 6) ** 2), 0, 7); ctx.fill();
          ctx.font = `600 ${Math.round(sc * 64)}px ${opts.font}`; ctx.textAlign = 'center'; ctx.fillStyle = C.text;
          if (k === 1) { ctx.textAlign = 'left'; ctx.fillText(labels[k] || '', top[0] + sc * 70, top[1] + sc * 30); }
          else ctx.fillText(labels[k] || '', top[0], up[1] - sc * 46);
          ctx.globalAlpha = 1;
        }
        if (legend > 0.01) {
          const L = [[-1, 0], [0, -1], [1, 0], [0, 1]][k], d = sc * 70;
          const ax = top[0], ay = top[1];
          const lx = k === 3 ? ax : ax + L[0] * d * 2.2, ly = k === 3 ? Hh * .53 + 470 * sc : ay + L[1] * d;
          ctx.globalAlpha = legend;
          ctx.fillStyle = C.beam; ctx.beginPath(); ctx.arc(ax, ay, lw * 3.2, 0, 7); ctx.fill();
          ctx.strokeStyle = C.muted; ctx.lineWidth = Math.max(1, lw * .7);
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lx, ly); ctx.stroke();
          ctx.font = `500 ${Math.round(sc * 44)}px ${opts.font}`; ctx.fillStyle = C.text;
          ctx.textAlign = k === 0 ? 'right' : k === 2 ? 'left' : 'center';
          ctx.fillText(labels[k] || '', lx + (k === 0 ? -sc * 14 : k === 2 ? sc * 14 : 0), ly + (k === 1 ? -sc * 34 : k === 3 ? sc * 36 : 0));
          ctx.globalAlpha = 1;
        }
      });
    }
    // which summit is near a point given in CSS pixels of the canvas
    function peakAt(x, y) {
      const r = canvas.getBoundingClientRect(), kx = canvas.width / r.width, ky = canvas.height / r.height;
      let best = -1, bd = 1e9;
      last.forEach((p, k) => { const d = Math.hypot(p[0] - x * kx, p[1] - y * ky); if (d < bd) { bd = d; best = k; } });
      return bd < canvas.width * .12 ? best : -1;
    }
    return { draw, peakAt, END, tourStart: k => T1 + k * TP, tourEnd: T2, focus };
  }

  window.Aragats = { create, END, T1, TP, T2, focus, contourSet, PEAKS: PEAKS.map(p => ({ ax: p.ax, H: p.H, z: p.z, fill: p.fill })) };
})();
