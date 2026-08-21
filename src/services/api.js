const DEFAULT_TIMEOUT_MS = 12000;

export async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...options,
      headers: { Accept: 'application/json', ...(options.headers || {}) },
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || `Falha HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

export function getPortalContent() {
  return fetchJson('/api/content');
}

export function getHealth() {
  return fetchJson('/api/health', { timeoutMs: 6000 });
}

export function getNews() {
  return fetchJson('/api/news');
}

export function searchPortal(query) {
  return fetchJson('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query })
  });
}

export function orientPortal(message) {
  return fetchJson('/api/orientar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
}
