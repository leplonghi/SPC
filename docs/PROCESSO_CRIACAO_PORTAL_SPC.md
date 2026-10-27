# Processo de criação do Portal do Patrimônio Cultural do Maranhão

**Documento-base de produto e experiência — versão 0.1**

**Conceito de trabalho:** Patrimônio Vivo  
**Tese:** o portal deve parecer uma visita guiada ao patrimônio maranhense, mas funcionar com a clareza e a rapidez de um bom serviço público.

Este documento define como conceber, testar, construir, validar, publicar e manter o novo portal da Superintendência do Patrimônio Cultural do Maranhão. Ele parte do protótipo já existente e não pressupõe recomeçar do zero.

---

## 1. Resultado que queremos alcançar

O portal deve combinar cinco experiências complementares:

1. **Resolver** — encontrar serviços, requisitos, formulários, legislação e canais de atendimento com rapidez.
2. **Compreender** — explicar o patrimônio, os instrumentos de proteção e os processos da SPC em linguagem didática.
3. **Explorar** — navegar por mapas, linhas do tempo, acervos e experiências tridimensionais.
4. **Participar** — acompanhar ações, comunicar riscos, reconhecer referências culturais e fortalecer a relação com as comunidades.
5. **Gerir** — oferecer, em ambiente separado e protegido, ferramentas para equipes técnicas e administrativas.

A experiência pública não pode depender de 3D para funcionar. O 3D deve ampliar a compreensão, a emoção e a memória da visita, nunca bloquear um serviço essencial.

### A ideia central de navegação

A página inicial terá duas portas de entrada muito claras:

- **Preciso resolver algo** — serviços, autorizações, consulta a normas, denúncias e contatos.
- **Quero explorar o patrimônio** — mapa, acervo, histórias, bens protegidos, roteiros e experiências 3D.

Essa divisão permite que o portal seja simultaneamente institucional, didático e imersivo sem se tornar confuso.

---

## 2. Ponto de partida: evidências do protótipo atual

### Confirmado na base existente

- Já existe uma aplicação React e Vite com identidade visual da SPC Maranhão.
- A base já utiliza Three.js e GSAP para um herói 3D inspirado no azulejo maranhense.
- Existem módulos de mapa, acervo, repositório, legislação, serviços, autenticação, ingestão e administração.
- O MVP público atual prioriza apenas Página Inicial, A SPC, Serviços e Legislação; mapa, acervo, repositório e departamentos aparecem como módulos em atualização.
- O projeto compila para produção.
- O pacote principal gerado atualmente é grande e exige divisão e carregamento progressivo antes de uma publicação pública orientada a celulares.
- Há alterações locais extensas e um conjunto de imagens movidas, removidas ou ainda não incorporadas ao histórico do projeto.

### Interpretação

- A base tem valor e deve ser preservada. O trabalho correto é estabilizar, organizar e evoluir.
- O maior risco de experiência é misturar, na mesma interface, o portal simples para o cidadão e o sistema técnico de gestão territorial.
- O maior risco editorial é publicar números, notícias, datas, nomes, endereços ou descrições ainda usados como demonstração.
- O maior risco técnico é fazer a camada 3D competir com o carregamento dos serviços e conteúdos essenciais.

### Regra de preservação

Antes de qualquer redesenho amplo:

- registrar um ponto de restauração do estado atual;
- inventariar arquivos e imagens;
- não excluir originais;
- separar materiais confirmados, materiais de demonstração e materiais que exigem validação institucional;
- manter o portal público e as ferramentas internas como superfícies claramente distintas.

---

## 3. Princípios inegociáveis de design

### 3.1 Vivo, mas não agitado

Movimento deve responder à navegação, revelar relações ou explicar uma transformação. Elementos decorativos contínuos precisam ser discretos, pausáveis e dispensáveis.

### 3.2 3D que ensina

Cada experiência tridimensional deve responder a uma pergunta:

- Como um azulejo é constituído?
- Como um edifício mudou no tempo?
- Onde está a poligonal de proteção?
- O que diferencia patrimônio material, imaterial e paisagístico?
- Como uma intervenção afeta elementos protegidos?

Se o 3D não melhora a compreensão, fotografia, ilustração, vídeo curto ou diagrama interativo serão preferíveis.

