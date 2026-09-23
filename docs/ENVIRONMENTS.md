# Separação de ambientes

## Local

Uso de desenvolvimento e testes. Segredos ficam somente em arquivo local ignorado pelo Git. Não utilizar dados reais de cidadãos, militares, pensionistas ou processos.

## Preview

Branches e pull requests podem gerar validações e previews isolados. Preview não é produção e não deve receber tráfego institucional ou dados reais.

## Produção

A branch canônica é `main`. Alterações em produção exigem validação de CI, auditoria, revisão do diff e decisão explícita de merge/deploy.

## Regra P0

A branch `p0-hardening-reconstruction-2026-09-23` é exclusivamente de reconstrução e homologação. Criá-la, executar CI ou abrir revisão não autoriza merge nem deploy.

## Segredos

- nunca versionar `.env`, tokens, chaves ou credenciais;
- usar variáveis de ambiente da plataforma somente no ambiente necessário;
- não expor segredos em frontend, logs, respostas de API, documentação ou testes.
