// Parts every figure is assembled from: thread forms, turned profiles, hex
// geometry, drive recesses, knurling and bent rod.
//
// Proportions follow the standards the entries cite (a hex head is 1.5 d
// across flats and about 0.65 d high, a nut 0.875 d thick, and so on). Thread
// pitch is the one deliberate exaggeration: a true coarse pitch is about
// 0.15 d, which closes up into a gray band at catalog size, so pitches here
// run a little under half again as wide.

import { Fig, arc, ngon, type Kind, type Pt } from './core';

/** Nominal thread diameter every figure is drawn around. */
export const D = 10;
export const RN = D / 2;

const T30 = Math.tan(Math.PI / 6);
const C30 = Math.cos(Math.PI / 6);

export interface Opts {
  /** Draw the second view (plan, end view or section). Off for small sizes. */
  top?: boolean;
}

/**
 * p      pitch
 * depth  thread depth
 * w      half-width of a thread at its root, in pitches (0.5 is a full V with
 *        no flat between threads; smaller leaves bare core between them)
 * alt    height of every second thread as a share of the first (hi-lo forms)
 */
export interface Form {
  p: number;
  depth: number;
  w: number;
  alt?: number;
}

export const FORMS = {
  machine: { p: 2.1, depth: 1.0, w: 0.5 },
  fine: { p: 1.5, depth: 0.72, w: 0.5 },
  wood: { p: 4.4, depth: 1.7, w: 0.2 },
  lag: { p: 4.6, depth: 1.55, w: 0.23 },
  sheet: { p: 3.1, depth: 1.3, w: 0.27 },
  drywall: { p: 3.7, depth: 1.6, w: 0.18 },
  particle: { p: 4.3, depth: 1.9, w: 0.15 },
  plastic: { p: 2.9, depth: 1.15, w: 0.3 },
  hilo: { p: 2.5, depth: 1.5, w: 0.3, alt: 0.5 },
  confirmat: { p: 5.2, depth: 1.7, w: 0.22 },
} satisfies Record<string, Form>;

export type FormName = keyof typeof FORMS;

/** Two half-profiles as [radius, y], and the helix lines across the near side. */
export interface Threaded {
  right: Pt[];
  left: Pt[];
  crests: Pt[][];
  roots: Pt[][];
}

/**
 * A right-hand thread seen from the side, axis vertical.
 *
 * The two silhouettes are the thread form itself, half a pitch out of step
 * with each other. Each crest and root crossing the near side is the
 * projection of half a turn of helix, which is a half cosine wave, not a
 * straight line: it leaves one silhouette vertically and arrives at the other
 * vertically. One cubic Bézier with its handles 0.363 of the rise from each
 * end matches that curve's slope at the middle.
 */
export function thread(o: {
  y0: number;
  y1: number;
  form: Form;
  /** Major radius at y (tapers and chamfers live here). */
  R: (y: number) => number;
  /** Core radius at y. */
  r: (y: number) => number;
  phase?: number;
  cx?: number;
}): Threaded {
  const { y0, y1 } = o;
  const { p, w, alt } = o.form;
  const cx = o.cx ?? 0;
  const ph = o.phase ?? 0.3;
  const eps = 1e-6;
  const n = Math.ceil((y1 - y0) / p) + 2;

  const core = (y: number) => Math.max(0, Math.min(o.R(y), o.r(y)));
  const crown = (y: number, i: number) => {
    const R = Math.max(0, o.R(y));
    const r = core(y);
    return alt && Math.abs(i) % 2 === 1 ? r + (R - r) * alt : R;
  };

  const side = (s: number): Pt[] => {
    const ys: number[] = [y0, y1];
    for (let i = -2; i <= n; i++) {
      const yc = y0 + (i + s) * p;
      for (const y of [yc - w * p, yc, yc + w * p]) if (y > y0 + eps && y < y1 - eps) ys.push(y);
    }
    ys.sort((a, b) => a - b);
    const out: Pt[] = [];
    let last = -Infinity;
    for (const y of ys) {
      if (y - last < 1e-4) continue;
      last = y;
      const u = (y - y0) / p - s;
      const i = Math.round(u);
      const dist = Math.abs(u - i);
      const r = core(y);
      const R = crown(y, i);
      out.push([dist >= w - eps ? r : R + (r - R) * (dist / w), y]);
    }
    return out;
  };

  const a = 0.363 * (p / 2);
  const inside = (y: number) => y >= y0 - eps && y <= y1 + eps;
  const helix = (yl: number, rl: number, rr: number): Pt[] => {
    const yr = yl - p / 2;
    return [[cx - rl, yl], [cx - rl, yl - a], [cx + rr, yr + a], [cx + rr, yr]];
  };

  const crests: Pt[][] = [];
  const roots: Pt[][] = [];
  for (let i = -2; i <= n; i++) {
    const yl = y0 + (i + ph) * p;
    const yr = yl - p / 2;
    if (inside(yl) && inside(yr)) {
      const rl = crown(yl, i);
      const rr = crown(yr, i);
      if (rl - core(yl) > 0.2 || rr - core(yr) > 0.2) crests.push(helix(yl, rl, rr));
    }
    for (const off of w >= 0.5 - eps ? [0.5] : [w, -w]) {
      const y = yl + off * p;
      if (!inside(y) || !inside(y - p / 2)) continue;
      const rl = core(y);
      const rr = core(y - p / 2);
      if (rl > 0.4 && rr > 0.4) roots.push(helix(y, rl, rr));
    }
  }

  return { right: side(ph - 0.5), left: side(ph), crests, roots };
}

