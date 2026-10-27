/**
 * Bens tombados pelo Estado do Maranhão, conforme a Relação de Bens Tombados (SPC/DPHAP).
 * Fontes: Relação de Bens Tombados (SPC/DPHAP) e Livro de Tombo Histórico do DPHAP (fotos do livro físico).
 * REGRA DE FONTE (Eduardo, 12/10/2026): para número, data e publicação do ato, a fonte é o próprio decreto.
 * O Livro de Tombo vale para folha e data de inscrição. Quando o dado de decreto só aparece no Livro ou na Relação,
 * e as duas divergem, e o PDF do decreto não está na pasta da SPC, o campo fica "a confirmar".
 * Decretos conferidos no texto (PDF da pasta da SPC): 11.585, 11.682, 12.456, 12.457, 12.954, 12.956.
 * Cobre as inscrições de 1979 a 1993. Não há tombamentos estaduais posteriores a 1993 (informação do Eduardo).
 * As inscrições 020 e 021 aparecem como CANCELADAS no Livro de Tombo e por isso não estão nesta lista.
 * Nome de proprietário não é publicado. Este arquivo é a versão de referência e é editado diretamente.
 */
export interface BemTombado {
  id: string; // número da inscrição
  nome: string;
  municipio: string;
  local: string | null;
  decreto: { numero: string; data: string | null; ano: number | null };
  livro: { folha: string; data: string | null };
  diario: string | null;
  obs: string[];
}

/**
 * Cópias digitalizadas dos decretos, por número do decreto (um decreto pode valer para mais de uma inscrição).
 * Só entram aqui arquivos que a SPC tem na pasta de decretos e que foram lidos antes de publicar.
 * Os demais decretos aparecem na ficha sem botão (decisão do Eduardo, 12/10/2026) até a SPC localizar o PDF.
 * Para incluir um decreto: colocar o PDF em public/documentos/decretos/ e acrescentar uma linha abaixo.
 */
export interface DecretoPdf {
  url: string;
  nota?: string;
}

export const DECRETOS_PDF: Record<string, DecretoPdf> = {
  '10.089': { url: '/documentos/legislacao/decreto-estadual-10089-1986-doe.pdf', nota: 'Cópia da publicação no Diário Oficial de 15/12/1986.' },
  '10.899': { url: '/documentos/decretos/decreto-estadual-10899-1988.pdf' },
  '11.582': { url: '/documentos/decretos/decreto-estadual-11582-1990.pdf', nota: 'Recorte do Diário Oficial de 24/10/1990.' },
  '11.583': { url: '/documentos/decretos/decreto-estadual-11583-1990.pdf', nota: 'Recorte do Diário Oficial de 24/10/1990.' },
  '11.584': { url: '/documentos/decretos/decreto-estadual-11584-1990.pdf', nota: 'Recorte do Diário Oficial de 24/10/1990.' },
  '11.585': { url: '/documentos/decretos/decreto-estadual-11585-1990.pdf', nota: 'Recorte do Diário Oficial de 24/10/1990.' },
  '11.591': { url: '/documentos/legislacao/decreto-estadual-11591-1990-doe.pdf', nota: 'Recorte do Diário Oficial; traz também outros atos da mesma edição.' },
  '11.593': { url: '/documentos/legislacao/decreto-estadual-11593-1990-arvores.pdf' },
  '11.681': { url: '/documentos/decretos/decreto-estadual-11681-1990.pdf' },
  '11.682': { url: '/documentos/decretos/decreto-estadual-11682-1990.pdf', nota: 'Recorte do Diário Oficial de 30/11/1990.' },
  '11.683': { url: '/documentos/decretos/decreto-estadual-11683-1990-recorte-doe.pdf', nota: 'Recorte do Diário Oficial de 30/11/1990 (páginas 5 e 6). O decreto está destacado em amarelo e as páginas trazem também outros atos.' },
  '12.456': { url: '/documentos/decretos/decreto-estadual-12456-12457-1992-doe.pdf', nota: 'Recorte do Diário Oficial de 13/07/1992. A página traz também o Decreto nº 12.457.' },
  '12.457': { url: '/documentos/decretos/decreto-estadual-12456-12457-1992-doe.pdf', nota: 'Cópia parcial: o arquivo que a SPC tem termina no artigo 1º, sem o artigo 2º e as assinaturas. Recorte do Diário Oficial de 13/07/1992.' },
  '12.954': { url: '/documentos/decretos/decreto-estadual-12954-1993-doe.pdf', nota: 'Recorte do Diário Oficial de 19/02/1993.' },
  '12.955': { url: '/documentos/decretos/decreto-estadual-12955-1993-doe.pdf', nota: 'Recorte do Diário Oficial de 19/02/1993.' },
  '12.956': { url: '/documentos/decretos/decreto-estadual-12956-1993-doe.pdf', nota: 'Recorte do Diário Oficial de 19/02/1993.' }
};

