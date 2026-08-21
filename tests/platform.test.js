import test from 'node:test';
import assert from 'node:assert/strict';
import contentHandler from '../api/content.js';
import healthHandler from '../api/health.js';
import telemetryHandler from '../api/telemetry.js';

function mockResponse() {
  const headers = new Map();
  return {
    statusCode: 200,
    payload: null,
    ended: false,
    headers,
    setHeader(name, value) { headers.set(String(name).toLowerCase(), value); },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
    end() { this.ended = true; return this; }
  };
}

test('API de conteúdo entrega nove seções sem dados internos de classificação', () => {
  const req = { method: 'GET', headers: {}, url: '/api/content' };
  const res = mockResponse();
  contentHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.ok, true);
  assert.equal(res.payload.sections.length, 9);
  assert.equal('keywords' in res.payload.sections[0], false);
  assert.equal('training' in res.payload.sections[0], false);
  assert.ok(res.headers.get('x-request-id'));
});

test('health check reporta serviço e política de telemetria', () => {
  const req = { method: 'GET', headers: {}, url: '/api/health' };
  const res = mockResponse();
  healthHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.ok, true);
  assert.equal(res.payload.content.sections, 9);
  assert.equal(res.payload.privacy.telemetry, 'metadata-only');
  assert.equal(res.headers.get('cache-control'), 'no-store');
});

test('telemetria aceita apenas evento e componente predefinidos', () => {
  const req = {
    method: 'POST',
    headers: {},
    url: '/api/telemetry',
    body: { event: 'page_view', component: 'portal' }
  };
  const res = mockResponse();
  telemetryHandler(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.ended, true);
  assert.equal(res.headers.get('cache-control'), 'no-store');
});

test('telemetria rejeita campo livre que poderia carregar dado pessoal', () => {
  const req = {
    method: 'POST',
    headers: {},
    url: '/api/telemetry',
    body: { event: 'page_view', component: 'portal', text: 'usuario@example.com' }
  };
  const res = mockResponse();
  telemetryHandler(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.ok, false);
});

test('telemetria rejeita origem explicitamente cross-site', () => {
  const req = {
    method: 'POST',
    headers: { 'sec-fetch-site': 'cross-site', origin: 'https://exemplo.invalid' },
    url: '/api/telemetry',
    body: { event: 'page_view', component: 'portal' }
  };
  const res = mockResponse();
  telemetryHandler(req, res);

  assert.equal(res.statusCode, 403);
});