### 3.3 Serviço antes do espetáculo

Busca, serviços, legislação, contato e orientações devem aparecer antes de qualquer jornada longa. Não haverá tela de abertura obrigatória, áudio automático, rolagem sequestrada ou espera pelo carregamento da cena 3D.

### 3.4 Imersão progressiva

O conteúdo essencial aparece primeiro. As camadas mais pesadas entram depois, conforme o dispositivo, a conexão e a intenção do visitante.

### 3.5 Uma alternativa equivalente para cada interação

Mapa com lista; objeto 3D com imagens e texto; arrastar com botões; animação com modo estático; cor com rótulo; áudio com transcrição.

### 3.6 Patrimônio com procedência

Todo dado público relevante deve ter fonte, responsável, data de atualização e situação de validação. Imagens devem ter autoria, licença, legenda, data e texto alternativo.

### 3.7 Linguagem pública, não burocrática

O portal explica termos técnicos no contexto, apresenta passos em ordem e informa ao cidadão o que precisa preparar, quanto tempo pode levar e qual é o próximo passo.

### 3.8 O Maranhão como sistema visual

A identidade deve nascer do território e do acervo: azulejaria, tramas, mapas, cores minerais, materialidade, ritmos e tipografias. Esses elementos serão traduzidos em um sistema contemporâneo, evitando a simples decoração temática.

---

## 4. Públicos e tarefas prioritárias

| Público | Necessidade principal | Jornada prioritária |
|---|---|---|
| Proprietário ou responsável por imóvel | Saber o que pode fazer em um bem ou área protegida | Localizar o bem → entender a proteção → consultar requisitos → iniciar solicitação |
| Arquiteto, engenheiro ou construtor | Identificar normas, poligonais e diretrizes de intervenção | Buscar endereço → abrir ficha técnica → consultar norma → baixar orientação |
| Detentor ou comunidade de referência | Entender processos de registro e salvaguarda | Conhecer o processo → reunir informações → encontrar contato responsável |
| Pesquisador, estudante ou professor | Consultar documentos, mapas, imagens e referências | Pesquisar → filtrar → visualizar → citar ou baixar |
| Visitante e cidadão | Conhecer o patrimônio e montar uma visita | Explorar temas → abrir mapa → seguir roteiro → descobrir histórias |
| Equipe técnica da SPC | Cadastrar, revisar e publicar dados | Entrar em área restrita → editar → validar → publicar |

As primeiras sessões de descoberta devem confirmar essas jornadas e selecionar de três a cinco tarefas críticas para o primeiro lançamento.

---

## 5. Arquitetura de navegação proposta

### Menu principal

O menu público deve ter no máximo cinco entradas de primeiro nível:

1. **Serviços**
2. **Explore o Patrimônio**
3. **Mapa**
4. **Acervo**
5. **A SPC**

Busca, acessibilidade, contato e legislação aparecem como utilidades persistentes e também dentro dos contextos em que são necessárias.

### Estrutura da página inicial

1. **Herói Patrimônio Vivo** — título, propósito, duas portas de entrada e objeto 3D opcional.
2. **O que você precisa?** — quatro a seis tarefas públicas de alta frequência.
3. **Explore por território e tema** — mapa, municípios, material, imaterial e paisagem.
4. **Uma história em camadas** — módulo didático interativo.
5. **Patrimônio em ação** — obras, salvaguarda, fiscalização e participação.
6. **Destaques do acervo** — documentos, fotografias, mapas e publicações.
7. **Notícias e agenda** — apenas com fonte e fluxo editorial definidos.
8. **Contato e participação** — atendimento, denúncia, acesso à informação e redes oficiais.

### Regra de profundidade

Uma tarefa pública prioritária deve estar visível na página inicial e ser iniciada em até duas decisões. Nenhum conteúdo essencial deve depender de descobrir um gesto oculto.

---

## 6. Sistema de experiências imersivas

### Experiência A — Azulejo Vivo

O objeto 3D atual pode se tornar a assinatura da página inicial:

- aproximação suave conforme o ponteiro ou a rolagem;
- pontos de interesse que explicam técnica, origem, padrão e conservação;
- reação de luz moderada;
- modo estático imediato em celulares modestos, conexões lentas ou preferência por movimento reduzido;
- carregamento posterior ao título e às ações principais.

