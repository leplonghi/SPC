
import React, { useState, useRef } from 'react';
import {
    Upload, FileJson, AlertCircle, CheckCircle2,
    Layers, X, Loader2, SquareDashed, Info
} from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { HeritageLot } from '../../types_patrimonio';
import { importLotsFromFile, detectFileFormat } from '../../services/LotImportService';

interface LotImportPanelProps {
    onImport: (lots: Partial<HeritageLot>[]) => void;
    onClose: () => void;
}

type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

export const LotImportPanel: React.FC<LotImportPanelProps> = ({ onImport, onClose }) => {
    const [status, setStatus] = useState<ImportStatus>('idle');
    const [message, setMessage] = useState('');
    const [preview, setPreview] = useState<Partial<HeritageLot>[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = async (file: File) => {
        setStatus('loading');
        setMessage('');
        setPreview([]);
        try {
            const format = detectFileFormat(file);
            if (format === 'unknown') {
                throw new Error('Formato não suportado. Use .geojson, .json, .dxf ou .zip (shapefile).');
            }
            const lots = await importLotsFromFile(file);
            if (lots.length === 0) {
                throw new Error('Nenhum polígono encontrado no arquivo. Verifique se o arquivo contém geometrias do tipo Polygon.');
            }
            setPreview(lots);
            setStatus('success');
            setMessage(`${lots.length} lote(s) detectado(s) com sucesso.`);
        } catch (e: any) {
            setStatus('error');
            setMessage(e.message || 'Erro desconhecido ao processar arquivo.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleConfirm = () => {
        onImport(preview);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[1010] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <GlassPanel className="w-full max-w-lg bg-white/97 shadow-2xl p-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                            <Layers size={16} className="text-amber-500" />
                            Importar Lotes
                        </h2>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                            Suporta GeoJSON, DXF/DWG e Shapefile (.zip)
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Format reference */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { ext: '.geojson', desc: 'GeoJSON / JSON', icon: <FileJson size={14} /> },
                            { ext: '.dxf', desc: 'AutoCAD DXF/DWG', icon: <SquareDashed size={14} /> },
                            { ext: '.zip', desc: 'Shapefile (ZIP)', icon: <Layers size={14} /> },
                        ].map(f => (
                            <div key={f.ext} className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                <div className="flex justify-center mb-1 text-amber-500">{f.icon}</div>
                                <p className="text-[8px] font-black uppercase text-slate-400">{f.ext}</p>
                                <p className="text-[9px] font-bold text-slate-600">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Drop zone */}
                    <div
                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${isDragging
                            ? 'border-amber-400 bg-amber-50'
                            : status === 'success'
                                ? 'border-emerald-400 bg-emerald-50'
                                : status === 'error'
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                            }`}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <label className="sr-only" htmlFor="lot-file-input">Selecione o arquivo de lotes para importar</label>
                        <input
                            id="lot-file-input"
                            ref={fileInputRef}
                            type="file"
                            accept=".geojson,.json,.dxf,.dwg,.zip,.shp"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {status === 'loading' ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 size={28} className="text-amber-500 animate-spin" />
                                <p className="text-xs font-bold text-amber-700">Processando arquivo...</p>
                            </div>
                        ) : status === 'success' ? (
                            <div className="flex flex-col items-center gap-2">
                                <CheckCircle2 size={28} className="text-emerald-500" />
                                <p className="text-xs font-black text-emerald-700">{message}</p>
                                <p className="text-[10px] text-emerald-600">Clique para substituir o arquivo</p>
                            </div>
                        ) : status === 'error' ? (
                            <div className="flex flex-col items-center gap-2">
                                <AlertCircle size={28} className="text-red-400" />
                                <p className="text-xs font-bold text-red-600">{message}</p>
                                <p className="text-[10px] text-red-400">Clique para tentar outro arquivo</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload size={28} className="text-slate-300" />
                                <p className="text-xs font-black text-slate-500">Arraste o arquivo aqui</p>
                                <p className="text-[10px] text-slate-400">ou clique para selecionar</p>
                            </div>
                        )}
                    </div>

                    {/* Preview list */}
                    {preview.length > 0 && (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Prévia dos lotes detectados
                            </p>
                            {preview.slice(0, 10).map((lot, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-700">{lot.titulo}</p>
                                        {lot.area_m2 && (
                                            <p className="text-[9px] text-slate-400">
                                                {lot.area_m2 >= 10000
                                                    ? `${(lot.area_m2 / 10000).toFixed(2)} ha`
                                                    : `${lot.area_m2.toFixed(0)} m²`}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100">
                                        {lot.fonte?.replace('_import', '')}
                                    </span>
                                </div>
                            ))}
                            {preview.length > 10 && (
                                <p className="text-[9px] text-slate-400 text-center font-bold">
                                    + {preview.length - 10} lotes adicionais
                                </p>
                            )}
                        </div>
                    )}

                    {/* DXF note */}
                    <div className="flex gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[9px] text-blue-600 font-medium leading-relaxed">
                            Para DXF: exporte do AutoCAD/QGIS usando o sistema de coordenadas geográficas <strong>WGS84 (EPSG:4326)</strong>.
                            Arquivos em coordenadas UTM não serão processados corretamente.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={preview.length === 0}
                        className="flex-[2] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
                        style={{
                            background: preview.length > 0 ? '#F59E0B' : '#E2E8F0',
                            boxShadow: preview.length > 0 ? '0 4px 20px rgba(245,158,11,0.4)' : 'none',
                        }}
                    >
                        Adicionar {preview.length > 0 ? `${preview.length} Lote${preview.length > 1 ? 's' : ''}` : 'Lotes'} ao Mapa
                    </button>
                </div>
            </GlassPanel>
        </div>
    );
};
