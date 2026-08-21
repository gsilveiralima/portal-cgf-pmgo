# Portal CGF PMGO — v2.3

Portal público de orientação do Comando de Gestão e Finanças da Polícia Militar do Estado de Goiás.

## Evolução da base-fonte
A página principal passa a usar **React 19 + Vite** com fonte versionada em `src/`. A interface não depende mais de correções aplicadas sobre o bundle compilado legado. Os ativos institucionais `cgf-emblem-digital.png` e `cgf-hero-medallion.png` permanecem preservados.

O bundle anterior e a antiga camada `work-patches.js` podem permanecer no repositório apenas como referência histórica/rollback, mas não são carregados por `index.html` nem fazem parte da arquitetura ativa da página principal.

## Arquitetura
- **GitHub:** fonte canônica e histórico de alterações.
- **React/Vite:** componentes versionados, build reproduzível e código-fonte legível.
- **Vercel:** produção, APIs serverless, cache e headers de segurança.
- **Conteúdo dinâmico:** `/api/content` entrega seções, contatos públicos e FAQs em tempo de execução; alterações de conteúdo não exigem patch no bundle visual.
- **Notícias:** `/api/news` consulta a fonte oficial da PMGO no servidor, filtra URLs e entrega resposta normalizada ao frontend.
- **Orientador:** `/api/orientar` classifica o assunto usando a base pública e bloqueia padrões de dados pessoais/processuais.
- **Assistente CGF:** `/api/assistant` usa a base pública autorizada, triagem local, IA e fallback público transparente.
- **Busca:** `/api/search` usa POST na interface, `no-store` e validação de dados sensíveis.
- **Observabilidade:** APIs recebem `X-Request-ID`, `Server-Timing` e log estruturado de metadados operacionais.
- **Health check:** `/api/health` informa estado mínimo do serviço e consistência da base pública.
- **Telemetria:** `/api/telemetry` aceita somente eventos e componentes predefinidos; não recebe texto livre, IP, user-agent, URL completa, cookies, armazenamento local ou conteúdo digitado.

## Componentes React
- `src/App.jsx` — shell e composição da página;
- `src/components/SectionGrid.jsx` — seções e contatos carregados dinamicamente;
- `src/components/SearchPanel.jsx` — busca pública com bloqueio local de dados sensíveis;
- `src/components/Orientador.jsx` — triagem pública;
- `src/components/NewsFeed.jsx` — atualizações oficiais da PMGO;
- `src/components/StatusPanel.jsx` — health check operacional;
- `src/services/api.js` — cliente same-origin das APIs públicas;
- `src/services/telemetry.js` — eventos de produto sem campos livres.

## Privacidade e observabilidade
A aplicação não registra, na telemetria criada por este projeto, corpo de requisição, conteúdo digitado, IP, user-agent, origem, cookies ou identificadores de usuário. A observabilidade técnica registra somente metadados operacionais necessários, como endpoint, método, status, duração, request ID e alguns marcadores controlados por lista fechada.

O portal não recebe protocolos, não consulta SEI/RHNet/folha, não executa atos administrativos e não mantém banco de dados de conversas. O conteúdo público não deve reproduzir procedimentos internos ou material reservado.

## Build e validação local
```bash
npm install
npm run check
npm run build
```

O build Vite gera `dist/` e preserva as páginas estáticas das seções, manifest, sitemap, 404, estilos e ativos usados fora da aplicação React.

## Produção
`https://portal-cgf-pmgo.vercel.app`

A troca para domínio institucional depende de autorização formal do domínio/DNS da PMGO. Veja `docs/DOMINIO-INSTITUCIONAL.md`.
