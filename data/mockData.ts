
import { Department, AssetType, ProtectionLevel, AssetStatus, HeritageAsset, TombamentoPolygon, ProjectStatus } from '../types';

export const MOCK_ASSETS: HeritageAsset[] = [
  {
    id: '1',
    code: 'SL-001',
    name: 'Palácio dos Leões',
    asset_type: AssetType.IMOVEL,
    protection_level: ProtectionLevel.FEDERAL,
    status: AssetStatus.TOMBADO,
    municipality: 'São Luís',
    address_text: 'Praça Dom Pedro II, S/N - Centro',
    latitude: -2.5284,
    longitude: -44.3044,
    legal_basis: {
      instrument_type: 'Decreto',
      instrument_number: '1.234',
      instrument_date: '1940-05-15',
      summary: 'Tombamento histórico e artístico nacional.'
    },
    description: 'Sede do Governo do Maranhão, exemplar da arquitetura neoclássica construído sobre o antigo forte francês.',
    department_responsible: Department.DPHAP,
    tags: ['Arquitetura Civil', 'Sede Administrativa'],
    image_url: 'https://picsum.photos/seed/leoes/800/600'
  },
  {
    id: '2',
    code: 'SL-002',
    name: 'Teatro Arthur Azevedo',
    asset_type: AssetType.IMOVEL,
    protection_level: ProtectionLevel.ESTADUAL,
    status: AssetStatus.TOMBADO,
    municipality: 'São Luís',
    address_text: 'Rua do Sol, S/N - Centro',
    latitude: -2.5298,
    longitude: -44.3025,
    legal_basis: {
      instrument_type: 'Lei Estadual',
      instrument_number: '567',
      instrument_date: '1960-12-01',
      summary: 'Patrimônio cultural maranhense.'
    },
    description: 'Um dos teatros mais antigos e belos do Brasil, marco da "Atenas Brasileira".',
    department_responsible: Department.DPHAP,
    tags: ['Cultura', 'Teatro', 'Neoclássico'],
    image_url: 'https://picsum.photos/seed/teatro/800/600'
  },
  {
    id: '3',
    code: 'AL-001',
    name: 'Igreja de N.S. do Carmo',
    asset_type: AssetType.IMOVEL,
    protection_level: ProtectionLevel.FEDERAL,
    status: AssetStatus.TOMBADO,
    municipality: 'Alcântara',
    address_text: 'Praça da Matriz',
    latitude: -2.4082,
    longitude: -44.4147,
    legal_basis: {
      instrument_type: 'Portaria IPHAN',
      instrument_number: '12',
      instrument_date: '1948-03-20',
      summary: 'Tombamento do conjunto urbano de Alcântara.'
    },
    description: 'Ruínas e estrutura remanescente de grande valor arquitetônico colonial.',
    department_responsible: Department.DPHAP,
    tags: ['Religioso', 'Ruínas'],
    image_url: 'https://picsum.photos/seed/alcantara/800/600'
  },
  // Adding more assets to fulfill the 20 sample requirement
  ...Array.from({ length: 17 }).map((_, i) => ({
    id: `asset-${i + 4}`,
    code: `GEN-${i + 4}`,
    name: `Bem Cultural Exemplo ${i + 4}`,
    asset_type: AssetType.IMOVEL,
    protection_level: i % 2 === 0 ? ProtectionLevel.ESTADUAL : ProtectionLevel.FEDERAL,
    status: AssetStatus.TOMBADO,
    municipality: i % 3 === 0 ? 'Imperatriz' : (i % 2 === 0 ? 'Caxias' : 'Rosário'),
    address_text: `Rua Exemplo, ${i * 10}`,
    latitude: -2.5 + (Math.random() * 0.5),
    longitude: -44.3 + (Math.random() * 0.5),
    legal_basis: {
      instrument_type: 'Decreto',
      instrument_number: `${1000 + i}`,
      instrument_date: '1990-01-01',
      summary: 'Tombamento de exemplo.'
    },
    description: 'Este é um bem cultural fictício para fins de demonstração do sistema GIS.',
    department_responsible: i % 2 === 0 ? Department.DPHAP : Department.DPE,
    tags: ['Exemplo', 'Patrimônio'],
    image_url: `https://picsum.photos/seed/asset${i}/800/600`
  }))
];

export const MOCK_POLYGONS: TombamentoPolygon[] = [
  {
    id: 'poly-1',
    code: 'CH-SLZ',
    name: 'Centro Histórico de São Luís',
    municipality: 'São Luís',
    department_responsible: Department.DPHAP,
    legal_basis: { instrument_type: 'Decreto Federal', instrument_number: '123', instrument_date: '1974', summary: 'Tombamento do conjunto arquitetônico.' },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-44.3090, -2.5270], [-44.3010, -2.5270], [-44.3010, -2.5330], [-44.3090, -2.5330], [-44.3090, -2.5270]
      ]]
    }
  },
  {
    id: 'poly-2',
    code: 'CH-ALC',
    name: 'Setor Histórico de Alcântara',
    municipality: 'Alcântara',
    department_responsible: Department.DPHAP,
    legal_basis: { instrument_type: 'Decreto', instrument_number: '45', instrument_date: '1948', summary: 'Cidade Monumento.' },
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-44.4200, -2.4050], [-44.4100, -2.4050], [-44.4100, -2.4150], [-44.4200, -2.4150], [-44.4200, -2.4050]
      ]]
    }
  }
];

export const MOCK_PROJECTS = [
  { id: 'p1', name: 'Revitalização Rua Grande', status: ProjectStatus.CONCLUIDO, dept: Department.DPE, description: 'Requalificação urbana do principal eixo comercial histórico.' },
  { id: 'p2', name: 'Restauração do Palácio das Lágrimas', status: ProjectStatus.EM_ANDAMENTO, dept: Department.DPE, description: 'Recuperação estrutural e de fachada.' },
  { id: 'p3', name: 'Plano Diretor de Alcântara', status: ProjectStatus.PLANEJADO, dept: Department.DPE, description: 'Desenvolvimento de diretrizes para o núcleo urbano.' }
];

export const MOCK_INTANGIBLE = [
  { id: 'i1', name: 'Bumba Meu Boi do Maranhão', community: 'Diversas', status: 'Registrado', dept: Department.DPI },
  { id: 'i2', name: 'Tambor de Crioula', community: 'Comunidades Quilombolas', status: 'Registrado', dept: Department.DPI },
  { id: 'i3', name: 'Festa do Divino Espírito Santo', community: 'Alcântara/São Luís', status: 'Registrado', dept: Department.DPI }
];