/**
 * Tipo de bem, só para facilitar a busca. É uma leitura do nome e do uso do bem feita para o portal
 * (não é categoria oficial do tombamento) e deve ser revisada pelo DPHAP.
 */
export const TIPOS_BEM = [
  'Igrejas, capelas e sinos',
  'Solares, sobrados e palacetes',
  'Casas e imóveis',
  'Edifícios públicos e culturais',
  'Centros e conjuntos históricos',
  'Sítios, ruínas e áreas naturais',
  'Fontes, fortes, fazendas e engenhos'
] as const;

export type TipoBem = (typeof TIPOS_BEM)[number];

export const TIPO_POR_INSCRICAO: Record<string, TipoBem> = {
  '001': 'Edifícios públicos e culturais',
  '002': 'Solares, sobrados e palacetes',
  '003': 'Solares, sobrados e palacetes',
  '004': 'Casas e imóveis',
  '005': 'Solares, sobrados e palacetes',
  '006': 'Casas e imóveis',
  '007': 'Casas e imóveis',
  '008': 'Casas e imóveis',
  '009': 'Casas e imóveis',
  '010': 'Casas e imóveis',
  '011': 'Edifícios públicos e culturais',
  '012': 'Casas e imóveis',
  '013': 'Edifícios públicos e culturais',
  '014': 'Sítios, ruínas e áreas naturais',
  '015': 'Edifícios públicos e culturais',
  '016': 'Casas e imóveis',
  '017': 'Casas e imóveis',
  '018': 'Sítios, ruínas e áreas naturais',
  '019': 'Casas e imóveis',
  '022': 'Igrejas, capelas e sinos',
  '023': 'Casas e imóveis',
  '024': 'Solares, sobrados e palacetes',
  '025': 'Igrejas, capelas e sinos',
  '026': 'Fontes, fortes, fazendas e engenhos',
  '027': 'Fontes, fortes, fazendas e engenhos',
  '028': 'Igrejas, capelas e sinos',
  '029': 'Casas e imóveis',
  '030': 'Solares, sobrados e palacetes',
  '031': 'Casas e imóveis',
  '032': 'Solares, sobrados e palacetes',
  '033': 'Casas e imóveis',
  '034': 'Fontes, fortes, fazendas e engenhos',
  '035': 'Igrejas, capelas e sinos',
  '036': 'Casas e imóveis',
  '037': 'Centros e conjuntos históricos',
  '038': 'Igrejas, capelas e sinos',
  '039': 'Igrejas, capelas e sinos',
  '040': 'Centros e conjuntos históricos',
  '041': 'Igrejas, capelas e sinos',
  '042': 'Solares, sobrados e palacetes',
  '043': 'Edifícios públicos e culturais',
  '044': 'Igrejas, capelas e sinos',
  '045': 'Edifícios públicos e culturais',
  '046': 'Igrejas, capelas e sinos',
  '047': 'Fontes, fortes, fazendas e engenhos',
  '048': 'Sítios, ruínas e áreas naturais',
  '049': 'Casas e imóveis',
  '050': 'Centros e conjuntos históricos',
  '051': 'Sítios, ruínas e áreas naturais',
  '052': 'Sítios, ruínas e áreas naturais',
  '053': 'Edifícios públicos e culturais',
  '054': 'Casas e imóveis',
  '055': 'Igrejas, capelas e sinos',
  '056': 'Edifícios públicos e culturais',
  '057': 'Edifícios públicos e culturais',
  '058': 'Fontes, fortes, fazendas e engenhos',
  '059': 'Centros e conjuntos históricos',
  '060': 'Centros e conjuntos históricos',
  '061': 'Igrejas, capelas e sinos',
  '062': 'Casas e imóveis',
  '063': 'Centros e conjuntos históricos',
  '064': 'Sítios, ruínas e áreas naturais',
  '065': 'Sítios, ruínas e áreas naturais'
};

