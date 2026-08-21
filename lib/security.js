import { detectSensitiveData } from './privacy.js';

export { detectSensitiveData } from './privacy.js';

export function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function validatePublicPrompt(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return { ok: false, code: 'EMPTY', message: 'Descreva apenas o assunto geral da sua dúvida.' };
  if (raw.length > 500) return { ok: false, code: 'TOO_LONG', message: 'Resuma o assunto em até 500 caracteres, sem dados pessoais.' };
  const detected = detectSensitiveData(raw);
  if (detected.length) {
    return {
      ok: false,
      code: 'SENSITIVE_DATA',
      detected,
      message: `Remova ${detected.join(', ')} e descreva somente o tema geral. O portal não recebe dados pessoais, bancários, credenciais ou números de processo.`
    };
  }
  return { ok: true, value: raw };
}
