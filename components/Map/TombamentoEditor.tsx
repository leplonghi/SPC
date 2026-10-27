
import React, { useState } from 'react';
import {
    Plus, Trash2, X, ChevronDown, ChevronUp,
    Shield, Calendar, BookOpen, Hash, Building2,
    Edit3, Save, AlertCircle
} from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { TombamentoRecord, HeritageAsset } from '../../types_patrimonio';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface TombamentoEditorProps {
    asset: HeritageAsset;
    onClose: () => void;
    onSaved: (updated: HeritageAsset) => void;
}

const NIVEIS: TombamentoRecord['nivel'][] = ['federal', 'estadual', 'municipal'];

const NIVEL_CONFIG: Record<TombamentoRecord['nivel'], { color: string; label: string; orgaos: string[] }> = {
    federal: {
        color: '#CC343A',
        label: 'Federal',
        orgaos: ['IPHAN', 'IPHAN-MA'],
    },
    estadual: {
        color: '#1E88E5',
        label: 'Estadual',
        orgaos: ['FCC', 'STPC', 'Secretaria de Cultura MA'],
    },
    municipal: {
        color: '#43A047',
        label: 'Municipal',
        orgaos: ['Prefeitura de São Luís', 'SEMMAC', 'SETUR'],
    },
};

const EMPTY_TOMBAMENTO = (): TombamentoRecord => ({
    id: `tomb-${Date.now()}`,
    nivel: 'municipal',
    decreto: '',
    data_tombamento: '',
    livro_tombo: '',
    inscricao: '',
    orgao: '',
    observacoes: '',
});

interface TombamentoCardProps {
    record: TombamentoRecord;
    onChange: (r: TombamentoRecord) => void;
    onDelete: () => void;
}

