// Screws, and the builder most headed fasteners are drawn with.
//
// One spec per entry: its head, drive, thread form, point and proportions. The
// length dimension is drawn the way the trade measures it, from under the head
// for a head that sits on the surface and from the top of the head for one
// that sinks flush with it.

import { Fig, arc, rect, type Pt } from './core';
import {
  D,
  FORMS,
  RN,
  band,
  cap,
  dome,
  drivePlan,
  flatMark,
  hexPlan,
  hexSide,
  knurl,
  mthread,
  slotted,
  solid,
  thread,
  threadLines,
  type Drive,
  type FormName,
  type Opts,
} from './parts';

const C30 = Math.cos(Math.PI / 6);

/** Clear space between the side view and the view above it. */
export const GAP = 5.5;

interface HeadDef {
  /** Height from the top of the head to where the shank leaves it. */
  H: number;
  /** Largest radius. */
  rO: number;
  /** Turned heads: the half-profile from the crown. */
  prof?: Pt[];
  /** Hex heads: across flats, height of the hex, washer-face thickness. */
  hex?: { F: number; h: number; face?: number };
  /** A flange or washer formed under a hex. */
  under?: Pt[];
  /** Countersunk heads: the plane their length is measured from. */
  sunk?: number;
  /** Radius of the bearing face, where the length dimension starts. */
  rB?: number;
  detail?: (fig: Fig) => void;
  plan?: { ext: number; draw: (fig: Fig, cy: number) => void };
}

const hexHead = (F: number, h: number, face = 0): HeadDef => ({ H: h, rO: F / 2 / C30, hex: { F, h, face }, rB: face ? F * 0.47 : F / 2 / C30 });

