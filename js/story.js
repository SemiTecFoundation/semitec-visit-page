/* ==========================================================================
   The opening story, shared by both views.
     0  the empty chip floats in the middle, with the SemiTec Foundation name
     1  it moves aside; on the right, the foundation at a glance (numbers, what's next)
     2… one card per section introduces it, then flies into the chip and becomes its block
     …  the connections, then the edge contacts (partners, supporters, free)
     last 2D: the two ways to explore · 3D: start the journey
   html(mode) builds the screen, apply(root, P, map, phone) shows step P (fractional) and returns
   where the chip floats (relative to root). 2D drives P by the scroll (mode-read.js), the 3D view by
   the wheel, touch and keys before its journey begins (mode-signal.js).
   ========================================================================== */
(function () {
  const ST = window.ST, sections = SITE_CONTENT.sections;
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
    storySections().forEach((sec, k) => {
      const i = sections.indexOf(sec);
      cards.push(`<article class="story-card is-section${sec.id === CHIP_LAYOUT.power ? ' is-power' : ''}" data-card="sec" data-index="${i}">
        <p class="sc-k">${ST.pad(i)} · ${ST.esc(ST.pick(sec.label))}${sec.id === CHIP_LAYOUT.power ? ` · ${ST.esc(ST.text('powerUnit'))}` : ''}</p>
        <h3 class="sc-t">${ST.esc(ST.pick(sec.title)).replace(/\n/g, ' ')}</h3>
        <p class="sc-p">${ST.esc(ST.pick(sec.intro))}</p>
        <a class="sc-go" href="#${sec.id}" data-path="${sec.id}">${ST.esc(ST.text('openSection'))} →</a></article>`);
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
        </div></article>`);
    return cards.join('');
  }

  let last = -1;
  ST.story = {
    html(mode) {
      return `<div class="story-head"><p class="sec-eyebrow"><span class="sec-rule" aria-hidden="true"></span><span>${ST.esc(ST.text('buildKicker'))}</span></p>
          <h2 class="choose-title">${ST.esc(ST.text('buildTitle'))}</h2></div>
        <div class="choose-stage" aria-hidden="true"></div>
        <div class="story-cards">${storyCards(mode)}</div>
        <p class="story-hint"><span class="scroll-mouse" aria-hidden="true"><i></i></span>${ST.esc(ST.text('buildScroll'))}</p>`;
    },
    /* number of steps: the empty chip + one per card (+ a little rest at the end) */
    length(root) { return root.querySelectorAll('.story-card').length + .6; },
    apply(root, P, map, phone) {
      const cards = [...root.querySelectorAll('.story-card')], n = cards.length;
      const pr = root.getBoundingClientRect(), W = pr.width, H = pr.height;
      /* where the chip floats: centred at first, then aside (left on wide screens, top on phones) */
      const shift = ST.smoothstep(ST.clamp((P - .35) / .65));
      const headH = phone ? 96 : 124, pad = phone ? 12 : W * .04;
      const big = { l: W * .08, t: headH, w: W * .84, h: H - headH - (phone ? 70 : 64) };
      const aside = phone ? { l: pad, t: headH - 8, w: W - 2 * pad, h: H * .36 } : { l: pad, t: headH, w: W * .54 - pad, h: H - headH - 40 };
      const cr = { l: ST.lerp(big.l, aside.l, shift), t: ST.lerp(big.t, aside.t, shift), w: ST.lerp(big.w, aside.w, shift), h: ST.lerp(big.h, aside.h, shift) };
      root.style.setProperty('--shift', shift.toFixed(3));
      /* the chip's parts: each section card flies into its block in the last part of its step */
      const blocks = Array(sections.length).fill(0);
      let route = 0, pads = 0;
      const box = root.querySelector('.story-cards').getBoundingClientRect();
      cards.forEach((card, k) => {
        const f = P - (k + 1);
        const inn = ST.clamp((f + .14) / .14), kind = card.dataset.card;   /* the next card comes in as the previous one lands */
        let op = inn, tf = `translateY(${((1 - inn) * 24).toFixed(1)}px)`;
        if (kind === 'sec') {
          const i = +card.dataset.index, g = ST.smoothstep(ST.clamp((f - .62) / .38));
          blocks[i] = g;
          if (g > 0) {   /* fly into the block: from the card's place to the block's place on the chip */
            const br = map.blockRect(i);
            if (br) {
              const sx = br.w / box.width, sy = br.h / box.height, dx = br.l - box.left, dy = br.t - box.top;
              tf = `translate(${(dx * g).toFixed(1)}px,${(dy * g).toFixed(1)}px) scale(${ST.lerp(1, sx, g).toFixed(3)},${ST.lerp(1, sy, g).toFixed(3)})`;
            }
            op = 1 - ST.clamp((g - .75) / .25);
          }
          card.style.setProperty('--fly', g.toFixed(3));
        } else if (kind === 'conn') { route = ST.clamp(f / .7); op = inn * (1 - ST.clamp((f - .82) / .18)); }
        else if (kind === 'pads') { pads = ST.clamp((f - .05) / .75); op = inn * (1 - ST.clamp((f - .82) / .18)); }
        else if (kind === 'glance') op = inn * (1 - ST.clamp((f - .78) / .2));
        if (f > 1.05 && kind !== 'final') op = 0;
        card.style.opacity = op.toFixed(3); card.style.transform = tf;
        card.classList.toggle('is-on', op > .5);
        card.inert = op < .5;
      });
      /* everything before the current point is built, so going back un-builds it */
      map.setStory({ blocks, route: P > n ? 1 : route, pads: P > n ? 1 : pads });
      const step = Math.floor(P);
      if (step !== last) { if (last >= 0 && ST.sound) ST.sound.tick(); last = step; }
      root.classList.toggle('is-ready', P >= n - .1);
      const hint = root.querySelector('.story-hint'); if (hint) hint.style.opacity = (1 - ST.clamp(P / .5)).toFixed(3);
      return cr;
    }
  };
})();
