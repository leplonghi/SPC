/**
 * Dados de contato oficiais da SPC.
 * Fonte: informado pela própria SPC.
 * A SPC não possui telefone; não adicionar número aqui.
 * Canais informados pela SPC:
 *  - email: atendimento e protocolo geral da SPC/DPHAP.
 *  - denunciaEmail: recebimento de denúncias de patrimônio (DPHAP).
 *  - ouvidoriaEmail: Ouvidoria da SECMA (a Ouvidoria não é da SPC).
 */
export const SITE_CONTACT = {
  email: 'dphapspc@gmail.com',
  denunciaEmail: 'dphapspc@gmail.com',
  ouvidoriaEmail: 'ouvidoria@secma.ma.gov.br',
  addressLine: 'Rua da Estrela, 562, Centro',
  city: 'São Luís, MA',
  buildingName: 'Solar dos Vasconcelos',
  mapSearchUrl:
    'https://www.openstreetmap.org/search?query=Rua%20da%20Estrela%20562%20Centro%20S%C3%A3o%20Lu%C3%ADs%20MA',
} as const;

export const DEPARTMENTS = [
  {
    code: 'DPHAP',
    name: 'Departamento de Proteção do Patrimônio Histórico, Artístico, Arqueológico e Paisagístico',
    summary: 'Tombamento, fiscalização e autorização de intervenções em bens tombados e áreas protegidas.',
  },
  {
    code: 'DPE',
    name: 'Departamento de Projetos Especiais',
    summary: 'Projetos, obras e intervenções de conservação e restauro do patrimônio edificado.',
  },
  {
    code: 'DPI',
    name: 'Departamento de Patrimônio Imaterial',
    summary: 'Registro e salvaguarda de saberes, celebrações, formas de expressão e lugares.',
  },
] as const;
