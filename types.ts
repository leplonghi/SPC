
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
  COLABORADOR = 'Colaborador',
  VIEWER = 'Viewer'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department?: Department;
}

export enum IngestionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  NEEDS_CORRECTION = 'needs_correction',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

export enum IngestionContentType {
  LEGISLACAO = 'legislação',
  REPOSITORIO_TECNICO = 'repositório técnico',
  ACERVO_DIGITAL = 'acervo digital',
  BEM_CULTURAL = 'bem cultural',
  POLIGONAL_MAPA = 'poligonal/mapa',
  SERVICO = 'serviço',
  DEPARTAMENTO = 'departamento',
  PROJETO = 'projeto'
}

export interface IngestionItem {
  id: string;
  title: string;
  description: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string; // ISO String
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileExtension: string;
  fileSize: number;
  suggestedModule: string;
  suggestedCategory?: string;
  department: Department;
  municipality?: string;
  relatedAssetId?: string;
  relatedAreaId?: string;
  declaredSource: string;
  author?: string;
  rights?: string;
  tags: string[];
  status: IngestionStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  publishedCollection?: string;
  publishedItemId?: string;
  metadata?: {
    geoValid?: boolean;
    geoError?: string;
    coordinatesSystem?: string;
    geometryType?: string;
    width?: number;
    height?: number;
    [key: string]: any;
  };
  auditTrail: {
    action: string;
    userId: string;
    userName: string;
    timestamp: string;
    notes?: string;
  }[];
}

export interface UploadBatch {
  id: string;
  batchName: string;
  uploadedBy: string;
  uploadedAt: string;
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  notes?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  previousData?: any;
  newData?: any;
  notes?: string;
}

export interface RepositorioItem {
  id: string;
  title: string;
  description: string;
  category: 'dossie' | 'publicacao' | 'livro' | 'artigo' | 'dissertacao_tese' | 'revista' | 'edital' | 'ata' | 'afins';
  subcategory: string;
  department: 'DPHAP' | 'DPI' | 'DPE' | 'Geral';
  date: string; // YYYY-MM-DD
  format: 'PDF' | 'DOCX' | 'ZIP' | 'LINK';
  size: string;
  tags: string[];
  downloadUrl: string;

  // Informações extraídas
  executiveSummary: string;
  highlights: string[];
  pageCount: number;
  language: string;
  year: number;
}

