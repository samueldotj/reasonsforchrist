// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Update `site` once a custom domain is connected on Vercel.
export default defineConfig({
  site: 'https://reasonsforchrist.vercel.app',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
