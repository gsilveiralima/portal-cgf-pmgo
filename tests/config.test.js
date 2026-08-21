import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const vercel = fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8');
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const patches = fs.readFileSync(new URL('../work-patches.js', import.meta.url), 'utf8');

test('hardening carrega antes do bundle canônico', () => {
  assert.ok(index.indexOf('work-patches.js') >= 0);
  assert.ok(index.indexOf('work-patches.js') < index.indexOf('assets/index-CzXOL65S.js'));
});

test('produção não depende de raw GitHub e evita cache imutável prolongado', () => {
  assert.equal(vercel.includes('raw.githubusercontent.com'), false);
  assert.equal(vercel.includes('max-age=31536000, immutable'), false);
});

test('AI SDK está fixado e notícias passam pelo backend same-origin', () => {
  assert.match(pkg.dependencies.ai, /^\d+\.\d+\.\d+$/);
  assert.ok(patches.includes('/api/news?format=wp'));
});
