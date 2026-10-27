# Plano de Transformação: Portal Institucional, Objetivo e Funcional (SPC Maranhão)

> **Superintendência do Patrimônio Cultural do Maranhão (SECMA / Governo do Maranhão)**
> Meta: Eliminar complexidades desnecessárias (como animações 3D distrativas), elevar o padrão visual institucional e garantir que todos os serviços, consultas e canais estejam 100% operacionais e acessíveis.

---

## 1. Diretrizes Estratégicas e Arquitetura

- **Institucional**: Identidade visual sóbria, fidedigna às diretrizes do Governo do Estado do Maranhão e da Secretaria de Estado da Cultura (SECMA).
  - Paleta: Azul-marinho institucional (`#071D33` / `#0A2540`), terracota/dourado histórico (`#B94734`), areia/creme suave (`#F8F9FA` / `#F3F4F6`), branco e grafite.
  - Rigoroso cumprimento da regra **Purple Ban** (sem roxos, violetas ou degradês artificiais de IA).
- **Objetivo**: Foco absoluto nas necessidades do cidadão, proprietários de imóveis tombados, pesquisadores e gestores públicos.
  - Acesso aos serviços essenciais em menos de 2 cliques.
  - Busca universal integrada (Bens tombados, decretos, serviços).
  - Remoção de layouts confusos (como o menu origami 3D que ocultava os atalhos e gerava atrito de usabilidade).
- **Funcionando**:
  - Catálogo de serviços com Assistente/Simulador de Requerimento interativo com geração de espelho de protocolo formal (SEI/e-mail/presencial).
  - Formulário funcional de denúncias e fiscalização com checklist de evidências.
  - Formulário funcional de atendimento ao cidadão em Fale Conosco.
  - Busca e filtros rápidos de Bens Tombados (101 inscrições) com download direto de PDFs dos decretos.
  - Consulta ágil na Biblioteca de Legislação.
  - Navegação fluida, acessível (VLibras, alto contraste, semântica WCAG) e responsiva.

---

## 2. Roteiro de Implementação

### Fase 1: Redesenho da Página Inicial (`HomePage.tsx`)
- [x] Remover o componente experimental `OrigamiMenu`.
- [x] Construir Hero Governamental de alto padrão com identificação oficial (Governo do Maranhão / SECMA / SPC).
- [x] Adicionar busca rápida universal direta no Hero.
- [x] Implementar Grade de Acesso Rápido aos Serviços Prioritários (Bens Tombados, Obras e Reformas, Certidões, Legislação, Denúncias).
- [x] Incluir Painel Institucional em Números (101 bens tombados, 217 municípios, 100% decretos digitalizados).
- [x] Manter a visualização histórica da Planta de 1912 em seção institucional contextualizada.
- [x] Manter a curadoria da legislação de referência com acesso imediato.

### Fase 2: Serviços ao Cidadão Funcionais (`ServicosPage.tsx`)
- [x] Manter a Carta de Serviços oficial atualizada por departamentos (DPHAP, DPI, DPE).
- [x] Adicionar o **Assistente de Protocolo de Requerimento**:
  - Seleção do serviço desejado.
  - Dados do requerente e do imóvel.
  - Lista de documentos obrigatórios conforme a solicitação.
  - Geração de resumo formal para envio por e-mail ou protocolo no SEI-MA.

### Fase 3: Formulários Operacionais de Contato e Denúncia
- [x] Aprimorar `ContatoPage.tsx` com formulário interativo de mensagem e direcionamento por departamento.
- [x] Aprimorar `DenunciaPage.tsx` com formulário estruturado de fiscalização patrimonial.

### Fase 4: Limpeza, Acessibilidade e Banimento de Roxo (Purple Ban)
- [x] Revisar `LegislacaoPage.tsx` removendo classes `violet-*` e ajustando badges.
- [x] Ajustar rotas e navegação em `App.tsx` para foco prioritário e redirecionamentos amigáveis.
- [x] Testar build de produção (`npm run build`) e validar execução.

---
