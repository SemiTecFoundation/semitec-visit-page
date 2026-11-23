/* ==========================================================================
   How a chip is made — the rendered film (Blender / Cycles), step by step.
   Every step of the film is a short move (the camera goes to the next station, the text changes) and then
   the work (the process runs while its text is on the screen); the film rests on the last frame of a step.
   The film is a video (assets/film/film.mp4, and film-rev.mp4 played backwards): in the top half the picture
   (premultiplied: black where there is nothing), in the bottom half 1 − its transparency (white where there is
   nothing). Two canvases lay them over the page: the bottom half multiplies the page (it darkens only where the
   film will be), the top half is added on top (mix-blend-mode plus-lighter) — the film without a background,
   on the paper of the 2D page or the dark board of the 3D view, and it also works from a file (no pixels are read).
   assets/film/film-meta.js → window.FILM_META = { fps, frames, rests, texts, width, height, gap, die }
     rests[s]: the frame where step s rests (s = 0 the mountains … the closed package), texts[s]: the frame
     where its text comes in, die: where the finished die is in the last frame (0…1), for the chip map.
   Story positions P (js/story.js): step s rests at P = s; after the last rest the package opens (the last frame,
   P = end()), then the page alone (the chip map comes in, tilts, the two ways appear) until last() — a timed tail.
   ST.film.attach(holder) → { set(P, side, align), playTo(P), hurry(), busy(), P() }
   ========================================================================== */
