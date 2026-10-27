# Portal SPC Maranhão — Estrutura Completa e Mapa do Site

> Levantamento feito a partir do código em 27/10/2026. Serve de base para decidir os ajustes.
> Legenda de status: ✅ ativa e com conteúdo · 🟡 ativa, mas com ressalva · 🚧 rota existe, mostra "em preparação" · 🔒 exige login · ⛔ código existe, mas não está ligado ao site

---

## 1. Visão geral técnica

| Item | Valor |
|---|---|
| Framework | React + TypeScript, build com Vite |
| Roteamento | `react-router-dom` com **HashRouter** (URLs do tipo `/#/servicos`) |
| Estilo | Tailwind + `index.css` (tokens `brand-navy`, `brand-terracotta`, `brand-blue`, `brand-sand`…) |
| Backend | Firebase (Auth, Firestore, Storage); regras em `firestore.rules` e `storage.rules` |
| Hospedagem | Firebase Hosting (`firebase.json`) e Cloudflare Worker (`wrangler.jsonc`, `worker/index.js`) |
| Ponto de entrada | `index.html` → `index.tsx` → `App.tsx` |
| Estrutura de pastas | **Sem pasta `src/`**: tudo na raiz do projeto |
| Dados públicos | Estáticos em `data/` (não dependem do Firebase) |
| Dados com Firebase | Legislação (`legislation`), Mapa, Acervo, Repositório, Admin (`users`) |

### Casca global (`App.tsx`)
Presente em todas as páginas:
1. **Link "Ir para o conteúdo"** (acessibilidade)
2. **ScrollProgress** (barra de progresso de rolagem)
3. **Navigation**
   - Faixa superior (só desktop): Acesso à Informação · SECMA (externo) · Denúncias · Alto contraste · Busca (leva a `/legislacao?q=`)
   - Barra principal: logo SPC → `/` · A SPC · Serviços · Bens tombados · Legislação · Contato · (Ingestão, se colaborador) · (Admin, se admin) · Sair · logo do Governo
   - Menu mobile equivalente
4. **PageTransition** envolvendo as rotas
5. **Footer** (oculto em `/mapa`): colunas Institucional, Contato, rodapé legal (Privacidade · Termos · Área restrita)
6. **VLibras** (tradutor de Libras, script externo do gov.br)

---

## 2. Árvore do site (rotas)

```
/ (Início) ✅
│
├── /institucional ......... A SPC ✅  (3 abas: Quem somos · Estrutura · Atuação)
│     ├── /dphap ........... 🚧 DepartamentoEmPreparacao (resumo + e-mail)
│     ├── /dpe ............. 🚧 DepartamentoEmPreparacao
│     └── /dpi ............. 🚧 DepartamentoEmPreparacao
│
├── /servicos .............. Serviços ao cidadão ✅
│     ├── Catálogo (5 serviços, com busca)
│     └── Assistente de protocolo (gera requerimento / mailto)
│
├── /bens-tombados ......... Este bem é tombado? ✅  (101 bens)
│     └── aceita ?q= e ?municipio=
│
├── /legislacao ............ Biblioteca de legislação 🟡  (aceita ?q=)
│
├── /contato ............... Canais de atendimento ✅
├── /denuncia .............. Comunicação e denúncia ✅
├── /transparencia ......... Transparência e acesso à informação ✅
├── /privacidade ........... Política de Privacidade ✅
├── /termos ................ Termos de Uso ✅
├── /ajuda ................. redireciona → /contato
│
├── /login ................. Login (Firebase Auth) ✅
├── /admin ................. 🔒 AdminDashboard (editores/admin)
├── /ingestao .............. 🔒 Ingestão de documentos (editores/admin)
│
├── /mapa .................. 🚧 "Página em preparação"   (MapaPage.tsx existe ⛔)
├── /acervo-digital ........ 🚧 "Página em preparação"   (AcervoDigitalPage.tsx ⛔)
├── /acervo ................ 🚧 "Página em preparação"   (AcervoPage.tsx ⛔)
├── /repositorio ........... 🚧 "Página em preparação"   (RepositorioPage.tsx ⛔)
└── *  ..................... Página não encontrada (404)
```

