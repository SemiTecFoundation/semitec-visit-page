/* ==========================================================================
   2D view — "Read". A long page built from SITE_CONTENT, with the
   interactive chip map docked beside it.
   Scroll → position 0…8 → map camera, signal trace, section reveals.
   Reveal maths: JS writes --enter / --exit / --prog on each section and the
   CSS derives every staggered animation from them (see css/read.css).
   ========================================================================== */
(function () {
  const ST = window.ST, sections = SITE_CONTENT.sections, LAST = sections.length - 1;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const ANCHOR = .4;

  const R = ST.modes['2d'] = {};
  let main, intro, outro, map, on = false, raf = 0, last = 0, dockShown = 0;
  let tops = [], target = 0, smooth = 0, index = -1, openPath = null, cache = new WeakMap();

  /* ---------- markup ---------- */
  function title(text) {
    let w = 0;
    return text.split('\n').map(line => line.split(' ').map(word => `<span class="w" style="--w:${w++}"><span>${ST.esc(word)}</span></span>`).join(' ')).join('<br>');
  }
  function media(node) {
    const m = SITE_CONTENT.media[node.media]; if (!m) return '';
    return `<figure class="sec-media"><button type="button" data-media="${node.media}" data-media-title="${ST.esc(ST.pick(node.label || node.title))}">
      <span class="sm-frame"><img src="${m.src}" alt="${ST.esc(ST.pick(m.alt))}" loading="lazy" decoding="async"></span>
      <figcaption><span class="sm-kicker">${ST.esc(ST.text('mediaType'))}</span><strong>${ST.esc(ST.pick(m.title))}</strong><span class="sm-view">${ST.esc(ST.text('viewImage'))} ↗</span></figcaption>
    </button></figure>`;
  }
  /* outside links (e.g. SemiTec Academy): open in a new tab */
  const linksHTML = (links, cls) => (links || []).length ? `<p class="${cls}">${links.map(l => l.href[0] === '#' ? `<a href="${ST.esc(l.href)}">${ST.esc(ST.pick(l.label))} →</a>` : `<a href="${ST.esc(l.href)}" target="_blank" rel="noopener">${ST.esc(ST.pick(l.label))} ↗</a>`).join('')}</p>` : '';
  /* a row of product cards inside a path (e.g. SemiTec Academy): picture, title, short text and links */
  const showcaseHTML = list => (list || []).length ? `<div class="pc-show" style="--n:${list.length}">${list.map((it, k) => {
    const m = SITE_CONTENT.media[it.media];
    return `<article class="pc-show-card" style="--k:${k}" data-show="${k}">
      ${m ? `<div class="psc-img"><img src="${ST.esc(m.src)}" alt="${ST.esc(ST.pick(m.alt))}" loading="lazy" decoding="async"></div>` : ''}
      <div class="psc-body"><strong>${ST.esc(ST.pick(it.title))}</strong><p>${ST.esc(ST.pick(it.intro))}</p>
      ${linksHTML(it.links, 'psc-links')}<button type="button" class="psc-more">${ST.esc(ST.text('showMore'))} ↗</button></div></article>`;
  }).join('')}</div>` : '';
  function pathCard(section, child, c) {
    const p = `${section.id}/${child.id}`;
    const items = (child.items || []).map(it => `<li>${ST.esc(ST.pick(it))}</li>`).join('');
    const sub = (child.children || []).map(g => `<div class="pc-sub-item">
        <strong>${ST.esc(ST.pick(g.title))}</strong>
        <span>${g.items && g.items.length ? g.items.map(it => ST.esc(ST.pick(it))).join(' · ') : ST.esc(ST.pick(g.intro || ''))}</span>
        ${linksHTML(g.links, 'pc-sub-links')}
      </div>`).join('');
    return `<article class="path-card" id="card-${section.id}-${child.id}" data-path="${p}" style="--c:${c}">
      <button type="button" class="pc-head" aria-expanded="false" aria-controls="body-${section.id}-${child.id}">
        <span class="pc-n">${ST.pad(c + 1)}</span><span class="pc-t">${ST.esc(ST.pick(child.title))}</span>
        ${child.children && child.children.length ? `<span class="pc-count">+${child.children.length}</span>` : ''}<span class="pc-x" aria-hidden="true"></span>
      </button>
      <div class="pc-body" id="body-${section.id}-${child.id}"><div class="pc-inner">
        <p class="pc-intro">${ST.esc(ST.pick(child.intro))}</p>
        ${(child.text || []).map(t => `<p class="pc-text">${ST.esc(ST.pick(t))}</p>`).join('')}
        ${items ? `<ul class="pc-items">${items}</ul>` : ''}
        ${linksHTML(child.links, 'pc-links')}
        ${showcaseHTML(child.showcase)}
        ${sub ? `<p class="pc-sub-label">${ST.esc(ST.text('further'))}</p><div class="pc-sub">${sub}</div>` : ''}
      </div></div>
    </article>`;
  }
  /* Support = the chip's power unit. Payment links are placeholders until the foundation chooses a provider. */
  let giveMode = 'pulse';
  function givePanel() {
    const amt = ST.esc(ST.text('amountTbc'));
    return `<div class="give-panel" data-mode-give="${giveMode}">
      <div class="gp-head"><span class="gp-kicker"><i class="status-light"></i>${ST.esc(ST.text('powerUnit'))}</span><span>${ST.esc(ST.text('powerOn'))}</span></div>
      <div class="gp-switch" role="group">
        <button type="button" data-give="pulse" aria-pressed="${giveMode === 'pulse'}"><span class="gp-wave gp-pulse" aria-hidden="true"></span>${ST.esc(ST.text('giveOnce'))}</button>
        <button type="button" data-give="clock" aria-pressed="${giveMode === 'clock'}"><span class="gp-wave gp-clock" aria-hidden="true"></span>${ST.esc(ST.text('giveMonthly'))}</button>
      </div>
      <div class="gp-amounts">${[1, 2, 3].map(() => `<span class="gp-amount">${amt}</span>`).join('')}</div>
      <button type="button" class="gp-donate" disabled><span>${ST.esc(ST.text('donateSoon'))}</span><span aria-hidden="true">↗</span></button>
      <a class="gp-where" href="#transparency/reports">${ST.esc(ST.text('whereGoes'))} →</a>
    </div>`;
  }
  /* Events: upcoming events (gold, on the path) and the memory block (past events = gallery) */
  function eventsPanel() {
    const { upcoming, past } = ST.events();
    const list = upcoming.length ? upcoming.map((e, k) => `<li style="--c:${k}"><span class="ev-dot" aria-hidden="true"></span>
        <span class="ev-date">${ST.esc(ST.fmtDate(e.when))}</span><span class="ev-title">${ST.esc(ST.pick(e.title))}</span><span class="ev-place">${ST.esc(ST.pick(e.place))}</span></li>`).join('')
      : `<li class="ev-none">${ST.esc(ST.text('noUpcoming'))}</li>`;
    return `<div class="events-panel">
      <div class="ev-col"><p class="ev-head"><i class="status-light"></i>${ST.esc(ST.text('upcomingTitle'))}</p><ol class="ev-list">${list}</ol></div>
      <div class="ev-col"><p class="ev-head">${ST.esc(ST.text('memoryTitle'))} <span class="ev-count">${past.length} ${ST.esc(ST.text('stored'))}</span></p>
        <p class="ev-intro">${ST.esc(ST.text('memoryIntro'))}</p>${ST.memoryGridHTML('gallery')}
        <button type="button" class="ev-open" data-open-memory="gallery">${ST.esc(ST.text('openGallery'))} ↗</button></div>
      <p class="ev-note">${ST.esc(ST.text('exampleNote'))}</p>
    </div>`;
  }
  /* Impact / Trust: their memory bank (projects, reports) */
  function memoryPanel(bank) {
    const n = ST.memoryItems(bank.id).length;
    return `<div class="events-panel memory-panel" data-bank-color="${bank.color || 'gold'}">
      <div class="ev-col"><p class="ev-head">${ST.esc(ST.text('memoryView').toUpperCase())} · ${ST.esc(ST.pick(bank.title).toUpperCase())} <span class="ev-count">${n} ${ST.esc(ST.text('stored'))}</span></p>
        <p class="ev-intro">${ST.esc(ST.pick(bank.intro))}</p>${ST.memoryGridHTML(bank.id)}
        <button type="button" class="ev-open" data-open-memory="${bank.id}">${ST.esc(ST.pick(bank.open))} ↗</button>
        <p class="ev-note">${ST.esc(ST.text('exampleNote'))}</p></div>
    </div>`;
  }
  /* People: partners & supporters, the same gold pads as on the chip edge */
  function padStrip() {
    const list = SITE_CONTENT.partners || []; if (!list.length) return '';
    return `<div class="pad-strip"><p class="ps-head">${ST.esc(ST.text('padsTitle'))}</p><p class="ps-intro">${ST.esc(ST.text('padsIntro'))}</p>
      <div class="ps-pads">${list.map(p => `<span class="ps-pad is-${p.kind}">${ST.esc(ST.pick(p.name))} <em>${ST.esc(ST.text(p.kind === 'supporter' ? 'supporterKind' : 'partnerKind'))}</em></span>`).join('')}
        <a class="ps-pad is-free is-partner" href="#support/partner">+ ${ST.esc(ST.text('becomePartner'))} <em>${ST.esc(ST.text('freePad'))}</em></a>
        <a class="ps-pad is-free is-supporter" href="#donate">+ ${ST.esc(ST.text('becomeSupporter'))} <em>${ST.esc(ST.text('freePad'))}</em></a></div>
      <p class="ps-note">${ST.esc(ST.text('padsNote'))}</p></div>`;
  }
  /* Connect: contact details and a feedback form; sending is connected later */
  function contactPanel() {
    const rows = (SITE_CONTENT.contact && SITE_CONTENT.contact.rows) || [];
    return `<div class="contact-panel">
      <div class="cp-info"><p class="cp-head">${ST.esc(ST.text('contactTitle'))}</p>
        ${rows.map(r => `<div class="cp-row"><span>${ST.esc(ST.pick(r.label))}</span><strong>${r.href ? `<a href="${ST.esc(r.href)}">${ST.esc(ST.pick(r.value))}</a>` : ST.esc(ST.pick(r.value))}</strong></div>`).join('')}</div>
      <form class="cp-form" onsubmit="return false"><p class="cp-head">${ST.esc(ST.text('feedbackTitle'))}</p>
        <label>${ST.esc(ST.text('fName'))}<input type="text" name="name" autocomplete="name"></label>
        <label>${ST.esc(ST.text('fEmail'))}<input type="email" name="email" autocomplete="email"></label>
        <label>${ST.esc(ST.text('fOrg'))}<input type="text" name="organization" autocomplete="organization"></label>
        <label>${ST.esc(ST.text('fCategory'))}<select name="category">${(SITE_CONTENT.formCategories || []).map(c => `<option>${ST.esc(ST.pick(c))}</option>`).join('')}</select></label>
        <label>${ST.esc(ST.text('fArea'))}<input type="text" name="area"></label>
        <label>${ST.esc(ST.text('fMessage'))}<textarea name="message"></textarea></label>
        <label class="cp-consent"><input type="checkbox" name="consent"> ${ST.esc(ST.text('fConsent'))}</label>
        <p class="cp-unavailable">${ST.esc(ST.text('formUnavailable'))}</p>
        <button type="submit" class="cp-send" disabled>${ST.esc(ST.text('fSend'))}</button></form>
    </div>`;
  }
  /* The opening story (pinned while you scroll; the page itself does not move):
       0  the empty chip floats in the middle
       1  it moves aside; on the right, the foundation at a glance (numbers, what's next)
       2… one card per section introduces it, then flies into the chip and becomes its block
       …  the connections (one signal through every section), then the edge contacts (partners, supporters, free)
       last the two ways to explore. Then the page releases and the map docks on the left.
     In this part the chip is a fixed object: no zoom or drag, only a slow float. Its blocks can be clicked. */
  function chooseBlock() {
    return `<div class="choose story" id="choose"><div class="choose-pin">${ST.story.html('2d')}</div></div>`;
  }
  function render() {
    const html = sections.map((s, i) => {
      const H = i === 0 ? 'h1' : 'h2';
      const eyebrow = i === 0 ? ST.text('beginning') : ST.pick(s.label);
      const items = (s.items || []).map((it, c) => `<li style="--c:${c}">${ST.esc(ST.pick(it))}</li>`).join('');
      const kids = (s.children || []);
      return `<section class="sec${i === 0 ? ' sec-hero' : ''}" id="${s.id}" data-index="${i}" aria-labelledby="h-${s.id}">
        <div class="sec-ghost" aria-hidden="true">${ST.pad(i)}</div>
        <div class="sec-inner">
          <p class="sec-eyebrow"><span class="sec-num">${ST.pad(i)}</span><span class="sec-rule" aria-hidden="true"></span><span>${ST.esc(eyebrow)}</span></p>
          <${H} class="sec-title" id="h-${s.id}">${title(ST.pick(s.title))}</${H}>
          <p class="sec-intro">${ST.esc(ST.pick(s.intro))}</p>
          ${(s.text || []).map(t => `<p class="sec-text">${ST.esc(ST.pick(t))}</p>`).join('')}
          ${i === 0 ? `<ul class="hero-tags">${items}</ul>
             <div class="hero-actions">
               <span class="hero-cue"><span class="scroll-mouse" aria-hidden="true"><i></i></span>${ST.esc(ST.text('scrollBegin'))}</span>
             </div>
        </div>${chooseBlock()}<div>` : `
          ${media(s)}
          <ul class="sec-items">${items}</ul>
          ${s.id === 'events' ? eventsPanel() : ''}
          ${s.id !== 'events' && ST.bankFor(s.id) ? memoryPanel(ST.bankFor(s.id)) : ''}
          ${s.id === CHIP_LAYOUT.power ? givePanel() : ''}
          ${s.id === 'support' ? contactPanel() : ''}
          ${kids.length ? `<div class="paths"><p class="paths-label">${ST.esc(ST.text('pathsLabel'))}</p><div class="path-grid">${kids.map((k, c) => pathCard(s, k, c)).join('')}</div></div>` : ''}
          ${s.id === 'people' ? padStrip() : ''}`}
        </div>
      </section>`;
    });
    intro.innerHTML = html[0]; storyLast = -1;
    main.innerHTML = html.slice(1).join('');
    ST.eco.render(outro);
    cache = new WeakMap();
    if (openPath) setCard(openPath, true, true);
  }

  /* ---------- path cards ---------- */
  function setCard(path, open, instant) {
    const card = document.getElementById(`card-${path[0]}-${path[1]}`); if (!card) return null;
    /* the clicked card keeps its place on screen while a longer card above it closes */
    const y0 = card.getBoundingClientRect().top;
    let closedAbove = false;
    if (open) $$('.path-card.is-open').forEach(c => { if (c !== card && c.closest('.sec') === card.closest('.sec')) { if (c.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING) closedAbove = true; toggle(c, false, instant); } });
    toggle(card, open, instant);
    if (closedAbove) {
      const t0 = performance.now();
      const hold = () => { const dy = card.getBoundingClientRect().top - y0; if (Math.abs(dy) > .5) scrollBy({ top: dy, behavior: 'instant' }); if (performance.now() - t0 < 700) requestAnimationFrame(hold); };
      if (instant) requestAnimationFrame(hold); else hold();
    }
    openPath = open ? [path[0], path[1]] : null;
    return card;
  }
  function toggle(card, open, instant) {
    if (instant) card.classList.add('no-anim');
    card.classList.toggle('is-open', open);
    card.querySelector('.pc-head').setAttribute('aria-expanded', String(open));
    if (instant) requestAnimationFrame(() => card.classList.remove('no-anim'));
    setTimeout(() => { measure(); readScroll(); }, instant ? 0 : 420);
  }

  /* ---------- scroll → position ---------- */
  function measure() {
    const y0 = scrollY, els = $$('.sec');
    tops = els.map(el => el.getBoundingClientRect().top + y0);
    tops.push(tops[LAST] + els[LAST].offsetHeight);
  }
  let lastY = scrollY;
  function readScroll() {
    if (!on) return;
    if (ST.sound) { ST.sound.motion(Math.abs(scrollY - lastY) / 140); } lastY = scrollY;
    const a = ANCHOR * innerHeight;
    const y = scrollY + a * ST.clamp(scrollY / Math.max(1, a));   // the very top of the page is always the overview
    let p = 0;
    for (let i = 0; i <= LAST; i++) if (y >= tops[i]) p = i + ST.clamp((y - tops[i]) / Math.max(1, tops[i + 1] - tops[i]));
    if (scrollY >= document.documentElement.scrollHeight - innerHeight - 2) p = LAST;
    target = ST.clamp(p, 0, LAST);
    if (ST.state.reduced) smooth = target;
    const i = Math.min(LAST, Math.floor(target + 1e-4));
    if (i !== index) { index = i; ST.report(i, [sections[i].id]); map.setActive(i); $$('.sec').forEach(s => s.classList.toggle('is-active', +s.dataset.index === i)); }
    ST.progress(target / LAST);
    wake();
  }
  function wake() { if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function tick(now) {
    raf = 0;
    const dt = Math.max(0, Math.min(64, now - last)); last = now;
    const k = ST.state.reduced ? 1 : 1 - Math.pow(1 - .12, dt / 16.67);
    smooth += (target - smooth) * k;
    if (Math.abs(target - smooth) < .0004) smooth = target;
    reveal();
    map.setScroll(mapP());
    if (smooth !== target) wake();
  }
  /* while you read a section the map stays on its block; it travels to the next one during the last part of the section */
  function mapPos(p) { const i = Math.floor(p), f = p - i; return i + ST.smoothstep(ST.clamp((f - .68) / .32)); }
  /* while the map is in the centre it shows the whole chip; at the switching point it flies in to Purpose */
  function mapP() { return state === 'center' ? 0 : Math.max(1, mapPos(smooth)); }
  function setVar(el, name, v) {
    let c = cache.get(el); if (!c) cache.set(el, c = {});
    const s = v.toFixed(3); if (c[name] !== s) { el.style.setProperty(name, s); c[name] = s; }
  }
  /* The map's choreography. Hidden on the first screen, it fades in at the centre of the "two ways
     to explore" screen and scrolls with it. There are two switching points:
     • when that screen reaches the header, the map slides to the left column (desktop) or to a strip
       at the top (phones) in a short timed animation;
     • when the ending reaches the header (after Connect), it flies back to the centre and closes into
       the chip PACKAGE (js/ecosystem.js) — the map fades as it lands and the package lid appears.
     Scrolling back above a point plays it in reverse. */
  const narrow = matchMedia('(max-width:900px)');
  const DOCK_MS = 480, STRIP_H = 72;
  /* phones: the reading map is a strip (default) or a badge; "_" minimises the strip, a double tap on the badge brings it back */
  let mini = 'strip';
  try { if (localStorage.getItem('st-map-mini') === 'badge') mini = 'badge'; } catch (e) {}
  function setMini(m) {
    if (m === mini) return;
    mini = m;
    try { localStorage.setItem('st-map-mini', m); } catch (e) {}
    if (cur && !ST.state.reduced) anim = { from: { ...cur }, start: performance.now() };
    placeDock();
  }
  let state = 'center', anim = null, cur = null, dockRaf = 0;
  function dockRects() {
    const stage = $('.choose .choose-stage'), space = $('.map-space');
    const vw = innerWidth, vh = innerHeight, header = $('.header').offsetHeight, nav = $('.chapter-nav').offsetHeight;
    const st = stage.getBoundingClientRect();
    const center = { l: st.left, t: st.top, w: st.width, h: st.height };
    let left;
    /* phones: a slim strip under the header (C), or minimised to a badge in the corner (A) */
    if (narrow.matches) left = mini === 'badge' ? { l: vw - 128 - 12, t: vh - nav - 112 - 14, w: 128, h: 112 } : { l: 0, t: header, w: vw, h: STRIP_H };
    else { const sp = space.getBoundingClientRect(), pad = vw * .032; left = { l: sp.left + pad, t: header + 18, w: sp.width - pad, h: vh - header - nav - 36 }; }
    return { center, left, st, vh, header };
  }
  function applyRect(r, show) {
    const dock = $('.map-dock');
    Object.assign(dock.style, { left: r.l.toFixed(1) + 'px', top: r.t.toFixed(1) + 'px', width: r.w.toFixed(1) + 'px', height: r.h.toFixed(1) + 'px', opacity: show.toFixed(3) });
    dock.classList.toggle('is-hidden', show < .05);
  }
  /* the ending's dock rect: the map lands so that its die is exactly where the package will be */
  function endRect(fallback) { return ST.eco.packMapRect() || fallback; }
  const lerpRect = (a, b, e) => ({ l: ST.lerp(a.l, b.l, e), t: ST.lerp(a.t, b.t, e), w: ST.lerp(a.w, b.w, e), h: ST.lerp(a.h, b.h, e) });
  let snap = false;   /* entering the view: place the map without animating it */
  let ecoQ = 0, endStage = 0, endAnim = null, endFade = null, endShow = 1;
  function placeDock() {
    const dock = $('.map-dock'), stage = $('.choose .choose-stage'); if (!dock || !stage) return;
    const { center, left, st, vh, header } = dockRects();
    const line = header + 16;                                   /* the switching point of the opening */
    const want = st.top < line + (state !== 'center' ? 8 : 0) ? 'left' : 'center';
    if (want !== state) {
      state = want;
      dock.classList.toggle('is-docked', state === 'left');
      document.documentElement.classList.toggle('map-docked', state === 'left');
      document.documentElement.style.setProperty('--split', state === 'center' ? '0' : '1');
      map.setScroll(mapP());
      anim = cur && !ST.state.reduced && !snap ? { from: { ...cur }, start: performance.now() } : null;
      if (state !== 'left') map.setFocus(false);
      if (state !== 'left' && endStage) { endStage = 0; endAnim = endFade = null; endShow = 1; ST.eco.setStage(0); map.setOutro(0); map.setFlip(false); map.setPacking(false); map.frame.classList.remove('is-bare'); document.documentElement.classList.remove('map-end'); }
    }
    let show = state === 'left' ? 1 : (ST.state.reduced ? (st.top < vh ? 1 : 0) : ST.clamp((vh * .95 - st.top) / (vh * .45)));
    let r = state === 'left' ? left : center;
    if (anim) {
      const t = ST.clamp((performance.now() - anim.start) / DOCK_MS);
      r = lerpRect(anim.from, r, ST.easeInOut(t));
      if (t >= 1) anim = null;
      else if (!dockRaf) dockRaf = requestAnimationFrame(() => { dockRaf = 0; placeDock(); });
    }
    /* The ending: three switching points, each a short timed animation (scrolling back plays them in reverse).
       1 topology  — when the ending reaches the header (Connect has moved up), the map flies to the package's place and zooms out to the
                     whole chip in top view (one zoom: it lands at the size the whole ecosystem needs)
       2 package   — once the ending is pinned, the package lid closes over the chip and the map fades under it
       3 ecosystem — further on, the modules connect one by one (js/ecosystem.js + css/read.css) */
    if (state === 'left') {
      const ot = outro.getBoundingClientRect().top, h = .02, at = n => (endStage >= n ? h : 0);
      const s1 = ot < header + 16 + (endStage >= 1 ? 8 : 0);   /* the same switching line as the opening */
      const want = !s1 ? 0 : ecoQ > .62 - at(4) ? 4 : ecoQ > .36 - at(3) ? 3 : ecoQ > .12 - at(2) ? 2 : 1;
      if (want !== endStage) {
        const now = performance.now(), reduced = ST.state.reduced || snap, place = n => (n === 0 ? 0 : n <= 2 ? 1 : 2);
        /* into the package: first back to the front and the top view (about half a second), then it shrinks */
        if (place(want) !== place(endStage)) endAnim = reduced ? null : { from: { ...(cur || left) }, start: now + (want >= 3 ? 500 : 0) };
        if ((want >= 3) !== (endStage >= 3)) endFade = reduced ? null : { from: endShow, to: want >= 3 ? 0 : 1, start: now + (want >= 3 ? 500 + DOCK_MS * 1.3 + 80 : 0) };
        endStage = want;
        ST.eco.setStage(endStage);
        map.setOutro(endStage >= 1 ? 1 : 0);
        if (endStage >= 1) map.setFocus(false);
        map.setFlip(endStage === 2);        /* the partners' step: the chip turns over to its I/O side */
        map.setPacking(endStage >= 3);      /* the package: front, top view, whole chip — then it shrinks */
        map.frame.classList.toggle('is-bare', endStage >= 1);
        if (endStage >= 1 && map.expanded) map.setExpanded(false);
        document.documentElement.classList.toggle('map-end', endStage >= 1);
        if (ST.sound) endStage >= 3 ? ST.sound.blip('open') : ST.sound.tick();
      }
      if (endStage >= 1 || endAnim) {
        /* 1–2: the whole chip in the middle (topology, then the partners' turn); 3–4: shrunk into the package's place */
        const target = endStage === 0 ? left : endStage <= 2 ? (ST.eco.bigRect() || left) : endRect(left);
        r = target;
        if (endAnim) {
          const t = ST.clamp((performance.now() - endAnim.start) / (DOCK_MS * 1.3));
          r = lerpRect(endAnim.from, target, ST.easeInOut(t));
          if (t >= 1) endAnim = null;
        }
      }
      endShow = endStage >= 3 ? 0 : 1;
      if (endFade) {
        const t = ST.clamp((performance.now() - endFade.start) / 450);
        endShow = ST.lerp(endFade.from, endFade.to, t);
        if (t >= 1) endFade = null;
      }
      show = endShow;
      if ((endAnim || endFade) && !dockRaf) dockRaf = requestAnimationFrame(() => { dockRaf = 0; placeDock(); });
    }
    /* phones, while reading: the badge shows the whole chip in top view, without controls or names */
    map.setLocked(state === 'center' && !map.expanded);   /* the opening: a fixed object */
    const phone = narrow.matches && state === 'left' && endStage === 0 && !map.expanded;
    dock.classList.toggle('is-badge', phone && mini === 'badge');
    dock.classList.toggle('is-strip', phone && mini === 'strip');
    document.documentElement.classList.toggle('map-strip', phone && mini === 'strip');
    if (endStage === 0) { map.setOutro(0); map.setPacking(phone); map.setFocus(phone); }   /* phones: zoomed to the current block, top view */
    if (phone) {
      const sec = sections[Math.max(0, index)], k = `${ST.pad(Math.max(0, index))} · ${ST.pick(sec.label)}`;
      if (dock.dataset.label !== k) {
        dock.dataset.label = k;
        dock.querySelector('.ds-k').textContent = k;
        dock.querySelector('.ds-t').textContent = ST.pick(sec.title).replace(/\s*\n\s*/g, ' ');
      }
    }
    cur = r; applyRect(r, show);
    dockShown = show;
  }
  /* the opening story, scrubbed by the scroll: P runs 0 … number of steps through the pinned screen */
  /* the opening story, scrubbed by the scroll (the steps themselves are in js/story.js, shared with the 3D view) */
  function placeStory() {
    const ch = $('.choose'), pin = ch && ch.firstElementChild; if (!pin) return;
    const r = ch.getBoundingClientRect(), header = $('.header').offsetHeight;
    const raw = ST.clamp((header - r.top) / Math.max(1, r.height - pin.offsetHeight));
    const P = raw * ST.story.length(pin);
    const cr = ST.story.apply(pin, P, map, narrow.matches);
    const stage = pin.querySelector('.choose-stage');
    Object.assign(stage.style, { left: cr.l.toFixed(1) + 'px', top: cr.t.toFixed(1) + 'px', width: cr.w.toFixed(1) + 'px', height: cr.h.toFixed(1) + 'px' });
    /* where the reader is in the story, so the 3D view can open at the same step */
    ST.state.storyP = state === 'center' && raw < 1 ? P : null;
  }
  /* open the story at step P (switching from the 3D view during its opening) */
  function scrollToStory(P) {
    const ch = $('.choose'), pin = ch.firstElementChild, header = $('.header').offsetHeight;
    const top = ch.getBoundingClientRect().top + scrollY - header + (P / ST.story.length(pin)) * (ch.offsetHeight - pin.offsetHeight);
    scrollTo({ top: Math.max(0, Math.round(top)), behavior: 'instant' });
  }
  R.isPlain = () => ST.state.storyP != null && ST.state.storyP > .05;   /* during the story both views show the same chip */
  /* the ending's progress 0…1 while its sticky stage is pinned */
  function placeEco() {
    const r = outro.getBoundingClientRect(), header = $('.header').offsetHeight;
    const stageH = outro.firstElementChild ? outro.firstElementChild.offsetHeight : innerHeight;
    ecoQ = ST.clamp((header - r.top) / Math.max(1, r.height - stageH));
  }
  function reveal() {
    placeStory();
    placeEco();
    placeDock();
    const vh = innerHeight;
    $$('.sec').forEach(sec => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      setVar(sec, '--enter', ST.clamp((vh * .98 - r.top) / (vh * .6)));
      setVar(sec, '--exit', ST.clamp((vh * .28 - r.bottom) / (vh * .28)));
      setVar(sec, '--prog', ST.clamp((r.top + r.height / 2 - vh / 2) / vh, -1.5, 1.5));
    });
  }
  function scrollToPath(path, instant) {
    const r = ST.resolve(path); if (!r) return;
    const behavior = instant || ST.state.reduced ? 'instant' : 'smooth';
    if (path.length > 1) {
      const card = setCard(path, true, instant);
      if (card) {
        requestAnimationFrame(() => {
          measure();
          const top = card.getBoundingClientRect().top + scrollY - innerHeight * .3;
          scrollTo({ top: Math.max(0, top), behavior });
          if (instant) readScroll();
        });
        return;
      }
    }
    const header = $('.header').offsetHeight + (document.documentElement.classList.contains('map-strip') || (narrow.matches && mini === 'strip' && r.index > 0) ? STRIP_H : 0);
    scrollTo({ top: r.index === 0 ? 0 : Math.max(0, tops[r.index] - header - 8), behavior });
    if (instant) readScroll();
  }

  /* ---------- view API ---------- */
  R.init = function () {
    main = $('#read-sections'); intro = $('#read-intro'); outro = $('#read-outro');
    map = new ST.ChipMap($('#chipmap'), { onSelect: path => { if (map.expanded) map.setExpanded(false); R.go(path); } });
    R.map = map;
    const setExpanded = map.setExpanded.bind(map);
    map.setExpanded = on => { setExpanded(on); if (!on) map.viewport.blur(); [60, 400, 1000].forEach(t => setTimeout(placeDock, t)); };   /* the switch runs inside a view transition */
    /* phones: the strip and the badge */
    const dockEl = $('.map-dock');
    dockEl.insertAdjacentHTML('beforeend', `<div class="dock-strip" aria-hidden="true"><span class="ds-k"></span><b class="ds-t"></b></div>
      <button type="button" class="dock-min" data-ui-label="mapMinimize" aria-label="Minimise">_</button>`);
    let lastTap = 0, tapT = 0;
    dockEl.addEventListener('click', e => {
      const badge = dockEl.classList.contains('is-badge'), strip = dockEl.classList.contains('is-strip');
      if (!badge && !strip) return;
      e.preventDefault(); e.stopPropagation();
      if (e.target.closest('.dock-min')) { setMini('badge'); return; }
      if (strip) { map.setExpanded(true); return; }
      /* badge: one tap opens the full map, a double tap brings the strip back */
      const now = performance.now();
      if (now - lastTap < 320) { clearTimeout(tapT); lastTap = 0; setMini('strip'); return; }
      lastTap = now; tapT = setTimeout(() => { if (dockEl.classList.contains('is-badge')) map.setExpanded(true); }, 320);
    }, true);
    render(); measure();
    addEventListener('scroll', readScroll, { passive: true });
    let rt; addEventListener('resize', () => { if (on) { ST.eco.layout(); placeDock(); } clearTimeout(rt); rt = setTimeout(() => { if (on) { measure(); readScroll(); placeDock(); } }, 80); });
    document.fonts && document.fonts.ready.then(() => { if (on) { measure(); readScroll(); } });
    outro.addEventListener('click', e => { if (e.target.closest('[data-top]')) { e.preventDefault(); scrollTo({ top: 0, behavior: ST.state.reduced ? 'instant' : 'smooth' }); history.replaceState(null, '', '#overview'); } });
    intro.addEventListener('click', e => { const m = e.target.closest('[data-media]'); if (m) ST.openMedia(m.dataset.media, m.dataset.mediaTitle); });
    main.addEventListener('click', e => {
      const head = e.target.closest('.pc-head');
      const sc = e.target.closest('.pc-show-card');
      if (sc && !e.target.closest('.psc-links a')) {
        const pc = sc.closest('.path-card'), [sid, cid] = pc.dataset.path.split('/');
        const node = SITE_CONTENT.sections.find(x => x.id === sid).children.find(x => x.id === cid), list = node.showcase || [];
        ST.openShowcase(list[+sc.dataset.show], +sc.dataset.show, list.length); return;
      }
      if (head) { const card = head.closest('.path-card'); setCard(card.dataset.path.split('/'), !card.classList.contains('is-open')); return; }
      const m = e.target.closest('[data-media]'); if (m) ST.openMedia(m.dataset.media, m.dataset.mediaTitle);
      const gb = e.target.closest('[data-give]');
      if (gb) { giveMode = gb.dataset.give; const panel = gb.closest('.give-panel'); panel.dataset.modeGive = giveMode; panel.querySelectorAll('[data-give]').forEach(b => b.setAttribute('aria-pressed', String(b === gb))); }
    });
    addEventListener('hashchange', () => { if (on && !ST.state.switching) { const p = ST.readHash(); scrollToPath(p); } });
  };
  /* where each step of the ending sits in its pinned scroll (used when switching views inside the ending) */
  const END_AT = [0, .04, .22, .47, .82];
  function scrollToEnd(stage) {
    const r = outro.getBoundingClientRect(), header = $('.header').offsetHeight;
    const stageH = outro.firstElementChild ? outro.firstElementChild.offsetHeight : innerHeight;
    scrollTo({ top: Math.round(r.top + scrollY - header + END_AT[stage] * (r.height - stageH)), behavior: 'instant' });
  }
  R.currentEnd = () => (state === 'left' ? endStage : 0);
  R.enter = function (path, from, end) {
    on = true;
    measure();
    if (end) { anim = endAnim = endFade = null; ST.eco.snap(); scrollToEnd(end); }
    else if (path[0] === 'overview' && from === '3d' && ST.state.storyP != null) scrollToStory(ST.state.storyP);
    else scrollToPath(path, true);
    measure(); readScroll();
    snap = true; smooth = target; reveal(); map.resize(); map.setScroll(mapP()); reveal(); snap = false;
  };
  R.afterEnter = function (from) {
    const root = document.documentElement;
    root.classList.remove('intro-read', 'from-travel'); void root.offsetWidth;
    root.classList.add(from === '3d' ? 'from-travel' : 'intro-read');
    setTimeout(() => root.classList.remove('intro-read', 'from-travel'), 1600);
    if (from === '3d' && !endStage) { map.surface(index); map.rise(); }
    wake();
  };
  R.beforeLeave = function () {
    if (dockShown < .5 || endStage) return Promise.resolve();   /* map not on screen, or in the ending: just cross-fade */
    if (map.expanded) { map.expanded = false; map.frame.classList.remove('is-expanded'); document.documentElement.classList.remove('map-expanded'); map.resize(); }
    return map.dive(Math.max(0, index));
  };
  R.leave = function () { on = false; cancelAnimationFrame(raf); raf = 0; };
  R.currentPath = function () {
    if (openPath && openPath[0] === sections[index].id) {
      const card = document.getElementById(`card-${openPath[0]}-${openPath[1]}`), r = card && card.getBoundingClientRect();
      if (r && r.bottom > 0 && r.top < innerHeight) return [...openPath];
    }
    return [sections[Math.max(0, index)].id];
  };
  R.go = function (path) {
    history.replaceState(null, '', '#' + path.join('/'));
    scrollToPath(path, false);
  };
  R.openMap = () => map.setExpanded(true);
  R.onLanguage = function () {
    if (!main) return;
    render(); map.text();
    if (on) { measure(); readScroll(); reveal(); }
  };
})();
