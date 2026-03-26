// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  devToolbar: {
    enabled: false,
  },
  vite: {
    server: {
      host: true,
      allowedHosts: ['localhost', '127.0.0.1', '.loca.lt'],
    },
  },
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [tailwind()],
});
