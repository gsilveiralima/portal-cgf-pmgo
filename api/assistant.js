import { generateText } from 'ai';
import { buildAssistantContext, ASSISTANT_POLICY } from '../lib/assistant-context.js';
import { classifySection, confidenceLabel } from '../lib/classifier.js';
import { validatePublicPrompt } from '../lib/security.js';

const MAX_HISTORY = 8;
const MAX_MESSAGE = 500;

function send(res, status, payload) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.json(payload);
}

function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(-MAX_HISTORY).flatMap((item) => {
    const role = item?.role === 'assistant' ? 'assistant' : item?.role === 'user' ? 'user' : null;
    const content = String(item?.content || '').trim().slice(0, MAX_MESSAGE);
    return role && content ? [{ role, content }] : [];
  });
}

function conversationText(history, message) {
  const recent = history.map((item) => `${item.role === 'assistant' ? 'Assistente' : 'Usuário'}: ${item.content}`).join('\n');
  return `${recent ? `${recent}\n` : ''}Usuário: ${message}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { ok: false, message: 'Método não permitido.' });
  }

  if (req.headers['sec-fetch-site'] === 'cross-site') {
    return send(res, 403, { ok: false, message: 'Origem não permitida.' });
  }

  const message = String(req.body?.message || '').trim();
  const validation = validatePublicPrompt(message);
  if (!validation.ok) {
    return send(res, 400, {
      ok: false,
      blocked: validation.code === 'SENSITIVE_DATA',
      code: validation.code,
      detected: validation.detected || [],
      message: validation.message
    });
  }

  const history = cleanHistory(req.body?.history);
  for (const item of history.filter((entry) => entry.role === 'user')) {
    const historyValidation = validatePublicPrompt(item.content);
    if (!historyValidation.ok && historyValidation.code === 'SENSITIVE_DATA') {
      return send(res, 400, {
        ok: false,
        blocked: true,
        code: 'SENSITIVE_DATA',
        message: 'A conversa contém dados pessoais. Inicie uma nova pergunta descrevendo somente o assunto geral.'
      });
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
    email: routing.section.contact.email,
    source: routing.section.source?.label
  } : null;

  const prompt = [
    'BASE PÚBLICA AUTORIZADA (única fonte para afirmações institucionais):',
    JSON.stringify(context),
    probable ? `\nTRIAGEM LOCAL: seção mais provável ${JSON.stringify(probable)}; confiança ${Math.round(routing.confidence * 100)}%.` : '\nTRIAGEM LOCAL: baixa confiança; não force uma seção.',
    '\nCONVERSA RECENTE:',
    conversationText(history, validation.value)
  ].join('\n');

  try {
    const result = await generateText({
      model: 'openai/gpt-5.6-luna',
      system: ASSISTANT_POLICY,
      prompt,
      maxOutputTokens: 500
    });

    const answer = String(result.text || '').trim();
    if (!answer) throw new Error('Empty AI response');

    return send(res, 200, {
      ok: true,
      answer,
      route: routing.section ? {
        id: routing.section.id,
        title: routing.section.title,
        url: `/secoes/${routing.section.slug}/`,
        confidence: Number(routing.confidence.toFixed(2)),
        confidenceLabel: confidenceLabel(routing.confidence)
      } : null,
      privacy: 'A conversa não é armazenada pelo Portal CGF. Não informe dados pessoais, processuais, bancários ou sigilosos.',
      source: 'Base pública do Portal CGF / canais oficiais da PMGO'
    });
  } catch (error) {
    console.error('Assistant failure', error?.name || 'Error');
    return send(res, 502, {
      ok: false,
      code: 'AI_UNAVAILABLE',
      message: 'O assistente está temporariamente indisponível. Utilize o orientador do portal ou os canais oficiais da PMGO.'
    });
  }
}
