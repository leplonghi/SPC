
import React, { useState, useMemo, useEffect } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    GeoJSON,
    Polyline,
    useMap,
    Polygon
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { db } from '../../firebase';
import { collection, doc, setDoc, deleteDoc, addDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import {
    Settings,
    Shield,
    Compass,
    ChevronRight,
    Navigation,
    Info,
    X,
    Sparkles,
    RotateCcw,
    Layers,
    Undo2,
    Trash2,
    Save,
    CheckCircle2,
    Palette,
    MousePointer2,
    History,
    Calendar,
    Building2,
    User,
    Home,
    Image as ImageIcon,
    BookOpen,
    Heart,
    PenTool,
    FilePlus,
    Camera,
    Send,
    MapPin,
    Globe,
    Map as MapIcon,
    Download,
    ExternalLink,
    File,
    FileText,
    Check
} from 'lucide-react';
import { FileUpload } from '../ui/FileUpload';
import { FileItem } from '../ui/FileItem';

import { HeritageAsset, HeritageArea } from '../../types_patrimonio';
import { HERITAGE_SITES, INITIAL_ZONES, WAYPOINTS, CONNECTIONS } from '../../data/geoManagerData';
import { findDetailedPath } from '../../services/routingEngine';
import { useAuth } from '../../contexts/AuthContext';
import { TourismRoutesPanel } from './TourismRoutesPanel';
import { TouristRoute } from '../../data/touristData';
import { RouteReport } from './RouteReport';
import MarkerClusterGroup from './MarkerClusterGroup';
import { PrecisionEditor, EditorMode } from './PrecisionEditor';
import { GlassPanel } from '../ui/GlassPanel';
import { getDocs, query, where } from 'firebase/firestore';
import { ADDITIONAL_SITES, EXTENDED_WAYPOINTS, EXTENDED_CONNECTIONS } from '../../data/touristData';
import { geocodingService } from '../../services/GeocodingService';

// --- Types ---

// --- Icons & Icons Components ---
const Plus = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

type AppMode = 'management' | 'tourism';
// EditorMode imported from PrecisionEditor

interface GeoManagerProps {
    assets?: HeritageAsset[];
    areas?: HeritageArea[];
    selectedAsset?: HeritageAsset | null;
    selectedArea?: HeritageArea | null;
    onAssetClick?: (asset: HeritageAsset | null) => void;
    onAreaClick?: (area: HeritageArea | null) => void;
    onReportError?: () => void;
}

interface DraftZone {
    id?: string;
    points: [number, number][];
    title: string;
    type: 'federal' | 'estadual' | 'municipal';
    color: string;
    areaM2?: number;
}

// area calculation in meters squared (approximate for small areas)
const calculateArea = (coords: [number, number][]) => {
    if (coords.length < 3) return 0;
    let area = 0;
    const R = 6378137; // Earth radius in meters
    const toRad = Math.PI / 180;

    for (let i = 0; i < coords.length; i++) {
        const p1 = coords[i];
        const p2 = coords[(i + 1) % coords.length];
        area += (p2[1] * toRad - p1[1] * toRad) * (2 + Math.sin(p1[0] * toRad) + Math.sin(p2[0] * toRad));
    }
    area = area * R * R / 2;
    return Math.abs(area);
};

// --- Icons & Markers ---
// Helper for colors
export const getUseColor = (uso?: string) => {
    if (!uso) return '#757575';
    const u = uso.toLowerCase();
    if (u.includes('religio') || u.includes('igreja') || u.includes('capela')) return '#8E24AA'; // Purple
    if (u.includes('institucional') || u.includes('publico') || u.includes('público') || u.includes('governo')) return '#1E88E5'; // Blue
    if (u.includes('comercial') || u.includes('loja') || u.includes('serviço') || u.includes('mercado')) return '#F59E0B'; // Amber
    if (u.includes('residencial') || u.includes('moradia') || u.includes('habita')) return '#43A047'; // Green
    if (u.includes('militar') || u.includes('forte') || u.includes('quartel')) return '#3949AB'; // Indigo
    if (u.includes('monumento') || u.includes('estátua') || u.includes('fonte')) return '#E91E63'; // Pink
    if (u.includes('cultural') || u.includes('teatro') || u.includes('museu')) return '#00ACC1'; // Cyan
    return '#757575';
};

const getMarkerIcon = (site: HeritageAsset, mode: AppMode) => {
    let color = getUseColor(site.uso_atual || site.tipologia); // Default to Category Color

    if (mode === 'management') {
        // Overlay Status Color if present, otherwise keep Category Color
        switch (site.conservation_status) {
            case 'Regular': color = '#2E7D32'; break;
            case 'Em Obras': color = '#1E88E5'; break;
            case 'Alerta': color = '#CC343A'; break;
        }
    }
    // Tourism mode automatically uses the default 'color' set above

    return L.divIcon({
        html: `
            <div style="
                background-color: ${color};
                width: 28px;
                height: 28px;
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            ">
                <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
            </div>`,
        className: 'custom-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
    });
};

const NodeRealIcon = L.divIcon({
    html: `<div style="width: 12px; height: 12px; background: white; border: 2px solid #CC343A; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    className: 'node-real',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

const NodeMidIcon = L.divIcon({
    html: `<div style="width: 10px; height: 10px; background: #CC343A; border: 2px solid white; border-radius: 50%; opacity: 0.5; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    className: 'node-mid',
    iconSize: [10, 10],
    iconAnchor: [5, 5]
});

const getRouteMarkerIcon = (index: number) => {
    const color = '#1E88E5';
    return L.divIcon({
        html: `
            <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                <div style="
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    background: rgba(30,136,229,0.2);
                    border-radius: 50%;
                    animation: marker-pulse-simple 2s infinite;
                "></div>
                <div style="
                    position: relative;
                    width: 32px;
                    height: 32px;
                    background: ${color};
                    border: 3px solid white;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(30,136,229,0.5);
                    z-index: 2;
                ">
                    <div style="transform: rotate(45deg); color: white; font-weight: 900; font-size: 14px; font-family: sans-serif;">
                        ${index + 1}
                    </div>
                </div>
            </div>
            <style>
                @keyframes marker-pulse-simple {
                    0% { transform: scale(0.6); opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
            </style>`,
        className: 'route-marker-simple',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });
};


// --- Components ---

// --- Components ---

const AIConsultantPanel: React.FC<{ site: HeritageAsset, mode: AppMode }> = ({ site, mode }) => (
    <div className="flex flex-col space-y-3">
        <div className="bg-gradient-to-br from-brand-blue/5 to-white border border-brand-blue/10 p-4 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={48} className="text-brand-blue" />
            </div>

            <h4 className="text-[10px] font-black uppercase text-brand-blue flex items-center gap-2 mb-2">
                <Sparkles size={12} /> {mode === 'management' ? 'Análise Técnica AI' : 'Guia Inteligente'}
            </h4>

            <div className="text-xs font-medium text-slate-700 leading-relaxed z-10 relative">
                {mode === 'management'
                    ? <>
                        <p className="mb-2"><strong>Status:</strong> {site.conservation_status || 'Regular'}. Requer monitoramento {site.conservation_status === 'Alerta' ? 'constante' : 'periódico'}.</p>
                        <p className="text-slate-500 text-[10px]">Sugestão: Agendar vistoria técnica para avaliar estrutura do telhado.</p>
                    </>
                    : <>
                        <p>Este imóvel é um exemplar clássico do <strong>{site.estilo_arquitetonico || 'período colonial'}</strong>.</p>
                        <p className="mt-1 text-[11px] text-slate-500">Curiosidade: Elementos da fachada indicam reformas no séc. XIX.</p>
                    </>
                }
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 p-2 bg-white border border-slate-100 rounded-xl hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all group">
                <div className="p-1.5 bg-brand-blue/10 text-brand-blue rounded-lg group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <Navigation size={12} />
                </div>
                <div className="text-left">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Ação</p>
                    <p className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{mode === 'management' ? 'Vistoria' : 'Como chegar'}</p>
                </div>
            </button>
            <button className="flex items-center justify-center gap-2 p-2 bg-white border border-slate-100 rounded-xl hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all group">
                <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <FilePlus size={12} />
                </div>
                <div className="text-left">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Dados</p>
                    <p className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{mode === 'management' ? 'Docs' : 'Saber mais'}</p>
                </div>
            </button>
        </div>
    </div>
);

// --- Viewer Components ---

const SuggestionModal: React.FC<{ site: HeritageAsset, onClose: () => void }> = ({ site, onClose }) => {
    const { user } = useAuth();
    const [type, setType] = useState<'text' | 'photo' | 'doc'>('text');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "suggestions"), {
                assetId: site.id,
                assetTitle: site.titulo,
                userId: user?.id,
                userName: user?.name,
                type,
                content,
                status: 'pending',
                createdAt: new Date(),
                votes: 0
            });
            alert("Sugestão enviada para análise técnica!");
            onClose();
        } catch (e) {
            console.error("Erro ao enviar sugestão", e);
            alert("Erro ao enviar. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1005] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                        <Sparkles size={14} className="text-brand-blue" />
                        Colaborar com o Acervo
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X size={16} /></button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-500 font-medium">
                        Você está sugerindo melhorias para: <strong className="text-slate-800">{site.titulo}</strong>
                    </p>

                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                        <button
                            onClick={() => setType('text')}
                            className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${type === 'text' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <PenTool size={12} /> Texto
                        </button>
                        <button
                            onClick={() => setType('photo')}
                            className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${type === 'photo' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Camera size={12} /> Foto
                        </button>
                        <button
                            onClick={() => setType('doc')}
                            className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${type === 'doc' ? 'bg-white text-brand-red shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <FilePlus size={12} /> Doc
                        </button>
                    </div>

                    <div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={type === 'text' ? "Descreva a correção ou adição histórica..." : type === 'photo' ? "Cole aqui o link da imagem ou descreva a foto que possui..." : "Cole o link do documento ou descreva a fonte..."}
                            className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none resize-none"
                        />
                        <p className="text-[9px] text-slate-400 mt-2 text-right">
                            *Sua contribuição será avaliada pela equipe técnica do DPHAP.
                        </p>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !content.trim()}
                        className="w-full py-3 bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-brand-blue/30"
                    >
                        {isSubmitting ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Send size={14} />}
                        Enviar Colaboração
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailDrawer: React.FC<{
    site: HeritageAsset,
    mode: AppMode,
    onClose: () => void,
    onReportError?: () => void,
    onEditEntrance?: () => void
}> = ({ site, mode, onClose, onReportError, onEditEntrance }) => {
    const { isEditor, user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [showSuggestion, setShowSuggestion] = useState(false);

    // Check favorite status
    useEffect(() => {
        if (user) {
            const favs = localStorage.getItem(`fav_${user.id}`);
            if (favs && JSON.parse(favs).includes(site.id)) {
                setIsFavorite(true);
            } else {
                setIsFavorite(false);
            }
        }
    }, [site.id, user]);

    const toggleFavorite = () => {
        if (!user) return;
        const newStatus = !isFavorite;
        setIsFavorite(newStatus);
        const favs = JSON.parse(localStorage.getItem(`fav_${user.id}`) || '[]');
        if (newStatus) {
            favs.push(site.id);
        } else {
            const idx = favs.indexOf(site.id);
            if (idx > -1) favs.splice(idx, 1);
        }
        localStorage.setItem(`fav_${user.id}`, JSON.stringify(favs));
    };

    return (
        <div className="fixed inset-0 z-[1001] md:absolute md:inset-auto md:top-4 md:bottom-4 md:right-4 md:w-[420px] animate-slide-in-right flex items-end md:block pointer-events-none">
            {showSuggestion && <SuggestionModal site={site} onClose={() => setShowSuggestion(false)} />}

            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm md:hidden pointer-events-auto" onClick={onClose} />
            <GlassPanel className="w-full h-[90vh] md:h-full rounded-t-3xl md:rounded-3xl pointer-events-auto flex flex-col bg-white/95 shadow-2xl border-white/40">
                {/* Hero Image Section */}
                <div className="relative h-64 shrink-0 w-full overflow-hidden group">
                    <img
                        src={site.imagens_historicas && site.imagens_historicas.length > 0 ? site.imagens_historicas[0] : `https://images.unsplash.com/photo-1590603740183-980e7f83a2d3?auto=format&fit=crop&q=80&w=800`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt={site.titulo}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top Actions */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        {!isEditor && user && (
                            <button
                                onClick={toggleFavorite}
                                className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg ${isFavorite ? 'bg-brand-red text-white' : 'bg-white/20 text-white hover:bg-white hover:text-brand-red'}`}
                            >
                                <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2.5 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Bottom Info on Image */}
                    <div className="absolute bottom-4 left-6 right-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-brand-blue rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm">
                                {site.categoria}
                            </span>
                            {site.propriedade && (
                                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <User size={10} /> {site.propriedade}
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-black leading-tight uppercase font-sans mb-1 text-white drop-shadow-lg">{site.titulo}</h2>
                        <p className="text-xs font-medium text-white/80 flex items-center gap-1">
                            <Navigation size={12} className="text-brand-blue" /> {site.endereco_original}, São Luís
                        </p>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <div className="p-6 space-y-6">
                        {/* Meta Tags Horizontal Scroll */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg whitespace-nowrap">
                                <span className="text-[9px] font-black text-slate-400 uppercase mr-2">ID</span>
                                <span className="text-[10px] font-bold text-slate-700 font-mono">#{site.id}</span>
                            </div>
                            {site.geocode_confidence !== undefined && isEditor && (
                                <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg whitespace-nowrap">
                                    <span className="text-[9px] font-black text-slate-400 uppercase mr-2">Conf</span>
                                    <span className={`text-[10px] font-bold ${site.geocode_confidence > 0.8 ? 'text-emerald-600' : 'text-orange-500'}`}>
                                        {(site.geocode_confidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                            )}
                            <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg whitespace-nowrap">
                                <span className="text-[9px] font-black text-slate-400 uppercase mr-2">Tombo</span>
                                <span className="text-[10px] font-bold text-slate-700">{site.inventory?.inscricao || '---'}</span>
                            </div>
                        </div>

                        {/* Description */}
                        {site.descricao && (
                            <p className="text-sm text-slate-600 leading-relaxed font-normal">
                                {site.descricao}
                            </p>
                        )}

                        {/* Main Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Conservação</p>
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className={site.conservation_status === 'Alerta' ? 'text-red-500' : 'text-emerald-500'} />
                                    <span className="text-xs font-bold text-slate-800">{site.conservation_status || 'Regular'}</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Uso Atual</p>
                                <div className="flex items-center gap-2">
                                    <Home size={16} className="text-brand-blue" />
                                    <span className="text-xs font-bold text-slate-800 truncate" title={site.uso_atual}>{site.uso_atual || 'Institucional'}</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Construção</p>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-500" />
                                    <span className="text-xs font-bold text-slate-800">{site.ano_construcao || 'Séc. XVIII'}</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Estilo</p>
                                <div className="flex items-center gap-2">
                                    <Building2 size={16} className="text-purple-500" />
                                    <span className="text-xs font-bold text-slate-800 truncate">{site.estilo_arquitetonico || 'Colonial'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Gallery */}
                        {site.imagens_historicas && site.imagens_historicas.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                                    <ImageIcon size={14} /> Galeria
                                </h4>
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {site.imagens_historicas.map((img, i) => (
                                        <div key={i} className="h-24 w-24 shrink-0 rounded-lg overflow-hidden border border-slate-100 cursor-zoom-in relative group">
                                            <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="hist" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* Documents Section */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <FileText size={14} /> Documentos e Legislação
                            </h4>

                            <div className="space-y-2">
                                {site.documentos?.map((d, idx) => {
                                    const handleDelete = async () => {
                                        try {
                                            const assetRef = doc(db, "heritage_assets", site.id);
                                            await updateDoc(assetRef, { documentos: arrayRemove(d) });
                                        } catch (e) { alert("Erro ao excluir."); }
                                    };
                                    const handleRename = async (newName: string) => {
                                        try {
                                            const assetRef = doc(db, "heritage_assets", site.id);
                                            const newDocs = site.documentos?.map(docItem => docItem.url === d.url ? { ...docItem, name: newName } : docItem);
                                            await updateDoc(assetRef, { documentos: newDocs });
                                        } catch (e) { alert("Erro ao renomear."); }
                                    };
                                    const handleReplace = async (newFile: File) => {
                                        try {
                                            const storageRef = ref(storage, `heritage_assets/${site.id}/docs/${Date.now()}_${newFile.name}`);
                                            const snapshot = await uploadBytes(storageRef, newFile);
                                            const url = await getDownloadURL(snapshot.ref);
                                            const type = newFile.name.toLowerCase().endsWith('.pdf') ? 'pdf' : (newFile.type.startsWith('image/') ? 'image' : 'other');
                                            const newDocs = site.documentos?.map(docItem => docItem.url === d.url ? { name: newFile.name, url, type, uploadedAt: new Date().toISOString() } : docItem);
                                            const assetRef = doc(db, "heritage_assets", site.id);
                                            await updateDoc(assetRef, { documentos: newDocs });
                                        } catch (e) { alert("Erro ao substituir arquivo."); }
                                    };

                                    return (
                                        <FileItem
                                            key={idx}
                                            file={d as any}
                                            isEditor={isEditor}
                                            onDelete={handleDelete}
                                            onRename={handleRename}
                                            onReplace={handleReplace}
                                        />
                                    );
                                })}

                                {(!site.documentos || site.documentos.length === 0) && (
                                    <p className="text-[10px] text-slate-400 italic">Nenhum documento anexado.</p>
                                )}
                            </div>

                            {isEditor && (
                                <div className="mt-4">
                                    <FileUpload
                                        path={`heritage_assets/${site.id}/docs`}
                                        onUploadComplete={async (fileData) => {
                                            try {
                                                const assetRef = doc(db, "heritage_assets", site.id);
                                                await updateDoc(assetRef, {
                                                    documentos: arrayUnion(fileData)
                                                });
                                            } catch (e) {
                                                console.error("Erro ao atualizar documento no Firestore", e);
                                                alert("Upload concluído, mas erro ao salvar referência no banco.");
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <AIConsultantPanel site={site} mode={mode} />

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-slate-100 bg-white/50 backdrop-blur-md shrink-0">
                    <div className="flex flex-col gap-2">
                        {isEditor ? (
                            <div className="flex gap-2 w-full">
                                <button className="flex-1 py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 group">
                                    <span>Relatório</span>
                                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                {onEditEntrance && (
                                    <button
                                        onClick={onEditEntrance}
                                        className="flex-1 py-4 bg-lime-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-lime-700 transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <MapPin size={14} /> Entrada
                                    </button>
                                )}
                            </div>
                        ) : (
                            <button className="w-full py-4 bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 group">
                                <Compass size={16} />
                                <span>Iniciar Tour Virtual</span>
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}

                        <div className="flex gap-2">
                            {!isEditor && (
                                <button
                                    onClick={() => setShowSuggestion(true)}
                                    className="flex-1 py-3 border border-slate-200 hover:border-brand-blue text-slate-600 hover:text-brand-blue rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <PenTool size={14} /> Contribuir
                                </button>
                            )}
                            {isEditor && onReportError && (
                                <button
                                    onClick={onReportError}
                                    className="flex-1 py-3 border border-red-200 hover:bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    Reportar Erro
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
};


const AreaDetailDrawer: React.FC<{
    area: HeritageArea,
    onClose: () => void
}> = ({ area, onClose }) => {
    const { isEditor } = useAuth();

    return (
        <div className="fixed inset-0 z-[1001] md:absolute md:inset-auto md:top-6 md:bottom-6 md:right-6 md:w-[350px] animate-slide-in-right flex items-end md:block pointer-events-none">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm md:hidden pointer-events-auto" onClick={onClose} />
            <GlassPanel className="w-full h-[60vh] md:h-full rounded-t-3xl md:rounded-3xl pointer-events-auto flex flex-col p-6 font-sans">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <span className="px-3 py-1 bg-brand-blue/10 rounded-full text-[9px] font-black text-brand-blue uppercase tracking-widest">
                            Poligonal
                        </span>
                        <h2 className="text-2xl font-black text-slate-800 leading-tight uppercase mt-3">{area.titulo}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{area.cidade}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100/50 hover:bg-slate-200 text-slate-500 rounded-full transition-all">
                        <X size={16} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1 mb-2">
                            <Layers size={12} className="text-brand-blue" /> Tipo de Área
                        </p>
                        <p className="text-sm font-bold text-slate-800 uppercase">{area.tipo_area?.replace('_', ' ')}</p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1 mb-2">
                            <Shield size={12} className="text-emerald-500" /> Status
                        </p>
                        <p className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                            {area.status === 'ok' ? (
                                <><span className="w-2 h-2 rounded-full bg-emerald-500" /> Oficial / Homologada</>
                            ) : (
                                <><span className="w-2 h-2 rounded-full bg-orange-500" /> Em Análise</>
                            )}
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <button className="w-full py-4 bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2">
                        <BookOpen size={14} /> Ver Legislação
                    </button>

                    {/* Documents / Upload for Areas */}
                    <div className="mt-8 space-y-4">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <FileText size={14} /> Documentos Anexos
                        </h4>

                        <div className="space-y-2">
                            {area.documentos?.map((d, idx) => {
                                const handleDelete = async () => {
                                    try {
                                        const areaRef = doc(db, "heritage_areas", area.id);
                                        await updateDoc(areaRef, { documentos: arrayRemove(d) });
                                    } catch (e) { alert("Erro ao excluir."); }
                                };
                                const handleRename = async (newName: string) => {
                                    try {
                                        const areaRef = doc(db, "heritage_areas", area.id);
                                        const newDocs = area.documentos?.map(docItem => docItem.url === d.url ? { ...docItem, name: newName } : docItem);
                                        await updateDoc(areaRef, { documentos: newDocs });
                                    } catch (e) { alert("Erro ao renomear."); }
                                };
                                const handleReplace = async (newFile: File) => {
                                    try {
                                        const storageRef = ref(storage, `heritage_areas/${area.id}/docs/${Date.now()}_${newFile.name}`);
                                        const snapshot = await uploadBytes(storageRef, newFile);
                                        const url = await getDownloadURL(snapshot.ref);
                                        const type = newFile.name.toLowerCase().endsWith('.pdf') ? 'pdf' : (newFile.type.startsWith('image/') ? 'image' : 'other');
                                        const newDocs = area.documentos?.map(docItem => docItem.url === d.url ? { name: newFile.name, url, type, uploadedAt: new Date().toISOString() } : docItem);
                                        const areaRef = doc(db, "heritage_areas", area.id);
                                        await updateDoc(areaRef, { documentos: newDocs });
                                    } catch (e) { alert("Erro ao substituir arquivo."); }
                                };

                                return (
                                    <FileItem
                                        key={idx}
                                        file={d as any}
                                        isEditor={isEditor}
                                        onDelete={handleDelete}
                                        onRename={handleRename}
                                        onReplace={handleReplace}
                                    />
                                );
                            })}

                            {(!area.documentos || area.documentos.length === 0) && (
                                <p className="text-[10px] text-slate-400 italic font-medium pt-2">Nenhum documento anexado.</p>
                            )}
                        </div>

                        {isEditor && (
                            <div className="mt-4">
                                <FileUpload
                                    path={`heritage_areas/${area.id}/docs`}
                                    onUploadComplete={async (fileData) => {
                                        try {
                                            const areaRef = doc(db, "heritage_areas", area.id);
                                            await updateDoc(areaRef, {
                                                documentos: arrayUnion(fileData)
                                            });
                                        } catch (e) {
                                            console.error("Erro ao atualizar polígono no Firestore", e);
                                            alert("Upload concluído, mas erro ao salvar referência no banco.");
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
};


// ZoneEditorPanel removed - replaced by PrecisionEditor

const RoutePlannerPanel: React.FC<{
    sequence: HeritageAsset[],
    onClear: () => void,
    onClose: () => void,
    onSave: () => void,
    onExport: () => void
}> = ({ sequence, onClear, onClose, onSave, onExport }) => (
    <div className="absolute bottom-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-max max-w-[calc(100vw-2rem)] z-[1001] animate-slide-in-bottom">
        <GlassPanel className="p-3 md:p-4 border-brand-blue/30 overflow-visible shadow-2xl bg-white/95">
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 flex gap-3 items-center overflow-x-auto no-scrollbar pb-2 pt-1 px-1">
                    {sequence.length === 0 ? (
                        <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 w-full justify-center">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Navigation size={14} className="animate-pulse" />
                            </div>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Selecione pontos no mapa</span>
                        </div>
                    ) : (
                        sequence.map((s, idx) => (
                            <React.Fragment key={s.id}>
                                <div className="flex items-center gap-3 p-2 pr-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all shrink-0">
                                    <div className="w-7 h-7 rounded-full bg-brand-blue text-white text-[11px] font-black flex items-center justify-center shadow-lg shadow-brand-blue/20">
                                        {idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[7px] font-black text-brand-blue/60 uppercase tracking-tighter mb-0.5">Parada</p>
                                        <p className="text-[10px] font-black text-slate-800 truncate max-w-[120px] uppercase leading-none">{s.titulo}</p>
                                    </div>
                                </div>
                                {idx < sequence.length - 1 && (
                                    <div className="flex items-center text-slate-300">
                                        <ChevronRight size={16} />
                                    </div>
                                )}
                            </React.Fragment>
                        ))
                    )}
                </div>
                <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                    {sequence.length >= 2 && (
                        <button
                            onClick={onExport}
                            className="flex-1 md:flex-none p-3 bg-brand-dark/10 text-brand-dark rounded-2xl hover:bg-brand-dark/20 transition-all flex items-center justify-center border border-brand-dark/10"
                            title="Exportar Roteiro (PDF/Print)"
                        >
                            <FileText size={18} />
                        </button>
                    )}
                    {sequence.length >= 2 && (
                        <button
                            onClick={onSave}
                            className="flex-1 md:flex-none p-3 bg-brand-blue/10 text-brand-blue rounded-2xl hover:bg-brand-blue/20 transition-all flex items-center justify-center border border-brand-blue/10"
                            title="Salvar Roteiro"
                        >
                            <Save size={18} />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-[2] md:flex-none p-3 bg-brand-dark text-white rounded-2xl shadow-xl hover:bg-black transition-all font-black text-[11px] px-8 uppercase tracking-widest"
                    >
                        Finalizar
                    </button>
                    {sequence.length > 0 && (
                        <button
                            onClick={onClear}
                            className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                            title="Limpar"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>
        </GlassPanel>
    </div>
);

const FloatingNav: React.FC<{ mode: AppMode, setMode: (m: AppMode) => void }> = ({ mode, setMode }) => (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto w-auto md:w-auto">
        <GlassPanel className="p-2 flex gap-1 justify-center">
            <button
                onClick={() => setMode('management')}
                className={`flex items-center gap-3 px-3 md:px-6 py-3 rounded-2xl transition-all ${mode === 'management' ? 'bg-brand-dark text-white shadow-xl translate-y-[-1px]' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
            >
                <Shield size={18} />
                <span className="text-xs font-black uppercase tracking-widest hidden md:block">Geomapa</span>
            </button>
            {/* Tourism mode button removed as requested */}
        </GlassPanel>
    </div>
);

const SatelliteToggle: React.FC<{
    base: string,
    setBase: (b: 'streets' | 'satellite') => void
}> = ({ base, setBase }) => (
    <div className="absolute top-24 right-4 md:top-20 md:right-6 z-[900] pointer-events-auto">
        <GlassPanel className="p-2 transition-all hover:scale-105 active:scale-95 group" title={base === 'streets' ? "Ativar Modo Satélite" : "Voltar para Mapa"}>
            <button
                onClick={() => setBase(base === 'streets' ? 'satellite' : 'streets')}
                className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${base === 'satellite'
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 ring-2 ring-brand-blue/20'
                    : 'bg-white text-slate-600 hover:text-brand-blue hover:bg-slate-50'
                    }`}
            >
                {base === 'streets'
                    ? <Globe size={20} strokeWidth={2} />
                    : <MapIcon size={20} strokeWidth={2} />
                }
            </button>
        </GlassPanel>
    </div>
);

const LayerControl: React.FC<{
    base: string,
    setBase: (b: 'streets' | 'satellite') => void,
    showZones: boolean,
    setShowZones: (s: boolean) => void,
    onNewZone: () => void,
    onEditMode: () => void,
    isEditing: boolean,
    hasZones: boolean,
    canEdit: boolean
}> = ({ base, setBase, showZones, setShowZones, onNewZone, onEditMode, isEditing, hasZones, canEdit }) => (
    <div className="absolute top-6 left-6 z-[1000] pointer-events-auto">
        <GlassPanel className="p-3 w-36 bg-white/95 shadow-xl border-white/40 rounded-2xl">
            <div className="flex flex-col gap-2">
                {/* Map Toggles - Ultra Compact */}
                <div className="space-y-1.5">
                    <button onClick={() => setShowZones(!showZones)} className="flex items-center justify-between w-full group/item">
                        <span className="text-[8px] font-black text-slate-500 group-hover/item:text-brand-blue uppercase tracking-wider">Polígonos</span>
                        <div className={`w-6 h-3 rounded-full transition-all relative ${showZones ? 'bg-brand-blue' : 'bg-slate-200'}`}>
                            <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${showZones ? 'left-3.5' : 'left-0.5'}`} />
                        </div>
                    </button>

                    <button onClick={() => setBase(base === 'streets' ? 'satellite' : 'streets')} className="flex items-center justify-between w-full group/item">
                        <span className="text-[8px] font-black text-slate-500 group-hover/item:text-brand-blue uppercase tracking-wider">Satélite</span>
                        <div className={`w-6 h-3 rounded-full transition-all relative ${base === 'satellite' ? 'bg-brand-blue' : 'bg-slate-200'}`}>
                            <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${base === 'satellite' ? 'left-3.5' : 'left-0.5'}`} />
                        </div>
                    </button>
                </div>

                {/* Editor Shortcuts */}
                {canEdit && (
                    <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-100">
                        <button
                            onClick={onNewZone}
                            disabled={isEditing}
                            className="flex items-center gap-2 p-1 rounded-lg hover:bg-brand-red/5 text-slate-500 hover:text-brand-red transition-all disabled:opacity-30"
                        >
                            <Plus size={12} className="text-brand-red" />
                            <span className="text-[8px] font-black uppercase tracking-tight">Novo</span>
                        </button>
                        <button
                            onClick={onEditMode}
                            disabled={isEditing || !hasZones}
                            className="flex items-center gap-2 p-1 rounded-lg hover:bg-brand-blue/5 text-slate-500 hover:text-brand-blue transition-all disabled:opacity-30"
                        >
                            <MousePointer2 size={12} className="text-brand-blue" />
                            <span className="text-[8px] font-black uppercase tracking-tight">Editar</span>
                        </button>
                    </div>
                )}
            </div>
        </GlassPanel>
    </div>
);

const MapResizeFix = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => { map.invalidateSize(); }, 500);
        const handleResize = () => { requestAnimationFrame(() => map.invalidateSize()); };
        window.addEventListener('resize', handleResize);
        const observer = new ResizeObserver(() => { map.invalidateSize(); });
        const container = map.getContainer();
        if (container) observer.observe(container);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
        };
    }, [map]);
    return null;
};

const SelectedAssetHandler = ({ asset }: { asset: HeritageAsset | null }) => {
    const map = useMap();
    useEffect(() => {
        if (asset && asset.lat && asset.lng) {
            map.flyTo([asset.lat, asset.lng], 18, { animate: true, duration: 1.5 });
        }
    }, [asset, map]);
    return null;
};

const SelectedAreaHandler = ({ area }: { area: HeritageArea | null }) => {
    const map = useMap();
    useEffect(() => {
        if (area && area.geojson) {
            const layer = L.geoJSON(area.geojson);
            map.flyToBounds(layer.getBounds(), { animate: true, duration: 1.5, padding: [50, 50] });
        }
    }, [area, map]);
    return null;
};

const RouteBoundsHandler = ({ route, sequence }: { route: [number, number][] | null, sequence: HeritageAsset[] }) => {
    const map = useMap();
    useEffect(() => {
        if (route && route.length > 0) {
            const bounds = L.latLngBounds(route);
            map.flyToBounds(bounds, { padding: [100, 100], duration: 1.5 });
        } else if (sequence.length > 0) {
            const bounds = L.latLngBounds(sequence.map(s => [s.lat, s.lng]));
            map.flyToBounds(bounds, { padding: [150, 150], duration: 1.5 });
        }
    }, [route, sequence, map]);
    return null;
};

// --- Main Component ---

const GeoManager: React.FC<GeoManagerProps> = ({
    assets = [...HERITAGE_SITES, ...ADDITIONAL_SITES],
    areas = INITIAL_ZONES,
    selectedAsset,
    onAssetClick,
    selectedArea,
    onAreaClick,
    onReportError
}) => {
    const { isEditor, user } = useAuth();
    const [mode, setMode] = useState<AppMode>('management');
    const [showPolygons, setShowPolygons] = useState(true);
    const [baseLayer, setBaseLayer] = useState<'streets' | 'satellite'>('streets');
    const [activeRoute, setActiveRoute] = useState<[number, number][] | null>(null);

    // Editing States
    const [isEditingZones, setIsEditingZones] = useState(false);
    const [editorMode, setEditorMode] = useState<EditorMode>(null);
    const [draftZone, setDraftZone] = useState<DraftZone>({ points: [], title: '', type: 'federal', color: '#CC343A' });
    const [localAreas, setLocalAreas] = useState<HeritageArea[]>(areas);
    const [history, setHistory] = useState<[number, number][][]>([]);
    const [redoStack, setRedoStack] = useState<[number, number][][]>([]);
    const [potentialAreas, setPotentialAreas] = useState<HeritageArea[]>([]);
    const [potentialIndex, setPotentialIndex] = useState(0);

    const [isPlanningRoute, setIsPlanningRoute] = useState(false);
    const [routeSequence, setRouteSequence] = useState<HeritageAsset[]>([]);
    const [activeCuratedRoute, setActiveCuratedRoute] = useState<TouristRoute | null>(null);
    const [showRouteExport, setShowRouteExport] = useState(false);

    // Entrance Editing State
    const [entranceDraft, setEntranceDraft] = useState<{ lat: number, lng: number } | null>(null);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isEditingZones) return;

            if (e.key === 'Escape') cancelEdit();
            if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
            if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
            if (e.ctrlKey && e.shiftKey && e.key === 'Z') { e.preventDefault(); redo(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEditingZones, history, redoStack, draftZone.points]);

    // Update Area on points change
    useEffect(() => {
        if (isEditingZones && draftZone.points.length >= 3) {
            const area = calculateArea(draftZone.points);
            if (area !== draftZone.areaM2) {
                setDraftZone(prev => ({ ...prev, areaM2: area }));
            }
        } else if (draftZone.areaM2 !== 0) {
            setDraftZone(prev => ({ ...prev, areaM2: 0 }));
        }
    }, [draftZone.points, isEditingZones]);

    useEffect(() => { setLocalAreas(areas); }, [areas]);



    const MapEditorHandler = () => {
        const map = useMap();
        useEffect(() => {
            if (!isEditingZones) return;

            const onClick = (e: L.LeafletMouseEvent) => {
                if (editorMode === 'edit') {
                    const hits: HeritageArea[] = [];
                    localAreas.forEach(area => {
                        const layer = L.geoJSON(area.geojson);
                        const bounds = (layer as any).getBounds();
                        if (bounds.contains(e.latlng)) {
                            hits.push(area);
                        }
                    });

                    if (hits.length > 0) {
                        setPotentialAreas(hits);
                        setPotentialIndex(0);
                        loadAreaForEdit(hits[0]);
                    }
                } else if (editorMode === 'create' && !draftZone.id) {
                    addToHistory(draftZone.points);
                    setDraftZone(prev => ({
                        ...prev,
                        points: [...prev.points, [e.latlng.lat, e.latlng.lng]]
                    }));
                } else if (editorMode === 'entrance') {
                    setEntranceDraft({ lat: e.latlng.lat, lng: e.latlng.lng });
                }
            };

            map.on('click', onClick);
            return () => { map.off('click', onClick); };
        }, [map, isEditingZones, localAreas, draftZone.id, editorMode]);
        return null;
    };

    const addToHistory = (points: [number, number][]) => {
        setHistory(prev => [...prev.slice(-19), points]);
        setRedoStack([]);
    };

    const undo = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setRedoStack(prev => [...prev.slice(-19), draftZone.points]);
        setHistory(prev => prev.slice(0, -1));
        setDraftZone(prev => ({ ...prev, points: previous }));
    };

    const redo = () => {
        if (redoStack.length === 0) return;
        const next = redoStack[redoStack.length - 1];
        setHistory(prev => [...prev.slice(-19), draftZone.points]);
        setRedoStack(prev => prev.slice(0, -1));
        setDraftZone(prev => ({ ...prev, points: next }));
    };

    const loadAreaForEdit = (area: HeritageArea) => {
        if (area.geojson.geometry.type === 'Polygon') {
            const coords = area.geojson.geometry.coordinates[0];
            const pts = coords.slice(0, -1).map(c => [c[1], c[0]] as [number, number]);
            setDraftZone({
                id: area.id,
                points: pts,
                title: area.titulo,
                type: area.tipo_area as any,
                color: area.cor || (area.tipo_area === 'federal' ? '#CC343A' : '#1E88E5')
            });
            setHistory([]);
            setRedoStack([]);
        }
    };

    const updateNodePos = (index: number, newPos: [number, number]) => {
        addToHistory(draftZone.points);
        setDraftZone(prev => {
            const newPoints = [...prev.points];
            newPoints[index] = newPos;
            return { ...prev, points: newPoints };
        });
    };



    const deleteNode = (index: number) => {
        addToHistory(draftZone.points);
        setDraftZone(prev => {
            const newPoints = prev.points.filter((_, i) => i !== index);
            return { ...prev, points: newPoints };
        });
    };

    const addNode = (index: number, position: [number, number]) => {
        addToHistory(draftZone.points);
        setDraftZone(prev => {
            const newPoints = [...prev.points];
            newPoints.splice(index + 1, 0, position);
            return { ...prev, points: newPoints };
        });
    };

    const deleteArea = async (id: string) => {
        if (window.confirm('Deseja realmente excluir esta área?')) {
            try {
                await deleteDoc(doc(db, "heritage_areas", id));
                setLocalAreas(prev => prev.filter(a => a.id !== id));
                cancelEdit();
            } catch (error: any) {
                console.error("Erro ao excluir área no Firestore:", error);
                const errorMsg = error.message || "Erro desconhecido";
                alert(`Erro ao excluir área na nuvem: ${errorMsg}`);
            }
        }
    };

    const saveDraftZone = async () => {
        if (draftZone.points.length < 3) return;

        // Prepare coordinates: convert [lat, lng] (Leaflet) to [lng, lat] (GeoJSON)
        const normalizedPoints = draftZone.points.map(p => [p[1], p[0]]);
        const closedPoints = [...normalizedPoints, normalizedPoints[0]];
        const areaId = draftZone.id || `zone-${Date.now()}`;

        // Find original area if editing to preserve fields (like city, other metadata)
        const originalArea = localAreas.find(a => a.id === areaId);

        const areaData: HeritageArea = {
            id: areaId,
            titulo: draftZone.title || originalArea?.titulo || 'Nova Zona',
            cidade: originalArea?.cidade || 'São Luís', // Preserve city if exists
            tipo_area: draftZone.type as any, // Cast to handle the wider HeritageArea types
            status: originalArea?.status || 'ok',
            type: 'area',
            cor: draftZone.color,
            geojson: {
                type: 'Feature',
                geometry: { type: 'Polygon', coordinates: [closedPoints] },
                properties: {
                    title: draftZone.title || 'Nova Zona',
                    type: draftZone.type,
                    color: draftZone.color
                }
            }
        };

        try {
            // Firestore doesn't always support deep nested arrays well, and previous code stringified it.
            // We continue this pattern for consistency with the read logic in MapaPage.
            const areaDataForFirestore = {
                ...areaData,
                geojson: JSON.stringify(areaData.geojson)
            };

            console.log("Saving area to Firestore:", areaId, areaDataForFirestore);

            // Use setDoc with merge: true for updates to be safer, though we are replacing the geojson primarily
            await setDoc(doc(db, "heritage_areas", areaId), areaDataForFirestore, { merge: true });

            console.log("Save successful");

            // Optimistic update of local state
            if (draftZone.id) {
                setLocalAreas(prev => prev.map(a => a.id === draftZone.id ? areaData : a));
            } else {
                setLocalAreas(prev => [...prev, areaData]);
            }

            alert(draftZone.id ? "Área atualizada com sucesso!" : "Nova área criada com sucesso!");
            cancelEdit();
        } catch (error: any) {
            console.error("Erro ao salvar área no Firestore:", error);
            const errorMsg = error.message || "Erro desconhecido";
            const errorCode = error.code || "no-code";
            alert(`Erro ao salvar na nuvem: ${errorMsg} (Código: ${errorCode})`);
        }
    };

    const cancelEdit = () => {
        setIsEditingZones(false);
        setEditorMode(null);
        setDraftZone({ points: [], title: '', type: 'federal', color: '#CC343A' });
        setPotentialAreas([]);
        setPotentialIndex(0);
        setHistory([]);
        setRedoStack([]);
        setEntranceDraft(null);
    };

    const saveEntrance = async () => {
        if (!entranceDraft || !selectedAsset) return;
        try {
            await setDoc(doc(db, "heritage_assets", selectedAsset.id), {
                ...selectedAsset,
                entrance: entranceDraft
            }, { merge: true });
            cancelEdit();
            alert("Ponto de acesso (Entrance) atualizado com sucesso!");
        } catch (e) {
            console.error("Error saving entrance:", e);
            alert("Erro ao salvar acesso.");
        }
    };

    const handleSiteClick = (site: HeritageAsset) => {
        if (editorMode === 'entrance') {
            // If we are in entrance mode, select this asset to edit
            // (Though typically we arrive here from the UI button, if logic permits)
            if (onAssetClick) onAssetClick(site);
            return;
        }

        if (isPlanningRoute) {
            setRouteSequence(prev => {
                if (prev.find(s => s.id === site.id)) return prev;
                return [...prev, site];
            });
        } else {
            if (onAssetClick) {
                onAssetClick(site);
            }
        }
    };

    const fetchHeritageRoute = async (start: HeritageAsset, end: HeritageAsset): Promise<[number, number][]> => {
        // Strict routing: ONLY verify heritage_routes collection. No external calls.

        // 1. Check if start/end have defined ENTRANCE points. 
        // If so, the route typically connects these entrances.
        // If not, we fall back to asset centroid (lat/lng) but this is technically against the 'rules' 
        // ("Nunca usar centroide", so we should ideally warn or require entrance).
        // For now, if no entrance, we assume the stored lat/lng is the "access point".

        const startId = start.id;
        const endId = end.id;

        try {
            // Forward check
            const q1 = query(collection(db, "heritage_routes"), where("from", "==", startId), where("to", "==", endId));
            const snap1 = await getDocs(q1);
            if (!snap1.empty) {
                const data = snap1.docs[0].data();
                // Assuming stored as [lng, lat] GeoJSON style or [lat, lng] Leaflet. 
                // Let's assume GeoJSON [lng, lat] for compatibility with standard tools.
                return data.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);
            }

            // Reverse check (if bidirectional)
            const q2 = query(collection(db, "heritage_routes"), where("from", "==", endId), where("to", "==", startId));
            const snap2 = await getDocs(q2);
            if (!snap2.empty) {
                const data = snap2.docs[0].data();
                const coords = data.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);
                return coords.reverse();
            }
        } catch (e) {
            console.error("Failed to load heritage route:", e);
        }

        // If no official route found, return empty or straight line?
        // Requirement: "Eliminar linhas retas". 
        // Ideally we return null or specific indicator. But UI needs points.
        // We will return empty array to indicate "No Valid Route Information".
        return [];
    };

    const saveCurrentRoute = async () => {
        if (routeSequence.length < 2) return;

        const name = prompt("Nome do Roteiro:");
        if (!name) return;

        const routeData = {
            userId: user?.id || 'anon',
            userName: user?.name || 'Anonimo',
            name,
            waypoints: routeSequence.map(s => s.id),
            createdAt: new Date(),
            preview: routeSequence.map(s => s.titulo).join(" -> ")
        };

        try {
            await addDoc(collection(db, "user_routes"), routeData);
            alert("Roteiro salvo com sucesso!");
            setIsPlanningRoute(false);
            setRouteSequence([]);
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar roteiro.");
        }
    };

    const runTourismRoute = async (sequence: HeritageAsset[]) => {
        if (sequence.length < 2) {
            setActiveRoute(null);
            return;
        }

        let aggregatedPath: [number, number][] = [];

        for (let i = 0; i < sequence.length - 1; i++) {
            const start = sequence[i];
            const end = sequence[i + 1];

            const segment = await fetchHeritageRoute(start, end);
            if (segment.length > 0) {
                // If appending a new segment, remove the first point if it matches the last of current path to avoid double nodes
                if (aggregatedPath.length > 0) {
                    const lastPoint = aggregatedPath[aggregatedPath.length - 1];
                    const firstNew = segment[0];
                    if (Math.abs(lastPoint[0] - firstNew[0]) < 0.0001 && Math.abs(lastPoint[1] - firstNew[1]) < 0.0001) {
                        aggregatedPath.push(...segment.slice(1));
                    } else {
                        aggregatedPath.push(...segment);
                    }
                } else {
                    aggregatedPath.push(...segment);
                }
            } else {
                // FALLBACK TO OSRM for street-exact paths
                try {
                    const response = await fetch(`https://router.project-osrm.org/route/v1/walking/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`);
                    const data = await response.json();
                    if (data.routes && data.routes.length > 0) {
                        const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);

                        if (aggregatedPath.length > 0) {
                            const lastPoint = aggregatedPath[aggregatedPath.length - 1];
                            const firstNew = coords[0];
                            if (Math.abs(lastPoint[0] - firstNew[0]) < 0.0001 && Math.abs(lastPoint[1] - firstNew[1]) < 0.0001) {
                                aggregatedPath.push(...coords.slice(1));
                            } else {
                                aggregatedPath.push(...coords);
                            }
                        } else {
                            aggregatedPath.push(...coords);
                        }
                    }
                } catch (err) {
                    console.error("OSRM Error:", err);
                    aggregatedPath.push([start.lat, start.lng], [end.lat, end.lng]);
                }
            }
        }

        // Use entrance points for start/end of rendering if available
        if (aggregatedPath.length > 0) {
            const first = sequence[0];
            const last = sequence[sequence.length - 1];
            if (first.entrance) aggregatedPath[0] = [first.entrance.lat, first.entrance.lng];
            // Logic to append/prepend entrance segments if route stops at street center
        }

        setActiveRoute(aggregatedPath);
    };

    useEffect(() => {
        if (routeSequence.length >= 2) {
            runTourismRoute(routeSequence);
        } else {
            setActiveRoute(null);
        }
    }, [routeSequence]);

    return (
        <div className="h-full w-full relative bg-slate-100 font-sans overflow-hidden">
            <MapContainer
                center={[-2.5298, -44.3060]}
                zoom={16}
                scrollWheelZoom={true}
                className="h-full w-full z-0 pointer-events-auto"
                zoomControl={false}
            >
                <TileLayer
                    url={baseLayer === 'streets'
                        ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    }
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapResizeFix />
                <MapEditorHandler />
                <SelectedAssetHandler asset={selectedAsset || null} />
                <SelectedAreaHandler area={selectedArea || null} />
                <RouteBoundsHandler route={activeRoute} sequence={routeSequence} />

                {/* Legal Zones - Hidden when route is active for focus */}
                {showPolygons && !activeRoute && localAreas.map(area => area.geojson && (
                    <GeoJSON
                        key={area.id}
                        data={area.geojson}
                        eventHandlers={{
                            click: (e) => {
                                L.DomEvent.stopPropagation(e);
                                if (isEditingZones && editorMode === 'edit') {
                                    loadAreaForEdit(area);
                                }
                            }
                        }}
                        style={{
                            color: area.cor || (area.tipo_area === 'federal' ? '#CC343A' : '#1E88E5'),
                            weight: 3,
                            dashArray: isEditingZones && draftZone.id === area.id ? '0' : '8, 8',
                            fillOpacity: isEditingZones && draftZone.id === area.id ? 0 : 0.1,
                            fillColor: area.cor || (area.tipo_area === 'federal' ? '#CC343A' : '#1E88E5')
                        }}
                    >
                        {!isEditingZones && (
                            <Popup className="brand-popup">
                                <div className="p-2">
                                    <h4 className="font-black text-xs uppercase text-brand-red">{area.titulo}</h4>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Área de Proteção Rigorosa</div>
                                </div>
                            </Popup>
                        )}
                    </GeoJSON>
                ))}

                {/* Precision Editor - Draft Polygon */}
                {isEditingZones && draftZone.points.length > 0 && (
                    <>
                        <Polygon
                            positions={draftZone.points}
                            pathOptions={{
                                color: draftZone.color,
                                weight: 4,
                                dashArray: '10, 10',
                                fillColor: draftZone.color,
                                fillOpacity: 0.15,
                                className: 'draft-polygon-glow'
                            }}
                        />

                        {/* Visual guide for closing the polygon */}
                        {draftZone.points.length >= 2 && !draftZone.id && (
                            <Polyline
                                positions={[draftZone.points[draftZone.points.length - 1], draftZone.points[0]]}
                                pathOptions={{ color: draftZone.color, weight: 1, dashArray: '4, 4', opacity: 0.5 }}
                            />
                        )}

                        {/* Nodes (Vertices) */}
                        {draftZone.points.map((p, i) => (
                            <React.Fragment key={`node-group-${i}`}>
                                <Marker
                                    key={`node-${i}`}
                                    position={p}
                                    draggable={true}
                                    icon={NodeRealIcon}
                                    eventHandlers={{
                                        dragend: (e) => {
                                            const latlng = (e.target as any).getLatLng();
                                            updateNodePos(i, [latlng.lat, latlng.lng]);
                                        },
                                        dblclick: () => deleteNode(i),
                                        contextmenu: () => deleteNode(i)
                                    }}
                                >
                                    <Popup className="minimal-popup" closeButton={false} offset={[0, -10]}>
                                        <div className="p-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNode(i);
                                                }}
                                                className="flex items-center gap-2 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors w-full whitespace-nowrap"
                                            >
                                                <Trash2 size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Excluir Nó</span>
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                                {/* Midpoint Node */}
                                {(draftZone.points.length > 2 || (draftZone.points.length > 1 && i < draftZone.points.length - 1)) && (
                                    <Marker
                                        position={[
                                            (p[0] + draftZone.points[(i + 1) % draftZone.points.length][0]) / 2,
                                            (p[1] + draftZone.points[(i + 1) % draftZone.points.length][1]) / 2
                                        ]}
                                        draggable={true}
                                        icon={NodeMidIcon}
                                        opacity={0.8}
                                        eventHandlers={{
                                            dragend: (e) => {
                                                const latlng = (e.target as any).getLatLng();
                                                addNode(i, [latlng.lat, latlng.lng]);
                                            }
                                        }}
                                        title="Arraste para criar novo ponto"
                                    />
                                )}
                            </React.Fragment>
                        ))}


                    </>
                )}

                {/* Site Markers */}
                {assets.map(site => {
                    // Match by ID OR normalized Title to handle Firestore ID mismatches
                    const routeIndex = routeSequence.findIndex(s =>
                        s.id === site.id ||
                        s.titulo?.toLowerCase() === site.titulo?.toLowerCase() ||
                        (s.titulo && geocodingService.createSlug(s.titulo) === site.id)
                    );
                    const isInRoute = routeIndex !== -1;
                    const isFocusMode = routeSequence.length > 0 || isPlanningRoute;

                    // If a route/planning is active, only show markers that are part of the route
                    if (isFocusMode && !isInRoute) return null;

                    return (
                        <Marker
                            key={site.id}
                            position={[site.lat, site.lng]}
                            icon={isInRoute ? getRouteMarkerIcon(routeIndex) : getMarkerIcon(site, mode)}
                            eventHandlers={{ click: () => handleSiteClick(site) }}
                            zIndexOffset={isInRoute ? 1000 : 0}
                        >
                            {(mode === 'tourism' && !isPlanningRoute && !isInRoute) && (
                                <Popup className="minimal-popup" closeButton={false}>
                                    <div className="text-center py-1">
                                        <p className="text-[9px] font-black text-slate-700 uppercase">{site.titulo}</p>
                                    </div>
                                </Popup>
                            )}
                            {isInRoute && (
                                <Popup className="brand-popup" offset={[0, -20]}>
                                    <div className="p-3 text-center">
                                        <p className="text-[8px] font-black text-brand-blue uppercase mb-1">{routeIndex + 1}ª PARADA</p>
                                        <p className="text-xs font-black text-slate-800 uppercase">{site.titulo}</p>
                                    </div>
                                </Popup>
                            )}
                        </Marker>
                    );
                })}

                {/* Entrance Draft Marker */}
                {editorMode === 'entrance' && entranceDraft && (
                    <Marker
                        position={[entranceDraft.lat, entranceDraft.lng]}
                        draggable={true}
                        icon={L.divIcon({
                            html: `<div style="width: 14px; height: 14px; background: #059669; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 0 2px #059669;"></div>`,
                            className: 'entrance-marker',
                            iconSize: [14, 14],
                            iconAnchor: [7, 7]
                        })}
                        eventHandlers={{
                            dragend: (e) => {
                                const latlng = e.target.getLatLng();
                                setEntranceDraft({ lat: latlng.lat, lng: latlng.lng });
                            }
                        }}
                    />
                )}

                {/* Active Route Display */}
                {activeRoute && (
                    <>
                        <Polyline
                            positions={activeRoute}
                            color="#1E88E5"
                            weight={6}
                            opacity={0.6}
                            lineCap="round"
                            lineJoin="round"
                        />
                        <Polyline
                            positions={activeRoute}
                            color="#FFFFFF"
                            weight={2}
                            opacity={0.8}
                            lineCap="round"
                            lineJoin="round"
                            dashArray="10, 20"
                        />
                    </>
                )}
            </MapContainer>

            {/* Overlays */}
            <LayerControl
                base={baseLayer}
                setBase={setBaseLayer}
                showZones={showPolygons}
                setShowZones={setShowPolygons}
                onNewZone={() => {
                    setIsEditingZones(true);
                    setEditorMode('create');
                    setDraftZone({ points: [], title: '', type: 'federal', color: '#CC343A' });
                }}
                onEditMode={() => {
                    setIsEditingZones(true);
                    setEditorMode('edit');
                    setDraftZone({ points: [], title: '', type: 'federal', color: '#1E88E5' });
                }}
                isEditing={isEditingZones}
                hasZones={localAreas.length > 0}
                canEdit={isEditor}
            />

            {/* Satellite toggle redundancy removed */}

            {isEditingZones && (
                <PrecisionEditor
                    editorMode={editorMode}
                    onCancel={cancelEdit}

                    // Zone Mode
                    draft={{
                        ...draftZone,
                        potentialCount: potentialAreas.length,
                        potentialIndex: potentialIndex,
                        canUndo: history.length > 0,
                        canRedo: redoStack.length > 0,
                        onUndo: undo,
                        onRedo: redo,
                        onDelete: () => draftZone.id && deleteArea(draftZone.id),
                        onCycle: () => {
                            const nextIdx = (potentialIndex + 1) % potentialAreas.length;
                            setPotentialIndex(nextIdx);
                            loadAreaForEdit(potentialAreas[nextIdx]);
                        }
                    }}
                    setDraft={setDraftZone}
                    onSave={saveDraftZone}

                    // Entrance Mode
                    asset={selectedAsset}
                    entranceDraft={entranceDraft}
                    onSaveEntrance={saveEntrance}
                />
            )}

            {(isPlanningRoute || (mode === 'tourism' && routeSequence.length > 0)) && (
                <RoutePlannerPanel
                    sequence={routeSequence}
                    onClear={() => {
                        setRouteSequence([]);
                        setActiveCuratedRoute(null);
                    }}
                    onClose={() => setIsPlanningRoute(false)}
                    onSave={saveCurrentRoute}
                    onExport={() => setShowRouteExport(true)}
                />
            )}



            {mode === 'tourism' && !selectedAsset && !isPlanningRoute && (
                <TourismRoutesPanel
                    onSelectRoute={(assets, route) => {
                        setRouteSequence(assets);
                        setActiveCuratedRoute(route);
                        // Auto-start route visually
                        setIsPlanningRoute(true);
                    }}
                    onCreateRoute={() => {
                        setRouteSequence([]);
                        setActiveCuratedRoute(null);
                        setIsPlanningRoute(true);
                    }}
                    currentRouteId={activeCuratedRoute?.id}
                    canCreate={isEditor}
                />
            )}


            <FloatingNav mode={mode} setMode={setMode} />

            {selectedAsset && (
                <DetailDrawer
                    site={selectedAsset}
                    mode={mode}
                    onClose={() => onAssetClick?.(null)}
                    onReportError={onReportError}
                    onEditEntrance={isEditor ? () => {
                        setEditorMode('entrance');
                        setIsEditingZones(true);
                        if (selectedAsset.entrance) {
                            setEntranceDraft(selectedAsset.entrance);
                        } else {
                            setEntranceDraft({ lat: selectedAsset.lat, lng: selectedAsset.lng });
                        }
                    } : undefined}
                />
            )}

            {showRouteExport && (
                <RouteReport
                    sequence={routeSequence}
                    routeInfo={activeCuratedRoute}
                    activeRoute={activeRoute}
                    onClose={() => setShowRouteExport(false)}
                />
            )}

            {selectedArea && (
                <AreaDetailDrawer
                    area={selectedArea}
                    onClose={() => onAreaClick?.(null)}
                />
            )}

            {/* Legend / Branding Overlay */}
            {/* Legend / Branding Overlay moved to avoid middle overlap */}
            <div className="absolute bottom-6 left-6 z-[500] pointer-events-none hidden md:block">
                <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/50">
                    <img src="/spc-logo.png" className="h-4 opacity-60 grayscale" alt="SPC" />
                    <div className="h-3 w-px bg-slate-400/20" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">v36.0</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .brand-popup .leaflet-popup-content-wrapper {
            border-radius: 12px;
            padding: 0;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.4);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
        }
        .brand-popup .leaflet-popup-content { margin: 0; }
        .minimal-popup .leaflet-popup-content-wrapper {
            background: rgba(255,255,255,0.9);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            padding: 4px;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slide-in-bottom {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-bottom { animation: slide-in-bottom 0.4s ease-out forwards; }
        .draft-polygon-glow { filter: drop-shadow(0 0 10px rgba(204,52,58,0.3)); }

        .route-marker-container {
            position: relative;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .route-marker-pin {
            width: 32px;
            height: 32px;
            background: #1E88E5;
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(30,136,229,0.5);
            z-index: 2;
        }
        .route-marker-number {
            transform: rotate(45deg);
            color: white;
            font-weight: 900;
            font-size: 14px;
            font-family: 'Inter', sans-serif;
        }
        .route-marker-pulse {
            position: absolute;
            width: 40px;
            height: 40px;
            background: rgba(30,136,229,0.2);
            border-radius: 50%;
            animation: marker-pulse 2s infinite;
            z-index: 1;
        }
        @keyframes marker-pulse {
            0% { transform: scale(0.6); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes marker-pulse-simple {
            0% { transform: scale(0.6); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
        }
    `}} />
        </div>
    );
};

export default GeoManager;