### Páginas importadas mas não ligadas a nenhuma rota ⛔
`MapaPage`, `AcervoDigitalPage`, `AcervoPage`, `RepositorioPage`, `DphapPage`, `DpiPage`, `DpePage`.
Estão importadas em `App.tsx`, mas as rotas usam o placeholder. Somam ~190 KB de código morto no bundle.

---

## 3. Navegação: o que aparece onde

| Destino | Menu topo | Faixa superior | Footer | Menu Origami (home) | Home (corpo) |
|---|:-:|:-:|:-:|:-:|:-:|
| /institucional | ✅ | | ✅ | ✅ | |
| /servicos | ✅ | | ✅ | ✅ | ✅ |
| /bens-tombados | ✅ | | ✅ | ✅ | ✅ |
| /legislacao | ✅ | busca | ✅ | ✅ | ✅ |
| /contato | ✅ | | ✅ | ✅ | ✅ |
| /denuncia | | ✅ | ✅ | ✅ | ✅ |
| /transparencia | | ✅ | ✅ | ✅ | |
| /privacidade, /termos | | | ✅ | | |
| /login | | | ✅ ("Área restrita") | | |
| /dphap, /dpe, /dpi | | | | | só /dpi |

---

## 4. Estrutura da página inicial (`pages/HomePage.tsx`)

| # | Bloco | Conteúdo | Links de saída |
|---|---|---|---|
| 1 | **OrigamiMenu** (hero 3D) | 5 painéis dobráveis com foto, atalhos e busca de bens | ver tabela abaixo |
| 2 | Faixa de indicadores | 4 números: bens tombados, municípios, decretos digitalizados, diretorias | — |
| 3 | Balcão de serviços | 3 abas por setor (DPHAP · DPI · DPE/Fiscalização), com procedimentos e documentos exigidos | /servicos, /bens-tombados, /dpi, /denuncia, /legislacao |
| 4 | Guia normativo para reformas | Passo a passo de autorização de obras | /servicos |
| 5 | Planta de São Luís (1912) | Imagem com zoom e 8 pontos históricos | — |
| 6 | Legislação em destaque | Até 3 normas marcadas `featured` | /legislacao, fonte externa de cada norma |
| 7 | Canais oficiais | Chamada para atendimento e denúncia | /contato, /denuncia |

### Painéis do OrigamiMenu (`components/ui/OrigamiMenu.tsx`)
| Nº | Título | Destino | Atalhos |
|---|---|---|---|
| 01 | Este bem é tombado? | /bens-tombados | Relação completa · 2 municípios com mais bens |
| 02 | Serviços ao cidadão | /servicos | Autorização para obras · Certidão de poligonal · Registro imaterial (todos vão para /servicos) |
| 03 | Biblioteca de Legislação | /legislacao | Biblioteca completa · normas em destaque |
| 04 | Comunicação e Denúncia | /denuncia | Registrar denúncia · Consultar bens · Plantão (→ /contato) |
| 05 | Sobre a SPC | /institucional | Estrutura · Transparência · Contatos |

---

## 5. Detalhe das páginas ativas

### /institucional — A SPC
- Hero com imagem `CH 01.jpg`
- Abas: **Quem somos** (texto + cartão do superintendente) · **Estrutura** (3 departamentos, cada um com link para `/dphap`, `/dpe`, `/dpi`) · **Atuação** (Proteger, Orientar, Valorizar, Fiscalizar)
- Chamada final: "Precisa falar com a SPC?" → /contato e /servicos

### /servicos — Serviços ao cidadão
- Hero + busca por título, categoria, departamento e descrição
- Catálogo de 5 serviços (documentos exigidos, etapas, prazo, referências):

| ID | Serviço | Setor |
|---|---|---|
| s1 | Autorização para intervenção em imóvel tombado | DPHAP |
| s2 | Certidão de limites de poligonal e tombamento | DPHAP |
| s3 | Autorização para engenhos publicitários | DPHAP |
| s4 | Registro de patrimônio cultural imaterial | DPI |
| s5 | Consulta técnica prévia e orientação arquitetônica | DPE |

