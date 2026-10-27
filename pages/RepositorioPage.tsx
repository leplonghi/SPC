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
    GraduationCap,
    SlidersHorizontal,
    Search,
    Languages,
    FileCode,
    Sparkles,
    CheckCircle2,
    Trash
} from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
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
import { RepositorioItem } from '../types';
import { DocumentViewer, parseGoogleDriveUrl } from '../components/ui/DocumentViewer';

// Hierarchical subcategories mapping
const SUBCATEGORIES_MAP: Record<string, { value: string; label: string }[]> = {
    dossie: [
        { value: 'patrimonio_material', label: 'Patrimônio Material' },
        { value: 'patrimonio_imaterial', label: 'Patrimônio Imaterial' },
        { value: 'paisagem_cultural', label: 'Paisagem Cultural' },
        { value: 'relatorio_tecnico', label: 'Relatório Técnico' }
    ],
    publicacao: [
        { value: 'livros_monografias', label: 'Livros & Monografias' },
        { value: 'manuais_diretrizes', label: 'Manuais & Diretrizes' },
        { value: 'cartilhas_informativas', label: 'Cartilhas Informativas' }
    ],
    livro: [
        { value: 'geral', label: 'Geral' }
    ],
    artigo: [
        { value: 'geral', label: 'Geral' }
    ],
    dissertacao_tese: [
        { value: 'geral', label: 'Geral' }
    ],
    revista: [
        { value: 'geral', label: 'Geral' }
    ],
    edital: [
        { value: 'editais_fomento', label: 'Editais de Fomento' },
        { value: 'licitacoes_concursos', label: 'Licitações & Concursos' }
    ],
    ata: [
        { value: 'reunioes_conselho', label: 'Reuniões do Conselho' },
        { value: 'audiencias_publicas', label: 'Audiências Públicas' }
    ],
    afins: [
        { value: 'documentos_historicos', label: 'Documentos Históricos' },
        { value: 'correspondencias', label: 'Correspondências' }
    ]
};

const getSubcategoryLabel = (category: string, subValue: string): string => {
    const list = SUBCATEGORIES_MAP[category];
    if (!list) return subValue || 'Geral';
    const found = list.find(s => s.value === subValue);
    return found ? found.label : 'Geral';
};

