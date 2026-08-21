# Portal CGF PMGO — v2.2

Portal público de orientação do Comando de Gestão e Finanças da Polícia Militar do Estado de Goiás.

## Referência visual canônica
A interface pública preserva a versão visual aprovada para o projeto, incluindo os ativos `cgf-emblem-digital.png` e `cgf-hero-medallion.png`, hero institucional, acessibilidade, orientador, cards das seções CGF/1 a CGF/9, painel detalhado, atualizações oficiais da PMGO e canais institucionais. Alterações de backend, segurança ou infraestrutura não devem descaracterizar essa identidade.

## Arquitetura
- **GitHub:** fonte canônica e histórico de alterações.
- **Vercel:** produção, APIs serverless, cache e headers de segurança.
- **Frontend canônico:** bundle visual preservado, com uma pequena camada de compatibilidade em `work-patches.js` para correções verificadas e integração same-origin.
- **Backend de notícias:** `/api/news` consulta a fonte oficial da PMGO, filtra URLs e fornece uma resposta compatível ao bundle, evitando dependência CORS direta do navegador.
- **Assistente CGF:** `/api/assistant` usa somente a base pública autorizada, com triagem local, bloqueio de dados sensíveis e fallback público quando a camada generativa não está disponível.
- **Busca pública:** `/api/search` aceita POST, não mantém cache de consultas e bloqueia identificadores/credenciais detectáveis.
- **Conteúdo público:** estrutura e competências resumidas do Regimento Interno do CGF (Portaria nº 18.207/2024) e canais oficiais da PMGO.

## Funcionalidades
- orientação pública das seções CGF/1 a CGF/9;
- orientador por assunto sem coleta de dados pessoais;
- Assistente CGF com IA e fallback local transparente;
- contatos públicos e canais institucionais;
- atualizações oficiais da PMGO intermediadas pelo backend;
- acessibilidade, alto contraste e layout responsivo;
- 404, sitemap, manifest, canonical e metadados sociais;
- CSP e headers de segurança via `vercel.json`;
- testes e auditoria automatizada.

## Segurança e governança
O portal não recebe protocolos, não consulta SEI/RHNet/folha, não executa atos administrativos e não mantém banco de dados de conversas. O conteúdo público não deve reproduzir procedimentos internos ou material reservado. A auditoria bloqueia marcadores típicos do PAP na superfície publicada, exposição de segredos, referências públicas proibidas e regressões de segurança.

O frontend também bloqueia ou recusa CPF, RG, matrícula, telefone pessoal, e-mail, números de processo, senhas, tokens de autenticação, JWTs e chaves de API quando esses padrões são enviados aos recursos de orientação/busca.

## Validação local
```bash
npm run check
```

## Produção
`https://portal-cgf-pmgo.vercel.app`

A troca para domínio institucional depende de autorização formal do domínio/DNS da PMGO. Veja `docs/DOMINIO-INSTITUCIONAL.md`.
