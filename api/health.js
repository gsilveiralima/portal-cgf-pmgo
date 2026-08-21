import { SECTIONS, SITE } from '../public-data.js';
import { SENSITIVE_PATTERNS } from '../lib/privacy.js';
import { startApiObservation } from '../lib/observability.js';

export default function handler(req, res) {
  const observation = startApiObservation(req, '/api/health');
  observation.applyHeaders(res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    observation.finish(res, 405);
    return res.status(405).json({ ok: false, status: 'method_not_allowed' });
  }

  const checks = {
    content: SECTIONS.length === 9,
    privacyPolicy: Array.isArray(SENSITIVE_PATTERNS) && SENSITIVE_PATTERNS.length >= 8,
    officialSourceConfigured: /^https:\/\/goias\.gov\.br\//.test(SITE.officialPmgo)
  };
  const ok = Object.values(checks).every(Boolean);
  const status = ok ? 200 : 503;
  const payload = {
    ok,
    status: ok ? 'healthy' : 'degraded',
    service: 'portal-cgf-pmgo',
    version: '2.3.0',
    timestamp: new Date().toISOString(),
    checks,
    content: { sections: SECTIONS.length, contactsVerifiedAt: SITE.contactsVerifiedAt },
    privacy: { telemetry: 'metadata-only', personalData: 'not-collected-by-application-telemetry' }
  };

  observation.finish(res, status, { ok, count: SECTIONS.length, mode: 'health' });
  if (req.method === 'HEAD') return res.status(status).end();
  return res.status(status).json(payload);
}
