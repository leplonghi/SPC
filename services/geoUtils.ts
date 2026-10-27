
/**
 * geoUtils — shared geometric calculation utilities
 */

/** Calculate area in m² for a set of [lat, lng] coordinates (Shoelace + Haversine approximation) */
export function calculateArea(coords: [number, number][]): number {
    if (coords.length < 3) return 0;
    let area = 0;
    const R = 6378137;
    const toRad = Math.PI / 180;

    for (let i = 0; i < coords.length; i++) {
        const p1 = coords[i];
        const p2 = coords[(i + 1) % coords.length];
        area += (p2[1] * toRad - p1[1] * toRad) * (2 + Math.sin(p1[0] * toRad) + Math.sin(p2[0] * toRad));
    }
    area = area * R * R / 2;
    return Math.abs(area);
}

/** Format area in human-readable form */
export function formatArea(m2: number): string {
    if (m2 >= 10000) return `${(m2 / 10000).toFixed(2)} ha`;
    if (m2 >= 1) return `${m2.toFixed(0)} m²`;
    return `${(m2 * 10000).toFixed(0)} cm²`;
}

/** Calculate perimeter in meters for [lat, lng] coordinates */
export function calculatePerimeter(coords: [number, number][]): number {
    if (coords.length < 2) return 0;
    let perimeter = 0;
    for (let i = 0; i < coords.length; i++) {
        const p1 = coords[i];
        const p2 = coords[(i + 1) % coords.length];
        perimeter += haversineDistance(p1, p2);
    }
    return perimeter;
}

/** Haversine distance between two [lat, lng] points in meters */
export function haversineDistance(a: [number, number], b: [number, number]): number {
    const R = 6378137;
    const toRad = Math.PI / 180;
    const dLat = (b[0] - a[0]) * toRad;
    const dLng = (b[1] - a[1]) * toRad;
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const x = sinDLat * sinDLat + Math.cos(a[0] * toRad) * Math.cos(b[0] * toRad) * sinDLng * sinDLng;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Get midpoint between two [lat, lng] coords */
export function midpoint(a: [number, number], b: [number, number]): [number, number] {
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/** Convert [lat, lng][] to GeoJSON Polygon coordinates ([lng, lat][]) */
export function toGeoJSONPolygon(points: [number, number][]): number[][] {
    const coords = points.map(p => [p[1], p[0]]);
    return [...coords, coords[0]]; // close the ring
}

/** Convert GeoJSON Polygon coordinates ([lng, lat][]) to [lat, lng][] */
export function fromGeoJSONPolygon(coords: number[][]): [number, number][] {
    return coords.slice(0, -1).map(c => [c[1], c[0]]);
}
