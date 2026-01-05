
import React, { useState, useMemo } from 'react';
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
    Share2
} from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { SearchFilterCard, FilterCategory } from '../components/ui/SearchFilterCard';

interface RepositorioItem {
    id: string;
    title: string;
    description: string;
    category: 'dossie' | 'publicacao' | 'edital' | 'ata';
    department: 'DPHAP' | 'DPI' | 'DPE' | 'Geral';
    date: string;
    format: 'PDF' | 'DOCX' | 'ZIP';
    size: string;
    tags: string[];
    downloadUrl: string;
}

const repositorioData: RepositorioItem[] = [
    {
        id: 'r1',
        title: 'Dossiê de Tombamento - Centro Histórico de São Luís',
        description: 'Documentação técnica detalhada que fundamentou o tombamento do Centro Histórico de São Luís como Patrimônio Mundial pela UNESCO.',
        category: 'dossie',
        department: 'DPHAP',
        date: '1997-12-04',
        format: 'PDF',
        size: '45.2 MB',
        tags: ['UNESCO', 'Tombamento', 'Histórico', 'São Luís'],
        downloadUrl: '#'
    },
    {
        id: 'r2',
        title: 'Inventário do Patrimônio Imaterial - Bumba Meu Boi',
        description: 'Relatório completo do inventário realizado para o registro do Complexo Cultural do Bumba Meu Boi como patrimônio cultural do Brasil.',
        category: 'dossie',
        department: 'DPI',
        date: '2011-08-30',
        format: 'PDF',
        size: '12.8 MB',
        tags: ['Bumba Meu Boi', 'Imaterial', 'Salvaguarda', 'Cultura Pop'],
        downloadUrl: '#'
    },
    {
        id: 'r3',
        title: 'Guia de Conservação de Fachadas Históricas',
        description: 'Manual técnico destinado a proprietários e arquitetos com as melhores práticas para conservação e restauro de fachadas em áreas tombadas.',
        category: 'publicacao',
        department: 'DPHAP',
        date: '2023-05-15',
        format: 'PDF',
        size: '8.4 MB',
        tags: ['Arquitetura', 'Conservação', 'Manual', 'Técnico'],
        downloadUrl: '#'
    },
    {
        id: 'r4',
        title: 'Edital 001/2024 - Fomento ao Patrimônio Imaterial',
        description: 'Edital de chamamento público para projetos de salvaguarda de manifestações culturais tradicionais do Maranhão.',
        category: 'edital',
        department: 'DPI',
        date: '2024-01-10',
        format: 'PDF',
        size: '1.2 MB',
        tags: ['Edital', 'Fomento', 'Projetos', '2024'],
        downloadUrl: '#'
    },
    {
        id: 'r5',
        title: 'Ata da 156ª Reunião Ordinária do Conselho de Cultura',
        description: 'Registro oficial da reunião que deliberou sobre novos processos de tombamento estadual e diretrizes de preservação.',
        category: 'ata',
        department: 'Geral',
        date: '2023-11-20',
        format: 'PDF',
        size: '0.5 MB',
        tags: ['Ata', 'Conselho', 'Decisões', 'Gestão'],
        downloadUrl: '#'
    },
    {
        id: 'r6',
        title: 'Relatório de Impacto Urbanístico - PAC Cidades Históricas',
        description: 'Documento técnico sobre as intervenções urbanas previstas no âmbito do PAC para o núcleo antigo de São Luís.',
        category: 'publicacao',
        department: 'DPE',
        date: '2022-03-12',
        format: 'PDF',
        size: '22.1 MB',
        tags: ['Urbanismo', 'PAC', 'Projetos Especiais', 'Impacto'],
        downloadUrl: '#'
    }
];

const RepositorioPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('todos');
    const [selectedItem, setSelectedItem] = useState<RepositorioItem | null>(null);

    const categories: FilterCategory[] = [
        { id: 'todos', label: 'Todos', icon: Database },
        { id: 'dossie', label: 'Dossiês', icon: ShieldCheck },
        { id: 'publicacao', label: 'Publicações', icon: FileText },
        { id: 'edital', label: 'Editais', icon: Info },
        { id: 'ata', label: 'Atas', icon: Archive },
    ];

    const filteredItems = useMemo(() => {
        return repositorioData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = activeCategory === 'todos' || item.category === activeCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory]);

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
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                            {filteredItems.length} Documentos Disponíveis
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {['todos', 'dossie', 'publicacao', 'edital', 'ata'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                                    ? 'bg-brand-dark text-white'
                                    : 'bg-white text-slate-400 hover:text-brand-dark hover:bg-slate-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col relative overflow-hidden h-full"
                            >
                                <div className={`absolute top-0 left-0 w-full h-1 ${item.category === 'dossie' ? 'bg-brand-blue' :
                                    item.category === 'edital' ? 'bg-brand-red' :
                                        item.category === 'ata' ? 'bg-orange-500' :
                                            'bg-slate-400'
                                    }`}></div>

                                <div className="p-5 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-2 rounded-lg ${item.category === 'dossie' ? 'bg-brand-blue/10 text-brand-blue' :
                                            item.category === 'edital' ? 'bg-brand-red/10 text-brand-red' :
                                                item.category === 'ata' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-slate-100 text-slate-600'
                                            } transition-colors group-hover:bg-brand-dark group-hover:text-white`}>
                                            {item.category === 'dossie' ? <ShieldCheck size={16} /> :
                                                item.category === 'edital' ? <Info size={16} /> :
                                                    item.category === 'publicacao' ? <FileText size={16} /> :
                                                        <Archive size={16} />}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(item.date).getFullYear()}</span>
                                    </div>

                                    <h3 className="text-sm font-black text-brand-dark mb-2 group-hover:text-brand-blue transition-colors leading-tight line-clamp-2">
                                        {item.title}
                                    </h3>

                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4 line-clamp-3">
                                        {item.description}
                                    </p>

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
                        <div className={`hidden md:flex md:w-1/3 items-center justify-center relative overflow-hidden ${selectedItem.category === 'dossie' ? 'bg-brand-blue/90' :
                            selectedItem.category === 'edital' ? 'bg-brand-red/90' :
                                selectedItem.category === 'ata' ? 'bg-orange-500/90' :
                                    'bg-brand-dark/90'
                            }`}>
                            <div className="absolute inset-0 opacity-10">
                                <img src="/imagens/mapa_sao_luiz.jpg" alt="pattern" className="w-full h-full object-cover" />
                            </div>
                            <div className="relative text-white flex flex-col items-center text-center p-8">
                                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 border border-white/30 shadow-2xl">
                                    {selectedItem.format.includes('PDF') ? <FileText size={48} /> :
                                        selectedItem.category === 'dossie' ? <ShieldCheck size={48} /> : <Archive size={48} />}
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
                                <span className={`inline-block text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl mb-4 ${selectedItem.category === 'dossie' ? 'bg-brand-blue/10 text-brand-blue' :
                                    selectedItem.category === 'edital' ? 'bg-brand-red/10 text-brand-red' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                    Categoria: {selectedItem.category}
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
                                    <button className="flex-[2] py-5 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-dark transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-brand-blue/20">
                                        <Download size={18} /> Baixar Arquivo em {selectedItem.format}
                                    </button>
                                    <button className="flex-1 py-5 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-3 border border-slate-100">
                                        <Share2 size={18} /> Compartilhar
                                    </button>
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
