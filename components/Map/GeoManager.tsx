
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
import { db } from '../../firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
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
    BookOpen
} from 'lucide-react';
import { HeritageAsset, HeritageArea } from '../../types_patrimonio';
import { HERITAGE_SITES, INITIAL_ZONES, WAYPOINTS, CONNECTIONS } from '../../data/geoManagerData';
import { findDetailedPath } from '../../services/routingEngine';
import { useAuth } from '../../contexts/AuthContext';
import { TourismRoutesPanel } from './TourismRoutesPanel';
import { ADDITIONAL_SITES, EXTENDED_WAYPOINTS, EXTENDED_CONNECTIONS } from '../../data/touristData';

// --- Types ---

// --- Icons & Icons Components ---
const Plus = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

type AppMode = 'management' | 'tourism';
type EditorMode = 'create' | 'edit' | null;

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
const getMarkerIcon = (site: HeritageAsset, mode: AppMode) => {
    let color = '#546E7A';

    if (mode === 'management') {
        switch (site.conservation_status) {
            case 'Regular': color = '#2E7D32'; break;
            case 'Em Obras': color = '#1E88E5'; break;
            case 'Alerta': color = '#CC343A'; break;
        }
    } else {
        switch (site.tipologia) {
            case 'Religioso': color = '#5D4037'; break;
            case 'Civil': color = '#1E88E5'; break;
            case 'Militar': color = '#2E7D32'; break;
            case 'Monumento': color = '#8E24AA'; break;
            default: color = '#F59E0B'; break;
        }
    }

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

const NodeVirtualIcon = L.divIcon({
    html: `<div style="width: 8px; height: 8px; background: rgba(255,255,255,0.6); border: 1px solid rgba(204,52,58,0.4); border-radius: 50%;"></div>`,
    className: 'node-virtual',
    iconSize: [8, 8],
    iconAnchor: [4, 4]
});

// --- Components ---

const GlassPanel: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`backdrop-blur-xl bg-white/80 border border-white/20 shadow-2xl rounded-3xl overflow-hidden transition-all hover:shadow-brand-blue/10 ${className}`}>
        {children}
    </div>
);

const AIConsultantPanel: React.FC<{ site: HeritageAsset, mode: AppMode }> = ({ site, mode }) => (
    <div className="flex flex-col h-full space-y-4">
        <div className="bg-brand-blue/5 border border-brand-blue/10 p-4 rounded-2xl">
            <h4 className="text-[10px] font-black uppercase text-brand-blue flex items-center gap-2 mb-3">
                <Sparkles size={14} /> Consultant AI Analysis
            </h4>
            <div className="text-xs font-bold text-slate-700 leading-relaxed">
                {mode === 'management'
                    ? `Analisando situação de "${site.titulo}" em relação à lei 10.089/86. Natureza ${site.propriedade || 'não especificada'}. O status "${site.conservation_status || 'Regular'}" sugere prioridade ${site.conservation_status === 'Alerta' ? 'Máxima' : 'Média'}.`
                    : `Explorando o patrimônio ${site.estilo_arquitetonico || 'histórico'}. Posso descrever as influências presentes e a cronologia iniciada em ${site.ano_construcao || 'período colonial'}.`
                }
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
            <button className="p-3 bg-white border border-slate-100 rounded-xl hover:border-brand-blue transition-all group">
                <p className="text-[9px] font-black text-slate-400 uppercase group-hover:text-brand-blue">Ação Sugerida</p>
                <p className="text-[11px] font-bold text-slate-700 mt-1">{mode === 'management' ? 'Solicitar Vistoria' : 'Rota Histórica'}</p>
            </button>
            <button className="p-3 bg-white border border-slate-100 rounded-xl hover:border-brand-blue transition-all group">
                <p className="text-[9px] font-black text-slate-400 uppercase group-hover:text-brand-blue">Documentação</p>
                <p className="text-[11px] font-bold text-slate-700 mt-1">{mode === 'management' ? 'Ver Processos' : 'Galeria 3D'}</p>
            </button>
        </div>

        <div className="mt-auto bg-slate-50 p-4 rounded-2xl border border-slate-100 italic text-[10px] font-medium text-slate-500">
            \"Insight em tempo real: O entorno gráfico deste ativo mostra valorização de 12% após a última restauração em 2023.\"
        </div>
    </div>
);

