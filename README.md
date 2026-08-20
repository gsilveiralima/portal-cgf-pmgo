# Portal CGF PMGO — v2

Portal público de orientação do Comando de Gestão e Finanças da Polícia Militar do Estado de Goiás.

## Arquitetura
- **GitHub:** fonte canônica e histórico de alterações.
- **Vercel:** produção, APIs serverless, cache e headers de segurança.
- **Conteúdo público:** estrutura e competências resumidas do Regimento Interno do CGF (Portaria nº 18.207/2024) e canais oficiais da PMGO.

## Funcionalidades
- páginas públicas CGF/1 a CGF/9;
- busca em seções e FAQ;
- backend `/api/news` para notícias do portal oficial da PMGO;
- orientador probabilístico local `/api/orientar`, restrito à base pública e sem consulta a sistemas;
- bloqueio de padrões de CPF, RG, matrícula, telefone, e-mail, credenciais, dados bancários, endereço e número de processo;
- nível de confiança e alternativa de atendimento humano;
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
