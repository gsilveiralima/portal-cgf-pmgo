import { classifySection, confidenceLabel } from '../lib/classifier.js';
import { validatePublicPrompt } from '../lib/security.js';

function send(res, status, payload) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.json(payload);
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { ok: false, message: 'Método não permitido.' });
  }

  const message = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body).message; } catch { return ''; } })() : req.body?.message;
  const validation = validatePublicPrompt(message);
  if (!validation.ok) return send(res, 400, { ok: false, blocked: validation.code === 'SENSITIVE_DATA', ...validation });

  const result = classifySection(validation.value);
  if (!result.section) {
    return send(res, 200, {
      ok: true,
      matched: false,
      confidence: Number(result.confidence.toFixed(2)),
      confidenceLabel: 'baixa',
      message: 'Não foi possível identificar a seção com segurança. Utilize os canais oficiais da PMGO ou consulte a lista completa de seções.',
      alternatives: result.alternatives,
      privacy: 'Nenhum dado digitado é gravado em banco de dados por este orientador.'
    });
  }

  const section = result.section;
  return send(res, 200, {
    ok: true,
    matched: true,
    section: {
      id: section.id,
      slug: section.slug,
      title: section.title,
      summary: section.summary,
      url: `/secoes/${section.slug}/`,
      sei: section.contact.sei
    },
    confidence: Number(result.confidence.toFixed(2)),
    confidenceLabel: confidenceLabel(result.confidence),
    basis: 'Classificador probabilístico local, treinado apenas com descrições e termos públicos das seções do CGF. Não consulta sistemas, processos ou bases pessoais.',
    source: section.source,
    alternatives: result.alternatives,
    privacy: 'Nenhum dado digitado é gravado em banco de dados por este orientador.'
  });
}
