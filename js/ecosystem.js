/* ==========================================================================
   The ending of the 2D page: the package and the ecosystem.
   After Connect, the docked chip map flies back to the centre and closes into
   its PACKAGE: a sealed lid with the SemiTec logo. Only the contacts stay
   outside: become a partner, become a supporter, contact us, email.
   Scrolling on zooms the camera out, and new modules (universities, industry,
   researchers, schools …, from SITE_CONTENT.ecosystem) connect to the
   package's side leads one by one with traces drawn in by the scroll.
   World units: the package is 300 × 228 (the same proportions as the die),
   centred on 0,0. mode-read.js / mode-signal.js call render(), layout() and setStage(0…3).
   ========================================================================== */
(function () {
  const ST = window.ST;
  const PW = 300, PH = 228, LEAD = 14, NTB = 14, NSIDE = 10;
  const leadX = j => -PW / 2 + (j + .5) * PW / NTB;          /* top / bottom leads */
  const leadY = j => -PH / 2 + (j + .5) * PH / NSIDE;        /* left / right leads */
  const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M5 29 17 9l6 10 4-6 9 16H5Z"/><path d="m12 29 7-11 6 11"/></svg>';


  /* where the modules sit: two columns beside the package (wide screens) or rows above and below it (phones) */
  function place(isWide) {
    const list = (SITE_CONTENT.ecosystem || []).slice(0, 8);
    const half = Math.ceil(list.length / 2), out = [];
    const W = isWide ? 250 : 210, H = isWide ? 92 : 92;
    list.forEach((m, k) => {
      const right = k >= half, r = right ? k - half : k, n = right ? list.length - half : half;
      let x, y;
      if (isWide) { const ys = n <= 1 ? [0] : Array.from({ length: n }, (_, i) => -240 + i * 480 / (n - 1)); x = right ? 480 : -480; y = ys[r]; }
      else { const ys = [-385, -270, 270, 385]; x = right ? 115 : -115; y = ys[r % 4] + (r >= 4 ? 190 : 0); }
      out.push({ m, x, y, w: W, h: H, side: right ? 1 : -1 });
    });
    out.push({ free: true, x: 0, y: isWide ? -310 : -500, w: W, h: H, side: -1 });   /* the next module: yours */
    /* traces: package side lead → bus → module. Each side splits into the modules above and below
       the package; the order of leads and bus lanes is chosen so no two traces cross. */
    for (const side of [-1, 1]) for (const up of [true, false]) {
      const g = out.filter(o => o.side === side && (o.y < 0) === up);
      g.sort((a, b) => isWide ? Math.abs(b.y) - Math.abs(a.y) : Math.abs(a.y) - Math.abs(b.y));
      g.forEach((o, i) => {
        const j = up ? 1 + 2 * i : NSIDE - 2 - 2 * i;
        const sx = side * (PW / 2 + LEAD), sy = leadY(j);
        const bus = isWide ? side * (PW / 2 + 100 + i * 18) : side * (Math.max(...out.map(q => Math.abs(q.x) + q.w / 2)) + 14 + i * 9);
        const edge = Math.abs(o.x - o.w / 2 - bus) < Math.abs(o.x + o.w / 2 - bus) ? o.x - o.w / 2 : o.x + o.w / 2;
        Object.assign(o, { lead: j, d: `M${sx} ${sy.toFixed(1)}H${bus}V${o.y}H${edge}` });
      });
    }
    return out;
  }
  function bounds(list) {
    let x0 = -200, x1 = 200, y0 = -200, y1 = 200;
    list.forEach(o => { x0 = Math.min(x0, o.x - o.w / 2 - 30); x1 = Math.max(x1, o.x + o.w / 2 + 30); y0 = Math.min(y0, o.y - o.h / 2 - 10); y1 = Math.max(y1, o.y + o.h / 2 + 10); });
    return { x0, x1, y0, y1 };
  }

  /* one ending = one instance: the 2D page has one (ST.eco), the 3D journey another (ST.makeEco) */
  function makeEco(opts = {}) {
  let el, stage, world, mods = [], copyP, copyA, copyB, endCta, wide = null, geo = null;
  function contactLink() {
    const row = ((SITE_CONTENT.contact || {}).rows || [])[0];
    return { href: row && row.href ? row.href : '#support/contact', label: row ? ST.pick(row.label) : 'Email', value: row ? ST.pick(row.value) : '' };
  }
  function packageHTML() {
    const lead = (cls, l, t, w, h) => `<i class="ep-lead${cls}" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px"></i>`;
    let leads = '';
    for (let j = 0; j < NTB; j++) {
      const x = leadX(j) - 4;
      leads += lead(j === 4 || j === 9 ? ' is-live' : '', x, -PH / 2 - LEAD, 8, LEAD) + lead(j === 4 || j === 9 ? ' is-live' : '', x, PH / 2, 8, LEAD);
    }
    const live = new Set(geo.map(o => `${o.side}:${o.lead}`));
    for (let j = 0; j < NSIDE; j++) {
      const y = leadY(j) - 4;
      leads += lead(live.has(`-1:${j}`) ? ' is-live' : '', -PW / 2 - LEAD, y, LEAD, 8) + lead(live.has(`1:${j}`) ? ' is-live' : '', PW / 2, y, LEAD, 8);
    }
    const mail = contactLink();
    /* the four labelled contacts: partner + supporter on top, contact + email below */
    const pin = (cls, x, y, href, text, sub) => `<a class="eco-pin ${cls}" href="${ST.esc(href)}" style="left:${x}px;top:${y}px"><b>${ST.esc(text)}</b>${sub ? `<small>${ST.esc(sub)}</small>` : ''}</a>`;
    return `<div class="ep-leads" aria-hidden="true">${leads}</div>
      <div class="eco-package" style="left:${-PW / 2}px;top:${-PH / 2}px;width:${PW}px;height:${PH}px">
        <div class="ep-lid"><i class="ep-dot" aria-hidden="true"></i>
          <div class="ep-logo">${LOGO}<span><strong>SEMITEC</strong><em>${ST.esc(ST.pick(SITE_CONTENT.brand.subtitle))}</em></span></div>
          <p class="ep-tag">EDUCATION · SCIENCE · TECHNOLOGY</p>
          <p class="ep-lot" aria-hidden="true">ST-${new Date().getFullYear()} · AM · 0001</p>
        </div>
      </div>
      ${pin('is-partner is-left', leadX(4), -PH / 2 - LEAD - 16, '#support/partner', '+ ' + ST.text('becomePartner'), ST.text('freePad'))}
      ${pin('is-supporter is-right', leadX(9), -PH / 2 - LEAD - 16, '#donate', '+ ' + ST.text('becomeSupporter'), ST.text('freePad'))}
      ${pin('is-contact is-left is-below', leadX(4), PH / 2 + LEAD + 16, '#support/contact', ST.text('contactUs'), ST.text('feedbackTitle'))}
      ${pin('is-contact is-right is-below', leadX(9), PH / 2 + LEAD + 16, mail.href, mail.label, mail.value)}`;
  }
  /* 3D only: the chip's topology (the same floorplan as the 2D map), drawn where the package will close */
  function topoHTML() {
    const L = buildChipLayout(SITE_CONTENT.sections, CHIP_LAYOUT, SITE_CONTENT.partners || []);
    const blocks = SITE_CONTENT.sections.map(sc => [sc, L.blocks[sc.id]]).filter(([, b]) => b).map(([sc, b]) =>
      `<g class="tp-block${b.kind === 'power' ? ' is-power' : ''}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="6"/><text x="${b.x + 20}" y="${b.y + 46}">${ST.esc(ST.pick(sc.label))}</text></g>`).join('');
    const pads = L.pads.map(p => `<rect class="tp-pad is-${p.kind}${p.free ? ' is-free' : ''}" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="2"/>`).join('');
    return `<svg class="eco-topo" viewBox="0 0 ${L.width} ${L.height}" style="left:${-PW / 2}px;top:${-PH / 2}px;width:${PW}px;height:${PH}px" aria-hidden="true">
      <rect class="tp-die" x="0" y="0" width="${L.width}" height="${L.height}" rx="8"/>
      <g class="tp-quiet">${L.quiet.map(d => `<path d="${d}"/>`).join('')}</g><g class="tp-rails">${L.rails.map(d => `<path d="${d}"/>`).join('')}</g>
      <g class="tp-wires">${L.wires.map(d => `<path d="${d}"/>`).join('')}</g><path class="tp-route" d="${L.route}"/>${blocks}${pads}</svg>`;
  }
  function moduleHTML(o, k) {
    const style = `left:${o.x - o.w / 2}px;top:${o.y - o.h / 2}px;width:${o.w}px;height:${o.h}px`;
    const pins = `<span class="em-pins" aria-hidden="true">${'<i></i>'.repeat(6)}</span>`;
    if (o.free) return `<a class="eco-mod is-free" href="#support/partner" data-k="${k}" style="${style};--k:${k}">${pins}<strong>+ ${ST.esc(ST.text('ecoFree'))}</strong><small>${ST.esc(ST.text('ecoFreeNote'))}</small></a>`;
    return `<a class="eco-mod" href="#${ST.esc(o.m.path || 'support/partner')}" data-k="${k}" data-color="${o.m.color || 'gold'}" style="${style};--k:${k}">${pins}<strong>${ST.esc(ST.pick(o.m.title))}</strong><small>${ST.esc(ST.pick(o.m.note))}</small></a>`;
  }

  function build() {
    geo = place(wide);
    const b = bounds(geo);
    world.innerHTML = `<svg class="eco-traces" viewBox="${b.x0 - 50} ${b.y0 - 50} ${b.x1 - b.x0 + 100} ${b.y1 - b.y0 + 100}" style="left:${b.x0 - 50}px;top:${b.y0 - 50}px;width:${b.x1 - b.x0 + 100}px;height:${b.y1 - b.y0 + 100}px" aria-hidden="true">
        <g class="et-stems"><path d="M${leadX(4)} ${-PH / 2 - LEAD}v-16M${leadX(9)} ${-PH / 2 - LEAD}v-16M${leadX(4)} ${PH / 2 + LEAD}v16M${leadX(9)} ${PH / 2 + LEAD}v16"/></g>
        ${geo.map((o, k) => `<g class="et${o.free ? ' is-free' : ''}" style="--k:${k}" data-k="${k}" data-color="${o.free ? 'free' : o.m.color || 'gold'}"><path class="et-base" d="${o.d}" pathLength="1"/><path class="et-draw" d="${o.d}" pathLength="1"/><path class="et-flow" d="${o.d}" pathLength="1"/></g>`).join('')}
      </svg>
      ${opts.topo ? topoHTML() : ''}
      ${packageHTML()}
      ${geo.map(moduleHTML).join('')}`;
    el.style.setProperty('--n', geo.length);
    mods = geo.map((o, k) => ({ o, el: world.querySelector(`.eco-mod[data-k="${k}"]`), tr: world.querySelector(`.et[data-k="${k}"]`) }));
    geo.bounds = b;
  }

  const Eco = {};
  Eco.render = function (container) {
    el = container;
    el.classList.add('eco');
    el.innerHTML = `<div class="eco-stage">
        <div class="eco-board" aria-hidden="true"></div>
        <div class="eco-copy">
          <div class="eco-p" aria-hidden="true"><p class="sec-eyebrow"><span class="sec-rule" aria-hidden="true"></span><span>${ST.esc(ST.text('partnersKicker'))}</span></p>
            <h2 class="eco-title">${ST.esc(ST.text('partnersTitle'))}</h2><p class="eco-text">${ST.esc(ST.text('partnersText'))}</p></div>
          <div class="eco-a"><p class="sec-eyebrow"><span class="sec-rule" aria-hidden="true"></span><span>${ST.esc(ST.text('endKicker'))}</span></p>
            <h2 class="eco-title">${ST.esc(ST.text('endTitle'))}</h2><p class="eco-text">${ST.esc(ST.text('endText'))}</p></div>
          <div class="eco-b" aria-hidden="true"><p class="sec-eyebrow"><span class="sec-rule" aria-hidden="true"></span><span>${ST.esc(ST.text('ecoKicker'))}</span></p>
            <h2 class="eco-title">${ST.esc(ST.text('ecoTitle'))}</h2><p class="eco-text">${ST.esc(ST.text('ecoText'))}</p></div>
        </div>
        <div class="eco-view"><div class="eco-world"></div></div>
        <p class="eco-cue"><span class="scroll-mouse" aria-hidden="true"><i></i></span>${ST.esc(ST.text('endScroll'))}</p>
        <div class="eco-end">
          <a class="btn-primary" href="#support/partner"><span>${ST.esc(ST.text('becomePartner'))}</span><span aria-hidden="true">→</span></a>
          <a class="eco-ghost" href="#donate">${ST.esc(ST.text('becomeSupporter'))}</a>
          <a class="eco-ghost" href="#overview" data-top>${ST.esc(ST.text('backTop'))} ↑</a>
        </div>
      </div>`;
    stage = el.querySelector('.eco-stage'); world = el.querySelector('.eco-world');
    copyP = el.querySelector('.eco-p'); copyA = el.querySelector('.eco-a'); copyB = el.querySelector('.eco-b'); endCta = el.querySelector('.eco-end');
    wide = null; Eco.layout();
    const was = Eco.stage || 0; Eco.stage = -1; Eco.setStage(was);
  };
  /* rebuild when the screen switches between the wide and the phone layout */
  Eco.layout = function () {
    if (!el) return;
    const w = innerWidth > 900;
    if (w !== wide) { wide = w; build(); }
    fitWorld();
  };
  /* the package's rect on screen at the start of the ending: the docked map flies into it */
  Eco.packageRect = function () {
    const r = el && el.querySelector('.eco-package'); if (!r) return null;
    const b = r.getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height };
  };

  /* The ending has four switching points (the caller decides when; CSS times the animations):
       1  topology  — the whole chip, top view, in the middle of the screen, with every partner's and supporter's name
       2  partners  — the chip turns slowly in 3D to show its contact edges and everyone connected to them
       3  package   — the chip shrinks into place, the board darkens, the lid closes over it, the four contacts appear
       4  ecosystem — the modules connect one by one, then the ways to join appear
     The chip itself is the view's chip map (2D: the docked map; 3D: its own map in this layer). */
  /* show the current step at once, without its animations (used when switching views inside the ending) */
  Eco.snap = function () {
    if (!el) return;
    el.classList.add('eco-snap');
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => el.classList.remove('eco-snap'), 60)));
  };
  Eco.setStage = function (n) {
    if (!el || n === Eco.stage) return;
    Eco.stage = n;
    el.classList.toggle('st-topo', n >= 1);
    el.classList.toggle('st-partners', n === 2);
    el.classList.toggle('st-pack', n >= 3);
    el.classList.toggle('st-eco', n >= 4);
    copyP.setAttribute('aria-hidden', String(n !== 2)); copyA.setAttribute('aria-hidden', String(n !== 3)); copyB.setAttribute('aria-hidden', String(n < 4));
  };
  /* the chip map's rect so that its die lands exactly where the package lid closes */
  Eco.packMapRect = function () {
    const r = el && el.querySelector('.eco-package'); if (!r) return null;
    const b = r.getBoundingClientRect(), w = b.width * 1080 / 1000, h = b.height * 820 / 760;
    return { l: b.left + b.width / 2 - w / 2, t: b.top + b.height / 2 - h / 2, w, h };
  };
  /* where the whole chip sits for the topology and the partners' turn: the stage between the copy and the bottom */
  Eco.bigRect = function () {
    const v = el && el.querySelector('.eco-view'); if (!v) return null;
    const vr = v.getBoundingClientRect(), top = wide ? 150 : 128, bot = wide ? 84 : 128;
    const w = Math.min(vr.width - 32, 1100), h = Math.max(120, vr.height - top - bot);
    return { l: vr.left + (vr.width - w) / 2, t: vr.top + top, w, h };
  };
  function fitWorld() {
    if (!el || !geo) return;
    const vr = el.querySelector('.eco-view').getBoundingClientRect(), W = vr.width, H = vr.height;
    const top = wide ? 150 : 128, bot = wide ? 84 : 128;
    const area = { x: 16, y: top, w: W - 32, h: Math.max(120, H - top - bot) };
    const b = geo.bounds;
    const s = Math.min(area.w / (b.x1 - b.x0), area.h / (b.y1 - b.y0)) * .97, cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
    world.style.transform = `translate(${(area.x + area.w / 2 - cx * s).toFixed(1)}px,${(area.y + area.h / 2 - cy * s).toFixed(1)}px) scale(${s.toFixed(4)})`;
    el.style.setProperty('--inv', (1 / s).toFixed(3));
  }
  Eco.place = fitWorld;
  return Eco;
  }
  ST.makeEco = makeEco;
  ST.eco = makeEco();
})();