- **Assistente de protocolo**: formulário (nome, documento, vínculo, e-mail, telefone, cidade, endereço, descrição) que monta o requerimento, permite copiar/imprimir e abre `mailto:` para `sup.maranhao@gmail.com`
- Cartões de departamento com PDF de diretrizes de engenhos publicitários

### /bens-tombados — Este bem é tombado?
- Hero com busca
- Gráficos: onde estão os bens (mapa de municípios), quando o Estado tombou (por ano), decretos digitalizados (com × sem PDF)
- Lista filtrável (município, ano, texto), dados de `data/bensTombados.ts`
- PDFs em `public/documentos/decretos/` (12 arquivos)

### /legislacao — Biblioteca de legislação
- Busca + filtros por categoria e esfera (Estadual, Federal, Municipal, SPC)
- Fonte de dados: `data/publicLegalDocuments.ts` (estático) **e** coleção Firestore `legislation` (tempo real)
- Cartões de política da biblioteca
- PDFs em `public/documentos/legislacao/` (8 arquivos)

### /contato
- Canais: e-mail geral, e-mail de denúncias (DPHAP), Ouvidoria da SECMA, endereço (Solar dos Vasconcelos, Rua da Estrela, 562, Centro, São Luís), link de mapa
- A SPC **não possui telefone**; não incluir número

### /denuncia
- Hero + orientações do que denunciar e como; canal por e-mail (DPHAP)

### /transparencia, /privacidade, /termos
- Páginas de texto institucional (componente `InfoPage`)
- Transparência aponta para /legislacao, /servicos e /privacidade

### /login, /admin, /ingestao
- Login por e-mail/senha e Google
- Perfis (`types.ts` → `UserRole`): editores DPE/DPHAP/DPI, colaborador, admin
- `/admin` e `/ingestao` abrem para `EDITOR_ROLES` ou admin
- Ingestão: formulário de upload e fila de revisão (`components/ingestion/`)

---

## 6. Mapa de arquivos

```
SPC/
├── index.html · index.tsx · App.tsx · index.css · types.ts · firebase.ts
├── vite.config.ts · tailwind.config.js · postcss.config.js · tsconfig.json
├── firebase.json · firestore.rules · firestore.indexes.json · storage.rules
├── wrangler.jsonc · worker/index.js
│
├── pages/ (20)
│   ├── ativas: Home, Institucional, Servicos, BensTombados, Legislacao, Contato,
│   │           Denuncia, Transparencia, Privacidade, Termos, Login, AdminDashboard, Ingestao
│   └── sem rota: Mapa, Acervo, AcervoDigital, Repositorio, Dphap, Dpi, Dpe
│
├── components/
│   ├── ui/ ........... OrigamiMenu (51 KB), PageHero, InfoPage, Motion, Reveal,
│   │                   PanZoomImage, SearchFilterCard, DocumentViewer, FileItem,
│   │                   FileUpload, GlassPanel, TimelineStory, ThreeHeroCanvas, theme
│   ├── dataviz/ ...... BarList, ChartCard, ColumnChart, MunicipiosMap, ShareBar, StatTile…
│   ├── scene/ ........ ImmersiveHero, MaranhaoScene, ElementScene, layers, sceneLayout
│   ├── Map/ .......... GeoManager (127 KB), HeritageMap, editores, rotas turísticas…
│   └── ingestion/ .... UploadForm, ReviewQueue, IngestionStatusBadge
│
├── data/ ............. bensTombados, publicLegalDocuments, siteContact, acervoSeed,
│                       patrimonioSeed, geoManagerData, touristData, mockData, adminConfig
├── services/ ......... ingestionService, GeocodingService, LotImportService, geoUtils, routingEngine
├── contexts/ ......... AuthContext
├── hooks/ ............ usePageTitle
├── scripts/ .......... ingest_cena.py, validar-dados.ts
├── public/ ........... logos, cena-fotos/ (13 webp), imagens/, documentos/{decretos,legislacao}
└── docs/ ............. MAP_MANIFESTO, PROCESSO_CRIACAO_PORTAL_SPC, INVENTARIO_PRELIMINAR_ACERVO_LEGAL_SPC
```

