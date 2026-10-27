# Central de Documentos & Repositório Técnico SPC (Document Hub)

## Overview
Este plano de implementação visa redesenhar a página de repositório técnico (`pages/RepositorioPage.tsx`) e enriquecer a estrutura de dados e componentes de upload para criar um **Document Hub** inteligente, responsivo e de alto nível visual. O sistema gerenciará documentos hospedados no Google Drive, automatizará a extração de metadados ricos em formulários através de um assistente de IA simulado, e oferecerá aos usuários finais uma interface de cruzamento múltiplo de filtros (busca facetada) e uma visualização integrada side-by-side do arquivo (iframe seguro do Drive) com suas fichas técnicas extraídas.

---

## Project Type
- **Type**: **WEB** (React Web Application with Firestore and Firebase Storage)
- **Primary Agent**: `frontend-specialist`
- **Secondary Agent**: `backend-specialist`

---

## Success Criteria
1. **Visualizador Side-by-Side**: Usuário clica em um documento e abre um modal que exibe o arquivo no Google Drive à esquerda (via iframe do `/preview`) e informações preliminares detalhadas à direita.
2. **Busca Facetada Responsiva**: Filtros interativos cumulativos funcionando perfeitamente em desktop e mobile para Categoria, Subcategoria, Departamento, Formato, Ano e Tags.
3. **Conversão de Links do Drive**: Links informados como `file/d/[ID]/view` convertidos nativamente tanto para visualização (`/preview`) quanto para download direto (`uc?export=download&id=[ID]`).
4. **Assistente de Extração Automatizado**: No painel de cadastro de documentos, ao inserir título e link do Drive e clicar em "Extração por IA", uma animação de escaneamento em logs é ativada e preenche automaticamente o Resumo Executivo, Highlights, Categoria/Subcategoria sugerida, Idioma, Ano e Tags.
5. **Estética Refinada**: Aderência estrita à paleta de cores (Dark Navy, Brick Red, Soft Cream) e aos padrões premium de design sem hexes purpuras/violetas.

---

## Tech Stack
- **Framework**: React (TypeScript) + Vite
- **Banco de Dados**: Firebase Firestore (`repositorio_tecnico` collection)
- **Biblioteca de Ícones**: `lucide-react` (icons: `BookOpen`, `ShieldCheck`, `FileText`, `Database`, `Search`, `Filter`, `Loader2`, `Download`, `ExternalLink`, `BrainCircuit`)
- **Estilização**: Tailwind CSS v4 / Vanilla CSS

---

## File Structure
As seguintes alterações serão mapeadas nos arquivos correspondentes:

```plaintext
c:\Users\eduar\OneDrive\Desktop\Antigravity\SPC/
├── components/
│   └── ui/
│       ├── FileUpload.tsx         # [MODIFY] Para suportar upload direto + referência ao Drive
│       └── DocumentViewer.tsx     # [NEW] Componente side-by-side de visualização do documento e metadados
├── pages/
│   └── RepositorioPage.tsx        # [MODIFY] Integração da busca facetada, painel adm de IA e detalhes
├── data/
│   └── acervoSeed.ts              # [MODIFY] Atualização dos seeds com dados de extração de metadados
└── types.ts                       # [MODIFY] Atualização de interfaces para suportar RepositorioItem rico
```

---

## Task Breakdown

### Phase 1: Foundation & Types
#### Task 1.1: [MODIFY] [types.ts](file:///c:/Users/eduar/OneDrive/Desktop/Antigravity/SPC/types.ts)
- **Agent**: `database-architect`
- **Skill**: `typescript-expert`, `clean-code`
- **Priority**: P0
- **Dependencies**: Nenhuma
- **Description**: Definir e expor o tipo `RepositorioItem` com os campos adicionais de metadados ricos (`executiveSummary`, `highlights`, `pageCount`, `language`, `year`, `subcategory`).
- **INPUT**: Modelo conceitual do `RepositorioItem` rico.
- **OUTPUT**: Exportação da interface no arquivo `types.ts`.
- **VERIFY**: Compilar o projeto (`npx tsc --noEmit`) para garantir que a tipagem está válida.

#### Task 1.2: [MODIFY] [acervoSeed.ts](file:///c:/Users/eduar/OneDrive/Desktop/Antigravity/SPC/data/acervoSeed.ts)
- **Agent**: `backend-specialist`
- **Skill**: `clean-code`
- **Priority**: P0
- **Dependencies**: Task 1.1
- **Description**: Atualizar os documentos de semente (`repositorioSeed`) em `acervoSeed.ts` para usar o novo formato de metadados ricos e subcategorias, e fornecer links de teste válidos do Google Drive (ou placeholders simulados).
- **INPUT**: Novo modelo de tipos e seed bruto existente.
- **OUTPUT**: Seed atualizado com resumos, destaques, páginas e anos.
- **VERIFY**: Verificar se o arquivo importa e roda sem erros no carregamento inicial da aplicação.