export const HEADS = {
  none: (): HeadDef => ({
    H: 0,
    rO: RN,
    plan: {
      ext: RN,
      draw: (fig, cy) => {
        fig.circle('body', 0, cy, RN);
        fig.poly('thin', arc(0, cy, RN - 1, RN - 1, -62, 208, 36), false);
      },
    },
  }),
  pan: (): HeadDef => ({ H: 6.4, rO: 9.4, prof: [...dome(9.4, 5.3, 2.7), [9.4, 6.4]] }),
  round: (): HeadDef => ({ H: 6.8, rO: 8.7, prof: dome(8.7, 6.8) }),
  truss: (): HeadDef => ({ H: 5.2, rO: 11.4, prof: dome(11.4, 5.2, 2.2) }),
  button: (): HeadDef => ({ H: 5.4, rO: 9.5, prof: [...dome(9.5, 4.9, 2.3), [9.5, 5.4]] }),
  flat: (): HeadDef => ({ H: 5.8, rO: 9.6, sunk: 0, prof: [[0, 0], [9.6, 0], [9.6, 0.5], [RN, 5.8]] }),
  flatcap: (): HeadDef => ({ H: 6.2, rO: 10, sunk: 0, prof: [[0, 0], [10, 0], [10, 0.45], [RN, 6.2]] }),
  confirmat: (): HeadDef => ({ H: 3.2, rO: 7.4, sunk: 0, prof: [[0, 0], [7.4, 0], [7.4, 0.6], [RN, 3.2]] }),
  bugle: (): HeadDef => {
    const rs = RN * 0.94;
    const prof: Pt[] = [[0, 0], [8.4, 0], [8.4, 0.35]];
    for (let i = 1; i <= 8; i++) {
      const t = i / 8;
      prof.push([rs + (8.4 - rs) * Math.pow(1 - t, 2.3), 0.35 + 7.2 * t]);
    }
    return { H: 7.55, rO: 8.4, sunk: 0, prof };
  },
  trim: (): HeadDef => ({ H: 4.4, rO: 6.5, sunk: 0, prof: [[0, 0], [6.5, 0], [6.5, 0.5], [RN * 0.94, 4.4]] }),
  washer: (): HeadDef => ({ H: 4.5, rO: 9.6, prof: [...dome(6.6, 3.1, 2.6), [9.6, 3.3], [9.6, 4.5]] }),
  socket: (): HeadDef => ({
    H: 10,
    rO: 7.5,
    prof: [[0, 0], [6.8, 0], [7.5, 0.7], [7.5, 10]],
    detail: (fig) => {
      band(fig, 0, 7.5, 0.7);
      knurl(fig, 0, 7.5, 1.7, 9.2);
    },
    plan: {
      ext: 7.5,
      draw: (fig, cy) => {
        fig.circle('body', 0, cy, 7.5);
        fig.circle('thin', 0, cy, 6.8);
      },
    },
  }),
  lowsocket: (): HeadDef => ({
    H: 7.5,
    rO: 9.8,
    prof: [[0, 0], [9.1, 0], [9.8, 0.7], [9.8, 7.5]],
    detail: (fig) => {
      band(fig, 0, 9.8, 0.7);
      knurl(fig, 0, 9.8, 1.6, 6.8);
    },
    plan: {
      ext: 9.8,
      draw: (fig, cy) => {
        fig.circle('body', 0, cy, 9.8);
        fig.circle('thin', 0, cy, 9.1);
      },
    },
  }),
  carriage: (): HeadDef => ({ H: 5, rO: 10.6, prof: [...cap(10.6, 4.3), [10.6, 5]] }),
  thumb: (): HeadDef => ({
    H: 9.2,
    rO: 9.6,
    rB: 5.6,
    prof: [[0, 0], [8.9, 0], [9.6, 0.7], [9.6, 6.1], [8.9, 6.8], [5.6, 6.8], [5.6, 9.2]],
    detail: (fig) => {
      band(fig, 0, 9.6, 0.7);
      band(fig, 0, 9.6, 6.1);
      knurl(fig, 0, 9.6, 0.7, 6.1, 9);
    },
    plan: {
      ext: 9.6,
      draw: (fig, cy) => {
        fig.circle('body', 0, cy, 9.6);
        const ticks: [Pt, Pt][] = [];
        for (let a = 0; a < 360; a += 9) {
          const c = Math.cos((a * Math.PI) / 180);
          const s = Math.sin((a * Math.PI) / 180);
          ticks.push([[8.6 * c, cy + 8.6 * s], [9.6 * c, cy + 9.6 * s]]);
        }
        fig.segs('thin', ticks);
        fig.circle('thin', 0, cy, 8.6);
      },
    },
  }),
  weld: (): HeadDef => ({
    H: 2.8,
    rO: 9.2,
    prof: [[0, 0], [8.5, 0], [9.2, 0.7], [9.2, 2.8]],
    detail: (fig) => {
      // Projections under the head: they melt into the sheet when the weld fires.
      for (const x of [-7, 7]) fig.poly('body', [[x - 1.2, 2.8], [x - 0.55, 4], [x + 0.55, 4], [x + 1.2, 2.8]]);
    },
    plan: {
      ext: 9.2,
      draw: (fig, cy) => {
        fig.circle('body', 0, cy, 9.2);
        for (const a of [90, 210, 330]) fig.circle('hid', 7 * Math.cos((a * Math.PI) / 180), cy + 7 * Math.sin((a * Math.PI) / 180), 1.2);
      },
    },
  }),
  elevator: (): HeadDef => ({ H: 3.6, rO: 15.5, sunk: 0, prof: [[0, 0], [15.5, 0], [15.5, 0.9], [RN, 3.6]] }),
  plow: (): HeadDef => ({ H: 5.4, rO: 9.4, sunk: 0, prof: [[0, 0], [9.4, 0], [9.4, 0.6], [RN, 5.4]] }),
  tee: (): HeadDef => ({
    H: 6.2,
    rO: 13,
    prof: [[0, 0], [12, 0], [13, 1], [13, 6.2]],
    plan: {
      ext: 5.5,
      draw: (fig, cy) => {
        fig.poly('body', [[-13, cy - 4.3], [-11.8, cy - 5.5], [11.8, cy - 5.5], [13, cy - 4.3], [13, cy + 4.3], [11.8, cy + 5.5], [-11.8, cy + 5.5], [-13, cy + 4.3]]);
      },
    },
  }),
  hex: (): HeadDef => hexHead(15, 6.5, 0.45),
  heavyhex: (): HeadDef => hexHead(16.25, 6.4, 0.45),
  laghex: (): HeadDef => hexHead(15, 6.6),
  hexflange: (): HeadDef => ({ H: 8.3, rO: 10.8, hex: { F: 14, h: 6 }, under: [[8.5, 6], [10.8, 7.3], [10.8, 8.3]] }),
  hexwasher: (): HeadDef => ({ H: 6.3, rO: 9.6, hex: { F: 12.4, h: 5 }, under: [[9.2, 5], [9.6, 5.4], [9.6, 6.3]] }),
} satisfies Record<string, () => HeadDef>;

