# Preparação para domínio institucional

O portal usa em produção o endereço neutro `https://portal-cgf-pmgo.vercel.app`.

Não deve ser criado ou divulgado um subdomínio que pareça oficial da PMGO sem autorização da área institucional responsável pelo domínio e DNS.

Quando um domínio oficial for autorizado:
1. adicionar o domínio ao projeto Vercel `portal-cgf-pmgo`;
2. configurar os registros DNS exatamente como a Vercel indicar;
3. executar `node scripts/set-domain.mjs https://DOMINIO-AUTORIZADO`;
4. revisar canonical, Open Graph, sitemap e robots;
5. executar `npm run check`;
6. publicar e validar HTTPS, headers e redirecionamento do domínio antigo.