/** A straight thread of the given form, with the usual ways a thread ends. */
export function mthread(
  y0: number,
  y1: number,
  o: {
    /** chamfer: a 45 degree lead. run: the thread fades in or out over a turn. */
    top?: 'chamfer' | 'run';
    bottom?: 'chamfer' | 'run';
    form?: Form;
    cx?: number;
    R?: number;
    phase?: number;
  } = {},
): Threaded {
  const form = o.form ?? FORMS.machine;
  const Rn = o.R ?? RN;
  const core = Rn - form.depth;
  const run = form.p * 0.9;
  const R = (y: number) => {
    let v = Rn;
    if (o.top === 'chamfer') v = Math.min(v, core + 0.15 + (y - y0));
    if (o.bottom === 'chamfer') v = Math.min(v, core + 0.15 + (y1 - y));
    return v;
  };
  const r = (y: number) => {
    let d = form.depth;
    if (o.top === 'run') d = Math.min(d, form.depth * Math.max(0, (y - y0) / run));
    if (o.bottom === 'run') d = Math.min(d, form.depth * Math.max(0, (y1 - y) / run));
    return Rn - d;
  };
  return thread({ y0, y1, form, R, r, cx: o.cx, phase: o.phase });
}

/** A turned solid from its two half-profiles. */
export function solid(fig: Fig, cx: number, right: Pt[], left: Pt[] = right, k: Kind = 'body'): Fig {
  return fig.poly(k, [
    ...right.map(([r, y]) => [cx + r, y] as Pt),
    ...left
      .slice()
      .reverse()
      .map(([r, y]) => [cx - r, y] as Pt),
  ]);
}

export function threadLines(fig: Fig, th: Threaded): Fig {
  return fig.cubics('thin', th.crests).cubics('thin', th.roots);
}

/** A threaded length drawn as its own solid. */
export function threaded(fig: Fig, th: Threaded, cx = 0, k: Kind = 'body'): Fig {
  solid(fig, cx, th.right, th.left, k);
  return threadLines(fig, th);
}

/** A circular edge on a turned part, seen edge-on. */
export const band = (fig: Fig, cx: number, r: number, y: number, k: Kind = 'thin'): Fig => fig.seg(k, [cx - r, y], [cx + r, y]);

// ── Turned profiles ─────────────────────────────────────────────────────────

/** Quarter superellipse from the crown (0, 0) to the rim (a, b). n = 2 is an ellipse. */
export function dome(a: number, b: number, n = 2, steps = 10): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = ((i / steps) * Math.PI) / 2;
    out.push([a * Math.pow(Math.sin(t), 2 / n), b - b * Math.pow(Math.cos(t), 2 / n)]);
  }
  return out;
}

