import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../api/search.js';
import { SECTIONS } from '../public-data.js';
import { PUBLIC_API_BODY_LIMIT_BYTES, exceedsPublicPayloadLimit } from '../lib/security.js';

function mockResponse() {
  const headers = new Map();
  return {
    statusCode: 200,
    payload: null,
    headers,
    setHeader(name, value) { headers.set(String(name).toLowerCase(), value); },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
}

test('limite P0 rejeita Content-Length acima de 16 KiB', () => {
  const req = {
    headers: { 'content-length': String(PUBLIC_API_BODY_LIMIT_BYTES + 1) },
    body: { q: 'orientação geral' }
  };
  assert.equal(exceedsPublicPayloadLimit(req), true);
});

test('limite P0 mede o corpo quando Content-Length não está disponível', () => {
  const req = { headers: {}, body: { q: 'a'.repeat(PUBLIC_API_BODY_LIMIT_BYTES + 1) } };
  assert.equal(exceedsPublicPayloadLimit(req), true);
  assert.equal(exceedsPublicPayloadLimit({ headers: {}, body: { q: 'recadastramento' } }), false);
});

test('busca retorna 413 antes de processar payload excessivo', () => {
  const req = {
    method: 'POST',
    body: { q: 'a'.repeat(PUBLIC_API_BODY_LIMIT_BYTES + 1) },
    query: {},
    headers: {}
  };
  const res = mockResponse();
  handler(req, res);
  assert.equal(res.statusCode, 413);
  assert.equal(res.payload.code, 'PAYLOAD_TOO_LARGE');
});

test('fonte ativa mantém telefone apenas quando há validação oficial suficiente', () => {
  const withPhone = SECTIONS.filter((section) => section.contact.phone);
  assert.deepEqual(withPhone.map((section) => section.id), ['CGF/3']);
  assert.equal(withPhone[0].contact.phone, '(62) 99953-1211');
  assert.ok(withPhone[0].contact.source.verifiedAt);
});

test('supply chain P0 está materializada no repositório', () => {
  const lock = JSON.parse(fs.readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  const ci = fs.readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  const codeql = fs.readFileSync(new URL('../.github/workflows/codeql.yml', import.meta.url), 'utf8');
  const dependabot = fs.readFileSync(new URL('../.github/dependabot.yml', import.meta.url), 'utf8');

  assert.equal(lock.packages['node_modules/ai'].version, '7.0.68');
  assert.match(ci, /npm ci/);
  assert.match(ci, /npm audit --audit-level=high/);
  assert.match(codeql, /github\/codeql-action\/init@v4/);
  assert.match(dependabot, /interval: weekly/);
});

test('política PUBLIC e separação de ambientes estão documentadas', () => {
  const publicPolicy = fs.readFileSync(new URL('../docs/PUBLIC-POLICY.md', import.meta.url), 'utf8');
  const environments = fs.readFileSync(new URL('../docs/ENVIRONMENTS.md', import.meta.url), 'utf8');
  const waf = fs.readFileSync(new URL('../docs/WAF-RUNBOOK.md', import.meta.url), 'utf8');

  assert.match(publicPolicy, /informação pública/i);
  assert.match(environments, /não autoriza merge nem deploy/i);
  assert.match(waf, /16 KiB/);
});
