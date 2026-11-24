// Washers: the view from above, and under it either a section through the
// center or, where the shape is in the edge, an elevation.
//
// A cut face is lined at 45 degrees. One too thin to line is filled solid,
// which is how drafting standards treat sheet metal and gaskets, and a part
// that is not metal is lined both ways.

import { Fig, arc, rect, type Pt } from './core';
import { RN, rodOutline, type Opts } from './parts';
import { GAP } from './screws';

const rad = (deg: number) => (deg * Math.PI) / 180;

interface Frame {
  ro: number;
  ri: number;
  /** Extent of the lower view. */
  y0: number;
  y1: number;
  /** The two faces the thickness is measured between. */
  t0: number;
  t1: number;
}

function done(fig: Fig, o: Opts, cy: number, m: Frame): Fig {
  if (o.top !== false) {
    fig.level(cy, -m.ro, m.ro);
    fig.axis(0, cy - m.ro, m.y1);
    fig.dim('OD', [-m.ro, cy], [m.ro, cy], 't', 5);
  } else fig.axis(0, m.y0, m.y1);
  fig.dim('ID', [-m.ri, m.y1], [m.ri, m.y1], 'b', 5);
  fig.dim('T', [m.ro, m.t0], [m.ro, m.t1], 'r', 5);
  return fig;
}

/** Section of a flat ring: two cut faces and the far edges of the hole between them. */
function ringSection(fig: Fig, ri: number, ro: number, T: number): void {
  for (const s of [-1, 1]) {
    const face = rect(Math.min(s * ri, s * ro), 0, Math.max(s * ri, s * ro), T);
    if (T < 2.4) fig.poly('ink', face);
    else fig.cut(face);
  }
  fig.segs('edge', [
    [[-ri, 0], [ri, 0]],
    [[-ri, T], [ri, T]],
  ]);
}

function flat(ro: number, ri: number, T: number) {
  return (o: Opts = {}): Fig => {
    const fig = new Fig();
    ringSection(fig, ri, ro, T);
    const cy = -(GAP + ro);
    if (o.top !== false) fig.ring('body', 0, cy, ro, ri);
    return done(fig, o, cy, { ro, ri, y0: 0, y1: T, t0: 0, t1: T });
  };
}

/** One turn of spring wire, cut through and sprung apart by its own thickness. */
function splitLock(o: Opts = {}): Fig {
  const fig = new Fig();
  fig.says('From above, and edge-on below.');
  const ro = 9;
  const ri = 5.4;
  const T = 2.6;
  // The far half of the ring sits level; the near half climbs to the split.
  fig.poly('body', rect(-ro, T / 2, ro, T * 1.5));
  fig.poly('body', [[-ro, T / 2], [-0.5, 0], [-0.5, T], [-ro, T * 1.5]]);
  fig.poly('body', [[0.5, T], [ro, T / 2], [ro, T * 1.5], [0.5, T * 2]]);
  const cy = -(GAP + ro);
  if (o.top !== false) fig.poly('body', [...arc(0, cy, ro, ro, 95, 445, 44), ...arc(0, cy, ri, ri, 439, 89, 44)]);
  return done(fig, o, cy, { ro, ri, y0: 0, y1: T * 2, t0: T / 2, t1: T * 1.5 });
}

/** A pair of washers: cams on the faces that meet, fine teeth on the faces that bear. */
function wedgeLock(o: Opts = {}): Fig {
  const fig = new Fig();
  fig.says('From above, with the pair seen edge-on below.');
  const ro = 10;
  const ri = 5.4;
  const T = 3.6;
  fig.poly('body', rect(-ro, 0, ro, T));
  const cam: Pt[] = [];
  for (let x = -ro; x < ro; x += 4) cam.push([x, T / 2 + 0.5], [Math.min(ro, x + 4), T / 2 - 0.5]);
  fig.poly('edge', cam, false);
  const teeth: [Pt, Pt][] = [];
  for (let x = -ro + 0.6; x < ro - 0.2; x += 1.1) {
    teeth.push([[x, 0], [x + 0.4, 0.55]]);
    teeth.push([[x, T], [x + 0.4, T - 0.55]]);
  }
  fig.segs('thin', teeth);
  const cy = -(GAP + ro);
  if (o.top !== false) {
    fig.ring('body', 0, cy, ro, ri);
    const rays: [Pt, Pt][] = [];
    for (let a = 0; a < 360; a += 7.5) rays.push([[(ri + 0.9) * Math.cos(rad(a)), cy + (ri + 0.9) * Math.sin(rad(a))], [(ro - 0.7) * Math.cos(rad(a)), cy + (ro - 0.7) * Math.sin(rad(a))]]);
    fig.segs('thin', rays);
  }
  return done(fig, o, cy, { ro, ri, y0: 0, y1: T, t0: 0, t1: T });
}

