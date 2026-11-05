import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const OUT_DIR = path.join(ROOT, 'entrega-secma');

if (!fs.existsSync(DIST) || !fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('Erro: pasta dist/ não encontrada. Execute "npm run build" antes.');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const readmeTxt = `===============================================================================
PORTAL DA SUPERINTENDÊNCIA DO PATRIMÔNIO CULTURAL DO MARANHÃO (SPC/SECMA)
GUIA RÁPIDO DE PUBLICAÇÃO PARA A EQUIPE DE TI (SECMA / ATI-MA)
===============================================================================

Esta entrega contém dois arquivos compactados (.zip):

1. spc-portal-publicacao-pronta.zip (RECOMENDADO PARA SUBIR DIRETO NO HOSTING)
   - Contém a aplicação web já compilada e otimizada (HTML, CSS, JS, mapas em
     WebP/JPG e os decretos/leis em PDF).
   - NÃO exige Node.js instalado no servidor web de destino.
   - Funciona imediatamente em qualquer servidor HTTP estático:
     * Apache HTTP Server (já inclui arquivo .htaccess configurado)
     * Microsoft IIS (já inclui arquivo web.config configurado)
     * Nginx / Cloudflare / Firebase Hosting / cPanel
   - COMO PUBLICAR:
     Basta extrair o conteúdo de "spc-portal-publicacao-pronta.zip" dentro da
     pasta pública do domínio/subdomínio (ex.: /var/www/html, public_html ou
     diretório raiz do VirtualHost).

2. spc-portal-codigo-fonte.zip (CÓDIGO-FONTE PARA MANUTENÇÃO E EVOLUÇÃO)
   - Contém o código-fonte em React 19 + TypeScript + Vite 8.
   - Para compilar a partir do código-fonte:
     a) Instale o Node.js 22+
     b) Copie .env.example para .env.local (se utilizar autenticação Firebase)
     c) Execute: npm ci
     d) Execute: npm run build
     e) O resultado compilado será gerado na pasta dist/

OBSERVAÇÕES TÉCNICAS:
- As páginas públicas (Início, A SPC, Serviços, Bens Tombados, Mapas e Plantas
  Históricas, Legislação, Contato, Denúncias e Transparência) funcionam de forma
  100% autônoma a partir dos arquivos estáticos incluídos no pacote.
- A área restrita (/login, /admin, /ingestao) utiliza Firebase Authentication,
  Firestore e Storage, parametrizáveis no arquivo .env.local antes do build.
===============================================================================
`;

fs.writeFileSync(path.join(OUT_DIR, 'LEIA-ME-HOSPEDAGEM-SECMA.txt'), readmeTxt, 'utf-8');
fs.writeFileSync(path.join(DIST, 'LEIA-ME-HOSPEDAGEM-SECMA.txt'), readmeTxt, 'utf-8');

const distZip = path.join(OUT_DIR, 'spc-portal-publicacao-pronta.zip');
const srcZip = path.join(OUT_DIR, 'spc-portal-codigo-fonte.zip');

if (fs.existsSync(distZip)) fs.unlinkSync(distZip);
if (fs.existsSync(srcZip)) fs.unlinkSync(srcZip);

console.log('1/2 Gerando spc-portal-publicacao-pronta.zip (arquivos prontos para qualquer hosting)...');
execSync(`tar -a -c -f "${distZip}" -C "${DIST}" .`, { stdio: 'inherit' });

console.log('2/2 Gerando spc-portal-codigo-fonte.zip (código-fonte limpo sem node_modules)...');
execSync(`git archive --format=zip --output="${srcZip}" HEAD`, { cwd: ROOT, stdio: 'inherit' });

const distSizeMb = (fs.statSync(distZip).size / (1024 * 1024)).toFixed(2);
const srcSizeMb = (fs.statSync(srcZip).size / (1024 * 1024)).toFixed(2);

console.log('\nPacotes gerados com sucesso em: entrega-secma/');
console.log(` - spc-portal-publicacao-pronta.zip (${distSizeMb} MB)`);
console.log(` - spc-portal-codigo-fonte.zip      (${srcSizeMb} MB)`);
console.log(` - LEIA-ME-HOSPEDAGEM-SECMA.txt`);
