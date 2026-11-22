import type { PanZoomPoint } from '../components/ui/PanZoomImage';

/**
 * ============================================================================
 * ATLAS DE CARTOGRAFIA HISTÓRICA E POLIGONAIS DE TOMBAMENTO (SPC/SECMA)
 * ============================================================================
 *
 * Reúne:
 * 1. Plantas e Cartas Históricas do Maranhão e de São Luís (1698, 1819, 1858, 1912)
 * 2. Mapas de Tombamento e Poligonais Oficiais dos Municípios Tombados
 *    (São Luís, Alcântara, Viana, Caxias e Carolina)
 */

export interface PontoMapaHistorico extends PanZoomPoint {
  /** Nome atual ou equivalente contemporâneo do logradouro/monumento */
  nomeAtual: string;
  /** Nota histórica ou técnica explicando o ponto na planta */
  descricao: string;
  /** IDs das inscrições correspondentes em data/bensTombados.ts (ex.: ['044', '057']) */
  bemIds?: string[];
  /** Termo opcional para filtrar diretamente na página /bens-tombados */
  buscaTombamento?: string;
}

export type CategoriaMapa = 'Planta e Carta Histórica' | 'Mapa de Tombamento';

export interface MapaHistorico {
  id: string;
  categoria: CategoriaMapa;
  ano: string;
  epocaLabel: string;
  municipio: string;
  /** Municípios de data/bensTombados.ts aos quais este mapa se vincula diretamente */
  municipiosRelacionados: string[];
  titulo: string;
  autor: string;
  fonte: string;
  /** Imagem para visualização interativa com zoom e pinos no PanZoomImage */
  src: string;
  /** Imagem de altíssima resolução opcional para o PanZoomImage */
  srcFull?: string;
  /** Caminho do arquivo original (PDF de alta precisão, PNG ou JPG) para download direto */
  downloadUrl: string;
  /** Rótulo do formato para download (ex.: 'PDF Vetorial', 'PDF Prancha 1:2000', 'JPG Alta Resolução', 'PNG') */
  formatoDownload: string;
  width: number;
  height: number;
  alt: string;
  resumo: string;
  leituraUrbana: string;
  points: PontoMapaHistorico[];
}