/** Spherical cap from the crown (0, 0) to a sharp rim at (a, b). */
export function cap(a: number, b: number, steps = 8): Pt[] {
  const rs = (a * a + b * b) / (2 * b);
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (a * i) / steps;
    out.push([x, rs - Math.sqrt(rs * rs - x * x)]);
  }
  return out;
}

/** Cut a screwdriver slot, seen end-on, into the crown of a profile. */
export function slotted(prof: Pt[], hw = 0.85, depth = 2.4): Pt[] {
  let i = prof.findIndex(([x]) => x > hw);
  if (i < 1) i = 1;
  const [x0, y0] = prof[i - 1];
  const [x1, y1] = prof[i];
  const yAt = x1 === x0 ? y0 : y0 + ((y1 - y0) * (hw - x0)) / (x1 - x0);
  return [[0, depth], [hw, depth], [hw, yAt], ...prof.slice(i)];
}

// ── Hexagons ────────────────────────────────────────────────────────────────

/**
 * A hexagonal prism seen across its corners, so three faces show. The top (and
 * for a nut the bottom) is chamfered at 30 degrees; where that cone meets each
 * flat it leaves the arc that makes a drawn hex look like a hex.
 */
export function hexSide(
  fig: Fig,
  cx: number,
  y: number,
  F: number,
  H: number,
  o: { bottom?: boolean; face?: number; k?: Kind } = {},
): Fig {
  const G = F / C30;
  const rc = (F / 2) * 0.93;
  const z = (rho: number) => Math.max(0, (rho - rc) * T30);
  const zc = z(G / 2);
  const face = o.bottom ? 0 : (o.face ?? 0);
  const yb = y + H - face;
  const top: Pt[] = [[cx - G / 2, y + zc], [cx - rc, y], [cx + rc, y], [cx + G / 2, y + zc]];
  let bottom: Pt[];
  if (o.bottom) bottom = [[cx + G / 2, yb - zc], [cx + rc, yb], [cx - rc, yb], [cx - G / 2, yb - zc]];
  else if (face) {
    const rf = F * 0.47;
    bottom = [[cx + G / 2, yb], [cx + rf, yb], [cx + rf, y + H], [cx - rf, y + H], [cx - rf, yb], [cx - G / 2, yb]];
  } else bottom = [[cx + G / 2, yb], [cx - G / 2, yb]];
  fig.poly(o.k ?? 'body', [...top, ...bottom]);

  const e0 = y + zc;
  const e1 = o.bottom ? yb - zc : yb;
  fig.segs('edge', [
    [[cx - G / 4, e0], [cx - G / 4, e1]],
    [[cx + G / 4, e0], [cx + G / 4, e1]],
  ]);

  const steps = 8;
  const mid: Pt[] = [];
  const flank: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = -G / 4 + ((G / 2) * i) / steps;
    const dz = z(Math.hypot(F / 2, t));
    mid.push([t, dz]);
    flank.push([(F / 2) * C30 + t * 0.5, dz]);
  }
  const place = (pts: Pt[], sx: number, yy: number, sy: number): Pt[] => pts.map(([x, dz]) => [cx + sx * x, yy + sy * dz] as Pt);
  for (const [yy, sy] of o.bottom ? [[y, 1], [yb, -1]] : [[y, 1]]) {
    fig.poly('thin', place(mid, 1, yy, sy), false);
    fig.poly('thin', place(flank, 1, yy, sy), false);
    fig.poly('thin', place(flank, -1, yy, sy), false);
  }
  return fig;
}

/** A hexagon from above, corners left and right to agree with hexSide, with its chamfer circle. */
export function hexPlan(fig: Fig, cx: number, cy: number, F: number, hole = 0, k: Kind = 'body'): Fig {
  const hex = ngon(cx, cy, F / 2 / C30, 6, 0);
  fig.compound(k, hole ? [hex, { cx, cy, r: hole }] : [hex]);
  return fig.poly('thin', arc(cx, cy, (F / 2) * 0.93, (F / 2) * 0.93, 0, 360, 48), true);
}

/**
 * An internal thread seen down its axis, as drafting standards draw it: the
 * bore as a full circle and the major diameter as a thin arc of about three
 * quarters of a turn. (An external thread is the same picture inside out.)
 */
export function tappedPlan(fig: Fig, cx: number, cy: number, R = RN): Fig {
  return fig.poly('thin', arc(cx, cy, R, R, -62, 208, 40), false);
}

