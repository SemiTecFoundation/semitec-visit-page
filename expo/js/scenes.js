/* Scene effects that need JavaScript: AUP-ZU3 board (cloned), board tour camera,
   "Inside the FPGA" zoom layers and the live dashboards. Everything is driven by the
   scene clock (sec), so pausing the deck freezes these effects too. */
(function () {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const T = key => {
    const e = STRINGS[key];
    const li = document.documentElement.lang === 'hy' ? 1 : 0;
    return e ? (e[li] || e[0]) : key;
  };
  function el(tag, attrs, parent, text) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function swapText(node, text) {
    if (node.textContent === text) return;
    node.textContent = text;
    node.classList.remove('swap'); void node.offsetWidth; node.classList.add('swap');
  }

  /* ================= board ================= */
  const BW = 994, BH = 910;
  function initBoards() {
    const tpl = document.getElementById('board-tpl');
    if (!tpl) return;
    document.querySelectorAll('.board-slot').forEach((slot, i) => {
      const frag = tpl.content.cloneNode(true);
      // give every copy its own gradient/pattern ids so each one renders on its own
      frag.querySelectorAll('[id]').forEach(n => {
        const old = n.id, neu = old + '-' + i;
        n.id = neu;
        frag.querySelectorAll('*').forEach(m => ['fill', 'stroke', 'mask', 'clip-path'].forEach(a => {
          const v = m.getAttribute(a);
          if (v && v.includes('#' + old + ')')) m.setAttribute(a, v.replace('#' + old + ')', '#' + neu + ')'));
        }));
      });
      slot.appendChild(frag);
    });
  }

  /* ================= board tour ================= */
  // [x, y, w, h] in board coordinates; null = whole board
  const STOPS = [null,
    [392, 378, 222, 184], [632, 380, 102, 174], [118, 0, 140, 92], [276, 28, 340, 98],
    [700, 36, 112, 170], [28, 128, 62, 170], [0, 296, 80, 236], [12, 540, 100, 312],
    [186, 712, 480, 186], [712, 712, 190, 186], [934, 512, 52, 386], [834, 244, 156, 272], null];
  const STOP_SEC = 2.6;
  const tour = {};
  function initTour() {
    const sc = document.querySelector('.s-tour');
    if (!sc) return;
    const svg = sc.querySelector('.tour-board svg');
    const mask = el('mask', { id: 'spotmask' }, svg.querySelector('defs'));
    el('rect', { x: -400, y: -400, width: 1800, height: 1800, fill: '#fff' }, mask);
    const hole = el('rect', { class: 'spot-hole', rx: 16, fill: '#000' }, mask);
    el('rect', { class: 'spot-dim', x: -400, y: -400, width: 1800, height: 1800, mask: 'url(#spotmask)' }, svg);
    const ring = el('rect', { class: 'spot-ring', rx: 16 }, svg);
    Object.assign(tour, {
      sc, svg, hole, ring, idx: -1, lang: '',
      cam: sc.querySelector('.tour-cam'), slot: sc.querySelector('.tour-board'), view: sc.querySelector('.tour-view'),
      num: sc.querySelector('.tour-num'), name: sc.querySelector('.tour-name'), text: sc.querySelector('.tour-text'), bar: sc.querySelector('.tour-bar i')
    });
  }
  function setGeom(n, x, y, w, h) {
    n.style.x = x + 'px'; n.style.y = y + 'px'; n.style.width = w + 'px'; n.style.height = h + 'px';
    n.setAttribute('x', x); n.setAttribute('y', y); n.setAttribute('width', w); n.setAttribute('height', h);
  }
  function tourUpdate(sec) {
    if (!tour.sc) return;
    const Vw = tour.view.offsetWidth, Vh = tour.view.offsetHeight;
    const k = Math.min(Vw / BW, Vh / BH) * 0.9;
    tour.slot.style.width = (BW * k) + 'px';
    const idx = Math.min(STOPS.length - 1, Math.floor(sec / STOP_SEC));
    const lang = document.documentElement.lang;
    tour.bar.style.width = (isFinite(sec) ? ((sec % STOP_SEC) / STOP_SEC) * 100 : 100) + '%';
    if (idx === tour.idx && lang === tour.lang) return;
    tour.idx = idx; tour.lang = lang;
    const box = STOPS[idx];
    let s = 1, cx = BW / 2, cy = BH / 2;
    if (box) {
      const [x, y, w, h] = box;
      s = Math.min(Vw * 0.6 / (w * k), Vh * 0.6 / (h * k), 4);
      cx = x + w / 2; cy = y + h / 2;
      const pad = 10;
      setGeom(tour.hole, x - pad, y - pad, w + pad * 2, h + pad * 2);
      setGeom(tour.ring, x - pad, y - pad, w + pad * 2, h + pad * 2);
    }
    tour.svg.classList.toggle('spot-off', !box);
    const tx = Vw / 2 - s * k * cx, ty = Vh / 2 - s * k * cy;
    tour.cam.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
    const last = STOPS.length - 1;
    tour.num.innerHTML = box ? `<b>${String(idx).padStart(2, '0')}</b> / ${last - 1}` : '<b>AUP-ZU3</b>';
    swapText(tour.name, T('tour.' + idx));
    swapText(tour.text, T('tour.' + idx + 't'));
  }
  function tourReset() {
    if (!tour.sc) return;
    tour.idx = -1;
    tour.cam.classList.add('instant');
    tourUpdate(0);
    requestAnimationFrame(() => requestAnimationFrame(() => tour.cam.classList.remove('instant')));
  }

  /* ================= inside the FPGA ================= */
  const zoom = {};
  const LAYER_SEC = 5.2;
  function initZoom() {
    const sc = document.querySelector('.s-zoom');
    if (!sc) return;
    const layers = Array.from(sc.querySelectorAll('.zl'));

    // L1: clock-region grid on the PL side
    const crs = sc.querySelector('.z-crs');
    for (let X = 0; X < 2; X++) for (let Y = 0; Y < 4; Y++) {
      const x = 440 + X * 225, y = 90 + (3 - Y) * 158;
      const hot = X === 1 && Y === 2;
      el('rect', { x, y, width: 215, height: 150, rx: 4, class: 'z-cr' + (hot ? ' hot' : '') }, crs);
      for (let c = 1; c < 9; c++) el('line', { x1: x + c * 24, y1: y + 8, x2: x + c * 24, y2: y + 142, stroke: c % 4 === 0 ? 'rgba(234,200,131,.25)' : 'rgba(111,211,204,.13)', 'stroke-width': 3 }, crs);
      el('text', { x: x + 40, y: y + 140, class: 'z-crl' }, crs, `X${X}Y${Y}`);
    }

    // L2: columns inside one clock region
    const cols = sc.querySelector('.z-cols');
    el('rect', { x: 30, y: 50, width: 940, height: 720, rx: 8, class: 'z-cr' }, cols);
    const seq = 'CCDCCBCCCDCCBCCC';
    const W = { C: 44, D: 40, B: 46 }, gap = 12;
    const total = seq.split('').reduce((a, c) => a + W[c], 0) + gap * (seq.length - 1);
    let x = 500 - total / 2, hot2 = null;
    const top = 70, h = 680, labelled = {};
    seq.split('').forEach((c, i) => {
      const n = c === 'C' ? 60 : c === 'D' ? 24 : 12, th = h / n;
      const cls = c === 'C' ? 'z-c-clb' : c === 'D' ? 'z-c-dsp' : 'z-c-bram';
      for (let r = 0; r < n; r++) el('rect', { x, y: top + r * th + 1, width: W[c], height: th - 2, rx: 2, class: cls }, cols);
      if (!labelled[c]) {
        labelled[c] = 1;
        el('text', { x: x + W[c] / 2, y: 40, class: 'z-lab ' + (c === 'C' ? 't' : c === 'D' ? 'g' : 'b') }, cols, c === 'C' ? 'CLB' : c === 'D' ? 'DSP' : 'BRAM');
      }
      if (i === 3) hot2 = { x: x + W[c] / 2, y: top + 18 * th };
      x += W[c] + gap;
    });
    el('rect', { x: 30, y: top + h / 2 - 7, width: 940, height: 14, class: 'z-hcs' }, cols);
    el('text', { x: 900, y: top + h / 2 - 14, class: 'z-lab g' }, cols, 'HCS');
    el('rect', { x: hot2.x - 30, y: hot2.y - 24, width: 60, height: 48, rx: 6, fill: 'none', stroke: '#eac883', 'stroke-width': 3 }, cols);
    layers[2].style.setProperty('--ox', (hot2.x / 10) + '%');
    layers[2].style.setProperty('--oy', (hot2.y / 8) + '%');

    // L3: named sites
    const sites = sc.querySelector('.z-sites');
    const colsDef = [['L', 40], ['M', 41], ['D', 5], ['L', 42], ['M', 43], ['B', 3], ['L', 44]];
    const cw = 124, cg = 14, pitch = 74, y0 = 36;
    let hot3 = null;
    colsDef.forEach(([t, xi], ci) => {
      const cx = 500 - (colsDef.length * cw + (colsDef.length - 1) * cg) / 2 + ci * (cw + cg);
      if (t === 'L' || t === 'M') {
        for (let r = 0; r < 10; r++) {
          const yy = y0 + r * pitch, yi = 126 - r;
          const hot = t === 'M' && xi === 41 && r === 4;
          el('rect', { x: cx, y: yy, width: cw, height: pitch - 10, rx: 5, class: 'z-site ' + (t === 'M' ? 'clbm' : 'clb') + (hot ? ' hot' : '') }, sites);
          el('text', { x: cx + cw / 2, y: yy + 28, class: 'z-sn' }, sites, `SLICE_X${xi}Y${yi}`);
          el('text', { x: cx + cw / 2, y: yy + 48, class: 'z-bl s' }, sites, t === 'M' ? 'SLICEM' : 'SLICEL');
          if (hot) hot3 = { x: cx + cw / 2, y: yy + (pitch - 10) / 2 };
        }
      } else if (t === 'D') {
        for (let r = 0; r < 4; r++) {
          const yy = y0 + r * pitch * 2.5, hh = pitch * 2.5 - 10;
          el('rect', { x: cx, y: yy, width: cw, height: hh, rx: 5, class: 'z-site dsp' }, sites);
          el('text', { x: cx + cw / 2, y: yy + hh / 2, class: 'z-sn' }, sites, `DSP48E2_X${xi}Y${50 - r}`);
        }
      } else {
        for (let r = 0; r < 2; r++) {
          const yy = y0 + r * pitch * 5, hh = pitch * 5 - 10;
          el('rect', { x: cx, y: yy, width: cw, height: hh, rx: 5, class: 'z-site bram' }, sites);
          el('line', { x1: cx + 10, y1: yy + hh / 2, x2: cx + cw - 10, y2: yy + hh / 2, stroke: '#5b8bd4', 'stroke-dasharray': '6 5' }, sites);
          el('text', { x: cx + cw / 2, y: yy + hh / 4 + 6, class: 'z-sn' }, sites, `RAMB18_X${xi}Y${51 - r * 2}`);
          el('text', { x: cx + cw / 2, y: yy + hh * 0.75 + 6, class: 'z-sn' }, sites, `RAMB18_X${xi}Y${50 - r * 2}`);
          el('text', { x: cx + cw / 2, y: yy + hh / 2 - 8, class: 'z-bl s' }, sites, `RAMB36_X${xi}Y${25 - r}`);
        }
      }
    });
    layers[3].style.setProperty('--ox', (hot3.x / 10) + '%');
    layers[3].style.setProperty('--oy', (hot3.y / 8) + '%');

    // L4: BELs in SLICE_X41Y122
    const bels = sc.querySelector('.z-bels');
    el('rect', { x: 110, y: 22, width: 780, height: 756, rx: 14, class: 'z-slice' }, bels);
    el('text', { x: 500, y: 14, class: 'z-bl' }, bels, 'SLICE_X41Y122 · SLICEM');
    const rows = 'ABCDEFGH', rp = 88, ry0 = 40;
    el('rect', { x: 400, y: ry0, width: 54, height: rp * 8 - 20, rx: 8, class: 'z-carry' }, bels);
    const ct = el('text', { x: 427, y: ry0 + rp * 4, class: 'z-bl', transform: `rotate(-90 427 ${ry0 + rp * 4})` }, bels, 'CARRY8');
    ct.setAttribute('dy', '5');
    for (let r = 0; r < 8; r++) {
      const L = rows[r], y = ry0 + (7 - r) * rp;
      el('path', { d: `M350 ${y + 32} H400 M454 ${y + 20} H510 M454 ${y + 52} H510 M350 ${y + 32} V${y + 10} H660`, class: 'z-net' }, bels);
      el('rect', { x: 150, y, width: 200, height: 66, rx: 6, class: 'z-lut' }, bels);
      el('text', { x: 250, y: y + 30, class: 'z-bl' }, bels, `${L}6LUT`);
      el('text', { x: 250, y: y + 52, class: 'z-bl s' }, bels, 'LUT6 · 64-bit');
      el('rect', { x: 510, y: y + 4, width: 110, height: 28, rx: 4, class: 'z-ff' }, bels);
      el('text', { x: 565, y: y + 24, class: 'z-bl' }, bels, `${L}FF`);
      el('rect', { x: 510, y: y + 38, width: 110, height: 28, rx: 4, class: 'z-ff' }, bels);
      el('text', { x: 565, y: y + 58, class: 'z-bl' }, bels, `${L}FF2`);
      el('text', { x: 128, y: y + 38, class: 'z-bl s' }, bels, `${L}1–${L}6`);
    }
    const mux = (cx, cy, h, label) => {
      el('path', { d: `M${cx - 18} ${cy - h / 2} L${cx + 18} ${cy - h / 2 + 12} L${cx + 18} ${cy + h / 2 - 12} L${cx - 18} ${cy + h / 2} Z`, class: 'z-mux' }, bels);
      el('text', { x: cx, y: cy + h / 2 + 18, class: 'z-bl s' }, bels, label);
    };
    const rowMid = r => ry0 + (7 - r) * rp + 33;
    mux(675, (rowMid(0) + rowMid(1)) / 2, 70, 'F7MUX_AB'); mux(675, (rowMid(2) + rowMid(3)) / 2, 70, 'F7MUX_CD');
    mux(675, (rowMid(4) + rowMid(5)) / 2, 70, 'F7MUX_EF'); mux(675, (rowMid(6) + rowMid(7)) / 2, 70, 'F7MUX_GH');
    mux(760, (rowMid(1) + rowMid(2)) / 2, 120, 'F8MUX_BOT'); mux(760, (rowMid(5) + rowMid(6)) / 2, 120, 'F8MUX_TOP');
    mux(840, (rowMid(3) + rowMid(4)) / 2, 170, 'F9MUX');
    const ya = ry0 + 7 * rp;
    const pulse = el('circle', { r: 8, class: 'z-pulse' }, bels);
    pulse.style.offsetPath = `path('M90 ${ya + 38} H150 H350 H400 V${ya + 20} H454 H510 H620 H880')`;

    // L5: block RAM bits
    const bits = sc.querySelector('.z-bits');
    [[612, 330], [612, 580]].forEach(([bx, by]) => {
      for (let r = 0; r < 3; r++) for (let c = 0; c < 21; c++) {
        const b = el('rect', { x: bx + c * 13, y: by + r * 14, width: 10, height: 10, rx: 1 }, bits);
        b.style.animationDelay = (((c * 7 + r * 13) % 17) / 8).toFixed(2) + 's';
      }
    });

    Object.assign(zoom, { sc, layers, crumbs: Array.from(sc.querySelectorAll('.crumbs li')), text: sc.querySelector('.zoom-text'), stage: -1, lang: '' });
  }
  function zoomUpdate(sec) {
    if (!zoom.sc) return;
    const stage = isFinite(sec) ? Math.min(zoom.layers.length - 1, Math.floor(sec / LAYER_SEC)) : 4;
    const lang = document.documentElement.lang;
    if (stage === zoom.stage && lang === zoom.lang) return;
    zoom.stage = stage; zoom.lang = lang;
    zoom.layers.forEach((l, i) => { l.classList.toggle('now', i === stage); l.classList.toggle('past', i < stage); });
    zoom.crumbs.forEach((c, i) => { c.classList.toggle('on', i <= stage); c.classList.toggle('cur', i === stage); });
    swapText(zoom.text, T('f.l' + stage + 't'));
  }
  function zoomReset() {
    if (!zoom.sc) return;
    zoom.stage = -1;
    zoom.layers.forEach(l => { l.style.transition = 'none'; l.classList.remove('now', 'past'); });
    void zoom.sc.offsetWidth;
    zoom.layers.forEach(l => { l.style.transition = ''; });
  }

  /* ================= dashboards ================= */
  const dash = {};
  const TAB_SEC = 7;
  const nz = t => { const v = Math.sin(t * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v) - 0.5; };
  const smooth = t => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return nz(i) * (1 - u) + nz(i + 1) * u; };
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  const FONT = '"DM Sans","Noto Sans Armenian",system-ui,sans-serif', MONO = '"JetBrains Mono",ui-monospace,Menlo,monospace';
  function card(c, x, y, w, h, title) {
    rr(c, x, y, w, h, 12); c.fillStyle = '#0d2027'; c.fill(); c.strokeStyle = 'rgba(161,203,204,.18)'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#97b0b3'; c.font = `600 14px ${FONT}`; c.textAlign = 'left'; c.fillText(title, x + 16, y + 26);
  }
  function plot(c, n, x, y, w, h, fn, min, max, color, width) {
    c.beginPath();
    for (let i = 0; i <= n; i++) {
      const v = fn(i), px = x + (i / n) * w, py = y + h - ((v - min) / (max - min)) * h;
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.strokeStyle = color; c.lineWidth = width || 2; c.lineJoin = 'round'; c.stroke();
  }
  function gridLines(c, x, y, w, h, n) {
    c.strokeStyle = 'rgba(161,203,204,.08)'; c.lineWidth = 1;
    for (let i = 0; i <= n; i++) { const yy = y + (h / n) * i; c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.stroke(); }
  }
  function bigValue(c, txt, x, y, color) { c.fillStyle = color || '#f1eee6'; c.font = `700 30px ${MONO}`; c.textAlign = 'right'; c.fillText(txt, x, y); c.textAlign = 'left'; }

  function tabSensors(c, t) {
    const temp = tt => 24.6 + 0.6 * Math.sin(tt * 0.7) + 0.35 * smooth(tt * 3);
    card(c, 20, 70, 570, 270, T('dl.temp')); bigValue(c, temp(t).toFixed(1) + ' °C', 570, 104, '#eac883');
    gridLines(c, 36, 120, 538, 200, 4);
    plot(c, 160, 36, 120, 538, 200, i => temp(t - (160 - i) * 0.06), 23.4, 25.8, '#eac883', 2.4);
    card(c, 610, 70, 570, 270, T('dl.imu'));
    gridLines(c, 626, 120, 538, 200, 4);
    const ax = tt => 0.35 * Math.sin(tt * 2.1) + 0.12 * smooth(tt * 6), ay = tt => 0.25 * Math.sin(tt * 1.3 + 1) + 0.1 * smooth(tt * 5 + 9), az = tt => 1 + 0.08 * Math.sin(tt * 3.1) + 0.06 * smooth(tt * 7 + 3);
    [[ax, '#6fd3cc', 'X'], [ay, '#eac883', 'Y'], [az, '#7aa6e6', 'Z']].forEach(([f, col, lab], k) => {
      plot(c, 160, 626, 120, 538, 200, i => f(t - (160 - i) * 0.04), -0.8, 1.4, col, 2);
      c.fillStyle = col; c.font = `700 14px ${MONO}`; c.fillText(lab, 1060 + k * 36, 96);
    });
    // distance gauge
    card(c, 20, 360, 370, 270, T('dl.dist'));
    const d = 38 + 22 * Math.sin(t * 0.9) + 4 * smooth(t * 2), cx = 205, cy = 580, R = 120;
    c.lineWidth = 22; c.lineCap = 'round';
    c.beginPath(); c.arc(cx, cy, R, Math.PI, 2 * Math.PI); c.strokeStyle = 'rgba(161,203,204,.15)'; c.stroke();
    c.beginPath(); c.arc(cx, cy, R, Math.PI, Math.PI + Math.PI * Math.min(1, d / 100)); c.strokeStyle = '#6fd3cc'; c.stroke();
    c.lineCap = 'butt';
    c.fillStyle = '#f1eee6'; c.font = `700 36px ${MONO}`; c.textAlign = 'center'; c.fillText(d.toFixed(0) + ' cm', cx, cy - 20); c.textAlign = 'left';
    // potentiometer + switches
    card(c, 410, 360, 370, 270, T('dl.pot'));
    const v = 1.65 + 1.25 * Math.sin(t * 0.5);
    rr(c, 430, 410, 330, 26, 13); c.fillStyle = 'rgba(161,203,204,.12)'; c.fill();
    rr(c, 430, 410, 330 * v / 3.3, 26, 13); c.fillStyle = '#eac883'; c.fill();
    c.fillStyle = '#f1eee6'; c.font = `700 26px ${MONO}`; c.fillText(v.toFixed(2) + ' V', 430, 474);
    c.fillStyle = '#97b0b3'; c.font = `600 14px ${FONT}`; c.fillText(T('dl.sw'), 430, 520);
    const bits = Math.floor(t * 1.5) * 37 % 256;
    for (let i = 0; i < 8; i++) {
      const on = (bits >> (7 - i)) & 1, x = 432 + i * 41;
      rr(c, x, 534, 30, 40, 5); c.fillStyle = on ? '#6b4a35' : '#1a2a30'; c.fill();
      c.beginPath(); c.arc(x + 15, 596, 9, 0, Math.PI * 2); c.fillStyle = on ? '#fff3c4' : '#22383c';
      c.shadowColor = '#fff3c4'; c.shadowBlur = on ? 14 : 0; c.fill(); c.shadowBlur = 0;
    }
    // utilization
    card(c, 800, 360, 380, 270, T('dl.util'));
    [['LUT', .38], ['FF', .21], ['BRAM', .44], ['DSP', .18]].forEach(([lab, p], i) => {
      const y = 410 + i * 50;
      c.fillStyle = '#cfe3e1'; c.font = `600 15px ${MONO}`; c.fillText(lab, 820, y + 17);
      rr(c, 890, y, 220, 22, 11); c.fillStyle = 'rgba(161,203,204,.12)'; c.fill();
      rr(c, 890, y, 220 * p, 22, 11); c.fillStyle = i % 2 ? '#6fd3cc' : '#eac883'; c.fill();
      c.fillStyle = '#f1eee6'; c.textAlign = 'right'; c.fillText(Math.round(p * 100) + '%', 1165, y + 17); c.textAlign = 'left';
    });
  }

  function tabSignal(c, t) {
    card(c, 20, 70, 1160, 280, T('dl.raw') + '  ·  ' + T('dl.fir'));
    const k0 = Math.floor(t * 40);
    const raw = k => Math.sin(k * 0.11) + 0.42 * Math.sin(k * 1.73) + 0.28 * nz(k);
    const fil = k => 0.97 * Math.sin((k - 3) * 0.11);
    gridLines(c, 36, 110, 1128, 220, 4);
    plot(c, 300, 36, 110, 1128, 220, i => raw(k0 + i), -2, 2, 'rgba(122,166,230,.75)', 1.6);
    plot(c, 300, 36, 110, 1128, 220, i => fil(k0 + i), -2, 2, '#eac883', 3);
    c.font = `700 13px ${MONO}`; c.fillStyle = '#7aa6e6'; c.fillText('● raw', 960, 96); c.fillStyle = '#eac883'; c.fillText('● FIR', 1050, 96);
    card(c, 20, 370, 760, 260, T('dl.fft'));
    const nb = 64, bw = 700 / nb;
    for (let i = 0; i < nb; i++) {
      const base = 0.05 + 0.04 * (0.5 + nz(i * 3.1 + Math.floor(t * 6)));
      const rawM = Math.min(1, base + (i === 6 ? 0.92 : i === 5 || i === 7 ? 0.3 : 0) + (i === 41 ? 0.55 : i === 40 || i === 42 ? 0.16 : 0));
      const filM = i === 6 ? 0.9 : i === 5 || i === 7 ? 0.28 : base * 0.4;
      const x = 46 + i * bw, h = 190;
      c.fillStyle = 'rgba(122,166,230,.35)'; c.fillRect(x, 610 - rawM * h, bw - 2, rawM * h);
      c.fillStyle = '#eac883'; c.fillRect(x + 2, 610 - filM * h, bw - 6, filM * h);
    }
    card(c, 800, 370, 380, 260, T('dl.stats'));
    ['ADC → AXI-Stream', 'FIR · 64 taps · DSP48E2', 'FFT · 1024 points', 'AXI DMA → DDR4', 'Python · plot'].forEach((s, i) => {
      const y = 418 + i * 40, on = (Math.floor(t * 2.5) % 5) === i;
      c.beginPath(); c.arc(826, y - 5, 7, 0, Math.PI * 2); c.fillStyle = on ? '#eac883' : '#2c6a70'; c.fill();
      c.fillStyle = on ? '#f1eee6' : '#cfe3e1'; c.font = `600 16px ${MONO}`; c.fillText(s, 846, y);
    });
  }

  function scene3d(c, x, y, w, h, t, edges) {
    c.save(); rr(c, x, y, w, h, 8); c.clip();
    if (!edges) {
      const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#5b86a8'); g.addColorStop(.55, '#a9c2cf'); g.addColorStop(.56, '#6f6a5d'); g.addColorStop(1, '#3d3a33');
      c.fillStyle = g; c.fillRect(x, y, w, h);
    } else { c.fillStyle = '#02080a'; c.fillRect(x, y, w, h); }
    const line = col => { c.strokeStyle = col; c.lineWidth = 2.2; c.shadowColor = col; c.shadowBlur = 8; };
    // horizon
    if (edges) { line('#6fd3cc'); c.beginPath(); c.moveTo(x, y + h * 0.555); c.lineTo(x + w, y + h * 0.555); c.stroke(); }
    // box
    const bx = x + w * 0.18, by = y + h * 0.42;
    if (!edges) { c.fillStyle = '#c45a3c'; c.fillRect(bx, by, 120, 110); c.fillStyle = '#e07a56'; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 40, by - 34); c.lineTo(bx + 160, by - 34); c.lineTo(bx + 120, by); c.fill(); c.fillStyle = '#9c4630'; c.beginPath(); c.moveTo(bx + 120, by); c.lineTo(bx + 160, by - 34); c.lineTo(bx + 160, by + 76); c.lineTo(bx + 120, by + 110); c.fill(); }
    else { line('#f1eee6'); c.strokeRect(bx, by, 120, 110); c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 40, by - 34); c.lineTo(bx + 160, by - 34); c.lineTo(bx + 120, by); c.moveTo(bx + 160, by - 34); c.lineTo(bx + 160, by + 76); c.lineTo(bx + 120, by + 110); c.stroke(); }
    // rolling ball
    const px = x + w * (0.55 + 0.3 * Math.sin(t * 0.8)), py = y + h * 0.555 - 46;
    if (!edges) { const rg = c.createRadialGradient(px - 14, py - 14, 4, px, py, 46); rg.addColorStop(0, '#ffe9a6'); rg.addColorStop(1, '#c79a2e'); c.fillStyle = rg; c.beginPath(); c.arc(px, py, 46, 0, Math.PI * 2); c.fill(); }
    else { line('#eac883'); c.beginPath(); c.arc(px, py, 46, 0, Math.PI * 2); c.stroke(); }
    // sign post
    const sx = x + w * 0.82;
    if (!edges) { c.fillStyle = '#2e4b3a'; c.fillRect(sx, y + h * 0.2, 12, h * 0.36); c.fillStyle = '#3e7b52'; c.beginPath(); c.arc(sx + 6, y + h * 0.2, 44, 0, Math.PI * 2); c.fill(); }
    else { line('#6fd3cc'); c.strokeRect(sx, y + h * 0.2, 12, h * 0.36); c.beginPath(); c.arc(sx + 6, y + h * 0.2, 44, 0, Math.PI * 2); c.stroke(); }
    c.shadowBlur = 0; c.restore();
  }
  function tabVision(c, t) {
    card(c, 20, 70, 570, 420, T('dl.cam')); scene3d(c, 36, 110, 538, 364, t, false);
    card(c, 610, 70, 570, 420, T('dl.edge')); scene3d(c, 626, 110, 538, 364, t, true);
    // scanning line on the edge view
    const sy = 110 + ((t * 120) % 364); c.fillStyle = 'rgba(234,200,131,.18)'; c.fillRect(626, sy, 538, 3);
    card(c, 20, 510, 1160, 120, 'MIPI → PL → DisplayPort');
    const chips = ['MIPI CSI-2', 'Demosaic', 'Sobel filter · PL', 'VDMA → DDR4', 'DisplayPort'];
    let x = 40;
    chips.forEach((s, i) => {
      c.font = `600 17px ${MONO}`; const w = c.measureText(s).width + 36;
      const on = (Math.floor(t * 2) % chips.length) === i;
      rr(c, x, 554, w, 46, 23); c.fillStyle = on ? 'rgba(234,200,131,.2)' : 'rgba(111,211,204,.08)'; c.fill();
      c.strokeStyle = on ? '#eac883' : 'rgba(111,211,204,.4)'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#f1eee6'; c.fillText(s, x + 18, 583);
      x += w + 14;
      if (i < chips.length - 1) { c.fillStyle = '#eac883'; c.fillText('→', x - 12, 583); x += 14; }
    });
    c.fillStyle = '#97b0b3'; c.font = `600 15px ${MONO}`; c.textAlign = 'right'; c.fillText('1280×720 · 60 fps', 1160, 583); c.textAlign = 'left';
  }

  function initDash() {
    const cv = document.querySelector('canvas.dash');
    if (!cv) return;
    Object.assign(dash, { cv, ctx: cv.getContext('2d'), last: null });
  }
  function dashUpdate(sec) {
    if (!dash.cv) return;
    const t = isFinite(sec) ? sec : 3;
    const key = t.toFixed(3) + document.documentElement.lang;
    if (key === dash.last) return;
    dash.last = key;
    const c = dash.ctx;
    c.setTransform(2, 0, 0, 2, 0, 0);
    c.fillStyle = '#08141a'; c.fillRect(0, 0, 1200, 650);
    const tab = Math.floor(t / TAB_SEC) % 3;
    // header
    c.fillStyle = '#0d2027'; c.fillRect(0, 0, 1200, 54);
    c.fillStyle = '#f1eee6'; c.font = `700 17px ${FONT}`; c.textAlign = 'left'; c.fillText('SemiTec Lab · AUP-ZU3', 20, 34);
    let x = 300;
    ['dl.tab1', 'dl.tab2', 'dl.tab3'].forEach((k, i) => {
      c.font = `600 15px ${FONT}`; const w = c.measureText(T(k)).width + 34;
      if (i === tab) { rr(c, x, 12, w, 32, 16); c.fillStyle = 'rgba(234,200,131,.16)'; c.fill(); }
      c.fillStyle = i === tab ? '#eac883' : '#97b0b3'; c.fillText(T(k), x + 17, 33);
      x += w + 10;
    });
    c.beginPath(); c.arc(1000, 28, 6, 0, Math.PI * 2); c.fillStyle = Math.floor(t * 2) % 2 ? '#43a047' : '#7dff7d'; c.fill();
    c.fillStyle = '#7dff7d'; c.font = `700 13px ${MONO}`; c.fillText('LIVE', 1012, 33);
    c.fillStyle = '#779397'; c.font = `500 12px ${FONT}`; c.textAlign = 'right'; c.fillText(T('dl.example'), 1185, 33); c.textAlign = 'left';
    // body with a short fade between tabs
    const local = t % TAB_SEC;
    c.globalAlpha = isFinite(sec) ? Math.min(1, local / 0.45) : 1;
    [tabSensors, tabSignal, tabVision][tab](c, t);
    c.globalAlpha = 1;
    // tab progress
    c.fillStyle = 'rgba(234,200,131,.7)'; c.fillRect(0, 52, 1200 * (local / TAB_SEC), 2);
  }

  /* ================= API ================= */
  window.SceneFX = {
    init() { initBoards(); initTour(); initZoom(); initDash(); },
    update(scene, sec) {
      if (scene.classList.contains('s-tour')) tourUpdate(sec);
      else if (scene.classList.contains('s-zoom')) zoomUpdate(sec);
      else if (scene.classList.contains('s-dash')) dashUpdate(sec);
    },
    reset(scene) {
      if (scene.classList.contains('s-tour')) tourReset();
      else if (scene.classList.contains('s-zoom')) zoomReset();
      else if (scene.classList.contains('s-dash')) dash.last = null;
    }
  };
})();
