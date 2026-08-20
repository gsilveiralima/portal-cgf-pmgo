import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SECTIONS } from '../public-data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = ['index.html','404.html','style.css','app.js','section.js','public-data.js','robots.txt','sitemap.xml','site.webmanifest','vercel.json','api/news.js','api/orientar.js','api/search.js'];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Arquivo obrigatório ausente: ${file}`);
}
if (SECTIONS.length !== 9) throw new Error(`Esperadas 9 seções; encontradas ${SECTIONS.length}`);
for (const section of SECTIONS) {
  const file = path.join(root, 'secoes', section.slug, 'index.html');
  if (!fs.existsSync(file)) throw new Error(`Página ausente: ${section.slug}`);
}
const textFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git','node_modules'].includes(entry.name)) continue;
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
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const headers = JSON.stringify(vercel.headers || []);
for (const expected of ['Content-Security-Policy','X-Content-Type-Options','Permissions-Policy','Referrer-Policy']) {
  if (!headers.includes(expected)) throw new Error(`Header ausente: ${expected}`);
}
const sitemap = fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for (const section of SECTIONS) {
  if (!sitemap.includes(`/secoes/${section.slug}/`)) throw new Error(`Sitemap sem ${section.slug}`);
}
console.log(`Auditoria concluída: ${SECTIONS.length} seções, headers, sitemap e privacidade verificados.`);
