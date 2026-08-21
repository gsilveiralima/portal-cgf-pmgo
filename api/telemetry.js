import { logSafeTelemetry, startApiObservation } from '../lib/observability.js';

const ALLOWED_EVENTS = new Set([
  'page_view',
  'section_opened',
  'search_submitted',
  'orient_submitted',
  'news_opened',
  'assistant_opened',
  'api_error'
]);

const ALLOWED_COMPONENTS = new Set([
  'portal',
  'header',
  'hero',
  'sections',
  'search',
  'orientador',
  'news',
  'assistant',
  'status'
]);

function sameOrigin(req) {
  const headers = req?.headers || {};
  if (headers['sec-fetch-site'] === 'cross-site') return false;
  const origin = headers.origin;
  if (!origin) return true;
  const host = String(headers['x-forwarded-host'] || headers.host || '').split(',')[0].trim();
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function parseBody(req) {
  if (!req?.body) return {};
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length <= 512) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

export default function handler(req, res) {
  const observation = startApiObservation(req, '/api/telemetry');
  observation.applyHeaders(res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    observation.finish(res, 405);
    return res.status(405).json({ ok: false, message: 'Método não permitido.' });
  }

  if (!sameOrigin(req)) {
    observation.finish(res, 403);
    return res.status(403).json({ ok: false, message: 'Origem não permitida.' });
  }

  const body = parseBody(req);
  const keys = Object.keys(body);
  if (!keys.length || keys.some((key) => !['event', 'component'].includes(key))) {
    observation.finish(res, 400);
    return res.status(400).json({ ok: false, message: 'Formato de telemetria inválido.' });
  }

  const event = String(body.event || '');
  const component = String(body.component || 'portal');
  if (!ALLOWED_EVENTS.has(event) || !ALLOWED_COMPONENTS.has(component)) {
    observation.finish(res, 400);
    return res.status(400).json({ ok: false, message: 'Evento de telemetria não permitido.' });
  }

  logSafeTelemetry(event, component);
  observation.finish(res, 204, { mode: 'metadata-only' });
  return res.status(204).end();
}
