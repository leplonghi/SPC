
export enum Department {
  DPE = 'DPE',
  DPHAP = 'DPHAP',
  DPI = 'DPI'
}

export enum AssetType {
  IMOVEL = 'Imóvel',
  CONJUNTO = 'Conjunto',
  MONUMENTO = 'Monumento',
  PAISAGEM = 'Paisagem',
  OUTRO = 'Outro'
}

export enum ProtectionLevel {
  ESTADUAL = 'Estadual',
  FEDERAL = 'Federal',
  MUNICIPAL = 'Municipal',
  MISTO = 'Misto'
}

export enum AssetStatus {
  TOMBADO = 'Tombado',
  INVENTARIADO = 'Inventariado',
  EM_ESTUDO = 'Em Estudo',
  OUTRO = 'Outro'
}

export enum ProjectStatus {
  PLANEJADO = 'Planejado',
  EM_ANDAMENTO = 'Em Andamento',
  CONCLUIDO = 'Concluído',
  SUSPENSO = 'Suspenso'
}

export interface LegalBasis {
  instrument_type: string;
  instrument_number: string;
  instrument_date: string;
  summary: string;
}

export interface HeritageAsset {
  id: string;
  code: string;
  name: string;
  popular_names?: string[];
  asset_type: AssetType;
  protection_level: ProtectionLevel;
  status: AssetStatus;
  municipality: string;
  address_text: string;
  latitude: number;
  longitude: number;
  geometry_polygon?: any; // GeoJSON
  legal_basis: LegalBasis;
  description: string;
  department_responsible: Department;
  tags: string[];
  image_url: string;
}

export interface TombamentoPolygon {
  id: string;
  code: string;
  name: string;
  municipality: string;
  geometry: any; // GeoJSON
  legal_basis: LegalBasis;
  department_responsible: Department;
}

export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN_SPC = 'AdminSPC',
  EDITOR_DPE = 'EditorDPE',
  EDITOR_DPHAP = 'EditorDPHAP',
  EDITOR_DPI = 'EditorDPI',
  VIEWER = 'Viewer'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department?: Department;
}
