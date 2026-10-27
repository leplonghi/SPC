
import React, { useState, useCallback } from 'react';
import {
    Shield, MousePointer2, Pen, Move, Layers, Plus, Landmark,
    Map as MapIcon, X, Undo2, RotateCcw, Save, ChevronDown,
    Keyboard, Square
} from 'lucide-react';

export type EditorTab = 'polygons' | 'lots' | 'assets' | 'tombamentos';
export type EditorTool = 'select' | 'draw' | 'edit' | 'move';

interface SmartEditorToolbarProps {
    activeTab: EditorTab;
    onTabChange: (tab: EditorTab) => void;
    activeTool: EditorTool;
    onToolChange: (tool: EditorTool) => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onCancel: () => void;
    canSave: boolean;
    isEditing: boolean;
    cursorCoords: { lat: number; lng: number } | null;
    nodeCount: number;
    areaM2: number;
    canEdit: boolean;
}

const TABS: { id: EditorTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'polygons', label: 'Poligonais', icon: <Shield size={13} />, color: '#CC343A' },
    { id: 'lots', label: 'Lotes', icon: <Square size={13} />, color: '#F59E0B' },
    { id: 'assets', label: 'Imóveis', icon: <Landmark size={13} />, color: '#1E88E5' },
    { id: 'tombamentos', label: 'Tombamentos', icon: <MapIcon size={13} />, color: '#43A047' },
];

const TOOLS: { id: EditorTool; label: string; icon: React.ReactNode; hotkey: string; tooltip: string }[] = [
    { id: 'select', label: 'Selecionar', icon: <MousePointer2 size={14} />, hotkey: 'S', tooltip: 'Selecionar objeto' },
    { id: 'draw', label: 'Desenhar', icon: <Pen size={14} />, hotkey: 'D', tooltip: 'Desenhar novo polígono' },
    { id: 'edit', label: 'Editar Nós', icon: <Layers size={14} />, hotkey: 'E', tooltip: 'Editar vértices' },
    { id: 'move', label: 'Mover', icon: <Move size={14} />, hotkey: 'M', tooltip: 'Mover objeto' },
];

