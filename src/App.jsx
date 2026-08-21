import { useEffect, useState } from 'react';
import heroMedallion from '../cgf-hero-medallion.png';
import emblem from '../cgf-emblem-digital.png';
import { SectionGrid } from './components/SectionGrid.jsx';
import { SearchPanel } from './components/SearchPanel.jsx';
import { Orientador } from './components/Orientador.jsx';
import { NewsFeed } from './components/NewsFeed.jsx';
import { StatusPanel } from './components/StatusPanel.jsx';
import { getPortalContent } from './services/api.js';
import { track } from './services/telemetry.js';

function Header({ site }) {
  return (
    <>
      <div className="government-bar">
        <div className="shell government-bar__inner">
          <span>Polícia Militar do Estado de Goiás</span>
          <a href={site?.officialPmgo || 'https://goias.gov.br/policiamilitar/'} target="_blank" rel="noreferrer">Portal oficial PMGO ↗</a>
        </div>
      </div>
      <header className="portal-header">
        <div className="shell portal-header__inner">
          <a href="#inicio" className="brand-react" aria-label="CGF Goiás — página inicial">
            <img src={emblem} alt="" />
            <span><strong>CGF Goiás</strong><small>Comando de Gestão e Finanças</small></span>
          </a>
          <nav aria-label="Navegação principal">
            <a href="#orientador">Orientador</a>
            <a href="#secoes">Seções</a>
            <a href="#atualizacoes">Atualizações</a>
            <a href="#transparencia">Transparência técnica</a>
          </nav>
        </div>
      </header>
    </>
  );
}

function Hero({ site }) {
  return (
    <section id="inicio" className="hero-react">
      <div className="shell hero-react__grid">
        <div className="hero-react__content">
          <span className="eyebrow">Gestão pública orientada por informação</span>
          <h1>Um portal do CGF construído para orientar, atualizar e evoluir.</h1>
          <p>Base React versionada, dados públicos carregados dinamicamente, integração segura com publicações da PMGO e serviços observáveis sem registrar dados pessoais na telemetria da aplicação.</p>
          <div className="hero-react__actions">
            <a className="button-primary" href="#orientador">Encontrar a seção responsável</a>
            <a className="button-secondary" href={site?.articulacao || '#secoes'} target="_blank" rel="noreferrer">Confirmar contatos oficiais</a>
          </div>
          <div className="hero-react__trust">
            <span>Sem consulta a processos individuais</span>
            <span>Privacidade por padrão</span>
            <span>Conteúdo público versionado</span>
          </div>
        </div>
        <div className="hero-react__media" aria-hidden="true">
          <img src={heroMedallion} alt="" />
          <div className="hero-react__ring" />
        </div>
      </div>
    </section>
  );
}

function Faq({ faqs = [] }) {
  return (
    <section className="portal-section portal-section--soft" aria-labelledby="faq-title">
      <div className="section-heading section-heading--compact">
        <div><span className="eyebrow">Dúvidas frequentes</span><h2 id="faq-title">Como o portal funciona</h2></div>
      </div>
      <div className="faq-grid-react">
        {faqs.map((item, index) => (
          <details key={`${index}-${item.q}`}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function TechnicalTransparency() {
  return (
    <section id="transparencia" className="portal-section technical-section" aria-labelledby="technical-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Transparência técnica</span>
          <h2 id="technical-title">Arquitetura preparada para evolução contínua</h2>
          <p>A interface deixou de depender de correções sobre um bundle compilado. Componentes, APIs e política de privacidade passam a ter fonte versionada e auditável.</p>
        </div>
      </div>
      <div className="technical-grid">
        <article><strong>React + Vite</strong><p>Componentes versionados, build reproduzível e fonte legível.</p></article>
        <article><strong>Conteúdo dinâmico</strong><p>Seções, contatos e FAQs chegam pela API pública em tempo de execução.</p></article>
        <article><strong>Observabilidade segura</strong><p>Request ID, duração e status das APIs, sem corpo da requisição, IP ou identificadores pessoais no log criado pela aplicação.</p></article>
        <article><strong>Health checks</strong><p>Diagnóstico técnico público e mínimo em <code>/api/health</code>.</p></article>
      </div>
    </section>
  );
}

function Footer({ site }) {
  return (
    <footer className="portal-footer">
      <div className="shell portal-footer__grid">
        <div><strong>CGF Goiás</strong><p>Portal de orientação pública do Comando de Gestão e Finanças da PMGO.</p></div>
        <div>
          <a href={site?.faleConosco || '#'} target="_blank" rel="noreferrer">Fale Conosco PMGO</a>
          <a href={site?.acessoInformacao || '#'} target="_blank" rel="noreferrer">Acesso à Informação</a>
          <a href="/api/health" target="_blank" rel="noreferrer">Status técnico</a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [content, setContent] = useState({ loading: true, site: null, sections: [], faqs: [], updatedAt: null, error: false });

  useEffect(() => {
    track('page_view', 'portal');
    let active = true;
    getPortalContent()
      .then((data) => active && setContent({ loading: false, site: data.site, sections: data.sections || [], faqs: data.faqs || [], updatedAt: data.updatedAt, error: false }))
      .catch(() => active && setContent((current) => ({ ...current, loading: false, error: true })));
    return () => { active = false; };
  }, []);

  return (
    <div className="portal-app">
      <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
      <Header site={content.site} />
      <main id="conteudo">
        <Hero site={content.site} />
        <div className="shell portal-flow">
          <StatusPanel />
          <SearchPanel />
          <Orientador />
          {content.loading && <section className="loading-card" aria-live="polite">Carregando seções e contatos públicos…</section>}
          {content.error && <section className="loading-card loading-card--warning">A API de conteúdo não respondeu. Use os canais oficiais da PMGO enquanto o conteúdo dinâmico é restabelecido.</section>}
          {!content.loading && !content.error && <SectionGrid sections={content.sections} updatedAt={content.updatedAt} />}
          <NewsFeed officialUrl={content.site?.officialPmgo} />
          <Faq faqs={content.faqs} />
          <TechnicalTransparency />
        </div>
      </main>
      <Footer site={content.site} />
    </div>
  );
}
