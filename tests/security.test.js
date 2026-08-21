import test from 'node:test';
import assert from 'node:assert/strict';
import { detectSensitiveData, validatePublicPrompt } from '../lib/security.js';

test('bloqueia credenciais e tokens antes de qualquer processamento', () => {
  assert.ok(detectSensitiveData('Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456').includes('token de autenticação'));
  assert.ok(detectSensitiveData('eyJabcdefghijk.abcdefghijklmnop.abcdefghijklmnop').includes('token JWT'));
  assert.ok(detectSensitiveData('sk-proj_abcdefghijklmnopqrstuvwxyz').includes('chave de API'));
});

test('mantém perguntas públicas sem identificadores liberadas', () => {
  assert.equal(validatePublicPrompt('qual seção cuida de concurso público?').ok, true);
  assert.equal(validatePublicPrompt('preciso de orientação geral sobre recadastramento anual').ok, true);
});