export const SmartEditorToolbar: React.FC<SmartEditorToolbarProps> = ({
    activeTab, onTabChange, activeTool, onToolChange,
    canUndo, canRedo, onUndo, onRedo, onSave, onCancel,
    canSave, isEditing, cursorCoords, nodeCount, areaM2, canEdit,
}) => {
    const [showHotkeys, setShowHotkeys] = useState(false);

    const formatArea = (m2: number) => {
        if (m2 >= 10000) return `${(m2 / 10000).toFixed(2)} ha`;
        if (m2 > 0) return `${m2.toFixed(0)} m²`;
        return '—';
    };

    const activeTabData = TABS.find(t => t.id === activeTab)!;

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1002] pointer-events-auto w-auto max-w-[calc(100vw-2rem)]">
            <div
                className="rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                style={{ background: '#0F1117' }}
            >
                {/* Top bar: Tabs */}
                <div className="flex items-center border-b border-white/5">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="relative flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all"
                            style={{
                                color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.35)',
                                background: activeTab === tab.id ? 'rgba(255,255,255,0.07)' : 'transparent',
                            }}
                        >
                            <span style={{ color: activeTab === tab.id ? tab.color : 'rgba(255,255,255,0.25)' }}>
                                {tab.icon}
                            </span>
                            <span className="hidden md:block">{tab.label}</span>
                            {activeTab === tab.id && (
                                <span
                                    className="absolute bottom-0 left-0 right-0 h-0.5"
                                    style={{ background: tab.color }}
                                />
                            )}
                        </button>
                    ))}

                    <div className="h-6 w-px bg-white/10 mx-1" />

                    <button
                        onClick={() => setShowHotkeys(s => !s)}
                        className="p-2.5 text-white/30 hover:text-white/70 transition-colors"
                        title="Atalhos de teclado"
                    >
                        <Keyboard size={13} />
                    </button>
                </div>

                {/* Bottom bar: Tools + Status */}
                <div className="flex items-center gap-1 px-2 py-1.5">
                    {/* Tool Buttons */}
                    {canEdit && (
                        <div className="flex items-center gap-1 pr-2 border-r border-white/10">
                            {TOOLS.map(tool => (
                                <button
                                    key={tool.id}
                                    onClick={() => onToolChange(tool.id)}
                                    title={`${tool.tooltip} [${tool.hotkey}]`}
                                    className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                    style={{
                                        background: activeTool === tool.id
                                            ? activeTabData.color
                                            : 'transparent',
                                        color: activeTool === tool.id ? '#fff' : 'rgba(255,255,255,0.4)',
                                        boxShadow: activeTool === tool.id
                                            ? `0 0 12px ${activeTabData.color}55`
                                            : 'none',
                                    }}
                                >
                                    {tool.icon}
                                    <span className="hidden lg:block">{tool.label}</span>
                                    <span
                                        className="hidden lg:flex w-4 h-4 rounded text-[7px] font-black items-center justify-center"
                                        style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                                    >
                                        {tool.hotkey}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Undo / Redo */}
                    {canEdit && isEditing && (
                        <div className="flex items-center gap-1 px-2 border-r border-white/10">
                            <button
                                onClick={onUndo}
                                disabled={!canUndo}
                                title="Desfazer [Ctrl+Z]"
                                className="p-1.5 rounded-lg text-white/40 hover:text-white disabled:opacity-20 transition-all hover:bg-white/10"
                            >
                                <Undo2 size={13} />
                            </button>
                            <button
                                onClick={onRedo}
                                disabled={!canRedo}
                                title="Refazer [Ctrl+Y]"
                                className="p-1.5 rounded-lg text-white/40 hover:text-white disabled:opacity-20 transition-all hover:bg-white/10"
                            >
                                <RotateCcw size={13} className="rotate-180" />
                            </button>
                        </div>
                    )}

                    {/* Status Bar */}
                    <div className="flex items-center gap-3 px-2 text-[9px] font-mono">
                        {cursorCoords && (
                            <span className="text-white/30">
                                {cursorCoords.lat.toFixed(5)}, {cursorCoords.lng.toFixed(5)}
                            </span>
                        )}
                        {nodeCount > 0 && (
                            <span className="text-white/40">
                                <span style={{ color: activeTabData.color }}>{nodeCount}</span> nós
                            </span>
                        )}
                        {areaM2 > 0 && (
                            <span className="text-white/40">
                                <span className="text-white/70">{formatArea(areaM2)}</span>
                            </span>
                        )}
                    </div>

                    {/* Save / Cancel */}
                    {canEdit && isEditing && (
                        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
                            <button
                                onClick={onCancel}
                                className="p-1.5 rounded-lg text-white/40 hover:text-red-400 transition-all hover:bg-red-500/10"
                                title="Cancelar [Esc]"
                            >
                                <X size={13} />
                            </button>
                            <button
                                onClick={onSave}
                                disabled={!canSave}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
                                style={{
                                    background: canSave ? activeTabData.color : 'rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    boxShadow: canSave ? `0 0 16px ${activeTabData.color}66` : 'none',
                                }}
                                title="Salvar [Ctrl+S]"
                            >
                                <Save size={12} />
                                <span className="hidden sm:block">Salvar</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Hotkeys tooltip */}
            {showHotkeys && (
                <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-xl overflow-hidden shadow-2xl border border-white/10 text-[9px] font-mono text-white/60 w-64"
                    style={{ background: '#0F1117' }}
                >
                    <div className="p-3 border-b border-white/10 flex justify-between items-center">
                        <span className="font-black uppercase tracking-widest text-white/80 text-[10px]">Atalhos</span>
                        <button onClick={() => setShowHotkeys(false)} className="text-white/30 hover:text-white">
                            <X size={12} />
                        </button>
                    </div>
                    <div className="p-3 space-y-1.5">
                        {[
                            ['S', 'Selecionar'],
                            ['D', 'Desenhar'],
                            ['E', 'Editar nós'],
                            ['M', 'Mover'],
                            ['Ctrl+Z', 'Desfazer'],
                            ['Ctrl+Y', 'Refazer'],
                            ['Ctrl+S', 'Salvar'],
                            ['Esc', 'Cancelar'],
                            ['Shift+drag', 'Trava eixo'],
                            ['Dbl-click nó', 'Excluir nó'],
                        ].map(([key, desc]) => (
                            <div key={key} className="flex justify-between">
                                <span
                                    className="px-1.5 py-0.5 rounded text-[8px] font-black"
                                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
                                >
                                    {key}
                                </span>
                                <span>{desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
