# 🗺️ Manifesto do Módulo Geo-Espacial (GeoManager)
> *A Convergência entre Patrimônio Histórico e Inteligência Artificial*

## 1. A Visão: "História em Alta Resolução"
O módulo de mapas do SPC (Sistema de Patrimônio Cultural) não é apenas uma ferramenta de localização; é um **canvas vivo** onde a história de São Luís encontra o futuro da gestão territorial. 

Nossa missão é transformar dados estáticos (tombamentos, decretos, coordenadas) em uma **experiência imersiva** que serve tanto ao **Gestor Técnico** quanto ao **Cidadão Explorador**. Acreditamos que a preservação começa pelo conhecimento, e o conhecimento hoje é visual, interativo e geo-referenciado.

---

## 2. Pilares da Arquitetura (O Cérebro)

O `GeoManager.tsx` é o coração pulsante deste sistema. Ele orquestra uma sinfonia de tecnologias para entregar performance e beleza:

*   **React Leaflet (O Motor):** A base robusta para renderização de tiles e vetores.
*   **Marker Cluster (A Organização):** Implementamos *clustering* inteligente para lidar com centenas de ativos sem poluição visual. O caos se torna ordem à medida que você afasta a visão.
*   **Firebase Firestore (A Memória):** Sincronização em tempo real. Se um arquiteto muda o status de um casarão para "Alerta", o mapa de todos os usuários pisca em vermelho instantaneamente.
*   **OSRM (O Caminho):** Roteamento open-source para desenhar caminhos reais entre séculos de história.

---

## 3. Experiência de Usuário (UX/UI Premium)

Abandonamos o design "governamental padrão" por uma estética que *inspira*.

*   **Glassmorphism & Profundidade:** Painéis translúcidos (`GlassPanel`) que flutuam sobre o mapa, mantendo o contexto geográfico sempre visível.
*   **Feedback Tátil:** Micro-interações, hover states e transições suaves (`animate-slide-in`) fazem o sistema parecer vivo.
*   **Tipografia Hierárquica:** O uso de fontes sans-serif bold em caixa alta para metadados cria uma sensação de "Ficha Técnica" moderna e legível.

### O DetailDrawer (A Lupa)
Quando um ativo é selecionado, não abrimos apenas um popup. Deslizamos uma "gaveta" de detalhes rica em mídia:
*   **Cabeçalho Imersivo:** Fotos históricas em destaque com *gradient overlays*.
*   **Grades de Dados:** Informações críticas (Uso, Conservação, Estilo) organizadas para leitura rápida.
*   **Consultor AI:** Um assistente embutido que contextualiza o dado técnico (ex: "O que significa Estilo Pombalino?").

---

## 4. Funcionalidades de Poder

### 🛡️ Para o Gestor (Modo Geomanagement)
*   **Precision Editor v36:** Ferramenta vetorial para desenhar e editar poligonais de tombamento diretamente no navegador. Com suporte a *undo/redo*, *snapping* e cálculo de área em tempo real.
*   **Monitoramento de Status:** Marcadores codificados por cor (Verde/Azul/Vermelho) indicam a saúde física do patrimônio.

### 🧭 Para o Turista (Modo Tourism AI)
*   **Roteiros Generativos:** "Crie uma rota pelos casarões azulejados do século XIX". A IA entende a intenção, filtra os dados e traça o caminho otimizado.
*   **Guia Virtual:** O mapa deixa de ser técnico e se torna narrativo, escondendo dados burocráticos e destacando curiosidades e fotos antigas.

---

## 5. Ecossistema de Componentes

| Componente | Função |
| :--- | :--- |
| **`GeoManager`** | O orquestrador principal. Gerencia estado, modos e camadas. |
| **`HeritageMap`** | A abstração do Leaflet. |
| **`MarkerClusterGroup`** | Agregador de performance para alta densidade de pontos. |
| **`AICommandChat`** | A interface de linguagem natural para controle do mapa ("Mostre áreas de risco"). |
| **`TourismRoutesPanel`** | Gerenciador de iterações e sequenciamento de visitas. |

---

## 6. O Futuro (Roadmap)

*   **Gêmeos Digitais 3D:** Integração de modelos fotogramétricos (tiles 3D) sobre o mapa 2D.
*   **Realidade Aumentada (WebXR):** Apontar o celular para uma ruína e ver a reconstrução sobreposta.
*   **Análise Preditiva:** Heatmaps de degradação baseados em relatórios de clima e tempo.

> *"O mapa não é o território, mas é a melhor lente que temos para entendê-lo."*

**Equipe Antigravity - 2026**
