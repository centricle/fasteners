// Nuts: a side view with the view from above over it. The thread is hidden in
// the side view (dashed at the major diameter) and drawn by convention in the
// plan (bore as a circle, major diameter as a three-quarter arc).

import { Fig, arc, rect, type Pt } from './core';
import { BORE, RN, band, dome, hexPlan, hexSide, knurl, solid, tappedPlan, type Opts } from './parts';
import { GAP } from './screws';

const C30 = Math.cos(Math.PI / 6);
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Hidden edges of a through thread in a side view. */
function bore(fig: Fig, y0: number, y1: number): Fig {
  return fig.segs('hid', [
    [[-RN, y0], [-RN, y1]],
    [[RN, y0], [RN, y1]],
  ]);
}

/** Close a nut figure: plan center lines, axis, and the thread size dimension. */
function finish(fig: Fig, o: Opts, cy: number, ext: number, half: number, bottom: number): Fig {
  if (o.top !== false) {
    fig.level(cy, -half, half);
    fig.axis(0, cy - ext, bottom);
  } else fig.axis(0, 0, bottom);
  fig.dim('d', [-RN, bottom], [RN, bottom], 'b', 5);
  return fig;
}

/** Plain hexagon nuts of a given thickness. */
function hexNut(H: number, F = 15) {
  return (o: Opts = {}): Fig => {
    const fig = new Fig();
    hexSide(fig, 0, 0, F, H, { bottom: true });
    bore(fig, 0, H);
    const cy = -(GAP + F / 2);
    if (o.top !== false) {
      hexPlan(fig, 0, cy, F, BORE);
      tappedPlan(fig, 0, cy);
    }
    return finish(fig, o, cy, F / 2, F / 2 / C30, H);
  };
}

/** Hex nut with a nylon ring crimped into a collar on top. */
function lockNut(o: Opts = {}): Fig {
  const fig = new Fig();
  const F = 15;
  const yH = 3;
  const H = 8;
  hexSide(fig, 0, yH, F, H, { bottom: true });
  solid(fig, 0, [[5.4, 0], [6.4, 0.9], [6.4, yH + 0.3]]);
  fig.poly('hid', [[-5.2, yH + 0.3], [-5.2, 0.9], [5.2, 0.9], [5.2, yH + 0.3]], false);
  bore(fig, yH + 0.3, yH + H);
  const cy = -(GAP + F / 2);
  if (o.top !== false) {
    hexPlan(fig, 0, cy, F);
    fig.circle('body', 0, cy, 6.4);
    fig.ring('soft', 0, cy, 5.2, BORE - 0.2);
  }
  return finish(fig, o, cy, F / 2, F / 2 / C30, yH + H);
}

/** All-metal lock nut: the top threads are squeezed out of round. */
function torqueNut(o: Opts = {}): Fig {
  const fig = new Fig();
  const F = 15;
  const yH = 3.6;
  const H = 6.8;
  solid(fig, 0, [[5.3, 0], [6.9, yH + 0.4]]);
  hexSide(fig, 0, yH, F, H, { bottom: true });
  // Crimp marks where the cone was pressed.
  fig.segs('thin', [
    [[-0.9, 0.5], [-1.3, 2.9]],
    [[0.9, 0.5], [1.3, 2.9]],
  ]);
  bore(fig, 0, yH + H);
  const cy = -(GAP + F / 2);
  if (o.top !== false) {
    hexPlan(fig, 0, cy, F);
    fig.circle('thin', 0, cy, 6.9);
    fig.compound('body', [{ cx: 0, cy, r: 5.3 }, arc(0, cy, BORE + 0.25, BORE - 0.45, 0, 360, 40)]);
  }
  return finish(fig, o, cy, F / 2, F / 2 / C30, yH + H);
}

function wingNut(o: Opts = {}): Fig {
  const fig = new Fig();
  const H = 9.4;
  const wing: Pt[] = [[4.2, 1.6], ...arc(12.8, -4.4, 3.1, 3.1, 225, 405), [5.8, 8.9]];
  fig.poly('body', wing);
  fig.poly(
    'body',
    wing.map(([x, y]) => [-x, y] as Pt),
  );
  solid(fig, 0, [[4.3, 0], [4.8, 0.5], [6.1, 8.6], [6.1, H]]);
  bore(fig, 0, H);
  // The wings stand above the body, so the plan sits clear of them.
  const cy = -7.6 - (GAP + 6.1);
  if (o.top !== false) {
    fig.poly('body', [[-15.9, cy - 1.3], [15.9, cy - 1.3], [15.9, cy + 1.3], [-15.9, cy + 1.3]]);
    fig.ring('body', 0, cy, 6.1, BORE);
    fig.circle('thin', 0, cy, 4.5);
    tappedPlan(fig, 0, cy);
  }
  return finish(fig, o, cy, 6.1, 15.9, H);
}