export const MAPAS_HISTORICOS: MapaHistorico[] = [
  // ==========================================================================
  // 1. PLANTAS E CARTAS HISTÓRICAS (1698 – 1912)
  // ==========================================================================
  {
    id: 'sao-luis-1698-pianta',
    categoria: 'Planta e Carta Histórica',
    ano: '1698 (São Luís)',
    epocaLabel: 'Século XVII · Núcleo Fundacional',
    municipio: 'São Luís',
    municipiosRelacionados: ['São Luís'],
    titulo: 'Pianta della città di S. Luigi metropoli del Maragnone',
    autor: 'Pe. Giovanni Giuseppe di Santa Teresa / Gravura de Hubert Vincent (H. Vincent sc.)',
    fonte: 'Istoria delle guerre del Regno del Brasile (Roma, 1698) · Acervo Biblioteca Nacional / Domínio Público',
    src: '/cena-fotos/pianta-1698.jpg',
    srcFull: '/cena-fotos/pianta-1698.jpg',
    downloadUrl: '/cena-fotos/pianta-1698.jpg',
    formatoDownload: 'JPG Alta Resolução (3660×2660)',
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
    id: 'maranhao-1698-provincie',
    categoria: 'Planta e Carta Histórica',
    ano: '1698 (Carta Regional)',
    epocaLabel: 'Século XVII · Estado do Maranhão e Grão-Pará',
    municipio: 'Maranhão (Carta Geral)',
    municipiosRelacionados: ['São Luís', 'Alcântara', 'Rosário', 'Barreirinhas'],
    titulo: 'Provinciæ del Parà e del Maragnone',
    autor: 'Andreas Antonius Horatii (inv. et delin.) / Hubert Vincent (sculp.)',
    fonte: 'Istoria delle guerre del Regno del Brasile (Roma, 1698) · Biblioteca Nacional (Cota ARC.016,09,021)',
    src: '/cena-fotos/MAP_s.d._Provincie_del_Para_e_del_Maragnone_1698.jpg',
    srcFull: '/cena-fotos/MAP_s.d._Provincie_del_Para_e_del_Maragnone_1698.jpg',
    downloadUrl: '/cena-fotos/MAP_s.d._Provincie_del_Para_e_del_Maragnone_1698.jpg',
    formatoDownload: 'JPG Alta Resolução (3177×4280)',
    width: 3177,
    height: 4280,
    alt: 'Carta seiscentista intitulada Provinciae del Para e del Maragnone (1698), com brasão real português, rosa dos ventos na Linha do Equador e a Ilha do Maranhão.',
    resumo:
      'Carta costeira e hidrográfica seiscentista do antigo Estado do Maranhão e Grão-Pará, desenhada por Andrea Antonio Orazi e gravada por Hubert Vincent em 1698. Destaca a "Isola de Maranhon" (S. Luis), o continente fronteiro (Tapuitapera/Alcântara), o Rio Itapecuru e a foz do Rio Preguiças.',
    leituraUrbana:
      'Orientada com o Norte para a direita (conforme a Rosa dos Ventos sobre a Linea Aequinoctialis), a carta documenta a articulação marítima e fluvial entre a Ilha de São Luís, a Baía de São Marcos e as entradas para os rios Mearim, Itapecuru e Preguiças.',
    points: [
      {
        id: 'isola-maranhon-1698',
        label: 'S. Luis · Isola de Maranhon',
        nomeAtual: 'Ilha do Maranhão e Cidade de São Luís',
        x: 0.495,
        y: 0.622,
        descricao:
          'Representação insular de São Luís no centro do Golfão Maranhense, núcleo político e militar da Província do Maranhão.',
        bemIds: ['037', '050'],
        buscaTombamento: 'São Luís'
      },
      {
        id: 'baia-alcantara-1698',
        label: 'R. Maradu / Costa de Tapuitapera',
        nomeAtual: 'Território de Alcântara e Baía de São Marcos',
        x: 0.405,
        y: 0.628,
        descricao:
          'Margem ocidental da Baía de São Marcos, frente à Ilha do Maranhão, onde se consolidou a vila colonial de Santo Antônio de Alcântara.',
        bemIds: ['013', '060'],
        buscaTombamento: 'Alcântara'
      },
      {
        id: 'rio-itapecuru-1698',
        label: 'Fort de S. Maria / R. Tapociaru',
        nomeAtual: 'Foz do Rio Itapecuru e Forte do Calvário (Rosário)',
        x: 0.432,
        y: 0.678,
        descricao:
          'Entrada estratégica do Rio Itapecuru, defendida no período seiscentista pelo Forte do Calvário (atual município de Rosário, tombado sob a inscrição nº 047).',
        bemIds: ['047', '015', '064'],
        buscaTombamento: 'Rosário'
      },
      {
        id: 'rio-preguicas-1698',
        label: 'R. de Perguicas',
        nomeAtual: 'Rio Preguiças e Litoral Oriental (Barreirinhas)',
        x: 0.460,
        y: 0.785,
        descricao:
          'Região costeira do Rio Preguiças ("R. de Perguicas"), onde se localiza o patrimônio paisagístico e arqueológico de Barreirinhas.',
        bemIds: ['048'],
        buscaTombamento: 'Barreirinhas'
      }
    ]
  },
  {
    id: 'maranhao-1819-capitania',
    categoria: 'Planta e Carta Histórica',
    ano: '1819 (Capitania)',
    epocaLabel: 'Século XIX · Carta de Francisco de Paula Ribeiro',
    municipio: 'Maranhão (Carta Geral)',
    municipiosRelacionados: ['São Luís', 'Alcântara', 'Viana', 'Caxias', 'Carolina', 'Itapecuru-Mirim', 'Pindaré-Mirim', 'Rosário', 'Buriti'],
    titulo: 'Mappa Geographico da Capitania do Maranham (1819)',
    autor: 'Major Francisco de Paula Ribeiro ("o desenhou e acabou de Organizar em 1819")',
    fonte: 'Memória sobre a População, Cultura e Cousas mais Notáveis da Capitania do Maranhão (1819)',
    src: '/cena-fotos/MAP_s.d._MAPA_GEOGRAFICO_MA.jpg',
    srcFull: '/cena-fotos/MAP_s.d._MAPA_GEOGRAFICO_MA.jpg',
    downloadUrl: '/cena-fotos/MAP_s.d._MAPA_GEOGRAFICO_MA.jpg',
    formatoDownload: 'JPG Alta Resolução (3222×5071)',
    width: 3222,
    height: 5071,
    alt: 'Mappa Geographico da Capitania do Maranham organizado em 1819 por Francisco de Paula Ribeiro, mostrando as bacias hidrográficas, freguesias e sertões.',
    resumo:
      'Primeira grande síntese cartográfica do território maranhense no limiar da Independência (1819), elaborada pelo militar e sertanista Major Francisco de Paula Ribeiro. Documenta a divisão entre as freguesias povoadas do norte (São Luís, Alcântara, Viana, Guimarães, Itapecuru, Caxias) e os sertões meridionais do Tocantins e Balsas.',
    leituraUrbana:
      'As notas manuscritas na carta registram a ocupação das bacias dos rios Itapecuru, Mearim, Pindaré e Parnaíba, assinalando os "Lagos de Vianna", a Vila de Caxias (Aldeias Altas), Alcântara e a fronteira fluvial com Goiás (região de Carolina).',
    points: [
      {
        id: 'ilha-maranham-1819',
        label: 'I. do Maranham / Cid. de S. Luis',
        nomeAtual: 'Ilha do Maranhão (São Luís e Paço do Lumiar)',
        x: 0.562,
        y: 0.196,
        descricao:
          'Ilha do Maranhão na foz dos rios Mearim, Pindaré e Itapecuru, centro exportador algodoeiro e arrozeiro da Capitania em 1819.',
        bemIds: ['037', '050', '035'],
        buscaTombamento: 'São Luís'
      },
      {
        id: 'freguesias-alcantara-viana-1819',
        label: 'Lagos de Vianna · Freg.as de Vianna e Alcânt.a',
        nomeAtual: 'Baixada Maranhense e Litoral Ocidental (Alcântara e Viana)',
        x: 0.422,
        y: 0.242,
        descricao:
          'A inscrição histórica registra: "Terreno muito Povoado, que pertence ás Freg.as de Guim.es, Vianna, Cajapió, Alcânt.a e outras", destacando logo abaixo os "Lagos de Vianna".',
        bemIds: ['040', '060', '061', '013'],
        buscaTombamento: 'Viana'
      },
      {
        id: 'freguesia-itapecuru-1819',
        label: 'Freg.a de Itapucurú / Rosário',
        nomeAtual: 'Vale do Rio Itapecuru (Rosário e Itapecuru-Mirim)',
        x: 0.586,
        y: 0.345,
        descricao:
          'Eixo fluvial do Rio Itapecuru, principal artéria de penetração econômica e localização da antiga Cadeia Pública de Itapecuru-Mirim e do Sítio Paleontológico.',
        bemIds: ['015', '047', '064'],
        buscaTombamento: 'Itapecuru-Mirim'
      },
      {
        id: 'caxias-aldeias-altas-1819',
        label: 'V. de Caxias (Aldêas Altas)',
        nomeAtual: 'Centro Histórico de Caxias e Região de Buriti',
        x: 0.728,
        y: 0.404,
        descricao:
          'Polo mercantil e algodoeiro do leste maranhense entre os rios Itapecuru e Parnaíba, abrangendo Caxias e as fazendas históricas de Buriti.',
        bemIds: ['004', '054', '059', '058'],
        buscaTombamento: 'Caxias'
      },
      {
        id: 'sertoes-tocantins-carolina-1819',
        label: 'Rio Tocantins / Sertão de Carolina',
        nomeAtual: 'Médio Tocantins e Chapada das Mesas (Carolina)',
        x: 0.220,
        y: 0.550,
        descricao:
          'Vale do Rio Tocantins no extremo oeste da carta, frente às terras altas onde floresceu o núcleo oitocentista de São Pedro de Alcântara (Carolina).',
        bemIds: ['063', '065'],
        buscaTombamento: 'Carolina'
      }
    ]
  },
  {
    id: 'sao-luis-1858-veiga',
    categoria: 'Planta e Carta Histórica',
    ano: '1858 (São Luís)',
    epocaLabel: 'Século XIX · São Luís Imperial (J. Veiga)',
    municipio: 'São Luís',
    municipiosRelacionados: ['São Luís'],
    titulo: 'Planta da Cidade de São Luís do Maranhão Levantada em 1858',
    autor: 'J. Veiga (Levantada em 1858)',
    fonte: 'Acervo Cartográfico da SPC/SECMA · Escala gráfica em braças',
    src: '/cena-fotos/MAP_s.d._mapa.png',
    srcFull: '/cena-fotos/MAP_s.d._mapa.png',
    downloadUrl: '/cena-fotos/MAP_s.d._mapa.png',
    formatoDownload: 'PNG Alta Resolução (2272×1888)',
    width: 2272,
    height: 1888,
    alt: 'Planta da Cidade de São Luís do Maranhão levantada em 1858 por J. Veiga, exibindo a malha de quadras entre o Rio do Anil e o Rio Bacanga.',
    resumo:
      'Planta oitocentista levantada no auge do ciclo do algodão e da literatura romântica maranhense (1858). Apresenta as quadras numeradas entre o Rio do Anil e o Rio Bacanga, as quintas suburbanas (Quinta do Barão de Bagé, Quinta do Monteiro) e o recém-instalado Cemitério do Gavião.',
    leituraUrbana:
      'Documenta a transição entre a cidade colonial da Praia Grande e a cidade imperial dos sobrados azulejados, praças arborizadas, Passeio Público e chácaras ao longo do Caminho Grande.',
    points: [
      {
        id: 'palacio-praca-1858',
        label: 'Baluarte / Largo do Palácio e Sé',
        nomeAtual: 'Avenida Pedro II, Catedral da Sé e Palácio Episcopal',
        x: 0.312,
        y: 0.875,
        descricao:
          'Ponta sudoeste do promontório sobre a rampa do Palácio e o cais da Sagração, reunindo a Catedral da Sé e o Palácio Episcopal.',
        bemIds: ['044', '057', '037'],
        buscaTombamento: 'Pedro II'
      },
      {
        id: 'praia-grande-1858',
        label: 'Quadras Comerciais da Praia Grande',
        nomeAtual: 'Rua Portugal, Rua do Trapiche e Rua da Estrela',
        x: 0.410,
        y: 0.850,
        descricao:
          'Setor mercantil portuário voltado para a Baía de São Marcos e o Rio Bacanga, onde se concentram os sobrados comerciais tombados.',
        bemIds: ['008', '009', '010', '031', '032'],
        buscaTombamento: 'Praia Grande'
      },
      {
        id: 'panteon-passeio-1858',
        label: 'Praça do Panteon e Núcleo Central',
        nomeAtual: 'Praça do Panteon e Biblioteca Pública Benedito Leite',
        x: 0.490,
        y: 0.400,
        descricao:
          'Setor central da malha imperial, articulando os largos públicos e o eixo da Rua Grande.',
        bemIds: ['001', '003'],
        buscaTombamento: 'Panteon'
      },
      {
        id: 'cemiterio-gaviao-1858',
        label: 'Cemitério do Gavião',
        nomeAtual: 'Cemitério do Gavião e Entorno da Madre Deus',
        x: 0.895,
        y: 0.305,
        descricao:
          'Necrópole oitocentista implantada a leste do núcleo urbano em 1855, assinalada no extremo direito superior da planta de 1858.',
        bemIds: ['050'],
        buscaTombamento: 'Centro Histórico'
      }
    ]
  },
  {
    id: 'sao-luis-1912-urbano',
    categoria: 'Planta e Carta Histórica',
    ano: '1912 (Detalhe Urbano)',
    epocaLabel: 'Século XX · Tricentenário e Linhas de Bonde',
    municipio: 'São Luís',
    municipiosRelacionados: ['São Luís'],
    titulo: 'Planta da Cidade de S. Luiz — Malha Urbana e Equipamentos Públicos',
    autor: 'Dr. Justo Jansen Ferreira (Lente de Geografia do Liceu Maranhense)',
    fonte: 'Biblioteca Nacional (Cota ARC.10,05,18) · Edição do Tricentenário (1912)',
    src: '/cena-fotos/planta-1912-mini.webp',
    srcFull: '/cena-fotos/planta-1912.webp',
    downloadUrl: '/cena-fotos/planta-1912-completa.jpg',
    formatoDownload: 'JPG Alta Resolução (5855×4370)',
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
    categoria: 'Planta e Carta Histórica',
    ano: '1912 (Folha Integral)',
    epocaLabel: 'Século XX · Freguesias, Fábricas e Imprensa',
    municipio: 'São Luís',
    municipiosRelacionados: ['São Luís'],
    titulo: 'Folha Cartográfica Integral de 1912 — Freguesias, Indústrias e Jornais',
    autor: 'Dr. Justo Jansen Ferreira',
    fonte: 'Biblioteca Nacional (Cota original ARC.10,05,18 com margens e encartes)',
    src: '/imagens/mapa_sao_luiz.jpg',
    srcFull: '/cena-fotos/planta-1912-completa.jpg',
    downloadUrl: '/cena-fotos/planta-1912-completa.jpg',
    formatoDownload: 'JPG Alta Resolução (5855×4370)',
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
  },

  // ==========================================================================
  // 2. MAPAS DE TOMBAMENTO E POLIGONAIS POR MUNICÍPIO (SPC / DPHAP)
  // ==========================================================================
  {
    id: 'sao-luis-poligonal-tombamento',
    categoria: 'Mapa de Tombamento',
    ano: 'São Luís (Poligonal)',
    epocaLabel: 'Decretos Estaduais nº 10.089/1986 e nº 11.591/1990',
    municipio: 'São Luís',
    municipiosRelacionados: ['São Luís'],
    titulo: 'Mapa das Áreas Tombadas do Centro Histórico de São Luís (Estadual e UNESCO)',
    autor: 'DPHAP / Superintendência do Patrimônio Cultural (SPC/SECMA)',
    fonte: 'Decreto Estadual nº 10.089/1986 (Inscrição #037) e Decreto Estadual nº 11.591/1990 (Inscrição #050)',
    src: '/cena-fotos/tombamento.png',
    srcFull: '/cena-fotos/tombamento.png',
    downloadUrl: '/cena-fotos/tombamento.png',
    formatoDownload: 'PNG Colorido com Legenda Oficial',
    width: 933,
    height: 948,
    alt: 'Mapa do Centro Histórico de São Luís mostrando em amarelo, laranja, rosa e verde as poligonais tombadas pelos Decretos Estaduais 10.089/1986 e 11.591/1990 e pela UNESCO.',
    resumo:
      'Mapa temático oficial de sobreposição das poligonais de proteção do Centro Histórico de São Luís, distinguindo por cores a área inscrita como Patrimônio Mundial (UNESCO / Tombamento Federal, em amarelo) e a ampla área sob Tombamento Estadual (Decreto nº 10.089/1986 e Decreto nº 11.591/1990, em laranja, salmão e verde).',
    leituraUrbana:
      'A legenda demonstra visualmente como o tombamento estadual abrange toda a expansão oitocentista (Desterro, Praia Grande, Santo Antônio, Santana, Apicum, Diamante, Madre Deus e Quinta do Barão), exigindo anuência prévia da SPC/DPHAP para intervenções em todo o perímetro colorido.',
    points: [
      {
        id: 'slz-unesco-1990',
        label: 'Núcleo Praia Grande e Pedro II (Amarelo + Laranja)',
        nomeAtual: 'Conjunto Arquitetônico e Paisagístico (Dec. 11.591/1990 · Insc. #050)',
        x: 0.165,
        y: 0.340,
        descricao:
          'Setor ocidental voltado para os rios Anil e Bacanga: reúne a área inscrita na Lista do Patrimônio Mundial (UNESCO) e a proteção estadual do Decreto nº 11.591, de 12/10/1990.',
        bemIds: ['050', '044', '057', '031', '032'],
        buscaTombamento: 'Centro Histórico de São Luís'
      },
      {
        id: 'slz-estadual-1986',
        label: 'Expansão Central, Santana e Madre Deus (Rosa)',
        nomeAtual: 'Centro Histórico de São Luís — ZE/2 (Dec. 10.089/1986 · Insc. #037)',
        x: 0.430,
        y: 0.450,
        descricao:
          'Ampla poligonal tombada pelo Governo do Estado do Maranhão por meio do Decreto nº 10.089/1986, cobrindo o Centro, Santo Antônio, Ribeirão, Santana, Fonte do Bispo e Madre Deus.',
        bemIds: ['037', '001', '002', '005', '025', '045', '055', '056'],
        buscaTombamento: '10.089'
      },
      {
        id: 'slz-area-verde-quinta',
        label: 'Setor Paisagístico Leste (Verde)',
        nomeAtual: 'Área Verde Integrante do Perímetro Estadual (Dec. 10.089/1986)',
        x: 0.658,
        y: 0.515,
        descricao:
          'Faixa paisagística e ambiental de amortecimento leste integrante da poligonal estadual estabelecida pelo Decreto nº 10.089/1986.',
        bemIds: ['037', '052'],
        buscaTombamento: '10.089'
      }
    ]
  },
  {
    id: 'alcantara-mapa-tombamento',
    categoria: 'Mapa de Tombamento',
    ano: 'Alcântara (Tombamento)',
    epocaLabel: 'Decreto Estadual nº 11.683/1990 · Inscrição #060',
    municipio: 'Alcântara',
    municipiosRelacionados: ['Alcântara'],
    titulo: 'Mapa do Sítio Histórico de Alcântara — Monumentos e Perímetro Urbano',
    autor: 'DPHAP / Superintendência do Patrimônio Cultural (SPC/SECMA)',
    fonte: 'Acervo Cartográfico DPHAP/SPC · Decreto Estadual nº 11.683/1990 e Decreto nº 7.662/1980',
    src: '/cena-fotos/MAN_s.d._ALC_MAPA_TOMBAMENTO.jpg',
    srcFull: '/cena-fotos/MAN_s.d._ALC_MAPA_TOMBAMENTO.jpg',
    downloadUrl: '/cena-fotos/MAN_s.d._ALC_MAPA_TOMBAMENTO.pdf',
    formatoDownload: 'PDF Vetorial + JPG Alta Resolução',
    width: 2947,
    height: 2083,
    alt: 'Planta cadastral do Sítio Histórico de Alcântara identificando o Porto, Praça da Matriz, Pelourinho, Casa de Câmara e Cadeia, Fonte das Pedras, Igreja do Carmo e Igreja do Rosário.',
    resumo:
      'Planta técnica do Sítio Histórico de Alcântara (tombado estadualmente pelo Decreto nº 11.683, de 29/11/1990, Inscrição nº 060), com numeração dos principais monumentos civis e religiosos desde o Porto do Jacaré até a Igreja de Nossa Senhora do Rosário dos Pretos.',
    leituraUrbana:
      'Identifica com precisão a Praça da Matriz (Gomes de Castro) com as ruínas da Igreja de São Matias e o Pelourinho (nº 19), a Prefeitura / Casa de Câmara e Cadeia (nº 17, Inscrição nº 013), a Fonte das Pedras (nº 12), a Igreja do Carmo (nº 25) e a Igreja do Rosário (nº 27).',
    points: [
      {
        id: 'alc-praca-matriz-19',
        label: '17 e 19. Praça da Matriz, Pelourinho e Prefeitura (Câmara e Cadeia)',
        nomeAtual: 'Praça Gomes de Castro, Casa de Câmara e Cadeia (Insc. #013) e Conjunto Histórico (#060)',
        x: 0.622,
        y: 0.730,
        descricao:
          'Coração cívico e religioso de Alcântara: reúne a antiga Casa de Câmara e Cadeia (nº 17, tombada individualmente sob a Inscrição nº 013 pelo Decreto nº 7.662/1980), o Pelourinho e as ruínas da Matriz de São Matias (nº 19).',
        bemIds: ['013', '060'],
        buscaTombamento: 'Alcântara'
      },
      {
        id: 'alc-rua-grande-20',
        label: '20 a 22. Eixo da Rua Grande',
        nomeAtual: 'Casa do Divino e Sobrados da Rua Grande (Insc. #017 e #060)',
        x: 0.675,
        y: 0.660,
        descricao:
          'Principal artéria senhorial de Alcântara, ligando a Praça da Matriz ao Largo do Carmo, onde se localiza a Casa do Divino (Rua Grande, 88 — Inscrição nº 017).',
        bemIds: ['017', '060'],
        buscaTombamento: 'Alcântara'
      },
      {
        id: 'alc-igreja-carmo-25',
        label: '24 e 25. Igreja e Ruínas do Convento do Carmo',
        nomeAtual: 'Igreja de Nossa Senhora do Carmo e Largo do Carmo',
        x: 0.795,
        y: 0.575,
        descricao:
          'Conjunto carmelita de Alcântara e sobrados vizinhos na confluência da Rua Grande com a Rua do Sossego.',
        bemIds: ['060'],
        buscaTombamento: 'Alcântara'
      },
      {
        id: 'alc-fonte-pedras-12',
        label: '12. Fonte das Pedras',
        nomeAtual: 'Fonte das Pedras e Galeria Colonial',
        x: 0.538,
        y: 0.638,
        descricao:
          'Fonte colonial oitocentista situada na baixada entre a Rua das Mercês e a Rua da Requieira.',
        bemIds: ['060'],
        buscaTombamento: 'Alcântara'
      },
      {
        id: 'alc-igreja-rosario-27',
        label: '27. Igreja do Rosário',
        nomeAtual: 'Igreja de Nossa Senhora do Rosário dos Pretos e Eixo Norte',
        x: 0.848,
        y: 0.185,
        descricao:
          'Largo e Igreja de Nossa Senhora do Rosário dos Pretos no setor superior da malha histórica de Alcântara.',
        bemIds: ['018', '060'],
        buscaTombamento: 'Alcântara'
      },
      {
        id: 'alc-porto-1',
        label: '1 a 7. Porto, Ladeira do Jacaré e Rua da Amargura',
        nomeAtual: 'Cais do Porto, Avenida Getúlio Vargas e Ruínas da Rua da Amargura',
        x: 0.185,
        y: 0.515,
        descricao:
          'Porta de entrada marítima do Sítio Histórico de Alcântara e conjunto de ruínas de palacetes coloniais na Rua Bela Vista / Amargura.',
        bemIds: ['060'],
        buscaTombamento: 'Alcântara'
      }
    ]
  },
  {
    id: 'viana-planta-geral-1988',
    categoria: 'Mapa de Tombamento',
    ano: 'Viana (Abril/1988 · 1:2000)',
    epocaLabel: 'Decreto Estadual nº 10.899/1988 · Prancha Oficial DPHAP',
    municipio: 'Viana',
    municipiosRelacionados: ['Viana'],
    titulo: 'Planta Geral 01/01 — Delimitação do Perímetro de Tombamento da Cidade de Viana',
    autor: 'Secretaria da Cultura / DPHAP · Desenho: Stawer, Washington e João Carlos (Abril/1988)',
    fonte: 'Prancha Oficial DPHAP Escala 1:2000 (Base SESP e IBGE) · Decreto Estadual nº 10.899, de 17/10/1988',
    src: '/cena-fotos/MAP_s.d._VIA_MAPA_PLANTA_BAIXA.jpg',
    srcFull: '/cena-fotos/MAP_s.d._VIA_MAPA_PLANTA_BAIXA.jpg',
    downloadUrl: '/cena-fotos/MAP_s.d._VIA_MAPA_PLANTA_BAIXA.pdf',
    formatoDownload: 'PDF Prancha Original 1:2000 (25 MB)',
    width: 3616,
    height: 2716,
    alt: 'Prancha técnica original de abril de 1988 da Secretaria da Cultura / DPHAP com a Delimitação do Perímetro de Tombamento da Cidade de Viana na escala 1:2000.',
    resumo:
      'Prancha técnica histórica original elaborada pelo Departamento do Patrimônio Histórico, Artístico e Paisagístico do Maranhão (DPHAP/SECMA) em abril de 1988 (escala 1:2000), que instruiu o Decreto Estadual nº 10.899, de 17/10/1988 (Inscrição nº 040). Destaca em hachura o perímetro de tombamento e o espelho d’água dos Lagos de Viana.',
    leituraUrbana:
      'A prancha documenta a implantação peninsular de Viana cercada pelas enseadas (Porto Honório Belo, Enseada do Quebra Coco, Enseada do Democrata, Ilha de Sacuan) e delimita a mancha hachurada do núcleo colonial em torno da Praça Duque de Caxias, Rua Grande (Cel. Campelo) e Rua Antônio Lopes.',
    points: [
      {
        id: 'viana-perimetro-hachurado-1988',
        label: 'Mancha Hachurada — Perímetro de Tombamento (1988)',
        nomeAtual: 'Centro Histórico, Arquitetônico e Paisagístico de Viana (Insc. #040)',
        x: 0.340,
        y: 0.305,
        descricao:
          'Poligonal hachurada de proteção rigorosa definida pelo DPHAP em abril de 1988 e homologada pelo Decreto Estadual nº 10.899/1988.',
        bemIds: ['040', '061'],
        buscaTombamento: 'Viana'
      },
      {
        id: 'viana-matriz-caxias-1988',
        label: 'Praça Duque de Caxias e Igreja Matriz',
        nomeAtual: 'Igreja Matriz de Nossa Senhora da Conceição e Sinos Tombados (Insc. #061)',
        x: 0.200,
        y: 0.222,
        descricao:
          'Coração fundacional da antiga missão jesuítica de Maracu (elevada a vila de Viana em 1757), onde se situam a Igreja Matriz e seus sinos históricos tombados pelo Decreto nº 12.456/1992.',
        bemIds: ['061', '040'],
        buscaTombamento: 'Viana'
      },
      {
        id: 'viana-porto-honorio-1988',
        label: 'Porto Honório Belo e Lagos de Viana',
        nomeAtual: 'Orla Lacustre Norte e Rampa Celso Magalhães',
        x: 0.242,
        y: 0.130,
        descricao:
          'Conexão histórica entre o núcleo urbano de Viana e o sistema lacustre da Baixada Maranhense.',
        bemIds: ['040'],
        buscaTombamento: 'Viana'
      },
      {
        id: 'viana-carimbo-dphap-1988',
        label: 'Selo Oficial: Secretaria da Cultura / DPHAP (Abril/1988)',
        nomeAtual: 'Carimbo Técnico da Delimitação do Perímetro de Tombamento (Escala 1:2000)',
        x: 0.885,
        y: 0.665,
        descricao:
          'Carimbo oficial da prancha 01/01 do DPHAP datado de abril de 1988, atestando a base cartográfica SESP/IBGE na escala 1:2000.',
        bemIds: ['040'],
        buscaTombamento: '10.899'
      }
    ]
  },
  {
    id: 'viana-mapa-cadastral-tombamento',
    categoria: 'Mapa de Tombamento',
    ano: 'Viana (Cadastro de Lotes)',
    epocaLabel: 'Decretos Estaduais nº 10.899/1988 e nº 12.456/1992',
    municipio: 'Viana',
    municipiosRelacionados: ['Viana'],
    titulo: 'Mapa Cadastral de Quadras, Lotes e Imóveis do Centro Histórico de Viana',
    autor: 'DPHAP / Superintendência do Patrimônio Cultural (SPC/SECMA)',
    fonte: 'Cadastro Técnico Urbano DPHAP · Inscrições Estaduais #040 e #061',
    src: '/cena-fotos/MAN_s.d._VIA_MAPA_TOMBAMENTO.jpg',
    srcFull: '/cena-fotos/MAN_s.d._VIA_MAPA_TOMBAMENTO.jpg',
    downloadUrl: '/cena-fotos/MAN_s.d._VIA_MAPA_TOMBAMENTO.pdf',
    formatoDownload: 'PDF Vetorial Cadastral + JPG',
    width: 2947,
    height: 2083,
    alt: 'Mapa cadastral de lotes e numeração predial do Centro Histórico de Viana, detalhando as ruas Antônio Lopes, Cel. Campelo, Dr. Castro Maia e Praça da Matriz.',
    resumo:
      'Levantamento cadastral detalhado de quadras (QD. 01 a QD. 34) e numeração de lotes do Centro Histórico de Viana, permitindo identificar individualmente os imóveis ao longo da Rua Antônio Lopes, Rua Cel. Campelo, Rua Dr. Castro Maia, Rua do Sol e entorno da Igreja Matriz.',
    leituraUrbana:
      'Essencial para consultas de proprietários e processos de autorização de obras na SPC/DPHAP: traz os números de porta de cada lote e identifica marcos como a Prefeitura, Correio, Sobrado Ousado Carvalho, Portão da Igreja de São Benedito e Tombamento Isolado do Seminário.',
    points: [
      {
        id: 'viana-cad-matriz-prefeitura',
        label: 'Praça, Prefeitura e Correio (QD. 26 a 30)',
        nomeAtual: 'Núcleo Cívico-Religioso de Viana (Insc. #040 e #061)',
        x: 0.415,
        y: 0.468,
        descricao:
          'Conjunto central formado pela Praça, Prefeitura e agência histórica dos Correios, próximo à Praça Duque de Caxias e Igreja Matriz.',
        bemIds: ['040', '061'],
        buscaTombamento: 'Viana'
      },
      {
        id: 'viana-cad-sobrado-ousado',
        label: 'Sobrado Ousado Carvalho e Rua Antônio Lopes',
        nomeAtual: 'Eixo Arquitetônico da Rua Antônio Lopes (QD. 04 a 19)',
        x: 0.254,
        y: 0.525,
        descricao:
          'Alinhamento de sobrados e casas térreas coloniais e oitocentistas ao longo da Rua Antônio Lopes.',
        bemIds: ['040'],
        buscaTombamento: 'Viana'
      },
      {
        id: 'viana-cad-sao-benedito',
        label: 'Praça e Igreja de São Benedito (QD. 14)',
        nomeAtual: 'Setor Leste — Rua São Benedito e Rua Cel. Campelo',
        x: 0.795,
        y: 0.675,
        descricao:
          'Setor leste do mapa cadastral, assinalando a Praça e Igreja de São Benedito (QD. 14).',
        bemIds: ['040'],
        buscaTombamento: 'Viana'
      },
      {
        id: 'viana-cad-seminario',
        label: 'Seminário (Tombamento Isolado)',
        nomeAtual: 'Quadra do Seminário — Extremo Leste',
        x: 0.915,
        y: 0.768,
        descricao:
          'Área demarcada no extremo leste da planta cadastral como Seminário (Tombamento Isolado).',
        bemIds: ['040'],
        buscaTombamento: 'Viana'
      }
    ]
  },
  {
    id: 'caxias-poligonal-tombamento',
    categoria: 'Mapa de Tombamento',
    ano: 'Caxias (Poligonal)',
    epocaLabel: 'Decreto Estadual nº 11.681/1990 · Inscrições #004, #054 e #059',
    municipio: 'Caxias',
    municipiosRelacionados: ['Caxias'],
    titulo: 'Mapa da Poligonal de Tombamento do Centro Histórico de Caxias',
    autor: 'DPHAP / Superintendência do Patrimônio Cultural (SPC/SECMA)',
    fonte: 'Acervo Cartográfico DPHAP/SPC · Decreto Estadual nº 11.681, de 29/11/1990',
    src: '/cena-fotos/MAN_s.d._CAX_MAPS_TOMBAMENTO.jpg',
    srcFull: '/cena-fotos/MAN_s.d._CAX_MAPS_TOMBAMENTO.jpg',
    downloadUrl: '/cena-fotos/MAN_s.d._CAX_MAPS_TOMBAMENTO.pdf',
    formatoDownload: 'PDF Vetorial Colorido + JPG',
    width: 2083,
    height: 2947,
    alt: 'Mapa da poligonal de tombamento do Centro Histórico de Caxias delimitada em linha tracejada vermelha, desde o Rio Itapecuru ao norte até o Cemitério dos Remédios ao sul.',
    resumo:
      'Mapa oficial da poligonal de proteção do Centro Histórico, Arquitetônico e Área Paisagística de Caxias (Decreto Estadual nº 11.681, de 29/11/1990, Inscrição nº 059), delimitada em linha tracejada vermelha desde a curva do Rio Itapecuru e a Estrada de Ferro ao norte até o Cemitério de Nossa Senhora dos Remédios ao sul.',
    leituraUrbana:
      'Abrange o Centro de Cultura, a Praça Dias Carneiro (Panteon), a Catedral e Praça Gonçalves Dias, a Praça Magalhães de Almeida, a Casa de Vespasiano Ramos (Inscrição nº 054) e o acervo remanescente do ciclo têxtil oitocentista (Inscrição nº 004).',
    points: [
      {
        id: 'caxias-centro-cultura-panteon',
        label: 'Centro de Cultura e Praça Dias Carneiro (Panteon)',
        nomeAtual: 'Praça do Panteon e Antiga Indústria Têxtil do Século XIX (Insc. #004 e #059)',
        x: 0.665,
        y: 0.295,
        descricao:
          'Setor norte do Centro Histórico de Caxias, próximo ao Rio Itapecuru e à ferrovia, onde se localizam o Centro de Cultura e a Praça do Panteon (Inscrição nº 004, Decreto nº 7.660/1980).',
        bemIds: ['004', '059'],
        buscaTombamento: 'Caxias'
      },
      {
        id: 'caxias-centro-vespasiano',
        label: 'Núcleo Central — Centro, Rua Aarão Reis e Praça Vespasiano Ramos',
        nomeAtual: 'Casa de Vespasiano Ramos (Insc. #054) e Conjunto Urbano Central (#059)',
        x: 0.560,
        y: 0.400,
        descricao:
          'Coração comercial e literário de Caxias, abrangendo a Casa de Vespasiano Ramos (tombada pelo Decreto nº 11.595/1990, Inscrição nº 054) e o casario oitocentista.',
        bemIds: ['054', '059'],
        buscaTombamento: 'Caxias'
      },
      {
        id: 'caxias-magalhaes-almeida',
        label: 'Praça Magalhães de Almeida e Av. General Sampaio',
        nomeAtual: 'Setor Oeste — Av. General Sampaio e Praça Magalhães de Almeida',
        x: 0.285,
        y: 0.450,
        descricao:
          'Largo histórico situado na porção oeste da poligonal de tombamento estadual de Caxias.',
        bemIds: ['059'],
        buscaTombamento: 'Caxias'
      },
      {
        id: 'caxias-cemiterio-remedios',
        label: 'Largo e Cemitério dos Remédios',
        nomeAtual: 'Extremo Sul da Poligonal — Travessa Santa Isabel',
        x: 0.295,
        y: 0.785,
        descricao:
          'Vértice meridional da poligonal tracejada vermelha de Caxias, protegendo o conjunto histórico do Cemitério e Capela dos Remédios.',
        bemIds: ['059'],
        buscaTombamento: 'Caxias'
      }
    ]
  },
  {
    id: 'carolina-poligonal-tombamento-2010',
    categoria: 'Mapa de Tombamento',
    ano: 'Carolina (Poligonal)',
    epocaLabel: 'Decreto Estadual nº 12.954/1993 · Levantamento de Marcos (2010)',
    municipio: 'Carolina',
    municipiosRelacionados: ['Carolina'],
    titulo: 'Mapa da Poligonal de Tombamento e Marcos Arquitetônicos de Carolina',
    autor: 'DPHAP / Superintendência do Patrimônio Cultural (SPC/SECMA)',
    fonte: 'Acervo Cartográfico DPHAP/SPC (2010) · Decreto Estadual nº 12.954, de 12/02/1993 (Inscrição #063)',
    src: '/cena-fotos/MAN_2010_CAR_TOMBAMENTO_MARCO.jpg',
    srcFull: '/cena-fotos/MAN_2010_CAR_TOMBAMENTO_MARCO.jpg',
    downloadUrl: '/cena-fotos/MAN_2010_CAR_TOMBAMENTO_MARCO.pdf',
    formatoDownload: 'PDF Vetorial de Poligonal + JPG',
    width: 2083,
    height: 2947,
    alt: 'Mapa do Centro Histórico de Carolina com a poligonal de tombamento em linha traço-ponto e 20 imóveis/marcos arquitetônicos destacados em preto.',
    resumo:
      'Planta técnica do Centro Histórico de Carolina (tombado pelo Decreto Estadual nº 12.954, de 12/02/1993, Inscrição nº 063), delimitando em linha traço-ponto a poligonal de preservação ao longo da Avenida Getúlio Vargas, Praça Santo Antônio, Praça Alípio Carvalho e Avenida Elias Barros, além de assinalar 20 edificações de referência.',
    leituraUrbana:
      'Mostra a espinha dorsal urbana de Carolina estruturada pela Avenida Getúlio Vargas (ligando a Praça Santo Antônio à Praça Alípio Carvalho) e a expansão transversal pela Travessa 15 de Novembro, Rua Palmério de Souza e Avenida Elias Barros.',
    points: [
      {
        id: 'carolina-praca-santo-antonio',
        label: 'Praça Santo Antônio e Rua Imperatriz (Marcos 3, 10, 11, 13 e 20)',
        nomeAtual: 'Núcleo Fundacional Norte — Praça Santo Antônio (Insc. #063)',
        x: 0.385,
        y: 0.168,
        descricao:
          'Setor norte da poligonal de tombamento de Carolina, reunindo os imóveis históricos nº 3, 10, 11, 13 e 20 no entorno da Praça Santo Antônio e Rua Imperatriz.',
        bemIds: ['063'],
        buscaTombamento: 'Carolina'
      },
      {
        id: 'carolina-getulio-vargas',
        label: 'Eixo da Avenida Getúlio Vargas e Travessa 15 de Novembro',
        nomeAtual: 'Corredor Histórico Central de Carolina (Insc. #063)',
        x: 0.382,
        y: 0.370,
        descricao:
          'Principal eixo urbano protegido pela poligonal traço-ponto do Decreto Estadual nº 12.954/1993.',
        bemIds: ['063'],
        buscaTombamento: 'Carolina'
      },
      {
        id: 'carolina-praca-alipio-carvalho',
        label: 'Praça Alípio Carvalho e Rua Diógenes Gonçalves (Marcos 1 e 9)',
        nomeAtual: 'Conjunto Cívico da Praça Alípio Carvalho (Insc. #063)',
        x: 0.345,
        y: 0.635,
        descricao:
          'Largo histórico no segmento sul da Avenida Getúlio Vargas, ladeado pelos marcos arquitetônicos nº 1 e 9.',
        bemIds: ['063'],
        buscaTombamento: 'Carolina'
      },
      {
        id: 'carolina-elias-barros-praca',
        label: 'Praça Sul e Avenida Elias Barros (Marcos 8, 14, 16 e 19)',
        nomeAtual: 'Setor Sudeste da Poligonal de Carolina (Insc. #063 e #065)',
        x: 0.635,
        y: 0.812,
        descricao:
          'Extensão sudeste do perímetro tombado de Carolina. O município também abriga os Sítios Arqueológicos do Morro das Araras e Morro das Figuras (Decreto nº 12.956/1993, Inscrição nº 065).',
        bemIds: ['063', '065'],
        buscaTombamento: 'Carolina'
      }
    ]
  },
  {
    id: 'sao-luis-poligonal-fed-est-unesco',
    categoria: 'Mapa de Tombamento',
    ano: 'São Luís (Fed. / Est. / UNESCO)',
    epocaLabel: 'Poligonais Federal, Estadual (Dec. 11.591/1990) e Patrimônio Mundial UNESCO',
    municipio: 'São Luís',
    municipiosRelacionados: ['São Luís'],
    titulo: 'Mapa Oficial das Poligonais de Tombamento — Federal, Estadual e UNESCO (São Luís)',
    autor: 'DPHAP / Superintendência do Patrimônio Cultural (SPC/SECMA)',
    fonte: 'Acervo Cartográfico DPHAP/SPC (2019) · Decretos Estaduais nº 10.089/1986 e nº 11.591/1990',
    src: '/cena-fotos/MAN_2019_SLZ_MAPA_TOMBAMENTO_FED_EST_UNESCO.jpg',
    srcFull: '/cena-fotos/MAN_2019_SLZ_MAPA_TOMBAMENTO_FED_EST_UNESCO.jpg',
    downloadUrl: '/cena-fotos/MAN_2019_SLZ_MAPA_TOMBAMENTO_FED_EST_UNESCO.pdf',
    formatoDownload: 'PDF Vetorial de Alta Precisão + JPG',
    width: 2800,
    height: 1981,
    alt: 'Mapa oficial do Centro Histórico de São Luís delimitando simultaneamente a área de tombamento estadual, o perímetro de tombamento federal (IPHAN) e a área inscrita como Patrimônio Mundial pela UNESCO.',
    resumo:
      'Prancha técnica vetorial do DPHAP/SPC que sobrepõe, sobre a base cartográfica entre os rios Anil e Bacanga, o perímetro da Área Tombada pelo Governo Estadual (Decreto nº 11.591/1990), o Tombamento Federal (IPHAN) e a Área Inscrita como Patrimônio Mundial pela UNESCO.',
    leituraUrbana:
      'Permite a arquitetos, proprietários e técnicos identificar rapidamente se um lote no Centro Histórico de São Luís está sob tutela estadual, federal ou de dupla proteção (Estadual + IPHAN/UNESCO).',
    points: [
      {
        id: 'slz-fed-est-praia-grande',
        label: 'Núcleo Praia Grande / UNESCO e Tombamento Federal',
        nomeAtual: 'Praia Grande, Rua Portugal e Av. Pedro II (Insc. #037 e #050)',
        x: 0.255,
        y: 0.305,
        descricao:
          'Setor central em amarelo: sobreposição entre a Área Inscrita pela UNESCO, o tombamento federal (IPHAN) e o tombamento estadual do Centro Histórico.',
        bemIds: ['037', '050'],
        buscaTombamento: 'Praia Grande'
      },
      {
        id: 'slz-fed-est-nucleo-laranja',
        label: 'Transição Largo do Carmo / Rua Grande (Decs. 10.089 e 11.591)',
        nomeAtual: 'Setor de Sobreposição Estadual — Centro (Insc. #037 e #050)',
        x: 0.365,
        y: 0.295,
        descricao:
          'Trecho em laranja abrangido simultaneamente pelos Decretos Estaduais nº 10.089/1986 e nº 11.591/1990.',
        bemIds: ['037', '050'],
        buscaTombamento: 'Centro Histórico'
      },
      {
        id: 'slz-fed-est-desterro',
        label: 'Desterro e Margem do Rio Bacanga',
        nomeAtual: 'Bairro do Desterro e Portinho (Insc. #037 e #050)',
        x: 0.270,
        y: 0.545,
        descricao:
          'Porção sul do núcleo colonial voltada ao Rio Bacanga, abrangendo o bairro histórico do Desterro e entorno.',
        bemIds: ['037', '050'],
        buscaTombamento: 'Desterro'
      },
      {
        id: 'slz-fed-est-expansao-estadual',
        label: 'Área de Abrangência Estadual (Decreto nº 10.089/1986)',
        nomeAtual: 'Perímetro Ampliado de Tombamento Estadual — Centro, Apicum e Lira',
        x: 0.455,
        y: 0.420,
        descricao:
          'Poligonal em rosa protegida pelo Governo Estadual (Decreto nº 10.089/1986), envolvendo os bairros históricos adjacentes ao núcleo federal.',
        bemIds: ['037', '050', '056'],
        buscaTombamento: 'Centro Histórico'
      }
    ]
  },
  {
    id: 'sao-luis-setorizacao-ch',
    categoria: 'Mapa de Tombamento',
    ano: 'São Luís (Setorização)',
    epocaLabel: 'Gestão Técnica DPHAP · Setores 1 a 5 do Centro Histórico',
    municipio: 'São Luís',
    municipiosRelacionados: ['São Luís'],
    titulo: 'Mapa de Setorização do Centro Histórico de São Luís (Setores 1 a 5)',
    autor: 'DPHAP / Superintendência do Patrimônio Cultural (SPC/SECMA)',
    fonte: 'Acervo Cartográfico DPHAP/SPC (2018) · Base Cadastral de Quadras do Centro Histórico',
    src: '/cena-fotos/MAN_2018_SLZ_SETORIZACAO_CH.jpg',
    srcFull: '/cena-fotos/MAN_2018_SLZ_SETORIZACAO_CH.jpg',
    downloadUrl: '/cena-fotos/MAN_2018_SLZ_SETORIZACAO_CH.pdf',
    formatoDownload: 'PDF Vetorial de Quadras + JPG',
    width: 2800,
    height: 1978,
    alt: 'Planta cadastral do Centro Histórico de São Luís dividida em cinco setores numerados (Setor 1 a Setor 5) com numeração individual de quadras.',
    resumo:
      'Mapa cadastral de quadras que divide o Centro Histórico de São Luís em cinco setores técnicos (Setor 1 a Setor 5), utilizado pelo DPHAP para fiscalização, vistorias e organização dos processos de análise arquitetônica.',
    leituraUrbana:
      'A numeração sequencial de quadras facilita a localização exata de imóveis em processos de certidão de poligonal, projetos de intervenção e vistorias de campo.',
    points: [
      {
        id: 'slz-setor-praia-grande',
        label: 'Núcleo Praia Grande / Centro (Quadras 01 a 164)',
        nomeAtual: 'Praia Grande, Centro Cívico e Desterro',
        x: 0.255,
        y: 0.295,
        descricao:
          'Quadras cadastrais do núcleo fundacional oeste (Praia Grande, Av. Pedro II e Largo do Carmo).',
        bemIds: ['037', '044', '050'],
        buscaTombamento: 'Centro Histórico'
      },
      {
        id: 'slz-setor-1-2',
        label: 'Setores 1 (Verde) e 2 (Azul) — Faixa Norte',
        nomeAtual: 'Quadras Norte do Centro Histórico (próximo ao Rio Anil)',
        x: 0.435,
        y: 0.235,
        descricao:
          'Setores técnicos 1 e 2 na porção norte-nordeste do Centro Histórico de São Luís.',
        bemIds: ['050'],
        buscaTombamento: 'São Luís'
      },
      {
        id: 'slz-setor-3',
        label: 'Setor 3 (Ciano) — Faixa Central',
        nomeAtual: 'Quadras Centrais de Transição (Quadras 112 a 156)',
        x: 0.425,
        y: 0.435,
        descricao:
          'Setor técnico 3 no eixo central da poligonal estadual de São Luís.',
        bemIds: ['050', '056'],
        buscaTombamento: 'São Luís'
      },
      {
        id: 'slz-setor-4-5',
        label: 'Setores 4 (Magenta) e 5 (Vermelho) — Faixa Sul',
        nomeAtual: 'Quadras Sul — Madre Deus, Lira e Entorno do Bacanga',
        x: 0.450,
        y: 0.600,
        descricao:
          'Setores técnicos 4 e 5 cobrindo a porção meridional da área protegida estadual.',
        bemIds: ['050'],
        buscaTombamento: 'São Luís'
      }
    ]
  },
  {
    id: 'sao-luis-estilos-arquitetonicos',
    categoria: 'Mapa de Tombamento',
    ano: 'São Luís (Estilos Arquitetônicos)',
    epocaLabel: 'Levantamento Tipológico · Escala 1:3.000',
    municipio: 'São Luís',
    municipiosRelacionados: ['São Luís'],
    titulo: 'Levantamento de Estilos Arquitetônicos do Centro Histórico de São Luís',
    autor: 'Prefeitura de São Luís (Instituto da Cidade) / Acervo DPHAP (SPC/SECMA)',
    fonte: 'Levantamento Urbanístico do Centro Histórico de São Luís — Estilo Arquitetônico · Escala 1:3.000',
    src: '/cena-fotos/MAN_s.d._SLZ_ESTILOS_ARQUITETONICOS.jpg',
    srcFull: '/cena-fotos/MAN_s.d._SLZ_ESTILOS_ARQUITETONICOS.jpg',
    downloadUrl: '/cena-fotos/MAN_s.d._SLZ_ESTILOS_ARQUITETONICOS.pdf',
    formatoDownload: 'PDF Vetorial Temático (1:3.000) + JPG',
    width: 2800,
    height: 1981,
    alt: 'Mapa temático em escala 1:3.000 classificando os imóveis do Centro Histórico de São Luís por estilo arquitetônico: Tradicional Português, Neoclássico, Eclético, Neocolonial, Art Déco e Moderno.',
    resumo:
      'Prancha temática em escala 1:3.000 que classifica lote a lote o acervo edificado do Centro Histórico de São Luís segundo seis matrizes estilísticas: Tradicional Português, Neoclássico, Eclético, Neocolonial, Art Déco e Moderno.',
    leituraUrbana:
      'Ferramenta fundamental de apoio ao Manual de Tipologias e Preservação do DPHAP, evidenciando a predominância do casario luso-brasileiro no núcleo da Praia Grande e a diversidade eclética e art déco nos eixos comerciais.',
    points: [
      {
        id: 'slz-estilo-portugues',
        label: 'Núcleo Tradicional Português (Cinza)',
        nomeAtual: 'Casario Colonial e Azulejado da Praia Grande e Desterro',
        x: 0.155,
        y: 0.405,
        descricao:
          'Maior concentração contínua de sobrados, moradas inteiras e meias-moradas de matriz tradicional portuguesa em São Luís.',
        bemIds: ['037', '050'],
        buscaTombamento: 'Sobrado'
      },
      {
        id: 'slz-estilo-ecletico-artdeco',
        label: 'Eixos Eclético, Neoclássico e Art Déco',
        nomeAtual: 'Rua Grande, Praça João Lisboa e Centro Expandido',
        x: 0.315,
        y: 0.335,
        descricao:
          'Corredores urbanos onde se destacam exemplares ecléticos, neoclássicos, neocoloniais e art déco do início do século XX.',
        bemIds: ['049', '050'],
        buscaTombamento: 'Edifício'
      },
      {
        id: 'slz-estilo-sul',
        label: 'Setor Sul — Predominância de Intervenções Modernas',
        nomeAtual: 'Porção Meridional da Área de Entorno (Madre Deus / Lira)',
        x: 0.345,
        y: 0.610,
        descricao:
          'Setor sul do levantamento tipológico com mescla de edificações tradicionais e inserções contemporâneas.',
        bemIds: ['050'],
        buscaTombamento: 'São Luís'
      }
    ]
  },
  {
    id: 'alcantara-mapa-cidade',
    categoria: 'Mapa de Tombamento',
    ano: 'Alcântara (Mapa Geral)',
    epocaLabel: 'Decreto Estadual nº 11.683/1990 · Planta 1:5000 (DPHAP)',
    municipio: 'Alcântara',
    municipiosRelacionados: ['Alcântara'],
    titulo: 'Mapa Geral da Cidade de Alcântara — Malha Urbana e Nomenclatura de Ruas',
    autor: 'DPHAP / Secretaria de Cultura do Estado do Maranhão',
    fonte: 'Acervo Cartográfico DPHAP/SPC — Planta da Cidade (Escala 1:5000) · Insc. #013, #017, #018 e #060',
    src: '/cena-fotos/MAN_s.d._ALC_MAPA_CIDADE.jpg',
    srcFull: '/cena-fotos/MAN_s.d._ALC_MAPA_CIDADE.jpg',
    downloadUrl: '/cena-fotos/MAN_s.d._ALC_MAPA_CIDADE.pdf',
    formatoDownload: 'PDF Prancha 1:5000 (21,1 MB) + JPG',
    width: 2800,
    height: 2043,
    alt: 'Planta da cidade de Alcântara em escala 1:5000 com nomenclatura primitiva de ruas, legenda bilíngue português-francês, Foz do Rio Ferijó, Ilha do Livramento e Baía de São Marcos.',
    resumo:
      'Prancha cartográfica histórica da Secretaria de Cultura/DPHAP em escala 1:5000 com a malha urbana completa de Alcântara, nomenclatura primitiva de 32 logradouros e legenda bilíngue (português/francês) de 21 monumentos e marcos.',
    leituraUrbana:
      'Complementa o mapa de monumentos do Sítio Histórico (Decreto Estadual nº 11.683/1990) ao situar o núcleo colonial em relação ao Porto do Jacaré, Foz do Rio Ferijó, Ilha do Livramento e Baía de São Marcos.',
    points: [
      {
        id: 'alc-cidade-nucleo',
        label: 'Largo da Matriz, Pelourinho e Rua Grande',
        nomeAtual: 'Núcleo Central do Sítio Histórico de Alcântara (Insc. #013, #017, #018 e #060)',
        x: 0.375,
        y: 0.555,
        descricao:
          'Coração urbano protegido pelo Decreto Estadual nº 11.683/1990, reunindo a Matriz de São Matias, Casa de Câmara e Cadeia, Pelourinho e Rua Grande.',
        bemIds: ['013', '017', '018', '060'],
        buscaTombamento: 'Alcântara'
      },
      {
        id: 'alc-cidade-porto-jacare',
        label: 'Porto e Praia do Jacaré / Igarapé',
        nomeAtual: 'Setor Oeste — Acesso Portuário Histórico de Alcântara',
        x: 0.270,
        y: 0.550,
        descricao:
          'Acesso histórico de desembarque na margem do igarapé, articulando a Ladeira do Jacaré ao centro monumental.',
        bemIds: ['060'],
        buscaTombamento: 'Alcântara'
      },
      {
        id: 'alc-cidade-largo-carmo',
        label: 'Largo do Carmo e Expansão Norte',
        nomeAtual: 'Setor Norte — Convento do Carmo e Rua da Quinta',
        x: 0.405,
        y: 0.445,
        descricao:
          'Porção norte da malha urbana representada na planta 1:5000, abrangendo o entorno do Carmo e vias de expansão.',
        bemIds: ['060'],
        buscaTombamento: 'Alcântara'
      },
      {
        id: 'alc-cidade-ilha-livramento',
        label: 'Ilha do Livramento e Foz do Rio Ferijó',
        nomeAtual: 'Paisagem Costeira da Baía de São Marcos',
        x: 0.220,
        y: 0.855,
        descricao:
          'Ilha do Livramento na desembocadura do Rio Ferijó, elemento marcante da moldura paisagística de Alcântara.',
        bemIds: ['060'],
        buscaTombamento: 'Alcântara'
      }
    ]
  },
  {
    id: 'sao-jose-de-ribamar-poligonal',
    categoria: 'Mapa de Tombamento',
    ano: 'São José de Ribamar (Estudo)',
    epocaLabel: 'Parecer Técnico DPHAP nº 025/2023 · SIRGAS 2000 UTM 23S',
    municipio: 'São José de Ribamar',
    municipiosRelacionados: ['São José de Ribamar'],
    titulo: 'Conjunto Arquitetônico e Urbanístico de São José de Ribamar — Poligonais de Tombamento e Entorno',
    autor: 'DPHAP / Superintendência do Patrimônio Cultural (Aryanne da Silva Firmino, 04/2023)',
    fonte: 'Acervo Cartográfico DPHAP/SPC (04/2023) · Base IBGE 2020 · Parecer Técnico nº 025/2023',
    src: '/cena-fotos/MAN_2023_SJR_MAPA_TOMBAMENTO.jpg',
    srcFull: '/cena-fotos/MAN_2023_SJR_MAPA_TOMBAMENTO.jpg',
    downloadUrl: '/cena-fotos/MAN_2023_SJR_MAPA_TOMBAMENTO.pdf',
    formatoDownload: 'PDF Técnico Georreferenciado + JPG',
    width: 2526,
    height: 1785,
    alt: 'Mapa georreferenciado (SIRGAS 2000 UTM 23S) do Conjunto Arquitetônico e Urbanístico de São José de Ribamar delimitando a Área Tombada e o Entorno Imediato, com destaque para a Igreja Matriz, Praça da Matriz e Monumento de São José de Ribamar.',
    resumo:
      'Mapa técnico georreferenciado (SIRGAS 2000, Zona 23S) das poligonais de tombamento e entorno imediato do Conjunto Arquitetônico e Urbanístico de São José de Ribamar, abrangendo a Igreja Matriz, Praça da Matriz, Monumento de São José de Ribamar e Gruta de Nossa Senhora de Lourdes (estudo técnico vinculado ao Parecer DPHAP nº 025/2023).',
    leituraUrbana:
      'Delimita o perímetro nuclear do santuário ribamarense (em salmão) e a faixa tracejada de entorno imediato voltada à orla e ao cais, servindo de base cartográfica para a instrução técnica de preservação do complexo.',
    points: [
      {
        id: 'sjr-igreja-matriz',
        label: 'Igreja Matriz de São José de Ribamar',
        nomeAtual: 'Santuário da Igreja Matriz (Área Tombada)',
        x: 0.345,
        y: 0.445,
        descricao:
          'Edificação principal do conjunto religioso na cabeceira norte da Praça da Matriz, inserida na poligonal da Área Tombada.',
        buscaTombamento: 'Ribamar'
      },
      {
        id: 'sjr-praca-matriz',
        label: 'Praça da Matriz',
        nomeAtual: 'Eixo Central da Praça da Matriz (Área Tombada)',
        x: 0.362,
        y: 0.525,
        descricao:
          'Espaço público linear em destaque verde que conecta a Igreja Matriz ao conjunto monumental voltado à baía.',
        buscaTombamento: 'Ribamar'
      },
      {
        id: 'sjr-monumento-gruta',
        label: 'Monumento de São José de Ribamar e Gruta de N. Sra. de Lourdes',
        nomeAtual: 'Extremo Sul da Área Tombada — Monumento e Gruta',
        x: 0.431,
        y: 0.642,
        descricao:
          'Marco monumental circular e Gruta de Nossa Senhora de Lourdes na extremidade sul da poligonal de tombamento, voltados à orla.',
        buscaTombamento: 'Ribamar'
      },
      {
        id: 'sjr-entorno-imediato',
        label: 'Poligonal de Entorno Imediato ao Tombamento',
        nomeAtual: 'Quadras Históricas do Entorno Imediato',
        x: 0.290,
        y: 0.345,
        descricao:
          'Perímetro tracejado de entorno imediato que envolve o casario e as vias adjacentes ao santuário.',
        buscaTombamento: 'Ribamar'
      }
    ]
  }
];

/**
 * Retorna todos os mapas de tombamento vinculados a um determinado município
 * (ex.: 'São Luís', 'Alcântara', 'Viana', 'Caxias', 'Carolina').
 */
export function getMapasTombamentoPorMunicipio(municipio: string): MapaHistorico[] {
  return MAPAS_HISTORICOS.filter(
    (m) => m.categoria === 'Mapa de Tombamento' && m.municipiosRelacionados.includes(municipio)
  );
}

/**
 * Retorna todos os mapas (históricos + de tombamento) relacionados a um município.
 */
export function getTodosMapasPorMunicipio(municipio: string): MapaHistorico[] {
  return MAPAS_HISTORICOS.filter((m) => m.municipiosRelacionados.includes(municipio));
}
