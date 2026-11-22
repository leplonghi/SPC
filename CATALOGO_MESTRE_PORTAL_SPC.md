# Catálogo Mestre do Portal SPC Maranhão (SECMA)

> **Documento de referência técnica, documental e de manutenção futura.**
> Reúne o inventário verificado de todas as páginas, dados institucionais, **63 bens tombados**, **16 decretos digitalizados em PDF**, **17 mapas e poligonais**, **18 atos públicos de legislação** (+ **2 atos mantidos ocultos em catalogação interna**), **5 serviços oficiais** (com formulários e checklists em PDF) e **acervo fotográfico** embarcados no portal.

---

## 1. Identificação Institucional, Ambientes e Contatos

| Item | Valor Oficial no Portal | Arquivo de Origem |
| :--- | :--- | :--- |
| **Órgão** | Superintendência do Patrimônio Cultural do Maranhão (SPC) | `data/siteContact.ts` |
| **Vinculação** | Secretaria de Estado da Cultura do Maranhão (SECMA) | `data/siteContact.ts` |
| **Sede** | Solar dos Vasconcelos — Rua da Estrela, 562, Centro, São Luís/MA | `data/siteContact.ts` |
| **E-mail Institucional / Protocolo** | `dphapspc@gmail.com` | `data/siteContact.ts` |
| **SuperAdmin / Relatórios de Acesso** | `leplonghi@gmail.com` | `data/adminConfig.ts` |
| **URL de Homologação (Curta)** | `https://spcmaranhao.web.app` | `firebase.json` |
| **Projeto Firebase** | `spc-maranhao-homologacao` (Site: `spcmaranhao`) | `.firebaserc` / `firebase.json` |
| **Repositório Git** | `https://github.com/leplonghi/SPC` (branch `chore/firebase-homologacao`) | Git |
| **Pacote Completo para o TI (SECMA)** | `entrega-secma/SPC-Portal-Entrega-Completa-TI-SECMA.zip` | `scripts/gerar-pacote-secma.ts` |

---

## 2. Mapa de Rotas e Módulos do Portal

### Rotas Públicas
| Rota | Módulo / Página | Função Principal |
| :--- | :--- | :--- |
| `/#/` | `pages/HomePage.tsx` + `components/ui/OrigamiMenu.tsx` | Abertura institucional, Busca Global Instantânea (`GlobalSearchBar.tsx`), 5 atalhos principais e números do acervo. |
| `/#/bens-tombados` | `pages/BensTombadosPage.tsx` | Explorador Split-View (Desktop) e Gaveta (Mobile) dos 63 bens tombados, filtros por município/categoria/período/PDF, download de decretos e mapas de tombamento, mapa geográfico e exportação CSV. |
| `/#/mapa` | `pages/CartografiaPage.tsx` | Mapoteca Digital com 12 pranchas interativas (`PanZoomImage.tsx`), pins clicáveis vinculados ao Livro do Tombo e download dos arquivos originais. |
| `/#/legislacao` | `pages/LegislacaoPage.tsx` | Explorador Split-View da Biblioteca Normativa (11 atos oficiais + normas publicadas via Firestore), explicação prática e download/link oficial. |
| `/#/servicos` | `pages/ServicosPage.tsx` | Carta de Serviços (5 serviços) em fluxo direto para o Formulário de Requerimento + aba de Documentos Obrigatórios e impressão de folha de rosto. |
| `/#/institucional` | `pages/InstitucionalPage.tsx` | Quem somos, superintendente, estrutura dos 3 departamentos e competências. |
| `/#/dphap` · `/#/dpi` · `/#/dpe` | `pages/DepartamentoOficialPage.tsx` | Páginas institucionais oficiais dos 3 departamentos técnicos da SPC. |
| `/#/denuncia` | `pages/DenunciaPage.tsx` | Canal oficial de comunicação de obra irregular, demolição ou dano ao patrimônio. |
| `/#/contato` | `pages/ContatoPage.tsx` | Canais de atendimento presencial e eletrônico. |
| `/#/transparencia` | `pages/TransparenciaPage.tsx` | Transparência Pública e Lei de Acesso à Informação (LAI). |
| `/#/privacidade` · `/#/termos` | `pages/PrivacidadePage.tsx` · `pages/TermosPage.tsx` | Política de Privacidade (LGPD, transparência de analytics anônimo) e Termos de Uso. |

