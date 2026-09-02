// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Secondary listings for the fasteners catalogued in two categories. Their
// canonical points at the primary (see src/utils/canonical.ts), so they stay
// out of the sitemap rather than contradicting it.
const NON_CANONICAL = [
  '/screws/hanger-bolt/',
  '/anchors/t-nut/',
  '/bolts/toggle-bolt/',
];

// https://astro.build/config
export default defineConfig({
  // Astro 7 defaults this to 'jsx', which strips the whitespace between a text
  // node and an adjacent element and silently glues words together ("Built
  // byksmith"). `true` restores the v5 behavior byte for byte, at a few
  // percent more HTML before gzip. See rig/runbooks/ASTRO_UPGRADE.md.
  compressHTML: true,
  site: 'https://fasteners.fyi',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !NON_CANONICAL.some((path) => page.endsWith(path)),
    }),
  ],
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()]
  },
  server: {
    port: 7010,
    allowedHosts: true,
  },
});
