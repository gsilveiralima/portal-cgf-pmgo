import test from 'node:test';
import assert from 'node:assert/strict';
import { classifySection, confidenceLabel } from '../lib/classifier.js';
import { detectSensitiveData, validatePublicPrompt } from '../lib/security.js';

const cases = [
  ['identidade funcional', 'CGF/5'],
  ['preciso de orientação sobre pensão alimentícia', 'CGF/9'],
  ['quero saber sobre reserva remunerada', 'CGF/1'],
  ['edital EAC e inscrição em curso', 'CGF/3'],
  ['recadastramento anual no mês do aniversário', 'CGF/7'],
  ['localizar boletim geral antigo', 'CGF/8'],
  ['revisão de proventos de veterano', 'CGF/6'],
  ['agregação e licença por interesse particular', 'CGF/4'],
  ['reinclusão e notificação administrativa', 'CGF/2']
];

for (const [query, expected] of cases) {
  test(`classifica ${query} em ${expected}`, () => {
    const result = classifySection(query);
    assert.equal(result.section?.id, expected);
    assert.ok(result.confidence > 0.34);
  });
}

test('bloqueia CPF e telefone', () => {
  const detected = detectSensitiveData('meu CPF é 123.456.789-10 e telefone (62) 99999-9999');
  assert.ok(detected.includes('CPF'));
  assert.ok(detected.includes('telefone'));
  assert.equal(validatePublicPrompt('CPF 123.456.789-10').ok, false);
});

test('aceita pergunta geral sem identificadores', () => {
  assert.equal(validatePublicPrompt('preciso de orientação sobre identidade funcional').ok, true);
});

test('rotula confiança', () => {
  assert.equal(confidenceLabel(.8), 'alta');
  assert.equal(confidenceLabel(.6), 'média');
  assert.equal(confidenceLabel(.3), 'baixa');
});