const TombamentoCard: React.FC<TombamentoCardProps> = ({ record, onChange, onDelete }) => {
    const [expanded, setExpanded] = useState(true);
    const cfg = NIVEL_CONFIG[record.nivel];

    return (
        <div
            className="rounded-2xl overflow-hidden border transition-all"
            style={{ borderColor: `${cfg.color}30` }}
        >
            {/* Card Header */}
            <div
                className="flex items-center justify-between p-3 cursor-pointer"
                style={{ background: `${cfg.color}08` }}
                onClick={() => setExpanded(s => !s)}
            >
                <div className="flex items-center gap-2">
                    <span
                        className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white"
                        style={{ background: cfg.color }}
                    >
                        {cfg.label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 truncate max-w-[140px]">
                        {record.decreto || 'Sem decreto'}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(); }}
                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={11} />
                    </button>
                    {expanded ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
                </div>
            </div>

            {/* Card Body */}
            {expanded && (
                <div className="p-3 space-y-2.5 bg-white">
                    {/* Level picker */}
                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nível</label>
                        <div className="grid grid-cols-3 gap-1">
                            {NIVEIS.map(n => (
                                <button
                                    key={n}
                                    onClick={() => onChange({ ...record, nivel: n, orgao: '' })}
                                    className="py-1.5 rounded-lg text-[8px] font-black uppercase tracking-tight border transition-all"
                                    style={{
                                        background: record.nivel === n ? NIVEL_CONFIG[n].color : 'white',
                                        color: record.nivel === n ? '#fff' : '#94A3B8',
                                        borderColor: record.nivel === n ? NIVEL_CONFIG[n].color : '#E2E8F0',
                                    }}
                                >
                                    {NIVEL_CONFIG[n].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block flex items-center gap-1">
                                <Hash size={8} /> Decreto / Lei
                            </label>
                            <input
                                value={record.decreto}
                                onChange={e => onChange({ ...record, decreto: e.target.value })}
                                placeholder="Dec. 12.345/1987"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:ring-2 transition-all"
                                style={{ '--tw-ring-color': cfg.color } as any}
                            />
                        </div>
                        <div>
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block flex items-center gap-1">
                                <Calendar size={8} /> Data
                            </label>
                            <input
                                type="date"
                                value={record.data_tombamento}
                                onChange={e => onChange({ ...record, data_tombamento: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:ring-2 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block flex items-center gap-1">
                                <BookOpen size={8} /> Livro do Tombo
                            </label>
                            <input
                                value={record.livro_tombo}
                                onChange={e => onChange({ ...record, livro_tombo: e.target.value })}
                                placeholder="Livro das Belas Artes"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:ring-2 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Inscrição</label>
                            <input
                                value={record.inscricao}
                                onChange={e => onChange({ ...record, inscricao: e.target.value })}
                                placeholder="001-I"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:ring-2 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block flex items-center gap-1">
                            <Building2 size={8} /> Órgão Responsável
                        </label>
                        <div className="flex gap-1 flex-wrap mb-1">
                            {cfg.orgaos.map(o => (
                                <button
                                    key={o}
                                    onClick={() => onChange({ ...record, orgao: o })}
                                    className="px-2 py-0.5 rounded-full text-[8px] font-black border transition-all"
                                    style={{
                                        background: record.orgao === o ? cfg.color : 'white',
                                        color: record.orgao === o ? '#fff' : '#64748B',
                                        borderColor: record.orgao === o ? cfg.color : '#E2E8F0',
                                    }}
                                >
                                    {o}
                                </button>
                            ))}
                        </div>
                        <input
                            value={record.orgao}
                            onChange={e => onChange({ ...record, orgao: e.target.value })}
                            placeholder="Ou digite outro órgão..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold outline-none focus:ring-2 transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Observações</label>
                        <textarea
                            value={record.observacoes || ''}
                            onChange={e => onChange({ ...record, observacoes: e.target.value })}
                            placeholder="Notas adicionais sobre este tombamento..."
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-medium outline-none focus:ring-2 transition-all resize-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export const TombamentoEditor: React.FC<TombamentoEditorProps> = ({ asset, onClose, onSaved }) => {
    const [records, setRecords] = useState<TombamentoRecord[]>(asset.tombamentos || []);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleAdd = () => {
        setRecords(prev => [...prev, EMPTY_TOMBAMENTO()]);
    };

    const handleChange = (i: number, r: TombamentoRecord) => {
        setRecords(prev => prev.map((rec, idx) => idx === i ? r : rec));
    };

    const handleDelete = (i: number) => {
        setRecords(prev => prev.filter((_, idx) => idx !== i));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await updateDoc(doc(db, 'heritage_assets', asset.id), {
                tombamentos: records,
            });
            onSaved({ ...asset, tombamentos: records });
            onClose();
        } catch (e: any) {
            setError(e.message || 'Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1005] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <GlassPanel className="w-full max-w-lg bg-white/97 shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                            <Shield size={16} className="text-brand-red" />
                            Tombamentos
                        </h2>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-bold truncate max-w-72">{asset.titulo}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar">
                    {records.length === 0 && (
                        <div className="py-10 text-center">
                            <Shield size={32} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-xs font-bold text-slate-400">Nenhum tombamento registrado.</p>
                            <p className="text-[10px] text-slate-400 mt-1">Clique em "+ Adicionar Tombamento" para registrar.</p>
                        </div>
                    )}

                    {records.map((r, i) => (
                        <TombamentoCard
                            key={r.id}
                            record={r}
                            onChange={rec => handleChange(i, rec)}
                            onDelete={() => handleDelete(i)}
                        />
                    ))}

                    <button
                        onClick={handleAdd}
                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-brand-red/30 hover:text-brand-red hover:bg-brand-red/5 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={14} />
                        Adicionar Tombamento
                    </button>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 space-y-2 shrink-0">
                    {error && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100 text-red-600 text-[10px] font-bold">
                            <AlertCircle size={12} />
                            {error}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-[2] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            style={{ background: '#CC343A', boxShadow: '0 4px 20px rgba(204,52,58,0.3)' }}
                        >
                            {saving ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save size={13} />
                            )}
                            Salvar Tombamentos
                        </button>
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
};
