import { useEffect, useState } from 'react';
import { getHealth } from '../services/api.js';

export function StatusPanel() {
  const [state, setState] = useState({ loading: true, data: null, error: false });

  useEffect(() => {
    let active = true;
    getHealth()
      .then((data) => active && setState({ loading: false, data, error: false }))
      .catch(() => active && setState({ loading: false, data: null, error: true }));
    return () => { active = false; };
  }, []);

  const healthy = state.data?.ok === true;
  const label = state.loading ? 'Verificando' : healthy ? 'Operacional' : 'Status parcial';

  return (
    <aside className="status-panel" aria-label="Status dos serviços públicos">
      <span className={`status-dot ${healthy ? 'status-dot--ok' : ''}`} aria-hidden="true" />
      <div>
        <strong>{label}</strong>
        <small>
          {state.loading && 'Health check em andamento'}
          {healthy && `9 seções disponíveis · contatos verificados em ${state.data.content?.contactsVerifiedAt || 'data não informada'}`}
          {state.error && 'O portal segue disponível; o health check não respondeu agora.'}
          {!state.loading && !state.error && !healthy && 'Um ou mais componentes requerem verificação.'}
        </small>
      </div>
      <a href="/api/health" target="_blank" rel="noreferrer">Ver diagnóstico</a>
    </aside>
  );
}
