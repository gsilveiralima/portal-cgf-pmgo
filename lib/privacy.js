export const SENSITIVE_PATTERNS = Object.freeze([
  ['CPF', /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/],
  ['RG', /\brg\s*[:#-]?\s*\d{5,12}[\dxX]?\b/i],
  ['matrícula', /\bmatr[ií]cula\s*[:#-]?\s*\d{4,12}\b/i],
  ['telefone', /(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?9?\d{4}[-\s]?\d{4}\b/],
  ['e-mail', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ['cartão/conta', /\b(?:\d[ -]*?){13,19}\b/],
  ['processo SEI', /\b(?:sei|processo)\s*(?:n[ºo.]*)?\s*[:#-]?\s*\d{8,}(?:[./-]\d+)*\b/i],
  ['senha', /\b(?:senha|password|pin)\s*[:=-]\s*\S+/i],
  ['token de autenticação', /\b(?:bearer|authorization)\s*[:=]?\s+[A-Za-z0-9._~+\/-]{16,}\b/i],
  ['token JWT', /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/],
  ['chave de API', /\b(?:sk|pk|api)[-_][A-Za-z0-9_-]{16,}\b/i],
  ['endereço', /\b(?:rua|avenida|av\.|alameda|quadra|q\.|logradouro)\s+[\p{L}0-9 .'-]{3,}\s*,?\s*\d{1,6}\b/iu]
]);

export function detectSensitiveData(value = '') {
  const text = String(value);
  return SENSITIVE_PATTERNS.filter(([, regex]) => regex.test(text)).map(([label]) => label);
}

export function containsSensitiveData(value = '') {
  return detectSensitiveData(value).length > 0;
}
