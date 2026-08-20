import { SECTIONS, SITE } from './public-data.js';

const slug = document.body.dataset.section;
const section = SECTIONS.find((item) => item.slug === slug);
const main = document.getElementById('section-content');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

if (!section) {
  location.replace('/404.html');
} else {
  document.title = `${section.id} — ${section.title} | CGF Goiás`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = `${section.id}: ${section.summary}`;
  main.innerHTML = `
    <section class="section-hero compact">
      <div class="container">
        <a class="breadcrumb" href="/">Início</a><span aria-hidden="true">/</span><span>${escapeHtml(section.id)}</span>
        <p class="eyebrow">${escapeHtml(section.id)} · orientação pública</p>
        <h1>${escapeHtml(section.title)}</h1>
        <p class="lead">${escapeHtml(section.summary)}</p>
      </div>
    </section>
    <section class="container section-layout">
      <article>
        <h2>Assuntos relacionados</h2>
        <ul class="topic-list">${section.publicTopics.map((topic) => `<li>${escapeHtml(topic)}</li>`).join('')}</ul>
        <div class="notice"><strong>Limite de atendimento</strong><p>Esta página não consulta casos individuais, não recebe documentos e não reproduz procedimentos internos, dados reservados ou informações operacionais.</p></div>
        <h2>Fonte pública</h2>
        <p>${escapeHtml(section.source.label)}. ${escapeHtml(section.source.note)}</p>
        <a class="text-link" href="${escapeHtml(section.source.url)}" target="_blank" rel="noopener noreferrer">Consultar portarias da PMGO ↗</a>
      </article>
      <aside class="contact-card" aria-label="Contato público">
        <span class="section-code">${escapeHtml(section.id)}</span>
        <h2>Contato público</h2>
        <dl><div><dt>Caixa SEI</dt><dd>${escapeHtml(section.contact.sei)}</dd></div><div><dt>Telefone</dt><dd>${escapeHtml(section.contact.phone)}</dd></div><div><dt>E-mail</dt><dd>${section.contact.email ? `<a href="mailto:${escapeHtml(section.contact.email)}">${escapeHtml(section.contact.email)}</a>` : 'Não informado na fonte consultada'}</dd></div></dl>
        <p class="source-note">Fonte: <a href="${escapeHtml(section.contact.source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(section.contact.source.label)}</a>${section.contact.source.verifiedAt ? ` · verificado em ${escapeHtml(section.contact.source.verifiedAt)}` : ''}.</p>
        <p class="source-note">${escapeHtml(section.contact.source.note)}</p>
      </aside>
    </section>
    <section class="callout"><div class="container split"><div><p class="eyebrow">Precisa confirmar?</p><h2>Use sempre o canal oficial.</h2></div><div class="button-row"><a class="button" href="${SITE.articulacao}" target="_blank" rel="noopener noreferrer">Articulação PMGO</a><a class="button button-ghost" href="${SITE.faleConosco}" target="_blank" rel="noopener noreferrer">Fale Conosco</a></div></div></section>`;
}
