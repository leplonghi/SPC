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
 * Coleção inicial composta apenas por referências localizadas em fontes
 * governamentais. A presença no catálogo não equivale a parecer de vigência:
 * essa confirmação continua sendo responsabilidade do órgão competente.
 */
export const PUBLIC_LEGAL_DOCUMENTS: PublicLegalDocument[] = [
  {
    id: 'ma-lei-5082-1990',
    title: 'Lei Estadual nº 5.082, de 20 de dezembro de 1990',
    category: 'Lei',
    scope: 'Estadual',
    date: '1990-12-20',
    description: 'Dispõe sobre a proteção do patrimônio cultural do Estado do Maranhão e dá outras providências.',
    issuer: 'Estado do Maranhão',
    sourceLabel: 'Acervo SPC — Diário Oficial do Estado do Maranhão',
    sourceUrl: '/documentos/legislacao/lei-estadual-5082-1990-doe.pdf',
    sourceKind: 'official-gazette-copy',
    alternateSourceLabel: 'Consultar também a compilação oficial do IPHAN',
    alternateSourceUrl: 'https://portal.iphan.gov.br/uploads/ckfinder/arquivos/Patrimonio_Imaterial_no_Brasil_Legislacao_e_Politicas_Estaduais%281%29.pdf#page=167',
    format: 'PDF',
    tags: ['Proteção estadual', 'Tombamento', 'Patrimônio cultural', 'Maranhão'],
    officialPublication: 'DOE/MA nº 247, de 28/12/1990, p. 9',
    validationNote: 'Digitalização do Diário Oficial conferida. Vigência e alterações posteriores ainda devem ser confirmadas pelo órgão competente.',
    verifiedAt: '2026-08-28',
    featured: true,
    status: 'published'
  },
  {
    id: 'ma-lei-5205-1991',
    title: 'Lei Estadual nº 5.205, de 11 de outubro de 1991',
    category: 'Lei',
    scope: 'Estadual',
    date: '1991-10-11',
    description: 'Dá nova redação ao artigo 29 da Lei nº 5.082/1990 e atualiza as multas administrativas aplicáveis às infrações contra o patrimônio cultural.',
    issuer: 'Estado do Maranhão',
    sourceLabel: 'Acervo SPC — Diário Oficial do Estado do Maranhão',
    sourceUrl: '/documentos/legislacao/lei-estadual-5205-1991-doe.pdf',
    sourceKind: 'official-gazette-copy',
    format: 'PDF',
    tags: ['Multas', 'Fiscalização', 'Lei nº 5.082/1990', 'Patrimônio cultural'],
    officialPublication: 'DOE/MA de 22/10/1991, p. 7',
    validationNote: 'Digitalização do Diário Oficial conferida. Vigência e alterações posteriores ainda devem ser confirmadas pelo órgão competente.',
    verifiedAt: '2026-08-28',
    status: 'published'
  },
  {
    id: 'ma-decreto-12350-1992',
    title: 'Decreto Estadual nº 12.350, de 26 de março de 1992',
    category: 'Decreto',
    scope: 'Estadual',
    date: '1992-03-26',
    description: 'Regulamenta a Lei nº 5.082/1990, com as alterações da Lei nº 5.205/1991, e disciplina embargo, fiscalização e multas no patrimônio cultural do Maranhão.',
    issuer: 'Estado do Maranhão',
    sourceLabel: 'Acervo SPC — Diário Oficial do Estado do Maranhão',
    sourceUrl: '/documentos/legislacao/decreto-estadual-12350-1992-doe.pdf',
    sourceKind: 'official-gazette-copy',
    format: 'PDF',
    tags: ['Regulamentação', 'Embargo', 'Multas', 'Fiscalização'],
    officialPublication: 'DOE/MA de 27/03/1992',
    validationNote: 'Digitalização do Diário Oficial conferida. Vigência e alterações posteriores ainda devem ser confirmadas pelo órgão competente.',
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
    issuer: 'Estado do Maranhão',
    sourceLabel: 'Acervo SPC — Diário Oficial do Estado do Maranhão',
    sourceUrl: '/documentos/legislacao/decreto-estadual-10089-1986-doe.pdf',
    sourceKind: 'official-gazette-copy',
    format: 'PDF',
    tags: ['Centro Histórico de São Luís', 'Tombamento', 'Perímetro', 'Mapa'],
    officialPublication: 'DOE/MA nº 240, de 15/12/1986',
    validationNote: 'O ato é datado de 06/03/1986 e a cópia localizada corresponde à publicação de 15/12/1986. Vigência e alterações posteriores ainda devem ser confirmadas.',
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
    issuer: 'Estado do Maranhão',
    sourceLabel: 'Acervo SPC — recorte do Diário Oficial do Estado',
    sourceUrl: '/documentos/legislacao/decreto-estadual-11591-1990-doe.pdf',
    sourceKind: 'official-gazette-copy',
    format: 'PDF',
    tags: ['Centro Histórico de São Luís', 'Tombamento', 'Praia Grande', 'Desterro'],
    officialPublication: 'DOE/MA de 24/10/1990',
    validationNote: 'O recorte do Diário Oficial também contém atos adjacentes da mesma edição. Vigência e alterações posteriores ainda devem ser confirmadas.',
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
    issuer: 'Estado do Maranhão',
    sourceLabel: 'Acervo SPC — cópia institucional assinada',
    sourceUrl: '/documentos/legislacao/decreto-estadual-11593-1990-arvores.pdf',
    sourceKind: 'institutional-copy',
    format: 'PDF',
    tags: ['Patrimônio natural', 'Árvores raras', 'Reserva biológica', 'São Luís'],
    officialPublication: 'DOE/MA de 24/10/1990 — publicação localizada no acervo',
    validationNote: 'Cópia assinada acompanhada da relação anexa. Vigência, alterações e situação atual dos bens ainda devem ser confirmadas.',
    verifiedAt: '2026-08-28',
    status: 'published'
  },
  {
    id: 'ma-decreto-38398-2023',
    title: 'Decreto Estadual nº 38.398, de 7 de julho de 2023',
    category: 'Decreto',
    scope: 'Estadual',
    date: '2023-07-07',
    description: 'Aprova o Regimento da Secretaria de Estado da Cultura e define competências da SPC, de seus serviços e da fiscalização patrimonial.',
    issuer: 'Estado do Maranhão',
    sourceLabel: 'Acervo SPC — Diário Oficial do Estado do Maranhão',
    sourceUrl: '/documentos/legislacao/decreto-estadual-38398-2023-regimento-secma.pdf',
    sourceKind: 'official-gazette-copy',
    format: 'PDF',
    tags: ['SECMA', 'SPC', 'Regimento interno', 'Competências'],
    officialPublication: 'DOE/MA — Poder Executivo, 07/07/2023, pp. 7–25',
    validationNote: 'Extrato completo do Diário Oficial conferido página a página no acervo da SPC.',
    verifiedAt: '2026-08-28',
    featured: true,
    status: 'published'
  },
  {
    id: 'spc-diretrizes-engenhos-publicitarios',
    title: 'Diretrizes para instalação de engenhos publicitários no Centro Histórico de São Luís',
    category: 'Diretriz',
    scope: 'SPC',
    date: '',
    description: 'Cartilha didática com dimensões, critérios de instalação, situações vedadas e documentos necessários para engenhos publicitários no Centro Histórico.',
    issuer: 'DPHAP — Superintendência do Patrimônio Cultural do Maranhão',
    sourceLabel: 'DPHAP/SPC — cartilha institucional',
    sourceUrl: '/documentos/legislacao/diretrizes-dphap-engenhos-publicitarios.pdf',
    sourceKind: 'institutional-guidance',
    format: 'PDF',
    tags: ['Engenhos publicitários', 'Fachadas', 'Centro Histórico', 'Orientação'],
    validationNote: 'Documento de orientação institucional. O acervo consultado não informa data nem ato formal de aprovação; não deve ser interpretado como lei ou decreto.',
    verifiedAt: '2026-08-28',
    status: 'published'
  },
  {
    id: 'slz-lei-3392-1995',
    title: 'Lei Municipal nº 3.392, de 4 de julho de 1995',
    category: 'Lei',
    scope: 'Municipal',
    date: '1995-07-04',
    description: 'Dispõe sobre a proteção do patrimônio cultural do Município de São Luís e dá outras providências.',
    issuer: 'Município de São Luís',
    sourceLabel: 'Diário Oficial do Município de São Luís',
    sourceUrl: 'https://diariooficial.saoluis.ma.gov.br/uploads/diario_oficial/8561/bri93GS7Ftzs1pX4X9Cwj7qq-2EnJ9C0.pdf',
    sourceKind: 'official-online',
    format: 'PDF',
    tags: ['Proteção municipal', 'Tombamento', 'São Luís', 'Patrimônio cultural'],
    officialPublication: 'Diário Oficial do Município de São Luís, 10/07/1995',
    validationNote: 'Texto localizado na edição oficial do Município. Vigência e alterações posteriores ainda devem ser confirmadas pelo órgão competente.',
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
    id: 'br-decreto-lei-25-1937',
    title: 'Decreto-Lei nº 25, de 30 de novembro de 1937',
    category: 'Decreto',
    scope: 'Federal',
    date: '1937-11-30',
    description: 'Organiza a proteção do patrimônio histórico e artístico nacional e disciplina o tombamento federal.',
    issuer: 'Presidência da República',
    sourceLabel: 'Presidência da República — Planalto',
    sourceUrl: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del0025.htm',
    sourceKind: 'official-online',
    format: 'HTML',
    tags: ['Tombamento', 'Patrimônio material', 'Livros do Tombo'],
    officialPublication: 'DOU de 06/12/1937; republicado em 11/12/1937',
    verifiedAt: '2026-08-28',
    featured: true,
    status: 'published'
  },
  {
    id: 'br-lei-3924-1961',
    title: 'Lei nº 3.924, de 26 de julho de 1961',
    category: 'Lei',
    scope: 'Federal',
    date: '1961-07-26',
    description: 'Dispõe sobre os monumentos arqueológicos e pré-históricos.',
    issuer: 'Presidência da República',
    sourceLabel: 'Presidência da República — Planalto',
    sourceUrl: 'https://www.planalto.gov.br/ccivil_03/leis/1950-1969/l3924.htm',
    sourceKind: 'official-online',
    format: 'HTML',
    tags: ['Arqueologia', 'Sítios arqueológicos', 'Pesquisa', 'Proteção'],
    officialPublication: 'DOU de 27/07/1961',
    validationNote: 'Ementa, data e publicação conferidas no texto do Planalto. Alterações posteriores devem ser confirmadas pelo órgão competente.',
    verifiedAt: '2026-10-13',
    status: 'published'
  },
  {
    id: 'br-decreto-3551-2000',
    title: 'Decreto nº 3.551, de 4 de agosto de 2000',
    category: 'Decreto',
    scope: 'Federal',
    date: '2000-08-04',
    description: 'Institui o Registro de Bens Culturais de Natureza Imaterial que constituem patrimônio cultural brasileiro, cria o Programa Nacional do Patrimônio Imaterial e dá outras providências.',
    issuer: 'Presidência da República',
    sourceLabel: 'Presidência da República — Planalto',
    sourceUrl: 'https://www.planalto.gov.br/ccivil_03/decreto/d3551.htm',
    sourceKind: 'official-online',
    format: 'HTML',
    tags: ['Patrimônio imaterial', 'Registro', 'Salvaguarda', 'PNPI'],
    officialPublication: 'DOU de 07/08/2000',
    validationNote: 'Ementa, data e publicação conferidas no texto do Planalto. Alterações posteriores devem ser confirmadas pelo órgão competente.',
    verifiedAt: '2026-10-13',
    status: 'published'
  },
  {
    id: 'iphan-portaria-375-2018',
    title: 'Portaria IPHAN nº 375, de 19 de setembro de 2018',
    category: 'Portaria',
    scope: 'Federal',
    date: '2018-09-19',
    description: 'Institui a Política de Patrimônio Cultural Material do IPHAN e reúne princípios, objetivos e diretrizes de preservação.',
    issuer: 'Instituto do Patrimônio Histórico e Artístico Nacional',
    sourceLabel: 'IPHAN — texto oficial',
    sourceUrl: 'https://www.gov.br/iphan/pt-br/centrais-de-conteudo/legislacao/atos-normativos/2018/portaria-no-375-de-19-de-setembro-de-2018',
    sourceKind: 'official-online',
    format: 'HTML',
    tags: ['Política patrimonial', 'Diretrizes', 'Patrimônio material', 'Gestão'],
    officialPublication: 'DOU de 20/09/2018',
    validationNote: 'Título, data e ementa conferidos no texto oficial do IPHAN. Revoga a Portaria IPHAN nº 299/2004. Vigência e alterações posteriores devem ser confirmadas pelo órgão competente.',
    verifiedAt: '2026-10-13',
    status: 'published'
  },
  {
    id: 'iphan-portaria-289-2025',
    title: 'Portaria IPHAN nº 289, de 3 de novembro de 2025',
    category: 'Portaria',
    scope: 'Federal',
    date: '2025-11-03',
    description: 'Dispõe sobre os procedimentos para autorização de intervenções em bens imóveis e integrados valorados, em bens imóveis e integrados tombados e no entorno de bens tombados.',
    issuer: 'Instituto do Patrimônio Histórico e Artístico Nacional',
    sourceLabel: 'IPHAN — texto oficial',
    sourceUrl: 'https://www.gov.br/iphan/pt-br/centrais-de-conteudo/legislacao/atos-normativos/2025/portaria-iphan-no-289-de-3-de-novembro-de-2025',
    sourceKind: 'official-online',
    format: 'HTML',
    tags: ['Intervenção', 'Autorização', 'Bens tombados', 'Entorno'],
    featured: true,
    validationNote: 'Título, data e ementa conferidos na página oficial do IPHAN. A página não informa a data de publicação no DOU. Vigência e alterações posteriores devem ser confirmadas pelo órgão competente.',
    verifiedAt: '2026-10-13',
    status: 'published'
  },
  {
    id: 'iphan-in-6-2025',
    title: 'Instrução Normativa IPHAN nº 6, de 28 de novembro de 2025',
    category: 'Instrução Normativa',
    scope: 'Federal',
    date: '2025-11-28',
    description: 'Estabelece procedimentos administrativos a serem observados pelo IPHAN nos processos de licenciamento ambiental.',
    issuer: 'Instituto do Patrimônio Histórico e Artístico Nacional',
    sourceLabel: 'Diário Oficial da União',
    sourceUrl: 'https://www.in.gov.br/web/dou/-/instrucao-normativa-iphan-n-6-de-28-de-novembro-de-2025-672013509',
    sourceKind: 'official-online',
    format: 'HTML',
    tags: ['Licenciamento ambiental', 'Procedimentos', 'Impacto', 'IPHAN'],
    officialPublication: 'DOU nº 228, de 01/12/2025',
    validationNote: 'Título, data, ementa e publicação conferidos no Diário Oficial da União (Imprensa Nacional). Vigência e alterações posteriores devem ser confirmadas pelo órgão competente.',
    verifiedAt: '2026-10-13',
    status: 'published'
  }
];
