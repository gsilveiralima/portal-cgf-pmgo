import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SECTIONS } from '../public-data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const required = [
  'index.html', '404.html', 'style.css', 'section.js', 'public-data.js',
  'robots.txt', 'sitemap.xml', 'site.webmanifest', 'vercel.json', 'vite.config.js',
  'api/news.js', 'api/orientar.js', 'api/search.js', 'api/assistant.js',
  'api/content.js', 'api/health.js', 'api/telemetry.js',
  'assistant.js', 'assistant.css',
  'lib/assistant-context.js', 'lib/privacy.js', 'lib/security.js', 'lib/classifier.js', 'lib/observability.js',
  'src/main.jsx', 'src/App.jsx', 'src/styles.css',
  'src/components/SectionGrid.jsx', 'src/components/SearchPanel.jsx', 'src/components/Orientador.jsx',
  'src/components/NewsFeed.jsx', 'src/components/StatusPanel.jsx',
  'src/services/api.js', 'src/services/telemetry.js',
  'cgf-emblem-digital.png', 'cgf-hero-medallion.png'
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
for (const requiredMeta of ['rel="canonical"', 'rel="manifest"', 'og:url', 'twitter:card']) {
  if (!index.includes(requiredMeta)) throw new Error(`Metadado obrigatório ausente: ${requiredMeta}`);
}
if (!index.includes('/src/main.jsx')) throw new Error('Entrada React versionada não está carregada na página principal.');
if (index.includes('work-patches.js') || index.includes('assets/index-CzXOL65S.js')) {
  throw new Error('Página principal ainda depende de patch ou bundle compilado legado.');
}
for (const ref of ['cgf-emblem-digital.png', 'cgf-hero-medallion.png']) {
  if (!index.includes(ref)) throw new Error(`Identidade visual ausente do HTML: ${ref}`);
}

const app = read('src/App.jsx');
for (const component of ['SectionGrid', 'SearchPanel', 'Orientador', 'NewsFeed', 'StatusPanel']) {
  if (!app.includes(component)) throw new Error(`Componente React não integrado: ${component}`);
}
if (!app.includes('getPortalContent')) throw new Error('React não carrega conteúdo público em tempo de execução.');
if (!app.includes("track('page_view', 'portal')")) throw new Error('Page view segura não está instrumentada.');

const main = read('src/main.jsx');
if (!main.includes("from 'react-dom/client'")) throw new Error('Bootstrap React DOM ausente.');
if (!main.includes("import '../assistant.js'")) throw new Error('Assistente público não está integrado ao build React.');

const apiClient = read('src/services/api.js');
for (const endpoint of ['/api/content', '/api/health', '/api/news', '/api/search', '/api/orientar']) {
  if (!apiClient.includes(endpoint)) throw new Error(`Cliente React não usa endpoint esperado: ${endpoint}`);
}

const contentApi = read('api/content.js');
for (const signature of ['publicSection', 'schemaVersion', 'stale-while-revalidate', 'startApiObservation']) {
  if (!contentApi.includes(signature)) throw new Error(`API dinâmica de conteúdo sem requisito: ${signature}`);
}
if (contentApi.includes('keywords:') || contentApi.includes('training:')) {
  throw new Error('API pública de conteúdo não deve expor dados auxiliares do classificador.');
}

const healthApi = read('api/health.js');
for (const signature of ['privacyPolicy', 'officialSourceConfigured', "'Cache-Control', 'no-store'", 'metadata-only']) {
  if (!healthApi.includes(signature)) throw new Error(`Health check sem requisito: ${signature}`);
}

const telemetryApi = read('api/telemetry.js');
for (const signature of ['ALLOWED_EVENTS', 'ALLOWED_COMPONENTS', 'sameOrigin', 'logSafeTelemetry', "'Cache-Control', 'no-store'"]) {
  if (!telemetryApi.includes(signature)) throw new Error(`Telemetria sem requisito: ${signature}`);
}
if (!telemetryApi.includes("!['event', 'component'].includes(key)")) {
  throw new Error('Telemetria aceita campos livres; isso pode permitir dados pessoais.');
}

