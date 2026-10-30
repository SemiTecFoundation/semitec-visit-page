/* ==========================================================================
   Sound — off by default; the speaker button in the header turns it on.
   Everything is synthesised with the Web Audio API (no audio files):
   • hum      a low electrical hum that rises and brightens while you travel
   • tick     a clock tick when you reach a new section
   • open/read soft digital tones when the memory view opens / a cell is read
   • power    a rising chord when the chip powers on (Support, the finale)
   • sweep    a filtered whoosh when switching between 2D and 3D
   The choice is remembered. Browsers only allow sound after a click or key
   press, so a remembered "on" starts at the visitor's first interaction.
   ========================================================================== */
(function () {
  const ST = window.ST = window.ST || {};
  let ctx = null, master = null, humGain = null, filt = null;
  let on = false, motion = 0, motionTarget = 0, raf = 0;
  let wanted = false;
  try { wanted = localStorage.getItem('st-sound') === 'on'; } catch (e) {}

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 280; filt.Q.value = .8;
    humGain = ctx.createGain(); humGain.gain.value = 0;
    const osc = (type, f, g) => { const o = ctx.createOscillator(), v = ctx.createGain(); o.type = type; o.frequency.value = f; v.gain.value = g; o.connect(v).connect(humGain); o.start(); return o; };
    osc('sine', 55, 1); osc('triangle', 110.4, .45); osc('sawtooth', 220.7, .06);
    humGain.connect(filt).connect(master);
    return ctx;
  }
  function paint() {
    const b = document.querySelector('#sound-toggle'); if (!b) return;
    b.setAttribute('aria-pressed', String(wanted));
    b.setAttribute('aria-label', ST.text ? ST.text(wanted ? 'soundOn' : 'soundOff') : 'Sound');
    b.title = b.getAttribute('aria-label');
  }
  function start() {
    if (!ensure()) return;
    ctx.resume(); on = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(.8, ctx.currentTime, .25);
    loop();
  }
  function stop() {
    on = false;
    if (ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, .12); }
  }
  function set(v) {
    wanted = v;
    try { localStorage.setItem('st-sound', v ? 'on' : 'off'); } catch (e) {}
    if (v) { start(); tone(660, .09, 'sine', .05); } else stop();
    paint();
  }
  /* hum follows travel speed; modes report motion 0…1 every frame they move */
  function loop() {
    if (raf) return;
    const f = () => {
      raf = 0; if (!on || !ctx) return;
      motion += (motionTarget - motion) * .08; motionTarget *= .9;
      humGain.gain.setTargetAtTime(.022 + motion * .085, ctx.currentTime, .06);
      filt.frequency.setTargetAtTime(240 + motion * 950, ctx.currentTime, .08);
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
  }
  /* a short enveloped tone (optionally gliding), routed past the hum filter */
  function tone(freq, dur, type = 'sine', vol = .05, glide = 0, delay = 0) {
    if (!on || !ctx) return;
    const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + .02);
  }
  function noiseSweep(dur = .7, vol = .06) {
    if (!on || !ctx) return;
    const t = ctx.currentTime, len = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buf; bp.type = 'bandpass'; bp.Q.value = 3;
    bp.frequency.setValueAtTime(260, t); bp.frequency.exponentialRampToValueAtTime(3200, t + dur * .8);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * .35); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(bp).connect(g).connect(master); src.start(t);
  }

  ST.sound = {
    get on() { return on; },
    motion(v) { if (on) motionTarget = Math.max(motionTarget, Math.min(1, v)); },
    tick() { tone(1760, .03, 'square', .025); tone(2637, .025, 'square', .018, 0, .045); },
    blip(kind) {
      if (kind === 'read') { tone(880, .07, 'sine', .05); tone(1318, .09, 'sine', .04, 0, .06); }
      else if (kind === 'open') { tone(523, .14, 'triangle', .04); tone(784, .16, 'triangle', .03, 0, .05); }
      else tone(990, .05, 'sine', .04);
    },
    power() { tone(110, .9, 'sawtooth', .03, 440); [440, 554, 659, 880].forEach((f, k) => tone(f, .7, 'sine', .028, 0, .35 + k * .09)); },
    sweep() { noiseSweep(.75, .05); }
  };

  function init() {
    const b = document.querySelector('#sound-toggle');
    if (b) b.addEventListener('click', () => set(!wanted));
    paint();
    if (wanted) {   /* remembered "on": begin at the first interaction (browser autoplay rule) */
      const go = e => { if (e.target.closest && e.target.closest('#sound-toggle')) return; if (wanted && !on) start(); removeEventListener('pointerdown', go, true); removeEventListener('keydown', go, true); };
      addEventListener('pointerdown', go, true); addEventListener('keydown', go, true);
    }
  }
  ST.soundPaint = paint;
  if (document.readyState === 'complete') init(); else document.addEventListener('DOMContentLoaded', init);
})();
