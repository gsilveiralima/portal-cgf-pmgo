import { FAQS, SECTIONS } from '../public-data.js';
import { normalizeText } from '../lib/security.js';

function score(query, text) {
  const q = normalizeText(query).split(' ').filter((token) => token.length > 2);
  const t = normalizeText(text);
  return q.reduce((sum, token) => sum + (t.includes(token) ? 1 : 0), 0);
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, message: 'Método não permitido.' });
  }
  const q = String(req.query?.q || '').trim().slice(0, 120);
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (q.length < 2) return res.status(200).json({ ok: true, query: q, results: [] });

  const sectionResults = SECTIONS.map((s) => ({
    type: 'section', title: `${s.id} — ${s.title}`, excerpt: s.summary, url: `/secoes/${s.slug}/`,
    score: score(q, [s.id, s.title, s.summary, ...s.publicTopics, ...s.keywords].join(' '))
  }));
  const faqResults = FAQS.map((f, index) => ({
    type: 'faq', title: f.q, excerpt: f.a, url: `/#faq-${index + 1}`,
    score: score(q, `${f.q} ${f.a}`)
  }));
  const results = [...sectionResults, ...faqResults].filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
  return res.status(200).json({ ok: true, query: q, results });
}