---

### Phase 2: Embedded Document Viewer
#### Task 2.1: [NEW] [DocumentViewer.tsx](file:///c:/Users/eduar/OneDrive/Desktop/Antigravity/SPC/components/ui/DocumentViewer.tsx)
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`, `ui-ux-pro-max`
- **Priority**: P1
- **Dependencies**: Task 1.1
- **Description**: Criar o componente de visualização side-by-side. O componente recebe um `RepositorioItem` e:
  1. Converte o link do Drive colado para o formato `/preview` do iframe.
  2. Converte o link do Drive para o link direto de download `/uc?export=download&id=...`.
  3. Exibe em 2 colunas: Iframe com documento à esquerda; Resumo, Highlights e Ficha Técnica estruturada à direita.
- **INPUT**: Item de documento selecionado e callbacks de fechamento.
- **OUTPUT**: Novo componente `DocumentViewer.tsx` estilizado com efeitos de vidro, animações suaves e layouts imersivos.
- **VERIFY**: Montar o componente temporariamente em uma página e conferir se renderiza o iframe do Drive e os metadados ricos side-by-side de forma harmônica.

---

### Phase 3: Faceted Search & Page Overhaul
#### Task 3.1: [MODIFY] [RepositorioPage.tsx](file:///c:/Users/eduar/OneDrive/Desktop/Antigravity/SPC/pages/RepositorioPage.tsx)
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`, `clean-code`
- **Priority**: P2
- **Dependencies**: Task 1.2, Task 2.1
- **Description**: Reescrever a página de repositório técnico para incluir:
  1. O painel lateral de **busca facetada** com filtros cumulativos: Departamento, Categoria principal, Subcategoria de segundo nível, Formato, Ano de publicação, Tags do acervo.
  2. Grid responsivo de cards refinados contendo a categoria com borda gradiente colorida correspondente, ano em evidência e badges dinâmicos de formato e tamanho.
  3. Acionamento do novo modal de visualização detalhada `DocumentViewer` ao clicar no card.
- **INPUT**: Estrutura atual de `RepositorioPage.tsx`.
- **OUTPUT**: Nova interface rica de Repositório Técnico.
- **VERIFY**: Realizar múltiplos cruzamentos de filtros na central de documentos e comprovar que a listagem de arquivos atualiza instantaneamente sem travar a interface.

---

### Phase 4: Administrative Smart Extractor
#### Task 4.1: [MODIFY] [RepositorioPage.tsx](file:///c:/Users/eduar/OneDrive/Desktop/Antigravity/SPC/pages/RepositorioPage.tsx) (Admin Interface Section)
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`, `ui-ux-pro-max`
- **Priority**: P2
- **Dependencies**: Task 3.1
- **Description**: Desenvolver a interface do assistente administrativo de IA. No painel de adição/edição de documentos:
  1. Adicionar campo para inserir link do Google Drive.
  2. Implementar validador e extrator de ID do link do Drive.
  3. Criar botão **"Iniciar Extração Inteligente (IA)"**.
  4. Ao clicar, disparar animação de logs do terminal de escaneamento em uma caixa flutuante.
  5. Após os logs (cerca de 2 segundos), autopreencher todos os campos do formulário (Resumo Executivo contextual ao título, 3 pontos de destaque adequados, páginas aleatórias inteligentes, ano correspondente e sugestão de categoria/subcategoria com base em palavras-chave).
- **INPUT**: Formulário administrativo existente.
- **OUTPUT**: Painel administrativo aprimorado com o escâner animado de IA e autopreenchimento semântico.
- **VERIFY**: Testar o preenchimento automático inserindo "Decreto de Proteção das Fontes de São Luís" e um link do Drive; verificar se a subcategoria muda para "Legislação > Decretos Estaduais" e o resumo gerado cita as fontes e proteção de forma natural.

---

## Phase X: Verification Checklist

### 1. Run All Verifications
```bash
# Executa todos os testes e auditorias
python .agent/scripts/checklist.py .
```

### 2. Manual Compliance Check
- [ ] O visualizador do Google Drive abre em iframe sem bloquear a página.
- [ ] O botão de baixar converte o link para download direto do Drive.
- [ ] Filtros cumulativos funcionam corretamente sem quebras de estados.
- [ ] O painel adm possui animação refinada de Logs de Escaneamento e extração inteligente.
- [ ] Nenhuma cor na faixa roxa/violeta é utilizada (apenas Brick Red, Dark Navy, Emerald, Amber, Soft Blue).
- [ ] O portal compila sem erros com `npm run build`.

---

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-05-23
