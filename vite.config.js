import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      // Optimize the static raster assets in /public during build.
      // Produces .webp/.avif variants (browser picks via <picture> where used;
      // the originals are still served as a fallback).
      test: /\.(jpe?g|png|gif|tiff|webp|svg)$/i,
      includePublic: true,
      enforce: 'pre',
      logStats: true,
      // Avif gives best compression; webp is the broadly-supported fallback.
      convertTo: ['avif', 'webp'],
      // Cap dimensions so the multi-MB hero/city JPGs are right-sized for the
      // web (they are displayed at most ~1280px wide). Avatars stay tiny.
      jpg: { quality: 82, mozjpeg: true },
      jpeg: { quality: 82, mozjpeg: true },
      png: { quality: 90 },
      webp: { quality: 80 },
      avif: { quality: 65, effort: 4 },
      resize: { width: 1600 },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
