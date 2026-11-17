/* About chapter: the dotted globe (scene "Global progress") and Aragats (scene "Our symbol").
   Both follow the scene clock, so pausing the deck freezes them too. */
(function () {
  if (!window.SceneFX) return;
  const T = key => { const e = STRINGS[key], li = document.documentElement.lang === 'hy' ? 1 : 0; return e ? (e[li] || e[0]) : key; };
  const rad = d => d * Math.PI / 180;

  /* ---------- globe ---------- */
  const HOME = [40.2, 44.5];
  const DEST = [[52.4, 4.9], [48.1, 11.6], [51.05, 13.7], [45.2, 5.7], [50.9, 4.7], [32.1, 34.8], [12.97, 77.6], [1.35, 103.8], [25.0, 121.5], [35.7, 139.7], [59.3, 18.1]];
  const DOTS = [];
  for (let i = 0, n = 1500; i < n; i++) {             // an even spread of dots over the sphere
    const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
    DOTS.push([Math.cos(th) * r, y, Math.sin(th) * r]);
  }
  const v3 = (lat, lon) => [Math.cos(rad(lat)) * Math.sin(rad(lon)), Math.sin(rad(lat)), Math.cos(rad(lat)) * Math.cos(rad(lon))];
  function globe(cv, sec) {
    const c = cv.getContext('2d'), W = cv.width, R = W * .4, cx = W / 2, cy = W / 2;
    c.clearRect(0, 0, W, W);
    const yaw = -rad(58) + .22 * Math.sin(sec * .2), tilt = rad(28);
    const rot = p => {
      let [x, y, z] = p;
      const cyw = Math.cos(yaw), syw = Math.sin(yaw);
      [x, z] = [x * cyw + z * syw, -x * syw + z * cyw];
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      [y, z] = [y * ct - z * st, y * st + z * ct];
      return [cx + x * R, cy - y * R, z];
    };
    const g = c.createRadialGradient(cx - R * .3, cy - R * .3, R * .1, cx, cy, R * 1.05);
    g.addColorStop(0, 'rgba(57,123,128,.28)'); g.addColorStop(1, 'rgba(7,20,25,.0)');
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
    c.strokeStyle = 'rgba(111,211,204,.25)'; c.lineWidth = 2; c.stroke();
    DOTS.forEach(p => {
      const [x, y, z] = rot(p); if (z < 0) return;
      c.fillStyle = `rgba(160,205,207,${(.22 + .7 * z).toFixed(2)})`;
      c.fillRect(x - 2.4, y - 2.4, 4.8, 4.8);
    });
    const home = v3(...HOME), hp = rot(home);
    DEST.forEach(([la, lo], i) => {
      const k = Math.max(0, Math.min(1, (sec - 2 - i * .45) / 1.6));
      if (k <= 0) return;
      const b = v3(la, lo), pts = [];
      const dot = Math.max(-1, Math.min(1, home[0] * b[0] + home[1] * b[1] + home[2] * b[2])), om = Math.acos(dot);
      for (let s = 0; s <= 48 * k; s++) {
        const u = s / 48, a = Math.sin((1 - u) * om) / Math.sin(om), bb = Math.sin(u * om) / Math.sin(om);
        const lift = 1 + .16 * Math.sin(Math.PI * u) * om;
        pts.push(rot([(home[0] * a + b[0] * bb) * lift, (home[1] * a + b[1] * bb) * lift, (home[2] * a + b[2] * bb) * lift]));
      }
      c.beginPath(); pts.forEach((p, j) => j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
      c.strokeStyle = 'rgba(234,200,131,.85)'; c.lineWidth = 3.4; c.stroke();
      const e = pts[pts.length - 1];
      if (k >= 1 && e[2] > -0.1) { c.fillStyle = '#6fd3cc'; c.beginPath(); c.arc(e[0], e[1], 7, 0, 7); c.fill(); }
      // a light running along the finished arc
      if (k >= 1) {
        const q = pts[Math.floor(((sec * .5 + i * .13) % 1) * (pts.length - 1))];
        c.fillStyle = '#fff2cf'; c.beginPath(); c.arc(q[0], q[1], 5, 0, 7); c.fill();
      }
    });
    const pulse = (sec % 2) / 2;
    c.strokeStyle = `rgba(234,200,131,${(1 - pulse).toFixed(2)})`; c.lineWidth = 4;
    c.beginPath(); c.arc(hp[0], hp[1], 14 + pulse * 46, 0, 7); c.stroke();
    c.fillStyle = '#eac883'; c.beginPath(); c.arc(hp[0], hp[1], 13, 0, 7); c.fill();
    c.font = '600 46px DM Sans, Noto Sans Armenian, sans-serif'; c.fillStyle = '#f1eee6'; c.textAlign = 'left';
    c.fillText(T('ab12.home'), hp[0] + 30, hp[1] - 24);
  }

  /* ---------- Aragats ---------- */
  let art = null;
  function symbol(scene, sec) {
    const cv = scene.querySelector('.ab-aragats');
    if (!art) art = Aragats.create(cv, { theme: 'dark', fixed: true, font: 'DM Sans, Noto Sans Armenian, sans-serif',
      labels: () => [1, 2, 3, 4].map(i => T('ab13.p' + i)) });
    const t = Math.min(Aragats.END, Math.max(0, sec - .8));
    art.draw(t);
    scene.querySelectorAll('.ab-cap').forEach(el => el.classList.toggle('is-on', Aragats.focus(t, +el.dataset.k) > .5));
    scene.classList.toggle('sym-done', t > Aragats.T2 + 2);
  }

  const update = SceneFX.update;
  SceneFX.update = function (scene, sec) {
    update.call(this, scene, sec);
    const s = sec === Infinity ? 1e3 : sec;
    if (scene.classList.contains('s-ab-global')) globe(scene.querySelector('canvas'), sec === Infinity ? 8 : sec);
    else if (scene.classList.contains('s-ab-symbol')) symbol(scene, s);
  };
})();
