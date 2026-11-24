// Anchors. Most are assemblies, and what matters about each is how it grips:
// a wing that opens, a sleeve that collapses, a cone that spreads a clip. So
// the hollow ones are drawn in section, and a part that moves is shown in its
// other position in phantom line.

import { Fig, rect, rot, type Pt } from './core';
import { teeNut } from './nuts';
import { BORE, FORMS, RN, cap, dome, drivePlan, hexPlan, hexSide, knurl, mthread, slotted, solid, tappedPlan, thread, threadLines, threaded, type Form, type Opts } from './parts';
import { GAP, HEADS, screw } from './screws';

function centers(fig: Fig, o: Opts, cy: number, ext: number, half: number, bottom: number, top = 0): void {
  if (o.top !== false) {
    fig.level(cy, -half, half);
    fig.axis(0, cy - ext, bottom);
  } else fig.axis(0, top, bottom);
}

/** End of a threaded stud seen from above. */
function studEnd(fig: Fig, cy: number, r = RN): void {
  fig.circle('body', 0, cy, r);
  fig.poly(
    'thin',
    Array.from({ length: 37 }, (_, i) => {
      const a = ((-62 + (270 * i) / 36) * Math.PI) / 180;
      return [(r - 0.9) * Math.cos(a), cy + (r - 0.9) * Math.sin(a)] as Pt;
    }),
    false,
  );
}

/** A machine screw carrying spring wings. Folded (phantom) they pass through the hole; open, they bear on the back of the wall. */
export function toggleBolt(o: Opts = {}): Fig {
  const fig = new Fig();
  fig.says('From the side and from above. The dashed outline is the wings folded to pass through the hole.');
  const H = 6.8;
  const rO = 8.7;
  const yTip = H + 62;
  const yP = H + 42;
  threaded(fig, mthread(H, yTip, { bottom: 'chamfer' }));
  solid(fig, 0, slotted(dome(rO, H)));
  const wing: Pt[] = [[-1, -3.1], [22.5, -3.1], [24.5, -1.2], [24.5, 3.1], [-1, 3.1]];
  const at = (s: number, deg: number) => (p: Pt): Pt => {
    const [x, y] = rot([p], deg)[0];
    return [s * x, yP + y];
  };
  for (const s of [1, -1]) {
    fig.with(at(s, -79), () => fig.poly('phantom', wing, false));
    fig.with(at(s, -28), () => {
      fig.poly('body', wing);
      fig.seg('thin', [2.5, 1.3], [23.8, 1.3]);
    });
  }
  fig.circle('body', 0, yP, 3.4);
  fig.circle('thin', 0, yP, 1.3);
  const cy = -(GAP + rO);
  if (o.top !== false) {
    fig.poly('body', rect(-21.6, cy - 3.1, 21.6, cy + 3.1));
    fig.circle('body', 0, cy, rO);
    drivePlan(fig, 'slotted', 0, cy, rO);
  }
  centers(fig, o, cy, rO, 21.6, yTip);
  fig.dim('L', [rO, H], [RN - 1, yTip], 'r', 5, 'Length of the screw, from under its head.');
  fig.dim('d', [-RN, yTip - 5], [RN, yTip - 5], 'b', 5);
  return fig;
}

