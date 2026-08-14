/**
 * A few fasteners legitimately belong to two categories and are catalogued in
 * both. Keeping both URLs live is deliberate — the cross-category browsing is
 * useful — but only one of them should be the indexed copy, so the secondary
 * points its canonical at the primary.
 *
 * Primary is the category matching what the fastener fundamentally is:
 *   toggle-bolt  → a hollow-wall anchor that happens to be bolt-shaped
 *   t-nut        → a nut
 *   hanger-bolt  → a bolt, threaded for wood at one end
 */
const PRIMARY_CATEGORY: Record<string, string> = {
  'toggle-bolt': 'anchors',
  't-nut': 'nuts',
  'hanger-bolt': 'bolts',
};

/**
 * Returns a canonical path when this category is the secondary listing for the
 * slug, or undefined when the page is already canonical.
 */
export function canonicalFor(category: string, slug: string): string | undefined {
  const primary = PRIMARY_CATEGORY[slug];
  return primary && primary !== category ? `/${primary}/${slug}/` : undefined;
}