/** Outline of a ring of teeth: flat tips at rTip, roots at rRoot. */
function teeth(cy: number, rRoot: number, rTip: number, n: number): Pt[] {
  const pitch = 360 / n;
  const out: Pt[] = [];
  const at = (a: number, r: number): Pt => [r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
  for (let i = 0; i < n; i++) {
    const a = i * pitch;
    out.push(at(a - pitch * 0.3, rRoot), at(a - pitch * 0.17, rTip), at(a + pitch * 0.17, rTip), at(a + pitch * 0.3, rRoot), at(a + pitch * 0.5, rRoot));
  }
  return out;
}

/** Tooth lock washers. Each tooth is twisted out of flat, so it stands proud of the rim. */
function toothLock(external: boolean) {
  return (o: Opts = {}): Fig => {
    const fig = new Fig();
    fig.says('From above, and edge-on below.');
    const ro = external ? 10.6 : 9.6;
    const ri = 5.4;
    const T = 1.2;
    const lift = 0.75;
    const twist: [Pt, Pt][] = [];
    const span = external ? ro - 0.4 : 4.6;
    for (let x = -span; x <= span + 0.01; x += external ? 2.1 : 1.84) twist.push([[x - 0.45, 0], [x + 0.45, T + 2 * lift]]);
    fig.segs('edge', twist);
    const rim = external ? 7.9 : ro;
    fig.poly('ink', rect(-rim, lift, rim, lift + T));
    const cy = -(GAP + ro);
    if (o.top !== false) {
      if (external) fig.compound('body', [teeth(cy, 7.9, ro, 12), { cx: 0, cy, r: ri }]);
      else fig.compound('body', [{ cx: 0, cy, r: ro }, teeth(cy, 7.4, ri, 10)]);
    }
    return done(fig, o, cy, { ro, ri, y0: 0, y1: T + 2 * lift, t0: lift, t1: lift + T });
  };
}

/** A coned disc. Flattening it under load is what makes it a spring. */
function belleville(o: Opts = {}): Fig {
  const fig = new Fig();
  const ro = 11;
  const ri = 5.5;
  const h = 3;
  const t = 1.8;
  for (const s of [-1, 1]) fig.poly('ink', [[s * ri, 0], [s * ro, h], [s * ro, h + t], [s * ri, t]]);
  fig.segs('edge', [
    [[-ri, 0], [ri, 0]],
    [[-ri, t], [ri, t]],
  ]);
  const cy = -(GAP + ro);
  if (o.top !== false) fig.ring('body', 0, cy, ro, ri);
  return done(fig, o, cy, { ro, ri, y0: 0, y1: h + t, t0: h, t1: h + t });
}

/** A ring pressed into three waves, seen edge-on: the far side shows between the crests. */
function wave(o: Opts = {}): Fig {
  const fig = new Fig();
  fig.says('From above, and edge-on below.');
  const ro = 10.5;
  const ri = 6.6;
  const A = 1.5;
  const t = 0.9;
  const mid = A + t / 2;
  const edge = (a0: number, a1: number): Pt[] => {
    const top: Pt[] = [];
    const bottom: Pt[] = [];
    for (let i = 0; i <= 36; i++) {
      const a = a0 + ((a1 - a0) * i) / 36;
      const x = ro * Math.cos(rad(a));
      const z = A * Math.sin(rad(3 * a));
      top.push([x, mid - z - t / 2]);
      bottom.push([x, mid - z + t / 2]);
    }
    return [...top, ...bottom.reverse()];
  };
  fig.poly('body', edge(180, 360));
  fig.poly('body', edge(0, 180));
  const cy = -(GAP + ro);
  if (o.top !== false) fig.ring('body', 0, cy, ro, ri);
  return done(fig, o, cy, { ro, ri, y0: 0, y1: 2 * A + t, t0: mid - t / 2, t1: mid + t / 2 });
}

/** A pressed cup that seats a countersunk head above the surface. The head is shown in phantom. */
function finishing(o: Opts = {}): Fig {
  const fig = new Fig();
  fig.says('From above, and cut through the middle below. The dashed outline is a flat-head screw sitting in it.');
  const ro = 11;
  const ri = 5.6;
  const H = 3.5;
  const sheet: Pt[] = [[ro, H - 0.1], [10.7, 2.3], [10, 1.15], [9, 0.6], [8.2, 0.62], [ri + 0.2, H - 0.25]];
  for (const s of [-1, 1]) fig.poly('ink', rodOutline(sheet.map(([x, y]) => [s * x, y] as Pt), 0.5));
  fig.poly('phantom', [[-RN, H + 6], [-RN, H], [-8.4, 0.2], [8.4, 0.2], [RN, H], [RN, H + 6]], false);
  const cy = -(GAP + ro);
  if (o.top !== false) {
    fig.ring('body', 0, cy, ro, ri);
    fig.circle('thin', 0, cy, 8.7);
  }
  return done(fig, o, cy, { ro, ri, y0: 0, y1: H, t0: 0, t1: H });
}

/** A flanged nylon sleeve that keeps a bolt from touching the part it passes through. */
function shoulder(o: Opts = {}): Fig {
  const fig = new Fig();
  const ro = 10;
  const ri = 5.3;
  const rs = 7.2;
  const T = 1.7;
  const H = 6.2;
  for (const s of [-1, 1]) {
    const face: Pt[] = [[s * ri, 0], [s * ro, 0], [s * ro, T], [s * rs, T], [s * rs, H], [s * ri, H]];
    fig.poly('soft', face).hatch(face, 1.5, 45).hatch(face, 1.5, 135);
  }
  fig.segs('edge', [
    [[-ri, 0], [ri, 0]],
    [[-ri, H], [ri, H]],
  ]);
  const cy = -(GAP + ro);
  if (o.top !== false) {
    fig.ring('soft', 0, cy, ro, ri);
    fig.circle('hid', 0, cy, rs);
  }
  return done(fig, o, cy, { ro, ri, y0: 0, y1: H, t0: 0, t1: T });
}

/** A steel washer with a rubber seal bonded to its underside and up into the hole. */
function sealing(o: Opts = {}): Fig {
  const fig = new Fig();
  const ro = 10.5;
  const rm = 6.3;
  const ri = 5;
  const tm = 1.4;
  const H = 3.2;
  for (const s of [-1, 1]) {
    fig.poly('soft', [[s * ri, 0.3], [s * rm, 0.3], [s * rm, tm], [s * (ro - 0.6), tm], [s * (ro - 1.2), H], [s * ri, H]]);
    fig.poly('ink', rect(Math.min(s * rm, s * ro), 0, Math.max(s * rm, s * ro), tm));
  }
  const cy = -(GAP + ro);
  if (o.top !== false) {
    fig.ring('body', 0, cy, ro, rm);
    fig.ring('soft', 0, cy, rm, ri);
  }
  return done(fig, o, cy, { ro, ri, y0: 0, y1: H, t0: 0, t1: H });
}

export const washers: Record<string, (o?: Opts) => Fig> = {
  'flat-washer': flat(11.5, 5.5, 1.8),
  'lock-washer': splitLock,
  'fender-washer': flat(19, 5.5, 1.3),
  'belleville-washer': belleville,
  'star-washer': toothLock(false),
  'external-tooth-washer': toothLock(true),
  'wave-washer': wave,
  'finishing-washer': finishing,
  'shoulder-washer': shoulder,
  'sealing-washer': sealing,
  'dock-washer': flat(17, 5.6, 4),
  'nord-lock-washer': wedgeLock,
};
