/* ==========================================================================
   Core — what both views share.
   • one content tree (content.js → SITE_CONTENT)
   • one header, one bottom section bar, one language, one "where am I" (path)
   • the mode switch and the transition between the two views
   Each view registers itself in ST.modes['2d'] / ST.modes['3d'] with:
     init()             once, at load
     enter(path, from)  show this view at `path` (synchronous; runs inside the view transition)
     leave()            stop work, hide
     beforeLeave(to)    optional Promise: an exit animation before the switch (dive / rise)
     afterEnter(from)   optional: the arrival animation after the switch
     currentPath()      e.g. ['events'] or ['events','upcoming']
     go(path)           navigate inside this view
     onLanguage(lang)   re-render text
     openMap()          header "Explore sections" button
   ========================================================================== */
(function () {
  const ST = window.ST = window.ST || {};
  const root = document.documentElement;
  const sections = SITE_CONTENT.sections;
  const LAST = sections.length - 1;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  history.scrollRestoration = 'manual';

  const state = ST.state = {
    lang: 'en',
    mode: root.dataset.mode === '3d' ? '3d' : '2d',
    index: 0,
    path: ['overview'],
    reduced: reduced.matches,
    switching: false
  };
  ST.modes = ST.modes || {};

  /* ---------- small helpers shared by every file ---------- */
  ST.pick = v => Array.isArray(v) ? v[state.lang === 'hy' ? 1 : 0] : (v ?? '');
  ST.text = key => ST.pick(SITE_CONTENT.ui[key]);
  ST.pad = n => String(n).padStart(2, '0');
  ST.clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  ST.lerp = (a, b, t) => a + (b - a) * t;
  ST.smoothstep = t => t * t * (3 - 2 * t);
  ST.easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  ST.easeOut = t => 1 - Math.pow(1 - t, 3);
  /* hold near each stop, travel between them */
  ST.dwell = (t, hold = .18) => ST.smoothstep(ST.clamp((t - hold) / (1 - 2 * hold)));
  ST.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  ST.resolve = path => {
    const index = sections.findIndex(s => s.id === path[0]);
    if (index < 0) return null;
    let node = sections[index];
    for (const id of path.slice(1)) { node = (node.children || []).find(c => c.id === id); if (!node) return null; }
    return { index, node, path: [...path] };
  };
  /* section/card: a card on a section's main road (About) */
  ST.isShowcase = p => p.length === 2 && !!(sections.find(s => s.id === p[0])?.showcase || []).find(c => c.id === p[1]);
  ST.readHash = () => {
    try { const p = decodeURIComponent(location.hash.slice(1)).split('/').filter(Boolean); return ST.resolve(p) || ST.isShowcase(p) ? p : ['overview']; }
    catch (e) { return ['overview']; }
  };
  /* a tiny tween helper: ST.tween(ms, t => …) → Promise */
  ST.tween = (ms, step, ease = ST.easeInOut) => new Promise(resolve => {
    if (state.reduced || ms <= 0) { step(1); resolve(); return; }
    const start = performance.now();
    const f = now => { const t = ST.clamp((now - start) / ms); step(ease(t)); if (t < 1) requestAnimationFrame(f); else resolve(); };
    requestAnimationFrame(f);
  });

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  /* ---------- where we are (views call this) ---------- */
  ST.report = function (index, path) {
    const changed = index !== state.index;
    if (changed && state.ready && ST.sound) ST.sound.tick();
    state.index = index; if (path) state.path = [...path];
    $$('.chapter-nav #chapter-links a').forEach(a => { if (+a.dataset.index === index) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    const start = $('.start-link'); if (index === 0) start.setAttribute('aria-current', 'location'); else start.removeAttribute('aria-current');
    $('#nav-count').textContent = `${ST.pad(index)} / ${ST.pad(LAST)}`;
    const cur = $('#chapter-links [aria-current]'), links = $('#chapter-links');
    if (changed && cur && links.scrollWidth > links.clientWidth) links.scrollTo({ left: cur.offsetLeft - links.offsetLeft - 18, behavior: state.reduced ? 'instant' : 'smooth' });
  };
  ST.progress = f => { $('#progress-bar').style.transform = `scaleX(${ST.clamp(f)})`; };
  ST.go = path => { const m = ST.modes[state.mode]; if (m && m.go) m.go(path); };
  /* the image dialog is shared by both views */
  ST.openMedia = (id, title) => {
    const data = SITE_CONTENT.media[id]; if (!data) return;
    const img = $('#media-large'); img.src = data.src; img.alt = ST.pick(data.alt);
    $('#media-title').textContent = title || ST.pick(data.title);
    $('#media-caption').textContent = ST.pick(data.caption);
    $('#media-dialog').showModal();
  };

  /* ---------- events and memory (shared by both views) ----------
     Upcoming = date today or later. Past events are "written" into memory, oldest first,
     each cell addressed by year.month. ?today=YYYY-MM-DD in the URL previews another day. */
  ST.today = (() => {
    const q = new URLSearchParams(location.search).get('today');
    const d = q ? new Date(q + 'T00:00:00') : new Date(); if (isNaN(d)) return new Date();
    d.setHours(0, 0, 0, 0); return d;
  })();
  ST.events = () => {
    const all = (SITE_CONTENT.events || []).map(e => ({ ...e, when: new Date(e.date + 'T12:00:00') }))
      .filter(e => !isNaN(e.when)).sort((a, b) => a.when - b.when);
    return { upcoming: all.filter(e => e.when >= ST.today), past: all.filter(e => e.when < ST.today) };
  };
  ST.fmtDate = d => new Intl.DateTimeFormat(state.lang === 'hy' ? 'hy-AM' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  ST.address = d => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  /* Memory banks: gallery (past events), projects, reports … one per section (SITE_CONTENT.memoryBanks).
     An item is "written" once its date has passed; cells are addressed year.month, oldest first. */
  ST.banks = () => SITE_CONTENT.memoryBanks || [];
  ST.bank = id => ST.banks().find(b => b.id === id) || ST.banks()[0];
  ST.bankFor = sectionId => ST.banks().find(b => b.section === sectionId);
  ST.memoryItems = bankId => {
    const bank = ST.bank(bankId); if (!bank) return [];
    if (bank.source === 'events') return ST.events().past.map(e => ({ ...e, summary: e.recap }));
    return (SITE_CONTENT.memory || []).filter(m => m.bank === bank.id)
      .map(m => ({ ...m, when: new Date(m.date + 'T12:00:00') }))
      .filter(m => !isNaN(m.when) && m.when < ST.today).sort((x, y) => x.when - y.when);
  };
  ST.memoryGridHTML = (bankId = 'gallery') => {
    const bank = ST.bank(bankId), items = ST.memoryItems(bank.id), size = Math.max(16, Math.ceil((items.length + 1) / 4) * 4);
    let html = '';
    for (let k = 0; k < size; k++) {
      const e = items[k];
      html += e
        ? `<button type="button" class="mem-cell is-on" data-mem="${bank.id}:${e.id}"><span class="mem-addr">${ST.address(e.when)}</span><span class="mem-title">${ST.esc(ST.pick(e.title))}</span></button>`
        : `<span class="mem-cell" title="${ST.esc(ST.text('memoryEmpty'))}"><span class="mem-addr">${k === items.length ? '▸' : '—'}</span></span>`;
    }
    const none = items.length ? '' : `<p class="mem-none">${ST.esc(ST.text('noProjects'))}</p>`;
    return `${none}<div class="mem-grid" data-bank-color="${bank.color || 'gold'}">${html}</div>`;
  };
  /* the memory view: one bank at a time, with a switch between banks */
  /* A product card opened large (both views): pick any slide (details, then each picture); links always shown */
  ST.openShowcase = (item, k = 0, n = 1) => {
    let dlg = document.querySelector('#show-dialog');
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.id = 'show-dialog'; dlg.className = 'show-dialog';
      document.body.append(dlg);
      dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('.sd-close,[data-inner]')) dlg.close(); });
      /* swipe left / right between slides on touch screens */
      let sx = null, sy = 0;
      dlg.addEventListener('touchstart', e => { if (!e.target.closest('.sd-view')) return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
      dlg.addEventListener('touchend', e => {
        if (sx == null) return; const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) dlg._go(dlg._cur + (dx < 0 ? 1 : -1));
      }, { passive: true });
      dlg.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); dlg._go(dlg._cur + (e.key === 'ArrowRight' ? 1 : -1)); } });
    }
    const esc = ST.esc, P = ST.pick;
    const pics = (item.gallery || (item.media ? [item.media] : [])).map(id => [id, SITE_CONTENT.media[id]]).filter(x => x[1]);
    const slides = [`<div class="sd-slide sd-text"><p class="sd-lead">${esc(P(item.intro))}</p>${(item.details || []).map(t => `<p>${esc(P(t))}</p>`).join('')}${(item.items || []).length ? `<ul>${item.items.map(t => `<li>${esc(P(t))}</li>`).join('')}</ul>` : ''}</div>`,
      ...pics.map(([, m]) => `<figure class="sd-slide sd-pic"><img src="${esc(m.src)}" alt="${esc(P(m.alt))}"><figcaption><strong>${esc(P(m.title))}</strong>${m.caption ? ` · ${esc(P(m.caption))}` : ''}</figcaption></figure>`)];
    const tabs = [ST.text('showDetails'), ...pics.map(([, m]) => P(m.title))];
    dlg.innerHTML = `<div class="sd-box"><header class="sd-head"><span class="sd-kicker">${String(k + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}</span><h2>${esc(P(item.title))}</h2><button type="button" class="sd-close" aria-label="${esc(ST.text('close'))}">×</button></header>
      <nav class="sd-tabs" role="tablist">${tabs.map((t, i) => `<button type="button" role="tab" data-i="${i}">${esc(t)}</button>`).join('')}</nav>
      <div class="sd-view"><div class="sd-track">${slides.join('')}</div>
      <button type="button" class="sd-arrow sd-prev" aria-label="←">‹</button><button type="button" class="sd-arrow sd-next" aria-label="→">›</button></div>
      <p class="sd-links">${(item.links || []).map(l => l.href[0] === '#' ? `<a href="${esc(l.href)}" data-inner>${esc(P(l.label))} →</a>` : `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(P(l.label))} ↗</a>`).join('')}</p></div>`;
    const track = dlg.querySelector('.sd-track'), tabEls = [...dlg.querySelectorAll('.sd-tabs button')];
    dlg._go = i => { dlg._cur = (i + slides.length) % slides.length; track.style.transform = `translateX(${-dlg._cur * 100}%)`; tabEls.forEach((t, j) => { t.classList.toggle('on', j === dlg._cur); t.setAttribute('aria-selected', String(j === dlg._cur)); }); };
    tabEls.forEach(t => t.addEventListener('click', () => dlg._go(+t.dataset.i)));
    dlg.querySelector('.sd-prev').addEventListener('click', () => dlg._go(dlg._cur - 1));
    dlg.querySelector('.sd-next').addEventListener('click', () => dlg._go(dlg._cur + 1));
    dlg._go(0); if (!dlg.open) dlg.showModal();
  };
  /* a small reading window (phones, 3D): the page behind it does not scroll while it is open */
  ST.openTextSheet = (title, paragraphs) => {
    let dlg = document.querySelector('#text-sheet');
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.id = 'text-sheet'; dlg.className = 'text-sheet'; document.body.append(dlg);
      dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('.ts-close')) dlg.close(); });
    }
    dlg.innerHTML = `<div class="ts-box"><header><h2>${ST.esc(title)}</h2><button type="button" class="ts-close" aria-label="${ST.esc(ST.text('close'))}">×</button></header>
      <div class="ts-body">${(paragraphs || []).map(t => `<p>${ST.esc(ST.pick(t))}</p>`).join('')}</div></div>`;
    dlg.showModal(); dlg.querySelector('.ts-body').scrollTop = 0;
  };
  /* while any window is open, swiping outside its scrolling area does nothing (no journey behind it) */
  document.addEventListener('touchmove', e => {
    const open = document.querySelector('dialog[open]'); if (!open) return;
    if (!e.target.closest('.ts-body,.sd-slide,.sd-tabs,.route-map,#map-tree,.memory-grid,#memory-grid')) e.preventDefault();
  }, { passive: false });
  ST.openMemory = (bankId = 'gallery') => {
    const bank = ST.bank(bankId), d = $('#memory-dialog');
    $('#memory-title').textContent = `${ST.text('memoryView')} · ${ST.pick(bank.title)}`;
    d.querySelector('.map-intro').textContent = ST.pick(bank.intro);
    $('#memory-banks').innerHTML = ST.banks().map(b => `<button type="button" data-bank="${b.id}" data-bank-color="${b.color || 'gold'}" aria-pressed="${b.id === bank.id}">${ST.esc(ST.pick(b.title))} <span>${ST.memoryItems(b.id).length}</span></button>`).join('');
    $('#memory-grid').innerHTML = ST.memoryGridHTML(bank.id);
    if (!d.open) d.showModal();
    ST.sound && ST.sound.blip('open');
  };
  ST.openMemoryItem = ref => {
    const [bankId, id] = ref.split(':'), e = ST.memoryItems(bankId).find(x => x.id === id); if (!e) return;
    const data = SITE_CONTENT.media[e.media] || {};
    const img = $('#media-large'); img.src = data.src || ''; img.alt = ST.pick(data.alt || '');
    $('#media-title').textContent = ST.pick(e.title);
    $('#media-caption').textContent = `${ST.fmtDate(e.when)}${e.place ? ' · ' + ST.pick(e.place) : ''} — ${ST.pick(e.summary)}`;
    $('#media-dialog').showModal();
    ST.sound && ST.sound.blip('read');
  };

  /* ---------- bottom section bar (one for both views) ---------- */
  function renderNav() {
    $('#chapter-links').innerHTML = sections.slice(1).map((s, k) =>
      `<a href="#${s.id}" data-index="${k + 1}" data-section="${s.id}"><span>${ST.pad(k + 1)}</span><span>${ST.esc(ST.pick(s.label))}</span></a>`).join('');
    const cur = $(`#chapter-links a[data-index="${state.index}"]`); if (cur) cur.setAttribute('aria-current', 'location');
  }

  /* ---------- language ---------- */
  function setLanguage(lang) {
    state.lang = lang; root.lang = lang;
    $$('[data-ui]').forEach(e => e.textContent = ST.text(e.dataset.ui));
    $$('[data-ui-label]').forEach(e => e.setAttribute('aria-label', ST.text(e.dataset.uiLabel)));
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    $('#brand-name').replaceChildren(document.createTextNode(SITE_CONTENT.brand.name), Object.assign(document.createElement('small'), { textContent: ST.pick(SITE_CONTENT.brand.subtitle) }));
    $('#brand-tagline').textContent = ST.pick(SITE_CONTENT.brand.tagline);
    $('.languages').setAttribute('aria-label', ST.text('language'));
    $('.chapter-nav').setAttribute('aria-label', ST.text('mainNav'));
    $('.start-link').setAttribute('aria-label', ST.text('home'));
    renderNav();
    Object.values(ST.modes).forEach(m => m.onLanguage && m.onLanguage(lang));
    ST.soundPaint && ST.soundPaint();
  }
  ST.setLanguage = setLanguage;

  /* ---------- switching views ---------- */
  function paintSwitch() {
    $$('.mode-switch [data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));
  }
  ST.setMode = async function (m, opts = {}) {
    if (state.switching || m === state.mode || !ST.modes[m]) return;
    const from = ST.modes[state.mode], to = ST.modes[m], fromName = state.mode;
    const path = opts.path || (from.currentPath ? from.currentPath() : state.path);
    /* the ending after Connect (0 = not in it, 1 topology, 2 package, 3 ecosystem) is kept across the switch */
    const end = opts.path ? 0 : (from.currentEnd ? from.currentEnd() : 0);
    state.switching = true; root.classList.add('is-switching');
    /* inside the ending (topology / package / ecosystem) both views show the same picture: switch with a plain fade, no zoom */
    root.classList.toggle('switch-plain', end > 0 || !!(from.isPlain && from.isPlain() && !opts.path));
    ST.sound && ST.sound.sweep();
    try {
      if (!state.reduced && from.beforeLeave) await from.beforeLeave(m, path);
      const swap = () => {
        from.leave && from.leave();
        root.dataset.mode = state.mode = m;
        try { localStorage.setItem('st-mode', m); } catch (e) {}
        const url = new URL(location); url.searchParams.set('mode', m); url.hash = path.join('/'); history.replaceState(null, '', url);
        paintSwitch();
        to.enter(path, fromName, end);
      };
      if (document.startViewTransition && !state.reduced) {
        const vt = document.startViewTransition(swap);
        vt.ready.catch(() => {});
        await vt.updateCallbackDone;
        to.afterEnter && to.afterEnter(fromName, end);
        await vt.finished.catch(() => {});
      } else {
        root.classList.add('veil');
        await new Promise(r => setTimeout(r, state.reduced ? 0 : 260));
        swap();
        requestAnimationFrame(() => root.classList.remove('veil'));
        to.afterEnter && to.afterEnter(fromName, end);
      }
    } finally {
      state.switching = false; root.classList.remove('is-switching', 'switch-plain');
    }
  };

  /* ---------- start ---------- */
  function init() {
    Object.values(ST.modes).forEach(m => m.init && m.init());
    setLanguage(state.lang);
    paintSwitch();
    const path = ST.readHash();
    state.path = path; state.index = Math.max(0, ST.resolve(path).index);
    ST.modes[state.mode].enter(path, null);
    ST.modes[state.mode].afterEnter && ST.modes[state.mode].afterEnter(null);
    ST.report(state.index, path); renderNav();

    document.addEventListener('click', e => {
      const mb = e.target.closest('.mode-switch [data-mode]'); if (mb) { ST.setMode(mb.dataset.mode); return; }
      const lb = e.target.closest('[data-lang]'); if (lb) { setLanguage(lb.dataset.lang); return; }
      const nav = e.target.closest('#chapter-links a'); if (nav) { e.preventDefault(); ST.go([nav.dataset.section]); return; }
      if (e.target.closest('.start-link, .brand')) { e.preventDefault(); ST.go(['overview']); return; }
      if (e.target.closest('#map-toggle')) { const m = ST.modes[state.mode]; m.openMap && m.openMap(); return; }
      const mem = e.target.closest('[data-mem]'); if (mem) { e.preventDefault(); ST.openMemoryItem(mem.dataset.mem); return; }
      const om = e.target.closest('[data-open-memory]'); if (om) { e.preventDefault(); ST.openMemory(om.dataset.openMemory || 'gallery'); return; }
      const bk = e.target.closest('#memory-banks [data-bank]'); if (bk) { ST.openMemory(bk.dataset.bank); return; }
      if (e.target.closest('#memory-close')) { $('#memory-dialog').close(); return; }
      const tr = e.target.closest('[data-travel]'); if (tr) { e.preventDefault(); ST.setMode('3d', { path: tr.dataset.travel.split('/') }); }
    });
    addEventListener('keydown', e => {
      if (e.target.closest('input,textarea,select,[contenteditable],dialog') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'm' || e.key === 'M') ST.setMode(state.mode === '3d' ? '2d' : '3d');
      if (e.key === ']') ST.go([sections[Math.min(LAST, state.index + 1)].id]);
      if (e.key === '[') ST.go([sections[Math.max(0, state.index - 1)].id]);
    });
    reduced.addEventListener('change', () => { state.reduced = reduced.matches; });
    root.classList.add('is-ready'); state.ready = true;
  }
  /* Deferred scripts run before DOMContentLoaded, so every view is registered by then. */
  if (document.readyState === 'complete') init(); else document.addEventListener('DOMContentLoaded', init);
})();
