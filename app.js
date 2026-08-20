import { FAQS, SECTIONS, SITE } from './public-data.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function sectionCard(section) {
  return `<a class="section-card" href="/secoes/${section.slug}/">
    <span class="section-code">${escapeHtml(section.id)}</span>
    <h3>${escapeHtml(section.title)}</h3>
    <p>${escapeHtml(section.summary)}</p>
    <span class="card-link">Ver seção <span aria-hidden="true">→</span></span>
  </a>`;
}

function renderSections() {
  const grid = $('#section-grid');
  if (grid) grid.innerHTML = SECTIONS.map(sectionCard).join('');
}

function renderFaq() {
  const list = $('#faq-list');
  if (!list) return;
  list.innerHTML = FAQS.map((item, index) => `<details id="faq-${index + 1}" class="faq-item">
    <summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p>
  </details>`).join('');
}

function confidenceBadge(label, value) {
  const pct = Math.round(Number(value || 0) * 100);
  return `<span class="confidence confidence-${escapeHtml(label)}">Confiança ${escapeHtml(label)} · ${pct}%</span>`;
}

async function orient(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const input = $('#orient-input', form);
  const result = $('#orient-result');
  const button = $('button[type="submit"]', form);
  result.className = 'result-card result-loading';
  result.setAttribute('aria-busy', 'true');
  result.innerHTML = '<p>Classificando apenas o assunto geral…</p>';
  button.disabled = true;
  try {
    const response = await fetch('/api/orientar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input.value })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      result.className = 'result-card result-warning';
      result.innerHTML = `<h3>Proteção de dados ativada</h3><p>${escapeHtml(data.message || 'Revise o texto e tente novamente sem dados pessoais.')}</p>`;
      return;
    }
    if (!data.matched) {
      result.className = 'result-card result-neutral';
      result.innerHTML = `<div class="result-head"><h3>Não localizado com segurança</h3>${confidenceBadge(data.confidenceLabel, data.confidence)}</div><p>${escapeHtml(data.message)}</p><a class="text-link" href="#secoes">Consultar todas as seções</a>`;
      return;
    }
    result.className = 'result-card result-success';
    result.innerHTML = `<div class="result-head"><div><span class="section-code">${escapeHtml(data.section.id)}</span><h3>${escapeHtml(data.section.title)}</h3></div>${confidenceBadge(data.confidenceLabel, data.confidence)}</div>
      <p>${escapeHtml(data.section.summary)}</p>
      <p class="result-basis">${escapeHtml(data.basis)}</p>
      <div class="result-actions"><a class="button" href="${escapeHtml(data.section.url)}">Abrir orientação da seção</a><span>Caixa SEI ${escapeHtml(data.section.sei)}</span></div>`;
  } catch {
    result.className = 'result-card result-warning';
    result.innerHTML = '<h3>Orientador indisponível</h3><p>Consulte a lista de seções ou utilize o Fale Conosco oficial da PMGO.</p>';
  } finally {
    result.removeAttribute('aria-busy');
    button.disabled = false;
  }
}

async function loadNews() {
  const posts = $('#news-grid');
  const status = $('#news-status');
  if (!posts) return;
  try {
    const response = await fetch('/api/news', { headers: { Accept: 'application/json' } });
    const data = await response.json();
    posts.innerHTML = (data.posts || []).map((post) => `<a class="news-card" href="${escapeHtml(post.link)}" target="_blank" rel="noopener noreferrer">
      <small>PMGO · ${new Date(post.date).toLocaleDateString('pt-BR')}</small><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt || 'Publicação institucional.')}</p><span class="card-link">Ler no portal oficial <span aria-hidden="true">↗</span></span>
    </a>`).join('');
    const stamp = data.fetchedAt ? new Date(data.fetchedAt).toLocaleString('pt-BR') : '';
    status.textContent = data.ok ? `Sincronizado via backend · ${stamp}` : 'Fallback seguro · consulte o portal oficial';
  } catch {
    status.textContent = 'Canal oficial disponível';
    posts.innerHTML = `<a class="news-card" href="${SITE.officialPmgo}" target="_blank" rel="noopener noreferrer"><h3>Portal oficial da PMGO</h3><p>Consulte as publicações institucionais diretamente na fonte.</p></a>`;
  }
}

async function searchSite(event) {
  event.preventDefault();
  const q = $('#site-search').value.trim();
  const box = $('#search-results');
  if (!q) return;
  box.hidden = false;
  box.setAttribute('aria-busy', 'true');
  box.innerHTML = '<p>Pesquisando…</p>';
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    if (!data.results?.length) {
      box.innerHTML = '<p>Nenhum resultado público localizado. Tente descrever o assunto com outras palavras.</p>';
      return;
    }
    box.innerHTML = data.results.map((item) => `<a href="${escapeHtml(item.url)}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.excerpt)}</span></a>`).join('');
  } catch {
    box.innerHTML = '<p>A busca está temporariamente indisponível.</p>';
  } finally {
    box.removeAttribute('aria-busy');
  }
}

function setupMenu() {
  const toggle = $('.menu-toggle');
  const menu = $('#primary-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.dataset.open = String(!expanded);
  });
  $$('#primary-menu a').forEach((a) => a.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.dataset.open = 'false';
  }));
}

renderSections();
renderFaq();
setupMenu();
$('#orient-form')?.addEventListener('submit', orient);
$('#search-form')?.addEventListener('submit', searchSite);
loadNews();
