/* ==========================================================================
   The opening story, shared by both views.
     0  the empty chip floats in the middle, with the SemiTec Foundation name
     1  it moves aside; on the right, the foundation at a glance (numbers, what's next)
     2… one card per group of sections (SITE_CONTENT.story.groups) introduces them; each flies into the chip and becomes its block
     …  the connections, then the edge contacts (partners, supporters, free)
     last 2D: the two ways to explore · 3D: start the journey
   html(mode) builds the screen, apply(root, P, map, phone) shows step P (fractional) and returns
   where the chip floats (relative to root). 2D drives P by the scroll (mode-read.js), the 3D view by
   the wheel, touch and keys before its journey begins (mode-signal.js).
   ========================================================================== */
(function () {
  const ST = window.ST, sections = SITE_CONTENT.sections;
  /* groups of sections from SITE_CONTENT.story.groups (ids); any section on the chip but not in a group gets its own */
  function storyGroups() {
    const on = storySections(), byId = id => on.find(s => s.id === id), used = new Set(), out = [];
    for (const g of (SITE_CONTENT.story || {}).groups || []) { const list = g.map(byId).filter(Boolean).filter(s => !used.has(s.id)); if (list.length) { list.forEach(s => used.add(s.id)); out.push(list); } }
    on.filter(s => !used.has(s.id)).forEach(s => out.push([s]));
    return out;
  }
  const storySections = () => sections.slice(1).filter(s => CHIP_LAYOUT && buildChipLayout(sections, CHIP_LAYOUT, SITE_CONTENT.partners || []).blocks[s.id]);
  function storyCards(mode) {
    /* the foundation's story, one text per step of the film (SITE_CONTENT.story.film), then the two ways on */
    const cards = ((SITE_CONTENT.story || {}).film || []).map((it, i) => `<article class="story-card" data-card="film" data-i="${i}">
        <p class="sc-k">${ST.esc(ST.pick(it.kicker))}</p>
        <h3 class="sc-t">${ST.esc(ST.pick(it.title))}</h3>
        <p class="sc-p">${ST.esc(ST.pick(it.text))}</p>${it.more ? `
        <p class="sc-p sc-more">${ST.esc(ST.pick(it.more))}</p>
        <button type="button" class="sc-more-btn" aria-expanded="false"><span class="sc-more-o">${ST.esc(ST.text('storyMore'))} +</span><span class="sc-more-c">${ST.esc(ST.text('storyLess'))} −</span></button>` : ''}${(it.goals || []).length ? `
        <dl class="sc-goals">${it.goals.map(g => `<div><dt>${ST.esc(ST.pick(g.when))}</dt><dd>${ST.esc(ST.pick(g.text))}</dd></div>`).join('')}</dl>` : ''}</article>`);
    cards.push(mode === '3d' ? `<article class="story-card is-final" data-card="final">
        <p class="sc-k">${ST.esc(ST.text('storyJourneyKicker'))}</p><h3 class="sc-t">${ST.esc(ST.text('storyJourneyTitle'))}</h3>
        <p class="sc-p">${ST.esc(ST.text('choose3dNote'))}</p>
        <div class="choose-options">
          <button type="button" class="choose-opt is-3d story-start"><span class="ms-icon ms-3d" aria-hidden="true"></span><span><strong>${ST.esc(ST.text('storyStart'))} ↓</strong><small>${ST.esc(ST.text('storyStartNote'))}</small></span></button>
        </div></article>` : `<article class="story-card is-final" data-card="final">
        <p class="sc-k">${ST.esc(ST.text('chooseKicker'))}</p><h3 class="sc-t">${ST.esc(ST.text('chooseTitle'))}</h3>
        <div class="choose-options">
          <div class="choose-opt"><span class="scroll-mouse" aria-hidden="true"><i></i></span><span><strong>${ST.esc(ST.text('chooseRead'))} ↓</strong><small>${ST.esc(ST.text('chooseReadNote'))}</small></span></div>
          <a class="choose-opt is-3d" href="#overview" data-travel="overview"><span class="ms-icon ms-3d" aria-hidden="true"></span><span><strong>${ST.esc(ST.text('enter3d'))} ↗</strong><small>${ST.esc(ST.text('choose3dNote'))}</small></span></a>
        </div></article>`);
    /* in turn on the left and on the right of the film; the last one (the two ways) on the right of the chip */
    return cards.map((c, k) => c.replace('class="story-card', `class="story-card ${k === cards.length - 1 || k % 2 === 1 ? 'is-right' : 'is-left'}`)).join('');
  }

  let last = -1;
  /* "Read more" / "Show less" on a step whose whole text does not fit beside the film */
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.sc-more-btn'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const card = b.closest('.story-card'), root = card.closest('.choose-pin,.intro-root'), open = !card.classList.contains('is-open');
    if (open && card._openOK === false && ST.openTextSheet) {
      /* too long to open beside the film (a small phone): the whole text in the reading window */
      const it = ((SITE_CONTENT.story || {}).film || [])[+card.dataset.i]; if (!it) return;
      ST.openTextSheet(ST.pick(it.title), [it.text, it.more, ...(it.goals || []).map(g => [0, 1].map(l => g.when[l] + ' — ' + g.text[l]))].filter(Boolean));
      return;
    }
    card.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open));
    if (root && root._apply) ST.story.apply(root, ...root._apply);
  }, true);
  ST.story = {
    html(mode) {
      return `<div class="story-head"><p class="sec-eyebrow"><span class="sec-rule" aria-hidden="true"></span><span>${ST.esc(ST.text('fabKicker'))}</span></p>
          <h2 class="choose-title">${ST.esc(ST.text('fabTitle'))}</h2></div>
        <div class="fab-film" aria-hidden="true"></div>
        <div class="choose-stage" aria-hidden="true"></div>
        <div class="story-cards">${storyCards(mode)}</div>
        <p class="story-hint"><span class="scroll-mouse" aria-hidden="true"><i></i></span><span class="sh-long">${ST.esc(ST.text('fabScroll2'))}</span><span class="sh-short">${ST.esc(ST.text('fabScrollShort'))}</span></p>${mode === '3d' ? '' : `
        <button type="button" class="story-skip is-2d">${ST.esc(ST.text('storySkip'))} →</button>`}`;
    },
    /* step s of the film rests at P = s (0 the mountains … the closed package); then the package opens and the camera
       looks down at the die (the film ends at E = ST.film.end()), the chip map comes in and the two ways appear;
       length() is the end of the opening, rests() the places a step stops */
    length() { return ST.film ? ST.film.last() : 15; },
    rests() { return ST.film ? ST.film.rests() : [...Array(13).keys(), 15]; },
    /* The foundation's story beside a rendered film (js/film.js), played one step at a time. The text has no frame: it stands in
       the free space beside the film, right and left in turn, and the film moves to the other side. In the last
       frames the camera looks straight down at the finished die; the film is then scaled so that die lies exactly
       on the chip map's die, the map fades in over it and tilts up: one object from the film to the page. */
    apply(root, P, map, phone) {
      root._apply = [P, map, phone];
      const cards = [...root.querySelectorAll('.story-card')], n = cards.length;
      const pr = root.getBoundingClientRect(), W = pr.width, H = pr.height;
      const headH = phone ? 96 : 124, pad = phone ? 12 : W * .04;
      const mid = phone ? { l: pad, t: headH - 8, w: W - 2 * pad, h: H * .4 } : { l: W * .22, t: headH, w: W * .56, h: H - headH - 60 };
      const aside = phone ? { l: pad, t: headH - 8, w: W - 2 * pad, h: H * .36 } : { l: pad, t: headH, w: W * .54 - pad, h: H - headH - 40 };
      const E = ST.film ? ST.film.end() : 13.6;   // the film's last frame
      const shift = ST.smoothstep(ST.clamp((P - (E + .4)) / .55));
      const cr = { l: ST.lerp(mid.l, aside.l, shift), t: ST.lerp(mid.t, aside.t, shift), w: ST.lerp(mid.w, aside.w, shift), h: ST.lerp(mid.h, aside.h, shift) };
      root.style.setProperty('--shift', shift.toFixed(3));
      const sideOf = k => k >= n - 1 ? 1 : (k % 2 === 1 ? 1 : -1);
      /* step s plays from P = s-1 to s: first the move to the next station, then the work; its text (card s) is on
         from the end of the move (ST.film.textP) until the next step starts */
      const textIn = s => s === 0 ? -1 : ST.film ? ST.film.textP(s) : s - .7;
      const steps = n - 1, blockAt = x => x > steps - 1 ? n - 1 : Math.max(0, Math.ceil(x - .001));
      /* the film */
      const holder = root.querySelector('.fab-film');
      if (!root._film && ST.film) root._film = ST.film.attach(holder);
      let align = null;
      const k = ST.smoothstep(ST.clamp((P - (E - .3)) / .3));
      if (k > 0 && map && map.frame) {
        const world = map.frame.querySelector('.cm-world'), r = world && world.getBoundingClientRect();
        if (r && r.width) align = { l: r.left - pr.left, t: r.top - pr.top, w: r.width, h: r.height, k };
      }
      if (root._film) root._film.set(P, phone || P > steps - 1 ? 0 : sideOf(blockAt(P)), align);
      holder.style.opacity = (1 - ST.clamp((P - (E + .02)) / .12)).toFixed(3);
      /* the chip map: flat and still under the film's last frame, then it fades in over it and tilts up */
      if (map && map.frame) {
        map.frame.style.opacity = P < E - .15 ? '0' : P >= E + .05 ? '' : ST.clamp((P - (E - .15)) / .2).toFixed(3);
        const tilt = ST.smoothstep(ST.clamp((P - (E + .15)) / .45));
        if (map.storyTilt !== tilt) { map.storyTilt = tilt; map.frame.classList.toggle('is-flat', tilt < .99); if (map.applyFollow) map.applyFollow(); if (map.wake) map.wake(); }
      }
      /* every text fits between the title (on phones: the film) and the bottom of the free space — above
         "Skip the intro" and the bottom bar: centred there, and made a little smaller when it is too tall */
      const navEl = document.querySelector('.chapter-nav'), skipEl = root.querySelector('.story-skip') || (root.parentElement && root.parentElement.querySelector('.story-skip'));
      const nr = navEl ? navEl.getBoundingClientRect() : null, sr = skipEl ? skipEl.getBoundingClientRect() : null;
      const lowest = Math.min(H, nr && nr.height && nr.top < innerHeight ? nr.top - pr.top : H, sr && sr.height ? sr.top - pr.top : H) - (phone ? 10 : 18);
      const highest = phone ? (root._film && root._film.bandBottom ? root._film.bandBottom(H) : 96 + H * .36) + 8 : headH + 14;
      /* phones: the scroll hint (before the first step) stands in the free strip at the foot of the film, so it
         meets neither the first text nor "Skip the intro" */
      const hintNode = root.querySelector('.story-hint');
      if (hintNode) { hintNode.style.top = phone ? Math.round(highest - 6 - hintNode.offsetHeight) + 'px' : ''; hintNode.style.bottom = phone ? 'auto' : ''; }
      /* a step whose whole text does not fit there shows its first paragraph and "Read more"; opened, the text
         rises over the film (on phones) and is shown whole on a plain background */
      const key = W + '|' + H + '|' + document.documentElement.lang;
      const headEl = root.querySelector('.story-head'), titleB = headEl ? headEl.getBoundingClientRect().bottom - pr.top : headH;
      const fit = card => {
        const more = card.querySelector('.sc-more'), goals = card.querySelector('.sc-goals');
        if (more && card._mk !== key) {
          /* heights of the whole text, without the second paragraph, and without the goals too */
          const was = card.className; card.classList.remove('is-brief', 'is-brief2', 'is-open');
          card._h0 = card.offsetHeight; card.classList.add('is-brief'); card._h1 = card.offsetHeight;
          card.classList.add('is-brief2'); card._h2 = card.offsetHeight; card.className = was; card._mk = key;
        }
        const open = card.classList.contains('is-open'), top0 = open && phone ? titleB + 18 : highest;
        const room = Math.max(60, lowest - top0), roomC = Math.max(60, lowest - highest);
        const lvl = !more || card._h0 * .9 <= roomC ? 0 : !goals || card._h1 * .85 <= roomC ? 1 : 2;
        card._openOK = !more || card._h0 * .85 <= Math.max(60, lowest - (phone ? titleB + 18 : highest));
        card.classList.toggle('has-brief', lvl > 0);
        card.classList.toggle('is-brief', lvl > 0 && !open);
        card.classList.toggle('is-brief2', lvl > 1 && !open);
        const h = card.offsetHeight;
        const k = h > room ? Math.max(.62, room / h) : 1;
        const top = top0 + Math.max(0, (room - h * k) / (phone ? 1e9 : 2));
        if (card._top !== Math.round(top)) { card._top = Math.round(top); card.style.top = card._top + 'px'; card.style.marginTop = '0px'; }
        card.style.transformOrigin = card.classList.contains('is-right') && !phone ? '100% 0' : '0 0';
        return k;
      };
      /* the text: each comes in as its step's work begins and stays until the next step starts */
      cards.forEach((card, k) => {
        let op, y;
        if (k === n - 1) { op = ST.clamp((P - (E + .5)) / .4); y = (1 - op) * 24; }
        else {
          const ti = textIn(k), inn = ST.smoothstep(ST.clamp((P - (ti - .12)) / .12)), out = ST.smoothstep(ST.clamp((P - k) / .06));
          op = inn * (1 - out); y = (1 - inn) * 18 - out * 18;
        }
        card.style.opacity = op.toFixed(3);
        const f = fit(card);
        card.style.transform = `translateY(${y.toFixed(1)}px)` + (f < .999 ? ` scale(${f.toFixed(3)})` : '');
        if (op < .5 && card.classList.contains('is-open')) { card.classList.remove('is-open'); const b = card.querySelector('.sc-more-btn'); if (b) b.setAttribute('aria-expanded', 'false'); }
        card.classList.toggle('is-on', op > .5);
        card.inert = op < .5;
      });
      map.setStory({ blocks: Array(sections.length).fill(1), route: 1, pads: 1 });
      const s = Math.floor(P);
      if (s !== last) { if (last >= 0 && ST.sound) ST.sound.tick(); last = s; }
      root.classList.toggle('is-ready', P >= E + .4);
      const skip = root.querySelector('.story-skip.is-2d');
      if (skip) { const o = 1 - ST.clamp((P - (E - .2)) / .4); skip.style.opacity = o.toFixed(3); skip.style.pointerEvents = o < .5 ? 'none' : ''; skip.tabIndex = o < .5 ? -1 : 0; }
      const hint = root.querySelector('.story-hint'); if (hint) hint.style.opacity = (1 - ST.clamp(P / .4)).toFixed(3);
      return cr;
    }
  };
})();
