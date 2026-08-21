import { generateText } from 'ai';
import { buildAssistantContext, ASSISTANT_POLICY } from '../lib/assistant-context.js';
import { classifySection, confidenceLabel } from '../lib/classifier.js';
import { startApiObservation } from '../lib/observability.js';
import { validatePublicPrompt } from '../lib/security.js';

const MAX_HISTORY = 8;
const MAX_MESSAGE = 500;

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

function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(-MAX_HISTORY).flatMap((item) => {
    const role = item?.role === 'assistant' ? 'assistant' : item?.role === 'user' ? 'user' : null;
    const content = String(item?.content || '').trim().slice(0, MAX_MESSAGE);
    return role && content ? [{ role, content }] : [];
  });
}

function routePayload(routing) {
  return routing.section ? {
    id: routing.section.id,
    title: routing.section.title,
    url: `/secoes/${routing.section.slug}/`,
    confidence: Number(routing.confidence.toFixed(2)),
    confidenceLabel: confidenceLabel(routing.confidence)
  } : null;
}

function fallbackAnswer(routing) {
  const prefix = 'A camada generativa de IA está temporariamente indisponível; estou usando a triagem automática da base pública do CGF. ';
  if (!routing.section) return prefix + 'Não consegui identificar uma seção com segurança. Consulte a lista de seções do portal ou utilize a Articulação PMGO/Fale Conosco para confirmação institucional.';
  const section = routing.section;
  const contact = [
    `Caixa SEI ${section.contact.sei}`,
    section.contact.phone ? `telefone ${section.contact.phone}` : null,
    section.contact.email ? `e-mail ${section.contact.email}` : null
  ].filter(Boolean).join(' · ');
  return `${prefix}A seção mais provável é ${section.id} — ${section.title}. ${section.summary} Contato público: ${contact}. Confirme no canal oficial antes de enviar documentos ou dados pessoais.`;
}

export default async function handler(req, res) {
  const observation = startApiObservation(req, '/api/assistant');
  observation.applyHeaders(res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, observation, 405, { ok: false, message: 'Método não permitido.' });
  }
  if (!sameOrigin(req)) return send(res, observation, 403, { ok: false, message: 'Origem não permitida.' });

  const body = parseBody(req.body);
  const message = String(body.message || '').trim();
  const validation = validatePublicPrompt(message);
  if (!validation.ok) {
    return send(res, observation, 400, {
      ok: false,
      blocked: validation.code === 'SENSITIVE_DATA',
      code: validation.code,
      detected: validation.detected || [],
      message: validation.message
    }, { mode: validation.code === 'SENSITIVE_DATA' ? 'privacy-block' : 'validation' });
  }

  const history = cleanHistory(body.history);
  for (const item of history.filter((entry) => entry.role === 'user')) {
    const checked = validatePublicPrompt(item.content);
    if (!checked.ok && checked.code === 'SENSITIVE_DATA') {
      return send(res, observation, 400, {
        ok: false,
        blocked: true,
        code: 'SENSITIVE_DATA',
        message: 'A conversa contém dados pessoais. Inicie uma nova pergunta descrevendo somente o assunto geral.'
      }, { mode: 'history-privacy-block' });
    }
  }

  const routing = classifySection(validation.value);
  const context = buildAssistantContext();
  const probable = routing.section ? {
    id: routing.section.id,
    title: routing.section.title,
    summary: routing.section.summary,
    sei: routing.section.contact.sei,
    phone: routing.section.contact.phone,
    email: routing.section.contact.email
  } : null;
  const recent = history.map((item) => `${item.role === 'assistant' ? 'Assistente' : 'Usuário'}: ${item.content}`).join('\n');
  const prompt = `BASE PÚBLICA AUTORIZADA (única fonte institucional):\n${JSON.stringify(context)}\n${probable ? `TRIAGEM LOCAL: ${JSON.stringify(probable)}; confiança ${Math.round(routing.confidence * 100)}%.` : 'TRIAGEM LOCAL: baixa confiança; não force uma seção.'}\nCONVERSA RECENTE:\n${recent}\nUsuário: ${validation.value}`;

  try {
    const result = await generateText({
      model: 'openai/gpt-5.6-sol',
      system: ASSISTANT_POLICY,
      prompt,
      maxOutputTokens: 500
    });
    const answer = String(result.text || '').trim();
    if (!answer) throw new Error('Empty AI response');
    return send(res, observation, 200, {
      ok: true,
      mode: 'ai',
      answer,
      route: routePayload(routing),
      privacy: 'O Portal CGF não mantém banco de dados de conversas. O texto é processado somente para gerar a orientação solicitada.',
      source: 'Base pública do Portal CGF / canais oficiais da PMGO'
    }, { mode: 'ai', source: routing.section?.id || 'unmatched' });
  } catch (error) {
    console.error('Assistant AI unavailable', error?.name || 'Error');
    return send(res, observation, 200, {
      ok: true,
      mode: 'public-fallback',
      answer: fallbackAnswer(routing),
      route: routePayload(routing),
      privacy: 'O Portal CGF não mantém banco de dados de conversas.',
      source: 'Base pública local do Portal CGF'
    }, { mode: 'public-fallback', source: routing.section?.id || 'unmatched' });
  }
}
