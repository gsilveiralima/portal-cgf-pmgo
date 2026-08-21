import { useState } from 'react';
import { containsSensitiveData } from '../../lib/privacy.js';
import { searchPortal } from '../services/api.js';
import { track } from '../services/telemetry.js';

export function SearchPanel() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState({ loading: false, results: [], message: '' });

  async function submit(event) {
    event.preventDefault();
    const value = query.trim();
    if (!value || state.loading) return;

    if (containsSensitiveData(value)) {
      setQuery('');
      setState({ loading: false, results: [], message: 'Busca bloqueada localmente para evitar envio de dados pessoais ou processuais.' });
      return;
    }

    track('search_submitted', 'search');
    setState({ loading: true, results: [], message: '' });
    try {
      const data = await searchPortal(value);
      setState({
        loading: false,
        results: data.results || [],
        message: data.results?.length ? '' : 'Nenhum resultado público localizado.'
      });
    } catch (error) {
      setState({ loading: false, results: [], message: error.message || 'Busca indisponível.' });
    }
  }

  return (
    <section className="search-panel" aria-labelledby="search-title">
      <div>
        <span className="eyebrow">Busca do portal</span>
        <h2 id="search-title">Encontre uma orientação</h2>
      </div>
      <form onSubmit={submit} className="search-form-react">
        <label className="sr-only" htmlFor="portal-search-input">Pesquisar no portal</label>
        <input
          id="portal-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          maxLength="500"
          autoComplete="off"
          placeholder="Ex.: averbação de tempo de serviço"
        />
        <button type="submit" disabled={state.loading}>{state.loading ? 'Buscando…' : 'Buscar'}</button>
      </form>
      <div className="search-results-react" aria-live="polite">
        {state.message && <p>{state.message}</p>}
        {state.results.map((item) => (
          <a key={`${item.url}-${item.title}`} href={item.url}>
            <strong>{item.title}</strong>
            <span>{item.excerpt}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