### Rotas Restritas (RBAC via Firebase Auth + `firestore.rules`)
| Rota | Página | Perfis Autorizados |
| :--- | :--- | :--- |
| `/#/login` | `pages/LoginPage.tsx` | Autenticação institucional. |
| `/#/admin` | `pages/AdminDashboard.tsx` | `SuperAdmin`, `AdminSPC`, `EditorDPE`, `EditorDPHAP`, `EditorDPI` (inclui aba **Acessos & Visitantes** para `leplonghi@gmail.com`). |
| `/#/ingestao` | `pages/IngestaoPage.tsx` | Editores, Admins e `Colaborador` (fila de ingestão documental). |

---

## 3. Acervo de Bens Tombados (`data/bensTombados.ts`)

- **Total de inscrições ativas:** **63 bens tombados** (período de decretos estaduais: **1979 a 1993**; não há tombamentos estaduais posteriores a 1993).
- **Inscrições canceladas no Livro do Tombo:** `#020` e `#021` (não publicadas por estarem canceladas).
- **Cobertura territorial:** **11 municípios maranhenses**:

| Município | Qtd. Bens | Mapa de Tombamento Vinculado no Portal |
| :--- | :-: | :--- |
| **São Luís** | 45 | Sim (`tombamento.png`) |
| **Alcântara** | 4 | Sim (`MAN_s.d._ALC_MAPA_TOMBAMENTO.pdf`) |
| **Caxias** | 3 | Sim (`MAN_s.d._CAX_MAPS_TOMBAMENTO.pdf`) |
| **Viana** | 2 | Sim (`MAP_s.d._VIA_MAPA_PLANTA_BAIXA.pdf` + `MAN_s.d._VIA_MAPA_TOMBAMENTO.pdf`) |
| **Carolina** | 2 | Sim (`MAN_2010_CAR_TOMBAMENTO_MARCO.pdf`) |
| **Itapecuru-Mirim** | 2 | Pendente de envio |
| **Pindaré-Mirim** | 1 | Pendente de envio |
| **Paço do Lumiar** | 1 | Pendente de envio |
| **Rosário** | 1 | Pendente de envio |
| **Barreirinhas** | 1 | Pendente de envio |
| **Buriti** | 1 | Pendente de envio |
| **Total** | **63** | **5 municípios com mapas de tombamento (56 dos 63 bens cobertos)** |

### 3.1 Decretos de Tombamento com PDF Digitalizado (16 arquivos locais)
Todos os PDFs abaixo estão hospedados localmente dentro da pasta `public/` (zero dependência externa):

| Decreto nº | Arquivo Local (`public/...`) | Tamanho | Inscrição / Município |
| :---: | :--- | :---: | :--- |
| **10.089** | `/documentos/legislacao/decreto-estadual-10089-1986-doe.pdf` | 350.3 KB | `#037` (São Luís — Centro Histórico ZE/2) |
| **10.899** | `/documentos/decretos/decreto-estadual-10899-1988.pdf` | 963.2 KB | `#040` (Viana — Centro Histórico) |
| **11.582** | `/documentos/decretos/decreto-estadual-11582-1990.pdf` | 269.4 KB | `#041` (São Luís) |
| **11.583** | `/documentos/decretos/decreto-estadual-11583-1990.pdf` | 417.4 KB | `#042` (São Luís) |
| **11.584** | `/documentos/decretos/decreto-estadual-11584-1990.pdf` | 411.7 KB | `#043` (São Luís) |
| **11.585** | `/documentos/decretos/decreto-estadual-11585-1990.pdf` | 439.1 KB | `#044` (São Luís) |
| **11.591** | `/documentos/legislacao/decreto-estadual-11591-1990-doe.pdf` | 145.8 KB | `#050` (São Luís — Centro Histórico) |
| **11.593** | `/documentos/legislacao/decreto-estadual-11593-1990-arvores.pdf` | 649.4 KB | `#052` (São Luís — Árvores Raras) |
| **11.681** | `/documentos/decretos/decreto-estadual-11681-1990.pdf` | 766.5 KB | `#059` (Caxias — Centro Histórico) |
| **11.682** | `/documentos/decretos/decreto-estadual-11682-1990.pdf` | 89.1 KB | `#058` (Buriti — Fazenda Santa Cruz) |
| **11.683** | `/documentos/decretos/decreto-estadual-11683-1990-recorte-doe.pdf` | 1.05 MB | `#060` (Alcântara — Sítio Histórico) |
| **12.456** | `/documentos/decretos/decreto-estadual-12456-12457-1992-doe.pdf` | 70.3 KB | `#061` (Viana — Sinos da Matriz) |
| **12.457** | `/documentos/decretos/decreto-estadual-12456-12457-1992-doe.pdf` | 70.3 KB | `#062` (São Luís — Canto da Fabril) *(cópia parcial)* |
| **12.954** | `/documentos/decretos/decreto-estadual-12954-1993-doe.pdf` | 32.9 KB | `#063` (Carolina — Centro Histórico) |
| **12.955** | `/documentos/decretos/decreto-estadual-12955-1993-doe.pdf` | 33.9 KB | `#064` (Itapecuru-Mirim — Sítio Paleontológico) |
| **12.956** | `/documentos/decretos/decreto-estadual-12956-1993-doe.pdf` | 33.1 KB | `#065` (Carolina — Sítios Arqueológicos) |

