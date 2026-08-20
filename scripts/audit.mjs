import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SECTIONS } from '../public-data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'index.html','404.html','style.css','app.js','section.js','public-data.js','robots.txt','sitemap.xml','site.webmanifest','vercel.json',
  'api/news.js','api/orientar.js','api/search.js','api/assistant.js','assistant.js','assistant.css','lib/assistant-context.js',
  'cgf-emblem-digital.png','cgf-hero-medallion.png',
  'assets/index-CzXOL65S.js','assets/index-DfqFnF9R.css'
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Arquivo obrigatório ausente: ${file}`);
}
if (SECTIONS.length !== 9) throw new Error(`Esperadas 9 seções; encontradas ${SECTIONS.length}`);
for (const section of SECTIONS) if (!fs.existsSync(path.join(root,'secoes',section.slug,'index.html'))) throw new Error(`Página ausente: ${section.slug}`);

const index = fs.readFileSync(path.join(root,'index.html'),'utf8');
for (const ref of ['cgf-emblem-digital.png','cgf-hero-medallion.png','assets/index-CzXOL65S.js','assets/index-DfqFnF9R.css']) {
  if (!index.includes(ref)) throw new Error(`Interface canônica do Work descaracterizada: referência ausente ${ref}`);
}
if (index.includes('cgf-emblem.svg') || index.includes('cgf-hero-medallion.svg')) throw new Error('A página principal voltou a usar identidade SVG substituta.');
for (const requiredMeta of ['rel="canonical"','rel="manifest"','og:url','twitter:card']) if (!index.includes(requiredMeta)) throw new Error(`Metadado obrigatório ausente: ${requiredMeta}`);
if (!index.includes('/assistant.js')) throw new Error('Assistente CGF não está carregado na página principal.');

const workCss = fs.readFileSync(path.join(root,'assets/index-DfqFnF9R.css'),'utf8');
for (const signature of ['.government-bar','.accessibility-controls','.hero__media','.finder-section','.quick-grid']) if (!workCss.includes(signature)) throw new Error(`Assinatura visual do Work ausente: ${signature}`);

const assistantApi = fs.readFileSync(path.join(root,'api/assistant.js'),'utf8');
for (const signature of ['generateText','validatePublicPrompt','gpt-5.6-sol','ASSISTANT_POLICY']) if (!assistantApi.includes(signature)) throw new Error(`Assistente IA sem requisito: ${signature}`);
for (const forbiddenSecret of ['OPENAI_API_KEY','AI_GATEWAY_API_KEY','VERCEL_OIDC_TOKEN']) if (assistantApi.includes(forbiddenSecret)) throw new Error(`Assistente público não deve manipular segredo/token diretamente: ${forbiddenSecret}`);
const assistantClient = fs.readFileSync(path.join(root,'assistant.js'),'utf8');
if (!assistantClient.includes("fetch('/api/assistant'")) throw new Error('Interface do Assistente CGF não chama o backend próprio.');
if (!assistantClient.includes('Não informe CPF')) throw new Error('Interface do Assistente CGF não exibe aviso de privacidade.');

const textFiles=[];function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules'].includes(entry.name))continue;const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(/\.(html|js|json|md|xml|txt|yml|yaml|css)$/.test(entry.name))textFiles.push(full)}}walk(root);
const forbidden=/(chatgpt\.com\/share|chatgpt\.com\/canvas|Gabriel\s+Silveira\s+Lima)/i;
for(const file of textFiles){const content=fs.readFileSync(file,'utf8');if(forbidden.test(content))throw new Error(`Referência pública proibida em ${path.relative(root,file)}`);if(/\.map(?:\?|$)/.test(content))throw new Error(`Sourcemap referenciado em ${path.relative(root,file)}`)}
for(const file of textFiles.filter(f=>f.endsWith('.html'))){const content=fs.readFileSync(file,'utf8');if(/\sstyle=/.test(content))throw new Error(`Estilo inline incompatível com CSP em ${path.relative(root,file)}`)}
const vercel=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8')),headers=JSON.stringify(vercel.headers||[]);
for(const expected of ['Content-Security-Policy','X-Content-Type-Options','Permissions-Policy','Referrer-Policy','Strict-Transport-Security']) if(!headers.includes(expected)) throw new Error(`Header ausente: ${expected}`);
if(!headers.includes('https://goias.gov.br'))throw new Error('CSP não permite a fonte oficial goias.gov.br.');
if((vercel.functions?.['api/*.js']?.maxDuration||0)<15)throw new Error('Timeout insuficiente para o Assistente CGF.');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));if(!pkg.dependencies?.ai)throw new Error('Dependência ai ausente.');
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');for(const section of SECTIONS)if(!sitemap.includes(`/secoes/${section.slug}/`))throw new Error(`Sitemap sem ${section.slug}`);
console.log(`Auditoria concluída: interface canônica do Work preservada, Assistente CGF seguro, ${SECTIONS.length} seções, headers, sitemap e privacidade verificados.`);
