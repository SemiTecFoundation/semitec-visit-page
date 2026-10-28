/* ==========================================================================
   ChipMap — the interactive foundation map used by the 2D reading view.
   The same CSS-3D die can be seen from the top (flat) or tilted (3D).
   • follows the page while you read (camera flies block → block)
   • drag / swipe to move, Ctrl/⌘+scroll, pinch or +/− to zoom,
     double-click to zoom in, arrows / + / − / 0 on the keyboard
   • any manual move switches to "Free view"; "Follow page" (or reaching the
     next section) brings the camera back
   • the floorplan is generated from content.js (js/chiplayout.js): equal tiles,
     submenus as cells, the power unit (Support) along the bottom feeding every tile
   • zooming in reveals the cell names
   • minimap + full-screen mode for exploring
   ========================================================================== */
(function () {
  const ST = window.ST;
  const sections = SITE_CONTENT.sections;
  const L = buildChipLayout(sections, CHIP_LAYOUT, SITE_CONTENT.partners || []);
  const NS = 'http://www.w3.org/2000/svg';
  const FOLLOW_ZOOM = 1.9, DIVE_ZOOM = 3.6, MIN_Z = .75, MAX_Z = 5;

  /* ---------- route geometry (pure maths) ---------- */
  function buildRoute(d) {
    const tok = d.match(/[MHV]|-?\d+(\.\d+)?/g), pts = [];
    let x = 0, y = 0, cmd = 'M';
    for (let k = 0; k < tok.length; k++) {
      const t = tok[k];
      if (/[MHV]/.test(t)) { cmd = t; continue; }
      if (cmd === 'M') { x = +t; y = +tok[++k]; } else if (cmd === 'H') x = +t; else y = +t;
      pts.push({ x, y });
    }
    const acc = [0];
    for (let k = 1; k < pts.length; k++) acc.push(acc[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y));
    const total = acc[acc.length - 1];
    const at = L0 => {
      const Lc = ST.clamp(L0, 0, total); let k = 1;
      while (k < acc.length - 1 && acc[k] < Lc) k++;
      const f = (Lc - acc[k - 1]) / (acc[k] - acc[k - 1] || 1);
      return { x: pts[k - 1].x + (pts[k].x - pts[k - 1].x) * f, y: pts[k - 1].y + (pts[k].y - pts[k - 1].y) * f };
    };
    const checkpoints = [0]; let cursor = 0;
    sections.slice(1).forEach(s => {
      const b = L.blocks[s.id]; if (!b) { checkpoints.push(cursor); return; }
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2; let best = Infinity, bestL = cursor;
      for (let l = cursor; l <= total; l += 2) { const q = at(l), dd = (q.x - cx) ** 2 + (q.y - cy) ** 2; if (dd < best) { best = dd; bestL = l; } }
      checkpoints.push(bestL); cursor = bestL + 1;
    });
    const distanceAt = p => { const i0 = Math.floor(p), i1 = Math.min(checkpoints.length - 1, i0 + 1); return ST.lerp(checkpoints[i0], checkpoints[i1], ST.dwell(p - i0)); };
    return { total, at, distanceAt };
  }
  function stop(i, zoom) {
    const s = sections[i], b = s && L.blocks[s.id];
    if (i <= 0 || !b) return { x: L.width / 2, y: L.height / 2, z: 1 };
    return { x: b.x + b.w / 2, y: b.kind === 'power' ? b.y + b.h * .15 : b.y + b.h / 2, z: b.kind === 'power' ? Math.max(1, zoom * .62) : zoom };
  }
  /* page position (0…8) → camera, with dwell easing and a small zoom-out mid-flight */
  function cameraAt(p) {
    const i0 = Math.floor(p), i1 = Math.min(sections.length - 1, i0 + 1), t = ST.dwell(p - i0);
    const a = stop(i0, FOLLOW_ZOOM), b = stop(i1, FOLLOW_ZOOM);
    const dip = i0 > 0 && i1 !== i0 ? Math.sin(t * Math.PI) * .35 : 0;
    return { x: ST.lerp(a.x, b.x, t), y: ST.lerp(a.y, b.y, t), z: ST.lerp(a.z, b.z, t) - dip };
  }

  class ChipMap {
    constructor(frame, opts = {}) {
      this.frame = frame; this.onSelect = opts.onSelect || (() => {});
      this.route = buildRoute(L.route);
      this.view = 'tilt';                         // 'tilt' (3D) or 'top'
      try { const v = localStorage.getItem('st-map-view'); if (v === 'top' || v === 'tilt') this.view = v; } catch (e) {}
      this.cam = { x: 500, y: 380, z: 1, tilt: this.view === 'tilt' ? 1 : 0, dive: 0 };
      this.tgt = { ...this.cam };
      this.p = 0; this.index = 0; this.following = true; this.expanded = false;
      this.pointers = new Map(); this.moved = 0; this.raf = 0; this.last = 0; this.anim = false;
      this.build(); this.bind(); this.resize(); this.text();
    }

    /* ---------- DOM ---------- */
    build() {
      const f = this.frame;
      f.classList.add('chipmap');
      f.innerHTML = `
        <div class="cm-viewport" tabindex="0" role="application" data-ui-label="mapCaption">
          <div class="cm-world">
            <div class="cm-plate" aria-hidden="true"></div>
            <div class="cm-side cm-side-front" aria-hidden="true"></div><div class="cm-side cm-side-right" aria-hidden="true"></div>
            <div class="cm-surface" aria-hidden="true"></div>
            <svg class="cm-nets" viewBox="0 0 ${L.width} ${L.height}" aria-hidden="true">
              <g class="cm-quiet">${L.quiet.map(d => `<path d="${d}"/>`).join('')}</g>
              <g class="cm-wires">${L.wires.map(d => `<path d="${d}"/>`).join('')}</g>
              <g class="cm-rails">${L.rails.map(d => `<path d="${d}"/>`).join('')}</g>
              <path class="cm-flow" d="${L.route}"/><path class="cm-draw" d="${L.route}" pathLength="1"/><path class="cm-active" d="${L.route}"/>
              <circle class="cm-halo" r="16"/><circle class="cm-signal" r="5"/>
            </svg>
            <div class="cm-die-label" aria-hidden="true"><strong>SEMITEC</strong><span>EDUCATION · SCIENCE · TECHNOLOGY</span></div>
            <div class="cm-blocks"></div>
            <div class="cm-pads">${L.pads.map(p => `<button type="button" class="cm-pad cm-pad-${p.side} is-${p.kind}${p.free ? ' is-free' : ''}" data-pad="${p.id}" style="left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px"><span></span></button>`).join('')}</div>
          </div>
        </div>
        <div class="cm-top-ui">
          <div class="cm-caption"><i class="status-light"></i><span data-ui="mapCaption"></span></div>
          <div class="cm-status" data-state="follow">
            <span class="cm-status-dot"></span><span class="cm-status-text"></span>
            <button type="button" class="cm-follow"><span data-ui="mapRecenter"></span> ⌖</button>
          </div>
        </div>
        <div class="cm-controls">
          <div class="cm-view" role="group">
            <button type="button" data-view="top" data-ui="mapTop"></button><button type="button" data-view="tilt" data-ui="map3d"></button>
          </div>
          <div class="cm-zoom">
            <button type="button" class="cm-in" data-ui-label="zoomIn">+</button>
            <span class="cm-zval">100%</span>
            <button type="button" class="cm-out" data-ui-label="zoomOut">−</button>
          </div>
          <button type="button" class="cm-expand" data-ui-label="expand"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5"/></svg></button>
        </div>
        <svg class="cm-minimap" viewBox="-20 -20 ${L.width + 40} ${L.height + 40}" aria-hidden="true">
          <rect class="mm-die" x="0" y="0" width="${L.width}" height="${L.height}" rx="10"/>
          <g class="mm-blocks"></g><polygon class="mm-view" points="0,0"/>
        </svg>
        <div class="cm-supporters"><span class="cm-sup-title"></span>${(SITE_CONTENT.partners || []).filter(p => p.kind === 'supporter').map(p => `<button type="button" data-sup="${p.id}"></button>`).join('')}<button type="button" class="is-free" data-sup="free-supporter-0"></button></div>
        <div class="cm-pad-card" hidden><button type="button" class="cm-pad-close" aria-label="Close">×</button><span class="cm-pad-kind"></span><strong class="cm-pad-name"></strong><p class="cm-pad-note"></p><div class="cm-pad-links"></div></div>
        <div class="cm-hint" aria-live="polite"></div>
        <p class="cm-help" data-ui="mapHelp"></p>`;
      this.viewport = f.querySelector('.cm-viewport');
      this.world = f.querySelector('.cm-world');
      this.net = f.querySelector('.cm-active');
      this.signal = f.querySelector('.cm-signal'); this.halo = f.querySelector('.cm-halo');
      this.net.style.strokeDasharray = `${this.route.total} ${this.route.total}`;
      this.status = f.querySelector('.cm-status'); this.zval = f.querySelector('.cm-zval');
      this.mmView = f.querySelector('.mm-view'); this.hint = f.querySelector('.cm-hint');
      this.blocks = [];
      const box = f.querySelector('.cm-blocks'), mm = f.querySelector('.mm-blocks');
      sections.forEach((s, i) => {
        const b = L.blocks[s.id]; if (!i || !b) return;
        const el = document.createElement('div');
        el.className = 'cm-block' + (b.kind === 'power' ? ' cm-power' : ''); el.dataset.index = i; el.style.setProperty('--i', i);
        Object.assign(el.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' });
        el.innerHTML = `<button type="button" class="cm-top" data-path="${s.id}">
            <span class="cm-num">${ST.pad(i)} /${b.kind === 'power' ? ' <b class="cm-kicker"></b>' : ''}</span><span class="cm-name"></span></button>
          <div class="cm-cells">${(s.children || []).map(c => `<button type="button" data-path="${s.id}/${c.id}"><span></span>${c.children && c.children.length ? `<em>+${c.children.length}</em>` : ''}</button>`).join('')}</div>`;
        const bank = ST.bankFor && ST.bankFor(s.id);
        if (bank) {   /* memory bits: one lit bit per item stored in this section's memory bank */
          const n = ST.memoryItems(bank.id).length, size = Math.max(16, Math.ceil(n / 8) * 8);
          el.insertAdjacentHTML('beforeend', `<div class="cm-bits" data-bank-color="${bank.color || 'gold'}" aria-hidden="true">${Array.from({ length: size }, (_, k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</div>`);
        }
        box.append(el); this.blocks.push({ el, i, s });
        const r = document.createElementNS(NS, 'rect');
        Object.entries({ x: b.x, y: b.y, width: b.w, height: b.h, rx: 6, 'data-index': i }).forEach(([k, v]) => r.setAttribute(k, v));
        mm.append(r);
      });
      this.mmRects = [...mm.children];
      this.padEls = [...f.querySelectorAll('.cm-pad')];
      this.drawPath = f.querySelector('.cm-draw');
      this.built = -1;
    }
    /* The opening build-up (b 0…1, scroll-scrubbed by mode-read.js): the section blocks appear one by
       one in reading order, then the connections (signal route, bus lanes, power rails), then the
       bond pads around the edge — partners, supporters and the free contacts. b = 1 is the normal map. */
    setBuild(b) {
      b = ST.clamp(b);
      if (Math.abs(b - this.built) < 1e-4) return;
      this.built = b;
      const f = this.frame, set = (el, k, v) => el.style.setProperty(k, v.toFixed(3));
      f.classList.toggle('is-building', b < 1);
      const n = this.blocks.length;
      this.blocks.forEach(({ el }, k) => set(el, '--show', ST.clamp((b - (.02 + k * .32 / Math.max(1, n - 1))) / .08)));
      set(f, '--lbl', ST.clamp((b - .38) / .06));
      const t = ST.clamp((b - .45) / .2);
      this.drawPath.style.strokeDashoffset = (1 - t).toFixed(4);
      set(f, '--drawn', 1 - ST.clamp((b - .66) / .06));
      set(f, '--conn', ST.clamp((b - .6) / .08));
      set(f, '--rail', ST.clamp((b - .6) / .1));
      set(f, '--sig', ST.clamp((b - .66) / .06));
      const m = this.padEls.length;
      this.padEls.forEach((el, k) => set(el, '--show', ST.clamp((b - (.7 + k * .17 / Math.max(1, m - 1))) / .04)));
      set(f, '--wire', ST.clamp((b - .72) / .16));
      return b < .44 ? 1 : b < .7 ? 2 : 3;
    }
    /* the ending (v 0…1, scroll-scrubbed): the camera blends from following the page to the whole chip in top view */
    setOutro(v) {
      v = ST.clamp(v);
      if (Math.abs(v - (this.outro || 0)) < 1e-4) return;
      this.outro = v;
      if (v > 0 && !this.following) { this.following = true; this.paintStatus(); if (this.padId) this.showPad(null); }
      if (this.following) this.applyFollow();
      this.wake();
    }
    text() {
      this.blocks.forEach(({ el, s }) => {
        el.querySelector('.cm-name').textContent = ST.pick(s.label);
        el.querySelectorAll('.cm-cells button').forEach((btn, k) => btn.firstElementChild.textContent = ST.pick(s.children[k].title));
        const kick = el.querySelector('.cm-kicker'); if (kick) kick.textContent = ST.text('powerUnit');
        el.querySelector('.cm-top').setAttribute('aria-label', ST.pick(s.label));
      });
      this.frame.querySelectorAll('[data-pad]').forEach(el => {
        if (el.classList.contains('is-free')) { const sup = el.classList.contains('is-supporter'); el.firstElementChild.textContent = '+ ' + ST.text(sup ? 'becomeSupporter' : 'becomePartner'); el.setAttribute('aria-label', `${ST.text('freePad')}: ${ST.text(sup ? 'becomeSupporter' : 'becomePartner')}`); return; }
        const p = (SITE_CONTENT.partners || []).find(q => q.id === el.dataset.pad);
        el.firstElementChild.textContent = ST.pick(p.name);
        el.setAttribute('aria-label', `${ST.text(p.kind === 'supporter' ? 'supporterKind' : 'partnerKind')}: ${ST.pick(p.name)}`);
      });
      const sup = this.frame.querySelector('.cm-supporters');
      sup.querySelector('.cm-sup-title').textContent = ST.text('supportersTitle');
      sup.querySelectorAll('[data-sup]').forEach(b => {
        const p = (SITE_CONTENT.partners || []).find(q => q.id === b.dataset.sup);
        b.textContent = p ? ST.pick(p.name) : ST.text('joinShort');
        b.title = p ? ST.pick(p.name) : ST.text('becomeSupporter');
      });
      if (this.padId) this.showPad(this.padId);
      this.paintStatus(); this.paintView();
    }
    /* a small card for a partner / supporter pad */
    showPad(id) {
      this.padId = id;
      this.frame.querySelectorAll('[data-pad]').forEach(el => el.classList.toggle('is-open', el.dataset.pad === id));
      this.frame.querySelectorAll('[data-sup]').forEach(el => el.classList.toggle('is-open', el.dataset.sup === id));
      if (!id) { this.padCard.hidden = true; return; }
      const c = this.padCard;
      if (id.startsWith('free-')) {   /* a free contact: invite the visitor to take it */
        const sup = id.startsWith('free-supporter');
        c.dataset.kind = sup ? 'supporter' : 'partner';
        c.querySelector('.cm-pad-kind').textContent = ST.text('freePad');
        c.querySelector('.cm-pad-name').textContent = ST.text(sup ? 'freeSupporterTitle' : 'freePartnerTitle');
        c.querySelector('.cm-pad-note').textContent = ST.text('freeNote');
        c.querySelector('.cm-pad-links').innerHTML = `<a href="#" data-path="${sup ? 'donate' : 'support/partner'}">${ST.esc(ST.text(sup ? 'becomeSupporter' : 'becomePartner'))} →</a>`;
        c.hidden = false; return;
      }
      const p = (SITE_CONTENT.partners || []).find(q => q.id === id); if (!p) return;
      c.dataset.kind = p.kind;
      c.querySelector('.cm-pad-kind').textContent = ST.text(p.kind === 'supporter' ? 'supporterKind' : 'partnerKind');
      c.querySelector('.cm-pad-name').textContent = ST.pick(p.name);
      c.querySelector('.cm-pad-note').textContent = ST.text('padsNote');
      c.querySelector('.cm-pad-links').innerHTML =
        (p.url ? `<a href="${ST.esc(p.url)}" target="_blank" rel="noopener">${ST.esc(ST.text('visitSite'))} ↗</a>` : '') +
        `<a href="#people/partners" data-path="${p.kind === 'supporter' ? 'donate' : 'people/partners'}">${ST.esc(p.kind === 'supporter' ? ST.pick(sections.find(s => s.id === 'donate')?.label || ['Support', 'Աջակցել']) : ST.text('openPartners'))} →</a>`;
      c.hidden = false;
    }

    /* ---------- input ---------- */
    bind() {
      const v = this.viewport, f = this.frame;
      v.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.pointers.size === 1) this.moved = 0;
        if (this.pointers.size === 2) this.pinch = this.pinchState();
      });
      v.addEventListener('pointermove', e => {
        const p = this.pointers.get(e.pointerId); if (!p) return;
        const dx = e.clientX - p.x, dy = e.clientY - p.y;
        p.x = e.clientX; p.y = e.clientY;
        if (this.pointers.size === 1) {
          this.moved += Math.abs(dx) + Math.abs(dy);
          if (this.moved > 5) {
            if (!v.hasPointerCapture(e.pointerId)) try { v.setPointerCapture(e.pointerId); } catch (err) {}
            v.classList.add('is-dragging'); this.free(); this.panBy(dx, dy, true, ...this.offset(e.clientX, e.clientY));
          }
        } else if (this.pointers.size === 2 && this.pinch) {
          const now = this.pinchState();
          this.free(); this.moved = 99;
          this.zoomAt(now.cx, now.cy, now.d / this.pinch.d, true);
          this.panBy(now.cx - this.pinch.cx, now.cy - this.pinch.cy, true, ...this.offset(now.cx, now.cy));
          this.pinch = now;
        }
      });
      const up = e => {
        this.pointers.delete(e.pointerId); this.pinch = this.pointers.size === 2 ? this.pinchState() : null;
        if (!this.pointers.size) v.classList.remove('is-dragging');
      };
      v.addEventListener('pointerup', up); v.addEventListener('pointercancel', up);
      v.addEventListener('click', e => {
        if (this.moved > 5) { e.preventDefault(); e.stopPropagation(); return; }
        const pad = e.target.closest('[data-pad]'); if (pad) { this.showPad(pad.dataset.pad); return; }
        const b = e.target.closest('[data-path]'); if (b) this.onSelect(b.dataset.path.split('/'));
      }, true);
      v.addEventListener('dblclick', e => { if (e.target.closest('[data-path]')) return; this.free(); this.zoomAt(e.clientX, e.clientY, 1.8); });
      v.addEventListener('wheel', e => {
        if (this.expanded || e.ctrlKey || e.metaKey) {
          e.preventDefault(); this.free();
          const k = e.ctrlKey && Math.abs(e.deltaY) < 40 ? .012 : .0025;   // trackpad pinch arrives as ctrl+wheel
          this.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * k));
        } else this.flashHint(ST.text('zoomHint'));
      }, { passive: false });
      v.addEventListener('keydown', e => {
        const step = 70, map = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
        if (map[e.key]) { e.preventDefault(); this.free(); this.panBy(...map[e.key]); }
        else if (e.key === '+' || e.key === '=') { this.free(); this.zoomBy(1.35); }
        else if (e.key === '-' || e.key === '_') { this.free(); this.zoomBy(1 / 1.35); }
        else if (e.key === '0') this.follow();
      });
      f.querySelector('.cm-in').addEventListener('click', () => { this.free(); this.zoomBy(1.4); });
      f.querySelector('.cm-out').addEventListener('click', () => { this.free(); this.zoomBy(1 / 1.4); });
      f.querySelector('.cm-follow').addEventListener('click', () => this.follow());
      this.padCard = f.querySelector('.cm-pad-card');
      f.querySelector('.cm-pad-close').addEventListener('click', () => this.showPad(null));
      this.padCard.addEventListener('click', e => { const a = e.target.closest('[data-path]'); if (a) { e.preventDefault(); this.showPad(null); this.onSelect(a.dataset.path.split('/')); } });
      f.querySelector('.cm-supporters').addEventListener('click', e => { const b = e.target.closest('[data-sup]'); if (b) this.showPad(this.padId === b.dataset.sup ? null : b.dataset.sup); });
      f.querySelector('.cm-expand').addEventListener('click', () => this.setExpanded(!this.expanded));
      f.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => this.setView(b.dataset.view)));
      /* minimap: click or drag to move the camera there */
      const mm = f.querySelector('.cm-minimap');
      const mmMove = e => {
        const r = mm.getBoundingClientRect(), vb = mm.viewBox.baseVal;
        this.free();
        this.tgt.x = ST.clamp(vb.x + (e.clientX - r.left) / r.width * vb.width, 0, L.width);
        this.tgt.y = ST.clamp(vb.y + (e.clientY - r.top) / r.height * vb.height, 0, L.height);
        this.wake();
      };
      mm.addEventListener('pointerdown', e => { mm.setPointerCapture(e.pointerId); mmMove(e); mm.onpointermove = mmMove; });
      mm.addEventListener('pointerup', () => { mm.onpointermove = null; });
      addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (this.padId) this.showPad(null); else if (this.expanded) this.setExpanded(false); });
      new ResizeObserver(() => { this.resize(); }).observe(v);
    }
    pinchState() {
      const [a, b] = [...this.pointers.values()];
      return { cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, d: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)) };
    }

    /* ---------- camera maths ---------- */
    /* the tilted chip is drawn a little smaller and looked at slightly below its centre, so it sits well in the frame */
    scaleOf(c = this.cam) { return this.fit * (1 - .14 * c.tilt) * c.z; }
    lookY(c = this.cam) { return c.y + 40 * c.tilt; }
    angles(c = this.cam) { return { rx: (c.tilt * 50 + c.dive * 24) * Math.PI / 180, rz: (c.tilt * -22 - c.dive * 8) * Math.PI / 180 }; }
    /* exact inverse of the world transform: a screen offset (px from the viewport centre) → chip-space offset.
       forward: v = Rz·(w−c);  rotateX: y' = v.y·cos a, z' = v.y·sin a;  perspective d: × d/(d−z');  then × s */
    unproject(ox, oy, c = this.cam) {
      const s = this.scaleOf(c), d = 1500, { rx, rz } = this.angles(c);
      const X = ox / s, Y = oy / s, ca = Math.cos(rx), sa = Math.sin(rx);
      const vy = Y * d / Math.max(1, d * ca + Y * sa), vx = X * (d - vy * sa) / d;
      return { x: vx * Math.cos(-rz) - vy * Math.sin(-rz), y: vx * Math.sin(-rz) + vy * Math.cos(-rz) };
    }
    /* move the map with the pointer: the chip point under the finger stays under the finger */
    panBy(dx, dy, immediate, ax = 0, ay = 0) {
      const a = this.unproject(ax - dx, ay - dy, this.tgt), b = this.unproject(ax, ay, this.tgt);
      this.tgt.x = ST.clamp(this.tgt.x - (b.x - a.x), 0, L.width); this.tgt.y = ST.clamp(this.tgt.y - (b.y - a.y), 0, L.height);
      if (immediate) { this.cam.x = this.tgt.x; this.cam.y = this.tgt.y; }
      this.wake();
    }
    offset(clientX, clientY) { const r = this.viewport.getBoundingClientRect(); return [clientX - r.left - r.width / 2, clientY - r.top - r.height / 2]; }
    zoomAt(clientX, clientY, factor, immediate) {
      const r = this.viewport.getBoundingClientRect(), ox = clientX - r.left - r.width / 2, oy = clientY - r.top - r.height / 2;
      const z0 = this.tgt.z, z1 = ST.clamp(z0 * factor, MIN_Z, MAX_Z);
      const w0 = this.unproject(ox, oy, this.tgt), w1 = this.unproject(ox, oy, { ...this.tgt, z: z1 });
      this.tgt.z = z1;
      this.tgt.x = ST.clamp(this.tgt.x + w0.x - w1.x, 0, L.width); this.tgt.y = ST.clamp(this.tgt.y + w0.y - w1.y, 0, L.height);
      if (immediate) Object.assign(this.cam, { x: this.tgt.x, y: this.tgt.y, z: this.tgt.z });
      this.wake();
    }
    zoomBy(f) { const r = this.viewport.getBoundingClientRect(); this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, f); }

    /* ---------- modes of the camera ---------- */
    free() { if (this.following) { this.following = false; this.paintStatus(); } }
    follow() { this.following = true; this.paintStatus(); this.applyFollow(); this.wake(); }
    applyFollow() {
      const c = cameraAt(this.p), o = ST.smoothstep(this.outro || 0), v = this.view === 'tilt' ? 1 : 0;
      Object.assign(this.tgt, { x: ST.lerp(c.x, L.width / 2, o), y: ST.lerp(c.y, L.height / 2, o), z: ST.lerp(c.z, 1, o), tilt: ST.lerp(v, 0, o) });
    }
    setView(v) {
      this.view = v; this.tgt.tilt = v === 'tilt' ? 1 : 0;
      try { localStorage.setItem('st-map-view', v); } catch (e) {}
      this.paintView(); this.wake();
    }
    paintView() { this.frame.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === this.view))); }
    paintStatus() {
      this.status.dataset.state = this.following ? 'follow' : 'free';
      this.status.querySelector('.cm-status-text').textContent = ST.text(this.following ? 'mapFollow' : 'mapFree');
    }
    flashHint(msg) {
      this.hint.textContent = msg; this.hint.classList.add('is-on');
      clearTimeout(this.hintT); this.hintT = setTimeout(() => this.hint.classList.remove('is-on'), 1400);
    }

    /* the page tells the map where the reader is (0…8, fractional) */
    setScroll(p) { this.p = p; if (this.following) this.applyFollow(); this.wake(); }
    setActive(i) {
      if (i === this.index) return;
      this.index = i;
      if (this.padId) this.showPad(null);
      this.blocks.forEach(b => b.el.classList.toggle('is-active', b.i === i));
      if (!this.following && !this.expanded && !this.pointers.size) this.follow();   // a new section brings the camera back
    }

    /* ---------- transitions with the 3D journey ---------- */
    /* dive into the active block before the 3D view takes over */
    dive(index) {
      this.free(); this.anim = true;
      const from = { ...this.cam }, to = { ...stop(Math.max(1, index), DIVE_ZOOM), tilt: 1, dive: 1 };
      return ST.tween(700, t => { for (const k in to) this.cam[k] = ST.lerp(from[k], to[k], t); Object.assign(this.tgt, this.cam); this.draw(); }, t => t * t * t)
        .then(() => { this.anim = false; });
    }
    /* coming back from 3D: start inside the block, then rise to the reading view */
    surface(index) {
      const dive = { ...stop(Math.max(1, index), DIVE_ZOOM), tilt: 1, dive: 1 };
      Object.assign(this.cam, dive); Object.assign(this.tgt, dive); this.draw();
    }
    rise() {
      this.following = true; this.paintStatus(); this.anim = true;
      const from = { ...this.cam };
      return ST.tween(1100, t => {
        const c = cameraAt(this.p), to = { x: c.x, y: c.y, z: c.z, tilt: this.view === 'tilt' ? 1 : 0, dive: 0 };
        for (const k in to) this.cam[k] = ST.lerp(from[k], to[k], t);
        Object.assign(this.tgt, this.cam); this.draw();
      }, ST.easeOut).then(() => { this.anim = false; this.wake(); });
    }

    setExpanded(on) {
      if (on === this.expanded) return;
      const run = () => {
        this.expanded = on; this.frame.classList.toggle('is-expanded', on);
        document.documentElement.classList.toggle('map-expanded', on);
        const b = this.frame.querySelector('.cm-expand'); b.dataset.uiLabel = on ? 'collapse' : 'expand'; b.setAttribute('aria-label', ST.text(b.dataset.uiLabel));
        this.resize(); this.draw();
        if (on) this.viewport.focus({ preventScroll: true }); else this.follow();
      };
      if (document.startViewTransition && !ST.state.reduced) { const vt = document.startViewTransition(run); vt.ready.catch(() => {}); vt.finished.catch(() => {}); } else run();
    }

    /* ---------- drawing ---------- */
    resize() {
      const r = this.viewport.getBoundingClientRect();
      this.W = r.width; this.H = r.height;
      this.fit = Math.max(.05, Math.min(this.W / 1080, this.H / 820));
      this.draw();
    }
    wake() { if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(t => this.tick(t)); } }
    tick(now) {
      this.raf = 0;
      const dt = Math.max(0, Math.min(64, now - this.last)); this.last = now;
      const k = ST.state.reduced ? 1 : 1 - Math.pow(1 - .14, dt / 16.67);
      let busy = false;
      if (!this.anim) for (const key of ['x', 'y', 'z', 'tilt', 'dive']) {
        const d = this.tgt[key] - this.cam[key];
        if (Math.abs(d) > (key === 'z' || key === 'tilt' || key === 'dive' ? .0004 : .02)) { this.cam[key] += d * k; busy = true; } else this.cam[key] = this.tgt[key];
      }
      this.draw();
      if (busy) this.wake();
    }
    draw() {
      if (!this.W) return;
      const c = this.cam, s = this.scaleOf(c), cy = this.lookY(c), { rx, rz } = this.angles(c);
      const flat = c.tilt < .002 && c.dive < .002;   // pure top view: a plain 2D transform keeps text sharp when zoomed
      this.world.style.transform = `translate(${(this.W / 2).toFixed(1)}px,${(this.H / 2).toFixed(1)}px) scale(${s.toFixed(4)})` +
        (flat ? '' : ` perspective(1500px) rotateX(${(rx * 180 / Math.PI).toFixed(2)}deg) rotateZ(${(rz * 180 / Math.PI).toFixed(2)}deg)`) +
        ` translate(${(-c.x).toFixed(1)}px,${(-cy).toFixed(1)}px)`;
      this.frame.classList.toggle('is-flat', flat);
      this.frame.style.setProperty('--tilt', c.tilt.toFixed(3));
      this.frame.style.setProperty('--inv', (1 / s).toFixed(3));
      /* level of detail: when blocks are big enough on screen, show their paths */
      this.frame.classList.toggle('lod-detail', s > .82);
      this.zval.textContent = Math.round(c.z * 100) + '%';
      /* blocks rise as the reader approaches them */
      this.blocks.forEach(b => {
        const near = ST.clamp(1 - Math.abs(this.p - b.i) * 1.4);
        const lift = (4 + 26 * ST.smoothstep(near)) * c.tilt + 2;
        b.el.style.setProperty('--near', near.toFixed(3));
        b.el.style.setProperty('--lift', lift.toFixed(2) + 'px');
      });
      this.mmRects.forEach(r => r.classList.toggle('is-active', +r.dataset.index === this.index));
      const pi = sections.findIndex(sc => sc.id === L.power);
      this.frame.style.setProperty('--power', (pi > 0 ? ST.clamp(1 - Math.abs(this.p - pi) * 1.4) : 0).toFixed(3));
      /* signal along the trace — always tied to the page, not the camera */
      const dist = this.route.distanceAt(this.p), q = this.route.at(dist);
      this.net.style.strokeDashoffset = (this.route.total - dist).toFixed(1);
      this.signal.setAttribute('cx', q.x); this.signal.setAttribute('cy', q.y);
      this.halo.setAttribute('cx', q.x); this.halo.setAttribute('cy', q.y);
      /* minimap viewport (approximate in 3D view) */
      const pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => { const w = this.unproject(sx * this.W / 2, sy * this.H / 2); return `${(c.x + w.x).toFixed(0)},${(cy + w.y).toFixed(0)}`; });
      this.mmView.setAttribute('points', pts.join(' '));
      this.frame.classList.toggle('is-zoomed', c.z > 1.12 || this.expanded);
    }
  }
  ST.ChipMap = ChipMap;
  ST.chipCameraAt = cameraAt;
})();