### Experiência B — Mapa do Tempo

O mapa não será apenas um catálogo de pontos. Ele poderá combinar:

- camadas por período histórico;
- poligonais e níveis de proteção;
- comparação de fotografias antigas e atuais;
- filtros por tipo de patrimônio;
- roteiros temáticos;
- fichas didáticas ligadas a legislação, acervo e serviços;
- lista equivalente para quem não usa ou não consegue operar o mapa.

### Experiência C — Patrimônio em Camadas

Modelos simplificados, cortes e diagramas interativos podem explicar:

- partes de um imóvel histórico;
- danos e técnicas de conservação;
- elementos protegidos;
- etapas de análise de uma intervenção;
- relações entre edificação, rua, paisagem e práticas culturais.

### Experiência D — Caminhos e vozes

Narrativas guiadas podem unir mapas, fotografias, áudio, depoimentos e objetos 3D. A produção deve respeitar autoria, consentimento, contexto e participação das comunidades representadas.

### Experiências futuras

Fotogrametria pesada, gêmeos digitais, realidade aumentada e roteiros gerados por inteligência artificial entram somente após o portal básico demonstrar estabilidade, governança dos dados e utilidade pública.

---

## 7. Processo por fases

| Fase | Trabalho principal | Entregáveis | Portão de aprovação |
|---|---|---|---|
| **0. Preservar e estabilizar** | Registrar a base, inventariar arquivos, classificar conteúdo e eliminar bloqueios de compilação | Inventário, matriz de conteúdo, mapa de riscos e baseline reproduzível | Nenhum original perdido; estado atual recuperável |
| **1. Descobrir** | Alinhar missão, públicos, tarefas, restrições, governança e indicadores | Briefing de produto, jornadas prioritárias e critérios de sucesso | Direção aprovada pela SPC |
| **2. Organizar** | Estruturar navegação, busca, taxonomia, conteúdo e relações entre módulos | Mapa do site, fluxos, modelo de conteúdo e protótipo de baixa fidelidade | Usuários encontram as tarefas principais |
| **3. Definir a linguagem** | Criar sistema visual, voz editorial, motion design e prova 3D | Tokens visuais, componentes-base, regras de movimento e protótipo 3D | Direção reconhecível, legível e acessível |
| **4. Construir a fatia vertical** | Produzir a menor experiência completa e realista | Primeiro trecho da página inicial, uma jornada de serviço e uma amostra de exploração | Funciona em desktop e celular sem depender do 3D |
| **5. Entregar o núcleo público** | Implementar páginas essenciais, busca, legislação, serviços, contato e institucional | MVP público navegável e alimentado por conteúdo validado | Tarefas críticas concluídas sem assistência |
| **6. Expandir a exploração** | Ativar mapa, acervo, narrativas e experiências didáticas | Mapa público, acervo pesquisável e módulos imersivos | Desempenho e acessibilidade preservados |
| **7. Validar e publicar** | Testar conteúdo, acessibilidade, desempenho, segurança, dispositivos e operação editorial | Relatórios de QA, correções, plano de lançamento e versão candidata | Aprovação institucional e técnica |
| **8. Governar e evoluir** | Medir uso, atualizar conteúdo e planejar ciclos | Painel de indicadores, calendário editorial e backlog priorizado | Rotina de manutenção com responsáveis definidos |

### Fase 0 — Preservar e estabilizar

1. Criar uma referência recuperável do estado atual.
2. Conferir alterações, imagens removidas, imagens soltas e materiais de backup.
3. Identificar o que é conteúdo real, ilustração, demonstração ou lacuna.
4. Levantar rotas prontas, parciais, bloqueadas e restritas.
5. Registrar dependências externas, integrações, permissões e fontes de dados.
6. Medir o pacote inicial e localizar módulos pesados que podem ser carregados sob demanda.

### Fase 1 — Descoberta e coautoria

Realizar uma oficina enxuta com direção, equipes técnicas, comunicação e atendimento. O encontro deve produzir:

- missão do portal em uma frase;
- públicos prioritários;
- tarefas mais frequentes;
- serviços que entram no primeiro lançamento;
- fontes oficiais de conteúdo;
- dados que podem ou não ser públicos;
- responsáveis por validar cada área;
- restrições jurídicas, de segurança, imagem e privacidade.