/** Faixas pelo ano do decreto (ano da data do decreto; quando a data completa está a confirmar, vale o ano). */
export const FAIXAS_DECRETO = [
  { id: '1979-1981', label: '1979 a 1981', de: 1979, ate: 1981 },
  { id: '1984-1988', label: '1984 a 1988', de: 1984, ate: 1988 },
  { id: '1990', label: '1990', de: 1990, ate: 1990 },
  { id: '1992-1993', label: '1992 e 1993', de: 1992, ate: 1993 }
] as const;

export const anoDoDecreto = (b: BemTombado): number | null =>
  b.decreto.data ? Number(b.decreto.data.slice(0, 4)) : b.decreto.ano;


export const BENS_TOMBADOS: BemTombado[] = [
  {
    "id": "001",
    "nome": "Biblioteca Pública Benedito Leite e Acervo Biblio-Iconográfico - Coleção Ribeiro do Amaral e Artur Azevedo",
    "municipio": "São Luís",
    "local": "Praça do Panteon",
    "decreto": {
      "numero": "7.090",
      "data": "1979-02-09",
      "ano": 1979
    },
    "livro": {
      "folha": "01",
      "data": "1980-08-13"
    },
    "diario": null,
    "obs": [
      "data do Diário Oficial a confirmar"
    ]
  },
  {
    "id": "002",
    "nome": "Imóvel Colonial - Solar da Baronesa de São Bento",
    "municipio": "São Luís",
    "local": "Rua Santo Antonio, 161",
    "decreto": {
      "numero": "7.155",
      "data": "1979-04-04",
      "ano": 1979
    },
    "livro": {
      "folha": "01",
      "data": "1980-08-13"
    },
    "diario": "1979-04-16",
    "obs": []
  },
  {
    "id": "003",
    "nome": "Palacete Gentil Braga",
    "municipio": "São Luís",
    "local": "Rua Grande, 782",
    "decreto": {
      "numero": "7.414",
      "data": "1979-10-31",
      "ano": 1979
    },
    "livro": {
      "folha": "01",
      "data": "1980-08-13"
    },
    "diario": "1979-10-31",
    "obs": []
  },
  {
    "id": "004",
    "nome": "Imóvel Onde Funcionou a Indústria Têxtil – Século XIX",
    "municipio": "Caxias",
    "local": "Praça do Panteon",
    "decreto": {
      "numero": "7.660",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "01",
      "data": "1980-08-13"
    },
    "diario": "1980-06-27",
    "obs": []
  },
  {
    "id": "005",
    "nome": "Imóvel Colonial - Solar do Ribeirão",
    "municipio": "São Luís",
    "local": "Rua Isaac Martins, 141",
    "decreto": {
      "numero": "7.661",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "01",
      "data": "1980-10-15"
    },
    "diario": "1980-06-27",
    "obs": []
  },
  {
    "id": "006",
    "nome": "Imóvel Colonial - Sede SEMATUR",
    "municipio": "São Luís",
    "local": "Praça João Lisboa",
    "decreto": {
      "numero": "7.661",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "02",
      "data": "1980-10-15"
    },
    "diario": "1980-06-27",
    "obs": []
  },
  {
    "id": "007",
    "nome": "Imóvel Colonial – Arquivo Público",
    "municipio": "São Luís",
    "local": "Rua de Nazaré, 218",
    "decreto": {
      "numero": "7.661",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "02",
      "data": "1980-10-15"
    },
    "diario": "1980-06-27",
    "obs": []
  },
  {
    "id": "008",
    "nome": "Imóvel Colonial",
    "municipio": "São Luís",
    "local": "Rua do Trapiche, 140",
    "decreto": {
      "numero": "7.661",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "02",
      "data": "1980-10-15"
    },
    "diario": "1980-06-27",
    "obs": []
  },
  {
    "id": "009",
    "nome": "Imóvel Colonial - Sede da Fundação Cultural do Maranhão",
    "municipio": "São Luís",
    "local": "Rua do Trapiche/Portugal, 303",
    "decreto": {
      "numero": "7.661",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "02",
      "data": "1980-10-15"
    },
    "diario": "1980-06-27",
    "obs": []
  },
  {
    "id": "010",
    "nome": "Imóvel Colonial - Sede do IPES",
    "municipio": "São Luís",
    "local": "Rua do Trapiche/Portugal, 199",
    "decreto": {
      "numero": "7.661",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "02",
      "data": "1980-10-15"
    },
    "diario": "1980-06-27",
    "obs": []
  },
  {
    "id": "011",
    "nome": "Centro de Cultura Domingos Vieira Filho",
    "municipio": "São Luís",
    "local": "Rua do Giz, 221",
    "decreto": {
      "numero": "7.663",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "03",
      "data": "1980-10-15"
    },
    "diario": "1980-06-27",
    "obs": [
      "número do decreto a confirmar"
    ]
  },
  {
    "id": "012",
    "nome": "Companhia Telefônica - Restaurante SENAC",
    "municipio": "São Luís",
    "local": "Rua de Nazaré, 242",
    "decreto": {
      "numero": "7.661",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "03",
      "data": "1980-10-15"
    },
    "diario": "1980-06-27",
    "obs": []
  },
  {
    "id": "013",
    "nome": "Casa de Câmara e Cadeia - Imóvel Colonial",
    "municipio": "Alcântara",
    "local": "Praça Gomes de Castro",
    "decreto": {
      "numero": "7.662",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "03",
      "data": "1980-11-13"
    },
    "diario": "1980-06-27",
    "obs": []
  },
  {
    "id": "014",
    "nome": "Ruínas - Sítio Santo Antonio das Alegrias - Sítio do Físico",
    "municipio": "São Luís",
    "local": "às margens do Rio Bacanga",
    "decreto": {
      "numero": "7.663",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "03",
      "data": "1980-11-13"
    },
    "diario": "1980-06-27",
    "obs": []
  },
  {
    "id": "015",
    "nome": "Cadeia Pública Itapecuru - Imóvel Colonial",
    "municipio": "Itapecuru-Mirim",
    "local": "Praça Cosmo",
    "decreto": {
      "numero": "7.664",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "03",
      "data": "1980-11-13"
    },
    "diario": "1980-06-27",
    "obs": []
  },
  {
    "id": "016",
    "nome": "Farmácia João Vital de Matos",
    "municipio": "São Luís",
    "local": "Rua João Vital de Matos, 141",
    "decreto": {
      "numero": "7.665",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "04",
      "data": "1980-11-13"
    },
    "diario": "1980-06-27",
    "obs": []
  },
  {
    "id": "017",
    "nome": "Casa do Divino - Imóvel Colonial",
    "municipio": "Alcântara",
    "local": "Rua Grande, 88",
    "decreto": {
      "numero": "7.666",
      "data": null,
      "ano": 1980
    },
    "livro": {
      "folha": "04",
      "data": "1980-11-13"
    },
    "diario": "1980-06-27",
    "obs": [
      "data do decreto a confirmar"
    ]
  },
  {
    "id": "018",
    "nome": "Ruína – Alcântara",
    "municipio": "Alcântara",
    "local": "Rua do Cemitério",
    "decreto": {
      "numero": "7.666",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "04",
      "data": "1980-11-13"
    },
    "diario": "1980-06-27",
    "obs": []
  },
  {
    "id": "019",
    "nome": "Imóvel Colonial",
    "municipio": "São Luís",
    "local": "Largo do Ribeirão",
    "decreto": {
      "numero": "7.671",
      "data": "1980-06-26",
      "ano": 1980
    },
    "livro": {
      "folha": "04",
      "data": "1981-01-14"
    },
    "diario": "1980-07-17",
    "obs": []
  },
  {
    "id": "022",
    "nome": "Capela Bom Jesus dos Navegantes",
    "municipio": "São Luís",
    "local": "Praça Antonio Lobo",
    "decreto": {
      "numero": "7.933",
      "data": "1980-11-28",
      "ano": 1980
    },
    "livro": {
      "folha": "05",
      "data": "1981-01-14"
    },
    "diario": "1980-12-09",
    "obs": []
  },
  {
    "id": "023",
    "nome": "Casa Josué Montelo",
    "municipio": "São Luís",
    "local": "Largo do Ribeirão, 42",
    "decreto": {
      "numero": "8.060",
      "data": "1981-03-13",
      "ano": 1981
    },
    "livro": {
      "folha": "05",
      "data": "1981-03-20"
    },
    "diario": "1981-03-17",
    "obs": []
  },
  {
    "id": "024",
    "nome": "Solar da Baronesa de Anajatuba (Sede do IPHAN)",
    "municipio": "São Luís",
    "local": "Rua 28 de Julho, 235",
    "decreto": {
      "numero": "7.665",
      "data": "1980-06-23",
      "ano": 1980
    },
    "livro": {
      "folha": "05",
      "data": "1984-08-23"
    },
    "diario": "1980-07-27",
    "obs": []
  },
  {
    "id": "025",
    "nome": "Igreja de Santana",
    "municipio": "São Luís",
    "local": "Rua de Santana, s/n",
    "decreto": {
      "numero": "9.649",
      "data": "1984-08-10",
      "ano": 1984
    },
    "livro": {
      "folha": "05",
      "data": "1984-09-06"
    },
    "diario": "1984-08-30",
    "obs": []
  },
  {
    "id": "026",
    "nome": "Fonte do Marajá",
    "municipio": "São Luís",
    "local": "Camboa s/n",
    "decreto": {
      "numero": "9.651",
      "data": "1984-08-10",
      "ano": 1984
    },
    "livro": {
      "folha": "06",
      "data": "1984-09-06"
    },
    "diario": "1984-08-30",
    "obs": []
  },
  {
    "id": "027",
    "nome": "Fonte e Sítio do Mamoim",
    "municipio": "São Luís",
    "local": "Camboa",
    "decreto": {
      "numero": "9.650",
      "data": "1984-08-10",
      "ano": 1984
    },
    "livro": {
      "folha": "06",
      "data": "1984-09-06"
    },
    "diario": "1984-08-30",
    "obs": []
  },
  {
    "id": "028",
    "nome": "Igreja e Largo de São João de Vinhais",
    "municipio": "São Luís",
    "local": "Rua Grande, s/n – Vinhais",
    "decreto": {
      "numero": "9.652",
      "data": "1984-08-10",
      "ano": 1984
    },
    "livro": {
      "folha": "06",
      "data": "1984-09-06"
    },
    "diario": "1984-08-30",
    "obs": []
  },
  {
    "id": "029",
    "nome": "Imóvel Colonial",
    "municipio": "São Luís",
    "local": "Rua do Giz, 53",
    "decreto": {
      "numero": "9.653",
      "data": "1984-08-10",
      "ano": 1984
    },
    "livro": {
      "folha": "06",
      "data": "1984-09-06"
    },
    "diario": "1984-08-30",
    "obs": []
  },
  {
    "id": "030",
    "nome": "Sobrado Sede do Albergue da Juventude (57)",
    "municipio": "São Luís",
    "local": "Rua 14 de Julho, 93 – Centro",
    "decreto": {
      "numero": "9.654",
      "data": "1984-08-10",
      "ano": 1984
    },
    "livro": {
      "folha": "06",
      "data": "1984-09-06"
    },
    "diario": "1984-08-30",
    "obs": []
  },
  {
    "id": "031",
    "nome": "Imóvel Colonial do Século XIX",
    "municipio": "São Luís",
    "local": "Rua da Estrela, 201 – Praia Grande",
    "decreto": {
      "numero": "9.655",
      "data": null,
      "ano": 1984
    },
    "livro": {
      "folha": "07",
      "data": "1984-09-06"
    },
    "diario": "1984-08-30",
    "obs": [
      "data do decreto a confirmar"
    ]
  },
  {
    "id": "032",
    "nome": "Sobrado Silva Maia & Cia. - Sede da FUNCMA",
    "municipio": "São Luís",
    "local": "Rua Portugal, 297",
    "decreto": {
      "numero": "9.656",
      "data": "1984-08-10",
      "ano": 1984
    },
    "livro": {
      "folha": "07",
      "data": "1984-09-06"
    },
    "diario": "1984-08-30",
    "obs": []
  },
  {
    "id": "033",
    "nome": "Casa da Pólvora (Sede do Centro de Cultura Negra)",
    "municipio": "São Luís",
    "local": "Rua Guarani s/n - João Paulo",
    "decreto": {
      "numero": "9.657",
      "data": "1984-08-10",
      "ano": 1984
    },
    "livro": {
      "folha": "07",
      "data": "1984-09-06"
    },
    "diario": "1984-08-30",
    "obs": []
  },
  {
    "id": "034",
    "nome": "Engenho Central de Pindaré",
    "municipio": "Pindaré-Mirim",
    "local": null,
    "decreto": {
      "numero": "9.658",
      "data": "1984-08-10",
      "ano": 1984
    },
    "livro": {
      "folha": "07",
      "data": "1984-09-06"
    },
    "diario": "1984-08-30",
    "obs": []
  },
  {
    "id": "035",
    "nome": "Igreja e Largo de Nossa Senhora da Luz",
    "municipio": "Paço do Lumiar",
    "local": "Município de Paço do Lumiar",
    "decreto": {
      "numero": "9.659",
      "data": "1984-08-10",
      "ano": 1984
    },
    "livro": {
      "folha": "07",
      "data": "1984-09-06"
    },
    "diario": "1984-08-30",
    "obs": []
  },
  {
    "id": "036",
    "nome": "Casa de Nagô",
    "municipio": "São Luís",
    "local": "Rua das Crioulas, 799 – Centro",
    "decreto": {
      "numero": "10.029",
      "data": "1985-11-04",
      "ano": 1985
    },
    "livro": {
      "folha": "07",
      "data": "1986-03-11"
    },
    "diario": null,
    "obs": []
  },
  {
    "id": "037",
    "nome": "Centro Histórico de São Luís - ZE/2",
    "municipio": "São Luís",
    "local": "Centro Histórico da Cidade de São Luis",
    "decreto": {
      "numero": "10.089",
      "data": "1986-03-06",
      "ano": 1986
    },
    "livro": {
      "folha": "08",
      "data": "1986-12-16"
    },
    "diario": "1986-12-15",
    "obs": []
  },
  {
    "id": "038",
    "nome": "Igreja de São Joaquim do Bacanga",
    "municipio": "São Luís",
    "local": "Vila Maranhão",
    "decreto": {
      "numero": "10.453",
      "data": "1987-07-08",
      "ano": 1987
    },
    "livro": {
      "folha": "08",
      "data": "1987-08-05"
    },
    "diario": "1987-07-16",
    "obs": []
  },
  {
    "id": "039",
    "nome": "Capela de Santo Antonio",
    "municipio": "São Luís",
    "local": "Vila Maranhão",
    "decreto": {
      "numero": "10.772",
      "data": "1988-06-20",
      "ano": 1988
    },
    "livro": {
      "folha": "08",
      "data": "1988-07-02"
    },
    "diario": "1988-06-28",
    "obs": []
  },
  {
    "id": "040",
    "nome": "Centro Histórico, Arquitetônico e Paisagístico da Cidade de Viana",
    "municipio": "Viana",
    "local": "Município de Viana",
    "decreto": {
      "numero": "10.899",
      "data": "1988-10-17",
      "ano": 1988
    },
    "livro": {
      "folha": "09",
      "data": "1988-10-29"
    },
    "diario": "1988-10-27",
    "obs": []
  },
  {
    "id": "041",
    "nome": "Capela do Bom Jesus da Coluna",
    "municipio": "São Luís",
    "local": "Praça Antonio Lobo",
    "decreto": {
      "numero": "11.582",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "09",
      "data": "1990-11-29"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "042",
    "nome": "Solar Barão de Grajaú (Museu de Arte Sacra)",
    "municipio": "São Luís",
    "local": "Rua 13 de Maio, 500",
    "decreto": {
      "numero": "11.583",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "09",
      "data": "1990-11-29"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "043",
    "nome": "Centro de Criatividade \"Odylo Costa Filho\"",
    "municipio": "São Luís",
    "local": "Beco dos Catraeiros, 224",
    "decreto": {
      "numero": "11.584",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "09",
      "data": "1990-11-29"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "044",
    "nome": "Catedral Metropolitana",
    "municipio": "São Luís",
    "local": "Av. Pedro II, s/n",
    "decreto": {
      "numero": "11.585",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "09",
      "data": "1990-11-29"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "045",
    "nome": "Teatro Artur Azevêdo",
    "municipio": "São Luís",
    "local": "Rua do Sol",
    "decreto": {
      "numero": "11.586",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "10",
      "data": "1990-11-29"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "046",
    "nome": "Igreja de Nossa Senhora do Rosário dos Pretos",
    "municipio": "São Luís",
    "local": "Rua do Egito",
    "decreto": {
      "numero": "11.587",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "10",
      "data": "1990-11-29"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "047",
    "nome": "Forte do Calvário",
    "municipio": "Rosário",
    "local": "Município de Rosário",
    "decreto": {
      "numero": "11.588",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "10",
      "data": "1990-11-29"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "048",
    "nome": "Morro da Ladeira",
    "municipio": "Barreirinhas",
    "local": "Barreirinhas",
    "decreto": {
      "numero": "11.589",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "10",
      "data": "1990-11-29"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "049",
    "nome": "Edifício São Luís",
    "municipio": "São Luís",
    "local": "Rua de Nazaré, 377, esquina com Rua do Egito",
    "decreto": {
      "numero": "11.590",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "10",
      "data": "1990-11-29"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "050",
    "nome": "Centro Histórico de São Luís",
    "municipio": "São Luís",
    "local": "Centro do Município de São Luís",
    "decreto": {
      "numero": "11.591",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "11",
      "data": "1990-11-29"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "051",
    "nome": "Sítio Tamancão",
    "municipio": "São Luís",
    "local": "Margem direita do Rio Bacanga",
    "decreto": {
      "numero": "11.592",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "11",
      "data": "1990-11-29"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "052",
    "nome": "Espécies Isoladas de Árvores Raras e Reservas Biológicas de São Luís",
    "municipio": "São Luís",
    "local": "Vários locais",
    "decreto": {
      "numero": "11.593",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "11",
      "data": "1990-11-30"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "053",
    "nome": "Palácio Cristo-Rei",
    "municipio": "São Luís",
    "local": "Praça Gonçalves Dias, s/n",
    "decreto": {
      "numero": "11.594",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "11",
      "data": "1990-11-30"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "054",
    "nome": "Casa de Vespasiano Ramos",
    "municipio": "Caxias",
    "local": "Praça Vespasiano Ramos, 763",
    "decreto": {
      "numero": "11.595",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "12",
      "data": "1990-11-30"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "055",
    "nome": "Igreja de Santo Antônio",
    "municipio": "São Luís",
    "local": "Praça de Santo Antonio",
    "decreto": {
      "numero": "11.596",
      "data": null,
      "ano": 1990
    },
    "livro": {
      "folha": "12",
      "data": "1990-11-30"
    },
    "diario": "1990-10-24",
    "obs": [
      "data do decreto a confirmar"
    ]
  },
  {
    "id": "056",
    "nome": "Museu Histórico e Artístico do Maranhão",
    "municipio": "São Luís",
    "local": "Rua do Sol, 302",
    "decreto": {
      "numero": "11.597",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "12",
      "data": "1990-11-30"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "057",
    "nome": "Palácio Episcopal",
    "municipio": "São Luís",
    "local": "Av. Pedro II, s/n",
    "decreto": {
      "numero": "11.598",
      "data": "1990-10-12",
      "ano": 1990
    },
    "livro": {
      "folha": "12",
      "data": "1990-11-30"
    },
    "diario": "1990-10-24",
    "obs": []
  },
  {
    "id": "058",
    "nome": "Fazenda Santa Cruz",
    "municipio": "Buriti",
    "local": "Buriti",
    "decreto": {
      "numero": "11.682",
      "data": "1990-11-29",
      "ano": 1990
    },
    "livro": {
      "folha": "12",
      "data": "1990-12-04"
    },
    "diario": "1990-11-30",
    "obs": []
  },
  {
    "id": "059",
    "nome": "Centro Histórico, Arquitetônico e Área Paisagística de Caxias",
    "municipio": "Caxias",
    "local": "Município de Caxias",
    "decreto": {
      "numero": "11.681",
      "data": "1990-11-29",
      "ano": 1990
    },
    "livro": {
      "folha": "13",
      "data": "1990-12-04"
    },
    "diario": "1990-11-30",
    "obs": []
  },
  {
    "id": "060",
    "nome": "Sítio Histórico de Alcântara: Conjunto Arquitetônico e Área Paisagística",
    "municipio": "Alcântara",
    "local": "Município de Alcântara",
    "decreto": {
      "numero": "11.683",
      "data": "1990-11-29",
      "ano": 1990
    },
    "livro": {
      "folha": "13",
      "data": "1990-12-04"
    },
    "diario": "1990-11-30",
    "obs": []
  },
  {
    "id": "061",
    "nome": "Sinos da Igreja Matriz de Nossa Senhora da Conceição",
    "municipio": "Viana",
    "local": "Cidade de Viana",
    "decreto": {
      "numero": "12.456",
      "data": "1992-07-03",
      "ano": 1992
    },
    "livro": {
      "folha": "13",
      "data": "1992-08-03"
    },
    "diario": "1992-07-13",
    "obs": []
  },
  {
    "id": "062",
    "nome": "Imóvel do Canto da Fabril",
    "municipio": "São Luís",
    "local": "Rua Senador João Pedro, 92",
    "decreto": {
      "numero": "12.457",
      "data": "1992-07-03",
      "ano": 1992
    },
    "livro": {
      "folha": "13",
      "data": "1992-08-03"
    },
    "diario": "1992-07-13",
    "obs": []
  },
  {
    "id": "063",
    "nome": "Centro Histórico de Carolina",
    "municipio": "Carolina",
    "local": "Município de Carolina/MA",
    "decreto": {
      "numero": "12.954",
      "data": "1993-02-12",
      "ano": 1993
    },
    "livro": {
      "folha": "13",
      "data": "1993-03-12"
    },
    "diario": "1993-02-19",
    "obs": []
  },
  {
    "id": "064",
    "nome": "Sítio Paleontológico do Rio Itapecuru",
    "municipio": "Itapecuru-Mirim",
    "local": "Município de Itapecuru",
    "decreto": {
      "numero": "12.955",
      "data": "1993-02-12",
      "ano": 1993
    },
    "livro": {
      "folha": "14",
      "data": "1993-03-12"
    },
    "diario": "1993-02-19",
    "obs": []
  },
  {
    "id": "065",
    "nome": "Sítios Arqueológicos do Morro das Araras e Morro das Figuras",
    "municipio": "Carolina",
    "local": "Município de Carolina",
    "decreto": {
      "numero": "12.956",
      "data": "1993-02-12",
      "ano": 1993
    },
    "livro": {
      "folha": "14",
      "data": "1993-03-12"
    },
    "diario": "1993-02-19",
    "obs": []
  }
];
