
export interface HeritageSiteInventory {
    decreto: string;
    data_tombamento: string;
    livro_tombo: string;
    inscricao: string;
}

export interface HeritageAsset {
    id: string;
    titulo: string;
    categoria?: string;
    cidade: string;
    endereco_original: string;
    endereco_canonico?: string;
    lat: number;
    lng: number;
    geocode_confidence: number;
    geocode_precision: "rooftop" | "street" | "place" | "municipality" | "unknown";
    geocode_source_urls?: string[];
    status: "ok" | "needs_review" | "no_result";
    type: "point";
    tags?: string[];
    // Data expansion for SIG / Inventory
    descricao?: string;
    propriedade?: "privado" | "público" | "institucional" | "misto";
    uso_atual?: string;
    ano_construcao?: string;
    estilo_arquitetonico?: string;
    imagens_historicas?: string[];
    // GeoManager / Routing
    graphNode?: string;
    inventory?: HeritageSiteInventory;
    conservation_status?: "Regular" | "Em Obras" | "Alerta";
    tipologia?: string;
    entrance?: { lat: number; lng: number };
    documentos?: {
        name: string;
        url: string;
        type: 'pdf' | 'image' | 'doc' | 'other';
        uploadedAt: string;
    }[];
}


export interface HeritageArea {
    id: string;
    titulo: string;
    cidade: string;
    tipo_area: "federal" | "estadual" | "municipal" | "centro_historico" | "sitio_historico" | "area_paisagistica" | "sitio_arqueologico" | "sitio_paleontologico" | "outro";
    geojson: any;
    status: "ok" | "needs_review";
    type: "area";
    cor?: string;
    documentos?: {
        name: string;
        url: string;
        type: 'pdf' | 'image' | 'doc' | 'other';
        uploadedAt: string;
    }[];
}


export interface InfractionRule {
    tipo: string;
    min_ufr: number;
    max_ufr: number;
    categoria: "Leve" | "Média" | "Grave" | "Gravíssima";
}

export interface Waypoint {
    id: string;
    coords: [number, number];
}

export interface Connection {
    from: string;

    to: string;
}

export interface DraftZone {
    id?: string;
    points: [number, number][];
    title: string;
    type: 'federal' | 'estadual' | 'municipal';
    color: string;
    areaM2?: number;
}