> **Pendência de digitalização (47 inscrições):** as inscrições `#001` a `#036`, `#038`, `#039`, `#045` a `#049`, `#051` e `#053` a `#057` estão marcadas como *"Cópia física no acervo"*. Conforme a SPC digitalizar cada decreto, basta salvar o PDF em `public/documentos/decretos/` e adicionar 1 linha no objeto `DECRETOS_PDF` em `data/bensTombados.ts`.

---

## 4. Mapoteca Digital — Cartografia Histórica e Poligonais (`data/mapasHistoricos.ts`)

Todas as **17 pranchas** abaixo possuem visualização interativa com zoom/pan, pins calibrados vinculados ao Livro do Tombo e botão de download do arquivo original em `public/cena-fotos/`:

### 4.1 Plantas e Cartas Históricas (6 pranchas — 1698 a 1912)
| ID do Mapa | Território / Época | Título | Arquivo Visor (`src`) | Arquivo Download (`downloadUrl`) | Pins |
| :--- | :--- | :--- | :--- | :--- | :-: |
| `sao-luis-1698-pianta` | São Luís · 1698 | *Pianta della città di S. Luigi metropoli del Maragnone* | `/cena-fotos/pianta-1698.jpg` (1.88 MB) | `/cena-fotos/pianta-1698.jpg` (1.88 MB) | 7 |
| `maranhao-1698-provincie` | Maranhão · 1698 | *Provinciæ del Parà e del Maragnone* | `/cena-fotos/MAP_s.d._Provincie_del_Para_e_del_Maragnone_1698.jpg` (1.56 MB) | Mesmo JPG (1.56 MB) | 4 |
| `maranhao-1819-capitania` | Maranhão · 1819 | *Mappa Geographico da Capitania do Maranham (1819)* | `/cena-fotos/MAP_s.d._MAPA_GEOGRAFICO_MA.jpg` (2.34 MB) | Mesmo JPG (2.34 MB) | 5 |
| `sao-luis-1858-veiga` | São Luís · 1858 | *Planta da Cidade de São Luís do Maranhão Levantada em 1858* | `/cena-fotos/MAP_s.d._mapa.png` (6.06 MB) | Mesmo PNG (6.06 MB) | 4 |
| `sao-luis-1912-urbano` | São Luís · 1912 | *Planta da Cidade de S. Luiz — Malha Urbana e Equipamentos Públicos* | `/cena-fotos/planta-1912-mini.webp` (112.8 KB) + `planta-1912.webp` | `/cena-fotos/planta-1912-completa.jpg` (3.01 MB) | 8 |
| `sao-luis-1912-folha-completa` | São Luís · 1912 | *Folha Cartográfica Integral de 1912 — Freguesias, Indústrias e Jornais* | `/imagens/mapa_sao_luiz.jpg` (265.6 KB) + `planta-1912-completa.jpg` | `/cena-fotos/planta-1912-completa.jpg` (3.01 MB) | 6 |