Quando possível, incluir entrevistas curtas com cidadãos, profissionais, pesquisadores e representantes de comunidades.

### Fase 2 — Informação e conteúdo

O projeto passa a trabalhar com conteúdo real antes do acabamento visual:

- mapa do site;
- fluxos das tarefas prioritárias;
- taxonomia comum entre mapa, acervo, legislação e serviços;
- modelo de ficha de bem cultural;
- modelo de serviço passo a passo;
- glossário contextual;
- padrões para datas, fontes, créditos, documentos e atualizações;
- busca global com resultados agrupados por tipo.

### Fase 3 — Design e prova imersiva

Criar uma única direção visual coerente e uma prova de conceito 3D limitada. A prova precisa demonstrar:

- valor didático;
- leitura do texto sobre a cena;
- interação por ponteiro, toque e teclado quando aplicável;
- modo de movimento reduzido;
- alternativa estática;
- custo de carregamento em celular;
- comportamento quando WebGL falha ou é interrompido.

### Fase 4 — Primeira fatia completa

A primeira entrega reconhecível deve conter:

- cabeçalho e navegação responsivos;
- herói com título, propósito e as duas portas de entrada;
- bloco de tarefas públicas;
- um serviço completo, do entendimento ao próximo passo;
- uma pequena amostra do mapa ou acervo;
- conteúdo institucional já validado;
- estados de carregamento, erro e ausência de dados.

Essa fatia será testada antes de multiplicar componentes ou criar todas as páginas.

### Fases 5 e 6 — Construção em ondas

**Onda 1 — Resolver**

- serviços;
- legislação;
- busca;
- contato e participação;
- A SPC;
- acessibilidade e ajuda.

**Onda 2 — Compreender**

- fichas didáticas;
- glossário;
- linhas do tempo;
- processos explicados;
- notícias e agenda com governança editorial.

**Onda 3 — Explorar**

- mapa público;
- acervo;
- roteiros;
- comparação histórica;
- experiências 3D.

**Onda 4 — Gerir**

- autenticação;
- ingestão;
- revisão editorial;
- ferramentas geoespaciais;
- trilha de auditoria;
- publicação controlada.

A Onda 4 deve continuar separada da navegação pública e receber avaliação específica de segurança.

---

## 8. Portões de qualidade

| Dimensão | Critério mínimo |
|---|---|
| **Navegação** | Tarefas prioritárias iniciadas em até duas decisões; busca visível; retorno e próximo passo claros |
| **Conteúdo** | Fonte, proprietário, data, estado de validação, direitos e créditos registrados |
| **Acessibilidade** | WCAG 2.2 nível AA e eMAG como referências; teclado; leitor de tela; zoom; contraste; foco visível; movimento reduzido |
| **Movimento** | Animação não essencial pode ser interrompida ou removida; nenhum lampejo perigoso; alternativa estática |
| **3D** | Não bloqueia texto nem ações; carrega progressivamente; possui fallback; libera recursos ao sair da cena |
| **Desempenho** | LCP até 2,5 s, INP até 200 ms e CLS até 0,1 no percentil 75; medição em celular e desktop |
| **Responsividade** | Jornadas completas em telas pequenas, toque, teclado e conexões limitadas |
| **Segurança** | Sem credenciais de demonstração na versão pública; área interna protegida; regras de acesso e dados revisadas |
| **Privacidade** | Coleta mínima, finalidade explícita, consentimento quando necessário e política publicada |
| **Confiabilidade** | Estados de erro e indisponibilidade compreensíveis; links, documentos e formulários verificados |
| **Publicação** | Metadados, compartilhamento, indexação, redirecionamentos, domínio e monitoramento validados |

As metas de desempenho seguem os atuais Core Web Vitals: carregamento, resposta à interação e estabilidade visual. A acessibilidade deve considerar tanto o padrão internacional WCAG 2.2 quanto o contexto brasileiro do eMAG.

---

## 9. Governança do conteúdo

Cada coleção do portal precisa de um responsável institucional:

| Coleção | Responsável sugerido | Revisão |
|---|---|---|
| Institucional e equipe | Gabinete ou comunicação | A cada alteração |
| Serviços e requisitos | Departamento responsável | Trimestral e a cada mudança normativa |
| Legislação | Área técnica ou jurídica | Contínua |
| Bens e poligonais | Equipe técnica e geoprocessamento | Conforme validação |
| Acervo e imagens | Arquivo, documentação ou curadoria | Contínua |
| Notícias e agenda | Comunicação | Semanal |
| Patrimônio imaterial e depoimentos | Equipe técnica e comunidades envolvidas | Conforme acordo e consentimento |

Todo item deve passar por quatro estados:

1. Rascunho
2. Em validação
3. Aprovado para publicação
4. Arquivado ou substituído

O portal não deve converter conteúdo provisório em fato institucional por aparência ou automação.

---

## 10. Equipe mínima e responsabilidades

- **Patrocinador institucional:** define prioridade e aprova escopo.
- **Responsável de produto da SPC:** decide o que entra em cada versão.
- **Responsável editorial:** valida linguagem, fontes e calendário.
- **UX e arquitetura da informação:** pesquisa, jornadas, protótipos e testes.
- **Design visual e motion:** identidade, componentes e regras de movimento.
- **Especialista 3D/WebGL:** cenas, otimização, fallback e acessibilidade.
- **Desenvolvimento front-end:** navegação, páginas, desempenho e integração.
- **Dados, GIS e back-end:** mapas, acervo, permissões e publicação.
- **Acessibilidade e QA:** testes assistivos, funcionais e entre dispositivos.
- **Segurança, privacidade e jurídico:** acesso, dados pessoais, direitos e conformidade.

Uma pessoa pode acumular papéis, mas cada responsabilidade precisa ter um nome e um aprovador.

---

## 11. Primeiro ciclo recomendado

### Sprint 0 — Base segura e direção comum

**Objetivo:** sair do protótipo disperso para uma base compreendida, preservada e pronta para decisão.

1. Registrar o estado atual e reconciliar imagens e alterações.
2. Montar a matriz “confirmado / demonstração / validar / ausente”.
3. Selecionar as cinco tarefas públicas mais importantes.
4. Aprovar as duas portas de entrada: resolver e explorar.
5. Definir o mapa do site do MVP.
6. Escolher uma única experiência 3D para a prova inicial.
7. Definir metas de acessibilidade e desempenho.
8. Produzir a primeira fatia vertical para avaliação.

### Entregáveis do ciclo

- inventário e baseline;
- briefing aprovado;
- mapa do site;
- matriz de conteúdo e responsáveis;
- protótipo de navegação;
- prova 3D com fallback;
- backlog priorizado do MVP;
- critérios de aceite.

---

## 12. O que evitar

- introdução obrigatória antes de acessar o site;
- cenas 3D pesadas em todas as páginas;
- áudio automático;
- carrosséis que mudam sem controle;
- rolagem controlada pela animação;
- números e notícias meramente ilustrativos apresentados como fatos;
- menus com muitos níveis;
- gestos sem rótulo ou alternativa;
- mapa técnico exposto ao cidadão sem tradução;
- área administrativa misturada ao portal público;
- publicação sem responsável editorial;
- inteligência artificial que inventa descrições, dados históricos ou classificações.

---

## 13. Definição de pronto

O portal estará pronto para lançamento quando:

- as tarefas prioritárias forem concluídas por usuários representativos;
- o conteúdo institucional estiver validado e tiver responsáveis;
- a navegação funcionar sem 3D, animação, mouse ou conexão rápida;
- a camada imersiva agregar compreensão comprovável;
- acessibilidade, desempenho, segurança e privacidade passarem pelos portões definidos;
- dispositivos e navegadores prioritários forem testados;
- domínio, publicação, monitoramento e recuperação estiverem configurados;
- a equipe souber como publicar, corrigir, arquivar e atualizar conteúdo.

---

## 14. Referências de qualidade

- [WCAG 2.2 — W3C](https://www.w3.org/TR/WCAG22/)
- [Técnica de movimento reduzido — W3C](https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html)
- [Modelo de Acessibilidade em Governo Eletrônico — Governo Digital](https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/modelo-de-acessibilidade)
- [Core Web Vitals — web.dev](https://web.dev/articles/vitals)
- [Boas práticas de WebGL — MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)

