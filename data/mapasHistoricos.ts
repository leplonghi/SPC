import type { PanZoomPoint } from '../components/ui/PanZoomImage';

/**
 * ============================================================================
 * ATLAS DE CARTOGRAFIA HISTÓRICA DO MARANHÃO (SPC/SECMA)
 * ============================================================================
 *
 * COMO INCLUIR UM NOVO MAPA HISTÓRICO NO FUTURO:
 * 1. Coloque a imagem do mapa na pasta `public/cena-fotos/` (preferencialmente sem acentos ou espaços no nome do arquivo).
 *    - Se tiver uma versão leve (miniatura) e uma de alta resolução, informe `src` (leve) e `srcFull` (alta resolução).
 *    - Se tiver apenas um arquivo, informe o mesmo caminho em `src`.
 * 2. Adicione um novo objeto na lista `MAPAS_HISTORICOS` abaixo, informando:
 *    - `id`: identificador único (ex.: 'alcantara-1850')
 *    - `ano`: ano ou período exibido no seletor cronológico (ex.: '1698', '1858', '1912')
 *    - `titulo`: título oficial ou histórico da carta/planta
 *    - `autor`: cartógrafo, engenheiro ou gravador
 *    - `fonte`: instituição depositária e cota de acervo (ex.: Biblioteca Nacional, IPHAN, Arquivo Ultramarino)
 *    - `resumo`: contextualização histórica da planta
 *    - `width` e `height`: dimensões em pixels da imagem original
 *    - `points`: lista de pontos clicáveis (`x` e `y` variam de `0.0` a `1.0`, onde `0,0` é o canto superior esquerdo).
 *      Se o ponto corresponder a um ou mais bens tombados em `data/bensTombados.ts`, basta informar os números
 *      das inscrições em `bemIds: ['044', '057']` para que o portal exiba automaticamente a ficha de tombamento e o link do Decreto!
 */

export interface PontoMapaHistorico extends PanZoomPoint {
  /** Nome atual ou equivalente contemporâneo do logradouro/monumento */
  nomeAtual: string;
  /** Nota histórica curta explicando o ponto na planta */
  descricao: string;
  /** IDs das inscrições correspondentes em data/bensTombados.ts (ex.: ['044', '057']) */
  bemIds?: string[];
  /** Termo opcional para filtrar diretamente na página /bens-tombados */
  buscaTombamento?: string;
}

export interface MapaHistorico {
  id: string;
  ano: string;
  epocaLabel: string;
  municipio: string;
  titulo: string;
  autor: string;
  fonte: string;
  src: string;
  srcFull?: string;
  width: number;
  height: number;
  alt: string;
  resumo: string;
  leituraUrbana: string;
  points: PontoMapaHistorico[];
}