### 4.2 Mapas de Tombamento e Poligonais Municipais (11 pranchas)
| ID do Mapa | Município | Título | Imagem Interativa (`src`) | Arquivo Original Download (`downloadUrl`) | Pins |
| :--- | :--- | :--- | :--- | :--- | :-: |
| `sao-luis-poligonal-tombamento` | **São Luís** | Mapa das Áreas Tombadas do Centro Histórico (Estadual e UNESCO) | `/cena-fotos/tombamento.png` (336.1 KB) | `/cena-fotos/tombamento.png` (336.1 KB) | 3 |
| `sao-luis-poligonal-fed-est-unesco` | **São Luís** | Mapa Oficial das Poligonais de Tombamento — Federal, Estadual e UNESCO | `/cena-fotos/MAN_2019_SLZ_MAPA_TOMBAMENTO_FED_EST_UNESCO.jpg` (569.7 KB) | `/cena-fotos/MAN_2019_SLZ_MAPA_TOMBAMENTO_FED_EST_UNESCO.pdf` (1.00 MB) | 4 |
| `sao-luis-setorizacao-ch` | **São Luís** | Mapa de Setorização do Centro Histórico de São Luís (Setores 1 a 5) | `/cena-fotos/MAN_2018_SLZ_SETORIZACAO_CH.jpg` (924.0 KB) | `/cena-fotos/MAN_2018_SLZ_SETORIZACAO_CH.pdf` (2.29 MB) | 4 |
| `sao-luis-estilos-arquitetonicos` | **São Luís** | Levantamento de Estilos Arquitetônicos do Centro Histórico (1:3.000) | `/cena-fotos/MAN_s.d._SLZ_ESTILOS_ARQUITETONICOS.jpg` (1.36 MB) | `/cena-fotos/MAN_s.d._SLZ_ESTILOS_ARQUITETONICOS.pdf` (1.46 MB) | 3 |
| `alcantara-mapa-tombamento` | **Alcântara** | Mapa do Sítio Histórico de Alcântara — Monumentos e Perímetro Urbano | `/cena-fotos/MAN_s.d._ALC_MAPA_TOMBAMENTO.jpg` (1.26 MB) | `/cena-fotos/MAN_s.d._ALC_MAPA_TOMBAMENTO.pdf` (196.6 KB) | 6 |
| `alcantara-mapa-cidade` | **Alcântara** | Mapa Geral da Cidade de Alcântara — Malha Urbana e Entorno | `/cena-fotos/MAN_s.d._ALC_MAPA_CIDADE.jpg` (981.4 KB) | `/cena-fotos/MAN_s.d._ALC_MAPA_CIDADE.pdf` **(21.09 MB)** | 4 |
| `viana-planta-geral-1988` | **Viana** | Planta Geral 01/01 — Delimitação do Perímetro de Tombamento (Abril/1988, 1:2000) | `/cena-fotos/MAP_s.d._VIA_MAPA_PLANTA_BAIXA.jpg` (1.88 MB) | `/cena-fotos/MAP_s.d._VIA_MAPA_PLANTA_BAIXA.pdf` **(24.45 MB)** | 4 |
| `viana-mapa-cadastral-tombamento` | **Viana** | Mapa Cadastral de Quadras, Lotes e Imóveis do Centro Histórico | `/cena-fotos/MAN_s.d._VIA_MAPA_TOMBAMENTO.jpg` (569.9 KB) | `/cena-fotos/MAN_s.d._VIA_MAPA_TOMBAMENTO.pdf` (565.3 KB) | 4 |
| `caxias-poligonal-tombamento` | **Caxias** | Mapa da Poligonal de Tombamento do Centro Histórico de Caxias | `/cena-fotos/MAN_s.d._CAX_MAPS_TOMBAMENTO.jpg` (814.1 KB) | `/cena-fotos/MAN_s.d._CAX_MAPS_TOMBAMENTO.pdf` (774.7 KB) | 4 |
| `carolina-poligonal-tombamento-2010` | **Carolina** | Mapa da Poligonal de Tombamento e Marcos Arquitetônicos (2010) | `/cena-fotos/MAN_2010_CAR_TOMBAMENTO_MARCO.jpg` (566.9 KB) | `/cena-fotos/MAN_2010_CAR_TOMBAMENTO_MARCO.pdf` (176.0 KB) | 4 |
| `sao-jose-de-ribamar-poligonal` | **São José de Ribamar** | Conjunto Arquitetônico e Urbanístico de SJR — Poligonais de Tombamento e Entorno (Estudo 2023) | `/cena-fotos/MAN_2023_SJR_MAPA_TOMBAMENTO.jpg` (517.6 KB) | `/cena-fotos/MAN_2023_SJR_MAPA_TOMBAMENTO.pdf` (288.0 KB) | 4 |

