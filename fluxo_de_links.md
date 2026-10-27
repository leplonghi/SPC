# Fluxo de Links - SPC Maranhão

Este documento mapeia o fluxo completo de links (internos e externos) e o sistema de rotas da aplicação SPC Maranhão, com base na estrutura do React Router e nos componentes de navegação.

## 🗺️ Mapa do Site (Rotas do Sistema)

A aplicação utiliza o `HashRouter`. As seguintes rotas principais estão registradas:

- `/` → **Home** (`HomePage`)
- `/mapa` → **Mapa do Patrimônio** (`MapaPage`)
- `/institucional` → **A SPC / Institucional** (`InstitucionalPage`)
- `/servicos` → **Serviços** (`ServicosPage`)
- `/acervo-digital` → **Acervo Digital** (`AcervoDigitalPage`)
- `/acervo` → **Acervo** (`AcervoPage`) - *Detalhes do acervo*
- `/repositorio` → **Repositório** (`RepositorioPage`)
- `/legislacao` → **Legislação** (`LegislacaoPage`)
- `/dphap` → **Departamento DPHAP** (`DphapPage`)
- `/dpi` → **Departamento DPI** (`DpiPage`)
- `/dpe` → **Departamento DPE** (`DpePage`)
- `/login` → **Acesso ao Sistema** (`LoginPage`)
- `/admin` → **Painel Administrativo** (`AdminDashboard`) - *Requer autenticação de Admin*
- `/ingestao` → **Módulo de Ingestão** (`IngestaoPage`) - *Requer autenticação de Colaborador*
- `*` (Página 404/Em Atualização) → Rota de fallback para links não existentes ou em construção (ex: `/denuncia`, `/ajuda`).

---

## 🧭 Navegação Global (Cabeçalho)

### Barra Superior (Acessibilidade e Links Rápidos)
- **Acesso à Informação**: `#/institucional`
- **SECMA (Externa)**: `https://cultura.ma.gov.br`
- **Denúncias**: `#/denuncia` *(Atualmente redireciona para a página "Módulo em Atualização")*
- **VLibras (Externa)**: `https://www.gov.br/governodigital/pt-br/vlibras`

### Menu Principal
- **Logo SPC**: `/` (Home)
- **A SPC**: `/institucional`
- **Serviços**: `/servicos`
- **Acervo Digital**: `/acervo-digital`
- **Mapa do Patrimônio**: `/mapa`
- **Ingestão**: `/ingestao` *(Exibido apenas para Colaboradores logados)*
- **Admin**: `/admin` *(Exibido apenas para Administradores logados)*
- **Botão "Acessar sistemas"**: `/login` *(Se usuário não logado)*
- **Botão "Sair"**: Faz logoff do sistema *(Se usuário logado)*

---

## 🦶 Navegação do Rodapé (Footer)

### Contatos e Suporte
- **E-mail**: `mailto:contato@spc.ma.gov.br`
- **Ajuda**: `/ajuda` *(Atualmente redireciona para a página "Módulo em Atualização")*

### Departamentos
- **DPHAP (Material)**: `/dphap`
- **DPI (Imaterial)**: `/dpi`
- **DPE (Especiais)**: `/dpe`

### Institucional e Links Úteis
- **Quem Somos**: `/institucional`
- **Serviços ao Cidadão**: `/servicos`
- **Acervo Digital**: `/acervo-digital`
- **Repositório**: `/repositorio`
- **Legislação**: `/legislacao`
- **Transparência**: `/institucional`

---

## 🔄 Fluxos Internos de Página (Call to Actions)

Muitas páginas possuem botões para guiar a jornada do usuário. Aqui estão os principais fluxos originados do conteúdo interno:

**Página Inicial (`HomePage`)**
- "Acesso Rápido ao Mapa": `/mapa`
- "Acesso aos Serviços": `/servicos`
- "Saiba mais sobre a instituição": `/institucional`
- "Canal de denúncias": `/denuncia`

**Páginas de Departamentos (`DphapPage`, `DpiPage`, `DpePage`)**
- Botão "Acessar Serviços do Departamento": `/servicos`
- Link "Ir para o Repositório" (presente no DPHAP): `/repositorio`

**Módulo de Ingestão (`IngestaoPage`)**
- Se usuário deslogado, é exibida mensagem de restrição com link "Entrar no Sistema": `/login`
- Link "Voltar ao Início" após envios ou para navegação secundária: `/`

**Página de Login (`LoginPage`)**
- "Voltar ao Início" (caso o usuário desista do login): `/`

**Página de Serviços (`ServicosPage`)**
- Link para processo administrativo no SEI (Externo): `https://sei.ma.gov.br`

**Página Restrita / 404 / Em Atualização**
- Botão padrão para sair de telas de erro ou acessos negados: "Voltar ao Início" (`/`)