(function () {
  const ST = window.ST;
  const BASE = 'assets/film/', TAIL = 1.4, OPEN = 1.6;
  const META = window.FILM_META || null;
  /* step s rests at P = s; after the last rest the package opens (OPEN) and the film ends at FILM_END; then the page
     alone (the chip map, the two ways) until LAST */
  const NR = META ? META.rests.length : 13, FILM_END = NR - 1 + OPEN, LAST = FILM_END + TAIL;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  /* story position ↔ film time (seconds) */
  let KNOTS = null;
  function knots() {
    if (KNOTS || !META) return KNOTS;
    const D = (META.frames - 1) / META.fps;
    KNOTS = META.rests.map((f, s) => [s, f / META.fps]);
    KNOTS.push([FILM_END, D], [LAST, D + 1.7]);
    return KNOTS;
  }
  function timeOf(P) {
    const K = knots(); if (!K) return 0;
    if (P <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) if (P <= K[i][0]) { const a = K[i - 1], b = K[i]; return a[1] + (b[1] - a[1]) * (P - a[0]) / (b[0] - a[0]); }
    return K[K.length - 1][1];
  }
  function pOf(t) {
    const K = knots(); if (!K) return 0;
    if (t <= K[0][1]) return K[0][0];
    for (let i = 1; i < K.length; i++) if (t <= K[i][1]) { const a = K[i - 1], b = K[i]; return a[0] + (b[0] - a[0]) * (t - a[1]) / (b[1] - a[1]); }
    return K[K.length - 1][0];
  }
  /* where step s's text comes in (story P); before the film is known: a third into the step */
  function textP(s) { return META && META.texts[s] != null ? pOf(META.texts[s] / META.fps) : s - .7; }

  function attach(holder) {
    const mkc = cls => { const c = document.createElement('canvas'); c.className = 'film-canvas ' + cls; holder.append(c); return c; };
    const cvM = mkc('film-m'), cvC = mkc('film-c'), cM = cvM.getContext('2d'), cC = cvC.getContext('2d');
    const G = !!META;
    const st = { side: 0, sideNow: 0, align: null, raf: 0, has: false };
    /* the two videos, kept (tiny) in the page: some browsers stop decoding a video that is not on screen */
    const mk = (src, preload = 'auto') => {
      const v = document.createElement('video');
      v.muted = true; v.defaultMuted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
      v.preload = preload; v.src = BASE + src;
      v.className = 'film-video'; holder.append(v);
      /* a server that cannot send parts of a file makes the video unseekable: then load it whole (a blob seeks) */
      v.addEventListener('loadedmetadata', () => {
        const ok = v.seekable && v.seekable.length && v.seekable.end(0) > v.duration - .5;
        if (!ok && !v._blob && window.fetch && location.protocol !== 'file:') { v._blob = 1; fetch(v.src).then(r => r.blob()).then(b => { v.src = URL.createObjectURL(b); }).catch(() => {}); }
      }, { once: true });
      return v;
    };
    const fwd = G ? mk(META.video || 'film.mp4') : null, rev = G ? mk(META.reverse || 'film-rev.mp4', 'metadata') : null;
    /* the backwards copy loads after the forward one (until then, going back seeks the forward one) */
    if (fwd && rev) { let go = () => { if (go) { go = null; rev.preload = 'auto'; try { rev.load(); } catch (e) {} } }; fwd.addEventListener('canplaythrough', go, { once: true }); setTimeout(() => go && go(), 6000); }
    const D = META ? (META.frames - 1) / META.fps : 0, F = META ? 1 / META.fps : 1 / 24;
    /* the clock: t (seconds of the film, then the timed tail); playing towards T */
    const pl = { t: 0, T: 0, dir: 0, rate: 1, last: 0, src: null, want: null, stillOK: false };
    /* stills of the rests, shown until the video can play */
    const stills = META ? META.rests.map(() => null) : [];
    if (META && META.stills) META.rests.forEach((f, s) => { const im = new Image(); im.onload = () => { stills[s] = im; if (!st.has) draw(true); }; im.src = BASE + META.stills.replace('{s}', s); });

    const ready = v => v && v.readyState >= 2;
    const frameT = (t, v) => { const f = Math.round(clamp(t, 0, D) * META.fps); return ((v === rev ? META.frames - 1 - f : f) + .5) * F; };
    function park(t) {
      /* at rest: both videos wait on this frame, so a step can start at once in either direction */
      for (const v of [fwd, rev]) if (v) { try { v.pause(); const want = frameT(t, v); if (Math.abs(v.currentTime - want) > F * .4) v.currentTime = want; } catch (e) {} }
      pl.src = fwd;
    }
    let pic = null;   // what is shown: a video waiting on or playing its frame, or a still
    const snap = document.createElement('canvas'), sc2 = snap.getContext('2d');   // the frame, copied once, for both layers
    function upload(src) { pic = src; st.has = true; return true; }
    const stillFor = t => { let best = null, bd = 1e9; META.rests.forEach((f, s) => { const d = Math.abs(f / META.fps - t); if (stills[s] && d < bd) { bd = d; best = stills[s]; } }); return bd < .05 ? best : null; };
    function place(W, H) {
      /* where the film goes: as large as the free space allows, moved away from the text;
         at the end, scaled and moved so the die covers `align` (the chip map's die) exactly */
      const fw = META.width, fh = META.height, phone = W < 900;
      /* on a phone the film keeps the band under the title and the text sits below it (css/read.css) */
      const top = phone ? 96 : 130, bottom = phone ? H - top - H * .36 : 40;
      const s = Math.min(W * (phone ? 1 : .72) / fw, (H - top - bottom) / fh), w = fw * s, h = fh * s;
      /* never past the holder's sides: the film blends with the holder's own background */
      const normal = { x: ST.clamp((W - w) / 2 - (phone ? 0 : st.sideNow * W * .17), 0, Math.max(0, W - w)), y: top + (H - top - bottom - h) / 2, s };
      if (!st.align) return normal;
      const d = META.die, sa = st.align.w / (d.w * fw);
      const al = { x: st.align.l - d.l * fw * sa, y: st.align.t - d.t * fh * sa, s: sa }, k = st.align.k;
      return { x: normal.x + (al.x - normal.x) * k, y: normal.y + (al.y - normal.y) * k, s: normal.s + (al.s - normal.s) * k };
    }
    /* the two canvases cover only the film's own rectangle (cheap to redraw, every frame while it plays) */
    function render() {
      if (!st.has || !pic) return;
      const r = holder.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      const W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
      const p = place(W, H), w = META.width * p.s, h = META.height * p.s, gap = META.gap || 0;
      const fe = Math.min(w, h) * .09 * (1 - (st.align ? st.align.k : 0));
      const cw = Math.max(1, Math.round(w * dpr)), ch = Math.max(1, Math.round(h * dpr));
      const css = { left: p.x.toFixed(2) + 'px', top: p.y.toFixed(2) + 'px', width: w.toFixed(2) + 'px', height: h.toFixed(2) + 'px' };
      /* copy the frame once: both layers must come from the same frame of a playing video */
      const fw2 = META.width, fh2 = META.height * 2 + gap;
      if (snap.width !== fw2 || snap.height !== fh2) { snap.width = fw2; snap.height = fh2; }
      try { sc2.drawImage(pic, 0, 0, fw2, fh2); } catch (e) {}
      const layer = (cv, c, sy, empty) => {
        if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
        Object.assign(cv.style, css);
        c.setTransform(cw / w, 0, 0, ch / h, 0, 0);
        c.globalCompositeOperation = 'source-over'; c.fillStyle = empty; c.fillRect(0, 0, w, h);
        c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
        c.drawImage(snap, 0, sy, META.width, META.height, 0, 0, w, h);
        /* soft edges: the frame melts into the page */
        if (fe > 1) {
          const clear = empty === '#000' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)';
          const edge = (x0, y0, x1, y1, rx, ry, rw, rh) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, empty); g.addColorStop(1, clear); c.fillStyle = g; c.fillRect(rx, ry, rw, rh); };
          edge(0, 0, fe, 0, 0, 0, fe, h); edge(w, 0, w - fe, 0, w - fe, 0, fe, h);
          edge(0, 0, 0, fe, 0, 0, w, fe); edge(0, h, 0, h - fe, 0, h - fe, w, fe);
        }
      };
      layer(cvM, cM, META.height + gap, '#fff');   // 1 − transparency: multiplies the page
      layer(cvC, cC, 0, '#000');                   // the picture: added
    }
    /* one tick of the clock. Inside the film a playing video is the clock (forwards: film.mp4, backwards:
       film-rev.mp4); after the film (the tail) or when a video cannot play, a timer is, and the video follows by seeking */
    function tick(now) {
      const dt = Math.min(.1, (now - (pl.last || now)) / 1000); pl.last = now;
      if (!pl.dir) return false;
      const ahead = pl.dir > 0, film = ahead ? pl.t < D - 1e-4 : pl.t <= D + 1e-4;
      /* this stretch ends at the target, or at the film's last frame when the target is in the tail */
      const segEnd = film ? (ahead ? Math.min(pl.T, D) : pl.T) : (ahead ? pl.T : Math.max(pl.T, D));
      const v = ahead ? fwd : rev;
      let vid = false;
      if (film && ready(v) && pl.want !== false) {
        if (v.paused) {
          v.playbackRate = pl.rate;
          const want = frameT(pl.t, v);
          if (Math.abs(v.currentTime - want) > F * 1.5) v.currentTime = want;
          const pr = v.play(); if (pr && pr.catch) pr.catch(() => { pl.want = false; });
        } else if (!v.seeking) {
          vid = true;
          const vt = clamp(v.currentTime - .5 * F, 0, D), t = ahead ? vt : D - vt;
          if ((t - pl.t) * pl.dir > 0) pl.t = t;   // never back against the step
          if (v.playbackRate !== pl.rate) v.playbackRate = pl.rate;
          pl.src = v;
        } else pl.last = now;
      }
      if (!vid && !(film && ready(v) && pl.want !== false)) {
        pl.t += dt * pl.rate * pl.dir;
        if (film && ready(fwd) && !fwd.seeking) { fwd.currentTime = frameT(pl.t, fwd); pl.src = fwd; }
      }
      /* the end of the stretch: stop a fraction of a frame early, then show exactly its frame */
      const lead = vid ? F * pl.rate * .9 : 0;
      if ((segEnd - pl.t) * pl.dir <= lead) {
        pl.t = segEnd;
        if (segEnd === pl.T) { pl.dir = 0; pl.rate = 1; }
        park(Math.min(segEnd, D));
      }
      return true;
    }
    function draw(force) {
      st.raf = 0;
      if (!META || !cvC.isConnected) return;
      const now = performance.now();
      const moving = tick(now);
      st.sideNow += (st.side - st.sideNow) * .1;
      /* the picture: the playing video, a video waiting on its frame, or a still of a rest */
      const src = pl.src && ready(pl.src) && !pl.src.seeking ? pl.src : null;
      if (src) upload(src); else { const im = stillFor(Math.min(pl.t, D)); if (im && (!st.has || !pl.dir)) upload(im); }
      render();
      if (moving || pl.dir || Math.abs(st.side - st.sideNow) > .002 || (pl.src && pl.src.seeking) || !st.has || force === 'settle') st.raf = requestAnimationFrame(draw);
    }
    const kick = () => { if (!st.raf) st.raf = requestAnimationFrame(draw); };
    for (const v of [fwd, rev]) if (v) ['loadeddata', 'seeked', 'canplay'].forEach(ev => v.addEventListener(ev, kick));
    if (fwd) fwd.addEventListener('loadeddata', () => park(Math.min(pl.t, D)), { once: true });
    /* iOS keeps a video asleep until it has played once: wake both on the first touch */
    const wakeVideos = () => {
      for (const v of [fwd, rev]) if (v && v.paused && !pl.dir) { const p = v.play(); if (p && p.then) p.then(() => { if (!pl.dir || (pl.dir > 0 ? rev : fwd) === v) { v.pause(); park(Math.min(pl.t, D)); } }).catch(() => {}); }
      removeEventListener('touchstart', wakeVideos, true);
    };
    addEventListener('touchstart', wakeVideos, { capture: true, passive: true });
    if (META) kick();

    return {
      /* the page's position: while the film is not playing it shows exactly that moment (a rest when close to one) */
      set(P, side, align) {
        st.side = side || 0; st.align = align;
        if (META && !pl.dir) {
          const r = Math.round(P), Ps = Math.abs(P - r) < .03 && r <= NR - 1 ? r : P, t = timeOf(Ps);
          if (Math.abs(t - pl.t) > 1e-4) { pl.t = t; park(Math.min(t, D)); }
        }
        kick();
      },
      /* play to story position P (forwards or backwards), at the normal speed */
      playTo(P) {
        if (!META) return false;
        const T = timeOf(P); if (Math.abs(T - pl.t) < 1e-4) return false;
        pl.T = T; pl.dir = Math.sign(T - pl.t); pl.rate = 1; pl.last = 0;
        const other = pl.dir > 0 ? rev : fwd; if (other) other.pause();
        kick(); return true;
      },
      /* the visitor scrolls on while a step plays: it finishes faster */
      hurry() { if (pl.dir) { pl.rate = Math.min(4, pl.rate * 1.7); } },
      /* stop where it is (the visitor skips the film) */
      stop() { if (pl.dir) { pl.dir = 0; pl.rate = 1; park(Math.min(pl.t, D)); } },
      busy: () => !!pl.dir,
      /* the bottom of the film's band (phones and tablets: the text starts below it) */
      bandBottom: H => 96 + H * .36,
      P: () => pOf(pl.t),
      get meta() { return META; }
    };
  }
  ST.film = { attach, timeOf, pOf, textP, end: () => FILM_END, last: () => LAST, rests: () => [...Array(NR).keys(), LAST] };
})();
