import { FAQS, SECTIONS, SITE } from '../public-data.js';
import { startApiObservation } from '../lib/observability.js';

function publicSection(section) {
  return {
    slug: section.slug,
    id: section.id,
    title: section.title,
    summary: section.summary,
    publicTopics: section.publicTopics,
    contact: section.contact,
    source: section.source
  };
}

export default function handler(req, res) {
  const observation = startApiObservation(req, '/api/content');
  observation.applyHeaders(res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    observation.finish(res, 405);
    return res.status(405).json({ ok: false, message: 'Método não permitido.' });
  }

  const sections = SECTIONS.map(publicSection);
  const payload = {
    ok: true,
    schemaVersion: 1,
    updatedAt: SITE.contactsVerifiedAt,
    site: SITE,
    sections,
    faqs: FAQS
  };

  observation.finish(res, 200, { count: sections.length, source: 'public-data' });
  return res.status(200).json(payload);
}
