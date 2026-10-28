/* ==========================================================================
   Chip floorplan generator (no DOM — also used by validate.cjs).
   buildChipLayout(SITE_CONTENT.sections, CHIP_LAYOUT) →
     blocks   { id: {x,y,w,h,row,kind:'tile'|'power'} }
     route    the signal trace through every section in reading order (M/H/V path)
     quiet    decorative traces (die ring, bus lanes)
     rails    power rails from the power unit to every tile
     pads     gold bond pads (partners & supporters) on the die edge, with bond wires
   Rows snake: row 0 left→right, row 1 right→left, …  The bus lanes run in the
   gaps between rows; the power unit spans the bottom of the die.
   ========================================================================== */
function buildChipLayout(sections, cfg, partners) {
  const W = cfg.width, H = cfg.height, m = cfg.margin, g = cfg.gap, bg = cfg.busGap;
  const powerId = cfg.power && sections.some(s => s.id === cfg.power) ? cfg.power : '';
  const ph = powerId ? cfg.powerHeight : 0;
  const tiles = sections.filter((s, i) => i > 0 && s.id !== powerId);
  const cols = Math.max(1, cfg.columns), rows = Math.max(1, Math.ceil(tiles.length / cols));
  const top = m, bottom = H - m - (ph ? ph + bg * .55 : 0);
  const rowH = (bottom - top - (rows - 1) * bg) / rows;
  const tileW = (W - 2 * m - (cols - 1) * g) / cols;
  const rowTop = r => top + r * (rowH + bg);
  /* each row's bus lane: below even rows, above odd rows (both sit in the gap) */
  const lane = r => r % 2 === 0 ? rowTop(r) + rowH + bg * .3 : rowTop(r) - bg * .3;

  const blocks = {};
  tiles.forEach((s, n) => {
    const r = Math.floor(n / cols), k = n % cols, c = r % 2 === 0 ? k : cols - 1 - k;
    blocks[s.id] = { x: m + c * (tileW + g), y: rowTop(r), w: tileW, h: rowH, row: r, kind: 'tile' };
  });
  if (powerId) blocks[powerId] = { x: m, y: H - m - ph, w: W - 2 * m, h: ph, row: rows, kind: 'power' };

  /* route through the sections in reading order */
  const r1 = v => Math.round(v * 10) / 10;
  const centre = id => { const b = blocks[id]; return { x: r1(b.x + b.w / 2), y: r1(b.y + b.h / 2), b }; };
  const order = sections.slice(1).map(s => s.id).filter(id => blocks[id]);
  let d = '';
  order.forEach((id, n) => {
    const B = centre(id);
    if (!n) { d = `M${B.x} ${B.y}`; return; }
    const A = centre(order[n - 1]);
    if (A.b.kind === 'power') d += `H${B.x}V${B.y}`;
    else if (B.b.kind === 'power') d += `V${B.y}H${B.x}`;
    else {
      const y = A.b.row === B.b.row ? lane(A.b.row) : lane(Math.min(A.b.row, B.b.row));
      d += `V${r1(y)}H${B.x}V${B.y}`;
    }
  });

  const quiet = [
    `M${m / 2} ${m / 2}H${W - m / 2}V${H - m / 2}H${m / 2}Z`,
    ...Array.from({ length: rows }, (_, r) => `M${m} ${r1(lane(r))}H${W - m}`)
  ];
  const rails = [];
  if (powerId) {
    const p = blocks[powerId], last = rows - 1;
    Object.values(blocks).filter(b => b.kind === 'tile').forEach(b => {
      const x = r1(b.x + b.w - 22);
      if (b.row === last) rails.push(`M${x} ${p.y}V${r1(b.y + b.h)}`);
      else { const ex = b.x + b.w / 2 < W / 2 ? m / 2 + 8 : W - m / 2 - 8; rails.push(`M${ex} ${p.y}V${r1(b.y + b.h / 2)}H${r1(ex < W / 2 ? b.x : b.x + b.w)}`); }
    });
  }
  /* bond pads on every edge. Gold ring (partners) = top + left edges, copper ring (supporters) =
     bottom + right edges, next to the power unit. Partners / supporters take the first slots of their
     ring; the remaining slots are FREE pads (no bond wire) that invite new partners and supporters. */
  const pads = [], wires = [], list = partners || [], pw = 26, phh = 20;
  const nTop = 14, nSide = 8, sideTop = top + 10, sideBot = bottom - 10;
  const slot = (side, k, n) => {
    if (side === 'top' || side === 'bottom') { const x = m + (k + .5) * (W - 2 * m) / n - pw / 2; return { x, y: side === 'top' ? (m - phh) / 2 : H - (m + phh) / 2 }; }
    const y = sideTop + (k + .5) * (sideBot - sideTop) / n - phh / 2;
    return { x: side === 'left' ? (m - pw) / 2 : W - (m + pw) / 2, y };
  };
  const ring = kind => (kind === 'partner' ? [['top', nTop], ['left', nSide]] : [['bottom', nTop], ['right', nSide]])
    .flatMap(([side, n]) => Array.from({ length: n }, (_, k) => ({ side, ...slot(side, k, n) })));
  for (const kind of ['partner', 'supporter']) {
    const members = list.filter(p => (p.kind === 'supporter' ? 'supporter' : 'partner') === kind);
    ring(kind).forEach((sl, k) => {
      const p = members[k], free = !p;
      pads.push({ id: free ? `free-${kind}-${k}` : p.id, kind, free, x: r1(sl.x), y: r1(sl.y), w: pw, h: phh, side: sl.side });
      if (free) return;
      const cx = r1(sl.x + pw / 2), cy = r1(sl.y + phh / 2);
      wires.push(sl.side === 'top' ? `M${cx} ${r1(sl.y + phh)}V${m + 8}` : sl.side === 'bottom' ? `M${cx} ${r1(sl.y)}V${H - m - 8}`
        : sl.side === 'left' ? `M${r1(sl.x + pw)} ${cy}H${m + 8}` : `M${r1(sl.x)} ${cy}H${W - m - 8}`);
    });
  }
  return { width: W, height: H, blocks, route: d, quiet, rails, pads, wires, power: powerId };
}
if (typeof module !== 'undefined') module.exports = { buildChipLayout };