/** A metal channel on two plastic straps. The channel goes through the hole end-on, then the cap slides down the straps to clamp the wall. */
function snapToggle(o: Opts = {}): Fig {
  const fig = new Fig();
  const yCap = 22;
  const yCh = 54;
  const ticks: [Pt, Pt][] = [];
  for (const s of [-1, 1]) {
    fig.poly('soft', rect(s * 3.5 - 0.9, 0, s * 3.5 + 0.9, yCh + 1));
    for (let y = 2.5; y < yCh - 3; y += 2.3) ticks.push([[s * 3.5 - 0.9, y], [s * 3.5 + 0.9, y]]);
  }
  fig.segs('thin', ticks);
  fig.poly('soft', [[-9, yCap], [9, yCap], [9, yCap + 1.7], [5.5, yCap + 1.7], [5.5, yCap + 6.6], [-5.5, yCap + 6.6], [-5.5, yCap + 1.7], [-9, yCap + 1.7]]);
  fig.poly('body', [[-17, yCh + 0.8], [-16.2, yCh], [16.2, yCh], [17, yCh + 0.8], [17, yCh + 5.4], [-17, yCh + 5.4]]);
  fig.segs('hid', [
    [[-RN, yCh], [-RN, yCh + 5.4]],
    [[RN, yCh], [RN, yCh + 5.4]],
  ]);
  const cy = -(GAP + 9);
  if (o.top !== false) {
    fig.poly('body', rect(-17, cy - 3.6, 17, cy + 3.6));
    fig.ring('soft', 0, cy, 9, 4.3);
  }
  centers(fig, o, cy, 9, 17, yCh + 5.4);
  fig.dim('d', [-RN, yCh + 5.4], [RN, yCh + 5.4], 'b', 5);
  return fig;
}

/** A split, barbed plastic plug. The screw wedges the halves apart. */
function plasticAnchor(o: Opts = {}): Fig {
  const fig = new Fig();
  const L = 40;
  const rAt = (y: number) => 6 - (y / L) * 2.3;
  const prof: Pt[] = [[7.3, 0], [7.3, 1.6], [rAt(1.6), 1.6]];
  for (let y = 4.4; y < 19; y += 3) prof.push([rAt(y), y], [rAt(y) + 1, y]);
  prof.push([rAt(22), 22], [rAt(L - 2.5), L - 2.5], [2.4, L]);
  for (const s of [-1, 1]) fig.poly('soft', [[s * 5.6, 1.6], [s * 9, 1.6], [s * 5.4, 8.5]]);
  solid(fig, 0, prof, prof, 'soft');
  fig.poly('thin', [[-0.55, L], [-0.55, 17], [0, 16], [0.55, 17], [0.55, L]], false);
  fig.segs('hid', [
    [[-2.3, 0], [-0.9, 15.5]],
    [[2.3, 0], [0.9, 15.5]],
  ]);
  const cy = -(GAP + 7.3);
  if (o.top !== false) {
    fig.poly('soft', rect(-9, cy - 0.65, 9, cy + 0.65));
    fig.ring('soft', 0, cy, 7.3, 2.3);
  }
  centers(fig, o, cy, 7.3, 9, L);
  fig.dim('L', [7.3, 0], [2.4, L], 'r', 5, 'Measured overall.');
  fig.dim('d', [-rAt(22), 22], [rAt(22), 22], 'b', 5);
  return fig;
}

/** A ribbed lead sleeve. The screw swells the soft metal against the hole. */
function leadAnchor(o: Opts = {}): Fig {
  const fig = new Fig();
  const L = 30;
  const r = 6;
  solid(fig, 0, [[r - 0.5, 0], [r, 0.5], [r, L - 4], [r - 1.3, L]]);
  knurl(fig, 0, r, 1.6, L - 5, 16);
  fig.poly('thin', [[-0.5, L], [-0.5, L - 9.5], [0.5, L - 9.5], [0.5, L]], false);
  fig.segs('hid', [
    [[-2.6, 0], [-1.3, L - 10]],
    [[2.6, 0], [1.3, L - 10]],
  ]);
  const cy = -(GAP + r);
  if (o.top !== false) fig.ring('body', 0, cy, r, 2.6);
  centers(fig, o, cy, r, r, L);
  fig.dim('L', [r, 0], [r - 1.3, L], 'r', 5, 'Measured overall.');
  fig.dim('d', [-r, L - 6], [r, L - 6], 'b', 5);
  return fig;
}

