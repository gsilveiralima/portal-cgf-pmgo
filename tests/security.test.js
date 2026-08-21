import test from 'node:test';
import assert from 'node:assert/strict';
import { containsSensitiveData } from '../lib/privacy.js';
import { detectSensitiveData, validatePublicPrompt } from '../lib/security.js';

test('bloqueia credenciais e tokens antes de qualquer processamento', () => {
  assert.ok(detectSensitiveData('Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456').includes('token de autenticação'));
  assert.ok(detectSensitiveData('eyJabcdefghijk.abcdefghijklmnop.abcdefghijklmnop').includes('token JWT'));
  assert.ok(detectSensitiveData('sk-proj_abcdefghijklmnopqrstuvwxyz').includes('chave de API'));
});

test('política compartilhada detecta identificadores, contato e dados financeiros', () => {
  assert.equal(containsSensitiveData('RG: 1234567'), true);
  assert.equal(containsSensitiveData('matrícula: 37220'), true);
  assert.equal(containsSensitiveData('meu e-mail é usuario@example.com'), true);
  assert.equal(containsSensitiveData('meu telefone é (62) 99999-9999'), true);
  assert.equal(containsSensitiveData('cartão 4111 1111 1111 1111'), true);
  assert.equal(containsSensitiveData('Rua Exemplo, 123'), true);
});

test('validação do servidor reutiliza a mesma política sensível', () => {
  for (const value of [
    'RG: 1234567',
    'matrícula: 37220',
    'usuario@example.com',
    '(62) 99999-9999',
    'Rua Exemplo, 123'
  ]) {
    assert.equal(validatePublicPrompt(value).ok, false, `deveria bloquear: ${value}`);
  }
});

test('mantém perguntas públicas sem identificadores liberadas', () => {
  assert.equal(validatePublicPrompt('qual seção cuida de concurso público?').ok, true);
  assert.equal(validatePublicPrompt('preciso de orientação geral sobre recadastramento anual').ok, true);
  assert.equal(containsSensitiveData('orientação geral sobre reserva remunerada'), false);
});
