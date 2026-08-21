import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'dist');
const STATIC_FILES = [
  '404.html',
  'assistant.css',
  'cgf-emblem-digital.png',
  'cgf-hero-medallion.png',
  'public-data.js',
  'robots.txt',
  'section.js',
  'site.webmanifest',
  'sitemap.xml',
  'style.css'
];

function copyPortalStatics() {
  return {
    name: 'copy-portal-statics',
    closeBundle() {
      for (const file of STATIC_FILES) {
        fs.copyFileSync(path.join(ROOT, file), path.join(OUT, file));
      }
      fs.cpSync(path.join(ROOT, 'secoes'), path.join(OUT, 'secoes'), { recursive: true });
    }
  };
}

export default defineConfig({
  plugins: [react(), copyPortalStatics()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2022'
  }
});
