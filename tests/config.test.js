import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const index = read('index.html');
const app = read('src/App.jsx');
const vercel = read('vercel.json');
const vite = read('vite.config.js');
const apiClient = read('src/services/api.js');
const telemetryClient = read('src/services/telemetry.js');
const pkg = JSON.parse(read('package.json'));

test('página principal usa fonte React e não o bundle legado', () => {
  assert.ok(index.includes('/src/main.jsx'));
  assert.equal(index.includes('work-patches.js'), false);
  assert.equal(index.includes('assets/index-CzXOL65S.js'), false);
});

test('FAQs React preservam as âncoras retornadas pela busca', () => {
  assert.ok(app.includes('id={`faq-${index + 1}`}'));
});

test('build Vite está versionado e copia rotas estáticas necessárias', () => {
  assert.ok(vite.includes("from '@vitejs/plugin-react'"));
  assert.ok(vite.includes("fs.cpSync(path.join(ROOT, 'secoes')"));
  assert.ok(vite.includes('sourcemap: false'));
  assert.ok(vercel.includes('"framework": "vite"'));
  assert.ok(vercel.includes('"outputDirectory": "dist"'));
});

test('dependências principais estão fixadas para build reproduzível', () => {
  for (const version of [pkg.dependencies.ai, pkg.dependencies.react, pkg.dependencies['react-dom'], pkg.devDependencies.vite, pkg.devDependencies['@vitejs/plugin-react']]) {
    assert.match(version, /^\d+\.\d+\.\d+$/);
  }
});

test('conteúdo e notícias são consumidos por APIs same-origin', () => {
  assert.ok(apiClient.includes("fetchJson('/api/content')"));
  assert.ok(apiClient.includes("fetchJson('/api/news')"));
  assert.ok(apiClient.includes("fetchJson('/api/health'"));
});

test('telemetria do cliente só transmite evento e componente', () => {
  assert.ok(telemetryClient.includes("JSON.stringify({ event, component })"));
  assert.equal(telemetryClient.includes('userAgent'), false);
  assert.equal(telemetryClient.includes('location.href'), false);
});

test('produção não depende de raw GitHub', () => {
  assert.equal(vercel.includes('raw.githubusercontent.com'), false);
});
