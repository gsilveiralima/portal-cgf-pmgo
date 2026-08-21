import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/search.js';

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

test('busca pública usa no-store e não ecoa dado sensível', () => {
  const req = { method: 'POST', body: { q: 'meu CPF é 123.456.789-10' }, query: {}, headers: {} };
  const res = mockResponse();
  handler(req, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal(res.payload.blocked, true);
  assert.equal(JSON.stringify(res.payload).includes('123.456.789-10'), false);
});

test('busca pública retorna seção por assunto geral via POST', () => {
  const req = { method: 'POST', body: { q: 'recadastramento anual' }, query: {}, headers: {} };
  const res = mockResponse();
  handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.ok, true);
  assert.ok(res.payload.results.some((item) => item.title.includes('CGF/7')));
});

test('busca POST rejeita requisição explicitamente cross-site', () => {
  const req = {
    method: 'POST',
    body: { q: 'recadastramento anual' },
    query: {},
    headers: { 'sec-fetch-site': 'cross-site', origin: 'https://exemplo.invalid' }
  };
  const res = mockResponse();
  handler(req, res);
  assert.equal(res.statusCode, 403);
  assert.equal(res.payload.ok, false);
});
