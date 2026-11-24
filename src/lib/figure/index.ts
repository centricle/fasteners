// Every figure on the site comes through here: one generated drawing per
// catalog entry, keyed by category and slug.

import type { Fig } from './core';
import type { Opts } from './parts';
import { anchors } from './anchors';
import { bolts } from './bolts';
import { nuts } from './nuts';
import { screws } from './screws';
import { washers } from './washers';

export type { Fig } from './core';

const SETS: Record<string, Record<string, (o?: Opts) => Fig>> = {
  screws,
  bolts,
  anchors,
  nuts,
  washers,
  screw: screws,
  bolt: bolts,
  anchor: anchors,
  nut: nuts,
  washer: washers,
};

export function figure(category: string, slug: string, o: Opts = {}): Fig | null {
  const draw = SETS[category]?.[slug];
  return draw ? draw(o) : null;
}

export function hasFigure(category: string, slug: string): boolean {
  return Boolean(SETS[category]?.[slug]);
}
