import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
        // Sprachdateien nicht vorab laden (zu groß), sondern beim ersten Abspielen merken.
        runtimeCaching: [
          { urlPattern: /\/audio\/manifest\.json$/, handler: 'NetworkFirst', options: { cacheName: 'audio-manifest' } },
          {
            urlPattern: /\/audio\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: { cacheName: 'audio', expiration: { maxEntries: 3000 }, rangeRequests: true }
          }
        ]
      },
      manifest: {
        name: 'Junior Skat',
        short_name: 'Junior Skat',
        description: 'Offiziersskat lernen und spielen – für Kinder und Erwachsene',
        lang: 'de',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#2F5D3A',
        theme_color: '#2F5D3A',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  test: { include: ['src/**/*.test.ts'] }
});