---

## 5. Biblioteca de Legislação (`data/publicLegalDocuments.ts`)

Total público atual: **18 atos normativos publicados** (14 PDFs hospedados localmente + 4 links oficiais federais):

| ID | Data | Esfera | Tipo | Título | Fonte / Arquivo | Tamanho |
| :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| `br-decreto-lei-25-1937` | 1937-11-30 | Federal | Decreto | Decreto-Lei nº 25/1937 (Organiza a proteção do patrimônio histórico e artístico nacional) | `planalto.gov.br` | Externo |
| `iphan-certidao-rerratificacao-slz` | 1974-03-13 | Federal | Certidão | Certidão de Tombamento e Rerratificação IPHAN — São Luís (Proc. nº 454-T-51) | `/documentos/legislacao/certidao-tombamento-rerratificacao-iphan-slz.pdf` | 3.72 MB |
| `ma-lei-3999-1978` | 1978-12-05 | Estadual | Lei | Lei Estadual nº 3.999/1978 (Marco histórico anterior à Lei nº 5.082/1990) | `/documentos/legislacao/lei-estadual-3999-1978-doe.pdf` | 4.89 MB |
| `ma-decreto-10089-1986` | 1986-03-06 | Estadual | Decreto | Decreto Estadual nº 10.089/1986 (Tombamento do Centro Histórico de São Luís — ZE/2) | `/documentos/legislacao/decreto-estadual-10089-1986-doe.pdf` | 350.3 KB |
| `br-constituicao-arts-215-216` | 1988-10-05 | Federal | Lei | Constituição Federal — artigos 215 e 216 | `planalto.gov.br` | Externo |
| `ma-decreto-11591-1990` | 1990-10-12 | Estadual | Decreto | Decreto Estadual nº 11.591/1990 (Tombamento do Conjunto Arquitetônico e Paisagístico de SLZ) | `/documentos/legislacao/decreto-estadual-11591-1990-doe.pdf` | 145.8 KB |
| `ma-decreto-11593-1990` | 1990-10-12 | Estadual | Decreto | Decreto Estadual nº 11.593/1990 (Espécies Isoladas de Árvores Raras e Reservas Biológicas) | `/documentos/legislacao/decreto-estadual-11593-1990-arvores.pdf` | 649.4 KB |
| `ma-lei-5082-1990` | 1990-12-20 | Estadual | Lei | Lei Estadual nº 5.082/1990 (Proteção ao Patrimônio Cultural do Estado do Maranhão) | `/documentos/legislacao/lei-estadual-5082-1990-doe.pdf` | 346.9 KB |
| `ma-decreto-12350-1992` | 1992-03-26 | Estadual | Decreto | Decreto Estadual nº 12.350/1992 (Regulamentação da política estadual de patrimônio) | `/documentos/legislacao/decreto-estadual-12350-1992-doe.pdf` | 185.3 KB |
| `slz-lei-3253-1992` | 1992-12-29 | Municipal | Lei | Lei Municipal nº 3.253/1992 (Plano Diretor de São Luís — DOM nº 88/1993) | `/documentos/legislacao/lei-municipal-slz-3253-1992-plano-diretor.pdf` | 4.39 MB |
| `slz-lei-3350-1994` | 1994-08-15 | Municipal | Lei | Lei Municipal nº 3.350/1994 (Obrigatoriedade de telhas cerâmicas na ZPH de São Luís) | `/documentos/legislacao/lei-municipal-slz-3350-1994-telhas-ceramicas.pdf` | 57.2 KB |
| `slz-lei-3392-1995` | 1995-07-04 | Municipal | Lei | Lei Municipal nº 3.392/1995 (Proteção ao patrimônio de São Luís) | `/documentos/legislacao/lei-municipal-slz-3392-1995.pdf` *(+ link GEPFS/UFMA)* | 159.3 KB |
| `br-decreto-3551-2000` | 2000-08-04 | Federal | Decreto | Decreto nº 3.551/2000 (Registro de Bens Culturais de Natureza Imaterial) | `planalto.gov.br` | Externo |
| `carolina-lei-328-2006` | 2006-10-09 | Municipal | Lei | Lei Municipal nº 328/2006 (Plano Diretor Municipal Participativo de Carolina) | `/documentos/legislacao/lei-municipal-carolina-328-2006-plano-diretor.pdf` | 280.8 KB |
| `spc-manual-tipologias-preservacao` | 2019-03-20 | SPC | Manual | Patrimônio Histórico: Tipologias e Preservação (Manual Técnico DPHAP) | `/documentos/legislacao/manual-dphap-patrimonio-tipologias-preservacao.pdf` | 2.03 MB |
| `spc-recomendacoes-pintura-fachadas` | 2024-10-07 | SPC | Diretriz | Recomendações de Pintura em Fachadas Históricas (DPHAP) | `/documentos/legislacao/diretrizes-dphap-pintura-fachadas-historicas.pdf` | 139.4 KB |
| `iphan-portaria-289-2025` | 2025-11-03 | Federal | Portaria | Portaria IPHAN nº 289/2025 | `gov.br/iphan` | Externo |
| `spc-diretrizes-engenhos-publicitarios` | 2026-01-01 | SPC | Diretriz | Diretrizes para instalação de engenhos publicitários no Centro Histórico de São Luís | `/documentos/legislacao/diretrizes-dphap-engenhos-publicitarios.pdf` | 1.28 MB |

