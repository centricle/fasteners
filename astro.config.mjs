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
