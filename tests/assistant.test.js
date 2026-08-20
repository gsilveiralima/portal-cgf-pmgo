import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAssistantContext, ASSISTANT_POLICY } from '../lib/assistant-context.js';
import { validatePublicPrompt } from '../lib/security.js';

const context = buildAssistantContext();

test('assistente usa exatamente nove seções públicas', () => {
  assert.equal(context.sections.length, 9);
  assert.deepEqual(context.sections.map((section) => section.id), ['CGF/1','CGF/2','CGF/3','CGF/4','CGF/5','CGF/6','CGF/7','CGF/8','CGF/9']);
});

test('contexto público não inclui campos internos de treinamento', () => {
  const serialized = JSON.stringify(context);
  assert.equal(serialized.includes('keywords'), false);
  assert.equal(serialized.includes('training'), false);
});

test('política proíbe consulta a sistemas e pedido de dados pessoais', () => {
  assert.match(ASSISTANT_POLICY, /Não consulte/i);
  assert.match(ASSISTANT_POLICY, /Não peça CPF/i);
  assert.match(ASSISTANT_POLICY, /não pública/i);
});

test('entrada com identificadores pessoais é bloqueada antes da IA', () => {
  assert.equal(validatePublicPrompt('meu CPF é 123.456.789-10').ok, false);
  assert.equal(validatePublicPrompt('meu telefone é (62) 99999-9999').ok, false);
  assert.equal(validatePublicPrompt('quero saber sobre recadastramento').ok, true);
});
