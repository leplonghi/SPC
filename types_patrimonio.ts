
export interface HeritageAsset {
    id: string; // slug from title
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
}

export interface HeritageArea {
    id: string;
    titulo: string;
    cidade: string;
    tipo_area: "centro_historico" | "sitio_historico" | "area_paisagistica" | "sitio_arqueologico" | "sitio_paleontologico" | "outro";
    geojson: any; // GeoJSON object
    status: "ok" | "needs_review";
    type: "area";
}

export interface GeocodeCacheEntry {
    query: string;
    result: any;
    timestamp: number;
}
