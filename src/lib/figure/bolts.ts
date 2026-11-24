// Bolts. Headed ones go through the screw builder; bent rod, studs and the
// two-piece sex bolt are drawn here.

import { Fig, arc, type Pt } from './core';
import { anchors } from './anchors';
import { FORMS, RN, cap, drivePlan, mthread, rodOutline, slotted, solid, stadium, threadLines, threaded, type Opts } from './parts';
import { GAP, HEADS, hangerBolt, screw, type ScrewSpec } from './screws';

const S = (spec: ScrewSpec) => (o: Opts = {}) => screw(spec, o);

/** End view of a plain threaded rod, with its center lines. */
function rodPlan(fig: Fig, cx: number, cy: number): void {
  fig.with(([x, y]) => [x + cx, y], () => HEADS.none().plan!.draw(fig, cy));
}

/** A forged eye on a shouldered shank. */
function eyeBolt(o: Opts = {}): Fig {
  const fig = new Fig();
  const ro = 14.5;
  const ri = 7.5;
  const yC = 2 * ro - 1;
  const y0 = yC + 3.2;
  const yTip = y0 + 40;
  const yT0 = yTip - 24;
  const th = mthread(yT0, yTip, { top: 'run', bottom: 'chamfer' });
  solid(fig, 0, [[RN, y0], [RN, yT0], ...th.right], [[RN, y0], [RN, yT0], ...th.left]);
  threadLines(fig, th);
  solid(fig, 0, [[6.5, yC], [9, yC + 1.6], [9, y0]]);
  fig.ring('body', 0, ro, ro, ri);
  if (o.top !== false) {
    const cy = -(GAP + 9);
    fig.circle('body', 0, cy, 9);
    fig.poly('body', stadium(0, cy, ro, 3.6));
    fig.level(cy, -ro, ro);
    fig.axis(0, cy - 9, yTip);
  } else fig.axis(0, 0, yTip);
  fig.level(ro, -ro, ro);
  fig.dim('L', [9, y0], [RN - 1, yTip], 'r', 5, 'Length of the shank, from under the shoulder.');
  fig.dim('d', [-RN, yTip - 5], [RN, yTip - 5], 'b', 5);
  return fig;
}

/** Round rod bent to a U, both legs threaded. Length is taken inside the bend. */
function uBolt(o: Opts = {}): Fig {
  const fig = new Fig();
  const c = 13;
  const yc = c + RN;
  const yL = 58;
  const yT0 = yL - 22;
  const tl = mthread(yT0, yL, { top: 'run', bottom: 'chamfer', cx: -c });
  const tr = mthread(yT0, yL, { top: 'run', bottom: 'chamfer', cx: c });
  const X = (cx: number, s: number, prof: Pt[]): Pt[] => prof.map(([r, y]) => [cx + s * r, y] as Pt);
  fig.poly('body', [
    ...X(-c, -1, tl.left).reverse(),
    ...arc(0, yc, c + RN, c + RN, 180, 360),
    ...X(c, 1, tr.right),
    ...X(c, -1, tr.left).reverse(),
    ...arc(0, yc, c - RN, c - RN, 360, 180),
    ...X(-c, 1, tl.right),
  ]);
  threadLines(fig, tl);
  threadLines(fig, tr);
  if (o.top !== false) {
    const cy = -(GAP + RN);
    fig.poly('body', stadium(0, cy, c + RN, RN));
    fig.level(cy, -c - RN, c + RN);
    fig.axis(-c, cy - RN, yL);
    fig.axis(c, cy - RN, yL);
  } else {
    fig.axis(-c, yc, yL);
    fig.axis(c, yc, yL);
  }
  fig.dim('L', [0, 2 * RN], [c + RN - 1, yL], 'r', 5, 'Taken inside the bend, to the end of the leg.');
  fig.dim('d', [c - RN, yL - 6], [c + RN, yL - 6], 'b', 5);
  return fig;
}

/** A straight threaded shank ending in a hook (J) or a right-angle leg (L), cast into concrete. */
function hookBolt(kind: 'j' | 'l', o: Opts = {}): Fig {
  const fig = new Fig();
  const yT1 = 24;
  const th = mthread(0, yT1, { top: 'chamfer', bottom: 'run' });
  let center: Pt[];
  let bottom: number;
  let reach: number;
  if (kind === 'j') {
    const hr = 9;
    const yb = 50;
    center = [[0, yT1], ...arc(-hr, yb, hr, hr, 0, 180), [-2 * hr, yb - 7]];
    bottom = yb + hr + RN;
    reach = 2 * hr + RN;
  } else {
    const br = 7;
    const yb = 58;
    center = [[0, yT1], ...arc(-br, yb - br, br, br, 0, 90), [-24, yb]];
    bottom = yb + RN;
    reach = 24;
  }
  fig.poly('body', [...th.left.map(([r, y]) => [-r, y] as Pt), ...rodOutline(center, RN), ...th.right.map(([r, y]) => [r, y] as Pt).reverse()]);
  threadLines(fig, th);
  if (o.top !== false) {
    const cy = -(GAP + RN);
    fig.poly('body', stadium((RN - reach) / 2, cy, (RN + reach) / 2, RN));
    rodPlan(fig, 0, cy);
    fig.level(cy, -reach, RN);
    fig.axis(0, cy - RN, yT1 + 6);
    fig.dim('d', [-RN, cy], [RN, cy], 't', 5);
  } else fig.axis(0, 0, yT1 + 6);
  fig.dim('L', [RN - 1, 0], [0, bottom], 'r', 5, 'Measured overall, bend included.');
  return fig;
}