export type HeadName = keyof typeof HEADS;

export type Point =
  /** 45 degree lead on a flat end: machine threads. */
  | 'chamfer'
  /** Square end, no lead. */
  | 'flat'
  /** Long tapered point threaded to the tip: wood screws, lag bolts. */
  | 'gimlet'
  /** Shorter threaded point: tapping and drywall screws. */
  | 'sharp'
  /** Stub point on a screw that follows a drilled hole in masonry. */
  | 'nail'
  /** Gimlet point with a flute cut in it to clear chips. */
  | 'type17'
  /** Drill point: cuts its own hole. */
  | 'drill'
  /** Cup point on a set screw. */
  | 'cup'
  /** Tapered lead with a flute, as on a tap. */
  | 'cut'
  /** Tapered lead, no flute: forms the thread instead of cutting it. */
  | 'blunt';

export interface ScrewSpec {
  head: HeadName;
  drive?: Drive;
  /** Half-width of the drive recess. */
  af?: number;
  /** Length, as the trade measures it for this head. */
  L: number;
  thread?: FormName;
  /** Threaded length up from the tip. Default: all of it. */
  tl?: number;
  point?: Point;
  /** Shank radius where it differs from the thread's major radius. */
  shank?: number;
  /** Height of a square neck under the head. */
  neck?: number;
  /** A ground shoulder between head and thread. Size and length are then the shoulder's. */
  shoulder?: { r: number; len: number };
  /** Captive washer under the head. */
  washer?: boolean;
  /** Reduced shank between head and thread, which keeps a captive screw in its panel. */
  waist?: number;
  /** Chamfer where the thread begins (headless parts). */
  lead?: boolean;
}

/** Hidden outline of a hex socket in a side view. */
function socketHidden(fig: Fig, y: number, s: number, depth: number): Fig {
  const a = s / C30;
  return fig.poly('hid', [[-a, y], [-a, y + depth], [0, y + depth + a * 0.45], [a, y + depth], [a, y]], false);
}