### Sujeira na raiz do projeto
- ~35 fotos soltas (`2021*.jpg`, `IMG_*.jpg`, `DJI_0199.JPG`, `rua portugal.jpg` 14 MB, `.bmp` 3,6 MB…), algumas com 15 MB
- 17 pastas `_backup_antes_*`, mais `backup_imagens`, `Claude outputs`, `tmp`, `output`, `arte-cena`
- Logs: `build_error_v4.log`, `build_log.txt`
- Documentos de planejamento soltos: `document-hub.md`, `fluxo_de_links.md`, `mvp-scoping.md`, `site-institucional-spc.md`

---

## 7. Pontos de atenção identificados (candidatos a ajuste)

### Conteúdo e coerência
| # | Problema | Onde | Sugestão |
|---|---|---|---|
| 1 | "100% Decretos digitalizados" fixo na Home, enquanto /bens-tombados mostra bens "ainda não localizado" | `HomePage.tsx` linha ~70 | Calcular a partir de `BENS_TOMBADOS` |
| 2 | "217 municípios" e "101 bens" escritos à mão no texto | Home linhas ~66 e ~264 | Usar `totalBens` e dado oficial; "217" mostra todos os municípios do estado, não os com bens |
| 3 | Aba "DPE & Proteção Preventiva" trata o DPE como fiscalização, mas o DPE é *Projetos Especiais* | Home, aba 3 | Separar: DPE = projetos; fiscalização = DPHAP |
| 4 | "Diretoria I/II/III" e "Art. 13 e 14 da Lei nº 5.622/92" sem fonte na biblioteca | Home, aba DPHAP | Verificar com a SPC ou remover |
| 5 | Texto "Gerar Petição para Obras" e "Emitir Certidão" sugerem emissão online, mas o fluxo é e-mail | Home | Trocar por "Ver como solicitar" |
| 6 | Cartões de departamento em /servicos apontam para `/institucional` e não para `/dphap`, `/dpi`, `/dpe` | `ServicosPage.tsx` | Apontar para a página do departamento |

### Navegação e estrutura
| # | Problema | Sugestão |
|---|---|---|
| 7 | Três serviços do Origami levam todos a `/servicos` genérico | Âncoras por serviço (`/servicos?id=s1`) |
| 8 | `/dphap`, `/dpe`, `/dpi` mostram só um resumo; só `/dpi` é linkado na Home | Decidir: construir ou remover do menu |
| 9 | Transparência e Denúncias só na faixa superior (some no celular até abrir o menu) | Manter também no menu principal |
| 10 | HashRouter gera URLs `/#/…`, ruins para SEO e compartilhamento | Migrar para BrowserRouter + regra de rewrite no Firebase/Cloudflare |
| 11 | Busca do topo só pesquisa legislação, mas o rótulo é "Buscar na legislação" e não acha bens ou serviços | Busca global ou rótulo claro |
| 12 | 4 rotas "em preparação" (`/mapa`, `/acervo*`, `/repositorio`) sem link no menu | Remover rotas ou publicar |

### Técnico
| # | Problema | Sugestão |
|---|---|---|
| 13 | 7 páginas e componentes pesados (GeoManager 127 KB, RepositorioPage 70 KB) importados sem uso | Remover imports ou usar `React.lazy` |
| 14 | Páginas carregadas todas de uma vez | Code splitting por rota |
| 15 | Imagens grandes em `public/imagens` (3 MB+) e na raiz | Converter para WebP, mover fotos soltas para fora do repositório |
| 16 | Sem pasta `src/`, backups e arquivos de trabalho na raiz | Organizar e adicionar ao `.gitignore` |
| 17 | `/legislacao` mistura dados estáticos e Firestore | Definir fonte única de verdade |
| 18 | `SITE_CONTACT` usa e-mails Gmail | Trocar por e-mail institucional `.gov.br` quando existir (um só ponto de edição) |

---

## 8. Próximo passo sugerido
Escolha os itens por número (ex.: 1, 2, 3, 6, 13) e eu aplico. Para decisões de conteúdo (3, 4, 8, 12), preciso da sua orientação ou da confirmação da SPC.
