// The catalog's shape: its five kinds of fastener, and the formatting every
// page shares.

import type { DimensionRange, Fastener } from '../types/fastener';
import { anchors, bolts, nuts, screws, washers } from './data';

export interface Category {
  /** URL segment and data key. */
  key: 'screws' | 'bolts' | 'anchors' | 'nuts' | 'washers';
  name: string;
  one: string;
  items: Fastener[];
}

export const CATEGORIES: Category[] = [
  { key: 'screws', name: 'Screws', one: 'Screw', items: screws },
  { key: 'bolts', name: 'Bolts', one: 'Bolt', items: bolts },
  { key: 'anchors', name: 'Anchors', one: 'Anchor', items: anchors },
  { key: 'nuts', name: 'Nuts', one: 'Nut', items: nuts },
  { key: 'washers', name: 'Washers', one: 'Washer', items: washers },
];

export const category = (key: string): Category => CATEGORIES.find((c) => c.key === key)!;

export const TOTAL = CATEGORIES.reduce((n, c) => n + c.items.length, 0);

/** "stainless-steel" to "Stainless steel". */
export function label(value: string | undefined): string {
  if (!value) return '';
  const s = value.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Sizes ───────────────────────────────────────────────────────────────────
// The data holds every size as a decimal inch. Nobody at a parts bin reads
// 0.164 in: the box says #8, and it says 1-1/4, not 1.25. So a size is shown
// the way it is sold, with the decimal and the millimeters under it.

/** What a size measures, which decides how the trade writes it. */
export type SizeKind = 'diameter' | 'length' | 'thickness';

export interface Size {
  /** As printed on the box: "#6 to 3/8 in". */
  main: string;
  /** The same size in the other notation: "0.138 to 0.375 in · 3.5 to 9.5 mm". */
  sub: string;
}

const trim = (n: number, places: number) => String(Number(n.toFixed(places)));
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/** 1.25 to "1-1/4". Null when the value is not a 64th of an inch. */
function fraction(v: number): string | null {
  const n = Math.round(v * 64);
  if (n <= 0 || Math.abs(v - n / 64) > 0.001) return null;
  const whole = Math.floor(n / 64);
  const rest = n % 64;
  if (!rest) return String(whole);
  const g = gcd(rest, 64);
  const part = `${rest / g}/${64 / g}`;
  return whole ? `${whole}-${part}` : part;
}

/** 0.164 to "#8". A screw gauge number is 0.060 in plus 0.013 in per number. */
function gauge(v: number): string | null {
  const n = Math.round((v - 0.06) / 0.013);
  return n >= 0 && n <= 24 && Math.abs(v - (0.06 + 0.013 * n)) < 0.0006 ? `#${n}` : null;
}

/** 0.236 to 6: an inch figure that is a whole or half millimeter underneath. */
function wholeMm(v: number): number | null {
  const mm = v * 25.4;
  const r = Math.round(mm * 2) / 2;
  return Math.abs(mm - r) < 0.03 ? r : null;
}

const span = (xs: string[]) => xs.join(' to ');

export function size(r: DimensionRange | undefined, kind: SizeKind = 'length'): Size | null {
  if (!r) return null;
  const ends = r.min === r.max ? [r.min] : [r.min, r.max];
  if (r.unit !== 'in') {
    return { main: `${span(ends.map((v) => trim(v, 2)))} mm`, sub: `${span(ends.map((v) => trim(v / 25.4, 3)))} in` };
  }
  const decimal = `${span(ends.map((v) => trim(v, 3)))} in`;
  const metric = `${span(ends.map((v) => trim(v * 25.4, v * 25.4 < 10 ? 1 : 0)))} mm`;
  // Thickness stays decimal: sheet stock is not sold by the fraction.
  if (kind !== 'thickness') {
    const named = ends.map((v) => fraction(v) ?? (kind === 'diameter' ? gauge(v) : null));
    if (named.every((s): s is string => s !== null)) {
      const numbered = named.some((s) => s.startsWith('#'));
      const unit = named[named.length - 1].startsWith('#') ? '' : ' in';
      return { main: span(named) + unit, sub: numbered ? `${decimal} · ${metric}` : metric };
    }
    const mm = ends.map(wholeMm);
    if (mm.every((m): m is number => m !== null)) return { main: `${span(mm.map(String))} mm`, sub: decimal };
  }
  return { main: decimal, sub: metric };
}

/** A size on one line, for tables. */
export function sizeText(r: DimensionRange | undefined, kind: SizeKind = 'length'): string {
  return size(r, kind)?.main ?? '';
}

type Any = Fastener & Record<string, any>;

/** The two or three attributes that tell one entry from its neighbors. */
export function traits(f: Fastener): string[] {
  const a = f as Any;
  const out: string[] = [];
  if (a.category === 'washer') out.push(label(a.washerType));
  if (a.category === 'anchor' && a.baseMaterial) out.push(a.baseMaterial.map((m: string) => label(m)).join(', '));
  if (a.headStyle && a.headStyle !== 'none' && a.category !== 'nut' && a.category !== 'anchor') out.push(`${label(a.headStyle)} head`);
  if (a.driveType && a.driveType !== 'none' && a.category !== 'nut' && a.category !== 'anchor' && !(a.headStyle === 'hex' && a.driveType === 'hex')) out.push(`${label(a.driveType)} drive`);
  if (a.category === 'nut' && a.lockingMechanism && a.lockingMechanism !== 'none') out.push(`${label(a.lockingMechanism)} locking`);
  if (a.category === 'screw' && a.threadType) out.push(`${label(a.threadType)} thread`);
  return out;
}

/** Everything a search should match, lowercased. */
export function haystack(f: Fastener): string {
  const a = f as Any;
  return [a.name, a.description, a.category, ...(a.aliases ?? []), ...(a.applications ?? []), ...(a.materials ?? []), ...(a.standards ?? []), a.headStyle, a.driveType, a.threadType, a.washerType, ...(a.baseMaterial ?? [])]
    .filter(Boolean)
    .join(' · ')
    .replace(/-/g, ' ')
    .toLowerCase();
}
