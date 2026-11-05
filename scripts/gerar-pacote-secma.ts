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

URL de Homologação Online: https://spcmaranhao.web.app

Esta entrega contém os pacotes oficiais para implantação na infraestrutura
própria da SECMA / Governo do Estado do Maranhão:

1. spc-portal-publicacao-pronta.zip (RECOMENDADO PARA SUBIR DIRETO NO HOSTING)
   - Contém a aplicação web já compilada e otimizada (HTML, CSS, JS, mapas
     históricos de 1698 e 1912 em alta resolução e os 20 decretos/leis em PDF
     incorporados localmente em /documentos/).
   - NÃO exige Node.js instalado no servidor web de destino e NÃO depende de
     links externos de Google Drive pessoal.
   - Funciona imediatamente em qualquer servidor HTTP estático:
     * Apache HTTP Server (já inclui arquivo .htaccess configurado)
     * Microsoft IIS (já inclui arquivo web.config configurado)
     * Nginx / Cloudflare / Firebase Hosting / cPanel
   - COMO PUBLICAR:
     Basta extrair o conteúdo de "spc-portal-publicacao-pronta.zip" dentro da
     pasta pública do domínio/subdomínio institucional (ex.: /var/www/html,
     public_html ou diretório raiz do VirtualHost, como spc.cultura.ma.gov.br).

2. spc-portal-codigo-fonte.zip (CÓDIGO-FONTE PARA MANUTENÇÃO E EVOLUÇÃO)
   - Contém o código-fonte completo em React 19 + TypeScript + Vite 8.
   - Para compilar a partir do código-fonte:
     a) Instale o Node.js 22+
     b) Copie .env.example para .env.local (se utilizar autenticação Firebase)
     c) Execute: npm ci
     d) Execute: npm run build
     e) O resultado compilado será gerado na pasta dist/

3. GOVERNANCA_E_HOMOLOGACAO_SPC.md
   - Manual completo de governança, matriz RBAC de segurança, conformidade LGPD,
     política de backup e roteiro de transferência institucional.

OBSERVAÇÕES TÉCNICAS:
- As páginas públicas (Início, A SPC, DPHAP, DPI, DPE, Serviços, Bens Tombados,
  Mapas e Plantas Históricas, Legislação, Contato, Denúncias e Transparência)
  funcionam de forma 100% autônoma a partir dos arquivos estáticos do pacote.
- Todos os 20 PDFs de decretos, leis estaduais e diretrizes estão dentro da
  pasta /documentos/ do próprio pacote estático.
===============================================================================
`;

fs.writeFileSync(path.join(OUT_DIR, 'LEIA-ME-HOSPEDAGEM-SECMA.txt'), readmeTxt, 'utf-8');
fs.writeFileSync(path.join(DIST, 'LEIA-ME-HOSPEDAGEM-SECMA.txt'), readmeTxt, 'utf-8');

const govDocSrc = path.join(ROOT, 'docs', 'GOVERNANCA_E_HOMOLOGACAO_SPC.md');
const govDocDest = path.join(OUT_DIR, 'GOVERNANCA_E_HOMOLOGACAO_SPC.md');
if (fs.existsSync(govDocSrc)) {
  fs.copyFileSync(govDocSrc, govDocDest);
}

const distZip = path.join(OUT_DIR, 'spc-portal-publicacao-pronta.zip');
const srcZip = path.join(OUT_DIR, 'spc-portal-codigo-fonte.zip');
const fullBundleZip = path.join(OUT_DIR, 'SPC-Portal-Entrega-Completa-TI-SECMA.zip');

if (fs.existsSync(distZip)) fs.unlinkSync(distZip);
if (fs.existsSync(srcZip)) fs.unlinkSync(srcZip);
if (fs.existsSync(fullBundleZip)) fs.unlinkSync(fullBundleZip);

console.log('1/3 Gerando spc-portal-publicacao-pronta.zip (arquivos prontos para qualquer hosting)...');
execSync(`tar -a -c -f "${distZip}" -C "${DIST}" .`, { stdio: 'inherit' });

console.log('2/3 Gerando spc-portal-codigo-fonte.zip (código-fonte limpo sem node_modules)...');
execSync(`git archive --format=zip --output="${srcZip}" HEAD`, { cwd: ROOT, stdio: 'inherit' });

console.log('3/3 Gerando SPC-Portal-Entrega-Completa-TI-SECMA.zip (pacote único unificado para o TI)...');
execSync(
  `tar -a -c -f "${fullBundleZip}" -C "${OUT_DIR}" "LEIA-ME-HOSPEDAGEM-SECMA.txt" "GOVERNANCA_E_HOMOLOGACAO_SPC.md" "spc-portal-publicacao-pronta.zip" "spc-portal-codigo-fonte.zip"`,
  { stdio: 'inherit' }
);

const distSizeMb = (fs.statSync(distZip).size / (1024 * 1024)).toFixed(2);
const srcSizeMb = (fs.statSync(srcZip).size / (1024 * 1024)).toFixed(2);
const fullSizeMb = (fs.statSync(fullBundleZip).size / (1024 * 1024)).toFixed(2);

console.log('\nPacotes gerados com sucesso em: entrega-secma/');
console.log(` - SPC-Portal-Entrega-Completa-TI-SECMA.zip (${fullSizeMb} MB) [ARQUIVO ÚNICO COMPLETO]`);
console.log(` - spc-portal-publicacao-pronta.zip         (${distSizeMb} MB) [SÓ ARQUIVOS COMPILADOS]`);
console.log(` - spc-portal-codigo-fonte.zip              (${srcSizeMb} MB) [SÓ CÓDIGO-FONTE]`);
console.log(` - LEIA-ME-HOSPEDAGEM-SECMA.txt`);
console.log(` - GOVERNANCA_E_HOMOLOGACAO_SPC.md`);

