export type LegalDocumentCategory =
  | 'Lei'
  | 'Decreto'
  | 'Portaria'
  | 'Instrução Normativa'
  | 'Resolução'
  | 'Diretriz'
  | 'Manual'
  | 'Outro';

export type LegalDocumentScope = 'Estadual' | 'Federal' | 'Municipal' | 'SPC';

export type LegalSourceKind =
  | 'official-online'
  | 'official-gazette-copy'
  | 'institutional-copy'
  | 'institutional-guidance';

export interface PublicLegalDocument {
  id: string;
  title: string;
  category: LegalDocumentCategory;
  scope: LegalDocumentScope;
  date: string;
  description: string;
  didacticExplanation?: string;
  practicalApplication?: string;
  issuer: string;
  sourceLabel: string;
  sourceUrl: string;
  sourceKind: LegalSourceKind;
  alternateSourceLabel?: string;
  alternateSourceUrl?: string;
  format: 'HTML' | 'PDF' | 'Imagem' | 'Outro';
  tags: string[];
  officialPublication?: string;
  validationNote?: string;
  verifiedAt: string;
  featured?: boolean;
  status?: 'published';
}

/**
 * Coleção organizada cronologicamente por ordem de criação.
 * Referências conferidas em fontes oficiais com explicação didática do impacto de cada norma.
 */