const DetailDrawer: React.FC<{
    site: HeritageAsset,
    mode: AppMode,
    onClose: () => void,
    onReportError?: () => void
}> = ({ site, mode, onClose, onReportError }) => (
    <div className="absolute top-6 bottom-6 right-6 w-[400px] z-[1001] animate-slide-in-right">
        <GlassPanel className="h-full flex flex-col">
            <div className="relative h-56 w-full overflow-hidden">
                <img
                    src={site.imagens_historicas && site.imagens_historicas.length > 0 ? site.imagens_historicas[0] : `https://images.unsplash.com/photo-1590603740183-980e7f83a2d3?auto=format&fit=crop&q=80&w=800`}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    alt={site.titulo}
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black text-brand-dark uppercase tracking-widest shadow-lg">
                        ID: {site.id}
                    </span>
                    {site.geocode_confidence !== undefined && (
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest shadow-lg">
                            CONF: {(site.geocode_confidence * 100).toFixed(0)}%
                        </span>
                    )}
                    {site.propriedade && (
                        <span className="px-3 py-1 bg-brand-blue/90 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-lg flex items-center gap-1">
                            <User size={8} /> {site.propriedade}
                        </span>
                    )}
                </div>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all">
                    <X size={16} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{site.categoria}</span>
                        {site.tipologia && (
                            <>
                                <span className="text-slate-300">/</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{site.tipologia}</span>
                            </>
                        )}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 leading-tight uppercase font-sans mb-2">{site.titulo}</h2>
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Navigation size={10} className="text-brand-blue" /> {site.endereco_original}, São Luís - MA
                    </p>
                </div>

                {site.descricao && (
                    <div className="mb-8">
                        <p className="text-xs font-medium text-slate-600 leading-relaxed border-l-4 border-slate-100 pl-4 py-1 italic">
                            "{site.descricao}"
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                            <Shield size={10} className="text-brand-red" /> Conservação
                        </p>
                        <p className={`text-xs font-black mt-1 ${site.conservation_status === 'Alerta' ? 'text-brand-red' : 'text-emerald-600'}`}>
                            {site.conservation_status || 'Regular'}
                        </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                            <Home size={10} className="text-brand-blue" /> Uso Atual
                        </p>
                        <p className="text-xs font-black text-slate-800 mt-1 truncate">
                            {site.uso_atual || 'Institucional'}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                            <History size={14} className="text-brand-blue" /> Cronologia & Estilo
                        </h4>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase">Ano Const.</span>
                                <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1"><Calendar size={10} /> {site.ano_construcao || 'Séc. XVIII'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase">Estilo</span>
                                <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1"><Building2 size={10} /> {site.estilo_arquitetonico || 'Colonial'}</p>
                            </div>
                        </div>
                    </div>

                    {site.imagens_historicas && site.imagens_historicas.length > 0 && (
                        <div>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                                <ImageIcon size={14} className="text-brand-blue" /> Galeria Histórica
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                                {site.imagens_historicas.slice(0, 3).map((img, i) => (
                                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-100 group cursor-zoom-in">
                                        <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="hist" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                            <Info size={14} className="text-brand-blue" /> Detalhes do Inventário
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-[11px] font-bold text-slate-500">Inscrição de Tombo:</span>
                                <span className="text-[11px] font-black text-slate-700">{site.inventory?.inscricao || '---'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-[11px] font-bold text-slate-500">Data do Decreto:</span>
                                <span className="text-[11px] font-black text-slate-700">{site.inventory?.data_tombamento || '---'}</span>
                            </div>
                        </div>
                    </div>

                    <AIConsultantPanel site={site} mode={mode} />
                </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <button className="w-full py-4 bg-brand-dark text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                    {mode === 'management' ? 'Gerar Relatório Técnico' : 'Iniciar Guia Turístico'}
                    <ChevronRight size={16} />
                </button>
                {mode === 'management' && onReportError && (
                    <button
                        onClick={onReportError}
                        className="w-full mt-2 py-2 border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white transition-all"
                    >
                        Reportar Erro / Atualizar
                    </button>
                )}
            </div>
        </GlassPanel>
    </div>
);

const AreaDetailDrawer: React.FC<{
    area: HeritageArea,
    onClose: () => void
}> = ({ area, onClose }) => (
    <div className="absolute top-6 bottom-6 right-6 w-[350px] z-[1001] animate-slide-in-right">
        <GlassPanel className="h-full flex flex-col p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <span className="px-3 py-1 bg-brand-blue/10 rounded-full text-[9px] font-black text-brand-blue uppercase tracking-widest">
                        Poligonal
                    </span>
                    <h2 className="text-2xl font-black text-slate-800 leading-tight uppercase font-sans mt-3">{area.titulo}</h2>
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
                    <p className="text-sm font-bold text-slate-800 uppercase">{area.tipo_area.replace('_', ' ')}</p>
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

            <div className="mt-auto">
                <button className="w-full py-4 bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2">
                    <BookOpen size={14} /> Ver Legislação
                </button>
            </div>
        </GlassPanel>
    </div>
);

const ZoneEditorPanel: React.FC<{
    draft: DraftZone,
    setDraft: (d: DraftZone) => void,
    onSave: () => void,
    onCancel: () => void,
    editorMode: EditorMode
}> = ({ draft, setDraft, onSave, onCancel, editorMode }) => {
    const areaFormatted = draft.areaM2 ? (draft.areaM2 > 10000 ? `${(draft.areaM2 / 10000).toFixed(2)} ha` : `${draft.areaM2.toFixed(0)} m²`) : '0 m²';

    return (
        <div className="absolute top-24 left-6 z-[1001] w-64 animate-slide-in-left">
            <GlassPanel className="p-4 border-brand-red/30">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[11px] font-black text-brand-red uppercase tracking-widest flex items-center gap-2 font-sans">
                        <Shield size={14} /> Precision Editor v36
                    </h3>
                    <button onClick={onCancel} className="p-1 hover:bg-slate-100 rounded-full"><X size={14} /></button>
                </div>

                <div className="space-y-3">
                    {editorMode === 'edit' && !draft.id ? (
                        <div className="p-4 bg-brand-blue/5 border border-dashed border-brand-blue/30 rounded-xl text-center">
                            <Navigation size={20} className="mx-auto text-brand-blue mb-2 animate-pulse" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase leading-tight">Aguardando seleção de polígono no mapa...</p>
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                value={draft.title}
                                onChange={e => setDraft({ ...draft, title: e.target.value })}
                                placeholder="Nome da Poligonal..."
                                className="w-full bg-white border border-slate-100 shadow-sm rounded-lg px-3 py-2 text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-red/10"
                            />

                            <div className="grid grid-cols-3 gap-1">
                                {(['federal', 'estadual', 'municipal'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setDraft({ ...draft, type: t })}
                                        className={`py-1.5 rounded-md text-[8px] font-black uppercase tracking-tight border transition-all ${draft.type === t ? 'bg-brand-red text-white border-brand-red shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            <div className="p-3 bg-brand-red/5 rounded-2xl border border-brand-red/10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black text-brand-red uppercase">Customização & SIG</span>
                                    <span className="text-[9px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-100">{areaFormatted}</span>
                                </div>

                                {/* Color Picker Presets */}
                                <div className="flex gap-2 mb-3">
                                    {['#CC343A', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA', '#546E7A'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setDraft({ ...draft, color: c })}
                                            className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 ${draft.color === c ? 'border-white ring-2 ring-brand-red' : 'border-transparent opacity-80'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>

                                {/* Undo/Redo Actions */}
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <button
                                        onClick={(draft as any).onUndo}
                                        disabled={!(draft as any).canUndo}
                                        className="py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                                        title="Ctrl + Z"
                                    >
                                        <Undo2 size={12} /> Desfazer
                                    </button>
                                    <button
                                        onClick={(draft as any).onRedo}
                                        disabled={!(draft as any).canRedo}
                                        className="py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                                        title="Ctrl + Y"
                                    >
                                        <RotateCcw size={12} className="rotate-180" /> Refazer
                                    </button>
                                </div>

                                {/* Cycle Overlapping */}
                                {(draft as any).potentialCount > 1 && (
                                    <button
                                        onClick={(draft as any).onCycle}
                                        className="w-full mb-2 py-2 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Layers size={12} /> Camada ({(draft as any).potentialIndex + 1}/{(draft as any).potentialCount})
                                    </button>
                                )}

                                <div className="flex flex-col gap-1.5 pt-3 border-t border-brand-red/10 mt-2">
                                    <button
                                        disabled={draft.points.length < 3}
                                        onClick={onSave}
                                        className="w-full py-2 bg-brand-dark text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-30 transition-all flex items-center justify-center gap-2 shadow-lg group"
                                    >
                                        <Save size={12} className="group-hover:scale-110 transition-transform" /> Salvar Polígono
                                    </button>

                                    {draft.id && (
                                        <button
                                            onClick={(draft as any).onDelete}
                                            className="w-full py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={12} /> Excluir
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="px-2 space-y-1">
                        <p className="text-[8px] font-bold text-slate-400 leading-tight flex items-center gap-1">
                            <CheckCircle2 size={10} className="text-emerald-500" /> {editorMode === 'create' ? 'Clique p/ adicionar pontos' : 'Clique no polígono p/ editar'}
                        </p>
                        <p className="text-[8px] font-bold text-slate-400 leading-tight flex items-center gap-1">
                            <CheckCircle2 size={10} className="text-emerald-500" /> Arraste círculos brancos p/ novos pontos
                        </p>
                        <p className="text-[8px] font-bold text-slate-400 leading-tight flex items-center gap-1">
                            <CheckCircle2 size={10} className="text-emerald-500" /> Duplo-clique no ponto para excluir
                        </p>
                        <p className="text-[8px] font-bold text-slate-400 leading-tight flex items-center gap-1">
                            <CheckCircle2 size={10} className="text-emerald-500" /> <span className="text-slate-500">ESC</span> Cancela, <span className="text-slate-500">SHIFT</span> Trava
                        </p>
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
};

const RoutePlannerPanel: React.FC<{ sequence: HeritageAsset[], onClear: () => void, onClose: () => void }> = ({ sequence, onClear, onClose }) => (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1001] w-[500px] animate-slide-in-bottom">
        <GlassPanel className="p-4 border-brand-blue/30 overflow-visible">
            <div className="flex items-center gap-4">
                <div className="flex-1 flex gap-2 items-center overflow-x-auto no-scrollbar pb-1">
                    {sequence.length === 0 ? (
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 w-full justify-center">
                            <Navigation size={14} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecione pontos no mapa para criar rota</span>
                        </div>
                    ) : (
                        sequence.map((s, idx) => (
                            <React.Fragment key={s.id}>
                                <div className="flex flex-col items-center min-w-[100px] p-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                                    <span className="text-[8px] font-black text-brand-blue/50 mb-1">{idx + 1}º PARADA</span>
                                    <span className="text-[10px] font-black text-slate-700 truncate w-full text-center">{s.titulo}</span>
                                </div>
                                {idx < sequence.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
                            </React.Fragment>
                        ))
                    )
                    }
                </div>
                <div className="flex gap-2">
                    <button onClick={onClear} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"><RotateCcw size={16} /></button>
                    <button onClick={onClose} className="p-3 bg-brand-dark text-white rounded-xl shadow-xl hover:bg-black transition-all font-black text-[10px] px-6 uppercase tracking-widest">Finalizar</button>
                </div>
            </div>
        </GlassPanel>
    </div>
);

const FloatingNav: React.FC<{ mode: AppMode, setMode: (m: AppMode) => void }> = ({ mode, setMode }) => (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto">
        <GlassPanel className="p-2 flex gap-1">
            <button
                onClick={() => setMode('management')}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${mode === 'management' ? 'bg-brand-dark text-white shadow-xl translate-y-[-1px]' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
            >
                <Shield size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Geomanagement</span>
            </button>
            <button
                onClick={() => setMode('tourism')}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${mode === 'tourism' ? 'bg-brand-blue text-white shadow-xl translate-y-[-1px]' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
            >
                <Compass size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Tourism AI</span>
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
    <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2 pointer-events-auto">
        <GlassPanel className="p-3 w-14 hover:w-64 group transition-all duration-500 ease-in-out">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className="min-w-[40px] flex justify-center"><Layers size={20} className="text-slate-600" /></div>
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Sistema de Camadas</span>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto overflow-hidden whitespace-nowrap">
                    <div className="flex flex-col gap-3 ml-2 border-l-2 border-slate-100 pl-4 py-2">
                        {/* Map Toggles */}
                        <div className="space-y-3 mb-4">
                            <button onClick={() => setShowZones(!showZones)} className="flex items-center justify-between w-full group/item">
                                <span className="text-[10px] font-bold text-slate-500 group-hover/item:text-brand-blue">Polígonos de Proteção</span>
                                <div className={`w-8 h-4 rounded-full transition-all relative ${showZones ? 'bg-brand-blue' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${showZones ? 'left-5' : 'left-1'}`} />
                                </div>
                            </button>

                            <button onClick={() => setBase(base === 'streets' ? 'satellite' : 'streets')} className="flex items-center justify-between w-full group/item">
                                <span className="text-[10px] font-bold text-slate-500 group-hover/item:text-brand-blue">Visão Satélite</span>
                                <div className={`w-8 h-4 rounded-full transition-all relative ${base === 'satellite' ? 'bg-brand-blue' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${base === 'satellite' ? 'left-5' : 'left-1'}`} />
                                </div>
                            </button>
                        </div>

                        {/* Editor Shortcuts */}
                        {canEdit && (
                            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                                <button
                                    onClick={onNewZone}
                                    disabled={isEditing}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-brand-red/5 text-slate-600 hover:text-brand-red transition-all disabled:opacity-30 group/btn"
                                >
                                    <Plus size={16} className="text-brand-red" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Nova Poligonal</span>
                                </button>
                                <button
                                    onClick={onEditMode}
                                    disabled={isEditing || !hasZones}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-brand-blue/5 text-slate-600 hover:text-brand-blue transition-all disabled:opacity-30 group/btn"
                                >
                                    <MousePointer2 size={16} className="text-brand-blue" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Editar Existente</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
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
    const { isEditor } = useAuth();
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

    const midpoints = useMemo(() => {
        if (!isEditingZones || draftZone.points.length < 2) return [];
        return draftZone.points.map((p, i) => {
            const next = draftZone.points[(i + 1) % draftZone.points.length];
            return {
                pos: [(p[0] + next[0]) / 2, (p[1] + next[1]) / 2] as [number, number],
                index: i + 1
            };
        });
    }, [draftZone.points, isEditingZones]);

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

    const promoteMidpoint = (index: number, pos: [number, number]) => {
        addToHistory(draftZone.points);
        setDraftZone(prev => {
            const newPoints = [...prev.points];
            newPoints.splice(index, 0, pos);
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
        const normalizedPoints = draftZone.points.map(p => [p[1], p[0]]);
        const closedPoints = [...normalizedPoints, normalizedPoints[0]];
        const areaId = draftZone.id || `zone-${Date.now()}`;
        const areaData: HeritageArea = {
            id: areaId,
            titulo: draftZone.title || 'Nova Zona',
            cidade: 'São Luís',
            tipo_area: draftZone.type,
            status: 'ok',
            type: 'area',
            cor: draftZone.color,
            geojson: {
                type: 'Feature',
                geometry: { type: 'Polygon', coordinates: [closedPoints] }
            }
        };

        try {
            // Firestore doesn't support nested arrays (like GeoJSON coordinates [[[lng, lat], ...]])
            // So we stringify the geojson property for storage while keeping it as an object locally.
            const areaDataForFirestore = {
                ...areaData,
                geojson: JSON.stringify(areaData.geojson)
            };

            console.log("Saving area to Firestore (stringified):", areaId);
            await setDoc(doc(db, "heritage_areas", areaId), areaDataForFirestore);

            if (draftZone.id) {
                setLocalAreas(prev => prev.map(a => a.id === draftZone.id ? areaData : a));
            } else {
                setLocalAreas(prev => [...prev, areaData]);
            }
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
    };

    const handleSiteClick = (site: HeritageAsset) => {
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

    const runTourismRoute = (targetIds: string[]) => {
        if (targetIds.length < 2) return;

        // Merge routing data dynamically or statically
        const allWaypoints = [...WAYPOINTS, ...(EXTENDED_WAYPOINTS || [])];
        const allConnections = [...CONNECTIONS, ...(EXTENDED_CONNECTIONS || [])];

        const fullPath: [number, number][] = [];
        for (let i = 0; i < targetIds.length - 1; i++) {
            const result = findDetailedPath(targetIds[i], targetIds[i + 1], allWaypoints, allConnections);
            if (result.path.length > 0) {
                if (i > 0) result.path.shift();
                fullPath.push(...result.path);
            }
        }
        setActiveRoute(fullPath);
    };

    useEffect(() => {
        if (routeSequence.length >= 2) {
            const nodeIds = routeSequence.map(s => s.graphNode).filter(Boolean) as string[];
            if (nodeIds.length >= 2) runTourismRoute(nodeIds);
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

                {/* Legal Zones */}
                {showPolygons && localAreas.map(area => area.geojson && (
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
                            />
                        ))}

                        {/* Midpoints (Virtual Nodes) */}
                        {midpoints.map((m, idx) => (
                            <Marker
                                key={`mid-${idx}`}
                                position={m.pos}
                                draggable={true}
                                icon={NodeVirtualIcon}
                                eventHandlers={{
                                    dragend: (e) => {
                                        const latlng = (e.target as any).getLatLng();
                                        promoteMidpoint(m.index, [latlng.lat, latlng.lng]);
                                    }
                                }}
                            />
                        ))}
                    </>
                )}

                {/* Site Markers */}
                {assets.map(site => (
                    <Marker
                        key={site.id}
                        position={[site.lat, site.lng]}
                        icon={getMarkerIcon(site, mode)}
                        eventHandlers={{ click: () => handleSiteClick(site) }}
                    >
                        {mode === 'tourism' && !isPlanningRoute && (
                            <Popup className="minimal-popup" closeButton={false}>
                                <div className="text-center py-1">
                                    <p className="text-[9px] font-black text-slate-700 uppercase">{site.titulo}</p>
                                </div>
                            </Popup>
                        )}
                    </Marker>
                ))}

                {/* Active Route Display */}
                {activeRoute && <Polyline positions={activeRoute} color="#1E88E5" weight={6} opacity={0.8} lineCap="round" lineJoin="round" dashArray="1, 12" />}
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
            />

            {isEditingZones && (
                <ZoneEditorPanel
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
                    } as any}
                    setDraft={setDraftZone}
                    onSave={saveDraftZone}
                    onCancel={cancelEdit}
                    editorMode={editorMode}
                />
            )}

            {(isPlanningRoute || (mode === 'tourism' && routeSequence.length > 0)) && (
                <RoutePlannerPanel
                    sequence={routeSequence}
                    onClear={() => setRouteSequence([])}
                    onClose={() => setIsPlanningRoute(false)}
                />
            )}



            {mode === 'tourism' && !selectedAsset && !isPlanningRoute && (
                <TourismRoutesPanel
                    onSelectRoute={(assets) => {
                        setRouteSequence(assets);
                        // Auto-start route visually
                        setIsPlanningRoute(true);
                    }}
                    onCreateRoute={() => {
                        setRouteSequence([]);
                        setIsPlanningRoute(true);
                    }}
                    currentRouteId={null} // You could track this state if needed
                />
            )}


            <FloatingNav mode={mode} setMode={setMode} />

            {selectedAsset && (
                <DetailDrawer
                    site={selectedAsset}
                    mode={mode}
                    onClose={() => onAssetClick?.(null)}
                    onReportError={onReportError}
                />
            )}

            {selectedArea && (
                <AreaDetailDrawer
                    area={selectedArea}
                    onClose={() => onAreaClick?.(null)}
                />
            )}

            {/* Legend / Branding Overlay */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
                <GlassPanel className="px-6 py-2 border-white/50 bg-white/30">
                    <div className="flex items-center gap-3">
                        <img src="/spc-logo.png" className="h-6 opacity-80" alt="SPC" />
                        <div className="h-4 w-px bg-slate-400/30" />
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] font-sans">GeoManager v36.0</span>
                    </div>
                </GlassPanel>
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
    `}} />
        </div>
    );
};

export default GeoManager;
