import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    Filter,
    Image as ImageIcon,
    Map as MapIcon,
    History,
    Camera,
    X,
    Maximize2,
    Download,
    Share2,
    Info,
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FileUpload } from '../components/ui/FileUpload';

import { acervoSeed } from '../data/acervoSeed';

interface AcervoItem {
    id: string;
    title: string;
    description: string;
    category: 'fotografia' | 'mapa' | 'documento';
    tags: string[];
    imageUrl: string;
    date?: string;
    location?: string;
}

const AcervoPage: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const isEditor = user?.role === 'editor' || isAdmin;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('todas');
    const [selectedItem, setSelectedItem] = useState<AcervoItem | null>(null);
    const [dbDocs, setDbDocs] = useState<AcervoItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Management states
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<AcervoItem>>({});
    const [replacingId, setReplacingId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "acervo_digital"), orderBy("title", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AcervoItem));
            setDbDocs(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const acervoData = useMemo(() => {
        return [...acervoSeed, ...dbDocs].map((item, idx) => ({
            ...item,
            id: item.id || `seed-${idx}`,
            tags: item.tags || [],
            title: item.title || 'Sem Título',
            description: item.description || ''
        }));
    }, [dbDocs]);

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja realmente excluir este item do acervo?")) return;
        try {
            await deleteDoc(doc(db, "acervo_digital", id));
        } catch (error) {
            console.error("Erro ao deletar item:", error);
            alert("Erro ao deletar item.");
        }
    };

    const handleUpdate = async (id: string, updates: Partial<AcervoItem>) => {
        try {
            await updateDoc(doc(db, "acervo_digital", id), updates);
            setIsEditing(null);
        } catch (error) {
            console.error("Erro ao atualizar item:", error);
            alert("Erro ao atualizar item.");
        }
    };

    const handleReplaceImage = async (id: string, file: File) => {
        setReplacingId(id);
        try {
            const storageRef = ref(storage, `acervo/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            await updateDoc(doc(db, "acervo_digital", id), { imageUrl: downloadURL });
        } catch (error) {
            console.error("Erro ao substituir imagem:", error);
            alert("Erro ao substituir imagem.");
        } finally {
            setReplacingId(null);
        }
    };

    const handleAddNew = async (item: Partial<AcervoItem>) => {
        try {
            await addDoc(collection(db, "acervo_digital"), {
                ...item,
                tags: typeof item.tags === 'string' ? (item.tags as string).split(',').map(t => t.trim()) : item.tags,
            });
            setIsAddingNew(false);
        } catch (error) {
            console.error("Erro ao adicionar item:", error);
            alert("Erro ao adicionar item.");
        }
    };

    const categories = [
        { id: 'todas', label: 'Todos', icon: History },
        { id: 'fotografia', label: 'Fotografias', icon: Camera },
        { id: 'mapa', label: 'Mapas', icon: MapIcon },
        { id: 'documento', label: 'Documentos', icon: ImageIcon },
    ];

    const filteredItems = useMemo(() => {
        return acervoData.filter(item => {
            const matchesSearch = (item.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (item.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = activeCategory === 'todas' || item.category === activeCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory, acervoData]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        acervoData.forEach(item => item.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Section */}
            <PageHero
                align="left"
                backgroundImage="/imagens/mapa_sao_luiz.jpg"
                title={<>Acervo <span className="text-[#CC343A]">Digital</span></>}
                description="Coleção de registros históricos, fotografias e mapas que preservam a memória do Maranhão."
                breadcrumb={{ label: 'Voltar para o Ecossistema', to: '/acervo-digital' }}
            />

            {/* Filters & Search - Condensed */}
            <div className="max-w-7xl mx-auto px-4 -mt-6 mb-8 relative z-20">
                <div className="bg-white rounded-2xl shadow-lg p-4 border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search Bar */}
                        <div className="w-full md:max-w-sm relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Pesquisar no acervo..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue transition-all font-bold text-xs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black transition-all text-[10px] uppercase tracking-widest ${activeCategory === cat.id
                                        ? 'bg-brand-blue text-white shadow-md'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                        }`}
                                >
                                    <cat.icon size={14} />
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Popular Tags */}
                    {allTags.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Filter size={10} /> Tags:
                            </span>
                            {allTags.slice(0, 8).map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSearchTerm(tag)}
                                    className="px-2 py-1 bg-slate-50 text-slate-500 rounded-md text-[9px] font-bold hover:bg-brand-blue hover:text-white transition-all border border-slate-100 uppercase"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ImageIcon size={14} className="text-[#CC343A]" />
                        {filteredItems.length} itens encontrados
                    </h2>

                    {isEditor && (
                        <button
                            onClick={() => {
                                setEditForm({ category: 'fotografia', tags: [] });
                                setIsAddingNew(true);
                            }}
                            className="px-4 py-2 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-dark transition-all shadow-lg shadow-brand-blue/20"
                        >
                            <Plus size={16} /> Novo Item
                        </button>
                    )}
                </div>

                {isAddingNew && (
                    <div className="mb-8 p-8 bg-white rounded-3xl border-2 border-dashed border-brand-blue/30 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight">Novo Item no Acervo</h3>
                            <button onClick={() => setIsAddingNew(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Título</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                        placeholder="Título da obra/foto"
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Descrição</label>
                                    <textarea
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium h-24"
                                        placeholder="Descrição detalhada..."
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Categoria</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                                        >
                                            <option value="fotografia">Fotografia</option>
                                            <option value="mapa">Mapa</option>
                                            <option value="documento">Documento</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Data / Época</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                            placeholder="Ex: c. 1920"
                                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tags (separadas por vírgula)</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                        placeholder="Histórico, Arquitetura, Rua"
                                        onChange={(e) => setEditForm({ ...editForm, tags: e.target.value as any })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Imagem</label>
                                    <FileUpload
                                        onUploadComplete={(fileData) => setEditForm({ ...editForm, imageUrl: fileData.url })}
                                        folder="acervo"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button onClick={() => setIsAddingNew(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancelar</button>
                            <button
                                onClick={() => handleAddNew(editForm)}
                                className="px-10 py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all shadow-xl shadow-brand-blue/20"
                            >
                                Salvar no Acervo
                            </button>
                        </div>
                    </div>
                )}

                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all group flex flex-col h-full relative"
                            >
                                {/* Quick Management Overlay */}
                                {isEditor && (
                                    <div className="absolute top-2 right-2 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditForm(item);
                                                setIsEditing(item.id);
                                            }}
                                            className="p-2 bg-white/90 backdrop-blur-sm text-amber-500 rounded-lg shadow-sm hover:bg-amber-500 hover:text-white transition-all"
                                            title="Editar"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <label className="p-2 bg-white/90 backdrop-blur-sm text-brand-blue rounded-lg shadow-sm hover:bg-brand-blue hover:text-white transition-all cursor-pointer">
                                            {replacingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleReplaceImage(item.id, file);
                                                }}
                                            />
                                        </label>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item.id);
                                            }}
                                            className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg shadow-sm hover:bg-red-500 hover:text-white transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                )}

                                <div className="h-40 overflow-hidden relative cursor-pointer" onClick={() => setSelectedItem(item)}>
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-dark scale-50 group-hover:scale-100 transition-transform">
                                            <Maximize2 size={16} />
                                        </div>
                                    </div>
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest shadow-sm ${item.category === 'mapa' ? 'bg-[#CC343A] text-white' : 'bg-brand-blue text-white'
                                            }`}>
                                            {item.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col flex-grow">
                                    <div className="flex-grow">
                                        {isEditing === item.id ? (
                                            <div className="space-y-2 mb-4">
                                                <input
                                                    type="text"
                                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold"
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                />
                                                <textarea
                                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[10px] font-medium h-16"
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdate(item.id, editForm)}
                                                        className="flex-1 py-1.5 bg-emerald-500 text-white rounded text-[8px] font-black uppercase"
                                                    >
                                                        Salvar
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditing(null)}
                                                        className="flex-1 py-1.5 bg-slate-200 text-slate-500 rounded text-[8px] font-black uppercase"
                                                    >
                                                        Sair
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-[11px] font-black text-brand-dark mb-1.5 line-clamp-2 leading-tight min-h-[2.4em]">
                                                    {item.title}
                                                </h3>
                                                <p className="text-slate-500 text-[10px] leading-relaxed mb-3 line-clamp-2 font-medium">
                                                    {item.description}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-4 mt-auto">
                                        {item.tags?.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 mt-auto">
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            className="flex-grow py-2 bg-slate-900 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-brand-blue transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <Info size={12} /> Detalhes
                                        </button>
                                        <a
                                            href={item.imageUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-[#CC343A] hover:text-white transition-all border border-slate-100"
                                            title="Baixar em Alta Resolução"
                                        >
                                            <Download size={14} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                        <Search size={32} className="mx-auto text-slate-200 mb-4" />
                        <h3 className="text-base font-black text-brand-dark mb-1">Nenhum resultado</h3>
                        <p className="text-xs text-slate-400">Ajuste seus filtros.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('todas'); }}
                            className="mt-4 text-brand-blue font-black text-[10px] uppercase tracking-widest hover:underline"
                        >
                            Limpar filtros
                        </button>
                    </div>
                )}
            </div>

            {/* Item Modal (Lightbox) - Condensed */}
            {selectedItem && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#2D2D2D]/95 backdrop-blur-sm" onClick={() => setSelectedItem(null)}></div>
                    <button
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-30 p-2"
                        onClick={() => setSelectedItem(null)}
                    >
                        <X size={24} />
                    </button>

                    <div className="relative z-10 bg-white w-full max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
                        {/* Image Preview */}
                        <div className="w-full md:w-3/5 bg-slate-100 flex items-center justify-center overflow-hidden p-6">
                            <img
                                src={selectedItem.imageUrl}
                                alt={selectedItem.title}
                                className="w-full h-full object-contain shadow-lg"
                            />
                        </div>

                        {/* Details Panel */}
                        <div className="w-full md:w-2/5 p-8 flex flex-col bg-white overflow-y-auto">
                            <div className="mb-4">
                                <span className="text-brand-blue text-[10px] font-black uppercase tracking-widest mb-2 block">
                                    {selectedItem.category}
                                </span>
                                <h2 className="text-xl font-black text-brand-dark leading-tight mb-3">
                                    {selectedItem.title}
                                </h2>
                                <div className="space-y-1 text-xs font-medium text-slate-500 border-l-2 border-[#CC343A] pl-3 py-1 bg-slate-50 rounded-r-lg">
                                    {selectedItem.date && <p><strong>Data:</strong> {selectedItem.date}</p>}
                                    {selectedItem.location && <p><strong>Local:</strong> {selectedItem.location}</p>}
                                </div>
                            </div>

                            <div className="prose prose-slate mb-6">
                                <h4 className="text-brand-dark font-black text-[10px] uppercase tracking-widest mb-2">Descrição</h4>
                                <p className="text-slate-500 leading-relaxed font-medium text-xs">
                                    {selectedItem.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-brand-dark font-black text-[10px] uppercase tracking-widest mb-2">Tags</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedItem.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-[9px] font-bold border border-slate-100">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto space-y-3 pt-6 border-t border-slate-100">
                                <a
                                    href={selectedItem.imageUrl}
                                    download
                                    className="w-full py-3 bg-brand-blue text-white rounded-xl font-black uppercase tracking-widest hover:bg-brand-dark transition-all flex items-center justify-center gap-2 text-[10px] shadow-lg shadow-brand-blue/20"
                                >
                                    <Download size={14} /> Baixar Original
                                </a>
                                <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                                    <Share2 size={14} /> Compartilhar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcervoPage;