/** Cap nut: a hex with a dome that covers the end of the bolt. */
function acornNut(o: Opts = {}): Fig {
  const fig = new Fig();
  const F = 15;
  const yH = 8.6;
  const H = 6.4;
  solid(fig, 0, [...dome(6.5, 8.2, 2.1), [6.5, yH + 0.4]]);
  hexSide(fig, 0, yH, F, H);
  fig.poly('hid', [[-RN, yH + H], [-RN, 5.4], [0, 3], [RN, 5.4], [RN, yH + H]], false);
  const cy = -(GAP + F / 2);
  if (o.top !== false) {
    hexPlan(fig, 0, cy, F);
    fig.circle('thin', 0, cy, 6.5);
  }
  return finish(fig, o, cy, F / 2, F / 2 / C30, yH + H);
}

/** Slotted crown for a cotter pin through a drilled bolt. */
function castleNut(o: Opts = {}): Fig {
  const fig = new Fig();
  const F = 15;
  const yH = 4;
  const H = 7.6;
  const rc = 6.2;
  hexSide(fig, 0, yH, F, H, { bottom: true });
  fig.poly('body', [[-rc, yH + 0.3], [-rc, 0.4], [-rc + 0.4, 0], [-1.3, 0], [-1.3, 3.6], [1.3, 3.6], [1.3, 0], [rc - 0.4, 0], [rc, 0.4], [rc, yH + 0.3]]);
  // The two slots either side of the facing one, seen at 60 degrees.
  for (const s of [-1, 1]) fig.poly('thin', [[s * 4.5, 0], [s * 4.5, 3.6], [s * 5.75, 3.6], [s * 5.75, 0]], false);
  bore(fig, 3.6, yH + H);
  const cy = -(GAP + F / 2);
  if (o.top !== false) {
    hexPlan(fig, 0, cy, F, BORE);
    fig.circle('thin', 0, cy, rc);
    tappedPlan(fig, 0, cy);
    const slots: [Pt, Pt][] = [];
    for (let a = 30; a < 360; a += 60) {
      const c = Math.cos(rad(a));
      const s = Math.sin(rad(a));
      for (const w of [-1.3, 1.3]) slots.push([[5.2 * c - w * s, cy + 5.2 * s + w * c], [rc * c - w * s * 0.96, cy + rc * s + w * c * 0.96]]);
    }
    fig.segs('thin', slots);
  }
  return finish(fig, o, cy, F / 2, F / 2 / C30, yH + H);
}

function flangeNut(o: Opts = {}): Fig {
  const fig = new Fig();
  const F = 15;
  const h = 7.4;
  const H = 10;
  const rf = 11;
  solid(fig, 0, [[8.9, h], [rf, h + 1.5], [rf, H]]);
  hexSide(fig, 0, 0, F, h);
  // Serrations on the bearing face.
  const teeth: [Pt, Pt][] = [];
  for (let x = -rf + 0.9; x < rf - 0.4; x += 1.45) teeth.push([[x, H], [x + 0.55, H - 0.95]]);
  fig.segs('thin', teeth);
  bore(fig, 0, H);
  const cy = -(GAP + rf);
  if (o.top !== false) {
    fig.circle('body', 0, cy, rf);
    hexPlan(fig, 0, cy, F, BORE);
    tappedPlan(fig, 0, cy);
  }
  return finish(fig, o, cy, rf, rf, H);
}

function squareNut(o: Opts = {}): Fig {
  const fig = new Fig();
  const F = 15;
  const h = F / 2;
  const H = 6.6;
  const rc = 9.1;
  const zc = (Math.SQRT2 * h - rc) * Math.tan(rad(30));
  fig.poly('body', [[-h, zc], [-h + 0.01, zc], [-rc * 0.72, 0], [rc * 0.72, 0], [h, zc], [h, H], [-h, H]]);
  const curve: Pt[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = -h + (F * i) / 10;
    curve.push([t, Math.max(0, (Math.hypot(h, t) - rc) * Math.tan(rad(30)))]);
  }
  fig.poly('thin', curve, false);
  bore(fig, 0, H);
  const cy = -(GAP + h);
  if (o.top !== false) {
    fig.compound('body', [rect(-h, cy - h, h, cy + h), { cx: 0, cy, r: BORE }]);
    const half = (Math.acos(h / rc) * 180) / Math.PI;
    for (let q = 0; q < 4; q++) fig.poly('thin', arc(0, cy, rc, rc, q * 90 + half, q * 90 + 90 - half, 4), false);
    tappedPlan(fig, 0, cy);
  }
  return finish(fig, o, cy, h, h, H);
}