export const PUBLIC_LEGAL_DOCUMENTS: PublicLegalDocument[] = [
  {
    id: 'br-decreto-lei-25-1937',
    title: 'Decreto-Lei nº 25, de 30 de novembro de 1937',
    category: 'Decreto',
    scope: 'Federal',
    date: '1937-11-30',
    description: 'Organiza a proteção do patrimônio histórico e artístico nacional e disciplina o tombamento no Brasil.',
    didacticExplanation: 'É a lei-mãe do patrimônio cultural brasileiro. Foi ela que instituiu o instituto do tombamento, os quatro Livros do Tombo e a obrigação de preservação de bens de valor histórico, artístico e arqueológico.',
    practicalApplication: 'Define que nenhum bem tombado pode ser destruído, demolido ou mutilado, nem sofrer reparação ou pintura sem prévia autorização do órgão competente, além de estabelecer a área de proteção de entorno.',
    issuer: 'Presidência da República',
    sourceLabel: 'Presidência da República — Planalto',
    sourceUrl: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del0025.htm',
    sourceKind: 'official-online',
    format: 'HTML',
    tags: ['Tombamento', 'Patrimônio material', 'Livros do Tombo', 'Marco federal'],
    officialPublication: 'DOU de 06/12/1937; republicado em 11/12/1937',
    verifiedAt: '2026-08-28',
    featured: true,
    status: 'published'
  },
  {
    id: 'ma-decreto-10089-1986',
    title: 'Decreto Estadual nº 10.089, de 6 de março de 1986',
    category: 'Decreto',
    scope: 'Estadual',
    date: '1986-03-06',
    description: 'Tomba o conjunto histórico, arquitetônico e paisagístico do Centro Urbano de São Luís, com delimitação do perímetro e mapa anexo.',
    didacticExplanation: 'Marco fundamental da preservação estadual de São Luís. Estabeleceu formalmente pelo Governo do Maranhão a primeira grande poligonal contínua de proteção de todo o núcleo colonial da capital.',
    practicalApplication: 'Determina quais ruas, casarões, largos e becos do Centro Urbano estão sob tutela do Estado, exigindo projeto aprovado pela SPC para qualquer intervenção ou reforma nas fachadas e coberturas.',
    issuer: 'Estado do Maranhão',
    sourceLabel: 'Acervo SPC — Diário Oficial do Estado do Maranhão',
    sourceUrl: '/documentos/legislacao/decreto-estadual-10089-1986-doe.pdf',
    sourceKind: 'official-gazette-copy',
    format: 'PDF',
    tags: ['Centro Histórico de São Luís', 'Tombamento estadual', 'Perímetro', 'Mapa'],
    officialPublication: 'DOE/MA nº 240, de 15/12/1986',
    validationNote: 'O ato é datado de 06/03/1986 e a cópia localizada corresponde à publicação de 15/12/1986.',
    verifiedAt: '2026-08-28',
    featured: true,
    status: 'published'
  },
  {
    id: 'br-constituicao-arts-215-216',
    title: 'Constituição Federal — artigos 215 e 216',
    category: 'Lei',
    scope: 'Federal',
    date: '1988-10-05',
    description: 'Base constitucional dos direitos culturais e da proteção do patrimônio cultural brasileiro, material e imaterial.',
    didacticExplanation: 'O alicerce supremo de todo o direito patrimonial brasileiro. A Carta de 1988 consagrou que o patrimônio cultural abrange bens de natureza material e imaterial de todos os grupos formadores da sociedade brasileira.',
    practicalApplication: 'Obriga o Poder Público (União, Estado do Maranhão e Municípios), com a colaboração da comunidade, a promover e proteger o patrimônio por meio de inventários, registros, vigilância, tombamento e desapropriação.',
    issuer: 'República Federativa do Brasil',
    sourceLabel: 'Presidência da República — Planalto',
    sourceUrl: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicaocompilado.htm#art215',
    sourceKind: 'official-online',
    format: 'HTML',
    tags: ['Direitos culturais', 'Patrimônio material', 'Patrimônio imaterial', 'Base constitucional'],
    officialPublication: 'Constituição da República Federativa do Brasil de 1988',
    verifiedAt: '2026-08-28',
    featured: true,
    status: 'published'
  },
  {
    id: 'ma-decreto-11591-1990',
    title: 'Decreto Estadual nº 11.591, de 12 de outubro de 1990',
    category: 'Decreto',
    scope: 'Estadual',
    date: '1990-10-12',
    description: 'Dispõe sobre o tombamento da área do Centro Histórico de São Luís e descreve o perímetro protegido.',
    didacticExplanation: 'Decreto estadual que aprimorou a definição do perímetro e detalhou os limites de proteção de bairros vitais como Praia Grande, Desterro e proximidades, consolidando o tombamento pelo Maranhão.',
    practicalApplication: 'Serve de base geográfica e legal para conferência de limites de imóveis situados na área protegida do Centro Histórico e emissão de certidões de enquadramento na poligonal.',
    issuer: 'Estado do Maranhão',
    sourceLabel: 'Acervo SPC — recorte do Diário Oficial do Estado',
    sourceUrl: '/documentos/legislacao/decreto-estadual-11591-1990-doe.pdf',
    sourceKind: 'official-gazette-copy',
    format: 'PDF',
    tags: ['Centro Histórico de São Luís', 'Tombamento', 'Praia Grande', 'Desterro'],
    officialPublication: 'DOE/MA de 24/10/1990',
    validationNote: 'O recorte do Diário Oficial também contém atos adjacentes da mesma edição.',
    verifiedAt: '2026-08-28',
    featured: true,
    status: 'published'
  },
  {
    id: 'ma-decreto-11593-1990',
    title: 'Decreto Estadual nº 11.593, de 12 de outubro de 1990',
    category: 'Decreto',
    scope: 'Estadual',
    date: '1990-10-12',
    description: 'Tomba espécies isoladas de árvores raras e reserva biológica de São Luís e apresenta a relação anexa das espécies e localizações.',
    didacticExplanation: 'Norma pioneira de patrimônio ambiental e paisagístico. Reconheceu espécimes arbóreos centenários e remanescentes de reservas como patrimônio natural do Estado do Maranhão.',
    practicalApplication: 'Impede o corte, poda drástica ou remoção de árvores históricas tombadas sem autorização prévia da SPC e dos órgãos ambientais competentes.',
    issuer: 'Estado do Maranhão',
    sourceLabel: 'Acervo SPC — cópia institucional assinada',
    sourceUrl: '/documentos/legislacao/decreto-estadual-11593-1990-arvores.pdf',
    sourceKind: 'institutional-copy',
    format: 'PDF',
    tags: ['Patrimônio natural', 'Árvores raras', 'Reserva biológica', 'São Luís'],
    officialPublication: 'DOE/MA de 24/10/1990',
    validationNote: 'Cópia assinada acompanhada da relação anexa oficial do acervo da SPC.',
    verifiedAt: '2026-08-28',
    status: 'published'
  },
  {
    id: 'ma-lei-5082-1990',
    title: 'Lei Estadual nº 5.082, de 20 de dezembro de 1990',
    category: 'Lei',
    scope: 'Estadual',
    date: '1990-12-20',
    description: 'Dispõe sobre a proteção do patrimônio cultural do Estado do Maranhão e dá outras providências.',
    didacticExplanation: 'A Lei Geral do Patrimônio Cultural do Estado do Maranhão. É a espinha dorsal normativa estadual que disciplina o Livro de Tombo, as competências do DPHAP/SPC e as sanções contra danos ao patrimônio maranhense.',
    practicalApplication: 'Estipula os deveres civis e administrativos de proprietários e possuidores de imóveis tombados, tornando obrigatório submeter qualquer projeto de restauração, reforma ou demolição à chancela da SPC.',
    issuer: 'Estado do Maranhão',
    sourceLabel: 'Acervo SPC — Diário Oficial do Estado do Maranhão',
    sourceUrl: '/documentos/legislacao/lei-estadual-5082-1990-doe.pdf',
    sourceKind: 'official-gazette-copy',
    alternateSourceLabel: 'Consultar também compilação oficial do IPHAN',
    alternateSourceUrl: 'https://portal.iphan.gov.br/uploads/ckfinder/arquivos/Patrimonio_Imaterial_no_Brasil_Legislacao_e_Politicas_Estaduais%281%29.pdf#page=167',
    format: 'PDF',
    tags: ['Proteção estadual', 'Lei Geral', 'Tombamento', 'Maranhão'],
    officialPublication: 'DOE/MA nº 247, de 28/12/1990, p. 9',
    validationNote: 'Digitalização oficial do Diário Oficial conferida página a página no acervo da SPC.',
    verifiedAt: '2026-08-28',
    featured: true,
    status: 'published'
  },
  {
    id: 'ma-decreto-12350-1992',
    title: 'Decreto Estadual nº 12.350, de 26 de março de 1992',
    category: 'Decreto',
    scope: 'Estadual',
    date: '1992-03-26',
    description: 'Regulamenta a Lei nº 5.082/1990 e disciplina embargo, fiscalização e multas no patrimônio cultural do Maranhão.',
    didacticExplanation: 'O manual executivo da fiscalização da SPC. Regulamenta como os fiscais e técnicos estaduais atuam ao constatar obras irregulares, fixando o rito formal de notificações, embargos e autos de infração.',
    practicalApplication: 'Estabelece que obras iniciadas sem alvará da SPC em bens protegidos podem ser imediatamente embargadas e interditadas, sujeitando os infratores a penalidades administrativas.',
    issuer: 'Estado do Maranhão',
    sourceLabel: 'Acervo SPC — Diário Oficial do Estado do Maranhão',
    sourceUrl: '/documentos/legislacao/decreto-estadual-12350-1992-doe.pdf',
    sourceKind: 'official-gazette-copy',
    format: 'PDF',
    tags: ['Regulamentação', 'Embargo', 'Multas', 'Fiscalização estadual'],
    officialPublication: 'DOE/MA de 27/03/1992',
    validationNote: 'Digitalização do Diário Oficial conferida no acervo institucional.',
    verifiedAt: '2026-08-28',
    featured: true,
    status: 'published'
  },
  {
    id: 'slz-lei-3392-1995',
    title: 'Lei Municipal nº 3.392, de 4 de julho de 1995',
    category: 'Lei',
    scope: 'Municipal',
    date: '1995-07-04',
    description: 'Dispõe sobre a proteção do patrimônio cultural do Município de São Luís e dá outras providências.',
    didacticExplanation: 'Marco fundamental da preservação no âmbito da Prefeitura de São Luís. Instituiu a política municipal de tombamento e conservação dos bens de interesse local.',
    practicalApplication: 'Complementa a legislação estadual e federal no território da capital, regulando licenças municipais, incentivos e regras de preservação para o parque imobiliário ludovicense.',
    issuer: 'Município de São Luís',
    sourceLabel: 'GEPFS / UFMA — Texto da Lei nº 3.392 (PDF)',
    sourceUrl: 'https://gepfs.ufma.br/wp-content/uploads/2022/01/LEI-3392.pdf',
    sourceKind: 'official-online',
    format: 'PDF',
    tags: ['Proteção municipal', 'Tombamento', 'São Luís', 'Patrimônio cultural'],
    officialPublication: 'Diário Oficial do Município de São Luís, 10/07/1995',
    validationNote: 'Texto completo disponibilizado pelo repositório acadêmico do Grupo de Estudos e Pesquisas em Filosofia e Sociedade (GEPFS/UFMA).',
    verifiedAt: '2026-11-04',
    featured: true,
    status: 'published'
  },
  {
    id: 'br-decreto-3551-2000',
    title: 'Decreto nº 3.551, de 4 de agosto de 2000',
    category: 'Decreto',
    scope: 'Federal',
    date: '2000-08-04',
    description: 'Institui o Registro de Bens Culturais de Natureza Imaterial e cria o Programa Nacional do Patrimônio Imaterial (PNPI).',
    didacticExplanation: 'Revolucionou a preservação no Brasil ao criar a sistemática de registro de bens imateriais (tradições, saberes, modos de fazer e celebrações populares), superando o foco exclusivo em edifícios de pedra e cal.',
    practicalApplication: 'Base jurídica para o reconhecimento e salvaguarda de manifestações vivas como o Bumba Meu Boi, o Tambor de Crioula e a culinária tradicional, instituindo os Livros de Registro e planos de salvaguarda.',
    issuer: 'Presidência da República',
    sourceLabel: 'Presidência da República — Planalto',
    sourceUrl: 'https://www.planalto.gov.br/ccivil_03/decreto/d3551.htm',
    sourceKind: 'official-online',
    format: 'HTML',
    tags: ['Patrimônio imaterial', 'Registro', 'Salvaguarda', 'PNPI'],
    officialPublication: 'DOU de 07/08/2000',
    validationNote: 'Ementa, data e publicação conferidas no portal oficial do Planalto.',
    verifiedAt: '2026-10-13',
    status: 'published'
  },
  {
    id: 'iphan-portaria-289-2025',
    title: 'Portaria IPHAN nº 289, de 3 de novembro de 2025',
    category: 'Portaria',
    scope: 'Federal',
    date: '2025-11-03',
    description: 'Dispõe sobre os procedimentos para autorização de intervenções em bens imóveis e integrados tombados e no entorno.',
    didacticExplanation: 'Norma técnica federal recente que modernizou os ritos de aprovação de projetos arquitetônicos em bens tombados, simplificando exigências para serviços de conservação e manutenção.',
    practicalApplication: 'Serve de parâmetro de referência técnica para arquitetos, engenheiros e órgãos de patrimônio (como a SPC) na instrução e tramitação de requerimentos de obras.',
    issuer: 'Instituto do Patrimônio Histórico e Artístico Nacional',
    sourceLabel: 'IPHAN — texto oficial',
    sourceUrl: 'https://www.gov.br/iphan/pt-br/centrais-de-conteudo/legislacao/atos-normativos/2025/portaria-iphan-no-289-de-3-de-novembro-de-2025',
    sourceKind: 'official-online',
    format: 'HTML',
    tags: ['Intervenção', 'Autorização', 'Bens tombados', 'Entorno', 'Projetos'],
    featured: true,
    validationNote: 'Texto oficial do IPHAN conferido.',
    verifiedAt: '2026-10-13',
    status: 'published'
  },
  {
    id: 'spc-diretrizes-engenhos-publicitarios',
    title: 'Diretrizes para instalação de engenhos publicitários no Centro Histórico de São Luís',
    category: 'Diretriz',
    scope: 'SPC',
    date: '2026-01-01',
    description: 'Cartilha e diretrizes normativas para instalação de placas, letreiros, toldos e engenhos de propaganda em áreas protegidas.',
    didacticExplanation: 'Manual prático e obrigatório formulado pela SPC/DPHAP para lojistas, empresários e proprietários. Evita a poluição visual e a degradação das fachadas históricas com placas desproporcionais.',
    practicalApplication: 'Estabelece as medidas exatas, materiais autorizados (madeira, ferro, pintura tradicional) e proíbe letreiros luminosos excessivos ou que obstruam azulejos e cantarias.',
    issuer: 'DPHAP — Superintendência do Patrimônio Cultural do Maranhão',
    sourceLabel: 'DPHAP/SPC — cartilha institucional',
    sourceUrl: '/documentos/legislacao/diretrizes-dphap-engenhos-publicitarios.pdf',
    sourceKind: 'institutional-guidance',
    format: 'PDF',
    tags: ['Engenhos publicitários', 'Fachadas', 'Centro Histórico', 'Orientação prática'],
    validationNote: 'Diretriz técnica em vigor aplicada pelos setores de fiscalização e projetos da SPC.',
    verifiedAt: '2026-08-28',
    status: 'published'
  }
];
