import { useEffect, useState } from 'react';
import { getNews } from '../services/api.js';
import { track } from '../services/telemetry.js';

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return '';
  }
}

export function NewsFeed({ officialUrl }) {
  const [state, setState] = useState({ loading: true, posts: [], ok: false, fetchedAt: null });

  useEffect(() => {
    let active = true;
    getNews()
      .then((data) => active && setState({ loading: false, posts: data.posts || [], ok: data.ok === true, fetchedAt: data.fetchedAt || null }))
      .catch(() => active && setState({ loading: false, posts: [], ok: false, fetchedAt: null }));
    return () => { active = false; };
  }, []);

  return (
    <section id="atualizacoes" className="portal-section" aria-labelledby="news-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Atualização dinâmica</span>
          <h2 id="news-title">Últimas publicações da PMGO</h2>
          <p>O navegador consulta somente o backend do portal; a integração oficial fica isolada no servidor.</p>
        </div>
        <span className="freshness">
          {state.loading ? 'Sincronizando…' : state.ok ? `Sincronizado ${state.fetchedAt ? formatDate(state.fetchedAt) : ''}` : 'Fallback oficial'}
        </span>
      </div>

      <div className="news-grid-react">
        {state.posts.slice(0, 6).map((post) => (
          <a
            className="news-card-react"
            key={post.id || post.link}
            href={post.link}
            target="_blank"
            rel="noreferrer"
            onClick={() => track('news_opened', 'news')}
          >
            <small>PMGO · {formatDate(post.date)}</small>
            <h3>{typeof post.title === 'string' ? post.title : post.title?.rendered || 'Publicação institucional'}</h3>
            <p>{typeof post.excerpt === 'string' ? post.excerpt : post.excerpt?.rendered || 'Consulte a publicação completa no portal oficial.'}</p>
            <span>Ler na fonte oficial ↗</span>
          </a>
        ))}
      </div>

      {!state.loading && !state.posts.length && officialUrl && (
        <div className="fallback-card">
          <strong>Canal oficial disponível</strong>
          <p>A sincronização não respondeu agora. Consulte as publicações diretamente no portal da PMGO.</p>
          <a href={officialUrl} target="_blank" rel="noreferrer">Abrir portal oficial</a>
        </div>
      )}
    </section>
  );
}
