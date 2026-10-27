
/**
 * LotImportService — parse DXF, GeoJSON and Shapefile into HeritageLot-compatible GeoJSON
 */

import { HeritageLot } from '../types_patrimonio';
import { calculateArea } from './geoUtils';

// --- GeoJSON Import ---

export function parseGeoJSONLots(raw: string): Partial<HeritageLot>[] {
    try {
        const fc = JSON.parse(raw);
        const features = fc.type === 'FeatureCollection'
            ? fc.features
            : fc.type === 'Feature'
                ? [fc]
                : [];

        return features
            .filter((f: any) => f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon')
            .map((f: any, i: number) => {
                const props = f.properties || {};
                const coords = f.geometry.type === 'Polygon'
                    ? f.geometry.coordinates[0]
                    : f.geometry.coordinates[0][0];

                const leafletCoords: [number, number][] = coords.map((c: number[]) => [c[1], c[0]]);
                const areaM2 = calculateArea(leafletCoords);

                return {
                    id: `import-geojson-${Date.now()}-${i}`,
                    titulo: props.name || props.titulo || props.NOME || `Lote ${i + 1}`,
                    numero_lote: props.lote || props.numero_lote || props.LOT || undefined,
                    matricula: props.matricula || props.MATRICULA || undefined,
                    bairro: props.bairro || props.BAIRRO || undefined,
                    logradouro: props.logradouro || props.LOGRADOURO || props.rua || undefined,
                    area_m2: areaM2,
                    geojson: f,
                    status: 'needs_review' as const,
                    type: 'lot' as const,
                    fonte: 'geojson_import' as const,
                    importedAt: new Date().toISOString(),
                    asset_ids: [],
                };
            });
    } catch (e) {
        console.error('GeoJSON parse error:', e);
        return [];
    }
}

// --- DXF Import ---
// Uses the 'dxf' npm package (already installed)

export async function parseDXFLots(dxfContent: string): Promise<Partial<HeritageLot>[]> {
    try {
        // Dynamic import so it doesn't block initial load
        const { parseString, denormalise, toPolylines } = await import('dxf');
        const parsed = parseString(dxfContent);
        const entities = denormalise(parsed);
        const lots: Partial<HeritageLot>[] = [];

        let idx = 0;
        for (const entity of entities) {
            // Handle LWPOLYLINE, POLYLINE, LINE as lot boundaries
            if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
                const vertices: [number, number][] = (entity.vertices || [])
                    .map((v: any) => [v.y ?? 0, v.x ?? 0] as [number, number]);

                if (vertices.length < 3) continue;

                const coords = vertices.map(v => [v[1], v[0]]); // back to [lng, lat]
                const closedCoords = [...coords, coords[0]];

                const geojson = {
                    type: 'Feature',
                    geometry: { type: 'Polygon', coordinates: [closedCoords] },
                    properties: { layer: entity.layer || 'DXF', source: 'dxf' },
                };

                const areaM2 = calculateArea(vertices);

                lots.push({
                    id: `import-dxf-${Date.now()}-${idx++}`,
                    titulo: `Lote DXF ${idx} (${entity.layer || 'sem camada'})`,
                    area_m2: areaM2,
                    geojson,
                    status: 'needs_review',
                    type: 'lot',
                    fonte: 'dxf_import',
                    importedAt: new Date().toISOString(),
                    asset_ids: [],
                });
            }
        }

        return lots;
    } catch (e) {
        console.error('DXF parse error:', e);
        throw new Error('Falha ao processar DXF. Certifique-se de que o arquivo é DXF válido (AutoCAD 2000+).');
    }
}

// --- Shapefile Import ---
// Uses the native File API + shpjs (lazy loaded)

export async function parseShapefileLots(file: File): Promise<Partial<HeritageLot>[]> {
    try {
        // shpjs handles .zip containing .shp + .dbf + .prj
        const shpjs = await import('shpjs');
        const arrayBuffer = await file.arrayBuffer();
        const geojson: any = await shpjs.default(arrayBuffer);

        const raw = JSON.stringify(geojson);
        return parseGeoJSONLots(raw);
    } catch (e) {
        console.error('Shapefile parse error:', e);
        throw new Error('Falha ao processar Shapefile. Use um arquivo .zip com .shp, .dbf e .prj.');
    }
}

// --- File Detector ---

export type ImportFormat = 'geojson' | 'dxf' | 'shapefile' | 'unknown';

export function detectFileFormat(file: File): ImportFormat {
    const name = file.name.toLowerCase();
    if (name.endsWith('.geojson') || name.endsWith('.json')) return 'geojson';
    if (name.endsWith('.dxf') || name.endsWith('.dwg')) return 'dxf';
    if (name.endsWith('.zip') || name.endsWith('.shp')) return 'shapefile';
    return 'unknown';
}

export async function importLotsFromFile(file: File): Promise<Partial<HeritageLot>[]> {
    const format = detectFileFormat(file);

    switch (format) {
        case 'geojson': {
            const text = await file.text();
            return parseGeoJSONLots(text);
        }
        case 'dxf': {
            const text = await file.text();
            return parseDXFLots(text);
        }
        case 'shapefile': {
            return parseShapefileLots(file);
        }
        default:
            throw new Error(`Formato não suportado: ${file.name}. Use .geojson, .dxf ou .zip (shapefile).`);
    }
}
