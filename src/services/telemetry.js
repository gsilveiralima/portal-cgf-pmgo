const EVENTS = new Set([
  'page_view',
  'section_opened',
  'search_submitted',
  'orient_submitted',
  'news_opened',
  'assistant_opened',
  'api_error'
]);

const COMPONENTS = new Set([
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

export function track(event, component = 'portal') {
  if (!EVENTS.has(event) || !COMPONENTS.has(component)) return;
  fetch('/api/telemetry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, component }),
    keepalive: true
  }).catch(() => {});
}
