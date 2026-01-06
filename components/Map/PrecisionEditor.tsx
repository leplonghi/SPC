
import React from 'react';
import { GlassPanel } from '../ui/GlassPanel';
import { Shield, X, Navigation, Undo2, RotateCcw, Layers, Save, Trash2, CheckCircle2, MapPin, Building2, Footprints } from 'lucide-react';
import { DraftZone, HeritageAsset } from '../../types_patrimonio';

export type EditorMode = 'create' | 'edit' | 'entrance' | null;

interface PrecisionEditorProps {
    editorMode: EditorMode;
    onCancel: () => void;

    // Zone Editing
    draft?: any; // Using any to match the complex object passed from GeoManager for now (DraftZone + methods)
    setDraft?: (d: DraftZone) => void;
    onSave?: () => void;

    // Asset Entrance Editing
    asset?: HeritageAsset | null;
    entranceDraft?: { lat: number, lng: number } | null;
    onSaveEntrance?: () => void;
}

export const PrecisionEditor: React.FC<PrecisionEditorProps> = ({
    editorMode,
    onCancel,
    draft,
    setDraft,
    onSave,
    asset,
    entranceDraft,
    onSaveEntrance
}) => {

    // Render Zone Editor
    if (editorMode === 'create' || editorMode === 'edit') {
        if (!draft) return null;

        const areaFormatted = draft.areaM2 ? (draft.areaM2 > 10000 ? `${(draft.areaM2 / 10000).toFixed(2)} ha` : `${draft.areaM2.toFixed(0)} m²`) : '0 m²';

        return (
            <div className="absolute top-24 left-4 right-4 md:left-6 md:right-auto md:w-64 z-[1001] animate-slide-in-left">
                <GlassPanel className="p-4 border-brand-red/30">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[11px] font-black text-brand-red uppercase tracking-widest flex items-center gap-2 font-sans">
                            <Shield size={14} /> Precision Editor v37
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
                                    onChange={e => setDraft && setDraft({ ...draft, title: e.target.value })}
                                    placeholder="Nome da Poligonal..."
                                    className="w-full bg-white border border-slate-100 shadow-sm rounded-lg px-3 py-2 text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-red/10"
                                />

                                <div className="grid grid-cols-3 gap-1">
                                    {(['federal', 'estadual', 'municipal'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setDraft && setDraft({ ...draft, type: t })}
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
                                                onClick={() => setDraft && setDraft({ ...draft, color: c })}
                                                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 ${draft.color === c ? 'border-white ring-2 ring-brand-red' : 'border-transparent opacity-80'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>

                                    {/* Undo/Redo Actions */}
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <button
                                            onClick={draft.onUndo}
                                            disabled={!draft.canUndo}
                                            className="py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                                            title="Ctrl + Z"
                                        >
                                            <Undo2 size={12} /> Desfazer
                                        </button>
                                        <button
                                            onClick={draft.onRedo}
                                            disabled={!draft.canRedo}
                                            className="py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                                            title="Ctrl + Y"
                                        >
                                            <RotateCcw size={12} className="rotate-180" /> Refazer
                                        </button>
                                    </div>

                                    {/* Cycle Overlapping */}
                                    {draft.potentialCount > 1 && (
                                        <button
                                            onClick={draft.onCycle}
                                            className="w-full mb-2 py-2 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Layers size={12} /> Camada ({draft.potentialIndex + 1}/{draft.potentialCount})
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
                                                onClick={draft.onDelete}
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
                                <CheckCircle2 size={10} className="text-emerald-500" /> <span className="text-slate-500">Clique</span> no nó para opções
                            </p>
                            <p className="text-[8px] font-bold text-slate-400 leading-tight flex items-center gap-1">
                                <CheckCircle2 size={10} className="text-emerald-500" /> <span className="text-slate-500">SHIFT</span> Trava eixo
                            </p>
                        </div>
                    </div>
                </GlassPanel>
            </div>
        );
    }

    // Render Asset Entrance Editor
    else if (editorMode === 'entrance') {
        if (!asset) return null;

        const needsValidation = !entranceDraft;

        return (
            <div className="absolute top-24 left-4 right-4 md:left-6 md:right-auto md:w-64 z-[1001] animate-slide-in-left">
                <GlassPanel className="p-4 border-emerald-500/30">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 font-sans">
                            <Footprints size={14} /> Official Access
                        </h3>
                        <button onClick={onCancel} className="p-1 hover:bg-slate-100 rounded-full"><X size={14} /></button>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 size={16} className="text-emerald-700" />
                                <span className="text-[10px] font-black text-emerald-800 uppercase leading-tight">{asset.titulo}</span>
                            </div>
                            <p className="text-[9px] text-emerald-600 font-bold">Definindo ponto de acesso oficial</p>
                        </div>

                        <div className="relative p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center gap-2 text-center group hover:border-emerald-400 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                                <MapPin size={16} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Arraste o pino verde no mapa para a calçada/entrada exata.</p>
                        </div>

                        {entranceDraft && (
                            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400">
                                <div className="bg-slate-50 p-1 rounded border">LAT: {entranceDraft.lat.toFixed(6)}</div>
                                <div className="bg-slate-50 p-1 rounded border">LNG: {entranceDraft.lng.toFixed(6)}</div>
                            </div>
                        )}

                        <button
                            onClick={onSaveEntrance}
                            disabled={needsValidation}
                            className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                        >
                            <Save size={14} /> Confirmar Acesso
                        </button>
                    </div>
                </GlassPanel>
            </div>
        );
    }

    return null;
};
