import { FAQS, SECTIONS } from '../public-data.js';
import { startApiObservation } from '../lib/observability.js';
import { normalizeText, validatePublicPrompt } from '../lib/security.js';

function score(query, text) {
  const q = normalizeText(query).split(' ').filter((token) => token.length > 2);
  const t = normalizeText(text);
  return q.reduce((sum, token) => sum + (t.includes(token) ? 1 : 0), 0);
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
  const observation = startApiObservation(req, '/api/search');
  observation.applyHeaders(res);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Vary', 'Origin');

  const send = (status, payload, extra = {}) => {
    observation.finish(res, status, extra);
    return res.status(status).json(payload);
  };

  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return send(405, { ok: false, message: 'Método não permitido.' });
  }

  if (req.method === 'POST' && !sameOrigin(req)) {
    return send(403, { ok: false, message: 'Origem não permitida.' });
  }

  const body = parseBody(req.body);
  const raw = req.method === 'POST' ? body.q : req.query?.q;
  const q = String(raw || '').trim().slice(0, 120);
  if (q.length < 2) return send(200, { ok: true, results: [] }, { count: 0 });

  const validation = validatePublicPrompt(q);
  if (!validation.ok) {
    return send(400, {
      ok: false,
      blocked: validation.code === 'SENSITIVE_DATA',
      code: validation.code,
      detected: validation.detected || [],
      message: validation.message
    }, { mode: validation.code === 'SENSITIVE_DATA' ? 'privacy-block' : 'validation' });
  }

  const sectionResults = SECTIONS.map((s) => ({
    type: 'section',
    title: `${s.id} — ${s.title}`,
    excerpt: s.summary,
    url: `/secoes/${s.slug}/`,
    score: score(validation.value, [s.id, s.title, s.summary, ...s.publicTopics, ...s.keywords].join(' '))
  }));
  const faqResults = FAQS.map((f, index) => ({
    type: 'faq',
    title: f.q,
    excerpt: f.a,
    url: `/#faq-${index + 1}`,
    score: score(validation.value, `${f.q} ${f.a}`)
  }));
  const results = [...sectionResults, ...faqResults]
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return send(200, { ok: true, results }, { count: results.length });
}