export function screw(s: ScrewSpec, o: Opts = {}): Fig {
  const fig = new Fig();
  const hd: HeadDef = HEADS[s.head]();
  const form = FORMS[s.thread ?? 'machine'];
  const core = RN - form.depth;
  const yRef = hd.sunk ?? hd.H;
  const yTip = yRef + s.L;
  const pt: Point = s.point ?? 'chamfer';

  const right: Pt[] = [];
  const left: Pt[] = [];
  const both = (r: number, y: number) => {
    right.push([r, y]);
    left.push([r, y]);
  };
  const marks: (() => void)[] = [];

  let y = hd.H + (s.neck ?? 0);
  let yShoulderEnd = 0;
  if (s.shoulder) {
    const { r, len } = s.shoulder;
    const y0 = y;
    yShoulderEnd = y0 + len;
    both(r, y0);
    both(r, yShoulderEnd - 0.5);
    both(r - 0.5, yShoulderEnd);
    both(core - 0.15, yShoulderEnd);
    both(core - 0.15, yShoulderEnd + 1.5);
    marks.push(() => band(fig, 0, r, yShoulderEnd - 0.5));
    y = yShoulderEnd + 1.5;
  }

  const yT0 = s.tl ? Math.max(y, yTip - s.tl) : y;
  const rs = s.waist ?? s.shank ?? RN;
  if (yT0 > y + 0.05) {
    both(rs, y);
    both(rs, yT0);
  }

  const lead = s.lead || s.waist !== undefined || s.shoulder !== undefined;
  const run = form.p * 0.9;
  const fadeIn = (yy: number) => (lead ? 1 : Math.min(1, Math.max(0, (yy - yT0) / run)));
  const taper = pt === 'gimlet' ? 15 : pt === 'type17' ? 13 : pt === 'sharp' ? 10 : pt === 'nail' ? 6 : 0;
  const yEnd = pt === 'drill' ? yTip - 12.5 : yTip;
  const k = (yy: number) => (taper ? Math.min(1, Math.max(0, (yTip - yy) / taper)) : 1);
  const R = (yy: number) => {
    let v = RN * Math.pow(k(yy), 0.82);
    if (pt === 'chamfer' || pt === 'cup') v = Math.min(v, core + 0.15 + (yTip - yy));
    if (pt === 'cut') v = Math.min(v, core + 0.3 + (yTip - yy) * 0.5);
    if (pt === 'blunt') v = Math.min(v, RN - 1.2 + (yTip - yy) * 0.3);
    if (lead) v = Math.min(v, core + 0.15 + (yy - yT0));
    return v;
  };
  const r = (yy: number) => (lead ? core : Math.min(rs, RN) + (core - Math.min(rs, RN)) * fadeIn(yy)) * k(yy);

  const th = thread({ y0: yT0, y1: yEnd, form, R, r });
  right.push(...th.right);
  left.push(...th.left);

  if (pt === 'drill') {
    const rd = 4.3;
    both(core, yEnd + 0.9);
    both(rd, yEnd + 2.1);
    both(rd, yTip - 2.6);
    both(0, yTip);
    marks.push(() => {
      fig.cubics('thin', [[[-rd, yEnd + 2.6], [-rd * 0.1, yEnd + 5], [rd * 0.95, yTip - 7], [rd * 0.3, yTip - 2.3]]]);
      fig.seg('thin', [rd * 0.3, yTip - 2.3], [0, yTip]);
    });
  }
  if (pt === 'type17') marks.push(() => fig.poly('thin', [[0.3, yTip - 1], [1.5, yTip - 9.2], [-0.5, yTip - 9.6]]));
  if (pt === 'cut') marks.push(() => fig.poly('thin', [[-1.1, yTip], [-1.1, yTip - 6.2], [1.1, yTip - 5.2], [1.1, yTip]], false));
  if (pt === 'cup') marks.push(() => fig.poly('hid', arc(0, yTip, core - 0.5, 1.5, 180, 360), false));

  solid(fig, 0, right, left);
  threadLines(fig, th);
  for (const m of marks) m();

  if (s.washer) fig.poly('body', rect(-10, hd.H, 10, hd.H + 1.5));
  if (s.neck) {
    fig.poly('body', rect(-RN, hd.H, RN, hd.H + s.neck));
    flatMark(fig, -RN, hd.H, RN, hd.H + s.neck);
  }

  const socket = s.drive === 'hex' && !hd.hex;
  const af = s.af ?? (socket ? 3 : undefined);
  if (hd.hex) {
    if (hd.under) solid(fig, 0, hd.under);
    hexSide(fig, 0, 0, hd.hex.F, hd.hex.h, { face: hd.hex.face });
  } else if (hd.prof) {
    solid(fig, 0, s.drive === 'slotted' || s.drive === 'combo' ? slotted(hd.prof) : hd.prof);
  }
  hd.detail?.(fig);
  if (socket) socketHidden(fig, 0, af!, Math.min(Math.max(hd.H * 0.62, 4.5), 6.5));

  if (o.top !== false) {
    const ext = hd.plan?.ext ?? (hd.hex && !hd.under ? hd.hex.F / 2 : hd.rO);
    const cy = -(GAP + ext);
    if (hd.plan) hd.plan.draw(fig, cy);
    else if (hd.hex) {
      if (hd.under) fig.circle('body', 0, cy, hd.rO);
      hexPlan(fig, 0, cy, hd.hex.F);
    } else fig.circle('body', 0, cy, hd.rO);
    if (!(hd.hex && s.drive === 'hex')) drivePlan(fig, s.drive, 0, cy, hd.hex ? hd.hex.F * 0.42 : hd.rO, af);
    fig.level(cy, -hd.rO, hd.rO);
    fig.axis(0, cy - ext, yTip);
  } else fig.axis(0, 0, yTip);

  if (s.shoulder) {
    fig.dim('L', [hd.rB ?? hd.rO, hd.H], [s.shoulder.r, yShoulderEnd], 'r', 5, 'Length of the shoulder, not of the thread.');
    fig.dim('d', [-s.shoulder.r, hd.H + s.shoulder.len * 0.5], [s.shoulder.r, hd.H + s.shoulder.len * 0.5], 'b', 5, 'Diameter of the shoulder. The thread is one size smaller.');
  } else {
    const xRef = hd.sunk !== undefined ? hd.rO : s.washer ? 10 : (hd.rB ?? hd.rO);
    const how = s.head === 'none' ? 'Measured overall.' : hd.sunk !== undefined ? 'Measured overall. A countersunk head sits inside the length.' : 'Measured from under the head.';
    // Sources disagree on where an elevator bolt's length starts, so it is left undimensioned.
    if (s.head !== 'elevator') fig.dim('L', [xRef, yRef], [taper || pt === 'drill' ? 0 : core, yTip], 'r', 5, how);
    const yd = pt === 'drill' ? yEnd - 3 : taper ? Math.max(yT0 + form.p, yTip - taper - 1) : Math.max(yT0 + form.p, yTip - 5);
    fig.dim('d', [-RN, yd], [RN, yd], 'b', 5);
  }
  return fig;
}