const telemetryClient = read('src/services/telemetry.js');
if (!telemetryClient.includes('JSON.stringify({ event, component })')) {
  throw new Error('Cliente de telemetria deve enviar somente evento e componente.');
}
for (const forbiddenSignal of ['userAgent', 'location.href', 'document.cookie', 'localStorage', 'sessionStorage']) {
  if (telemetryClient.includes(forbiddenSignal)) throw new Error(`Telemetria do cliente coleta sinal proibido: ${forbiddenSignal}`);
}

const observability = read('lib/observability.js');
for (const signature of ['X-Request-ID', 'Server-Timing', 'safePath', 'sanitizeExtra']) {
  if (!observability.includes(signature)) throw new Error(`Observabilidade sem requisito: ${signature}`);
}
for (const forbiddenSignal of ['user-agent', 'remoteAddress', 'x-forwarded-for', 'req.body', 'req.query', 'headers.origin']) {
  if (observability.includes(forbiddenSignal)) throw new Error(`Observabilidade registra dado desnecessário: ${forbiddenSignal}`);
}

const privacyModule = read('lib/privacy.js');
for (const signature of ['SENSITIVE_PATTERNS', 'detectSensitiveData', 'containsSensitiveData']) {
  if (!privacyModule.includes(signature)) throw new Error(`Política compartilhada de privacidade sem requisito: ${signature}`);
}
for (const detector of ['CPF', 'processo SEI', 'token de autenticação', 'token JWT', 'chave de API']) {
  if (!privacyModule.includes(detector)) throw new Error(`Detector sensível ausente da política compartilhada: ${detector}`);
}

const securityModule = read('lib/security.js');
if (!securityModule.includes("from './privacy.js'")) throw new Error('Validação do servidor não reutiliza a política compartilhada de privacidade.');
if (!securityModule.includes('validatePublicPrompt')) throw new Error('Validação pública do servidor ausente.');

const assistantApi = read('api/assistant.js');
for (const signature of ['generateText', 'validatePublicPrompt', 'gpt-5.6-sol', 'ASSISTANT_POLICY', 'sameOrigin', 'parseBody']) {
  if (!assistantApi.includes(signature)) throw new Error(`Assistente IA sem requisito: ${signature}`);
}
for (const forbiddenSecret of ['OPENAI_API_KEY', 'AI_GATEWAY_API_KEY', 'VERCEL_OIDC_TOKEN']) {
  if (assistantApi.includes(forbiddenSecret)) throw new Error(`Assistente público não deve manipular segredo/token diretamente: ${forbiddenSecret}`);
}

const assistantClient = read('assistant.js');
if (!assistantClient.includes("from './lib/privacy.js'")) throw new Error('Assistente do navegador não reutiliza a política compartilhada de privacidade.');
if (!assistantClient.includes('containsSensitiveData')) throw new Error('Assistente CGF não possui bloqueio preventivo de dados sensíveis no cliente.');
if (!assistantClient.includes("fetch('/api/assistant'")) throw new Error('Interface do Assistente CGF não chama o backend próprio.');
if (!assistantClient.includes('Não informe CPF')) throw new Error('Interface do Assistente CGF não exibe aviso de privacidade.');
if (!assistantClient.includes('REQUEST_TIMEOUT_MS')) throw new Error('Assistente CGF não possui timeout explícito no cliente.');

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

const vite = read('vite.config.js');
for (const signature of ["from '@vitejs/plugin-react'", "fs.cpSync(path.join(ROOT, 'secoes')", 'sourcemap: false', "outDir: 'dist'"]) {
  if (!vite.includes(signature)) throw new Error(`Build Vite sem requisito: ${signature}`);
}

const pkg = JSON.parse(read('package.json'));
for (const [name, version] of Object.entries({
  ai: pkg.dependencies?.ai,
  react: pkg.dependencies?.react,
  'react-dom': pkg.dependencies?.['react-dom'],
  vite: pkg.devDependencies?.vite,
  '@vitejs/plugin-react': pkg.devDependencies?.['@vitejs/plugin-react']
})) {
  if (!/^\d+\.\d+\.\d+$/.test(version || '')) throw new Error(`Dependência deve estar fixada em versão exata: ${name}`);
}
if (pkg.version !== '2.3.0') throw new Error(`Versão esperada 2.3.0; encontrada ${pkg.version}`);
if (pkg.scripts?.build !== 'vite build') throw new Error('Script de build React/Vite ausente.');