export const MAPAS_HISTORICOS: MapaHistorico[] = [
  {
    id: 'sao-luis-1698-pianta',
    ano: '1698',
    epocaLabel: 'Século XVII · Núcleo Fundacional',
    municipio: 'São Luís',
    titulo: 'Pianta della città di S. Luigi metropoli del Maragnone',
    autor: 'Pe. Giovanni Giuseppe di Santa Teresa / Gravura de Hubert Vincent (H. Vincent sc.)',
    fonte: 'Istoria delle guerre del Regno del Brasile (Roma, 1698) · Acervo Biblioteca Nacional / Domínio Público',
    src: '/cena-fotos/pianta-1698.jpg',
    srcFull: '/cena-fotos/pianta-1698.jpg',
    width: 3660,
    height: 2660,
    alt: 'Gravura de 1698 intitulada Pianta della città di S. Luigi metropoli del Maragnone, mostrando o forte, as igrejas e o traçado ortogonal.',
    resumo:
      'Representação seiscentista da cidade de São Luís sobre o promontório entre os rios Anil e Bacanga, documentando o traçado ortogonal desenhado pelo engenheiro-mor Francisco Frias de Mesquita após 1615 e o sistema defensivo colonial.',
    leituraUrbana:
      'Os números da legenda original em italiano identificam a cidadela fortificada na ponta do promontório (Castello S. Filippo, nº 10), o Colégio dos Jesuítas (nº 8, atual Catedral da Sé) e os conventos que balizaram os eixos de expansão leste (Carmo, nº 6, e São João, nº 7).',
    points: [
      {
        id: 'castello-filippo-1698',
        label: '10. Il Castello S. Filippo',
        nomeAtual: 'Forte de São Filipe / Palácio dos Leões (Av. Pedro II)',
        x: 0.445,
        y: 0.728,
        descricao:
          'Antigo Forte de São Luís (rebatizado Forte de São Filipe) no promontório sobre a confluência dos rios Anil e Bacanga, berço do Palácio do Governo e núcleo gerador do Centro Histórico.',
        bemIds: ['037', '050'],
        buscaTombamento: 'Centro Histórico'
      },
      {
        id: 'gesuiti-1698',
        label: '8. Il Convento de P.P. Gesuiti',
        nomeAtual: 'Catedral Metropolitana da Sé e Palácio Episcopal',
        x: 0.485,
        y: 0.495,
        descricao:
          'Conjunto do antigo Colégio e Igreja de Nossa Senhora da Luz dos Padres da Companhia de Jesus, erguido no Largo da Matriz (atual Avenida Pedro II).',
        bemIds: ['044', '057'],
        buscaTombamento: 'Catedral Metropolitana'
      },
      {
        id: 'carmine-1698',
        label: '6. La Chiesa della Madonna del Carmine',
        nomeAtual: 'Igreja e Convento de Nossa Senhora do Carmo (Praça João Lisboa)',
        x: 0.598,
        y: 0.378,
        descricao:
          'Complexo carmelita situado no coração da malha ortogonal seiscentista, defronte ao antigo Largo do Carmo (atual Praça João Lisboa).',
        bemIds: ['006', '037'],
        buscaTombamento: 'João Lisboa'
      },
      {
        id: 'san-giovanni-1698',
        label: '7. S. Giovanni',
        nomeAtual: 'Igreja de São João Batista',
        x: 0.502,
        y: 0.576,
        descricao:
          'Uma das matrizes mais antigas do núcleo colonial de São Luís, articulando as quadras residenciais ao sul da Rua Grande.',
        bemIds: ['050'],
        buscaTombamento: 'Centro Histórico'
      },
      {
        id: 'fortificazioni-1698',
        label: '9. Fortificazioni nuove',
        nomeAtual: 'Antigas Muralhas da Cidadela (Entorno da Praia Grande / Rua do Egito)',
        x: 0.445,
        y: 0.575,
        descricao:
          'Perímetro amuralhado que protegia o setor administrativo e militar da cidade alta no século XVII.',
        bemIds: ['031', '046'],
        buscaTombamento: 'Praia Grande'
      },
      {
        id: 'san-francesco-1698',
        label: '15. Il Convento di S. Francesco',
        nomeAtual: 'Antigo Convento de São Francisco',
        x: 0.415,
        y: 0.118,
        descricao:
          'Implantação franciscana no setor norte da planta seiscentista, ligada por caminhos que adentravam a mata (strade che vanno nei boschi).',
        bemIds: ['037']
      },
      {
        id: 'flotta-olandese-1698',
        label: '1. Luogo ove aprodò la flotta Olandese',
        nomeAtual: 'Desembarque da Esquadra Holandesa (Praia do Desterro / Bacanga)',
        x: 0.92,
        y: 0.59,
        descricao:
          'Ponto assinalado na legenda como o ancoradouro e desembarque das tropas neerlandesas na invasão de 1641.',
        bemIds: ['037']
      }
    ]
  },
  {
    id: 'sao-luis-1912-urbano',
    ano: '1912 (Detalhe Urbano)',
    epocaLabel: 'Século XX · Tricentenário e Linhas de Bonde',
    municipio: 'São Luís',
    titulo: 'Planta da Cidade de S. Luiz — Malha Urbana e Equipamentos Públicos',
    autor: 'Dr. Justo Jansen Ferreira (Lente de Geografia do Liceu Maranhense)',
    fonte: 'Biblioteca Nacional (Cota ARC.10,05,18) · Edição do Tricentenário (1912)',
    src: '/cena-fotos/planta-1912-mini.webp',
    srcFull: '/cena-fotos/planta-1912.webp',
    width: 1200,
    height: 896,
    alt: 'Planta da Cidade de S. Luiz, Capital do Estado do Maranhão, de 1912, adaptada por Justo Jansen Ferreira',
    resumo:
      'Recorte aproximado da malha consolidada de São Luís em 1912, destacando em vermelho o traçado das linhas de bonde, os largos imperiais, o bairro comercial da Praia Grande e a expansão em direção ao Caminho Grande e Madre Deus.',
    leituraUrbana:
      'Permite localizar com nitidez os grandes monumentos civis e religiosos tombados pelo Estado do Maranhão: Palácio do Governo, Catedral da Sé, Teatro Arthur Azevedo, Alfândega, Igreja do Carmo, Convento das Mercês e Cemitério do Gavião.',
    points: [
      {
        id: 'governo',
        label: 'Palacio do Governo',
        nomeAtual: 'Palácio dos Leões e Avenida Pedro II',
        x: 0.238,
        y: 0.634,
        descricao:
          'Sede do Governo do Estado do Maranhão na esplanada da Avenida Pedro II, coração administrativo e paisagístico do conjunto tombado.',
        bemIds: ['037', '050'],
        buscaTombamento: 'Pedro II'
      },
      {
        id: 'se',
        label: 'Igd da Sé',
        nomeAtual: 'Catedral Metropolitana e Palácio Episcopal',
        x: 0.316,
        y: 0.576,
        descricao:
          'Conjunto da Catedral Metropolitana de Nossa Senhora da Vitória e do antigo Colégio Jesuíta (Palácio Episcopal), ambos tombados individualmente pelo Estado.',
        bemIds: ['044', '057'],
        buscaTombamento: 'Catedral Metropolitana'
      },
      {
        id: 'theatro',
        label: 'Theatro',
        nomeAtual: 'Teatro Artur Azevêdo (Rua do Sol)',
        x: 0.35,
        y: 0.547,
        descricao:
          'Inaugurado em 1817 como Teatro União (depois Teatro São Luís e Teatro Artur Azevêdo), joia da arquitetura teatral neoclássica na Rua do Sol.',
        bemIds: ['045', '056'],
        buscaTombamento: 'Teatro Artur'
      },
      {
        id: 'carmo',
        label: 'Ig. do Carmo',
        nomeAtual: 'Igreja do Carmo e Praça João Lisboa',
        x: 0.375,
        y: 0.579,
        descricao:
          'Ponto focal da vida urbana e ponto nodal das linhas de bonde de 1912, cercado por sobrados azulejados tombados.',
        bemIds: ['006', '001'],
        buscaTombamento: 'João Lisboa'
      },
      {
        id: 'alfandega',
        label: 'Alfandêga',
        nomeAtual: 'Conjunto da Praia Grande (Rua Portugal e Rua do Trapiche)',
        x: 0.338,
        y: 0.653,
        descricao:
          'Coração portuário e mercantil da Praia Grande, onde se concentram os grandes sobrados comerciais revestidos de azulejos portugueses.',
        bemIds: ['009', '010', '031', '032'],
        buscaTombamento: 'Portugal'
      },
      {
        id: 'mercado',
        label: 'Mercado',
        nomeAtual: 'Casa das Tulhas / Feira da Praia Grande',
        x: 0.427,
        y: 0.599,
        descricao:
          'Setor de abastecimento histórico situado entre a Praia Grande e o Desterro.',
        bemIds: ['050', '043'],
        buscaTombamento: 'Centro Histórico'
      },
      {
        id: 'merces',
        label: 'Ig. de N.S. das Mercês',
        nomeAtual: 'Convento das Mercês e Entorno do Desterro',
        x: 0.385,
        y: 0.705,
        descricao:
          'Antigo Convento de Nossa Senhora das Mercês, referência monumental da fachada marítima sul voltada para o Rio Bacanga.',
        bemIds: ['037', '050'],
        buscaTombamento: 'Centro Histórico'
      },
      {
        id: 'cemiterio',
        label: 'Cemiterio Municipal',
        nomeAtual: 'Cemitério do Gavião (Madre Deus)',
        x: 0.679,
        y: 0.602,
        descricao:
          'Implantado no século XIX no bairro da Madre Deus, próximo à Quinta do Matadouro e ao Hospital dos Lázaros.',
        bemIds: ['050']
      }
    ]
  },
  {
    id: 'sao-luis-1912-folha-completa',
    ano: '1912 (Folha Integral)',
    epocaLabel: 'Século XX · Freguesias, Fábricas e Imprensa',
    municipio: 'São Luís',
    titulo: 'Folha Cartográfica Integral de 1912 — Freguesias, Indústrias e Jornais',
    autor: 'Dr. Justo Jansen Ferreira',
    fonte: 'Biblioteca Nacional (Cota original ARC.10,05,18 com margens e encartes)',
    src: '/imagens/mapa_sao_luiz.jpg',
    srcFull: '/cena-fotos/planta-1912-completa.jpg',
    width: 5855,
    height: 4370,
    alt: 'Folha completa de 1912 da Planta da Cidade de S. Luiz com encarte de divisão em distritos, relação de jornais e carimbo da Biblioteca Nacional.',
    resumo:
      'Versão integral de altíssima definição (5855 × 4370 px) da prancha depositada na Biblioteca Nacional, preservando o mapa auxiliar de Divisão em Distritos e Freguesias, os dados demográficos (50.000 habitantes) e a lista de jornais em circulação.',
    leituraUrbana:
      'Além das igrejas de Santana, Santo Antônio e Largo do Ribeirão, esta folha completa permite inspecionar os encartes marginais e o parque fabril têxtil do início do século XX (Canto da Fabril, Camboa e Anil).',
    points: [
      {
        id: 'encarte-distritos-1912',
        label: 'Divisão em Districtos e Freguezias',
        nomeAtual: 'Encarte Demográfico (3 Freguesias · População: 50.000 hab.)',
        x: 0.186,
        y: 0.212,
        descricao:
          'Quadro cartográfico superior esquerdo detalhando as 3 Freguesias de São Luís em 1912: N. S. da Conceição, S. João Baptista e N. S. da Victória.',
        bemIds: ['037', '050']
      },
      {
        id: 'santo-antonio-1912',
        label: 'Igreja S. Antonio',
        nomeAtual: 'Igreja e Praça de Santo Antônio / Solar da Baronesa de São Bento',
        x: 0.365,
        y: 0.405,
        descricao:
          'Conjunto da Igreja de Santo Antônio e do antigo Convento, próximo à Rua Santo Antônio, onde se situa o Solar da Baronesa de São Bento.',
        bemIds: ['055', '002'],
        buscaTombamento: 'Santo Antonio'
      },
      {
        id: 'ribeirao-1912',
        label: 'F. do Ribeirão',
        nomeAtual: 'Largo do Ribeirão e Casa Josué Montello',
        x: 0.348,
        y: 0.508,
        descricao:
          'Região da Fonte e Largo do Ribeirão, cercada por sobrados coloniais tombados pelo Estado (incluindo o Solar do Ribeirão e a Casa Josué Montello).',
        bemIds: ['005', '019', '023'],
        buscaTombamento: 'Ribeirão'
      },
      {
        id: 'santana-1912',
        label: 'Ig. S. Anna',
        nomeAtual: 'Igreja de Santana (Rua de Santana)',
        x: 0.435,
        y: 0.525,
        descricao:
          'Igreja de Santana, tombada pelo Estado do Maranhão em 1980 (Inscrição nº 025 do Livro de Tombo Histórico).',
        bemIds: ['025'],
        buscaTombamento: 'Santana'
      },
      {
        id: 'fabril-1912',
        label: 'Região Fabril / Caminho Grande',
        nomeAtual: 'Imóvel do Canto da Fabril e Expansão Leste',
        x: 0.515,
        y: 0.465,
        descricao:
          'Eixo de expansão ao longo da linha de bonde do Caminho Grande e instalações da Companhia Fabril Maranhense.',
        bemIds: ['062', '003'],
        buscaTombamento: 'Fabril'
      },
      {
        id: 'jornaes-1912',
        label: 'Jornaes de S. Luiz',
        nomeAtual: 'Memória da Imprensa Maranhense (1912)',
        x: 0.178,
        y: 0.785,
        descricao:
          'Nota marginal listando os periódicos em circulação na capital em 1912: Diario Official, Diario do Maranhão, Pacotilha e Correio da Tarde.',
        bemIds: ['001'],
        buscaTombamento: 'Benedito Leite'
      }
    ]
  }
];

