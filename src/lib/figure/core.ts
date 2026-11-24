// The drawing surface every figure is built on.
//
// A figure is an ordered list of paths, each tagged with what the line is
// (a part, a visible edge, thread detail, a hidden edge, a center line, a part
// in its other position) rather than a color or a weight. The kinds come from
// drafting because that is the complete way to describe a part. What they
// look like is the renderer's business (src/components/Figure.astro and
// global.css): today a solid metal part, with hidden edges and center lines
// left out. See docs/DRAWINGS.md.
//
// Units are arbitrary. Every fastener is drawn around a nominal thread
// diameter of 10 units (see parts.ts), so two figures side by side are at the
// same scale.

export type Pt = [number, number];
export type Shape = Pt[] | { cx: number; cy: number; r: number };

/**
 * body     a metal part
 * soft     a part that is not metal (nylon, rubber, plastic, adhesive)
 * ink      a cut face too thin to shade, filled solid (sheet metal, thin washers)
 * edge     visible edge
 * thin     thread crests, knurling, chamfers and other surface detail
 * hatch    lining on the cut face of a part shown cut open
 * hid      hidden edge (described, not drawn)
 * ctr      center line (described, not drawn, and left out of the bounds)
 * phantom  alternate position or adjacent part
 */
export type Kind = 'body' | 'soft' | 'ink' | 'edge' | 'thin' | 'hatch' | 'hid' | 'ctr' | 'phantom';

export type Side = 'l' | 'r' | 't' | 'b';

/** A measurement to mark. The key ties it to a size on the page, which supplies the word. */
export interface Dim {
  key: string;
  a: Pt;
  b: Pt;
  side: Side;
  off: number;
  /** How the trade takes this measurement, where that is not obvious. */
  note?: string;
}

export interface Item {
  k: Kind;
  d: string;
}

export const f = (n: number): string => {
  const v = Math.round(n * 100) / 100;
  return String(Object.is(v, -0) ? 0 : v);
};

export function pathOf(pts: Pt[], close = false): string {
  if (!pts.length) return '';
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  if (pts.length > 1) d += 'L' + pts.slice(1).map((p) => `${f(p[0])} ${f(p[1])}`).join(' ');
  return close ? d + 'Z' : d;
}