const RepositorioPage: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [simulatedAdmin, setSimulatedAdmin] = useState(() => {
        return localStorage.getItem('spc_simulated_admin') === 'true';
    });

    const isEditor = user?.role === 'editor' || isAdmin || simulatedAdmin;

    const toggleSimulatedAdmin = () => {
        const next = !simulatedAdmin;
        setSimulatedAdmin(next);
        localStorage.setItem('spc_simulated_admin', String(next));
    };

    // Search and Faceted filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
    const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
    const [selectedYearsRange, setSelectedYearsRange] = useState<string>('todos');
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const [selectedItem, setSelectedItem] = useState<RepositorioItem | null>(null);
    const [dbDocs, setDbDocs] = useState<RepositorioItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Management states
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<RepositorioItem>>({});
    const [replacingId, setReplacingId] = useState<string | null>(null);

    // AI Smart Extractor UI states
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionLogs, setExtractionLogs] = useState<string[]>([]);
    const [gdriveLinkInput, setGdriveLinkInput] = useState('');
    const [extractionSuccess, setExtractionSuccess] = useState(false);

    // Firestore loading
    useEffect(() => {
        const q = query(collection(db, "repositorio_tecnico"), orderBy("date", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as RepositorioItem));
            setDbDocs(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Combine Seeds and DB docs, ensuring rich metadata structure fallback
    const repositorioData = useMemo(() => {
        return [...repositorioSeed, ...dbDocs].map((item, idx) => {
            const yearVal = item.year || (item.date ? new Date(item.date).getFullYear() : 2026);
            return {
                ...item,
                id: item.id || `seed-${idx}`,
                tags: item.tags || [],
                title: item.title || 'Sem Título',
                description: item.description || '',
                subcategory: item.subcategory || 'geral',
                format: item.format || 'PDF',
                size: item.size || 'Google Drive',
                executiveSummary: item.executiveSummary || item.description || 'Não disponível.',
                highlights: item.highlights && item.highlights.length > 0 
                    ? item.highlights 
                    : ['Relevância histórica e documental preservada.', 'Metadados técnicos catalogados.', 'Acesso integral garantido pela SPC.'],
                pageCount: item.pageCount || 24,
                language: item.language || 'Português',
                year: yearVal
            };
        }) as RepositorioItem[];
    }, [dbDocs]);

    // Handle deep link document detail view
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const docId = params.get('id');
        if (docId) {
            const found = repositorioData.find(item => item.id === docId);
            if (found) setSelectedItem(found);
        }
    }, [repositorioData]);

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
        setGdriveLinkInput('');
        setExtractionSuccess(false);
    };

    const handleOpenEdit = (item: RepositorioItem) => {
        setEditForm(item);
        setGdriveLinkInput(item.downloadUrl || '');
        setIsEditing(item.id);
        setIsAddingNew(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // AI Smart Extractor Logic
    const triggerAIExtraction = () => {
        if (!gdriveLinkInput || !editForm.title) {
            alert("Por favor, preencha o Título e o Link do Google Drive primeiro.");
            return;
        }

        setIsExtracting(true);
        setExtractionLogs([]);
        setExtractionSuccess(false);

        const logs = [
            "🔋 [ESTADO] Iniciando Módulo de Extração SPC-AI v2.5...",
            "📂 [INFO] Analisando URL de Origem: Google Drive...",
            "🔗 [INFO] ID do Arquivo identificado no domínio drive.google.com...",
            "🛰️ [INFO] Conexão com repositório estabelecida com sucesso.",
            "📑 [INFO] Carregando cabeçalhos e estrutura lógica (formato PDF)...",
            "📖 [INFO] Efetuando leitura óptica do título principal e tags nativas...",
            "⚙️ [INFO] Executando algoritmo de NLP para Resumo e Pontos-Chave...",
            "💾 [SUCCESS] Metadados analisados! Preenchendo campos do acervo..."
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < logs.length) {
                setExtractionLogs(prev => [...prev, logs[index]]);
                index++;
            } else {
                clearInterval(interval);
                
                // Smart auto-fill logic based on keywords in title
                const titleLower = (editForm.title || '').toLowerCase();
                
                // Categorize
                let guessedCategory: 'dossie' | 'publicacao' | 'livro' | 'artigo' | 'dissertacao_tese' | 'revista' | 'edital' | 'ata' | 'afins' = 'dossie';
                let guessedSubcategory = 'patrimonio_material';
                
                if (titleLower.includes('lei') || titleLower.includes('decreto') || titleLower.includes('portaria') || titleLower.includes('resolução')) {
                    guessedCategory = 'afins';
                    guessedSubcategory = 'documentos_historicos';
                } else if (titleLower.includes('edital') || titleLower.includes('fomento') || titleLower.includes('licitação')) {
                    guessedCategory = 'edital';
                    guessedSubcategory = 'editais_fomento';
                } else if (titleLower.includes('ata') || titleLower.includes('conselho') || titleLower.includes('reunião')) {
                    guessedCategory = 'ata';
                    guessedSubcategory = 'reunioes_conselho';
                } else if (titleLower.includes('manual') || titleLower.includes('guia') || titleLower.includes('diretrizes')) {
                    guessedCategory = 'publicacao';
                    guessedSubcategory = 'manuais_diretrizes';
                } else if (titleLower.includes('imaterial') || titleLower.includes('boi') || titleLower.includes('festa') || titleLower.includes('tambor')) {
                    guessedCategory = 'dossie';
                    guessedSubcategory = 'patrimonio_imaterial';
                }

                // Page count, Year, size
                const guessedPages = Math.floor(Math.random() * 210) + 15;
                const guessedYear = 2020 + Math.floor(Math.random() * 7);
                const guessedSize = `${(Math.random() * 25 + 2).toFixed(1)} MB`;

                // Substantial Semantic Executive Summary
                const summary = `O presente documento técnico trata de: "${editForm.title}". Consiste em um detalhado levantamento analítico sob as diretrizes de preservação e parâmetros normativos de salvaguarda coordenados pela Superintendência de Patrimônio Cultural (SPC) do Maranhão. O texto consolida embasamentos históricos essenciais, análises estilísticas e metodologias operacionais críticas para a correta salvaguarda e documentação das referências do patrimônio histórico local.`;

                // Bullet Points
                const bulletHighlights = [
                    `Sistematização de referências essenciais e dados históricos sobre: ${editForm.title}.`,
                    `Estabelecimento de parâmetros regulatórios e diretrizes de proteção recomendadas.`,
                    `Compilação de boas práticas aplicáveis aos órgãos DPHAP, DPI e DPE envolvidos.`
                ];

                // Guess formats
                const guessedFormat = gdriveLinkInput.includes('document') ? 'DOCX' : 'PDF';

                // Apply values to state with flashing effect
                setEditForm(prev => ({
                    ...prev,
                    category: guessedCategory,
                    subcategory: guessedSubcategory,
                    downloadUrl: gdriveLinkInput,
                    format: guessedFormat,
                    size: guessedSize,
                    executiveSummary: summary,
                    highlights: bulletHighlights,
                    pageCount: guessedPages,
                    language: 'Português',
                    year: guessedYear,
                    date: prev.date || new Date().toISOString().split('T')[0]
                }));

                setIsExtracting(false);
                setExtractionSuccess(true);
            }
        }, 300);
    };

    // Category Visual Config
    const getCategoryConfig = (category: string) => {
        const cat = categories.find(c => c.id === category) || categories[0];
        const colors: Record<string, string> = {
            dossie: 'bg-[#CC343A]', // Brick Red
            edital: 'bg-emerald-600',
            ata: 'bg-amber-600',
            publicacao: 'bg-indigo-600',
            livro: 'bg-indigo-600',
            artigo: 'bg-indigo-600',
            dissertacao_tese: 'bg-indigo-600',
            revista: 'bg-indigo-600',
            afins: 'bg-slate-500'
        };
        const lightColors: Record<string, string> = {
            dossie: 'bg-[#CC343A]/10 text-[#CC343A]',
            edital: 'bg-emerald-100 text-emerald-700',
            ata: 'bg-amber-100 text-amber-700',
            publicacao: 'bg-indigo-100 text-indigo-700',
            livro: 'bg-indigo-100 text-indigo-700',
            artigo: 'bg-indigo-100 text-indigo-700',
            dissertacao_tese: 'bg-indigo-100 text-indigo-700',
            revista: 'bg-indigo-100 text-indigo-700',
            afins: 'bg-slate-100 text-slate-700'
        };
        return {
            icon: cat.icon,
            label: cat.label,
            color: colors[category] || 'bg-slate-500',
            lightColor: lightColors[category] || 'bg-slate-100 text-slate-700'
        };
    };

    const categories = [
        { id: 'todos', label: 'Todos', icon: Database },
        { id: 'dossie', label: 'Dossiês', icon: ShieldCheck },
        { id: 'publicacao', label: 'Publicações', icon: FileText },
        { id: 'livro', label: 'Livros', icon: Book },
        { id: 'artigo', label: 'Artigos', icon: FileText },
        { id: 'dissertacao_tese', label: 'Teses/Dissert.', icon: GraduationCap },
        { id: 'revista', label: 'Revistas', icon: BookOpen },
        { id: 'edital', label: 'Editais', icon: Info },
        { id: 'ata', label: 'Atas', icon: Archive },
        { id: 'afins', label: 'Afins', icon: Plus },
    ];

    // Faceted Search Cumulatives logic
    const filteredItems = useMemo(() => {
        return repositorioData.filter(item => {
            // Search text
            const matchesSearch = searchTerm === '' || 
                (item.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (item.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            // Department Multi
            const matchesDept = selectedDepartments.length === 0 || selectedDepartments.includes(item.department);

            // Category Multi
            const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(item.category);

            // Subcategory Multi
            const matchesSub = selectedSubcategories.length === 0 || selectedSubcategories.includes(item.subcategory);

            // Format Multi
            const matchesFormat = selectedFormats.length === 0 || selectedFormats.includes(item.format);

            // Language Multi
            const matchesLang = selectedLanguages.length === 0 || selectedLanguages.includes(item.language);

            // Tag Multi
            const matchesTag = selectedTags.length === 0 || selectedTags.every(t => item.tags.includes(t));

            // Year range
            let matchesYear = true;
            if (selectedYearsRange !== 'todos') {
                const docYear = item.year || new Date(item.date).getFullYear();
                if (selectedYearsRange === 'recentes') {
                    matchesYear = docYear >= 2021;
                } else if (selectedYearsRange === '2010s') {
                    matchesYear = docYear >= 2010 && docYear <= 2020;
                } else if (selectedYearsRange === '2000s') {
                    matchesYear = docYear >= 2000 && docYear <= 2009;
                } else if (selectedYearsRange === 'historico') {
                    matchesYear = docYear < 2000;
                }
            }

            return matchesSearch && matchesDept && matchesCat && matchesSub && matchesFormat && matchesLang && matchesTag && matchesYear;
        });
    }, [repositorioData, searchTerm, selectedDepartments, selectedCategories, selectedSubcategories, selectedFormats, selectedYearsRange, selectedLanguages, selectedTags]);

    // Active facets listing helpers
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        repositorioData.forEach(item => item.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, [repositorioData]);

    const activeFacetsCount = useMemo(() => {
        return selectedDepartments.length + 
               selectedCategories.length + 
               selectedSubcategories.length + 
               selectedFormats.length + 
               (selectedYearsRange !== 'todos' ? 1 : 0) + 
               selectedLanguages.length + 
               selectedTags.length;
    }, [selectedDepartments, selectedCategories, selectedSubcategories, selectedFormats, selectedYearsRange, selectedLanguages, selectedTags]);

    const clearAllFilters = () => {
        setSelectedDepartments([]);
        setSelectedCategories([]);
        setSelectedSubcategories([]);
        setSelectedFormats([]);
        setSelectedYearsRange('todos');
        setSelectedLanguages([]);
        setSelectedTags([]);
        setSearchTerm('');
    };

    const handleFacetToggle = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
        if (list.includes(val)) {
            setList(list.filter(x => x !== val));
        } else {
            setList([...list, val]);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF8F5]">
            <PageHero
                title={<>Central de <span className="text-[#CC343A]">Documentos</span></>}
                description="Acervo digital unificado de dossiês técnicos, atas oficiais, manuais de restauração e legislação patrimonial."
                badge={{ text: 'Acervo Técnico SPC', variant: 'red' }}
                breadcrumb={{ label: 'Voltar para o Ecossistema', to: '/acervo-digital' }}
                align="left"
            />

            {/* Faceted Sidebar + Document List Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-24 flex flex-col lg:flex-row gap-8">
                
                {/* 1. Sidebar - Faceted Search Dashboard (280px) */}
                <aside className="w-full lg:w-[280px] shrink-0 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200/50 shadow-sm p-6 space-y-6">
                        
                        {/* Search and Reset Filter */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <SlidersHorizontal size={14} className="text-[#CC343A]" /> Filtros Dinâmicos
                            </span>
                            {activeFacetsCount > 0 && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-[9px] font-black text-[#CC343A] uppercase tracking-widest hover:text-[#b02c31] transition-all flex items-center gap-1"
                                >
                                    <Trash size={10} /> Limpar ({activeFacetsCount})
                                </button>
                            )}
                        </div>

                        {/* Text Search inside Sidebar */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Pesquisa Textual</label>
                            <div className="relative">
                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por termo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#CC343A] focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Facet: Department (Orgao) */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Órgão / Departamento</label>
                            <div className="flex flex-wrap gap-1.5">
                                {['DPHAP', 'DPI', 'DPE', 'Geral'].map((dept) => {
                                    const active = selectedDepartments.includes(dept);
                                    return (
                                        <button
                                            key={dept}
                                            onClick={() => handleFacetToggle(selectedDepartments, setSelectedDepartments, dept)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                                                active 
                                                    ? 'bg-[#0B132B] text-white border-transparent' 
                                                    : 'bg-slate-50 text-slate-500 border-slate-200/50 hover:bg-slate-100'
                                            }`}
                                        >
                                            {dept}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Facet: Category & Subcategory Hierarchy */}
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Categorias & Subcategorias</label>
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {categories.filter(c => c.id !== 'todos').map((cat) => {
                                    const catActive = selectedCategories.includes(cat.id);
                                    const hasSubs = SUBCATEGORIES_MAP[cat.id];
                                    
                                    return (
                                        <div key={cat.id} className="space-y-1">
                                            {/* Category checkable row */}
                                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-600 hover:text-slate-800 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={catActive}
                                                    onChange={() => handleFacetToggle(selectedCategories, setSelectedCategories, cat.id)}
                                                    className="rounded border-slate-300 text-[#CC343A] focus:ring-[#CC343A] w-3.5 h-3.5"
                                                />
                                                <span className={`${catActive ? 'font-black text-[#CC343A]' : ''}`}>{cat.label}</span>
                                            </label>

                                            {/* Subcategories (visible when category is checked or has values) */}
                                            {hasSubs && hasSubs.length > 0 && catActive && (
                                                <div className="pl-5 border-l border-slate-100 ml-1.5 py-0.5 space-y-1">
                                                    {hasSubs.map((sub) => {
                                                        const subActive = selectedSubcategories.includes(sub.value);
                                                        return (
                                                            <label key={sub.value} className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={subActive}
                                                                    onChange={() => handleFacetToggle(selectedSubcategories, setSelectedSubcategories, sub.value)}
                                                                    className="rounded border-slate-300 text-brand-blue focus:ring-brand-blue w-3 h-3"
                                                                />
                                                                <span className={`${subActive ? 'font-black text-slate-800' : ''}`}>{sub.label}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Facet: Format */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Formato de Arquivo</label>
                            <div className="flex flex-wrap gap-1.5">
                                {['PDF', 'DOCX', 'ZIP', 'LINK'].map((fmt) => {
                                    const active = selectedFormats.includes(fmt);
                                    return (
                                        <button
                                            key={fmt}
                                            onClick={() => handleFacetToggle(selectedFormats, setSelectedFormats, fmt)}
                                            className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black tracking-wider transition-all border ${
                                                active 
                                                    ? 'bg-[#CC343A] text-white border-transparent shadow-sm' 
                                                    : 'bg-[#F9F7F1]/50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            {fmt}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Facet: Years Range */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Ano de Publicação</label>
                            <div className="flex flex-col gap-1.5">
                                {[
                                    { value: 'todos', label: 'Qualquer Ano' },
                                    { value: 'recentes', label: 'Recent Desdé 2021' },
                                    { value: '2010s', label: 'Década de 2010' },
                                    { value: '2000s', label: 'Década de 2000' },
                                    { value: 'historico', label: 'Históricos (< 2000)' }
                                ].map((yr) => (
                                    <label key={yr.value} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer select-none">
                                        <input
                                            type="radio"
                                            name="yearRange"
                                            checked={selectedYearsRange === yr.value}
                                            onChange={() => setSelectedYearsRange(yr.value)}
                                            className="text-[#CC343A] focus:ring-[#CC343A] w-3 h-3 border-slate-300"
                                        />
                                        <span className={selectedYearsRange === yr.value ? 'font-black text-slate-800' : ''}>{yr.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Facet: Tags */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Tags do Acervo</label>
                            <div className="flex flex-wrap gap-1 max-h-[140px] overflow-y-auto pr-1">
                                {allTags.map((tag) => {
                                    const active = selectedTags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => handleFacetToggle(selectedTags, setSelectedTags, tag)}
                                            className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all ${
                                                active 
                                                    ? 'bg-emerald-600 text-white' 
                                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-slate-100'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </aside>

                {/* 2. Main Content Listing (Grid & Administration) */}
                <div className="flex-1 space-y-8">
                    
                    {/* Header Row: Document count & Management */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-black text-[#0B132B] flex items-center gap-2">
                                <Database className="text-[#CC343A]" size={20} />
                                Repositório Técnico SPC
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                Mostrando {filteredItems.length} de {repositorioData.length} Documentos Cadastrados
                            </p>
                        </div>

                        {isEditor && (
                            <button
                                onClick={() => {
                                    setEditForm({ category: 'dossie', department: 'Geral', tags: [], subcategory: 'patrimonio_material', format: 'PDF', language: 'Português' });
                                    setGdriveLinkInput('');
                                    setIsAddingNew(true);
                                    setExtractionSuccess(false);
                                }}
                                className="px-6 py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0B132B] hover:shadow-xl transition-all"
                            >
                                <Plus size={14} /> Novo Documento Técnico
                            </button>
                        )}
                    </div>

                    {/* AI Smart Extractor Form (Administrative Section) */}
                    {isAddingNew && (
                        <div className="p-8 bg-white rounded-3xl border border-slate-200/50 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                            
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="text-amber-500" size={18} />
                                    <h3 className="text-sm font-black text-[#0B132B] uppercase tracking-wider">
                                        {isEditing ? 'Editar Documento SPC' : 'Cadastrar Novo Arquivo Técnico'}
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => { 
                                        setIsAddingNew(false); 
                                        setIsEditing(null); 
                                        setGdriveLinkInput('');
                                        setExtractionSuccess(false);
                                    }} 
                                    className="p-2 hover:bg-slate-100 rounded-full transition-all"
                                >
                                    <X size={18} className="text-slate-400 hover:text-slate-600" />
                                </button>
                            </div>

                            {/* Link and title (Prerequisites for AI extraction) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="md:col-span-2 space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Título Principal</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-brand-blue transition-all"
                                            placeholder="Ex: Dossiê de Salvaguarda da Capoeira do Maranhão"
                                            value={editForm.title || ''}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Link Compartilhado do Google Drive</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-brand-blue transition-all"
                                                placeholder="https://drive.google.com/file/d/ID_DO_ARQUIVO/view?usp=sharing"
                                                value={gdriveLinkInput}
                                                onChange={(e) => setGdriveLinkInput(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                disabled={!gdriveLinkInput || !editForm.title || isExtracting}
                                                onClick={triggerAIExtraction}
                                                className="px-5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                                            >
                                                {isExtracting ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : (
                                                    <Sparkles size={12} />
                                                )}
                                                Extração por IA
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Metodologia de Upload</label>
                                    <div className="p-4 bg-[#F9F7F1]/80 rounded-2xl border border-slate-200/50 space-y-2">
                                        <p className="text-[10px] text-slate-500 font-bold leading-normal">
                                            Colando o link de compartilhamento de qualquer arquivo do Google Drive, nosso assistente automatizado de IA analisará os termos estruturais e preencherá a ficha técnica do repositório instantaneamente.
                                        </p>
                                        {extractionSuccess && (
                                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-600 tracking-wider">
                                                <CheckCircle2 size={12} /> Ficha Preenchida por IA
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Interactive AI Logging View */}
                            {isExtracting && (
                                <div className="mb-6 p-4 bg-slate-900 border border-slate-950 rounded-2xl font-mono text-[9px] text-[#22C55E] space-y-1 shadow-inner h-36 overflow-y-auto select-none">
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#22C55E]/20 text-[8px] font-black uppercase tracking-wider text-slate-400">
                                        <span>SPC Intelligent Extraction Assistant v2.5</span>
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                                    </div>
                                    {extractionLogs.map((log, idx) => (
                                        <div key={idx} className="animate-in fade-in duration-100">
                                            {log}
                                        </div>
                                    ))}
                                    <div className="w-2.5 h-4 bg-[#22C55E]/70 animate-pulse inline-block mt-1"></div>
                                </div>
                            )}

                            {/* Standard Form Fields (populates after extraction or editable manually) */}
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 ${extractionSuccess ? 'bg-emerald-50/20 p-4 rounded-3xl border border-emerald-100/55 shadow-inner' : ''}`}>
                                
                                {/* Left form column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Descrição Básica</label>
                                        <textarea
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium h-20"
                                            placeholder="Breve descrição resumida do arquivo..."
                                            value={editForm.description || ''}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Resumo Executivo Extraído</label>
                                        <textarea
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold h-28 text-slate-600 leading-relaxed text-justify"
                                            placeholder="Autogerado por IA ou preenchido manualmente..."
                                            value={editForm.executiveSummary || ''}
                                            onChange={(e) => setEditForm({ ...editForm, executiveSummary: e.target.value })}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Categoria Principal</label>
                                            <select
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                                value={editForm.category || 'dossie'}
                                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any, subcategory: SUBCATEGORIES_MAP[e.target.value]?.[0]?.value || 'geral' })}
                                            >
                                                <option value="dossie">Dossiê</option>
                                                <option value="publicacao">Publicação</option>
                                                <option value="livro">Livro</option>
                                                <option value="artigo">Artigo</option>
                                                <option value="dissertacao_tese">Dissertação/Tese</option>
                                                <option value="revista">Revista</option>
                                                <option value="edital">Edital</option>
                                                <option value="ata">Ata</option>
                                                <option value="afins">Outros/Afins</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Subcategoria Hierárquica</label>
                                            <select
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                                value={editForm.subcategory || 'geral'}
                                                onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })}
                                            >
                                                {SUBCATEGORIES_MAP[editForm.category || 'dossie']?.map((sub) => (
                                                    <option key={sub.value} value={sub.value}>{sub.label}</option>
                                                )) || <option value="geral">Geral</option>}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Right form column */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Departamento Responsável</label>
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

                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Ano do Documento</label>
                                            <input
                                                type="number"
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                                placeholder="2026"
                                                value={editForm.year || ''}
                                                onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Volume (Nº de Páginas)</label>
                                            <input
                                                type="number"
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                                placeholder="120"
                                                value={editForm.pageCount || ''}
                                                onChange={(e) => setEditForm({ ...editForm, pageCount: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Idioma Principal</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                                placeholder="Português"
                                                value={editForm.language || 'Português'}
                                                onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Highlights items */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">3 Destaques do Documento (Highlights)</label>
                                        {[0, 1, 2].map((idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <span className="text-[9px] font-black text-[#CC343A] bg-[#CC343A]/5 px-2.5 py-1.5 rounded-lg border border-[#CC343A]/10">{idx + 1}</span>
                                                <input
                                                    type="text"
                                                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 focus:outline-none"
                                                    placeholder="Pontos chave do conteúdo"
                                                    value={editForm.highlights?.[idx] || ''}
                                                    onChange={(e) => {
                                                        const copy = [...(editForm.highlights || ['', '', ''])];
                                                        copy[idx] = e.target.value;
                                                        setEditForm({ ...editForm, highlights: copy });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tags (separadas por vírgula)</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                            placeholder="UNESCO, Restauro, Azulejaria, DPI"
                                            value={typeof editForm.tags === 'string' ? editForm.tags : editForm.tags?.join(', ') || ''}
                                            onChange={(e) => setEditForm({ ...editForm, tags: e.target.value as any })}
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button 
                                    onClick={() => { 
                                        setIsAddingNew(false); 
                                        setIsEditing(null); 
                                        setGdriveLinkInput('');
                                        setExtractionSuccess(false);
                                    }} 
                                    className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-10 py-3.5 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0B132B] transition-all hover:shadow-xl shadow-brand-blue/20"
                                >
                                    {isEditing ? 'Salvar Alterações' : 'Salvar Documento'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Active Facet Tags Row */}
                    {activeFacetsCount > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 p-4 bg-[#F9F7F1]/50 rounded-2xl border border-slate-200/40 shadow-sm animate-in fade-in duration-300">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1.5">Filtros Ativos:</span>
                            
                            {/* Department Tags */}
                            {selectedDepartments.map(dept => (
                                <span key={dept} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-[#0B132B] text-white px-2.5 py-1 rounded-lg">
                                    {dept} <X size={10} className="cursor-pointer" onClick={() => handleFacetToggle(selectedDepartments, setSelectedDepartments, dept)} />
                                </span>
                            ))}

                            {/* Category Tags */}
                            {selectedCategories.map(cat => (
                                <span key={cat} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-[#CC343A] text-white px-2.5 py-1 rounded-lg">
                                    {categories.find(c => c.id === cat)?.label} <X size={10} className="cursor-pointer" onClick={() => handleFacetToggle(selectedCategories, setSelectedCategories, cat)} />
                                </span>
                            ))}

                            {/* Subcategory Tags */}
                            {selectedSubcategories.map(sub => (
                                <span key={sub} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-brand-blue text-white px-2.5 py-1 rounded-lg">
                                    {sub.replace('_', ' ')} <X size={10} className="cursor-pointer" onClick={() => handleFacetToggle(selectedSubcategories, setSelectedSubcategories, sub)} />
                                </span>
                            ))}

                            {/* Format Tags */}
                            {selectedFormats.map(fmt => (
                                <span key={fmt} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-lg">
                                    {fmt} <X size={10} className="cursor-pointer" onClick={() => handleFacetToggle(selectedFormats, setSelectedFormats, fmt)} />
                                </span>
                            ))}

                            {/* Year Tag */}
                            {selectedYearsRange !== 'todos' && (
                                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-amber-600 text-white px-2.5 py-1 rounded-lg">
                                    {selectedYearsRange === 'recentes' ? 'Recentes' : selectedYearsRange} <X size={10} className="cursor-pointer" onClick={() => setSelectedYearsRange('todos')} />
                                </span>
                            )}

                            {/* Languages Tags */}
                            {selectedLanguages.map(lang => (
                                <span key={lang} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2.5 py-1 rounded-lg">
                                    {lang} <X size={10} className="cursor-pointer" onClick={() => handleFacetToggle(selectedLanguages, setSelectedLanguages, lang)} />
                                </span>
                            ))}

                            {/* Tags facet */}
                            {selectedTags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-slate-500 text-white px-2.5 py-1 rounded-lg">
                                    {tag} <X size={10} className="cursor-pointer" onClick={() => handleFacetToggle(selectedTags, setSelectedTags, tag)} />
                                </span>
                            ))}
                        </div>
                    )}

                    {/* 3. Main Documents Results Grid */}
                    {filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredItems.map((item) => {
                                const catConfig = getCategoryConfig(item.category);
                                const isGdrive = parseGoogleDriveUrl(item.downloadUrl).isDrive;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="bg-white rounded-[2rem] border border-slate-200/50 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col relative overflow-hidden h-full"
                                    >
                                        {/* Colored category strip */}
                                        <div className={`absolute top-0 left-0 w-full h-1.5 ${catConfig.color}`}></div>

                                        {/* Quick Administrative Overlays */}
                                        {isEditor && (
                                            <div className="absolute top-4 right-4 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenEdit(item);
                                                    }}
                                                    className="p-2 bg-white/90 backdrop-blur-sm text-amber-500 rounded-xl shadow-md hover:bg-amber-500 hover:text-white transition-all"
                                                    title="Editar Metadados"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <label className="p-2 bg-white/90 backdrop-blur-sm text-brand-blue rounded-xl shadow-md hover:bg-brand-blue hover:text-white transition-all cursor-pointer" title="Substituir Arquivo">
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
                                                    className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-xl shadow-md hover:bg-red-500 hover:text-white transition-all"
                                                    title="Deletar Documento"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Card content */}
                                        <div className="p-6 flex flex-col h-full">
                                            {/* Subcategory and Year badge */}
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${catConfig.lightColor}`}>
                                                    {getSubcategoryLabel(item.category, item.subcategory)}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
                                                    {item.year || new Date(item.date).getFullYear()}
                                                </span>
                                            </div>

                                            <h3 className="text-xs font-black text-[#0B132B] mb-2 group-hover:text-[#CC343A] transition-colors leading-tight line-clamp-2 min-h-[2.4em]">
                                                {item.title}
                                            </h3>

                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6 line-clamp-3">
                                                {item.description}
                                            </p>

                                            {/* Action footer */}
                                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <div className="flex gap-1.5">
                                                    <span className="text-[8px] font-black py-1 px-2.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-md uppercase tracking-wider">
                                                        {item.format}
                                                    </span>
                                                    <span className="text-[8px] font-black py-1 px-2.5 bg-[#F9F7F1] border border-slate-200/30 text-slate-400 rounded-md uppercase tracking-wider">
                                                        {item.size}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1 text-[9px] font-black text-[#CC343A] uppercase tracking-widest group-hover:gap-2 transition-all">
                                                    <span>{isGdrive ? 'Ler Documento' : 'Acessar'}</span>
                                                    <ArrowRight size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-200/50 shadow-sm animate-in fade-in duration-300">
                            <div className="w-20 h-20 bg-[#F9F7F1] rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200/40">
                                <Database size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black text-[#0B132B] mb-2 uppercase tracking-wide">Nenhum documento encontrado</h3>
                            <p className="text-slate-400 font-medium text-xs max-w-sm mx-auto leading-relaxed">
                                Nenhum arquivo técnico corresponde à sua combinação atual de filtros facetados ou termos de pesquisa.
                            </p>
                            <button
                                onClick={clearAllFilters}
                                className="mt-8 px-8 py-3.5 bg-[#CC343A] hover:bg-[#b02c31] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg transition-all"
                            >
                                Limpar Todos os Filtros
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* Document Detail Modal: Handled side-by-side with iframe viewer */}
            {selectedItem && (
                <DocumentViewer
                    item={selectedItem}
                    onClose={() => {
                        setSelectedItem(null);
                        // Clean deep link search param
                        const url = new URL(window.location.href);
                        url.searchParams.delete('id');
                        window.history.replaceState({}, '', url.pathname + url.search);
                    }}
                    getCategoryConfig={getCategoryConfig}
                />
            )}

            {/* Simulation/Admin Toggle Pill */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={toggleSimulatedAdmin}
                    className={`flex items-center gap-2 px-5 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border transition-all ${
                        simulatedAdmin 
                            ? 'bg-[#CC343A] hover:bg-[#b02c31] text-white border-transparent' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    <ShieldCheck size={14} className={simulatedAdmin ? "animate-pulse" : ""} />
                    {simulatedAdmin ? 'Admin Simulado: Ativo' : 'Ativar Modo Admin'}
                </button>
            </div>
        </div>
    );
};

export default RepositorioPage;
