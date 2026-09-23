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

export const PUBLIC_API_BODY_LIMIT_BYTES = 16 * 1024;

function utf8ByteLength(value) {
  let bytes = 0;
  for (const char of String(value)) {
    const codePoint = char.codePointAt(0);
    bytes += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
  }
  return bytes;
}

export function exceedsPublicPayloadLimit(req, maxBytes = PUBLIC_API_BODY_LIMIT_BYTES) {
  const headers = req?.headers || {};
  const declared = Number.parseInt(String(headers['content-length'] || ''), 10);
  if (Number.isFinite(declared) && declared > maxBytes) return true;

  const body = req?.body;
  if (body == null) return false;

  try {
    const serialized = typeof body === 'string' ? body : JSON.stringify(body);
    return utf8ByteLength(serialized) > maxBytes;
  } catch {
    return true;
  }
}
