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
  const showcaseHTML = (list, key) => (list || []).length ? `<div class="pc-show${list.length > 3 ? ' is-many' : ''}" style="--n:${list.length === 4 ? 2 : Math.min(list.length, 3)}" data-show-key="${key}">${list.map((it, k) => {
    const m = SITE_CONTENT.media[it.media];
    return `<article class="pc-show-card" style="--k:${k}" data-show="${k}" id="show-${key.replace('/', '-')}-${it.id}">
      ${m ? `<div class="psc-img"><img src="${ST.esc(m.src)}" alt="${ST.esc(ST.pick(m.alt))}" loading="lazy" decoding="async"></div>` : ''}
      <div class="psc-body"><strong>${ST.esc(ST.pick(it.title))}</strong><p>${ST.esc(ST.pick(it.intro))}</p>
      ${linksHTML(it.links, 'psc-links')}<button type="button" class="psc-more">${ST.esc(ST.text('showMore'))} ↗</button></div></article>`;
  }).join('')}</div>` : '';
  /* paths: one row per path that appears as the page scrolls; "More" opens the path in the side panel */
  function pathRows(s, kids) {
    return `<div class="paths rows"><p class="paths-label">${ST.esc(ST.text('pathsLabel'))}</p>
      <div class="path-rows">${kids.map((k, c) => `<button type="button" class="pr-row" id="row-${s.id}-${k.id}" data-open-path="${s.id}/${k.id}" style="--c:${c}">
        <span class="pr-n">${ST.pad(c + 1)}</span>
        <span class="pr-body"><strong>${ST.esc(ST.pick(k.title))}</strong>${/^Nothing has been published/.test((k.intro || [''])[0]) ? `<span class="xs-badge is-plan">${ST.esc(ST.text('soonBadge'))}</span>` : `<span>${ST.esc(ST.pick(k.intro))}</span>`}</span>
        <span class="pr-actions">${k.deck ? `<span class="pr-watch" role="button" tabindex="0" data-deck="${ST.esc(k.deck)}"><span class="deck-play" aria-hidden="true"></span>${ST.esc(ST.text('deckShort'))}</span>` : ''}<span class="pr-more">${ST.esc(ST.text('showMoreShort'))} <i aria-hidden="true">→</i></span></span>
      </button>`).join('')}</div></div>`;
  }
  /* each row fades in when it reaches the screen; rows that arrive together follow one another */
  let rowIO = null;
  function revealRows() {
    if (rowIO) rowIO.disconnect();
    const rows = $$('.pr-row, .rv, .xs-rv');
    if (!('IntersectionObserver' in window) || ST.state.reduced) { rows.forEach(r => r.classList.add('is-in')); return; }
    rowIO = new IntersectionObserver(entries => {
      let k = 0;
      entries.filter(e => e.isIntersecting).forEach(e => { e.target.style.setProperty('--d', (k++ * .14) + 's'); e.target.classList.add('is-in'); rowIO.unobserve(e.target); });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .15 });
    rows.forEach(r => rowIO.observe(r));
  }

  /* ---------- 01 About: the path, the mission word by word, the vision as four connected fields ---------- */
  /* ---------- 01 About: belief, path, presentation, mission, vision — each its own readable block ---------- */
  const IC = {   // small line icons (24 × 24)
    q: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.6M12 17h.01"/>',
    book: '<path d="M3 5h6a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H3Z"/><path d="M21 5h-6a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5H21Z"/>',
    board: '<rect x="3" y="5" width="18" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M6 8h1M6 16h1M17 8h1M17 16h1"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    factory: '<path d="M3 21V10l6 4V10l6 4V5h6v16Z"/><path d="M7 18h2M12 18h2M17 18h2"/>'
  };
  const icon = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;
  // highlight the key words of a sentence (lists in ui.missionKeys / ui.visionKeys, "|"-separated)
  function marks(text, keys) {
    let h = ST.esc(text);
    (keys || '').split('|').filter(Boolean).forEach(k => {
      const i = h.toLowerCase().indexOf(k.toLowerCase());
      if (i >= 0) h = h.slice(0, i) + '<mark>' + h.slice(i, i + k.length) + '</mark>' + h.slice(i + k.length);
    });
    return h;
  }
  const sentences = t => (t || '').split(/(?<=[.։])\s+/).filter(Boolean);
  // the Mission and Vision cards of About; also shown in the side panel (3D: their boards along the road open them)
  function mvHTML(s, card, which) {
    if (!card) return '';
    const T = ST.text, E = ST.esc, P = ST.pick, mission = card, vision = card;
    const head = (n, label) => `<p class="ab-kick"><span>${n}</span>${E(label)}</p>`;
    const fields = [['book', 'visionEdu'], ['flask', 'visionSci'], ['chip', 'visionTech'], ['factory', 'visionInd']];
    return which === 'mission' ? `<section class="ab-card ab-mission rv" id="show-${s.id}-${mission.id}" aria-labelledby="ab-m">
        ${head('C', P(mission.title)).replace('<p class="ab-kick">', '<p class="ab-kick" id="ab-m">')}
        <p class="ab-quote">${marks(P(mission.intro), T('missionKeys'))}</p>
        <p class="ab-sub">${E(T('missionList'))}</p>
        <ol class="ab-five">${[1, 2, 3, 4, 5].map(n => `<li style="--k:${n}"><b>${n}</b><div><strong>${E(T('m' + n))}</strong><span>${E(T('m' + n + 't'))}</span></div></li>`).join('')}</ol>
      </section>` : `<section class="ab-card ab-vision rv" id="show-${s.id}-${vision.id}" aria-labelledby="ab-v">
        ${head('D', P(vision.title)).replace('<p class="ab-kick">', '<p class="ab-kick" id="ab-v">')}
        <p class="ab-quote">${marks(P(vision.intro), T('visionKeys'))}</p>
        <p class="ab-sub">${E(T('visionFields'))}</p>
        <div class="ab-fields">${fields.map(([ic, k], i) => `<div class="ab-field" style="--k:${i}">${icon(ic)}<strong>${E(T(k))}</strong><span>${E(T(k + 'T'))}</span></div>`).join('')}
</div>
        <div class="ab-people"><span class="ab-pp">${E(T('visionPeopleLine'))}</span>${[1, 2, 3, 4].map(n => `<span class="ab-verb" style="--k:${n}">${E(T('verb' + n))}</span>`).join('')}</div>
      </section>`;
  }
  function aboutHTML(s, opts = {}) {
    const T = ST.text, E = ST.esc, P = ST.pick, cards = s.showcase || [];
    const mission = cards.find(c => c.id === 'mission') || cards[0], vision = cards.find(c => c.id === 'vision') || cards[1];
    const texts = (s.text || []).map(P).filter(Boolean);
    const belief = sentences(texts[0]), pathText = texts[1] || '';
    const head = (n, label) => `<p class="ab-kick"><span>${n}</span>${E(label)}</p>`;
    const steps = [['q', 1], ['book', 2], ['board', 3], ['bulb', 4]];
    const fields = [['book', 'visionEdu'], ['flask', 'visionSci'], ['chip', 'visionTech'], ['factory', 'visionInd']];
    return `<div class="about-x">
      ${texts[0] ? `<div class="ab-block rv">
        ${head('A', T('aboutBelieve'))}
        <p class="ab-state">${E(belief[0] || '')}</p>
        ${belief.length > 1 ? `<p class="ab-body">${E(belief.slice(1).join(' '))}</p>` : ''}
        <p class="ab-sub">${E(T('aboutWho'))}</p>
        <ul class="ab-who">${[1, 2, 3, 4, 5, 6, 7].map(n => `<li style="--k:${n}">${E(T('who' + n))}</li>`).join('')}</ul>
      </div>` : ''}
      <div class="ab-block rv">
        ${head('B', T('aboutPath'))}
        ${pathText ? `<p class="ab-body">${E(pathText)}</p>` : ''}
        <ol class="ab-steps">${steps.map(([ic, n], i) => `<li style="--k:${i}"><span class="ab-si">${icon(ic)}</span>
          <div><strong><em>0${n}</em>${E(T('aboutStep' + n))}</strong><span>${E(T('aboutStep' + n + 't'))}</span></div></li>`).join('')}</ol>
      </div>
      ${s.deck ? `<button type="button" class="ab-watch rv" data-deck="${E(s.deck)}">
        <canvas class="ab-thumb" width="360" height="250" aria-hidden="true"></canvas>
        <span class="ab-wt"><span class="ab-wplay" aria-hidden="true"></span><span><strong>${E(T('aboutWatchTitle'))}</strong><small>${E(T('aboutWatchMeta'))}</small></span></span>
      </button>` : ''}
      ${opts.noMV ? '' : mvHTML(s, mission, 'mission') + mvHTML(s, vision, 'vision')}
    </div>`;
  }
  // the presentation card shows the Aragats mark, drawn once with the deck's colours
  function aboutThumb() {
    if (!window.Aragats) return;
    document.querySelectorAll('.ab-thumb:not([data-done])').forEach(cv => {
      Aragats.create(cv, { theme: 'dark', fixed: true, labels: () => ['', '', '', ''] }).draw(cv.closest('#initiatives') ? 9.6 : Aragats.END);
      cv.dataset.done = '1';
    });
  }
  /* ---------- 03–09 in the 2D view: the same readable blocks as About (kicker, statement, cards) ---------- */
  Object.assign(IC, {
    lab: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><rect x="9" y="7" width="6" height="6" rx="1"/>',
    doc: '<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0Z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6v4H9Z"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/>',
    stage: '<path d="M3 20h18M5 20v-6h14v6"/><circle cx="12" cy="7" r="3"/><path d="M8 14a4 4 0 0 1 8 0"/>',
    tool: '<path d="M14.5 6.5a4 4 0 0 0-5 5L4 17v3h3l5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5Z"/>',
    meet: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5Z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    teach: '<rect x="3" y="4" width="18" height="11" rx="1"/><path d="M7 20l3-5M17 20l-3-5M7 8h6M7 11h9"/>',
    building: '<path d="M4 21V5l8-2v18M12 8h8v13M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2M2 21h20"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/>',
    hand: '<path d="M7 11V6a1.5 1.5 0 0 1 3 0v5M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9a1.5 1.5 0 0 1 3 0v4a8 8 0 0 1-8 8h-.5A6.5 6.5 0 0 1 5 17l-2-4a1.5 1.5 0 0 1 2.6-1.5L7 13"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4Z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>'
  });
  const kick = (n, label) => `<p class="ab-kick"><span>${n}</span>${ST.esc(label)}</p>`;
  const statusOf = it => { const en = (Array.isArray(it) ? it[0] : it) || ''; return /running/i.test(en) ? 'is-run' : /planned/i.test(en) ? 'is-plan' : /prepar/i.test(en) ? 'is-prep' : ''; };
  // a status line "Status: running" becomes a coloured badge; other lines stay facts
  function statusBadges(items) {
    const P = ST.pick, E = ST.esc;
    return (items || []).filter(statusOf).map(it => {
      const t = P(it), i = t.search(/[:։՝]/), label = t.slice(0, i), val = t.slice(i + 1).trim();
      return `<span class="xs-badge ${statusOf(it)}">${/^status|^կարգավիճակ/i.test(label) ? '' : `${E(label)}: `}${E(val)}</span>`;
    }).join('');
  }
  const facts = items => (items || []).filter(it => !statusOf(it)).map(it => `<li>${ST.esc(ST.pick(it))}</li>`).join('');
  // cards that open a path in the side panel; they keep the row ids so the chip map can find them
  function pathCards(s, kids, icons, cls, extra) {
    return `<div class="xs-cards ${cls || ''}">${kids.map((k, c) => `<button type="button" class="xs-card xs-rv" id="row-${s.id}-${k.id}" data-open-path="${s.id}/${k.id}" style="--c:${c}">
      <span class="xs-ic">${icon(icons[c % icons.length])}</span>
      <span class="xs-cb"><strong>${ST.esc(ST.pick(k.title))}</strong><span>${ST.esc(ST.pick(k.intro))}</span>${extra ? extra(k) : ''}</span>
      <span class="xs-go" aria-hidden="true">→</span></button>`).join('')}</div>`;
  }
  const watchCard = (deck, title, meta) => `<button type="button" class="ab-watch rv" data-deck="${ST.esc(deck)}">
      <canvas class="ab-thumb" width="360" height="250" aria-hidden="true"></canvas>
      <span class="ab-wt"><span class="ab-wplay" aria-hidden="true"></span><span><strong>${ST.esc(title)}</strong><small>${ST.esc(meta)}</small></span></span></button>`;

  /* 03 Directions: the gap and its bridge, the five directions, the full presentation */
  const DIR_ICONS = ['lab', 'book', 'doc', 'trophy', 'mic'];
  function dirHTML(s) {
    const T = ST.text, E = ST.esc, P = ST.pick, kids = s.children || [];
    const planks = kids.map((k, i) => `<g class="xg-plank" style="--k:${i}"><rect x="${232 + i * 60}" y="96" width="52" height="26" rx="5"/><text x="${258 + i * 60}" y="114">${i + 1}</text></g>`).join('');
    return `<div class="about-x">
      <div class="ab-block rv xs-gap">
        ${kick('A', T('dirGapHead'))}
        <svg class="xg-art" viewBox="0 0 780 210" aria-hidden="true">
          <path class="xg-cliff" d="M0 110 H232 L214 210 H0 Z"/><path class="xg-cliff" d="M548 110 H780 V210 H566 Z"/>
          <text class="xg-t" x="16" y="150">${E(T('dirGapL'))}</text><text class="xg-s" x="16" y="176">${E(T('dirGapLs'))}</text>
          <text class="xg-t" x="764" y="150" text-anchor="end">${E(T('dirGapR'))}</text><text class="xg-s" x="764" y="176" text-anchor="end">${E(T('dirGapRs'))}</text>
          ${planks}
          <path class="xg-arc" d="M232 86 Q390 20 548 86" pathLength="1"/>
          <circle class="xg-dot" r="7" cx="0" cy="0"/>
        </svg>
        <p class="ab-body xg-note">${E(T('dirGapNote'))}</p>
      </div>
      <div class="ab-block rv">
        ${kick('B', T('dirFive'))}
        <div class="xs-dirs">${kids.map((k, c) => `<article class="xs-dir xs-rv" id="row-${s.id}-${k.id}" style="--c:${c}">
          <button type="button" class="xs-dir-main" data-open-path="${s.id}/${k.id}">
            <span class="xs-ic">${icon(DIR_ICONS[c])}<em>${c + 1}</em></span>
            <span class="xs-cb"><span class="xs-badges">${statusBadges(k.items)}</span><strong>${E(P(k.title))}</strong><span>${E(P(k.intro))}</span>
              ${facts(k.items) ? `<ul class="xs-facts">${facts(k.items)}</ul>` : ''}</span></button>
          <span class="xs-dir-act">${k.deck ? `<span class="pr-watch" role="button" tabindex="0" data-deck="${E(k.deck)}"><span class="deck-play" aria-hidden="true"></span>${E(T('deckShort'))}</span>` : ''}
            <button type="button" class="xs-more" data-open-path="${s.id}/${k.id}">${E(T('showMoreShort'))} →</button></span>
        </article>`).join('')}</div>
      </div>
      ${s.deck ? watchCard(s.deck, T('dirWatchTitle'), T('dirWatchMeta')) : ''}
    </div>`;
  }

  /* 05 Impact: what we want to change, how we will measure it */
  function impactHTML(s) {
    const T = ST.text, E = ST.esc, P = ST.pick;
    const meas = ((s.children || []).find(k => k.id === 'measuring') || {}).items || [];
    const MI = ['users', 'book', 'flask', 'check', 'meet', 'heart', 'star'];
    return `<div class="about-x">
      <div class="ab-block rv">
        ${kick('A', T('imA'))}
        <div class="xs-grid2">${[['book', 1], ['lab', 2], ['flask', 3], ['cap', 4]].map(([ic, n], i) => `<div class="xs-tile" style="--k:${i}">${icon(ic)}<strong>${E(T('out' + n))}</strong><span>${E(T('out' + n + 't'))}</span></div>`).join('')}</div>
      </div>
      ${meas.length ? `<div class="ab-block rv">
        ${kick('B', T('imB'))}
        <ul class="xs-meter">${meas.map((m, i) => `<li style="--k:${i}">${icon(MI[i % MI.length])}<span>${E(P(m))}</span><b>—</b></li>`).join('')}</ul>
        <p class="xs-note">${icon('clock')}${E(T('imBnote'))}</p>
      </div>` : ''}
      <p class="ab-kick xs-kick-only">${'<span>C</span>' + E(T('imC'))}</p>
    </div>`;
  }

  /* 06 Community: who SemiTec is for, partnership, the people behind it */
  const AUD_ICONS = ['cap', 'gear', 'teach', 'flask', 'building', 'globe'];
  function peopleHTML(s) {
    const T = ST.text, E = ST.esc, P = ST.pick, part = (s.showcase || [])[0];
    const aud = (s.items || []).map(P).map(t => { const i = t.search(/[:։]/); return i > 0 ? [t.slice(0, i), t.slice(i + 1).trim()] : [t, '']; });
    return `<div class="about-x">
      ${aud.length ? `<div class="ab-block rv">
        ${kick('A', T('cmA'))}
        <div class="xs-grid2">${aud.map(([a, b], i) => `<div class="xs-tile" style="--k:${i}">${icon(AUD_ICONS[i % AUD_ICONS.length])}<strong>${E(a)}</strong><span>${E(b)}</span></div>`).join('')}</div>
      </div>` : ''}
      ${part ? `<section class="ab-card rv xs-callout" id="show-${s.id}-${part.id}">
        ${kick('B', P(part.eyebrow) || T('cmB'))}
        <p class="ab-state">${E(P(part.title))}</p><p class="ab-body">${E(P(part.intro))}</p>
        <a class="xs-btn" href="#support/partner">${E(T('cmPartnerBtn'))} →</a>
      </section>` : ''}
      <p class="ab-kick xs-kick-only"><span>C</span>${E(T('cmC'))}</p>
    </div>`;
  }

  /* 07 Transparency: three principles and the documents that will be published */
  function trustHTML(s) {
    const T = ST.text, E = ST.esc, P = ST.pick;
    const docs = ((s.children || []).find(k => k.id === 'reports') || {}).items || [];
    return `<div class="about-x">
      <div class="ab-block rv">
        ${kick('A', T('trA'))}
        <div class="xs-grid3">${[['eye', 1], ['chart', 2], ['shield', 3]].map(([ic, n], i) => `<div class="xs-tile" style="--k:${i}">${icon(ic)}<strong>${E(T('tr' + n))}</strong><span>${E(T('tr' + n + 't'))}</span></div>`).join('')}</div>
      </div>
      ${docs.length ? `<div class="ab-block rv">
        ${kick('B', T('trB'))}
        <ul class="xs-docs">${docs.map((d, i) => `<li style="--k:${i}">${icon('doc')}<span>${E(P(d))}</span><em>${E(T('trPending'))}</em></li>`).join('')}</ul>
      </div>` : ''}
      <p class="ab-kick xs-kick-only"><span>C</span>${E(T('trC'))}</p>
    </div>`;
  }

  /* 08 Support: the ways to support, and a clear note on payments */
  function giveHTML(s) {
    const T = ST.text, E = ST.esc, P = ST.pick;
    const note = (s.text || []).map(P).filter(Boolean)[0];
    return `<div class="about-x">
      <div class="ab-block rv">
        ${kick('A', T('gvA'))}
        ${pathCards(s, s.children || [], ['users', 'box', 'star', 'coin'], 'xs-two', k => k.id === 'financial' ? `<span class="xs-badge is-plan">${E(T('gvLater'))}</span>` : '')}
        ${note ? `<p class="xs-note">${icon('shield')}${E(note)}</p>` : ''}
      </div>
      <p class="ab-kick xs-kick-only"><span>B</span>${E(T('gvB'))}</p>
    </div>`;
  }

  /* 09 Get involved: choose who you are */
  function joinHTML(s) {
    const T = ST.text;
    return `<div class="about-x">
      <div class="ab-block rv">
        ${kick('A', T('jnA'))}
        ${pathCards(s, s.children || [], ['cap', 'gear', 'flask', 'building', 'heart', 'bulb', 'mail'], 'xs-two')}
      </div>
      <div class="ab-block rv">
        ${kick('B', ST.pick(SITE_CONTENT.feeds['opportunities-feed'].title))}
        <div class="xs-empty">${icon('clock')}<p>${ST.esc(ST.pick(SITE_CONTENT.feeds['opportunities-feed'].intro))}</p></div>
      </div>
      <p class="ab-kick xs-kick-only"><span>C</span>${ST.esc(T('jnB'))}</p>
    </div>`;
  }
  const SECX = { purpose: aboutHTML, focus: symbolHTML, initiatives: dirHTML, impact: impactHTML, people: peopleHTML, transparency: trustHTML, donate: giveHTML, support: joinHTML };
  const OWN_ROWS = { initiatives: 1, donate: 1, support: 1 };      // their paths are already cards above
  const OWN_TEXT = { purpose: 1, donate: 1, initiatives: 1 };      // their text and presentation are part of the blocks
  /* the same blocks for the 3D view's reading card (js/mode-signal.js); Our Symbol shows its pillars there,
     because the mountain itself stands beside the road */
  ST.secHTML = s => {
    if (s.id === 'events') return eventsPanel();
    if (s.id === 'purpose') return aboutHTML(s, { noMV: true }).replace(/<\/div>\s*$/, '') + `<div class="ab-block rv xs-mvlinks">${(s.showcase || []).slice(0, 2).map((c, k) => `<button type="button" class="xs-card" data-card="purpose:${k}"><span class="xs-ic">${icon(k ? 'eye' : 'star')}</span><span class="xs-cb"><strong>${ST.esc(ST.pick(c.title))}</strong><span>${ST.esc(ST.text('mvAlong'))}</span></span><span class="xs-go" aria-hidden="true">→</span></button>`).join('')}</div></div>`;
    if (s.id === 'focus') return `<div class="about-x"><div class="ab-block rv">${kick('A', ST.pick(s.label))}<p class="ab-body">${ST.esc(ST.text('symbolHint3d'))}</p>
      <div class="sy-pillars">${(s.showcase || []).slice(0, 4).map((c, k) => `<button type="button" class="sy-pill" data-card="focus:${k}"><span class="sy-n">0${k + 1}</span><strong>${ST.esc(ST.pick(c.title))}</strong><span class="sy-d">${ST.esc(ST.pick(c.intro))}</span></button>`).join('')}</div></div></div>`;
    return SECX[s.id] ? SECX[s.id](s) : '';
  };
  ST.ownsPaths = id => !!OWN_ROWS[id];
  /* ---------- 02 Our Symbol: a contour map rises into Aragats, each summit is visited, and the
     silhouette fills into the SemiTec mark (drawn by expo/js/aragats.js, shared with the presentation) ---------- */
  function symbolHTML(s) {
    const E = ST.esc, P = ST.pick, cards = (s.showcase || []).slice(0, 4);
    return `<div class="symbol-x">
      <div class="sy-stage">
        <canvas class="sy-canvas" role="img" aria-label="${E(cards.map(c => P(c.title)).join(' · '))}"></canvas>
        <button type="button" class="sy-replay" aria-label="${E(ST.text('symbolReplay'))}"><span aria-hidden="true">↻</span> ${E(ST.text('symbolReplay'))}</button>
      </div>
      <p class="sy-hint">${E(ST.text('symbolHint'))}</p>
      <div class="sy-pillars">${cards.map((c, k) => `<button type="button" class="sy-pill" data-k="${k}" id="show-${s.id}-${c.id}">
        <span class="sy-n">0${k + 1}</span><strong>${E(P(c.title))}</strong><span class="sy-d">${E(P(c.intro))}</span></button>`).join('')}</div>
    </div>`;
  }
  const SY = { root: null, art: null, t: 0, started: false, vis: false, raf: 0, last: 0, tween: null, holdAt: -1, hold: 0, io: null };
  function symbolInit() {
    const root = document.querySelector('.symbol-x');
    if (!root || !window.Aragats) return;
    if (SY.root !== root) {
      SY.root = root;
      const cards = ((SITE_CONTENT.sections || []).find(x => x.id === 'focus') || {}).showcase || [];
      SY.art = Aragats.create(root.querySelector('canvas'), { theme: 'light', labels: () => cards.slice(0, 4).map(c => ST.pick(c.title)),
        font: getComputedStyle(document.body).fontFamily });
      if (ST.state.reduced) { SY.t = Aragats.END; SY.started = true; }
      if (SY.io) SY.io.disconnect();
      SY.io = new IntersectionObserver(es => es.forEach(e => {
        SY.vis = e.isIntersecting;
        if (SY.vis && !SY.started && e.intersectionRatio > .35) SY.started = true;
        if (SY.vis) symbolLoop();
      }), { threshold: [0, .35, .6] });
      SY.io.observe(root.querySelector('.sy-stage'));
    }
    symbolFrame();
  }
  function symbolFrame() {
    if (!SY.art) return;
    SY.art.draw(SY.t);
    SY.root.querySelectorAll('.sy-pill').forEach(b => b.classList.toggle('is-on', Aragats.focus(SY.t, +b.dataset.k) > .5));
    SY.root.classList.toggle('is-done', SY.t >= Aragats.END);
  }
  function symbolLoop() {
    if (SY.raf) return;
    SY.last = performance.now();
    const tick = now => {
      SY.raf = 0;
      const dt = Math.min(.1, (now - SY.last) / 1000); SY.last = now;
      if (!SY.vis || document.hidden || document.documentElement.dataset.mode !== '2d') return;
      if (SY.tween) {
        const k = Math.min(1, (now - SY.tween.start) / SY.tween.dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        SY.t = SY.tween.from + (SY.tween.to - SY.tween.from) * e;
        if (k >= 1) SY.tween = null;
      } else if (SY.holdAt >= 0 && SY.t >= SY.holdAt) {
        SY.t = SY.holdAt; SY.hold -= dt; if (SY.hold <= 0) SY.holdAt = -1;
      } else if (SY.started && SY.t < Aragats.END) SY.t = Math.min(Aragats.END, SY.t + dt);
      symbolFrame();
      if (SY.started && (SY.t < Aragats.END || SY.tween || SY.holdAt >= 0)) SY.raf = requestAnimationFrame(tick);
    };
    SY.raf = requestAnimationFrame(tick);
  }
  // fly (rewind or forward) to summit k, stay there for a while, then go on to the mark
  function symbolFocus(k) {
    if (!SY.art) return;
    const to = Aragats.T1 + k * Aragats.TP + 1;
    SY.started = true;
    SY.tween = ST.state.reduced ? null : { from: SY.t, to, start: performance.now(), dur: 900 + 120 * Math.abs(SY.t - to) };
    if (ST.state.reduced) SY.t = to;
    SY.holdAt = to; SY.hold = 5;
    symbolLoop(); symbolFrame();
  }
  function symbolReplay() {
    SY.tween = null; SY.holdAt = -1; SY.t = 0; SY.started = true; symbolLoop(); symbolFrame();
  }
  /* the full content of a path, shown in the side panel */
  function pathBody(section, child) {
    const p = `${section.id}/${child.id}`;
    const items = (child.items || []).map(it => `<li>${ST.esc(ST.pick(it))}</li>`).join('');
    const sub = (child.children || []).map(g => `<div class="pc-sub-item">
        <strong>${ST.esc(ST.pick(g.title))}</strong>
        <span>${g.items && g.items.length ? g.items.map(it => ST.esc(ST.pick(it))).join(' · ') : ST.esc(ST.pick(g.intro || ''))}</span>
        ${linksHTML(g.links, 'pc-sub-links')}
      </div>`).join('');
    return `<h2 class="dr-title">${ST.esc(ST.pick(child.title))}</h2>
        <p class="dr-lead">${ST.esc(ST.pick(child.intro))}</p>
        ${ST.deckHTML(child)}
        ${(child.text || []).map(t => `<p class="dr-text">${ST.esc(ST.pick(t))}</p>`).join('')}
        ${items ? `<ul class="pc-items">${items}</ul>` : ''}
        ${ST.pathEventsHTML(child)}
        ${linksHTML(child.links, 'pc-links')}
        ${(child.showcase || []).length ? `<div class="dr-list-wrap">${child.showcaseLabel ? `<p class="dr-list-label">${ST.esc(ST.pick(child.showcaseLabel))}</p>` : ''}${showcaseHTML(child.showcase, p).replace('class="pc-show', 'class="pc-show dr-list')}</div>` : ''}
        ${sub ? `<p class="pc-sub-label">${ST.esc(ST.text('further'))}</p><div class="pc-sub">${sub}</div>` : ''}`;
  }
  /* a card (product, news item, event) in the side panel: text first, then its pictures in a strip */
  function cardBody(item) {
    const esc = ST.esc, P = ST.pick;
    if (item.id === 'mission' || item.id === 'vision') {
      const sec = sections.find(x => x.id === 'purpose');
      if (sec && (sec.showcase || []).includes(item)) return `<h2 class="dr-title">${esc(P(item.title))}</h2><div class="about-x dr-mv">${mvHTML(sec, item, item.id).replace(/ rv"/g, ' rv is-in"').replace(/ id="show-[^"]*"/, '')}</div>`;
    }
    const pics = (item.gallery || (item.media ? [item.media] : [])).filter((id, i, a) => SITE_CONTENT.media[id] && a.indexOf(id) === i);
    return `<h2 class="dr-title">${esc(P(item.title))}</h2>
      <p class="dr-lead">${esc(P(item.intro))}</p>
      ${(item.details || []).map(t => `<p class="dr-text">${esc(P(t))}</p>`).join('')}
      ${(item.items || []).length ? `<ul class="pc-items">${item.items.map(t => `<li>${esc(P(t))}</li>`).join('')}</ul>` : ''}
      ${linksHTML(item.links, 'pc-links')}
      ${pics.length ? `<div class="dr-strip">${pics.map(id => { const m = SITE_CONTENT.media[id]; return `<figure><button type="button" data-media="${esc(id)}" data-media-title="${esc(P(m.title))}" aria-label="${esc(ST.text('viewImage'))}"><img src="${esc(m.src)}" alt="${esc(P(m.alt))}" loading="lazy"><span class="dr-zoom" aria-hidden="true">⤢</span></button><figcaption><strong>${esc(P(m.title))}</strong>${m.caption ? `<span>${esc(P(m.caption))}</span>` : ''}</figcaption></figure>`; }).join('')}</div>` : ''}`;
  }

  /* ---------- the side panel (2D): paths and cards open here, the page stays where it is ---------- */
  const drawer = { el: null, stack: [] };
  function cardList(entry) {
    if (entry.kind === 'news') return ST.news().map(ST.newsCard);
    if (entry.kind === 'example') return (SITE_CONTENT.eventExamples || []).map(ST.exampleCard);
    if (entry.kind === 'event') { const ev = ST.events()[entry.when === 'up' ? 'upcoming' : 'past']; return ev.map(ST.eventCard); }
    const [sid, cid] = entry.key.split('/'), sec = sections.find(x => x.id === sid);
    const node = cid ? (sec.children || []).find(x => x.id === cid) : sec;
    return (node && node.showcase) || [];
  }
  function crumbOf(entry) {
    if (entry.kind === 'path') { const s = sections.find(x => x.id === entry.path[0]), c = (s.children || []).find(x => x.id === entry.path[1]); return [ST.pad(sections.indexOf(s)) + ' ' + ST.pick(s.label), ST.pick(c.short || c.title)]; }
    const item = cardList(entry)[entry.idx];
    return [ST.pick(item.short || item.title)];
  }
  function drawerEnsure() {
    if (drawer.el) return drawer.el;
    const el = document.createElement('aside');
    el.className = 'drawer'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="dr-scrim"></div><div class="dr-panel" role="dialog" aria-modal="true" tabindex="-1">
      <header class="dr-head"><button type="button" class="dr-back" hidden>←</button><nav class="dr-crumb"></nav><button type="button" class="dr-close">×</button></header>
      <div class="dr-body"></div><footer class="dr-foot" hidden><button type="button" class="dr-prev">←</button><span class="dr-count"></span><button type="button" class="dr-next">→</button></footer></div>`;
    document.body.append(el);
    el.addEventListener('click', e => {
      if (e.target.closest('.dr-close') || e.target.classList.contains('dr-scrim')) { drawerClose(); return; }
      if (e.target.closest('.dr-back')) { drawer.stack.pop(); drawerRender(); return; }
      const cr = e.target.closest('[data-crumb]');
      if (cr) {
        if (cr.dataset.crumb === 'section') { const sid = drawer.stack[0].path[0]; drawerClose(); if (document.documentElement.dataset.mode !== '3d') scrollToPath([sid]); }
        else { drawer.stack.length = +cr.dataset.crumb + 1; drawerRender(); }
        return;
      }
      const nav = e.target.closest('.dr-prev,.dr-next');
      if (nav) { const top = drawer.stack[drawer.stack.length - 1], n = cardList(top).length; top.idx = (top.idx + (nav.classList.contains('dr-next') ? 1 : -1) + n) % n; drawerRender(); return; }
      const sc = e.target.closest('.pc-show-card');
      if (sc && !e.target.closest('.psc-links a')) { drawer.stack.push({ kind: 'card', key: sc.closest('.pc-show').dataset.showKey, idx: +sc.dataset.show }); drawerRender(); return; }
      const m = e.target.closest('[data-media]'); if (m) { ST.openMedia(m.dataset.media, m.dataset.mediaTitle); return; }
      const a = e.target.closest('a[href^="#"]'); if (a) drawerClose(true);
    });
    el.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); if (drawer.stack.length > 1) { drawer.stack.pop(); drawerRender(); } else drawerClose(); } });
    drawer.el = el; return el;
  }
  function drawerRender() {
    const el = drawerEnsure(), top = drawer.stack[drawer.stack.length - 1]; if (!top) return;
    /* every level above the current one is a link: the section closes the panel, a path or card goes back to it */
    const crumbs = [];
    drawer.stack.forEach((e, i) => {
      const names = crumbOf(e);
      if (i === 0 && e.kind === 'path') crumbs.push({ name: names[0], go: 'section' });
      crumbs.push({ name: names[names.length - 1], go: i });
    });
    el.querySelector('.dr-crumb').innerHTML = crumbs.map((c, k) => k === crumbs.length - 1 ? `<span aria-current="page">${ST.esc(c.name)}</span>` : `<button type="button" data-crumb="${c.go}">${ST.esc(c.name)}</button>`).join('<i aria-hidden="true">›</i>');
    el.querySelector('.dr-back').hidden = drawer.stack.length < 2;
    el.querySelector('.dr-back').setAttribute('aria-label', ST.text('back').trim());
    el.querySelector('.dr-close').setAttribute('aria-label', ST.text('close'));
    let html;
    if (top.kind === 'path') { const s = sections.find(x => x.id === top.path[0]); html = pathBody(s, s.children.find(x => x.id === top.path[1])); }
    else html = cardBody(cardList(top)[top.idx]);
    const body = el.querySelector('.dr-body');
    body.innerHTML = `<div class="dr-page">${html}</div>`; body.scrollTop = 0;
    const foot = el.querySelector('.dr-foot'), n = top.kind === 'path' ? 0 : cardList(top).length;
    foot.hidden = n < 2; if (n > 1) foot.querySelector('.dr-count').textContent = `${ST.pad(top.idx + 1)} / ${ST.pad(n)}`;
  }
  function drawerOpen(entry) {
    const el = drawerEnsure();
    drawer.stack = [entry]; drawerRender();
    el.setAttribute('aria-hidden', 'false'); el.classList.add('is-open');
    document.documentElement.classList.add('dr-open');
    if (entry.kind === 'path' && document.documentElement.dataset.mode !== '3d') { openPath = [...entry.path]; history.replaceState(null, '', '#' + entry.path.join('/')); }
    setTimeout(() => el.querySelector('.dr-panel').focus(), 50);
    ST.sound && ST.sound.blip && ST.sound.blip('read');
  }
  ST.drawerOpen = e => drawerOpen(e);
  ST.paintThumbs = () => aboutThumb();
  function drawerClose(keepHash) {
    if (!drawer.el || !drawer.el.classList.contains('is-open')) return;
    const first = drawer.stack[0];
    drawer.el.classList.remove('is-open'); drawer.el.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('dr-open');
    drawer.stack = []; openPath = null;
    if (!keepHash && first && first.kind === 'path' && document.documentElement.dataset.mode !== '3d') history.replaceState(null, '', '#' + first.path[0]);
    const row = first && first.kind === 'path' && document.getElementById(`row-${first.path[0]}-${first.path[1]}`); if (row) row.focus({ preventScroll: true });
  }
  R.closeDrawer = () => drawerClose(true);
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
  /* 04 News & Events: types of events, what is coming, examples of each type, what took place, news */
  const EV_ICONS = { hackathon: 'trophy', conference: 'stage', lecture: 'mic', meeting: 'meet', workshop: 'tool' };
  const EV_ORDER = ['lecture', 'meeting', 'workshop', 'hackathon', 'conference'];
  ST.exampleCard = x => {
    const T = ST.text, t = (SITE_CONTENT.eventTypes || {})[x.type] || {};
    const d = [];
    if (x.who) d.push([T('evFor'), x.who]);
    if (x.format) d.push([T('evFormat'), x.format]);
    const ex = SITE_CONTENT.ui.evExample || ['Example', 'Example'], lab = t.label || ['', ''];
    return { title: x.title, intro: x.intro, short: t.label, kicker: [`${ex[0]} · ${lab[0]}`, `${ex[1]} · ${lab[1]}`],
      details: d.map(([k, v]) => [`${k}: ${ST.pick(v)}`, `${k}: ${ST.pick(v)}`]).concat(x.bring ? [[`${T('evBring')}: ${ST.pick(x.bring)}`, `${T('evBring')}: ${ST.pick(x.bring)}`]] : []).concat([[T('evExampleNote'), T('evExampleNote')]]),
      items: x.agenda || [], links: x.path ? [{ label: [T('evDirection'), T('evDirection')], href: '#' + x.path }] : [] };
  };
  function eventsPanel() {
    const T = ST.text, E = ST.esc, P = ST.pick;
    const { upcoming, past } = ST.events(), news = ST.news(), types = SITE_CONTENT.eventTypes || {}, ex = SITE_CONTENT.eventExamples || [];
    const badge = d => `<span class="evc-badge"><b>${d.getDate()}</b>${E(new Intl.DateTimeFormat(ST.state.lang === 'hy' ? 'hy-AM' : 'en-GB', { month: 'short' }).format(d))}</span>`;
    const evCard = (e, k, kind) => { const t = types[e.type] || {}, m = SITE_CONTENT.media[e.media || t.media];
      return `<article class="evc is-${kind}" data-ev-open="${kind}:${k}" tabindex="0">${m ? `<div class="evc-img"><img src="${E(m.src)}" alt="" loading="lazy"></div>` : ''}${badge(e.when)}
        <div class="evc-body"><span class="evc-type">${E(P(t.label || ''))}</span><strong>${E(P(e.title))}</strong><small>${E(P(e.place || ''))}</small></div></article>`; };
    const empty = (key, btn) => `<div class="xs-empty">${icon('clock')}<p>${E(T(key))}</p>${btn ? `<a class="xs-btn" href="#support/idea">${E(T('evPropose'))} →</a>` : ''}</div>`;
    return `<div class="about-x xs-events">
      <div class="ab-block rv">
        ${kick('A', T('evTypesTitle'))}
        <ul class="xs-types">${EV_ORDER.filter(k => types[k]).map((k, i) => `<li style="--k:${i}" class="t-${k}">${icon(EV_ICONS[k])}<strong>${E(P(types[k].label))}</strong><span>${E(T('evt_' + k))}</span></li>`).join('')}</ul>
      </div>
      <section class="ab-block rv" id="show-events-upcoming">
        ${kick('B', T('upcomingTitle'))}
        ${upcoming.length ? `<div class="evc-row">${upcoming.map((e, k) => evCard(e, k, 'up')).join('')}</div>` : empty('evNoneUpcoming', true)}
      </section>
      ${ex.length ? `<section class="ab-block rv" id="show-events-examples">
        ${kick('C', T('evExamples'))}
        <p class="ab-body">${E(T('evExampleNote'))}</p>
        <div class="xs-ex">${ex.map((x, k) => { const t = types[x.type] || {}; return `<button type="button" class="xs-exc t-${E(x.type)}" data-ex-open="${k}" style="--k:${k}">
          <span class="xs-exb"><span class="xs-ic">${icon(EV_ICONS[x.type] || 'star')}</span><span class="xs-exl">${E(P(t.label || ''))}</span><span class="xs-stamp">${E(T('evExample'))}</span></span>
          <strong>${E(P(x.title))}</strong><span class="xs-exi">${E(P(x.intro))}</span>
          <span class="xs-exm"><span>${icon('users')}${E(P(x.who || ''))}</span><span>${icon('clock')}${E(P(x.format || ''))}</span></span></button>`; }).join('')}</div>
      </section>` : ''}
      <section class="ab-block rv" id="show-events-past">
        ${kick(ex.length ? 'D' : 'C', T('evPast'))}${past.length ? ` <button type="button" class="ev-open" data-open-memory="gallery">${E(T('openGallery'))} ↗</button>` : ''}
        ${past.length ? `<div class="evc-row">${past.slice().reverse().map((e, k) => evCard(e, past.length - 1 - k, 'past')).join('')}</div>` : empty('evNonePast')}
      </section>
      <section class="ab-block rv" id="show-events-news">
        ${kick(ex.length ? 'E' : 'D', T('evNews'))}
        <p class="ab-body">${E(P(SITE_CONTENT.feeds['news-feed'].intro))}</p>${news.length ? '' : empty('feedEmpty')}<ol class="news-list">${news.map((n, k) => `<li><button type="button" data-news="${k}"><span class="nl-date">${E(ST.fmtNewsDate(n))}</span><strong>${E(P(n.title))}</strong><span class="nl-go" aria-hidden="true">↗</span></button></li>`).join('')}</ol>
      </section>
      <section class="ev-group ev-propose rv" id="show-events-propose"><p>${E(T('evProposeNote'))}</p><a class="evc-btn" href="#support/idea">${E(T('evPropose'))} →</a></section>
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
    // No API exists for these collections yet; render editorial copy and an honest empty state.
    const feed = key => {
      const f = SITE_CONTENT.feeds[key];
      return `<div class="ev-group"><h3 class="ev-head">${ST.esc(ST.pick(f.title))}</h3><p class="sec-text">${ST.esc(ST.pick(f.intro))}</p><p class="evc-empty">${ST.esc(ST.text('feedEmpty'))}</p></div>`;
    };
    const html = sections.map((s, i) => {
      const H = i === 0 ? 'h1' : 'h2';
      const eyebrow = i === 0 ? (s.eyebrow ? ST.pick(s.eyebrow) : ST.text('beginning')) : ST.pick(s.label);   // one name per section: the same as the chip and the bottom bar
      const items = (s.items || []).map((it, c) => `<li style="--c:${c}">${ST.esc(ST.pick(it))}</li>`).join('');
      const kids = (s.children || []);
      return `<section class="sec${i === 0 ? ' sec-hero' : ''}" id="${s.id}" data-index="${i}" aria-labelledby="h-${s.id}">
        <div class="sec-ghost" aria-hidden="true">${ST.pad(i)}</div>
        <div class="sec-inner">
          <p class="sec-eyebrow"><span class="sec-num">${ST.pad(i)}</span><span class="sec-rule" aria-hidden="true"></span><span>${ST.esc(eyebrow)}</span></p>
          <${H} class="sec-title" id="h-${s.id}">${title(ST.pick(s.title))}</${H}>
          <p class="sec-intro">${ST.esc(ST.pick(s.intro))}</p>
          ${OWN_TEXT[s.id] ? '' : (s.text || []).filter(t => ST.pick(t)).map(t => `<p class="sec-text">${ST.esc(ST.pick(t))}</p>`).join('')}
          ${OWN_TEXT[s.id] ? '' : ST.deckHTML(s)}
          ${linksHTML(s.links, 'hero-actions')}
          ${s.id === 'support' ? `<p class="sec-text">${ST.esc(ST.pick(SITE_CONTENT.brand.legalName))}</p>` : ''}
          ${SECX[s.id] ? SECX[s.id](s) : showcaseHTML(s.showcase, s.id)}
          ${i === 0 ? `<ul class="hero-tags">${items}</ul>
             <div class="hero-actions">
               <span class="hero-cue"><span class="scroll-mouse" aria-hidden="true"><i></i></span>${ST.esc(ST.text('scrollBegin'))}</span>
             </div>
        </div>${chooseBlock()}<div>` : `
          ${SECX[s.id] ? '' : `<ul class="sec-items">${items}</ul>`}
          ${s.id === 'events' ? eventsPanel() : ''}
          ${s.id !== 'events' && ST.bankFor(s.id) ? memoryPanel(ST.bankFor(s.id)) : ''}
          ${s.id === CHIP_LAYOUT.power ? givePanel() : ''}
          ${s.id === 'support' ? contactPanel() : ''}
          ${kids.length && !OWN_ROWS[s.id] ? pathRows(s, kids) : ''}
          ${s.id === 'people' ? padStrip() : ''}`}
        </div>
      </section>`;
    });
    intro.innerHTML = html[0]; storyLast = -1;
    main.innerHTML = html.slice(1).join('');
    revealRows();
    symbolInit(); aboutThumb();
    ST.eco.render(outro);
    cache = new WeakMap();
    if (drawer.el && drawer.el.classList.contains('is-open')) drawerRender();
  }

  /* ---------- path cards ---------- */
  function setCard(path, open) {
    const row = document.getElementById(`row-${path[0]}-${path[1]}`); if (!row) return null;
    if (open) drawerOpen({ kind: 'path', path: [path[0], path[1]] }); else drawerClose();
    return row;
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
    /* a card on a section's main road (About): scroll to it and let it glow */
    const shown = path.length === 2 && document.getElementById(`show-${path[0]}-${path[1]}`);
    if (shown) {
      requestAnimationFrame(() => { measure(); scrollTo({ top: Math.max(0, shown.getBoundingClientRect().top + scrollY - innerHeight * .3), behavior: instant || ST.state.reduced ? 'instant' : 'smooth' }); if (instant) readScroll(); });
      shown.classList.remove('is-pulse'); void shown.offsetWidth; shown.classList.add('is-pulse');
      return;
    }
    const r = ST.resolve(path); if (!r) return;
    if (path.length === 1) drawerClose(true);
    const behavior = instant || ST.state.reduced ? 'instant' : 'smooth';
    if (path.length > 1) {
      /* a path opens in the side panel; the page goes to the top of its section, so the map stays on that section */
      const row = document.getElementById(`row-${path[0]}-${path[1]}`);
      if (row) {
        measure();
        const header = $('.header').offsetHeight;
        scrollTo({ top: Math.max(0, tops[r.index] - header - 8), behavior: 'instant' });
        readScroll();
        drawerOpen({ kind: 'path', path: [path[0], path[1]] });
        return;
      }
    }
    const header = $('.header').offsetHeight + (document.documentElement.classList.contains('map-strip') || (narrow.matches && mini === 'strip' && r.index > 0) ? STRIP_H : 0);
    scrollTo({ top: r.index === 0 ? 0 : Math.max(0, tops[r.index] - header - 8), behavior });
    if (instant) readScroll();
  }

  /* ---------- view API ---------- */
  /* step-by-step scrolling: the opening story (one step per card: it lands on the chip, the connections, the contacts)
     and the ending (topology → I/O side → package → ecosystem). Durations: SITE_CONTENT.story.stepMs */
  const MS = () => Object.assign({ card: 700, connections: 1000, pads: 900, ending: 1100 }, (SITE_CONTENT.story || {}).stepMs || {});
  function storySteps() {
    const ch = $('.choose'), pin = ch && ch.firstElementChild; if (!pin || !ch.offsetHeight) return [];
    const header = $('.header').offsetHeight, top = ch.getBoundingClientRect().top + scrollY - header, span = ch.offsetHeight - pin.offsetHeight, len = ST.story.length(pin);
    const n = pin.querySelectorAll('.story-card').length, P = [...Array(n + 1).keys(), len];
    return P.map(p => Math.round(top + (p / len) * span));
  }
  ST.stepRegion({
    enabled: () => on && !map.expanded,
    positions: storySteps,
    ms: (from, to) => {
      const pin = $('.choose .choose-pin') || ($('.choose') || {}).firstElementChild, pos = storySteps(), k = pos.findIndex(p => Math.abs(p - to) < 3);
      const card = pin && pin.querySelectorAll('.story-card')[k - 2], kind = card && card.dataset.card, m = MS();
      return kind === 'conn' ? m.connections : kind === 'pads' ? m.pads : k === pos.length - 1 ? 500 : m.card;
    }
  });
  ST.stepRegion({
    enabled: () => on && !map.expanded && !!outro && !!outro.firstElementChild,
    positions: () => {
      const header = $('.header').offsetHeight, top = outro.getBoundingClientRect().top + scrollY - header, span = outro.offsetHeight - outro.firstElementChild.offsetHeight;
      return [.02, .24, .49, .8].map(q => Math.round(top + q * span));
    },
    ms: () => MS().ending,
    holdEnd: true   /* the ecosystem is the last screen: scrolling on does not push it up under the header */
  });
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
      const nb = e.target.closest('[data-news]');
      if (nb) { drawerOpen({ kind: 'news', idx: +nb.dataset.news }); return; }
      const xo = e.target.closest('[data-ex-open]');
      if (xo) { drawerOpen({ kind: 'example', idx: +xo.dataset.exOpen }); return; }
      const eo = e.target.closest('[data-ev-open]');
      if (eo) { const [kind, k] = eo.dataset.evOpen.split(':'); drawerOpen({ kind: 'event', when: kind, idx: +k }); return; }
      const sc = e.target.closest('.pc-show-card');
      if (sc && !e.target.closest('.psc-links a')) { drawerOpen({ kind: 'card', key: sc.closest('.pc-show').dataset.showKey, idx: +sc.dataset.show }); return; }
      const pk = e.target.closest('.sy-pill');
      if (pk) { symbolFocus(+pk.dataset.k); return; }
      if (e.target.closest('.sy-replay')) { symbolReplay(); return; }
      const cv = e.target.closest('.sy-canvas');
      if (cv && SY.art) { const r = cv.getBoundingClientRect(), k = SY.art.peakAt(e.clientX - r.left, e.clientY - r.top); if (k >= 0) symbolFocus(k); return; }
      if (e.target.closest('.pr-watch')) return;   /* the presentation opens through [data-deck] */
      const row = e.target.closest('[data-open-path]');
      if (row) { drawerOpen({ kind: 'path', path: row.dataset.openPath.split('/') }); return; }
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
  R.leave = function () { drawerClose(true); on = false; cancelAnimationFrame(raf); raf = 0; };
  R.currentPath = function () {
    if (openPath && drawer.el && drawer.el.classList.contains('is-open')) return [...openPath];
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