export function circlePath(cx: number, cy: number, r: number): string {
  return `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;
}

/** Points along an elliptical arc. Degrees, clockwise on screen from +x. */
export function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n?: number): Pt[] {
  const steps = n ?? Math.max(2, Math.ceil(Math.abs(a1 - a0) / 9));
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}

/** Reflect across the vertical line x = cx, reversing order so a path keeps its winding. */
export const mirror = (pts: Pt[], cx = 0): Pt[] => pts.map(([x, y]) => [2 * cx - x, y] as Pt).reverse();

export const shift = (pts: Pt[], dx: number, dy: number): Pt[] => pts.map(([x, y]) => [x + dx, y + dy] as Pt);

export function rot(pts: Pt[], deg: number, cx = 0, cy = 0): Pt[] {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c] as Pt);
}

export function ngon(cx: number, cy: number, r: number, n: number, startDeg = 0): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((startDeg + (360 * i) / n) * Math.PI) / 180;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

export const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

/** Section lining: parallel lines clipped to a simple polygon. */
export function hatch(poly: Pt[], spacing = 1.5, deg = 45): [Pt, Pt][] {
  const a = (deg * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const nx = -uy;
  const ny = ux;
  const s = poly.map(([x, y]) => x * nx + y * ny);
  const lo = Math.min(...s);
  const hi = Math.max(...s);
  const out: [Pt, Pt][] = [];
  for (let c = Math.floor(lo / spacing) * spacing + spacing * 0.37; c < hi; c += spacing) {
    const hits: { t: number; p: Pt }[] = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i];
      const q = poly[(i + 1) % poly.length];
      const sp = s[i] - c;
      const sq = s[(i + 1) % poly.length] - c;
      if (sp < 0 === sq < 0) continue;
      const k = sp / (sp - sq);
      const x = p[0] + (q[0] - p[0]) * k;
      const y = p[1] + (q[1] - p[1]) * k;
      hits.push({ t: x * ux + y * uy, p: [x, y] });
    }
    hits.sort((m, n) => m.t - n.t);
    for (let i = 0; i + 1 < hits.length; i += 2) out.push([hits[i].p, hits[i + 1].p]);
  }
  return out;
}

export class Fig {
  items: Item[] = [];
  dims: Dim[] = [];
  /** What the views are, where the category's usual wording does not fit. */
  caption?: string;
  x0 = Infinity;
  y0 = Infinity;
  x1 = -Infinity;
  y1 = -Infinity;

  private xf: ((p: Pt) => Pt) | null = null;

  /**
   * Draw everything inside `fn` through a rigid transform (a move, a turn, a
   * mirror). Circles keep their radius, so it must not scale.
   */
  with(xf: (p: Pt) => Pt, fn: () => void): this {
    const outer = this.xf;
    this.xf = outer ? (p) => outer(xf(p)) : xf;
    fn();
    this.xf = outer;
    return this;
  }

  private tx(pts: Pt[]): Pt[] {
    return this.xf ? pts.map(this.xf) : pts;
  }

  grow(pts: Pt[]): this {
    for (const [x, y] of pts) {
      if (x < this.x0) this.x0 = x;
      if (x > this.x1) this.x1 = x;
      if (y < this.y0) this.y0 = y;
      if (y > this.y1) this.y1 = y;
    }
    return this;
  }

  private raw(k: Kind, d: string): this {
    if (d) this.items.push({ k, d });
    return this;
  }

  poly(k: Kind, pts: Pt[], close = true): this {
    const t = this.tx(pts);
    if (k !== 'ctr') this.grow(t);
    return this.raw(k, pathOf(t, close));
  }

  /** Several outlines as one path; with the even-odd rule the inner ones are holes. */
  compound(k: Kind, shapes: Shape[]): this {
    let d = '';
    for (const s of shapes) {
      if (Array.isArray(s)) {
        const t = this.tx(s);
        this.grow(t);
        d += pathOf(t, true);
      } else {
        const [cx, cy] = this.tx([[s.cx, s.cy]])[0];
        this.grow([[cx - s.r, cy - s.r], [cx + s.r, cy + s.r]]);
        d += circlePath(cx, cy, s.r);
      }
    }
    return this.raw(k, d);
  }

  /** Cubic Béziers, four control points each, as one path. */
  cubics(k: Kind, list: Pt[][]): this {
    let d = '';
    for (const c of list) {
      const [a, b, c2, e] = this.tx(c);
      this.grow([a, e]);
      d += `M${f(a[0])} ${f(a[1])}C${f(b[0])} ${f(b[1])} ${f(c2[0])} ${f(c2[1])} ${f(e[0])} ${f(e[1])}`;
    }
    return this.raw(k, d);
  }

  circle(k: Kind, cx: number, cy: number, r: number): this {
    return this.compound(k, [{ cx, cy, r }]);
  }

  ring(k: Kind, cx: number, cy: number, ro: number, ri: number): this {
    return this.compound(k, [{ cx, cy, r: ro }, { cx, cy, r: ri }]);
  }

  seg(k: Kind, a: Pt, b: Pt): this {
    return this.poly(k, [a, b], false);
  }

  segs(k: Kind, list: [Pt, Pt][]): this {
    let d = '';
    for (const s of list) {
      const [a, b] = this.tx(s);
      if (k !== 'ctr') this.grow([a, b]);
      d += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
    }
    return this.raw(k, d);
  }

  /** Section lining over a cut face. */
  hatch(poly: Pt[], spacing = 1.5, deg = 45): this {
    return this.segs('hatch', hatch(poly, spacing, deg));
  }

  /** A cut face: outline plus lining. */
  cut(poly: Pt[], spacing = 1.5, deg = 45, k: Kind = 'body'): this {
    return this.poly(k, poly).hatch(poly, spacing, deg);
  }

  /** Center line along x = cx. */
  axis(cx: number, y0: number, y1: number, over = 2.4): this {
    return this.seg('ctr', [cx, y0 - over], [cx, y1 + over]);
  }

  /** Center line along y = cy. */
  level(cy: number, x0: number, x1: number, over = 2.4): this {
    return this.seg('ctr', [x0 - over, cy], [x1 + over, cy]);
  }

  says(caption: string): this {
    this.caption = caption;
    return this;
  }

  dim(key: string, a: Pt, b: Pt, side: Side, off = 6, note?: string): this {
    const [ta, tb] = this.tx([a, b]);
    this.dims.push({ key, a: ta, b: tb, side, off, note });
    return this;
  }
}
