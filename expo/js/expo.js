/* Expo player: auto-plays the scenes like a video; Space/click pauses, arrows/scroll/swipe navigate. */
(function () {
  const cfg = Object.assign({ defaultLang: 'en', loop: true, resumeAfterMs: 60000, hudHideMs: 2600 }, window.EXPO_CONFIG || {});
  const params = new URLSearchParams(location.search);
  const stage = document.getElementById('stage');

  /* chapter (demo) mode for the website: ?chapter=labs|library|projects plays only those scenes;
     ?embed=1 starts paused behind a play button and lets the page around it scroll normally */
  const chapter = params.get('chapter');
  const embed = params.get('embed') === '1';
  if (chapter) {
    const keep = Array.from(document.querySelectorAll('.scene')).filter(sc => (sc.dataset.chapter || '').split(' ').includes(chapter));
    if (keep.length) document.querySelectorAll('.scene').forEach(sc => { if (!keep.includes(sc)) sc.remove(); });
  }
  if (embed) document.body.classList.add('embed');

  /* lab gallery: built from GALLERY in content.js, skipped when it is empty */
  const gal = document.querySelector('.s-gallery');
  const photos = window.GALLERY || (typeof GALLERY !== 'undefined' ? GALLERY : []);
  if (gal) {
    if (!photos.length) gal.remove();
    else {
      const holder = gal.querySelector('.gal-stage');
      const step = 4.5;
      photos.forEach((ph, i) => {
        const fig = document.createElement('figure');
        fig.className = 'gal-fig a';
        fig.style.cssText = `--anim:kb;--d:${(i * step).toFixed(1)}s;--dur:${step + 1.5}s;z-index:${i}`;
        const img = document.createElement('img');
        img.src = ph.src; img.alt = '';
        fig.appendChild(img);
        if (ph.caption) {
          STRINGS['gal.' + i] = ph.caption;
          const cap = document.createElement('figcaption');
          cap.dataset.i18n = 'gal.' + i;
          fig.appendChild(cap);
        }
        holder.appendChild(fig);
      });
      gal.dataset.duration = String(Math.round(photos.length * step * 1000 + 2500));
    }
  }

  /* notebook plot: a noisy sensor signal */
  document.querySelectorAll('path.plot').forEach(p => {
    let d = '';
    for (let i = 0; i <= 200; i++) {
      const x = 40 + i * 2.75;
      const noise = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 7;
      const y = 85 - 52 * Math.sin(i / 10) * (0.75 + 0.25 * Math.sin(i / 41)) + noise;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    p.setAttribute('d', d);
  });

  const scenes = Array.from(document.querySelectorAll('.scene'));
  const segWrap = document.getElementById('segments');
  const body = document.body;

  let index = 0, elapsed = 0, playing = params.get('paused') !== '1' && !(params.get('embed') === '1' && params.get('autoplay') !== '1');
  let lang = params.get('lang') || cfg.defaultLang;
  let lastTick = performance.now(), lastInput = performance.now(), idleTimer = 0;

  /* ---------- fit 1920×1080 stage to the window ---------- */
  function fit() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.setProperty('--s', s);
  }

  /* ---------- language ---------- */
  function buildWords(el, text) {
    const base = parseFloat(el.style.getPropertyValue('--d')) || 0;
    el.textContent = '';
    let n = 0;
    text.split('\n').forEach(line => {
      const ln = document.createElement('span');
      ln.className = 'ln';
      line.split(' ').filter(Boolean).forEach((word, i, arr) => {
        const w = document.createElement('span');
        w.className = 'w';
        w.style.setProperty('--d', (base + n * 0.07).toFixed(2) + 's');
        w.textContent = word;
        ln.appendChild(w);
        if (i < arr.length - 1) ln.appendChild(document.createTextNode(' '));
        n++;
      });
      el.appendChild(ln);
    });
  }

  function applyLang() {
    const li = lang === 'hy' ? 1 : 0;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const entry = STRINGS[el.dataset.i18n];
      const text = entry ? (entry[li] || entry[0]) : el.dataset.i18n;
      if (el.classList.contains('words')) buildWords(el, text);
      else el.textContent = text;
    });
    document.getElementById('btn-lang').textContent = lang === 'hy' ? 'EN' : 'ՀԱՅ';
  }

  /* ---------- per-frame scene effects (counters, typing) ---------- */
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const KW = /\b(module|endmodule|input|output|logic|always_ff|posedge|negedge|or|if|else|assign)\b/g;
  const NUM = /(\d+'b\d+|'0|\[\d+(?::\d+)?\])/g;
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function highlight(src, lang) {
    if (lang === 'py') {
      return src.split('\n').map(line => {
        const h = line.indexOf('#');
        const code = h < 0 ? line : line.slice(0, h), com = h < 0 ? '' : line.slice(h);
        const c = esc(code)
          .replace(/("[^"]*"?)/g, '<span style="color:#ba2121">$1</span>')
          .replace(/\b(from|import|as)\b/g, '<span style="color:#008000;font-weight:700">$1</span>');
        return c + (com ? '<span style="color:#3d7a7a;font-style:italic">' + esc(com) + '</span>' : '');
      }).join('\n');
    }
    return esc(src).replace(KW, '<span style="color:#eac883">$1</span>').replace(NUM, '<span style="color:#6fd3cc">$1</span>');
  }
  document.querySelectorAll('pre.type').forEach(pre => { pre.dataset.full = pre.textContent; pre.dataset.n = '-1'; });

  function effects(scene, ms) {
    const sec = scene.classList.contains('settled') ? Infinity : ms / 1000;
    if (window.SceneFX) SceneFX.update(scene, sec);
    scene.querySelectorAll('.count').forEach(el => {
      const to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec || '0', 10);
      const t = Math.max(0, Math.min(1, (sec - parseFloat(el.dataset.delay || '0')) / 1.6));
      const txt = (to * easeOut(t)).toFixed(dec) + (el.dataset.suffix || '');
      if (el.textContent !== txt) el.textContent = txt;
    });
    scene.querySelectorAll('pre.type').forEach(pre => {
      const full = pre.dataset.full;
      const n = Math.max(0, Math.min(full.length, Math.floor((sec - parseFloat(pre.dataset.delay || '0')) * parseFloat(pre.dataset.cps || '30'))));
      if (String(n) !== pre.dataset.n) {
        pre.dataset.n = String(n);
        pre.innerHTML = highlight(full.slice(0, n), pre.dataset.lang) + '<span class="caret"></span>';
      }
    });
  }

  /* ---------- progress ---------- */
  const segFills = scenes.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Scene ' + (i + 1));
    const f = document.createElement('i');
    b.appendChild(f);
    b.addEventListener('click', e => { e.stopPropagation(); input(); go(i); });
    segWrap.appendChild(b);
    return f;
  });
  function duration(i) { return parseInt(scenes[i].dataset.duration || '10000', 10); }
  function paintProgress() {
    segFills.forEach((f, i) => {
      const p = i < index ? 1 : i > index ? 0 : Math.min(1, elapsed / duration(i));
      f.style.width = (p * 100).toFixed(2) + '%';
    });
  }

  /* ---------- navigation ---------- */
  function go(n) {
    if (!cfg.loop && (n < 0 || n >= scenes.length)) return;
    n = (n + scenes.length) % scenes.length;
    scenes[index].classList.remove('active', 'settled');
    const next = scenes[n];
    next.classList.remove('active', 'settled');
    void next.offsetWidth;                                  // restart CSS animations
    if (!playing) next.classList.add('settled');            // paused: show the finished scene
    next.classList.add('active');
    next.querySelectorAll('pre.type').forEach(pre => { pre.dataset.n = '-1'; });
    index = n; elapsed = 0;
    if (window.SceneFX) SceneFX.reset(next);
    effects(next, 0);
    paintProgress();
  }
  const nextScene = () => go(index + 1);
  const prevScene = () => go(index - 1);

  function setPlaying(v) {
    playing = v;
    body.classList.toggle('paused', !playing);
    if (window.Backdrop) Backdrop.setPaused(!playing);
  }
  const toggle = () => setPlaying(!playing);

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  }
  function toggleLang() { lang = lang === 'hy' ? 'en' : 'hy'; applyLang(); }

  /* ---------- clock ---------- */
  function tick(now) {
    const dt = Math.min(1000, now - lastTick);
    lastTick = now;
    if (playing) {
      elapsed += dt;
      if (elapsed >= duration(index)) {
        if (!cfg.loop && index === scenes.length - 1) setPlaying(false);
        else nextScene();
      }
    } else if (!embed && cfg.resumeAfterMs > 0 && now - lastInput > cfg.resumeAfterMs) {
      setPlaying(true);
    }
    effects(scenes[index], elapsed);
    paintProgress();
    requestAnimationFrame(tick);
  }

  /* ---------- input ---------- */
  function input() {
    lastInput = performance.now();
    body.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => body.classList.add('idle'), cfg.hudHideMs);
  }

  window.addEventListener('keydown', e => {
    input();
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case 'Enter': e.preventDefault(); nextScene(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': e.preventDefault(); prevScene(); break;
      case ' ': case 'k': case 'K': case 'MediaPlayPause': e.preventDefault(); toggle(); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End': e.preventDefault(); go(scenes.length - 1); break;
      case 'l': case 'L': toggleLang(); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'Escape': if (embed && window.parent !== window) window.parent.postMessage({ expo: 'close' }, '*'); break;
    }
  });

  let wheelAcc = 0, wheelLock = 0, wheelReset = 0;
  window.addEventListener('wheel', e => {
    if (embed) return;
    e.preventDefault();
    input();
    const now = performance.now();
    wheelAcc += Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    clearTimeout(wheelReset);
    wheelReset = setTimeout(() => { wheelAcc = 0; }, 220);
    if (now < wheelLock || Math.abs(wheelAcc) < 50) return;
    wheelAcc > 0 ? nextScene() : prevScene();
    wheelAcc = 0; wheelLock = now + 850;
  }, { passive: false });

  let touch = null;
  window.addEventListener('touchstart', e => { input(); const t = e.touches[0]; touch = { x: t.clientX, y: t.clientY }; }, { passive: true });
  window.addEventListener('touchend', e => {
    if (!touch || e.target.closest('#hud')) { touch = null; return; }
    const t = e.changedTouches[0], dx = t.clientX - touch.x, dy = t.clientY - touch.y;
    touch = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) { toggle(); e.preventDefault(); return; }
    if (Math.abs(dx) > Math.abs(dy)) (dx < 0 ? nextScene : prevScene)();
    else (dy < 0 ? nextScene : prevScene)();
  });

  document.addEventListener('click', e => {
    if (e.target.closest('#hud')) return;
    input(); toggle();
  });
  document.addEventListener('mousemove', input);

  document.getElementById('btn-play').addEventListener('click', e => { e.stopPropagation(); input(); toggle(); });
  document.getElementById('btn-lang').addEventListener('click', e => { e.stopPropagation(); input(); toggleLang(); });
  document.getElementById('btn-fs').addEventListener('click', e => { e.stopPropagation(); input(); toggleFullscreen(); });

  /* ---------- start ---------- */
  window.addEventListener('resize', fit);
  fit();
  if (window.SceneFX) SceneFX.init();
  applyLang();
  setPlaying(playing);
  const start = Math.max(1, Math.min(scenes.length, parseInt(params.get('scene') || '1', 10))) - 1;
  index = start;
  go(start);
  input();
  requestAnimationFrame(tick);

  /* the website around an embedded deck can pause it, play it or switch its language */
  window.addEventListener('message', e => {
    const m = e.data || {};
    if (m.expo === 'pause') setPlaying(false);
    else if (m.expo === 'play') setPlaying(true);
    else if (m.expo === 'lang' && (m.value === 'en' || m.value === 'hy') && m.value !== lang) { lang = m.value; applyLang(); }
  });
  const bigPlay = document.getElementById('big-play');
  if (bigPlay) bigPlay.addEventListener('click', e => { e.stopPropagation(); input(); setPlaying(true); });

  /* small API for testing / kiosk scripts */
  window.Expo = { go: n => go(n), play: () => setPlaying(true), pause: () => setPlaying(false), get index() { return index; } };
})();