/** Pronged tee nut: hammered into the back of a panel, barrel into the hole. */
export function teeNut(o: Opts = {}): Fig {
  const fig = new Fig();
  const rf = 9.6;
  const rb = 6.2;
  const H = 10.5;
  solid(fig, 0, [[rb, 1], [rb, H - 0.5], [rb - 0.5, H]]);
  for (const s of [-1, 1]) fig.poly('body', [[s * 7.3, 1], [s * rf, 1], [s * (rf - 0.3), 8.6]]);
  fig.poly('body', [[-1.15, 1], [1.15, 1], [0, 8.6]]);
  fig.poly('body', rect(-rf, 0, rf, 1.1));
  bore(fig, 1.1, H);
  const cy = -(GAP + rf);
  if (o.top !== false) {
    fig.ring('body', 0, cy, rf, BORE);
    tappedPlan(fig, 0, cy);
    // Where each prong was sheared out of the flange and bent down.
    const cuts: [Pt, Pt][] = [];
    for (let a = 0; a < 360; a += 90) {
      const c = Math.cos(rad(a));
      const s = Math.sin(rad(a));
      cuts.push([[7.3 * c - 1.15 * s, cy + 7.3 * s + 1.15 * c], [7.3 * c + 1.15 * s, cy + 7.3 * s - 1.15 * c]]);
    }
    fig.segs('thin', cuts);
  }
  return finish(fig, o, cy, rf, rf, H);
}

function knurledNut(o: Opts = {}): Fig {
  const fig = new Fig();
  const r = 10;
  const H = 8;
  solid(fig, 0, [[r - 0.7, 0], [r, 0.7], [r, 4.3], [r - 0.7, 5], [6, 5], [6, H]]);
  band(fig, 0, r, 0.7);
  band(fig, 0, r, 4.3);
  knurl(fig, 0, r, 0.7, 4.3, 9);
  bore(fig, 0, H);
  const cy = -(GAP + r);
  if (o.top !== false) {
    fig.ring('body', 0, cy, r, BORE);
    fig.circle('thin', 0, cy, r - 0.9);
    const ticks: [Pt, Pt][] = [];
    for (let a = 0; a < 360; a += 9) ticks.push([[(r - 0.9) * Math.cos(rad(a)), cy + (r - 0.9) * Math.sin(rad(a))], [r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))]]);
    fig.segs('thin', ticks);
    tappedPlan(fig, 0, cy);
  }
  return finish(fig, o, cy, r, r, H);
}

/** Cross dowel: a cylinder tapped across its axis, with a slot to line the hole up. */
function barrelNut(o: Opts = {}): Fig {
  const fig = new Fig();
  fig.says('Looking into the threaded hole, with the view from above.');
  const hl = 10;
  const dia = 15;
  const mid = dia / 2;
  fig.compound('body', [
    [[-hl + 0.7, 0], [hl - 0.7, 0], [hl, 0.7], [hl, mid - 0.9], [hl - 2.2, mid - 0.9], [hl - 2.2, mid + 0.9], [hl, mid + 0.9], [hl, dia - 0.7], [hl - 0.7, dia], [-hl + 0.7, dia], [-hl, dia - 0.7], [-hl, 0.7]],
    { cx: 0, cy: mid, r: BORE },
  ]);
  fig.segs('thin', [
    [[-hl + 0.7, 0], [-hl + 0.7, dia]],
    [[hl - 0.7, 0], [hl - 0.7, mid - 0.9]],
    [[hl - 0.7, mid + 0.9], [hl - 0.7, dia]],
  ]);
  tappedPlan(fig, 0, mid);
  const cy = -(GAP + mid);
  if (o.top !== false) {
    // From above the tapped hole runs straight down through the cylinder.
    fig.poly('body', [[-hl + 0.7, cy - mid], [hl - 0.7, cy - mid], [hl, cy - mid + 0.7], [hl, cy + mid - 0.7], [hl - 0.7, cy + mid], [-hl + 0.7, cy + mid], [-hl, cy + mid - 0.7], [-hl, cy - mid + 0.7]]);
    fig.segs('hid', [
      [[-RN, cy - mid], [-RN, cy + mid]],
      [[RN, cy - mid], [RN, cy + mid]],
    ]);
    fig.seg('thin', [hl - 2.2, cy - mid + 1.2], [hl - 2.2, cy + mid - 1.2]);
    fig.level(cy, -hl, hl);
    fig.axis(0, cy - mid, dia);
  } else fig.axis(0, 0, dia);
  fig.level(mid, -hl, hl);
  fig.dim('d', [-RN, mid], [RN, mid], 'b', 5 + mid);
  return fig;
}

/**
 * Drawn in section. The thin wall above the thread is what buckles outward
 * behind the sheet when the nut is set.
 */
