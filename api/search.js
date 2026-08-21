import { FAQS, SECTIONS } from '../public-data.js';
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

export default function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, message: 'Método não permitido.' });
  }

  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const body = parseBody(req.body);
  const raw = req.method === 'POST' ? body.q : req.query?.q;
  const q = String(raw || '').trim().slice(0, 120);
  if (q.length < 2) return res.status(200).json({ ok: true, results: [] });

  const validation = validatePublicPrompt(q);
  if (!validation.ok) {
    return res.status(400).json({
      ok: false,
      blocked: validation.code === 'SENSITIVE_DATA',
      code: validation.code,
      detected: validation.detected || [],
      message: validation.message
    });
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

  return res.status(200).json({ ok: true, results });
}