/** Wood thread on one end, machine thread on the other, no head. */
export function hangerBolt(o: Opts = {}): Fig {
  const fig = new Fig();
  const yM = 17;
  const yW = 22;
  const yTip = 48;
  const mt = mthread(0, yM, { top: 'chamfer', bottom: 'run' });
  const form = FORMS.wood;
  const core = RN - form.depth;
  const rs = RN * 0.92;
  const k = (y: number) => Math.min(1, (yTip - y) / 13);
  const wt = thread({
    y0: yW,
    y1: yTip,
    form,
    R: (y) => RN * Math.pow(k(y), 0.82),
    r: (y) => (rs + (core - rs) * Math.min(1, (y - yW) / form.p)) * k(y),
  });
  solid(fig, 0, [...mt.right, [rs, yM], [rs, yW], ...wt.right], [...mt.left, [rs, yM], [rs, yW], ...wt.left]);
  threadLines(fig, mt);
  threadLines(fig, wt);
  if (o.top !== false) {
    const cy = -(GAP + RN);
    HEADS.none().plan!.draw(fig, cy);
    fig.level(cy, -RN, RN);
    fig.axis(0, cy - RN, yTip);
  } else fig.axis(0, 0, yTip);
  fig.dim('L', [RN - 1, 0], [0, yTip], 'r', 5, 'Measured overall.');
  fig.dim('d', [-RN, 8], [RN, 8], 'b', 5);
  return fig;
}

/**
 * Hammer-driven: several steep thread starts over a plain pilot, so the screw
 * turns itself as it is struck.
 */
function driveScrew(o: Opts = {}): Fig {
  const fig = new Fig();
  const hd = HEADS.round();
  const y0 = hd.H;
  const yP = y0 + 15;
  const yTip = y0 + 20;
  const r = 4.6;
  solid(fig, 0, [[r, y0], [r, yP], [3.6, yP], [3.6, yTip - 0.8], [2.9, yTip]]);
  const rise = 7.5;
  const lines: [Pt, Pt][] = [];
  for (let yl = y0; yl < yP + rise; yl += 2.4) {
    // Each start runs from the left silhouette up to the right one.
    let a: Pt = [-r, yl];
    let b: Pt = [r, yl - rise];
    const at = (yy: number): Pt => [a[0] + ((b[0] - a[0]) * (yy - a[1])) / (b[1] - a[1]), yy];
    if (b[1] < y0) b = at(y0);
    if (a[1] > yP) a = at(yP);
    if (a[1] > b[1] + 0.5) lines.push([a, b]);
  }
  fig.segs('thin', lines);
  solid(fig, 0, hd.prof!);
  if (o.top !== false) {
    const cy = -(GAP + hd.rO);
    fig.circle('body', 0, cy, hd.rO);
    fig.level(cy, -hd.rO, hd.rO);
    fig.axis(0, cy - hd.rO, yTip);
  } else fig.axis(0, 0, yTip);
  fig.dim('L', [hd.rO, y0], [2.9, yTip], 'r', 5, 'Measured from under the head.');
  fig.dim('d', [-r, yP - 3], [r, yP - 3], 'b', 5);
  return fig;
}

