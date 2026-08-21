import { classifySection, confidenceLabel } from '../lib/classifier.js';
import { startApiObservation } from '../lib/observability.js';
import { validatePublicPrompt } from '../lib/security.js';

function send(res, observation, status, payload, extra = {}) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Vary', 'Origin');
  observation.finish(res, status, extra);
  return res.json(payload);
}

function parseBody(body) {
  if (body && typeof body === 'object') return body;
  if (typeof body !== 'string') return {};
  try { return JSON.parse(body); } catch { return {}; }
}

function sameOrigin(req) {
  const headers = req?.headers || {};
  if (headers['sec-fetch-site'] === 'cross-site') return false;
  const origin = headers.origin;
  if (!origin) return true;
  const host = String(headers['x-forwarded-host'] || headers.host || '').split(',')[0].trim();
  if (!host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

export default function handler(req, res) {
  const observation = startApiObservation(req, '/api/orientar');
  observation.applyHeaders(res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, observation, 405, { ok: false, message: 'Método não permitido.' });
  }
  if (!sameOrigin(req)) return send(res, observation, 403, { ok: false, message: 'Origem não permitida.' });

  const body = parseBody(req.body);
  const validation = validatePublicPrompt(body.message);
  if (!validation.ok) {
    return send(res, observation, 400, {
      ok: false,
      blocked: validation.code === 'SENSITIVE_DATA',
      code: validation.code,
      detected: validation.detected || [],
      message: validation.message
    }, { mode: validation.code === 'SENSITIVE_DATA' ? 'privacy-block' : 'validation' });
  }

  const result = classifySection(validation.value);
  if (!result.section) {
    return send(res, observation, 200, {
      ok: true,
      matched: false,
      confidence: Number(result.confidence.toFixed(2)),
      confidenceLabel: 'baixa',
      message: 'Não foi possível identificar a seção com segurança. Utilize os canais oficiais da PMGO ou consulte a lista completa de seções.',
      alternatives: result.alternatives,
      privacy: 'Nenhum dado digitado é gravado em banco de dados por este orientador.'
    }, { mode: 'unmatched' });
  }

  const section = result.section;
  return send(res, observation, 200, {
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
  }, { mode: 'matched', source: section.id });
}
