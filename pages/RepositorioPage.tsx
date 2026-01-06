import React, { useState, useMemo, useEffect } from 'react';
import {
    Database,
    FileText,
    Download,
    ArrowRight,
    Clock,
    ShieldCheck,
    Archive,
    Info,
    X,
    Share2,
    Plus,
    Edit2,
    Trash2,
    RefreshCw,
    Loader2,
    Book,
    BookOpen,
    GraduationCap
} from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { SearchFilterCard, FilterCategory } from '../components/ui/SearchFilterCard';
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

import { repositorioSeed } from '../data/acervoSeed';

interface RepositorioItem {
    id: string;
    title: string;
    description: string;
    category: 'dossie' | 'publicacao' | 'livro' | 'artigo' | 'dissertacao_tese' | 'revista' | 'edital' | 'ata' | 'afins';
    department: 'DPHAP' | 'DPI' | 'DPE' | 'Geral';
    date: string;
    format: 'PDF' | 'DOCX' | 'ZIP';
    size: string;
    tags: string[];
    downloadUrl: string;
}

const RepositorioPage: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const isEditor = user?.role === 'editor' || isAdmin;

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('todos');
    const [selectedItem, setSelectedItem] = useState<RepositorioItem | null>(null);
    const [dbDocs, setDbDocs] = useState<RepositorioItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Management states
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<RepositorioItem>>({});
    const [replacingId, setReplacingId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "repositorio_tecnico"), orderBy("date", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as RepositorioItem));
            setDbDocs(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const repositorioData = useMemo(() => {
        return [...repositorioSeed, ...dbDocs].map((item, idx) => ({
            ...item,
            id: item.id || `seed-${idx}`,
            tags: item.tags || [],
            title: item.title || 'Sem Título',
            description: item.description || ''
        })) as RepositorioItem[];
    }, [dbDocs]);

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja realmente excluir este documento do repositório?")) return;
        try {
            await deleteDoc(doc(db, "repositorio_tecnico", id));
        } catch (error) {
            console.error("Erro ao deletar documento:", error);
            alert("Erro ao deletar documento.");
        }
    };

    const handleUpdate = async (id: string, updates: Partial<RepositorioItem>) => {
        try {
            await updateDoc(doc(db, "repositorio_tecnico", id), updates);
            setIsEditing(null);
        } catch (error) {
            console.error("Erro ao atualizar documento:", error);
            alert("Erro ao atualizar documento.");
        }
    };

    const handleReplaceFile = async (id: string, file: File) => {
        setReplacingId(id);
        try {
            const storageRef = ref(storage, `repositorio/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Guess format and size
            const format = file.name.split('.').pop()?.toUpperCase() as any || 'PDF';
            const size = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

            await updateDoc(doc(db, "repositorio_tecnico", id), {
                downloadUrl: downloadURL,
                format,
                size
            });
        } catch (error) {
            console.error("Erro ao substituir arquivo:", error);
            alert("Erro ao substituir arquivo.");
        } finally {
            setReplacingId(null);
        }
    };

    const handleAddNew = async (item: Partial<RepositorioItem>) => {
        try {
            await addDoc(collection(db, "repositorio_tecnico"), {
                ...item,
                tags: typeof item.tags === 'string' ? (item.tags as string).split(',').map(t => t.trim()) : (item.tags || []),
                date: item.date || new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error("Erro ao adicionar documento:", error);
            alert("Erro ao adicionar documento.");
        }
    };

    const handleSave = async () => {
        if (isEditing) {
            await handleUpdate(isEditing, editForm);
        } else {
            await handleAddNew(editForm);
        }
        setIsAddingNew(false);
        setIsEditing(null);
    };

    const handleOpenEdit = (item: RepositorioItem) => {
        setEditForm(item);
        setIsEditing(item.id);
        setIsAddingNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getCategoryConfig = (category: string) => {
        const cat = categories.find(c => c.id === category) || categories[0];
        const colors: Record<string, string> = {
            dossie: 'bg-brand-blue',
            edital: 'bg-brand-red',
            ata: 'bg-orange-500',
            publicacao: 'bg-emerald-500',
            livro: 'bg-violet-500',
            artigo: 'bg-indigo-500',
            dissertacao_tese: 'bg-amber-500',
            revista: 'bg-pink-500',
            afins: 'bg-slate-400'
        };
        const lightColors: Record<string, string> = {
            dossie: 'bg-brand-blue/10 text-brand-blue',
            edital: 'bg-brand-red/10 text-brand-red',
            ata: 'bg-orange-100 text-orange-600',
            publicacao: 'bg-emerald-100 text-emerald-600',
            livro: 'bg-violet-100 text-violet-600',
            artigo: 'bg-indigo-100 text-indigo-600',
            dissertacao_tese: 'bg-amber-100 text-amber-600',
            revista: 'bg-pink-100 text-pink-600',
            afins: 'bg-slate-100 text-slate-600'
        };
        return {
            icon: cat.icon,
            label: cat.label,
            color: colors[category] || 'bg-slate-400',
            lightColor: lightColors[category] || 'bg-slate-100 text-slate-600'
        };
    };

    const categories: FilterCategory[] = [
        { id: 'todos', label: 'Todos', icon: Database },
        { id: 'dossie', label: 'Dossiês', icon: ShieldCheck },
        { id: 'publicacao', label: 'Publicações', icon: FileText },
        { id: 'livro', label: 'Livros', icon: Book },
        { id: 'artigo', label: 'Artigos', icon: FileText },
        { id: 'dissertacao_tese', label: 'Teses e Dissert.', icon: GraduationCap },
        { id: 'revista', label: 'Revistas', icon: BookOpen },
        { id: 'edital', label: 'Editais', icon: Info },
        { id: 'ata', label: 'Atas', icon: Archive },
        { id: 'afins', label: 'Afins', icon: Plus },
    ];

    const filteredItems = useMemo(() => {
        return repositorioData.filter(item => {
            const matchesSearch = (item.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (item.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = activeCategory === 'todos' || item.category === activeCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory, repositorioData]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        repositorioData.forEach(item => item.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHero
                title={<>Repositório de <span className="text-brand-red">Documentos</span></>}
                description="Acesso oficial a dossiês técnicos, atas, editais e publicações acadêmicas da Superintendência."
                badge={{ text: 'Biblioteca Técnica SPC', variant: 'blue' }}
                breadcrumb={{ label: 'Voltar para o Ecossistema Digital', to: '/acervo-digital' }}
                align="left"
            />

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <SearchFilterCard
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Documentos, leis, atas..."
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    tags={allTags}
                    onTagClick={setSearchTerm}
                />
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-brand-dark flex items-center gap-3">
                            <Database className="text-brand-red" size={20} />
                            Repositório Técnico
                        </h2>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                                {filteredItems.length} Documentos Disponíveis
                            </p>
                            {activeCategory !== 'todos' && (
                                <>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest bg-brand-blue/5 px-2 py-0.5 rounded-md">
                                        Filtro: {categories.find(c => c.id === activeCategory)?.label}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isEditor && (
                            <button
                                onClick={() => {
                                    setEditForm({ category: 'dossie', department: 'Geral', tags: [] });
                                    setIsAddingNew(true);
                                }}
                                className="px-6 py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-dark transition-all shadow-xl shadow-brand-blue/20"
                            >
                                <Plus size={16} /> Novo Documento
                            </button>
                        )}
                    </div>
                </div>

                {isAddingNew && (
                    <div className="mb-12 p-8 bg-white rounded-3xl border-2 border-dashed border-brand-blue/30 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight">
                                {isEditing ? 'Editar Documento' : 'Novo Documento Técnico'}
                            </h3>
                            <button onClick={() => { setIsAddingNew(false); setIsEditing(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-all">
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
                                        placeholder="Título do documento"
                                        value={editForm.title || ''}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Descrição</label>
                                    <textarea
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium h-24"
                                        placeholder="Resumo do conteúdo..."
                                        value={editForm.description || ''}
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
                                            value={editForm.category || 'dossie'}
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                                        >
                                            <option value="dossie">Dossiê</option>
                                            <option value="publicacao">Publicação</option>
                                            <option value="livro">Livro</option>
                                            <option value="artigo">Artigo</option>
                                            <option value="dissertacao_tese">Dissertação/Tese</option>
                                            <option value="revista">Revista</option>
                                            <option value="edital">Edital</option>
                                            <option value="ata">Ata</option>
                                            <option value="afins">Afins/Outros</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Departamento</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                            value={editForm.department || 'Geral'}
                                            onChange={(e) => setEditForm({ ...editForm, department: e.target.value as any })}
                                        >
                                            <option value="Geral">Geral</option>
                                            <option value="DPHAP">DPHAP</option>
                                            <option value="DPI">DPI</option>
                                            <option value="DPE">DPE</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Documento (Upload)</label>
                                    <FileUpload
                                        onUploadComplete={(fileData) => setEditForm({
                                            ...editForm,
                                            downloadUrl: fileData.url,
                                            format: fileData.name.split('.').pop()?.toUpperCase() as any || 'PDF',
                                            size: 'N/A'
                                        })}
                                        folder="repositorio"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tags (separadas por vírgula)</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                        placeholder="Patrimônio, Técnico, UNESCO"
                                        value={typeof editForm.tags === 'string' ? editForm.tags : editForm.tags?.join(', ') || ''}
                                        onChange={(e) => setEditForm({ ...editForm, tags: e.target.value as any })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button onClick={() => { setIsAddingNew(false); setIsEditing(null); }} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancelar</button>
                            <button
                                onClick={handleSave}
                                className="px-10 py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all shadow-xl shadow-brand-blue/20"
                            >
                                {isEditing ? 'Salvar Alterações' : 'Salvar Documento'}
                            </button>
                        </div>
                    </div>
                )}

                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col relative overflow-hidden h-full"
                            >
                                <div className={`absolute top-0 left-0 w-full h-1 ${getCategoryConfig(item.category).color}`}></div>

                                {/* Quick Management Overlay */}
                                {isEditor && (
                                    <div className="absolute top-3 right-3 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditForm(item);
                                                setIsEditing(item.id);
                                            }}
                                            className="p-1.5 bg-white/90 backdrop-blur-sm text-amber-500 rounded-lg shadow-sm hover:bg-amber-500 hover:text-white transition-all"
                                            title="Editar"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <label className="p-1.5 bg-white/90 backdrop-blur-sm text-brand-blue rounded-lg shadow-sm hover:bg-brand-blue hover:text-white transition-all cursor-pointer" title="Substituir arquivo">
                                            {replacingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleReplaceFile(item.id, file);
                                                }}
                                            />
                                        </label>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item.id);
                                            }}
                                            className="p-1.5 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg shadow-sm hover:bg-red-500 hover:text-white transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                )}

                                <div className="p-5 flex flex-col h-full" onClick={() => setSelectedItem(item)}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-2 rounded-lg ${getCategoryConfig(item.category).lightColor} transition-colors group-hover:bg-brand-dark group-hover:text-white`}>
                                            {React.createElement(getCategoryConfig(item.category).icon, { size: 16 })}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(item.date).getFullYear()}</span>
                                    </div>

                                    {isEditing === item.id ? (
                                        <div className="space-y-2 mb-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-bold"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            />
                                            <textarea
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[10px] font-medium h-20"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdate(item.id, editForm)}
                                                    className="flex-1 py-1.5 bg-emerald-500 text-white rounded text-[9px] font-black uppercase"
                                                >
                                                    Salvar
                                                </button>
                                                <button
                                                    onClick={() => setIsEditing(null)}
                                                    className="flex-1 py-1.5 bg-slate-200 text-slate-500 rounded text-[9px] font-black uppercase"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-sm font-black text-brand-dark mb-2 group-hover:text-brand-blue transition-colors leading-tight line-clamp-2 min-h-[2.4em]">
                                                {item.title}
                                            </h3>

                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4 line-clamp-3">
                                                {item.description}
                                            </p>
                                        </>
                                    )}

                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex gap-2">
                                            <span className="text-[9px] font-black py-1 px-2.5 bg-slate-50 text-slate-400 rounded-md uppercase tracking-widest">
                                                {item.format}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 pt-1">
                                                {item.size}
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue group-hover:text-white transition-all shadow-sm">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-sm animate-fade-in">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Database size={32} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-brand-dark mb-2">Nenhum documento encontrado</h3>
                        <p className="text-slate-400 font-medium text-sm">Tente ajustar seus filtros ou termos de pesquisa.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('todos'); }}
                            className="mt-8 px-8 py-3 bg-brand-blue text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-xl transition-all"
                        >
                            Ver Todos os Arquivos
                        </button>
                    </div>
                )}
            </div>

            {/* Document Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-md transition-opacity duration-300" onClick={() => setSelectedItem(null)}></div>
                    <div className="bg-white relative z-20 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300 h-auto max-h-[90vh]">

                        {/* Left Side: Preview/Icon Section */}
                        <div className={`hidden md:flex md:w-1/3 items-center justify-center relative overflow-hidden ${getCategoryConfig(selectedItem.category).color}`}>
                            <div className="absolute inset-0 opacity-10">
                                <img src="/imagens/mapa_sao_luiz.jpg" alt="pattern" className="w-full h-full object-cover" />
                            </div>
                            <div className="relative text-white flex flex-col items-center text-center p-8">
                                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 border border-white/30 shadow-2xl">
                                    {React.createElement(getCategoryConfig(selectedItem.category).icon, { size: 48, className: "text-white" })}
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-widest">{selectedItem.format}</h4>
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">{selectedItem.size}</p>
                            </div>
                        </div>

                        {/* Right Side: Content */}
                        <div className="flex-1 p-8 md:p-12 flex flex-col relative overflow-y-auto">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-8 right-8 p-3 bg-slate-50 rounded-full text-slate-400 hover:bg-brand-red hover:text-white transition-all transform hover:rotate-90 z-10 shadow-sm"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-6">
                                <span className={`inline-block text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl mb-4 ${getCategoryConfig(selectedItem.category).lightColor}`}>
                                    Categoria: {getCategoryConfig(selectedItem.category).label}
                                </span>
                                <h2 className="text-2xl md:text-3xl font-black text-brand-dark mb-4 leading-tight tracking-tight">
                                    {selectedItem.title}
                                </h2>
                                <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                    <span className="flex items-center gap-2"><Clock size={14} className="text-brand-blue" /> {new Date(selectedItem.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-2"><Database size={14} className="text-brand-red" /> {selectedItem.department}</span>
                                </div>
                            </div>

                            <div className="prose prose-slate max-w-none mb-8">
                                <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Info size={12} className="text-brand-blue" /> Visão Geral do Documento
                                </h3>
                                <p className="text-slate-500 leading-relaxed font-medium text-sm">
                                    {selectedItem.description}
                                </p>
                            </div>

                            <div className="mt-auto pt-8 border-t border-slate-100">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a
                                        href={selectedItem.downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-[2] py-5 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-dark transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-brand-blue/20 text-center"
                                    >
                                        <Download size={18} /> Baixar Arquivo em {selectedItem.format}
                                    </a>
                                    {isEditor ? (
                                        <button
                                            onClick={() => handleOpenEdit(selectedItem)}
                                            className="flex-1 py-5 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20"
                                        >
                                            <Edit2 size={18} /> Editar Documento
                                        </button>
                                    ) : (
                                        <button className="flex-1 py-5 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-3 border border-slate-100">
                                            <Share2 size={18} /> Compartilhar
                                        </button>
                                    )}
                                </div>
                                <p className="text-center mt-6 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                    Este é um documento de acesso público disponibilizado pela SPC Maranhão.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepositorioPage;
