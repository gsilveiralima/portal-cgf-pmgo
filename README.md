# Portal CGF PMGO — v2.1

Portal público de orientação do Comando de Gestão e Finanças da Polícia Militar do Estado de Goiás.

## Referência visual canônica
A interface pública deve preservar a versão aprovada no ChatGPT Work, incluindo os ativos `cgf-emblem-digital.png` e `cgf-hero-medallion.png`, hero institucional, acessibilidade, orientador, cards das seções CGF/1 a CGF/9, painel detalhado, atualizações oficiais da PMGO e canais institucionais. Alterações técnicas de backend, segurança ou infraestrutura não devem substituir essa identidade visual.

## Arquitetura
- **GitHub:** fonte canônica e histórico de alterações.
- **Vercel:** produção, APIs serverless, cache e headers de segurança.
- **Conteúdo público:** estrutura e competências resumidas do Regimento Interno do CGF (Portaria nº 18.207/2024) e canais oficiais da PMGO.

## Funcionalidades
- orientação pública das seções CGF/1 a CGF/9;
- orientador por assunto sem coleta de dados pessoais;
- contatos públicos e canais institucionais;
- atualizações oficiais da PMGO;
- acessibilidade, alto contraste e layout responsivo;
- APIs serverless e recursos de backend mantidos separadamente da camada visual;
- 404, sitemap, manifest, canonical e metadados sociais;
- CSP e headers de segurança via `vercel.json`;
- testes e auditoria em GitHub Actions.

## Segurança e governança
O portal não recebe protocolos, não consulta SEI/RHNet/folha, não executa atos administrativos, não armazena conversas e não deve publicar conteúdo reservado ou procedimento interno. Contatos devem ser conferidos nos canais oficiais antes de uso sensível.

## Validação local
```bash
npm run check
```

## Produção
`https://portal-cgf-pmgo.vercel.app`

A troca para domínio institucional depende de autorização formal do domínio/DNS da PMGO. Veja `docs/DOMINIO-INSTITUCIONAL.md`.