/** A stud with a cone at the foot. Tightening the nut draws the cone up into the clip, which bites the hole. */
function wedgeAnchor(o: Opts = {}): Fig {
  const fig = new Fig();
  const L = 62;
  const yT1 = 27;
  const yN0 = 47.5;
  const yN1 = 54.5;
  const th = mthread(0, yT1, { top: 'chamfer', bottom: 'run' });
  const tail: Pt[] = [[RN, yN0], [3.5, yN0 + 0.7], [3.5, yN1], [RN, yN1 + 4.6], [RN, L - 0.6], [RN - 0.6, L]];
  solid(fig, 0, [...th.right, ...tail], [...th.left, ...tail]);
  threadLines(fig, th);
  fig.poly('body', rect(-RN - 0.2, yN0 + 1, RN + 0.2, yN1 - 0.4));
  fig.segs('thin', [
    [[-0.6, yN0 + 1], [-0.6, yN1 - 0.4]],
    [[0.6, yN0 + 1], [0.6, yN1 - 0.4]],
  ]);
  fig.poly('body', rect(-10.5, 11.8, 10.5, 13.4));
  hexSide(fig, 0, 3.4, 15, 8.4, { bottom: true });
  const cy = -(GAP + 10.5);
  if (o.top !== false) {
    fig.circle('body', 0, cy, 10.5);
    hexPlan(fig, 0, cy, 15);
    studEnd(fig, cy);
  }
  centers(fig, o, cy, 10.5, 10.5, L);
  fig.dim('L', [RN - 1, 0], [RN - 0.6, L], 'r', 5, 'Measured overall.');
  fig.dim('d', [-RN, 40], [RN, 40], 'b', 5);
  return fig;
}

/** A stud through a split sleeve. The nut draws the flared end up and spreads the sleeve along its length. */
function sleeveAnchor(o: Opts = {}): Fig {
  const fig = new Fig();
  const rs = 3.9;
  const F = 11.7;
  const yW = 9.6;
  const yS0 = yW + 1.5;
  const yS1 = 50;
  const yEnd = 57;
  threaded(fig, mthread(0, yS0, { top: 'chamfer', R: rs, form: FORMS.fine }));
  solid(fig, 0, [[3, yS1 - 1], [RN, yS1 + 4.4], [RN, yEnd - 0.6], [RN - 0.6, yEnd]]);
  solid(fig, 0, [[RN, yS0], [RN, yS1]]);
  fig.segs('thin', [
    [[-2.3, yS1 - 14], [-2.3, yS1]],
    [[2.3, yS1 - 14], [2.3, yS1]],
    [[-RN, yS1 - 16.5], [RN, yS1 - 16.5]],
  ]);
  fig.poly('body', rect(-8.2, yW, 8.2, yS0));
  hexSide(fig, 0, 3.2, F, yW - 3.2, { bottom: true });
  const cy = -(GAP + 8.2);
  if (o.top !== false) {
    fig.circle('body', 0, cy, 8.2);
    hexPlan(fig, 0, cy, F);
    studEnd(fig, cy, rs);
  }
  centers(fig, o, cy, 8.2, 8.2, yEnd);
  fig.dim('L', [8.2, yS0], [RN - 0.6, yEnd], 'r', 5);
  fig.dim('d', [-RN, 30], [RN, 30], 'b', 5);
  return fig;
}

