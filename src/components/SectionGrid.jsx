import { track } from '../services/telemetry.js';

function ContactLine({ label, value }) {
  if (!value) return null;
  return <span><b>{label}:</b> {value}</span>;
}

export function SectionGrid({ sections = [], updatedAt }) {
  return (
    <section id="secoes" className="portal-section portal-section--soft" aria-labelledby="sections-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Atendimento por seção</span>
          <h2 id="sections-title">Seções do Comando</h2>
          <p>Conteúdo e contatos são carregados em tempo de execução pela API pública do portal, sem depender do bundle compilado.</p>
        </div>
        {updatedAt && <span className="freshness">Contatos verificados em {updatedAt}</span>}
      </div>

      <div className="section-grid">
        {sections.map((section) => (
          <article className="section-card-react" key={section.slug}>
            <div className="section-card-react__top">
              <span className="section-code">{section.id}</span>
              <span className="section-card-react__source">Fonte pública</span>
            </div>
            <h3>{section.title}</h3>
            <p>{section.summary}</p>
            <div className="section-contact" aria-label={`Contatos de ${section.id}`}>
              <ContactLine label="Caixa SEI" value={section.contact?.sei} />
              <ContactLine label="Telefone" value={section.contact?.phone} />
              <ContactLine label="E-mail" value={section.contact?.email} />
            </div>
            <div className="section-card-react__actions">
              <a href={`/secoes/${section.slug}/`} onClick={() => track('section_opened', 'sections')}>Ver orientação</a>
              {section.contact?.source?.url && (
                <a href={section.contact.source.url} target="_blank" rel="noreferrer">Confirmar fonte</a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
