import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const next = String(process.argv[2] || '').replace(/\/$/, '');
if (!/^https:\/\/[a-z0-9.-]+$/i.test(next)) throw new Error('Informe uma URL HTTPS de domínio autorizado, sem caminho.');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['index.html','robots.txt','sitemap.xml','public-data.js', ...Array.from({length:9},(_,i)=>`secoes/cgf-${i+1}/index.html`)];
for (const relative of files) {
  const file = path.join(root, relative);
  let content = fs.readFileSync(file, 'utf8');
  content = content.replaceAll('https://portal-cgf-pmgo.vercel.app', next);
  fs.writeFileSync(file, content);
}
console.log(`Domínio atualizado em ${files.length} arquivos.`);
