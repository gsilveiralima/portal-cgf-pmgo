import { useState } from 'react';
import { containsSensitiveData } from '../../lib/privacy.js';
import { orientPortal } from '../services/api.js';
import { track } from '../services/telemetry.js';

export function Orientador() {
  const [message, setMessage] = useState('');
  const [state, setState] = useState({ loading: false, data: null, error: '' });

  async function submit(event) {
    event.preventDefault();
    const value = message.trim();
    if (!value || state.loading) return;

    if (containsSensitiveData(value)) {
      setMessage('');
      setState({ loading: false, data: null, error: 'Proteção de dados ativada no navegador. Remova identificadores, contatos pessoais, endereço, número de processo, dados bancários, senha ou token.' });
      return;
    }

    track('orient_submitted', 'orientador');
    setState({ loading: true, data: null, error: '' });
    try {
      const data = await orientPortal(value);
      setState({ loading: false, data, error: '' });
    } catch (error) {
      setState({ loading: false, data: null, error: error.message || 'Orientador indisponível.' });
    }
  }

  return (
    <section id="orientador" className="portal-section finder-section" aria-labelledby="orient-title">
      <div className="section-heading section-heading--compact">
        <div>
          <span className="eyebrow">Triagem pública</span>
          <h2 id="orient-title">Qual seção pode orientar?</h2>
          <p>Descreva somente o assunto geral. O texto é validado localmente antes do envio.</p>
        </div>
      </div>
      <form className="orient-card" onSubmit={submit}>
        <label htmlFor="orient-react-input">Assunto da dúvida</label>
        <div className="orient-row">
          <textarea
            id="orient-react-input"
            rows="3"
            maxLength="500"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ex.: preciso de orientação sobre recadastramento anual"
            autoComplete="off"
          />
          <button type="submit" disabled={state.loading}>{state.loading ? 'Classificando…' : 'Orientar'}</button>
        </div>
        <small>Não informe CPF, RG, matrícula, telefone pessoal, e-mail, endereço, dados bancários, senha, token ou número de processo.</small>
      </form>

      <div className="result-shell" aria-live="polite">
        {state.error && <div className="result-box result-box--warning"><strong>Revise a solicitação</strong><p>{state.error}</p></div>}
        {state.data?.matched && (
          <div className="result-box result-box--success">
            <span className="section-code">{state.data.section.id}</span>
            <h3>{state.data.section.title}</h3>
            <p>{state.data.section.summary}</p>
            <div className="result-actions">
              <a href={state.data.section.url}>Abrir seção</a>
              <span>Caixa SEI {state.data.section.sei}</span>
            </div>
          </div>
        )}
        {state.data && !state.data.matched && (
          <div className="result-box"><strong>Não localizado com segurança</strong><p>{state.data.message}</p></div>
        )}
      </div>
    </section>
  );
}
