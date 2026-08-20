const MAX_HISTORY = 8;
const history = [];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function ensureStylesheet() {
  if (document.querySelector('link[data-cgf-ai]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/assistant.css';
  link.dataset.cgfAi = 'true';
  document.head.appendChild(link);
}

function buildUi() {
  if (document.getElementById('cgf-ai-panel')) return;

  const launcher = el('button', 'cgf-ai-launcher');
  launcher.type = 'button';
  launcher.setAttribute('aria-controls', 'cgf-ai-panel');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-label', 'Abrir Assistente CGF');
  launcher.append(el('span', 'cgf-ai-launcher__mark', 'IA'), el('span', '', 'Assistente CGF'));

  const panel = el('section', 'cgf-ai-panel');
  panel.id = 'cgf-ai-panel';
  panel.dataset.open = 'false';
  panel.setAttribute('aria-label', 'Assistente virtual do CGF');

  const header = el('header', 'cgf-ai-header');
  const titleWrap = el('div', 'cgf-ai-header__title');
  titleWrap.append(el('span', 'cgf-ai-header__badge', 'IA'));
  const titleText = el('div');
  titleText.append(el('strong', '', 'Assistente CGF'), el('small', '', 'Orientação pública com IA'));
  titleWrap.append(titleText);
  const close = el('button', 'cgf-ai-close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Fechar assistente');
  header.append(titleWrap, close);

  const messages = el('div', 'cgf-ai-messages');
  messages.id = 'cgf-ai-messages';
  messages.setAttribute('role', 'log');
  messages.setAttribute('aria-live', 'polite');
  messages.setAttribute('aria-relevant', 'additions');

  const warning = el('p', 'cgf-ai-warning', 'Não informe CPF, RG, matrícula, telefone pessoal, dados bancários, senha, número de processo ou informação sigilosa.');

  const form = el('form', 'cgf-ai-form');
  const label = el('label', '', 'Digite sua dúvida para o Assistente CGF');
  label.htmlFor = 'cgf-ai-input';
  const row = el('div', 'cgf-ai-inputrow');
  const input = document.createElement('textarea');
  input.id = 'cgf-ai-input';
  input.className = 'cgf-ai-input';
  input.maxLength = 700;
  input.rows = 2;
  input.placeholder = 'Ex.: qual seção trata de recadastramento?';
  input.autocomplete = 'off';
  const send = el('button', 'cgf-ai-send', 'Enviar');
  send.type = 'submit';
  row.append(input, send);
  const hint = el('p', 'cgf-ai-hint', 'A IA orienta com base em informações públicas do CGF/PMGO e não consulta processos ou sistemas internos.');
  form.append(label, row, hint);

  panel.append(header, messages, warning, form);
  document.body.append(panel, launcher);

  addMessage('assistant', 'Olá. Sou o Assistente CGF. Posso orientar sobre as seções do Comando de Gestão e Finanças, contatos públicos e assuntos gerais. Descreva somente o tema da sua dúvida, sem dados pessoais.');

  function setOpen(open) {
    panel.dataset.open = String(open);
    launcher.setAttribute('aria-expanded', String(open));
    launcher.setAttribute('aria-label', open ? 'Fechar Assistente CGF' : 'Abrir Assistente CGF');
    if (open) setTimeout(() => input.focus(), 50);
  }

  launcher.addEventListener('click', () => setOpen(panel.dataset.open !== 'true'));
  close.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.dataset.open === 'true') setOpen(false);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message || send.disabled) return;
    input.value = '';
    addMessage('user', message);
    send.disabled = true;
    const typing = addTyping();
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: history.slice(-MAX_HISTORY) })
      });
      const data = await response.json().catch(() => ({}));
      typing.remove();
      if (!response.ok || !data.ok) {
        addMessage('assistant', data.message || 'Não consegui responder agora. Utilize o orientador do portal ou os canais oficiais da PMGO.', null, true);
        return;
      }
      addMessage('assistant', data.answer, data.route);
      history.push({ role: 'assistant', content: data.answer });
      while (history.length > MAX_HISTORY) history.shift();
    } catch {
      typing.remove();
      addMessage('assistant', 'O assistente está temporariamente indisponível. Utilize o orientador do portal ou os canais oficiais da PMGO.', null, true);
    } finally {
      send.disabled = false;
      input.focus();
    }
  });

  function addTyping() {
    const box = el('div', 'cgf-ai-msg cgf-ai-msg--assistant');
    box.setAttribute('aria-label', 'Assistente digitando');
    const dots = el('span', 'cgf-ai-typing');
    dots.append(el('i'), el('i'), el('i'));
    box.append(dots);
    messages.append(box);
    messages.scrollTop = messages.scrollHeight;
    return box;
  }

  function addMessage(role, text, route, isError = false) {
    const box = el('div', `cgf-ai-msg cgf-ai-msg--${role}`);
    box.textContent = text;
    if (role === 'assistant' && route && route.url) {
      const meta = el('div', 'cgf-ai-meta', `Triagem: ${route.confidenceLabel || 'estimada'} · ${Math.round((route.confidence || 0) * 100)}%`);
      const link = el('a', 'cgf-ai-route', `${route.id} — ${route.title}`);
      link.href = route.url;
      meta.append(document.createElement('br'), link);
      box.append(meta);
    } else if (isError && role === 'assistant') {
      const meta = el('div', 'cgf-ai-meta', 'Nenhum dado foi enviado novamente automaticamente.');
      box.append(meta);
    }
    messages.append(box);
    messages.scrollTop = messages.scrollHeight;
    if (role === 'user') {
      history.push({ role: 'user', content: text });
      while (history.length > MAX_HISTORY) history.shift();
    }
    return box;
  }
}

ensureStylesheet();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildUi, { once: true });
else buildUi();