/** Threaded both ends, plain between: takes a nut at each end. */
function studBolt(o: Opts = {}): Fig {
  const fig = new Fig();
  const L = 54;
  const a = mthread(0, 19, { top: 'chamfer', bottom: 'run' });
  const b = mthread(L - 19, L, { top: 'run', bottom: 'chamfer' });
  solid(fig, 0, [...a.right, ...b.right], [...a.left, ...b.left]);
  threadLines(fig, a);
  threadLines(fig, b);
  if (o.top !== false) {
    const cy = -(GAP + RN);
    rodPlan(fig, 0, cy);
    fig.level(cy, -RN, RN);
    fig.axis(0, cy - RN, L);
  } else fig.axis(0, 0, L);
  fig.dim('L', [RN - 1, 0], [RN - 1, L], 'r', 5, 'Measured overall.');
  fig.dim('d', [-RN, L - 6], [RN, L - 6], 'b', 5);
  return fig;
}

/** A barrel with an internal thread and the screw that closes it, drawn apart on one axis. */
function sexBolt(o: Opts = {}): Fig {
  const fig = new Fig();
  const head: Pt[] = [...cap(8.2, 2.2), [8.2, 2.9]];
  const yB1 = 2.9 + 24;
  solid(fig, 0, [[RN, 2.9], [RN, yB1 - 0.5], [RN - 0.5, yB1]]);
  fig.segs('hid', [
    [[-3.9, 6], [-3.9, yB1]],
    [[3.9, 6], [3.9, yB1]],
  ]);
  solid(fig, 0, slotted(head, 0.85, 1.6));
  // The screw is the same drawing turned end for end.
  const tip = yB1 + 5;
  const far = tip + 17.4;
  fig.with(
    ([x, y]) => [-x, far - y],
    () => {
      threaded(fig, mthread(2.9, 17.4, { bottom: 'chamfer', R: 3.9, form: FORMS.fine }));
      solid(fig, 0, slotted(head, 0.85, 1.6));
    },
  );
  if (o.top !== false) {
    const cy = -(GAP + 8.2);
    fig.circle('body', 0, cy, 8.2);
    drivePlan(fig, 'slotted', 0, cy, 8.2);
    fig.level(cy, -8.2, 8.2);
    fig.axis(0, cy - 8.2, far);
  } else fig.axis(0, 0, far);
  fig.dim('L', [8.2, 2.9], [RN, yB1], 'r', 5, 'Length of the barrel, from under its head.');
  return fig;
}

export const bolts: Record<string, (o?: Opts) => Fig> = {
  'hex-bolt': S({ head: 'hex', drive: 'hex', L: 54, tl: 27 }),
  'carriage-bolt': S({ head: 'carriage', L: 50, tl: 26, neck: 5 }),
  'lag-bolt': S({ head: 'laghex', drive: 'hex', L: 56, thread: 'lag', tl: 36, point: 'sharp' }),
  'eye-bolt': eyeBolt,
  'u-bolt': uBolt,
  'j-bolt': (o) => hookBolt('j', o),
  'l-bolt': (o) => hookBolt('l', o),
  'flange-bolt': S({ head: 'hexflange', drive: 'hex', L: 34 }),
  'stud-bolt': studBolt,
  'elevator-bolt': S({ head: 'elevator', L: 36, tl: 22, neck: 5 }),
  'shoulder-bolt': S({ head: 'lowsocket', drive: 'hex', af: 3.2, L: 34, shoulder: { r: 6.5, len: 20 } }),
  'sex-bolt': sexBolt,
  'plow-bolt': S({ head: 'plow', L: 42, tl: 24, neck: 5 }),
  'hanger-bolt': hangerBolt,
  'structural-bolt': S({ head: 'heavyhex', drive: 'hex', L: 46, tl: 15 }),
  't-bolt': S({ head: 'tee', L: 40, tl: 26 }),
  'toggle-bolt': (o) => anchors['toggle-bolt'](o),
};