/** Drawn in section. The plug inside is driven down with a setting tool and spreads the slotted end. */
function dropIn(o: Opts = {}): Fig {
  const fig = new Fig();
  fig.says('Cut down the middle to show the inside, with the view from above.');
  const ro = 6.6;
  const L = 40;
  const yT = 18;
  const wall: Pt[] = [[BORE, 0], [ro - 0.5, 0], [ro, 0.5], [ro, L], [2.7, L], [3.9, yT + 2], [BORE, yT]];
  for (const s of [-1, 1]) {
    fig.cut(wall.map(([x, y]) => [s * x, y] as Pt));
    fig.seg('thin', [s * RN, 0], [s * RN, yT - 0.6]);
  }
  fig.segs('edge', [
    [[-BORE, 0], [BORE, 0]],
    [[-2.7, L], [2.7, L]],
  ]);
  fig.seg('thin', [-BORE, yT], [BORE, yT]);
  fig.cut([[-3.75, yT + 3], [3.75, yT + 3], [3.3, yT + 11.5], [-3.3, yT + 11.5]], 1.5, 135);
  const cy = -(GAP + ro);
  if (o.top !== false) {
    fig.ring('body', 0, cy, ro, BORE);
    tappedPlan(fig, 0, cy);
    fig.dim('d', [-RN, cy], [RN, cy], 't', 5, 'The thread it accepts.');
  }
  centers(fig, o, cy, ro, ro, L);
  fig.dim('L', [ro, 0], [ro, L], 'r', 5, 'Measured overall.');
  return fig;
}

/** A screw in a slotted sleeve. Tightening pulls the far end up and folds the legs flat behind the wall (phantom). */
function molly(sleeve: number) {
  return (o: Opts = {}): Fig => {
    const fig = new Fig();
    const H = 5.6;
  fig.says('From the side and from above. The dashed outline is the legs folded behind the wall.');
    const rO = 8.4;
    const rf = 11;
    const rs = 6.6;
    const y0 = H + 1;
    const y1 = y0 + sleeve;
    const yTip = y1 + 5;
    const s0 = y0 + sleeve * 0.14;
    const s1 = y1 - Math.min(7.5, sleeve * 0.36);
    threaded(fig, mthread(y1 - 1, yTip, { bottom: 'chamfer' }));
    solid(fig, 0, [[rs, y0], [rs, y1 - 1.3], [rs - 1.3, y1]]);
    fig.poly('thin', rect(-0.75, s0, 0.75, s1));
    fig.segs('thin', [
      [[-5.2, s0], [-5.2, s1]],
      [[5.2, s0], [5.2, s1]],
      [[-rs, s1 + 1.2], [rs, s1 + 1.2]],
    ]);
    const reach = (s1 - s0) * 0.48;
    for (const s of [-1, 1]) {
      fig.poly('phantom', [[s * rs, s0], [s * (rs + reach), s0 + reach * 0.28], [s * rs, s0 + reach * 0.62]], false);
      fig.poly('body', [[s * 8.5, y0], [s * 10.3, y0], [s * 9.4, y0 + 2.7]]);
    }
    fig.poly('body', rect(-rf, H, rf, y0));
    solid(fig, 0, dome(rO, H));
    const cy = -(GAP + rf);
    if (o.top !== false) {
      fig.circle('body', 0, cy, rf);
      fig.circle('body', 0, cy, rO);
      drivePlan(fig, 'phillips', 0, cy, rO);
    }
    centers(fig, o, cy, rf, rf, yTip);
    fig.dim('d', [-RN, yTip - 1.5], [RN, yTip - 1.5], 'b', 5);
    return fig;
  };
}

/** A stubby plastic screw with a drill point: it cuts its own hole in drywall and its thread holds the board. */
function selfDrilling(o: Opts = {}): Fig {
  const fig = new Fig();
  const form: Form = { p: 6.4, depth: 3.4, w: 0.16 };
  const y0 = 1.5;
  const y1 = 25;
  const yTip = 37;
  const core = (y: number) => 5.6 - ((y - y0) / (y1 - y0)) * 2.1;
  const th = thread({ y0, y1, form, phase: 0.55, R: (y) => core(y) + 3.4 * Math.min(1, (y1 - y) / 7 + 0.15), r: core });
  const tip: Pt[] = [[3.3, y1 + 0.8], [2.9, y1 + 4], [0.9, yTip - 1.2], [0, yTip]];
  solid(fig, 0, [...th.right, ...tip], [...th.left, ...tip], 'soft');
  threadLines(fig, th);
  fig.seg('thin', [0, y1 + 2.5], [0, yTip - 1.5]);
  fig.poly('soft', [[-9.6, 0.5], [-9.1, 0], [9.1, 0], [9.6, 0.5], [9.6, 1.6], [-9.6, 1.6]]);
  const cy = -(GAP + 9.6);
  if (o.top !== false) {
    fig.circle('soft', 0, cy, 9.6);
    drivePlan(fig, 'phillips', 0, cy, 9.6, 4.6);
  }
  centers(fig, o, cy, 9.6, 9.6, yTip);
  fig.dim('L', [9.6, 0], [0, yTip], 'r', 5, 'Measured overall.');
  return fig;
}