### 5.1 Lista Interna de Acompanhamento e Catalogação (Ocultos na Página Pública `/legislacao`)
Registrados exclusivamente em `INTERNAL_CATALOG_LEGAL_DOCUMENTS` (`data/publicLegalDocuments.ts`) e neste Catálogo Mestre para acompanhamento interno, **sem exposição na página pública**:

| ID Interno | Data | Esfera | Tipo | Título | Arquivo Local (`public/...`) | Status |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| `ma-lei-5205-1991` | 1991-10-11 | Estadual | Lei | Lei Estadual nº 5.205/1991 (Multas ao Patrimônio) | `/documentos/legislacao/lei-estadual-5205-1991-doe.pdf` | Oculto na página pública |
| `ma-decreto-38398-2023` | 2023-01-01 | Estadual | Decreto | Decreto Estadual nº 38.398/2023 (Regimento Interno da SECMA) | `/documentos/legislacao/decreto-estadual-38398-2023-regimento-secma.pdf` | Oculto na página pública |

---

## 6. Carta de Serviços e Formulários (`pages/ServicosPage.tsx`)

| ID | Ação Rápida | Serviço Oficial | Setor | Fluxo de Entrega e PDFs Oficiais |
| :-: | :--- | :--- | :-: | :--- |
| `s1` | Reformar imóvel tombado | Autorização para Intervenção em Imóvel Tombado | `DPHAP` | Formulário + Checklist (5 itens) + Pintura de Fachadas (PDF) + Requerimento DPHAP (PDF) + Checklists (PDF) + Manual Tipologias (PDF) |
| `s2` | Pedir certidão de poligonal | Certidão de Limites de Poligonal e Tombamento | `DPHAP` | Formulário + Checklist (4 itens) + Requerimento DPHAP (PDF) + Checklists (PDF) |
| `s3` | Instalar placa ou letreiro | Autorização para Engenhos Publicitários | `DPHAP` | Formulário + Checklist (4 itens) + Cartilha PDF + Requerimento DPHAP (PDF) + Checklists (PDF) |
| `s4` | Registrar patrimônio imaterial | Solicitação de Registro de Patrimônio Imaterial | `DPI` | Formulário + Checklist (4 itens) + E-mail/Impressão |
| `s5` | Tirar dúvida técnica de projeto | Consulta Técnica Prévia de Projetos e Restauro | `DPE` | Formulário + Checklist (4 itens) + E-mail/Impressão |

