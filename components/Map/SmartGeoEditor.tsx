
import React, { useState, useCallback } from 'react';
import {
    X, Save, Trash2, Plus, ChevronDown, ChevronUp,
    MapPin, Ruler, FileText, Settings, Hash,
    Navigation, Info, AlertCircle, CheckCircle, Edit3
} from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { DraftZone, DraftLot, HeritageArea, HeritageLot } from '../../types_patrimonio';
import { formatArea } from '../../services/geoUtils';

export type SmartEditorMode = 'zone' | 'lot' | null;

interface NodeRowProps {
    index: number;
    lat: number;
    lng: number;
    isSelected: boolean;
    onSelect: () => void;
    onCoordChange: (lat: number, lng: number) => void;
    onDelete: () => void;
    onInsertAfter?: () => void;
}

const NodeRow: React.FC<NodeRowProps> = ({ index, lat, lng, isSelected, onSelect, onCoordChange, onDelete, onInsertAfter }) => {
    const [editing, setEditing] = useState(false);
    const [draftLat, setDraftLat] = useState(lat.toFixed(6));
    const [draftLng, setDraftLng] = useState(lng.toFixed(6));

    const commit = () => {
        const newLat = parseFloat(draftLat);
        const newLng = parseFloat(draftLng);
        if (!isNaN(newLat) && !isNaN(newLng)) {
            onCoordChange(newLat, newLng);
        }
        setEditing(false);
    };

    return (
        <div
            className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-brand-red/10 border border-brand-red/20' : 'hover:bg-slate-50 border border-transparent'}`}
            onClick={() => { onSelect(); if (!editing) setEditing(true); }}
        >
            <span
                className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black shrink-0"
                style={{ background: isSelected ? '#CC343A' : '#F1F5F9', color: isSelected ? '#fff' : '#64748B' }}
            >
                {index + 1}
            </span>

            {editing ? (
                <div className="flex gap-1 flex-1" onClick={e => e.stopPropagation()}>
                    <input
                        autoFocus
                        value={draftLat}
                        onChange={e => setDraftLat(e.target.value)}
                        onBlur={commit}
                        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
                        className="flex-1 text-[9px] font-mono bg-white border border-slate-200 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-brand-red/30"
                        placeholder="Lat"
                    />
                    <input
                        value={draftLng}
                        onChange={e => setDraftLng(e.target.value)}
                        onBlur={commit}
                        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
                        className="flex-1 text-[9px] font-mono bg-white border border-slate-200 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-brand-red/30"
                        placeholder="Lng"
                    />
                </div>
            ) : (
                <span className="flex-1 text-[9px] font-mono text-slate-500 truncate">
                    {lat.toFixed(5)}, {lng.toFixed(5)}
                </span>
            )}

            <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                {onInsertAfter && (
                    <button
                        onClick={() => onInsertAfter()}
                        className="p-1 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded transition-all"
                        title="Inserir ponto após este"
                    >
                        <Plus size={11} />
                    </button>
                )}
                <button
                    onClick={() => onDelete()}
                    className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-all"
                    title="Excluir este ponto"
                >
                    <X size={11} />
                </button>
            </div>
        </div>
    );
};

// --- Zone Props Tab ---

interface ZonePropsTabProps {
    draft: DraftZone;
    onChange: (d: DraftZone) => void;
}

