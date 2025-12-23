
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
                badge="Biblioteca Técnica SPC"
                breadcrumb={{ label: 'Voltar para o Ecossistema Digital', to: '/acervo-digital' }}
            />

            <SearchFilterCard
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Buscar documentos, leis, atas..."
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                tags={allTags}
                onTagClick={setSearchTerm}
            />

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-brand-dark flex items-center gap-3">
                        <Archive className="text-brand-red" size={20} />
                        Documentos Listados ({filteredItems.length})
                    </h2>
                </div>

                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col relative overflow-hidden"
                            >
                                <div className={`absolute top-0 left-0 w-2 h-full ${item.category === 'dossie' ? 'bg-brand-blue' :
                                    item.category === 'edital' ? 'bg-brand-red' :
                                        'bg-slate-800'
                                    }`}></div>

                                <div className="flex items-start justify-between mb-4 pl-3">
                                    <div className="flex gap-2">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${item.department === 'DPHAP' ? 'bg-brand-blue/10 text-brand-blue' :
                                            item.department === 'DPI' ? 'bg-brand-red/10 text-brand-red' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {item.department}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 flex items-center gap-2">
                                            {item.format}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock size={12} /> {new Date(item.date).getFullYear()}
                                    </span>
                                </div>

                                {/* Icon Display for Card */}
                                <div className="mb-3 pl-3 text-brand-dark opacity-5 group-hover:opacity-100 group-hover:text-brand-blue transition-all duration-500 absolute top-6 right-6 scale-50 group-hover:scale-100 origin-top-right">
                                    {item.category === 'dossie' ? <ShieldCheck size={40} /> :
                                        item.category === 'edital' ? <Info size={40} /> :
                                            item.category === 'publicacao' ? <FileText size={40} /> :
                                                <Archive size={40} />}
                                </div>

                                <h3 className="text-base font-black text-brand-dark mb-2 pl-3 group-hover:text-brand-blue transition-colors leading-tight relative z-10">
                                    {item.title}
                                </h3>

                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-3 pl-3 line-clamp-2 relative z-10">
                                    {item.description}
                                </p>

                                <div className="mt-auto pl-3 flex items-center justify-between border-t border-slate-50 pt-4 relative z-10">
                                    <div className="flex gap-2">
                                        {item.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[9px] font-bold text-slate-400">#{tag}</span>
                                        ))}
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-brand-dark group-hover:bg-brand-blue group-hover:text-white transition-all shadow-md">
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                        <Database size={64} className="mx-auto text-slate-200 mb-6" />
                        <h3 className="text-2xl font-black text-brand-dark mb-2">Nenhum documento encontrado</h3>
                        <p className="text-slate-400 font-medium">Tente ajustar seus filtros ou termos de pesquisa.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('todos'); }}
                            className="mt-6 text-brand-blue font-black uppercase tracking-widest text-xs hover:underline"
                        >
                            Limpar filtros
                        </button>
                    </div>
                )}
            </div>

            {/* Document Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-xl" onClick={() => setSelectedItem(null)}></div>
                    <div className="bg-white relative z-20 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100 transition-colors z-50"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-6 md:p-8 w-full">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${selectedItem.category === 'dossie' ? 'bg-brand-blue/10 text-brand-blue' :
                                    selectedItem.category === 'edital' ? 'bg-brand-red/10 text-brand-red' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                    {selectedItem.category}
                                </span>
                                <span className="w-1 h-3 bg-slate-200 rounded-full"></span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {selectedItem.size} • {selectedItem.format}
                                </span>
                            </div>

                            <h2 className="text-xl font-black text-brand-dark mb-3 leading-tight">
                                {selectedItem.title}
                            </h2>

                            <div className="prose prose-slate prose-sm mb-8">
                                <p className="text-slate-600 leading-relaxed font-medium text-base">
                                    {selectedItem.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-8">
                                {selectedItem.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold border border-slate-100">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100">
                                <button className="flex-1 py-4 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-dark transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-blue/20">
                                    <Download size={18} /> Baixar Arquivo
                                </button>
                                <button className="px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepositorioPage;
