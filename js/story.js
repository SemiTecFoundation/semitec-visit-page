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
    /* "SemiTec in brief": the mission and the four directions (no numbers until there are real ones) */
    const st = SITE_CONTENT.story || {}, ev = ST.events().upcoming[0];
    const dirs = (st.directions || []).map((d, k) => `<div class="sn" style="--k:${k}"><strong>${ST.esc(ST.pick(d.title))}</strong><span>${ST.esc(ST.pick(d.text))}</span></div>`).join('');
    const next = ev ? `<a class="sx" href="#events/upcoming"><span>${ST.esc(ST.text('nextEvent'))}</span><b>${ST.esc(ST.fmtDate(ev.when))} · ${ST.esc(ST.pick(ev.title))}</b></a>` : '';
    const cards = [`<article class="story-card is-glance" data-card="glance">
        <p class="sc-k"><i class="status-light"></i>${ST.esc(ST.text('glanceKicker'))}</p>
        <h3 class="sc-t">${ST.esc(ST.text('glanceTitle'))}</h3>
        <p class="sc-p">${ST.esc(ST.pick(st.brief || ''))}</p>
        <div class="sc-nums is-dirs">${dirs}</div>${next ? `<div class="sc-next">${next}</div>` : ''}
        <p class="sc-note">${ST.esc(ST.pick(st.vision || ''))}</p></article>`];
    /* the sections come in groups (SITE_CONTENT.story.groups): one step brings a whole group onto the chip */
    storyGroups().forEach(group => {
      const parts = group.map(sec => {
        const i = sections.indexOf(sec), power = sec.id === CHIP_LAYOUT.power;
        return `<div class="sc-part${power ? ' is-power' : ''}" data-index="${i}">
          <p class="sc-k">${ST.pad(i)} · ${ST.esc(ST.pick(sec.label))}${power ? ` · ${ST.esc(ST.text('powerUnit'))}` : ''}</p>
          <h3 class="sc-t">${ST.esc(ST.pick(sec.title)).replace(/\n/g, ' ')}</h3>
          <p class="sc-p">${ST.esc(ST.pick(sec.intro))}</p>
          <a class="sc-go" href="#${sec.id}" data-path="${sec.id}">${ST.esc(ST.text('openSection'))} →</a></div>`;
      }).join('');
      cards.push(`<article class="story-card is-group${group.length > 1 ? ' is-pair' : ''}" data-card="sec">${parts}</article>`);
    });
    cards.push(`<article class="story-card" data-card="conn">
        <p class="sc-k">${ST.esc(ST.text('build2'))}</p><h3 class="sc-t">${ST.esc(ST.text('connTitle'))}</h3>
        <p class="sc-p">${ST.esc(ST.text('build2Note'))}</p><p class="sc-p">${ST.esc(ST.text('connPower'))}</p></article>`);
    cards.push(`<article class="story-card" data-card="pads">
        <p class="sc-k">${ST.esc(ST.text('build3'))}</p><h3 class="sc-t">${ST.esc(ST.text('padsCardTitle'))}</h3>
        <p class="sc-p">${ST.esc(ST.text('build3Note'))}</p>
        <ul class="sc-legend"><li class="is-partner"><i></i>${ST.esc(ST.text('partnersCol'))}</li><li class="is-supporter"><i></i>${ST.esc(ST.text('supportersTitle'))}</li><li class="is-free"><i>+</i>${ST.esc(ST.text('freePad'))}</li></ul>
        <p class="sc-links"><a href="#support/partner">+ ${ST.esc(ST.text('becomePartner'))}</a><a href="#donate">+ ${ST.esc(ST.text('becomeSupporter'))}</a></p></article>`);
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
    /* in turn on the right and on the left of the drawing; the last one (the two ways) on the right of the chip */
    return cards.map((c, k) => c.replace('class="story-card', `class="story-card ${k === cards.length - 1 || k % 2 === 0 ? 'is-right' : 'is-left'}`)).join('');
  }

  let last = -1;
  ST.story = {
    html(mode) {
      return `<div class="story-head"><p class="sec-eyebrow"><span class="sec-rule" aria-hidden="true"></span><span>${ST.esc(ST.text('fabKicker'))}</span></p>
          <h2 class="choose-title">${ST.esc(ST.text('fabTitle'))}</h2></div>
        <div class="fab-film" aria-hidden="true"></div>
        <div class="story-start-text"><p class="sc-fab"><b>${ST.esc(ST.text('fabStartK'))} · ${ST.esc(ST.text('fabStart'))}</b><span>${ST.esc(ST.text('fabStartt'))}</span></p></div>
        <div class="choose-stage" aria-hidden="true"></div>
        <div class="story-cards">${storyCards(mode)}</div>
        <p class="story-hint"><span class="scroll-mouse" aria-hidden="true"><i></i></span>${ST.esc(ST.text('fabScroll2'))}</p>${mode === '3d' ? '' : `
        <button type="button" class="story-skip is-2d">${ST.esc(ST.text('storySkip'))} →</button>`}`;
    },
    /* the film runs P = 0 … 12: step s rests at P = s (0 the sand … 9 the package), 9 → 10.6 the chip opens, then the
       chip map and the two ways (11 …); rests() are the places a step stops */
    length() { return 12; },
    rests() { return ST.film ? ST.film.rests() : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12]; },
    /* How a chip is made: a rendered film (js/film.js), played one step at a time. The text has no frame: it stands in
       the free space beside the film, right and left in turn, and the film moves to the other side. In the last
       frames the camera looks straight down at the finished die; the film is then scaled so that die lies exactly
       on the chip map's die, the map fades in over it and tilts up: one object from the film to the page. */
    apply(root, P, map, phone) {
      const cards = [...root.querySelectorAll('.story-card')], n = cards.length;
      const pr = root.getBoundingClientRect(), W = pr.width, H = pr.height;
      const headH = phone ? 96 : 124, pad = phone ? 12 : W * .04;
      const mid = phone ? { l: pad, t: headH - 8, w: W - 2 * pad, h: H * .4 } : { l: W * .22, t: headH, w: W * .56, h: H - headH - 60 };
      const aside = phone ? { l: pad, t: headH - 8, w: W - 2 * pad, h: H * .36 } : { l: pad, t: headH, w: W * .54 - pad, h: H - headH - 40 };
      const shift = ST.smoothstep(ST.clamp((P - 11.0) / .55));
      const cr = { l: ST.lerp(mid.l, aside.l, shift), t: ST.lerp(mid.t, aside.t, shift), w: ST.lerp(mid.w, aside.w, shift), h: ST.lerp(mid.h, aside.h, shift) };
      root.style.setProperty('--shift', shift.toFixed(3));
      /* the stage of the fab, as a small line above each text */
      if (!root._fabLines) {
        root._fabLines = true;
        cards.forEach((card, k) => {
          if (k >= n - 1) return;
          const el = document.createElement('p'); el.className = 'sc-fab';
          el.innerHTML = `<b>${ST.esc(ST.text('fabStep'))} ${ST.pad(k + 1)} / 09 · ${ST.esc(ST.text('fab' + k))}</b><span>${ST.esc(ST.text('fab' + k + 't'))}</span>`;
          card.prepend(el);
        });
      }
      const sideOf = k => k < 0 ? -1 : k >= n - 1 ? 1 : (k % 2 === 0 ? 1 : -1);
      /* step s (1 … n-1) plays from P = s-1 to s: first the move to the next station, then the work; its text is
         on from the end of the move (ST.film.textP) until the next step starts. P = 0: the sand, 9 → 12: the end */
      const textIn = s => ST.film ? ST.film.textP(s) : s - .7;
      const blockAt = x => x <= .001 ? -1 : x > n - 1 ? n - 1 : Math.ceil(x - .001) - 1;
      /* the film */
      const holder = root.querySelector('.fab-film');
      if (!root._film && ST.film) root._film = ST.film.attach(holder);
      let align = null;
      const k = ST.smoothstep(ST.clamp((P - 10.3) / .3));
      if (k > 0 && map && map.frame) {
        const world = map.frame.querySelector('.cm-world'), r = world && world.getBoundingClientRect();
        if (r && r.width) align = { l: r.left - pr.left, t: r.top - pr.top, w: r.width, h: r.height, k };
      }
      if (root._film) root._film.set(P, phone || P > n - 1 ? 0 : sideOf(blockAt(P)), align);
      holder.style.opacity = (1 - ST.clamp((P - 10.62) / .12)).toFixed(3);
      /* the chip map: flat and still under the film's last frame, then it fades in over it and tilts up */
      if (map && map.frame) {
        map.frame.style.opacity = P < 10.45 ? '0' : P >= 10.65 ? '' : ST.clamp((P - 10.45) / .2).toFixed(3);
        const tilt = ST.smoothstep(ST.clamp((P - 10.75) / .45));
        if (map.storyTilt !== tilt) { map.storyTilt = tilt; map.frame.classList.toggle('is-flat', tilt < .99); if (map.applyFollow) map.applyFollow(); if (map.wake) map.wake(); }
      }
      /* every text fits between the title (on phones: the film) and the bottom of the free space — above
         "Skip the intro" and the bottom bar: centred there, and made a little smaller when it is too tall */
      const navEl = document.querySelector('.chapter-nav'), skipEl = root.querySelector('.story-skip') || (root.parentElement && root.parentElement.querySelector('.story-skip'));
      const nr = navEl ? navEl.getBoundingClientRect() : null, sr = skipEl ? skipEl.getBoundingClientRect() : null;
      const lowest = Math.min(H, nr && nr.height && nr.top < innerHeight ? nr.top - pr.top : H, sr && sr.height ? sr.top - pr.top : H) - (phone ? 10 : 18);
      const highest = phone ? (root._film && root._film.bandBottom ? root._film.bandBottom(H) : 96 + H * .36) + 8 : headH + 14;
      const fit = card => {
        const h = card.offsetHeight, room = Math.max(60, lowest - highest);
        const k = h > room ? Math.max(.62, room / h) : 1;
        const top = highest + Math.max(0, (room - h * k) / (phone ? 1e9 : 2));
        if (card._top !== Math.round(top)) { card._top = Math.round(top); card.style.top = card._top + 'px'; card.style.marginTop = '0px'; }
        card.style.transformOrigin = card.classList.contains('is-right') && !phone ? '100% 0' : '0 0';
        return k;
      };
      /* the text: each comes in as its step's work begins and stays until the next step starts */
      const start = root.querySelector('.story-start-text');
      if (start) { const out = ST.clamp(P / .06), f = fit(start); start.style.opacity = (1 - out).toFixed(3); start.style.transform = `translateY(${(-out * 18).toFixed(1)}px)` + (f < .999 ? ` scale(${f.toFixed(3)})` : ''); start.inert = out > .5; }
      cards.forEach((card, k) => {
        let op, y;
        if (k === n - 1) { op = ST.clamp((P - 11.1) / .4); y = (1 - op) * 24; }
        else {
          const s = k + 1, ti = textIn(s), inn = ST.smoothstep(ST.clamp((P - (ti - .12)) / .12)), out = ST.smoothstep(ST.clamp((P - s) / .06));
          op = inn * (1 - out); y = (1 - inn) * 18 - out * 18;
        }
        card.style.opacity = op.toFixed(3);
        const f = fit(card);
        card.style.transform = `translateY(${y.toFixed(1)}px)` + (f < .999 ? ` scale(${f.toFixed(3)})` : '');
        card.classList.toggle('is-on', op > .5);
        card.inert = op < .5;
      });
      map.setStory({ blocks: Array(sections.length).fill(1), route: 1, pads: 1 });
      const s = Math.floor(P);
      if (s !== last) { if (last >= 0 && ST.sound) ST.sound.tick(); last = s; }
      root.classList.toggle('is-ready', P >= 11);
      const skip = root.querySelector('.story-skip.is-2d');
      if (skip) { const o = 1 - ST.clamp((P - 10.4) / .4); skip.style.opacity = o.toFixed(3); skip.style.pointerEvents = o < .5 ? 'none' : ''; skip.tabIndex = o < .5 ? -1 : 0; }
      const hint = root.querySelector('.story-hint'); if (hint) hint.style.opacity = (1 - ST.clamp(P / .4)).toFixed(3);
      return cr;
    }
  };
})();
