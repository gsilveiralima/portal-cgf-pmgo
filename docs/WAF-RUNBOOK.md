# Runbook de WAF e abuso — Portal CGF

## Objetivo

Reduzir abuso das APIs públicas sem depender do conteúdo visual do portal.

## Controles na aplicação

1. aceitar somente métodos previstos;
2. rejeitar POST cross-site;
3. limitar payload público a 16 KiB;
4. retornar `413 PAYLOAD_TOO_LARGE` antes de classificação ou IA;
5. bloquear dados sensíveis detectáveis;
6. manter respostas de entrada do usuário com `Cache-Control: no-store`.

## Controles recomendados na borda

Configurar na plataforma de hospedagem, quando disponível:

- rate limit específico para `/api/assistant`, `/api/orientar` e `/api/search`;
- bloqueio/ desafio para padrões anormais de automação;
- limites mais rigorosos para rajadas repetidas de 4xx/413;
- observação de volume por rota, país/ASN e fingerprint disponível;
- exceções somente quando justificadas e documentadas.

## Resposta a incidente

1. preservar logs técnicos sem copiar conteúdo sensível para tickets;
2. identificar rota, janela temporal, volume e código de resposta;
3. aplicar regra temporária de borda de menor privilégio;
4. validar se usuários legítimos permanecem atendidos;
5. revisar métricas e retirar regras temporárias quando o risco cessar;
6. registrar causa, impacto e ação permanente.

## Não fazer

- não registrar corpo completo das mensagens para investigação;
- não bloquear por conteúdo político, opinião ou perfil do usuário;
- não adicionar bypass secreto em query string/header;
- não alterar o bundle visual para implementar controle de borda.
