import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';

function safePath(req) {
  try {
    return new URL(req?.url || '/', 'https://portal.local').pathname;
  } catch {
    return '/';
  }
}

function safeMethod(req) {
  return String(req?.method || 'GET').toUpperCase().slice(0, 12);
}

export function startApiObservation(req, endpoint) {
  const startedAt = performance.now();
  const requestId = randomUUID();
  const route = String(endpoint || safePath(req)).slice(0, 80);
  const method = safeMethod(req);

  return {
    requestId,
    applyHeaders(res) {
      res.setHeader('X-Request-ID', requestId);
      res.setHeader('X-CGF-Observability', 'safe-metadata-only');
    },
    finish(res, statusCode = res?.statusCode || 200, extra = {}) {
      const durationMs = Math.max(0, performance.now() - startedAt);
      res?.setHeader?.('Server-Timing', `app;dur=${durationMs.toFixed(1)}`);

      const record = {
        type: 'api_request',
        requestId,
        endpoint: route,
        method,
        status: Number(statusCode) || 500,
        durationMs: Number(durationMs.toFixed(1)),
        timestamp: new Date().toISOString(),
        ...sanitizeExtra(extra)
      };

      console.info(JSON.stringify(record));
      return record;
    }
  };
}

export function logSafeTelemetry(event, component = 'portal') {
  const record = {
    type: 'product_telemetry',
    event: String(event).slice(0, 48),
    component: String(component).slice(0, 48),
    timestamp: new Date().toISOString()
  };
  console.info(JSON.stringify(record));
  return record;
}

function sanitizeExtra(extra) {
  const safe = {};
  if (!extra || typeof extra !== 'object') return safe;

  if (typeof extra.mode === 'string') safe.mode = extra.mode.slice(0, 32);
  if (typeof extra.source === 'string') safe.source = extra.source.slice(0, 48);
  if (Number.isFinite(extra.count)) safe.count = Math.max(0, Math.floor(extra.count));
  if (typeof extra.ok === 'boolean') safe.ok = extra.ok;

  return safe;
}