/** Drawn in section. Knife threads outside cut into wood; a machine thread inside takes the bolt. */
function threadedInsert(o: Opts = {}): Fig {
  const fig = new Fig();
  fig.says('Cut down the middle to show the inside, with the view from above.');
  const L = 20;
  const rc = 6.3;
  const Rm = 8.2;
  const form: Form = { p: 4.2, depth: Rm - rc, w: 0.17 };
  const th = thread({
    y0: 1.2,
    y1: L - 1.2,
    form,
    phase: 0.45,
    R: (y) => Math.min(Rm, rc + 0.1 + (y - 1.2) * 1.3, rc + 0.1 + (L - 1.2 - y) * 0.75),
    r: () => rc,
  });
  fig.cut([[BORE, 0], [rc, 0], ...th.right, [rc, L], [BORE, L]]);
  fig.cut([[-BORE, 0], [-rc, 0], ...th.left.map(([r, y]) => [-r, y] as Pt), [-rc, L], [-BORE, L]]);
  fig.segs('thin', [
    [[-RN, 0], [-RN, L]],
    [[RN, 0], [RN, L]],
  ]);
  fig.segs('edge', [
    [[-BORE, 0], [BORE, 0]],
    [[-BORE, L], [BORE, L]],
  ]);
  const cy = -(GAP + Rm);
  if (o.top !== false) {
    fig.ring('body', 0, cy, rc, BORE);
    fig.circle('thin', 0, cy, Rm);
    tappedPlan(fig, 0, cy);
    fig.dim('d', [-RN, cy], [RN, cy], 't', 5, 'The thread it accepts.');
  }
  centers(fig, o, cy, Rm, Rm, L);
  fig.dim('L', [rc, 0], [rc, L], 'r', 5 + (Rm - rc), 'Measured overall.');
  return fig;
}

/** A soft-metal body with a steel pin. Driving the pin flush spreads the split end. */
function hammerDrive(o: Opts = {}): Fig {
  const fig = new Fig();
  const H = 3.1;
  const rO = 8.4;
  const yEnd = H + 34;
  const top = -6.8;
  fig.poly('body', rect(-1.4, top + 1.3, 1.4, 0.6));
  fig.poly('body', rect(-3.2, top, 3.2, top + 1.3));
  solid(fig, 0, [[RN, H], [RN, yEnd - 1], [RN - 1, yEnd]]);
  fig.poly('thin', [[-0.5, yEnd], [-0.5, H + 19], [0.5, H + 19], [0.5, yEnd]], false);
  fig.poly('hid', [[-1.4, H], [-1.4, H + 13], [0, H + 16], [1.4, H + 13], [1.4, H]], false);
  solid(fig, 0, [...cap(rO, 2.4), [rO, H]]);
  const cy = top - (GAP + rO);
  if (o.top !== false) {
    fig.circle('body', 0, cy, rO);
    fig.circle('body', 0, cy, 3.2);
  }
  if (o.top !== false) {
    fig.level(cy, -rO, rO);
    fig.axis(0, cy - rO, yEnd);
  } else fig.axis(0, top, yEnd);
  fig.dim('L', [rO, H], [RN - 1, yEnd], 'r', 5);
  fig.dim('d', [-RN, H + 10], [RN, H + 10], 'b', 5);
  return fig;
}

