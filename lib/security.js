export function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const detectors = [
  ['CPF', /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/],
  ['RG', /\brg\s*[:#-]?\s*\d{5,12}[\dxX]?\b/i],
  ['matrícula', /\bmatr[ií]cula\s*[:#-]?\s*\d{4,12}\b/i],
  ['telefone', /(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?9?\d{4}[-\s]?\d{4}\b/],
  ['e-mail', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ['cartão/conta', /\b(?:\d[ -]*?){13,19}\b/],
  ['processo SEI', /\b(?:sei|processo)\s*(?:n[ºo.]*)?\s*[:#-]?\s*\d{8,}(?:[./-]\d+)*\b/i],
  ['senha', /\b(?:senha|password|pin)\s*[:=-]\s*\S+/i],
  ['endereço', /\b(?:rua|avenida|av\.|alameda|quadra|q\.|logradouro)\s+[\p{L}0-9 .'-]{3,}\s*,?\s*\d{1,6}\b/iu]
];

export function detectSensitiveData(value = '') {
  const text = String(value);
  return detectors.filter(([, regex]) => regex.test(text)).map(([label]) => label);
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