const S = (spec: ScrewSpec) => (o: Opts = {}) => screw(spec, o);

export const screws: Record<string, (o?: Opts) => Fig> = {
  'wood-screw': S({ head: 'flat', drive: 'phillips', L: 50, thread: 'wood', tl: 33, point: 'gimlet', shank: RN * 0.94 }),
  'drywall-screw': S({ head: 'bugle', drive: 'phillips', af: 4.4, L: 48, thread: 'drywall', point: 'sharp', shank: RN * 0.94 }),
  'machine-screw': S({ head: 'pan', drive: 'phillips', L: 30 }),
  'sheet-metal-screw': S({ head: 'pan', drive: 'phillips', L: 28, thread: 'sheet', point: 'sharp' }),
  'self-drilling-screw': S({ head: 'hexwasher', drive: 'hex', L: 38, thread: 'plastic', point: 'drill' }),
  'deck-screw': S({ head: 'bugle', drive: 'torx', af: 3.5, L: 56, thread: 'wood', tl: 36, point: 'type17', shank: RN * 0.94 }),
  'construction-screw': S({ head: 'hexwasher', drive: 'torx', af: 3, L: 70, thread: 'lag', tl: 34, point: 'type17', shank: RN * 0.94 }),
  'set-screw': S({ head: 'none', drive: 'hex', af: 2.5, L: 15, point: 'cup', lead: true }),
  'socket-head-cap-screw': S({ head: 'socket', drive: 'hex', af: 4, L: 36, tl: 24 }),
  'button-head-cap-screw': S({ head: 'button', drive: 'hex', af: 3, L: 24 }),
  'flat-head-cap-screw': S({ head: 'flatcap', drive: 'hex', af: 3, L: 32 }),
  'concrete-screw': S({ head: 'hexwasher', drive: 'hex', L: 46, thread: 'hilo', point: 'nail' }),
  'chipboard-screw': S({ head: 'flat', drive: 'phillips', L: 46, thread: 'particle', point: 'sharp', shank: RN * 0.9 }),
  'confirmat-screw': S({ head: 'confirmat', drive: 'hex', af: 2.6, L: 50, thread: 'confirmat', tl: 38, point: 'blunt' }),
  'pocket-hole-screw': S({ head: 'washer', drive: 'square', af: 2.4, L: 40, thread: 'wood', tl: 24, point: 'type17', shank: RN * 0.9 }),
  'trim-head-screw': S({ head: 'trim', drive: 'torx', af: 2.6, L: 54, thread: 'wood', tl: 32, point: 'sharp', shank: RN * 0.94 }),
  'thread-cutting-screw': S({ head: 'pan', drive: 'phillips', L: 24, point: 'cut' }),
  'thread-forming-screw': S({ head: 'pan', drive: 'phillips', L: 24, thread: 'plastic', point: 'blunt' }),
  'sems-screw': S({ head: 'pan', drive: 'phillips', L: 26, washer: true }),
  'shoulder-screw': S({ head: 'lowsocket', drive: 'hex', af: 3.2, L: 34, shoulder: { r: 6.5, len: 20 } }),
  'weld-screw': S({ head: 'weld', L: 22 }),
  'security-screw': S({ head: 'pan', drive: 'torxpin', af: 3.8, L: 24 }),
  'thumb-screw': S({ head: 'thumb', L: 22 }),
  'captive-screw': S({ head: 'pan', drive: 'phillips', L: 28, tl: 11, waist: 3.3 }),
  'hanger-bolt': hangerBolt,
  'drive-screw': driveScrew,
  'drywall-anchor-screw': S({ head: 'pan', drive: 'phillips', L: 34, thread: 'drywall', point: 'sharp' }),
};

export { D };