function rivetNut(o: Opts = {}): Fig {
  const fig = new Fig();
  fig.says('Cut down the middle to show the inside, with the view from above.');
  const rf = 8.6;
  const rb = 6.6;
  const H = 21;
  const yT = 9.4;
  const wall: Pt[] = [[5.6, 0], [rf, 0], [rf, 1], [rb, 1], [rb, H - 0.6], [rb - 0.6, H], [BORE, H], [BORE, yT + 0.8], [5.6, yT]];
  for (const s of [-1, 1]) {
    fig.cut(wall.map(([x, y]) => [s * x, y] as Pt));
    fig.seg('thin', [s * RN, yT + 0.4], [s * RN, H]);
  }
  fig.segs('edge', [
    [[-5.6, 0], [5.6, 0]],
    [[-BORE, H], [BORE, H]],
  ]);
  fig.seg('thin', [-5.6, yT], [5.6, yT]);
  const cy = -(GAP + rf);
  if (o.top !== false) {
    fig.ring('body', 0, cy, rf, 5.6);
    fig.circle('thin', 0, cy, BORE);
    fig.level(cy, -rf, rf);
    fig.axis(0, cy - rf, H);
  } else fig.axis(0, 0, H);
  fig.dim('d', [-RN, H], [RN, H], 'b', 5);
  return fig;
}

/** Hex weld nut: a pilot that centers it in the hole and projections that weld it down. */
function weldNut(o: Opts = {}): Fig {
  const fig = new Fig();
  const F = 15;
  const h = 7.6;
  const G = F / C30;
  solid(fig, 0, [[6.1, h], [6.1, h + 1.3]]);
  for (const s of [-1, 1]) fig.poly('body', [[s * (G / 2 - 1.9), h], [s * (G / 2 - 1.5), h + 1.1], [s * (G / 2 - 0.5), h + 1.1], [s * (G / 2 - 0.1), h]]);
  hexSide(fig, 0, 0, F, h);
  bore(fig, 0, h + 1.3);
  const cy = -(GAP + F / 2);
  if (o.top !== false) {
    hexPlan(fig, 0, cy, F, BORE);
    tappedPlan(fig, 0, cy);
    for (const a of [0, 120, 240]) fig.circle('hid', (G / 2 - 1.5) * Math.cos(rad(a)), cy + (G / 2 - 1.5) * Math.sin(rad(a)), 1);
  }
  return finish(fig, o, cy, F / 2, G / 2, h + 1.3);
}

/** A square nut floating in a spring-steel cage that snaps into a square hole. */
function cageNut(o: Opts = {}): Fig {
  const fig = new Fig();
  const hw = 9.5;
  const H = 8.4;
  // Spring legs with lips that catch the back of the panel.
  for (const s of [-1, 1]) fig.poly('body', [[s * hw, 0.9], [s * (hw + 3), 0.9], [s * (hw + 3), -1.6], [s * (hw + 2.1), -1.6], [s * (hw + 2.1), 0], [s * hw, 0]]);
  fig.poly('body', rect(-hw, 0, hw, H));
  fig.poly('thin', [[-hw + 0.9, 0], [-hw + 0.9, H - 0.9], [hw - 0.9, H - 0.9], [hw - 0.9, 0]], false);
  fig.poly('hid', rect(-7, 1.6, 7, H - 2));
  bore(fig, 1.6, H - 2);
  const cy = -(GAP + hw);
  if (o.top !== false) {
    fig.poly('body', [[-hw - 3, cy - 5], [-hw, cy - 5], [-hw, cy - 7.5], [hw, cy - 7.5], [hw, cy - 5], [hw + 3, cy - 5], [hw + 3, cy + 5], [hw, cy + 5], [hw, cy + 7.5], [-hw, cy + 7.5], [-hw, cy + 5], [-hw - 3, cy + 5]]);
    fig.compound('body', [rect(-7, cy - 7, 7, cy + 7), { cx: 0, cy, r: BORE }]);
    tappedPlan(fig, 0, cy);
  }
  return finish(fig, o, cy, 7.5, hw + 3, H);
}

export const nuts: Record<string, (o?: Opts) => Fig> = {
  'hex-nut': hexNut(8.75),
  'lock-nut': lockNut,
  'wing-nut': wingNut,
  'acorn-nut': acornNut,
  'castle-nut': castleNut,
  'coupling-nut': hexNut(30),
  'flange-nut': flangeNut,
  'jam-nut': hexNut(5),
  'square-nut': squareNut,
  't-nut': teeNut,
  'prevailing-torque-nut': torqueNut,
  'knurled-nut': knurledNut,
  'barrel-nut': barrelNut,
  'rivet-nut': rivetNut,
  'weld-nut': weldNut,
  'cage-nut': cageNut,
};

