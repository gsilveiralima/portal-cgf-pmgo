# Política de segurança

## Escopo

Este repositório publica somente conteúdo e serviços destinados à superfície pública do Portal CGF. Dados pessoais, credenciais, processos, documentos internos e procedimentos reservados não pertencem ao repositório.

## Reporte responsável

Ao identificar uma possível vulnerabilidade:

1. não publique credenciais, tokens, dados pessoais ou conteúdo reservado em issues;
2. registre apenas o mínimo necessário para reproduzir o problema;
3. prefira um canal privado com o mantenedor antes de divulgar detalhes exploráveis;
4. aguarde a correção antes de qualquer divulgação técnica detalhada.

## Segredos

Nunca versione:

- chaves de API;
- tokens;
- credenciais Vercel;
- cookies/sessões;
- arquivos `.env`;
- documentos internos ou dados oriundos de sistemas institucionais.

## Validação

Antes de integrar alterações:

```bash
npm install --ignore-scripts
npm run check
```

A auditoria do projeto é parte obrigatória dessa validação.