/** Bore radius that goes with tappedPlan. */
export const BORE = RN - 1.0;

// ── Drives ──────────────────────────────────────────────────────────────────

export type Drive = 'phillips' | 'slotted' | 'hex' | 'torx' | 'square' | 'combo' | 'torxpin' | 'none';

/** A drive recess seen from above. `size` is its half-width. */
export function drivePlan(fig: Fig, kind: Drive | undefined, cx: number, cy: number, rO: number, size?: number): Fig {
  if (!kind || kind === 'none') return fig;
  const s = size ?? Math.min(rO * 0.6, 5.2);
  const cross = () => {
    const hw = s * 0.17;
    const pts: Pt[] = [
      [-hw, -s], [hw, -s], [hw, -hw], [s, -hw], [s, hw], [hw, hw],
      [hw, s], [-hw, s], [-hw, hw], [-s, hw], [-s, -hw], [-hw, -hw],
    ];
    fig.poly('thin', pts.map(([x, y]) => [cx + x, cy + y] as Pt));
  };
  const slot = (clip = false) => {
    // Runs front to back, so the side view shows it end-on as a notch.
    const hw = 0.85;
    const half = Math.sqrt(rO * rO - hw * hw);
    const gap = clip ? s * 0.17 : 0;
    const segs: [Pt, Pt][] = [];
    for (const x of [-hw, hw]) {
      if (clip) {
        segs.push([[cx + x, cy - half], [cx + x, cy - gap]]);
        segs.push([[cx + x, cy + gap], [cx + x, cy + half]]);
      } else segs.push([[cx + x, cy - half], [cx + x, cy + half]]);
    }
    fig.segs('thin', segs);
  };
  const lobes = () => {
    const pts: Pt[] = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const r = s * (0.8 + 0.2 * Math.cos(6 * a));
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    fig.poly('thin', pts);
  };
  switch (kind) {
    case 'phillips':
      cross();
      break;
    case 'slotted':
      slot();
      break;
    case 'combo':
      cross();
      slot(true);
      break;
    case 'hex':
      fig.poly('thin', ngon(cx, cy, s / C30, 6, 0));
      break;
    case 'square':
      fig.poly('thin', ngon(cx, cy, s * 1.25, 4, 45));
      break;
    case 'torx':
      lobes();
      break;
    case 'torxpin':
      lobes();
      fig.circle('thin', cx, cy, s * 0.24);
      break;
  }
  return fig;
}

// ── Surface detail ──────────────────────────────────────────────────────────

/**
 * Straight knurling on a cylinder. The grooves are evenly spaced around the
 * part, so they close up toward the silhouette.
 */
export function knurl(fig: Fig, cx: number, r: number, y0: number, y1: number, step = 13): Fig {
  const segs: [Pt, Pt][] = [];
  for (let a = -78; a <= 78; a += step) {
    const x = cx + r * Math.sin((a * Math.PI) / 180);
    segs.push([[x, y0], [x, y1]]);
  }
  return fig.segs('thin', segs);
}

/** The thin diagonals that mark a flat on an otherwise round part. */
export function flatMark(fig: Fig, x0: number, y0: number, x1: number, y1: number): Fig {
  return fig.segs('thin', [
    [[x0, y0], [x1, y1]],
    [[x1, y0], [x0, y1]],
  ]);
}

/** Outline of round rod of radius r bent along a center line. */
export function rodOutline(center: Pt[], r: number): Pt[] {
  const near: Pt[] = [];
  const far: Pt[] = [];
  for (let i = 0; i < center.length; i++) {
    const a = center[Math.max(0, i - 1)];
    const b = center[Math.min(center.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    near.push([center[i][0] + nx * r, center[i][1] + ny * r]);
    far.push([center[i][0] - nx * r, center[i][1] - ny * r]);
  }
  return [...near, ...far.reverse()];
}

/** A rounded-end bar: round rod seen from the side, or a ring seen edge-on. */
export function stadium(cx: number, cy: number, halfLength: number, r: number): Pt[] {
  return [...arc(cx + halfLength - r, cy, r, r, -90, 90), ...arc(cx - halfLength + r, cy, r, r, 90, 270)];
}