const vercel = JSON.parse(read('vercel.json'));
if (vercel.framework !== 'vite') throw new Error('Vercel não está configurado para Vite.');
if (vercel.outputDirectory !== 'dist') throw new Error('Diretório de saída do Vercel deve ser dist.');
if (vercel.buildCommand !== 'npm run build') throw new Error('Build command do Vercel não aponta para npm run build.');
const headers = JSON.stringify(vercel.headers || []);
for (const expected of ['Content-Security-Policy', 'X-Content-Type-Options', 'Permissions-Policy', 'Referrer-Policy', 'Strict-Transport-Security']) {
  if (!headers.includes(expected)) throw new Error(`Header ausente: ${expected}`);
}
if (!headers.includes('https://goias.gov.br')) throw new Error('CSP não permite a fonte oficial goias.gov.br.');
if ((vercel.functions?.['api/*.js']?.maxDuration || 0) < 15) throw new Error('Timeout insuficiente para o Assistente CGF.');
if (JSON.stringify(vercel.rewrites || []).includes('raw.githubusercontent.com')) throw new Error('Deploy não deve depender de raw.githubusercontent.com.');

const textFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(html|js|jsx|json|md|xml|txt|yml|yaml|css)$/.test(entry.name)) textFiles.push(full);
  }
}
walk(root);

const forbidden = /(chatgpt\.com\/share|chatgpt\.com\/canvas|Gabriel\s+Silveira\s+Lima)/i;
const reservedPapMarkers = [/PAP\s+6\./i, /SEQU[ÊE]NCIA DE AÇÕES/i, /POSSIBILIDADES DE ERROS/i, /AÇÕES CORRETIVAS/i];
for (const file of textFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  if (forbidden.test(content)) throw new Error(`Referência pública proibida em ${rel}`);
  if (/\.map(?:\?|$)/.test(content)) throw new Error(`Sourcemap referenciado em ${rel}`);
  for (const marker of reservedPapMarkers) {
    if (marker.test(content)) throw new Error(`Conteúdo reservado do PAP possivelmente exposto em ${rel}`);
  }
  if (/raw\.githubusercontent\.com\/gsilveiralima/i.test(content)) throw new Error(`Superfície pública depende de URL pessoal do GitHub em ${rel}`);
}

for (const file of textFiles.filter((file) => file.endsWith('.html'))) {
  const content = fs.readFileSync(file, 'utf8');
  if (/\sstyle=/.test(content)) throw new Error(`Estilo inline incompatível com CSP em ${path.relative(root, file)}`);
}

const sitemap = read('sitemap.xml');
for (const section of SECTIONS) {
  if (!sitemap.includes(`/secoes/${section.slug}/`)) throw new Error(`Sitemap sem ${section.slug}`);
}

function isPlausibleBrPhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) digits = digits.slice(2);
  if (digits.length === 10) return /^[1-9]{2}[2-5]\d{7}$/.test(digits);
  if (digits.length === 11) return /^[1-9]{2}9\d{8}$/.test(digits);
  return false;
}

const suspiciousPhones = SECTIONS.flatMap((section) => {
  const raw = String(section.contact.phone || '');
  if (!raw) return [];
  return raw.split('·')
    .map((phone) => phone.trim())
    .filter(Boolean)
    .filter((phone) => !isPlausibleBrPhone(phone))
    .map((phone) => `${section.id}: ${phone}`);
});
if (suspiciousPhones.length) {
  console.warn(`AVISO: contatos com formato telefônico a reconfirmar na Articulação PMGO: ${suspiciousPhones.join(' | ')}`);
}

console.log(`Auditoria concluída: React/Vite versionado, conteúdo dinâmico, health check, observabilidade segura, telemetria sem campos livres, política de privacidade compartilhada, PAP reservado não exposto, ${SECTIONS.length} seções e headers validados.`);
