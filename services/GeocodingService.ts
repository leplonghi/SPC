
import { db } from "../firebase";
import { collection, doc, getDoc, setDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { HeritageAsset, HeritageArea } from "../types_patrimonio";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "SPC-MA-PatrimonioMap/1.0 (contato: dph@cultura.ma.gov.br)";

class GeocodingService {
    private queue: (() => Promise<void>)[] = [];
    private isProcessing = false;
    private processedCount = 0;

    constructor() {
        // Start processing loop
        setInterval(() => this.processQueue(), 1100); // 1.1s to be safe
    }

    private async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        // Process one item
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
        for (const item of items) {
            await this.processItem(item);
            onProgress(this.processedCount);
        }
        console.log("Import finished queueing.");
    }

    private async executeGeocoding(item: any) {
        const slug = this.createSlug(item.titulo);

        // Check if exists in assets
        const assetRef = doc(db, "heritage_assets", slug);
        const assetSnap = await getDoc(assetRef);
        if (assetSnap.exists()) {
            const data = assetSnap.data();
            // Retry if it has failed previously (no lat/lng or status is no_result)
            const hasValidCoords = data.lat && data.lat !== 0;
            if (data.status === 'ok' && hasValidCoords) {
                console.log(`Item ${slug} already exists and is valid. Skipping.`);
                return;
            }
        }

        // Also check areas
        const areaRef = doc(db, "heritage_areas", slug);
        const areaSnap = await getDoc(areaRef);
        if (areaSnap.exists()) return;

        // Determine type
        const isArea = this.isArea(item);

        if (isArea) {
            // Create area entry (without polygon for now - needs manual import or advanced search)
            const areaData: HeritageArea = {
                id: slug,
                titulo: item.titulo,
                cidade: item.cidade,
                tipo_area: "outro", // default
                geojson: null,
                status: "needs_review",
                type: "area"
            };
            await setDoc(areaRef, areaData);
            console.log(`Area created: ${slug}`);
            return;
        }

        // Check for manual coordinates in seed
        const hasManualCoords = item.lat && item.lng;
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
            endereco_canonico: geocodeResult ? geocodeResult.display_name : undefined,
            lat: geocodeResult ? parseFloat(geocodeResult.lat) : 0,
            lng: geocodeResult ? parseFloat(geocodeResult.lon) : 0,
            geocode_confidence: hasManualCoords ? 1.0 : this.calculateConfidence(geocodeResult, item),
            geocode_precision: hasManualCoords ? 'rooftop' : this.determinePrecision(geocodeResult),
            status: geocodeResult ? "ok" : "no_result",
            type: "point",
            geocode_source_urls: geocodeResult && !hasManualCoords ? [`https://nominatim.openstreetmap.org/ui/details.html?place_id=${geocodeResult.place_id}`] : []
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
        const url = `${NOMINATIM_BASE_URL}?format=jsonv2&limit=1&countrycodes=br&addressdetails=1&q=${encodeURIComponent(queryStr)}`;
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

        const areaKeywords = ["centro histórico", "sítio", "área paisagística", "reserva", "município de"];
        if (areaKeywords.some(k => lowerLoc.includes(k) || lowerTitle.includes(k))) return true;
        if (lowerLoc.includes("diverso")) return true;

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