/** One piece of steel, split and sprung apart. Driven into a hole, the halves are squeezed straight and push back. */
function splitDrive(o: Opts = {}): Fig {
  const fig = new Fig();
  const hd = HEADS.flat();
  const L = 40;
  const prof: Pt[] = [];
  for (let y = hd.H; y <= L - 1 + 0.01; y += 1.5) prof.push([RN + (y > 19 && y < 38 ? Math.sin(((y - 19) / 19) * Math.PI) : 0), Math.min(y, L - 1)]);
  prof.push([RN - 1, L]);
  solid(fig, 0, prof);
  const lens: Pt[] = [];
  for (let y = 14; y <= L; y += 2) lens.push([Math.sin(((y - 14) / (L - 14)) * Math.PI * 0.86) * 1.05, y]);
  fig.poly('thin', [...lens, ...lens.map(([x, y]) => [-x, y] as Pt).reverse()], false);
  solid(fig, 0, hd.prof!);
  const cy = -(GAP + hd.rO);
  if (o.top !== false) fig.circle('body', 0, cy, hd.rO);
  centers(fig, o, cy, hd.rO, hd.rO, L);
  fig.dim('L', [hd.rO, 0], [RN - 1, L], 'r', 5, 'Measured overall, head included.');
  fig.dim('d', [-RN, 10], [RN, 10], 'b', 5);
  return fig;
}

/** Threaded rod set in resin. The chisel end mixes the resin as the rod is turned in. */
function chemical(o: Opts = {}): Fig {
  const fig = new Fig();
  fig.says('From the side, with the rod set in resin, and from above.');
  const yRod = 60;
  const yEnd = 67;
  fig.poly('soft', [[-7.4, 21.5], [7.4, 21.5], [7.4, 66.5], [5.6, 70.5], [-5.6, 70.5], [-7.4, 66.5]]);
  const th = mthread(0, yRod, { top: 'chamfer' });
  fig.poly('body', [...th.right, [RN - 1, yEnd], ...th.left.map(([r, y]) => [-r, y] as Pt).reverse()]);
  threadLines(fig, th);
  fig.poly('body', rect(-10.5, 18.4, 10.5, 20));
  hexSide(fig, 0, 10, 15, 8.4, { bottom: true });
  const cy = -(GAP + 10.5);
  if (o.top !== false) {
    fig.circle('body', 0, cy, 10.5);
    hexPlan(fig, 0, cy, 15);
    studEnd(fig, cy);
    fig.dim('d', [-RN, cy], [RN, cy], 't', 5);
  }
  centers(fig, o, cy, 10.5, 10.5, 70.5);
  fig.dim('L', [RN - 1, 0], [RN - 1, yEnd], 'r', 5 + 2.4, 'Length of the rod.');
  return fig;
}

export const anchors: Record<string, (o?: Opts) => Fig> = {
  'toggle-bolt': toggleBolt,
  'plastic-anchor': plasticAnchor,
  'wedge-anchor': wedgeAnchor,
  'sleeve-anchor': sleeveAnchor,
  'drop-in-anchor': dropIn,
  'molly-bolt': molly(34),
  'snap-toggle': snapToggle,
  'self-drilling-drywall-anchor': selfDrilling,
  'threaded-insert': threadedInsert,
  't-nut': teeNut,
  'hammer-drive-anchor': hammerDrive,
  'chemical-anchor': chemical,
  'screw-anchor': (o) => screw({ head: 'hexwasher', drive: 'hex', L: 46, thread: 'hilo', point: 'nail' }, o),
  'lead-anchor': leadAnchor,
  'split-drive-anchor': splitDrive,
  'hollow-wall-anchor': molly(15),
};
