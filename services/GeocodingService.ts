
import { db } from "../firebase";
import { collection, doc, getDoc, setDoc, query, where, getDocs, Timestamp, deleteDoc } from "firebase/firestore";
import { HeritageAsset, HeritageArea } from "../types_patrimonio";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "SPC-MA-PatrimonioMap/1.0 (contato: dph@cultura.ma.gov.br)";

class GeocodingService {
    private queue: (() => Promise<void>)[] = [];
    private isProcessing = false;
    private processedCount = 0;

    constructor() {
        // Start processing loop
        // Respect Nominatim Rate Limit (1 req/s)
        setInterval(() => this.processQueue(), 1200);
    }

    private async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        // Process 1 item per tick to respect rate limits
        const task = this.queue.shift();
        if (task) {
            try {
                await task();
                this.processedCount++;
            } catch (e) {
                console.error("Task failed", e);
            }
        }

        this.isProcessing = false;
    }

    // Normalizes query string
    normalizeQuery(location: string, city: string): string {
        let loc = location.trim();
        if (!loc) loc = city; // Fallback if empty location

        // Basic cleanup
        loc = loc.replace("Município de ", "")
            .replace("Cidade de ", "")
            .replace(/\./g, "") // remove dots like Av. -> Av
            .replace(/s\/n/gi, ""); // Remove s/n

        return `${loc}, ${city}, Maranhão, Brasil`;
    }

    // Main entry point for an item
    async processItem(item: any): Promise<void> {
        return new Promise((resolve) => {
            this.queue.push(async () => {
                await this.executeGeocoding(item);
                resolve();
            });
        });
    }

    // Bulk import
    async importSeed(items: any[], onProgress: (count: number) => void) {
        console.log(`Starting import of ${items.length} items...`);

        // Split into fast (manual) and slow (needs geocoding)
        const manualItems = items.filter(i => i.lat && i.lng);
        const autoItems = items.filter(i => !i.lat || !i.lng);

        // Process manual items immediately in parallel
        console.log(`Processing ${manualItems.length} manual coordinates items...`);
        /*
        const batchPromises = manualItems.map(async (item) => {
             await this.executeGeocoding(item);
             this.processedCount++;
             if (this.processedCount % 5 === 0) onProgress(this.processedCount);
        });
        await Promise.all(batchPromises);
        */
        // Use a simple loop to avoid firestore write contention/rate limits (though 50 is fine)
        for (const item of manualItems) {
            await this.executeGeocoding(item);
            this.processedCount++;
            onProgress(this.processedCount);
        }

        // Queue the rest
        console.log(`Queueing ${autoItems.length} items for geocoding...`);
        for (const item of autoItems) {
            await this.processItem(item);
            onProgress(this.processedCount);
        }

        console.log("Import finished.");
    }

    async clearDatabase() {
        console.log("Clearing database...");
        const collections = ["heritage_assets", "heritage_areas", "geocode_cache"];
        for (const colName of collections) {
            const q = query(collection(db, colName));
            const snapshot = await getDocs(q);
            const batchPromises = snapshot.docs.map(docSnap =>
                deleteDoc(doc(db, colName, docSnap.id))
            );
            await Promise.all(batchPromises);
            console.log(`Cleared ${colName}`);
        }
    }

    private async executeGeocoding(item: any) {
        const slug = this.createSlug(item.titulo);
        const hasManualCoords = item.lat && item.lng;
        // Determine intended type first
        const isArea = this.isArea(item) && !hasManualCoords;

        // Check if exists in assets (Points)
        const assetRef = doc(db, "heritage_assets", slug);
        const assetSnap = await getDoc(assetRef);

        // Conflict Resolution: If it exists as a POINT but should be an AREA
        if (assetSnap.exists() && isArea) {
            console.log(`Converting ${slug} from Point to Area...`);
            await deleteDoc(assetRef); // Remove point so we can create area
        } else if (assetSnap.exists()) {
            const data = assetSnap.data();
            const hasValidCoords = data.lat && data.lat !== 0;
            // Only skip if fully valid or manually set, and we're not forcefully overwriting
            if (data.status === 'ok' && hasValidCoords && !hasManualCoords) {
                console.log(`Item ${slug} already exists as valid Point. Skipping.`);
                return;
            }
        }

        // Also check areas
        const areaRef = doc(db, "heritage_areas", slug);
        const areaSnap = await getDoc(areaRef);

        // If it exists as AREA and we are processing as AREA, skip if valid
        if (areaSnap.exists() && isArea) {
            if (areaSnap.data().geojson || areaSnap.data().status === 'ok') {
                console.log(`Item ${slug} already exists as Area. Skipping.`);
                return;
            }
        }

        if (isArea) {
            // Attempt to fetch polygon for area
            // 1. Check Cache
            const queryStr = item.query_geocode || this.normalizeQuery(item.localizacao, item.cidade);
            let geocodeResult = await this.checkCache(queryStr);

            // 2. If not in cache, fetch Nominatim
            if (!geocodeResult) {
                geocodeResult = await this.fetchNominatim(queryStr);
                if (geocodeResult) {
                    await this.saveToCache(queryStr, geocodeResult);
                }
            }

            let geojson = null;
            if (geocodeResult && geocodeResult.geojson && (geocodeResult.geojson.type === 'Polygon' || geocodeResult.geojson.type === 'MultiPolygon')) {
                geojson = geocodeResult.geojson;
            }

            const areaData: HeritageArea = {
                id: slug,
                titulo: item.titulo,
                cidade: item.cidade,
                tipo_area: "federal", // Default to broad types, user can refine
                geojson: geojson,
                status: geojson ? "ok" : "needs_review",
                type: "area",
                cor: "#FF0000" // Default highlight color
            };

            // Firestore doesn't support nested arrays, so we stringify the geojson if it exists
            const areaDataForFirestore = {
                ...areaData,
                geojson: geojson ? JSON.stringify(geojson) : null
            };

            await setDoc(areaRef, areaDataForFirestore);
            console.log(`Area processed: ${slug} (GeoJSON: ${!!geojson})`);
            return;
        }

        // Check for manual coordinates in seed
        let geocodeResult = null;

        if (hasManualCoords) {
            console.log(`Using manual coords for ${slug}`);
            geocodeResult = {
                display_name: item.endereco_canonico || item.localizacao,
                lat: item.lat,
                lon: item.lng,
                place_id: `manual_${slug}`,
                type: 'manual'
            };
        } else {
            // 1. Check Cache
            const queryStr = item.query_geocode || this.normalizeQuery(item.localizacao, item.cidade);
            geocodeResult = await this.checkCache(queryStr);

            // 2. If not in cache, fetch Nominatim
            if (!geocodeResult) {
                geocodeResult = await this.fetchNominatim(queryStr);
                if (geocodeResult) {
                    await this.saveToCache(queryStr, geocodeResult);
                }
            }
        }

        // 3. Process Result
        const assetData: HeritageAsset = {
            id: slug,
            titulo: item.titulo,
            cidade: item.cidade,
            categoria: this.inferCategory(item.titulo),
            endereco_original: item.localizacao,
            endereco_canonico: geocodeResult ? geocodeResult.display_name : null,
            lat: geocodeResult ? parseFloat(geocodeResult.lat) : 0,
            lng: geocodeResult ? parseFloat(geocodeResult.lon) : 0,
            geocode_confidence: hasManualCoords ? 1.0 : this.calculateConfidence(geocodeResult, item),
            geocode_precision: hasManualCoords ? 'rooftop' : this.determinePrecision(geocodeResult),
            status: geocodeResult ? "ok" : "no_result",
            type: "point",
            geocode_source_urls: geocodeResult && !hasManualCoords ? [`https://nominatim.openstreetmap.org/ui/details.html?place_id=${geocodeResult.place_id}`] : [],
            tipologia: item.tipologia || "Não informada",
            descricao: item.descricao || item.note || null
        };

        // Validation
        if (assetData.geocode_confidence < 0.75 || assetData.lat === 0) {
            assetData.status = "needs_review";
        }

        await setDoc(assetRef, assetData);
        console.log(`Asset processed: ${slug} (${assetData.status})`);
    }

    private async checkCache(queryStr: string): Promise<any | null> {
        const q = query(collection(db, "geocode_cache"), where("query", "==", queryStr));
        const snap = await getDocs(q);
        if (!snap.empty) {
            console.log(`Cache hit for ${queryStr}`);
            return snap.docs[0].data().result;
        }
        return null;
    }

    private async saveToCache(queryStr: string, result: any) {
        await setDoc(doc(collection(db, "geocode_cache")), {
            query: queryStr,
            result: result,
            timestamp: Timestamp.now().toMillis()
        });
    }

    private async fetchNominatim(queryStr: string): Promise<any | null> {
        const url = `${NOMINATIM_BASE_URL}?format=jsonv2&limit=1&countrycodes=br&addressdetails=1&polygon_geojson=1&q=${encodeURIComponent(queryStr)}`;
        try {
            console.log(`Fetching: ${url}`);
            const res = await fetch(url, {
                // Browsers do not allow setting User-Agent directly.
            });
            if (!res.ok) {
                if (res.status === 429) console.warn("Rate limit hit!");
                return null;
            }
            const data = await res.json();
            return data.length > 0 ? data[0] : null;
        } catch (e) {
            console.error("Nominatim error", e);
            return null;
        }
    }

    private isArea(item: any): boolean {
        const lowerLoc = (item.localizacao || "").toLowerCase();
        const lowerTitle = item.titulo.toLowerCase();
        const lowerTipologia = (item.tipologia || "").toLowerCase();

        // Strict definition of Area:
        // 1. Tipologia is 'Conjunto Urbano'
        // 2. Title has 'Centro Histórico'
        // 3. Explicit municipality or broad reservations

        if (lowerTipologia.includes("conjunto urbano")) return true;

        const areaKeywords = ["centro histórico", "município de", "área de proteção"];
        if (areaKeywords.some(k => lowerTitle.includes(k))) return true;

        // 4. Forced Polygons for Requested Cities
        const forcedPolygons = ["caxias", "alcântara", "alcantara", "viana", "carolina"];
        if (forcedPolygons.some(p => lowerTitle === p || lowerTitle === `centro de ${p}` || lowerTitle === `município de ${p}`)) return true;

        return false;
    }

    private createSlug(text: string): string {
        return text.toString().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    private calculateConfidence(result: any, item: any): number {
        if (!result) return 0;
        if (result.type === 'house' || result.type === 'building') return 0.95;
        if (result.class === 'highway' || result.type === 'residential') return 0.80;
        if (result.type === 'city' || result.type === 'administrative') return 0.40;
        return 0.60;
    }

    private determinePrecision(result: any): "rooftop" | "street" | "place" | "municipality" | "unknown" {
        if (!result) return "unknown";
        if (result.addresstype === 'building' || result.addresstype === 'house_number') return "rooftop";
        if (result.addresstype === 'road' || result.addresstype === 'street') return "street";
        if (result.addresstype === 'city' || result.addresstype === 'municipality') return "municipality";
        return "place";
    }

    private inferCategory(title: string): string {
        const t = title.toLowerCase();
        if (t.includes('igreja') || t.includes('capela') || t.includes('catedral') || t.includes('templo') || t.includes('convento')) return 'religious';
        if (t.includes('solar') || t.includes('sobrado') || t.includes('palacete') || t.includes('palácio') || t.includes('casa') || t.includes('edifício') || t.includes('imóvel') || t.includes('fazenda') || t.includes('engenho')) return 'civil';
        if (t.includes('ruína') || t.includes('ruínas')) return 'ruin';
        if (t.includes('forte') || t.includes('fortaleza') || t.includes('polvora')) return 'military';
        if (t.includes('fonte') || t.includes('pelourinho') || t.includes('monumento') || t.includes('obra')) return 'monument';
        if (t.includes('centro histórico') || t.includes('sítio')) return 'area';
        return 'other';
    }
}

export const geocodingService = new GeocodingService();
