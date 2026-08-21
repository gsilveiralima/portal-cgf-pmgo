import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SECTIONS } from '../public-data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const required = [
  'index.html', '404.html', 'style.css', 'app.js', 'section.js', 'public-data.js',
  'robots.txt', 'sitemap.xml', 'site.webmanifest', 'vercel.json', 'work-patches.js',
  'api/news.js', 'api/orientar.js', 'api/search.js', 'api/assistant.js',
  'assistant.js', 'assistant.css', 'lib/assistant-context.js', 'lib/security.js', 'lib/classifier.js',
  'cgf-emblem-digital.png', 'cgf-hero-medallion.png',
  'assets/index-CzXOL65S.js', 'assets/index-DfqFnF9R.css'
];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Arquivo obrigatório ausente: ${file}`);
}
if (SECTIONS.length !== 9) throw new Error(`Esperadas 9 seções; encontradas ${SECTIONS.length}`);
for (const section of SECTIONS) {
  if (!fs.existsSync(path.join(root, 'secoes', section.slug, 'index.html'))) {
    throw new Error(`Página ausente: ${section.slug}`);
  }
}

const index = read('index.html');
for (const ref of ['cgf-emblem-digital.png', 'cgf-hero-medallion.png', 'assets/index-CzXOL65S.js', 'assets/index-DfqFnF9R.css']) {
  if (!index.includes(ref)) throw new Error(`Interface canônica do Work descaracterizada: referência ausente ${ref}`);
}
if (index.includes('cgf-emblem.svg') || index.includes('cgf-hero-medallion.svg')) {
  throw new Error('A página principal voltou a usar identidade SVG substituta.');
}
for (const requiredMeta of ['rel="canonical"', 'rel="manifest"', 'og:url', 'twitter:card']) {
  if (!index.includes(requiredMeta)) throw new Error(`Metadado obrigatório ausente: ${requiredMeta}`);
}
if (!index.includes('/assistant.js')) throw new Error('Assistente CGF não está carregado na página principal.');
if (!index.includes('work-patches.js')) throw new Error('Camada de hardening do bundle canônico não está carregada.');
if (index.indexOf('work-patches.js') > index.indexOf('assets/index-CzXOL65S.js')) {
  throw new Error('A camada de hardening precisa carregar antes do bundle canônico.');
}

const workCss = read('assets/index-DfqFnF9R.css');
for (const signature of ['.government-bar', '.accessibility-controls', '.hero__media', '.finder-section', '.quick-grid']) {
  if (!workCss.includes(signature)) throw new Error(`Assinatura visual do Work ausente: ${signature}`);
}

const workPatch = read('work-patches.js');
if (!workPatch.includes('99953-121') || !workPatch.includes('99953-1211') || !workPatch.includes('TEXT_PATCHES')) {
  throw new Error('Correção pública verificada do telefone da CGF/3 não está protegida.');
}
if (!workPatch.includes("/api/news?format=wp")) {
  throw new Error('Bundle canônico não está protegido pelo proxy same-origin de notícias.');
}

const assistantApi = read('api/assistant.js');
for (const signature of ['generateText', 'validatePublicPrompt', 'gpt-5.6-sol', 'ASSISTANT_POLICY', 'sameOrigin', 'parseBody']) {
  if (!assistantApi.includes(signature)) throw new Error(`Assistente IA sem requisito: ${signature}`);
}
for (const forbiddenSecret of ['OPENAI_API_KEY', 'AI_GATEWAY_API_KEY', 'VERCEL_OIDC_TOKEN']) {
  if (assistantApi.includes(forbiddenSecret)) throw new Error(`Assistente público não deve manipular segredo/token diretamente: ${forbiddenSecret}`);
}

const assistantClient = read('assistant.js');
if (!assistantClient.includes("fetch('/api/assistant'")) throw new Error('Interface do Assistente CGF não chama o backend próprio.');
if (!assistantClient.includes('Não informe CPF')) throw new Error('Interface do Assistente CGF não exibe aviso de privacidade.');
if (!assistantClient.includes('REQUEST_TIMEOUT_MS')) throw new Error('Assistente CGF não possui timeout explícito no cliente.');
if (!assistantClient.includes('CLIENT_SENSITIVE_PATTERNS') || !assistantClient.includes('containsSensitiveData')) {
  throw new Error('Assistente CGF não possui bloqueio preventivo de dados sensíveis no cliente.');
}
if (!assistantClient.includes("remember('user', message)")) {
  throw new Error('Histórico do Assistente CGF não possui gravação explícita apenas após resposta válida.');
}
if (!assistantClient.includes('Mensagem ocultada localmente por proteção de dados.')) {
  throw new Error('Assistente CGF não oculta no DOM mensagem bloqueada pelo servidor.');
}

const searchApi = read('api/search.js');
if (!searchApi.includes("'Cache-Control', 'no-store'")) throw new Error('Busca pública não está protegida contra cache de entrada do usuário.');
if (!searchApi.includes('validatePublicPrompt')) throw new Error('Busca pública não valida dados sensíveis.');
if (!searchApi.includes('sameOrigin') || !searchApi.includes("req.method === 'POST' && !sameOrigin(req)")) {
  throw new Error('Busca pública POST não está protegida contra origem cruzada.');
}

const newsApi = read('api/news.js');
for (const signature of ['format', 'toWordPressCompat', 'AbortSignal.timeout', 'officialUrl']) {
  if (!newsApi.includes(signature)) throw new Error(`Proxy de notícias sem requisito: ${signature}`);
}

const textFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(html|js|json|md|xml|txt|yml|yaml|css)$/.test(entry.name)) textFiles.push(full);
  }
}
walk(root);

const forbidden = /(chatgpt\.com\/share|chatgpt\.com\/canvas|Gabriel\s+Silveira\s+Lima)/i;
for (const file of textFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (forbidden.test(content)) throw new Error(`Referência pública proibida em ${path.relative(root, file)}`);
  if (/\.map(?:\?|$)/.test(content)) throw new Error(`Sourcemap referenciado em ${path.relative(root, file)}`);
}

for (const file of textFiles.filter((file) => file.endsWith('.html'))) {
  const content = fs.readFileSync(file, 'utf8');
  if (/\sstyle=/.test(content)) throw new Error(`Estilo inline incompatível com CSP em ${path.relative(root, file)}`);
}

const deployFiles = [
  'index.html', '404.html', 'app.js', 'section.js', 'public-data.js', 'assistant.js',
  'work-patches.js', 'site.webmanifest', 'robots.txt', 'sitemap.xml', 'vercel.json',
  'assets/index-CzXOL65S.js'
];
for (const section of SECTIONS) deployFiles.push(`secoes/${section.slug}/index.html`);

const reservedPapMarkers = [/PAP\s+6\./i, /SEQU[ÊE]NCIA DE AÇÕES/i, /POSSIBILIDADES DE ERROS/i, /AÇÕES CORRETIVAS/i];
for (const file of deployFiles) {
  const content = read(file);
  if (/raw\.githubusercontent\.com\/gsilveiralima/i.test(content)) {
    throw new Error(`Superfície pública depende de URL pessoal do GitHub em ${file}`);
  }
  for (const marker of reservedPapMarkers) {
    if (marker.test(content)) throw new Error(`Conteúdo reservado do PAP possivelmente exposto em ${file}`);
  }
}

const vercel = JSON.parse(read('vercel.json'));
const headers = JSON.stringify(vercel.headers || []);
for (const expected of ['Content-Security-Policy', 'X-Content-Type-Options', 'Permissions-Policy', 'Referrer-Policy', 'Strict-Transport-Security']) {
  if (!headers.includes(expected)) throw new Error(`Header ausente: ${expected}`);
}
if (!headers.includes('https://goias.gov.br')) throw new Error('CSP não permite a fonte oficial goias.gov.br.');
if ((vercel.functions?.['api/*.js']?.maxDuration || 0) < 15) throw new Error('Timeout insuficiente para o Assistente CGF.');
if (JSON.stringify(vercel.rewrites || []).includes('raw.githubusercontent.com')) {
  throw new Error('Assets locais não devem depender de rewrite para raw.githubusercontent.com.');
}
if (headers.includes('max-age=31536000, immutable')) {
  throw new Error('Cache imutável de um ano é incompatível com os nomes de assets mantidos entre versões.');
}

const pkg = JSON.parse(read('package.json'));
if (!/^\d+\.\d+\.\d+$/.test(pkg.dependencies?.ai || '')) {
  throw new Error('A dependência ai deve estar fixada em versão exata para builds reproduzíveis.');
}

const sitemap = read('sitemap.xml');
for (const section of SECTIONS) {
  if (!sitemap.includes(`/secoes/${section.slug}/`)) throw new Error(`Sitemap sem ${section.slug}`);
}

const suspiciousPhones = SECTIONS.flatMap((section) => {
  const raw = String(section.contact.phone || '');
  if (!raw) return [];
  return raw.split('·').map((phone) => phone.trim()).filter(Boolean).flatMap((phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11 ? [] : [`${section.id}: ${phone}`];
  });
});
if (suspiciousPhones.length) {
  console.warn(`AVISO: contatos com formato telefônico a reconfirmar na Articulação PMGO: ${suspiciousPhones.join(' | ')}`);
}

console.log(`Auditoria concluída: interface canônica preservada, proxy de notícias same-origin, Assistente CGF com bloqueio preventivo no cliente e servidor, busca POST same-origin e sem cache, PAP reservado não exposto, ${SECTIONS.length} seções, headers, sitemap e privacidade verificados.`);
