
import React, { useState } from 'react';
import {
  Gavel,
  Search,
  Download,
  FileText,
  ChevronRight,
  Filter,
  BookOpen,
  ShieldCheck,
  Archive,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { useAuth } from '../contexts/AuthContext';
import { FileUpload } from '../components/ui/FileUpload';
import { db, storage } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Trash2, Edit2, RefreshCw, Loader2 } from 'lucide-react';


interface Document {
  id: string;
  title: string;
  category: 'Lei' | 'Decreto' | 'Portaria' | 'Manual' | 'Edital' | 'Outro';
  date: string;
  size: string;
  description: string;
  tags: string[];
  url?: string;
}


const DOCUMENTS: Document[] = [
  {
    id: 'infog-1',
    title: 'Infográfico: Instalação de Engenhos Publicitários',
    category: 'Manual',
    date: '2025-12-23',
    size: '1.4 MB',
    description: 'Guia visual para instalação de placas, letreiros e anúncios em imóveis do Centro Histórico.',
    tags: ['DPHAP', 'Engenhos', 'Visual', 'Destaque']
  },
  {
    id: '1',
    title: 'Lei Estadual de Proteção ao Patrimônio nº 10.543',
    category: 'Lei',
    date: '2016-11-25',
    size: '1.2 MB',
    description: 'Dispõe sobre a proteção do patrimônio cultural material e imaterial do Estado do Maranhão.',
    tags: ['Proteção', 'Geral', 'Estadual']
  },
  {
    id: '2',
    title: 'Decreto de Tombamento do Centro Histórico de São Luís',
    category: 'Decreto',
    date: '1974-06-12',
    size: '850 KB',
    description: 'Decreto que estabelece as poligonais de proteção e as regras de preservação para o núcleo urbano da capital.',
    tags: ['Tombamento', 'São Luís', 'Poligonais']
  },
  {
    id: '3',
    title: 'Portaria SPC/DPHAP nº 042/2023 - Regras de Fachada',
    category: 'Portaria',
    date: '2023-03-15',
    size: '450 KB',
    description: 'Estabelece critérios técnicos para a manutenção e pintura de fachadas em áreas tombadas.',
    tags: ['Arquitetura', 'Manutenção', 'Normas']
  },
  {
    id: '4',
    title: 'Manual do Proprietário de Imóvel Tombado',
    category: 'Manual',
    date: '2022-08-10',
    size: '5.4 MB',
    description: 'Guia prático com orientações sobre direitos, deveres e como solicitar autorizações para reformas.',
    tags: ['Educação', 'Proprietário', 'Guia']
  },
  {
    id: '5',
    title: 'Edital de Chamamento - Salvaguarda do Bumba-meu-boi',
    category: 'Edital',
    date: '2024-01-20',
    size: '2.1 MB',
    description: 'Seleção de projetos voltados para a valorização e continuidade das tradições do Bumba-meu-boi.',
    tags: ['Imaterial', 'Salvaguarda', 'Fomento']
  },
  {
    id: '6',
    title: 'Constituição Federal - Artigo 215 e 216',
    category: 'Lei',
    date: '1988-10-05',
    size: '300 KB',
    description: 'Base constitucional para a proteção do patrimônio cultural brasileiro.',
    tags: ['Nacional', 'Base Legal']
  }
];

const LegislacaoPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const isEditor = user?.role === 'editor' || isAdmin;

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [dbDocs, setDbDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Management states
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Document>>({});
  const [replacingId, setReplacingId] = useState<string | null>(null);

  React.useEffect(() => {
    const q = query(collection(db, "legislation"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Document[];
      setDbDocs(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este documento legal?")) return;
    try {
      await deleteDoc(doc(db, "legislation", id));
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao deletar documento.");
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Document>) => {
    try {
      await updateDoc(doc(db, "legislation", id), updates);
      setIsEditing(null);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar documento.");
    }
  };

  const handleReplaceFile = async (id: string, file: File) => {
    setReplacingId(id);
    try {
      const storageRef = ref(storage, `legislation/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      const size = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      await updateDoc(doc(db, "legislation", id), {
        url,
        size,
        title: file.name
      });
      alert("Arquivo substituído com sucesso!");
    } catch (error) {
      console.error("Erro ao substituir:", error);
      alert("Erro ao substituir arquivo.");
    } finally {
      setReplacingId(null);
    }
  };

  const handleAddNew = async (formData: Partial<Document>) => {
    if (!formData.title || !formData.url) {
      alert("Por favor, preencha o título e faça o upload do documento.");
      return;
    }

    try {
      await addDoc(collection(db, "legislation"), {
        ...formData,
        date: formData.date || new Date().toISOString().split('T')[0],
        tags: typeof formData.tags === 'string' ? (formData.tags as string).split(',').map(t => t.trim()) : (formData.tags || []),
        size: formData.size || "N/A"
      });
      setIsAddingNew(false);
      setEditForm({});
      alert("Documento adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      alert("Erro ao adicionar documento.");
    }
  };

  const allDocuments = [...dbDocs, ...DOCUMENTS];

  const filteredDocs = React.useMemo(() => {
    return allDocuments.filter(doc => {
      const matchesSearch = (doc.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (doc.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (doc.tags || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = activeCategory === 'Todos' || doc.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allDocuments, searchTerm, activeCategory]);

  const categories = ['Todos', 'Lei', 'Decreto', 'Portaria', 'Manual', 'Edital', 'Outro'];


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <PageHero
        align="center"
        backgroundImage="/imagens/1912 - justo jansen - mapa.jpg"
        badge={{
          text: 'Biblioteca Jurídica',
          icon: Gavel,
          variant: 'white'
        }}
        title={<>Legislação e <span className="text-[#CC343A]">Documentos</span></>}
        description="Acesso público a normativas, decretos e manuais técnicos que regem o patrimônio maranhense."
        actions={
          <div className="relative group w-full max-w-lg text-left">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#CC343A] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar por título, palavra-chave ou ano..."
              className="w-full pl-12 pr-6 py-2.5 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl text-[13px] text-white font-medium focus:outline-none focus:ring-4 focus:ring-[#CC343A]/20 focus:border-[#CC343A] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-56 flex-shrink-0 space-y-6">
          <div className="space-y-3">
            <h3 className="text-[9px] font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
              <Filter size={12} className="text-[#CC343A]" /> Categorias
            </h3>
            <div className="flex flex-col gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all ${activeCategory === cat
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'bg-white text-slate-500 hover:bg-slate-100'
                    }`}
                >
                  {cat}
                  <ChevronRight size={12} className={activeCategory === cat ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 bg-brand-red/5 rounded-2xl border border-brand-red/10 space-y-3">
            <h4 className="text-[9px] font-black text-[#CC343A] uppercase tracking-widest">Dúvida Técnica?</h4>
            <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
              Precisa de ajuda com uma norma? Contate nosso jurídico.
            </p>
            <button className="w-full py-2.5 bg-[#CC343A] text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#CC343A]/90 transition-colors">
              Falar com Jurídico
            </button>
          </div>
        </aside>

        {/* Documents List */}
        <section className="flex-grow space-y-6">
          <div className="flex items-center justify-between mb-8 px-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Mostrando {filteredDocs.length} documentos encontrados
            </span>
            <div className="flex gap-2">
              <button className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-brand-blue transition-colors"><Archive size={20} /></button>
            </div>
          </div>

          {isEditor && (
            <div className="mb-12 p-8 bg-white rounded-3xl border-2 border-dashed border-brand-blue/30 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-black text-brand-dark uppercase tracking-tight">Gestão de Documentos Legais</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Adicione novas leis, decretos ou manuais ao sistema oficial.</p>
                </div>
                <button
                  onClick={() => setIsAddingNew(!isAddingNew)}
                  className="px-4 py-2 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-brand-blue/20"
                >
                  {isAddingNew ? 'Fechar Painel' : 'Novo Documento'}
                </button>
              </div>

              {isAddingNew && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Título da Norma</label>
                      <input
                        type="text"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        placeholder="Ex: Lei Estadual nº..."
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Descrição / Resumo</label>
                      <textarea
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium h-24"
                        placeholder="Breve descrição do conteúdo jurídico..."
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Categoria</label>
                        <select
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                        >
                          <option value="Lei">Lei</option>
                          <option value="Decreto">Decreto</option>
                          <option value="Portaria">Portaria</option>
                          <option value="Manual">Manual</option>
                          <option value="Edital">Edital</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tags (vírgula)</label>
                        <input
                          type="text"
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                          placeholder="Jurídico, Tombamento"
                          onChange={(e) => setEditForm({ ...editForm, tags: e.target.value as any })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Arquivo Legal</label>
                      <FileUpload
                        onUploadComplete={(fileData) => setEditForm({
                          ...editForm,
                          url: fileData.url,
                          size: (fileData.file.size / (1024 * 1024)).toFixed(1) + ' MB'
                        })}
                        folder="legislation"
                      />
                    </div>
                    <button
                      onClick={() => handleAddNew(editForm)}
                      className="w-full py-4 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all shadow-xl shadow-brand-blue/20"
                    >
                      Publicar Documento No Portal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}


          {filteredDocs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-lg font-bold text-slate-400">Nenhum documento encontrado.</p>
              <button onClick={() => { setSearchTerm(''); setActiveCategory('Todos') }} className="mt-4 text-brand-blue font-black uppercase tracking-widest text-[10px]">Limpar filtros</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredDocs.map(docItem => (
                <div key={docItem.id} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-brand-blue/30 hover:shadow-xl transition-all group flex flex-col md:flex-row md:items-center gap-6 relative">

                  {isEditor && docItem.id.length > 10 && (
                    <div className="absolute top-4 right-4 flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <button
                        onClick={() => {
                          setEditForm(docItem);
                          setIsEditing(docItem.id);
                        }}
                        className="p-2 bg-slate-50 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                        title="Editar"
                      >
                        <Edit2 size={12} />
                      </button>
                      <label className="p-2 bg-slate-50 text-brand-blue rounded-lg hover:bg-brand-blue hover:text-white transition-all cursor-pointer shadow-sm" title="Substituir arquivo">
                        {replacingId === docItem.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReplaceFile(docItem.id, file);
                          }}
                        />
                      </label>
                      <button
                        onClick={() => handleDelete(docItem.id)}
                        className="p-2 bg-slate-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Excluir"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${docItem.category === 'Lei' ? 'bg-brand-red/10 text-brand-red' :
                    docItem.category === 'Decreto' ? 'bg-brand-blue/10 text-brand-blue' :
                      'bg-slate-100 text-slate-500'
                    } transition-colors group-hover:bg-brand-dark group-hover:text-white`}>
                    <FileText size={28} />
                  </div>

                  <div className="flex-grow space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${docItem.category === 'Lei' ? 'bg-[#CC343A] text-white' :
                        docItem.category === 'Decreto' ? 'bg-brand-blue text-white' :
                          'bg-slate-900 text-white'
                        }`}>
                        {docItem.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        <Calendar size={12} className="text-brand-blue" /> {new Date(docItem.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {isEditing === docItem.id ? (
                      <div className="space-y-3 py-2">
                        <input
                          type="text"
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                        <textarea
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium h-20"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdate(docItem.id, editForm)} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Salvar</button>
                          <button onClick={() => setIsEditing(null)} className="flex-1 py-2 bg-slate-200 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-black text-brand-dark group-hover:text-brand-blue transition-colors leading-tight">{docItem.title}</h3>
                        <p className="text-[12px] text-slate-500 font-medium leading-relaxed max-w-2xl">{docItem.description}</p>
                      </>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      {docItem.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[140px] pt-4 md:pt-0 md:border-l border-slate-50 md:pl-6">
                    <a
                      href={docItem.url || (docItem.id === 'infog-1' ? '/imagens/infografico_engenhos.jpg' : '#')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center gap-3 px-5 py-3 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:translate-y-[-2px] active:scale-95 shadow-lg ${docItem.id === 'infog-1' ? 'bg-brand-red shadow-brand-red/20' : 'bg-brand-blue hover:bg-brand-dark shadow-brand-blue/20'}`}
                    >
                      {docItem.id === 'infog-1' ? 'Ver Guia' : 'Download'} <Download size={14} />
                    </a>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">{docItem.size}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-100"></div>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">PDF</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Featured Downloads Section */}
      <section className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-brand-dark tracking-tighter uppercase">Destaques e Formulários</h2>
              <div className="h-1 w-12 bg-[#CC343A] rounded-full"></div>
              <p className="text-xs text-slate-500 max-w-md font-medium">Documentos essenciais para solicitações rápidas e conhecimento de base.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#2D2D2D] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all">
              Ver Todos <ExternalLink size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Plano de Salvaguarda DPI', color: 'bg-[#CC343A]', icon: ShieldCheck },
              { title: 'Checklist para Reformas', color: 'bg-brand-blue', icon: FileText },
              { title: 'Guia de Tombamento Federal', color: 'bg-brand-dark', icon: BookOpen }
            ].map((item, i) => (
              <div key={i} className="group relative overflow-hidden bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:shadow-lg transition-all">
                <div className={`absolute top-0 right-0 w-24 h-24 ${item.color} opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full`}></div>
                <item.icon size={32} className={`${item.color.replace('bg-', 'text-')} mb-4 opacity-40 group-hover:opacity-100 transition-opacity`} />
                <h4 className="text-lg font-black text-brand-dark mb-3 leading-tight">{item.title}</h4>
                <button className="flex items-center gap-2 text-[9px] font-black text-brand-blue uppercase tracking-widest group-hover:gap-4 transition-all">
                  Download PDF <Download size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegislacaoPage;