const ZonePropsTab: React.FC<ZonePropsTabProps> = ({ draft, onChange }) => (
    <div className="space-y-3">
        <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nome</label>
            <input
                value={draft.title}
                onChange={e => onChange({ ...draft, title: e.target.value })}
                placeholder="Nome da poligonal..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red/30 transition-all"
            />
        </div>

        <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nível de Proteção</label>
            <div className="grid grid-cols-3 gap-1">
                {(['federal', 'estadual', 'municipal'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => onChange({ ...draft, type: t })}
                        className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-tight border transition-all ${draft.type === t
                            ? 'bg-brand-red text-white border-brand-red shadow-md shadow-brand-red/20'
                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>
        </div>

        <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Cor</label>
            <div className="flex gap-2 flex-wrap">
                {['#CC343A', '#1E88E5', '#43A047', '#FB8C00', '#546E7A', '#000000'].map(c => (
                    <button
                        key={c}
                        onClick={() => onChange({ ...draft, color: c })}
                        className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110 active:scale-95"
                        style={{
                            backgroundColor: c,
                            borderColor: draft.color === c ? '#fff' : 'transparent',
                            boxShadow: draft.color === c ? `0 0 0 2px ${c}` : 'none',
                        }}
                    />
                ))}
                <input
                    type="color"
                    value={draft.color}
                    onChange={e => onChange({ ...draft, color: e.target.value })}
                    className="w-7 h-7 rounded-full border-2 border-slate-200 cursor-pointer overflow-hidden"
                    title="Cor personalizada"
                />
            </div>
        </div>
    </div>
);

// --- Lot Props Tab ---

interface LotPropsTabProps {
    draft: DraftLot;
    onChange: (d: DraftLot) => void;
}

const LotPropsTab: React.FC<LotPropsTabProps> = ({ draft, onChange }) => (
    <div className="space-y-3">
        <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nome / Identificação</label>
            <input
                value={draft.title}
                onChange={e => onChange({ ...draft, title: e.target.value })}
                placeholder="Ex: Lote 12, Quadra 3..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/30 transition-all"
            />
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nº Lote</label>
                <input
                    value={draft.numero_lote || ''}
                    onChange={e => onChange({ ...draft, numero_lote: e.target.value })}
                    placeholder="12"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
            </div>
            <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Matrícula</label>
                <input
                    value={draft.matricula || ''}
                    onChange={e => onChange({ ...draft, matricula: e.target.value })}
                    placeholder="12345"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
            </div>
        </div>
        <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Logradouro</label>
            <input
                value={draft.logradouro || ''}
                onChange={e => onChange({ ...draft, logradouro: e.target.value })}
                placeholder="Rua do Sol, 123"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
        </div>
        <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Bairro</label>
            <input
                value={draft.bairro || ''}
                onChange={e => onChange({ ...draft, bairro: e.target.value })}
                placeholder="Centro Histórico"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
        </div>
    </div>
);

// --- Geometry Tab ---

interface GeometryTabProps {
    points: [number, number][];
    selectedNode: number | null;
    onSelectNode: (i: number) => void;
    onNodeCoordChange: (i: number, lat: number, lng: number) => void;
    onDeleteNode: (i: number) => void;
    onInsertNodeAfter?: (i: number) => void;
    areaM2: number;
}

const GeometryTab: React.FC<GeometryTabProps> = ({
    points, selectedNode, onSelectNode, onNodeCoordChange, onDeleteNode, onInsertNodeAfter, areaM2
}) => (
    <div className="space-y-2">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Vértices</p>
                <p className="text-sm font-black text-slate-800">{points.length}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Área</p>
                <p className="text-sm font-black text-slate-800">{formatArea(areaM2 || 0)}</p>
            </div>
        </div>

        <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
            <Edit3 size={9} /> Clique em um nó para editar as coordenadas
        </p>

        {/* Node list */}
        <div className="space-y-0.5 max-h-72 overflow-y-auto pr-1 no-scrollbar">
            {points.map((p, i) => (
                <NodeRow
                    key={i}
                    index={i}
                    lat={p[0]}
                    lng={p[1]}
                    isSelected={selectedNode === i}
                    onSelect={() => onSelectNode(i)}
                    onCoordChange={(lat, lng) => onNodeCoordChange(i, lat, lng)}
                    onDelete={() => onDeleteNode(i)}
                    onInsertAfter={onInsertNodeAfter ? () => onInsertNodeAfter(i) : undefined}
                />
            ))}
            {points.length === 0 && (
                <div className="py-8 text-center text-[10px] text-slate-400 font-bold">
                    <Navigation size={20} className="mx-auto mb-2 opacity-30" />
                    Nenhum vértice ainda.<br />
                    <span className="text-slate-500">Use a ferramenta Desenhar no mapa.</span>
                </div>
            )}
        </div>
    </div>
);

// ---- Main SmartGeoEditor ----

type EditorPanelTab = 'props' | 'geometry';

interface SmartGeoEditorProps {
    mode: SmartEditorMode;
    // Zone
    draftZone?: DraftZone;
    onZoneChange?: (d: DraftZone) => void;
    // Lot
    draftLot?: DraftLot;
    onLotChange?: (d: DraftLot) => void;
    // Shared geometry actions
    selectedNode: number | null;
    onSelectNode: (i: number | null) => void;
    onNodeCoordChange: (i: number, lat: number, lng: number) => void;
    onDeleteNode: (i: number) => void;
    onInsertNodeAfter?: (i: number) => void;
    onSave: () => void;
    onCancel: () => void;
    onDelete?: () => void;
    canSave: boolean;
    isExistingObject: boolean;
    areaM2: number;
}

export const SmartGeoEditor: React.FC<SmartGeoEditorProps> = ({
    mode,
    draftZone, onZoneChange,
    draftLot, onLotChange,
    selectedNode, onSelectNode, onNodeCoordChange, onDeleteNode, onInsertNodeAfter,
    onSave, onCancel, onDelete,
    canSave, isExistingObject, areaM2,
}) => {
    const [activeTab, setActiveTab] = useState<EditorPanelTab>('props');

    if (!mode) return null;

    const isLot = mode === 'lot';
    const accentColor = isLot ? '#F59E0B' : '#CC343A';
    const points = isLot ? (draftLot?.points ?? []) : (draftZone?.points ?? []);

    const tabBtnClass = (t: EditorPanelTab) =>
        `flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === t
            ? 'text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-600'
        }`;

    return (
        <div className="absolute top-20 right-4 md:right-6 bottom-4 w-72 z-[1001] pointer-events-auto flex flex-col gap-2">
            <GlassPanel
                className="flex-1 overflow-hidden flex flex-col p-0 bg-white/97 shadow-2xl"
                style={{ borderColor: `${accentColor}30` } as React.CSSProperties}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-slate-100"
                    style={{ borderBottom: `2px solid ${accentColor}20` }}
                >
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: accentColor }}>
                            {isLot ? 'Editor de Lote' : 'Editor de Poligonal'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                            {isExistingObject ? 'Editando objeto existente' : 'Novo objeto'}
                        </p>
                    </div>
                    <button onClick={onCancel} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={14} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-2 bg-slate-50 shrink-0 border-b border-slate-100">
                    <button
                        className={tabBtnClass('props')}
                        onClick={() => setActiveTab('props')}
                        style={activeTab === 'props' ? { background: accentColor } : {}}
                    >
                        <Info size={10} className="inline mr-1" />
                        Propriedades
                    </button>
                    <button
                        className={tabBtnClass('geometry')}
                        onClick={() => setActiveTab('geometry')}
                        style={activeTab === 'geometry' ? { background: accentColor } : {}}
                    >
                        <MapPin size={10} className="inline mr-1" />
                        Geometria
                    </button>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                    {activeTab === 'props' ? (
                        isLot && draftLot && onLotChange
                            ? <LotPropsTab draft={draftLot} onChange={onLotChange} />
                            : draftZone && onZoneChange
                                ? <ZonePropsTab draft={draftZone} onChange={onZoneChange} />
                                : null
                    ) : (
                        <GeometryTab
                            points={points}
                            selectedNode={selectedNode}
                            onSelectNode={i => onSelectNode(i)}
                            onNodeCoordChange={onNodeCoordChange}
                            onDeleteNode={onDeleteNode}
                            onInsertNodeAfter={onInsertNodeAfter}
                            areaM2={areaM2}
                        />
                    )}
                </div>

                {/* Footer actions */}
                <div className="p-3 border-t border-slate-100 flex flex-col gap-2 shrink-0">
                    <button
                        onClick={onSave}
                        disabled={!canSave}
                        className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                            background: canSave ? accentColor : '#E2E8F0',
                            color: canSave ? '#fff' : '#94A3B8',
                            boxShadow: canSave ? `0 4px 20px ${accentColor}40` : 'none',
                        }}
                    >
                        <Save size={13} />
                        {isExistingObject ? 'Atualizar' : 'Criar'} {isLot ? 'Lote' : 'Poligonal'}
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                        >
                            Cancelar
                        </button>
                        {isExistingObject && onDelete && (
                            <button
                                onClick={onDelete}
                                className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-all flex items-center justify-center gap-1"
                            >
                                <Trash2 size={10} />
                                Excluir
                            </button>
                        )}
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
};