**Formulários Oficiais DPHAP em `public/documentos/servicos/`:**
- `/documentos/servicos/dphap-requerimento-2024.pdf` (47.2 KB — Anexo I — Requerimento Oficial DPHAP)
- `/documentos/servicos/dphap-checklists-documentacoes.pdf` (68.2 KB — Checklists Oficiais de Documentação DPHAP)

---

## 7. Acervo Fotográfico, Identidade Visual e Alertas Técnicos

### 7.1 Fotografias e Fundos Ativos (`public/cena-fotos/` e `public/`)
- **Hero da Home:** `/cena-fotos/fundo-hero.webp` (482 KB) e `/cena-fotos/fundo-hero-retrato.webp` (181 KB)
- **Cabeçalhos Temáticos e Cartões:** `/cena-fotos/casarao.webp`, `/cena-fotos/aerea.webp`, `/cena-fotos/azulejos.webp`, `/cena-fotos/telhados.webp`, `/cena-fotos/rua-noite.webp`, `/cena-fotos/avenida.webp`, `/cena-fotos/balcao.webp`, `/cena-fotos/boi.webp`, `/cena-fotos/casario.webp`
- **Logotipos Oficiais:** `/spc-logo.png`, `/spc-logo-horizontal.png`, `/spc-logo-completa.png`, `/imagens/logo_governo.png`
- **Retrato Institucional:** `/imagens/superintendente.jpg` (85.5 KB)

### 7.2 Alertas de Manutenção Identificados na Auditoria
1. **`public/imagens/infografico_engenhos.jpg` (`184.7 KB` — CORRIGIDO):** imagem regenerada em alta nitidez (`1684×1191`) a partir da cartilha oficial de Engenhos Publicitários do DPHAP.
2. **`public/cena-fotos/MAP_s.d._VIA_MAPA_PLANTA_BAIXA.pdf` (`24.45 MB`) e `MAN_s.d._ALC_MAPA_CIDADE.pdf` (`21.09 MB`):** pranchas originais de altíssima resolução. O visor interativo usa versões leves `.jpg` (`<2 MB`), e os botões de download agora informam explicitamente o tamanho do PDF.
3. **Arquivos legados em `public/imagens/`:** `1912 - justo jansen - mapa.jpg` (3.08 MB), `Pianta della cittá...jpg` (1.92 MB) e `CH 01.jpg` (3.82 MB) são cópias antigas mantidas por segurança; se quiser reduzir o tamanho final do `.zip` em ~9 MB no futuro, podem ser removidas após conferência.

---

## 8. Guia Rápido de Atualização Futura (Passo a Passo)

| O que deseja atualizar | 1. Onde colocar o arquivo | 2. Onde registrar no código |
| :--- | :--- | :--- |
| **Novo PDF de Decreto de Tombamento** | `public/documentos/decretos/decreto-estadual-XXXXX-ANO.pdf` | Adicionar entrada no objeto `DECRETOS_PDF` em `data/bensTombados.ts` |
| **Novo Mapa Histórico ou de Tombamento** | `public/cena-fotos/` (PDF original + JPG para o visor interativo) | Adicionar objeto no array `MAPAS_HISTORICOS` em `data/mapasHistoricos.ts` (informando `municipiosRelacionados` para vincular aos bens!) |
| **Nova Lei, Decreto ou Portaria** | `public/documentos/legislacao/nome-da-norma.pdf` (ou URL oficial) | Adicionar objeto em `PUBLIC_LEGAL_DOCUMENTS` em `data/publicLegalDocuments.ts` |
| **Alterar Endereço, E-mail ou Telefone** | — | Editar `SITE_CONTACT` em `data/siteContact.ts` (atualiza todo o site automaticamente) |
| **Atualizar Testes + Build + Pacote SECMA** | Terminal na raiz do projeto | Rodar `npm run typecheck && npm test && npm run pacote:secma` |
| **Publicar na Homologação (`spcmaranhao.web.app`)** | Terminal na raiz do projeto | Rodar `npx firebase-tools deploy --only hosting:spcmaranhao --project spc-maranhao-homologacao` |

