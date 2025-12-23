
import React, { useState, useMemo } from 'react';
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
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

const acervoData: AcervoItem[] = [
    {
        id: '1',
        title: 'Anúncio Veritas - Rua Histórica',
        description: 'Fotografia colorizada de uma rua histórica com um grande anúncio do distribuidor Veritas. Observa-se a arquitetura colonial e o cotidiano urbano.',
        category: 'fotografia',
        tags: ['Histórico', 'Arquitetura', 'Publicidade', 'Rua'],
        imageUrl: '/imagens/veritas_ads.jpg',
        date: 'Século XX',
        location: 'Centro Histórico, São Luís'
    },
    {
        id: '2',
        title: 'Cotidiano e Bondes',
        description: 'Registro do centro comercial com trilhos de bonde e pessoas em trajes de época. Destaque para o edifício "Ferro de Engomar".',
        category: 'fotografia',
        tags: ['Histórico', 'Transporte', 'Pessoas', 'Rua'],
        imageUrl: '/imagens/rua_dos_bondes.jpg',
        date: 'c. 1920',
        location: 'Rua Grande(?), São Luís'
    },
    {
        id: '3',
        title: 'Avenida Pedro II - Vista Panorâmica',
        description: 'Vista ampla da Avenida Pedro II com destaque para a fonte luminosa e edifícios institucionais ao fundo. Carros de época estacionados.',
        category: 'fotografia',
        tags: ['Histórico', 'Praça', 'Urbanismo', 'Vista Aérea'],
        imageUrl: '/imagens/avenida_pedro_ii.jpg',
        date: 'c. 1950',
        location: 'Avenida Pedro II, São Luís'
    },
    {
        id: '4',
        title: 'Praça Pedro II - Atualidade',
        description: 'Vista contemporânea da Praça Pedro II a partir de um dos casarões históricos. Contraste entre a preservação e a vida urbana moderna.',
        category: 'fotografia',
        tags: ['Moderno', 'Praça', 'Arquitetura', 'Preservação'],
        imageUrl: '/imagens/vista_praca_pedro_ii.jpg',
        date: '2024',
        location: 'Praça Pedro II, São Luís'
    },
    {
        id: '5',
        title: 'Planta da Cidade de S. Luiz (Maranhão)',
        description: 'Mapa histórico detalhado da cidade de São Luís, mostrando o traçado urbano e pontos de interesse da época.',
        category: 'mapa',
        tags: ['Histórico', 'Cartografia', 'Urbanismo', 'Mapas'],
        imageUrl: '/imagens/mapa_sao_luiz.jpg',
        date: 'Século XIX',
        location: 'São Luís'
    },
    {
        id: '6',
        title: 'Mapa Justo Jansen - 1912',
        description: 'Cartografia original elaborada por Justo Jansen em 1912, fundamental para o estudo do crescimento urbano de São Luís.',
        category: 'mapa',
        tags: ['Histórico', 'Cartografia', 'Justo Jansen', '1912'],
        imageUrl: '/imagens/1912 - justo jansen - mapa.jpg',
        date: '1912',
        location: 'São Luís'
    },
    {
        id: '7',
        title: 'Pianta della Cittá di S. Luigi - 1698',
        description: 'Planta histórica italiana da cidade de São Luís datada de 1698, um dos registros cartográficos mais antigos do período colonial.',
        category: 'mapa',
        tags: ['Histórico', 'Colonial', 'Cartografia', 'Italiano'],
        imageUrl: '/imagens/Pianta della cittá di S. Luigi metropoli del Maragnone.jpg',
        date: '1698',
        location: 'São Luís'
    },
    {
        id: '8',
        title: 'Centro Histórico - Fachada Colonial I',
        description: 'Detalhe da arquitetura colonial no Centro Histórico de São Luís, evidenciando o uso de azulejos e elementos ornamentais.',
        category: 'fotografia',
        tags: ['Arquitetura', 'Azulejos', 'Patrimônio', 'Centro Histórico'],
        imageUrl: '/imagens/CH 01.jpg',
        location: 'Centro Histórico, São Luís'
    },
    {
        id: '9',
        title: 'Casarões da Praia Grande',
        description: 'Vista dos casarões históricos na região da Praia Grande, um dos núcleos mais importantes do patrimônio mundial pela UNESCO.',
        category: 'fotografia',
        tags: ['UNESCO', 'Patrimônio', 'Arquitetura', 'Praia Grande'],
        imageUrl: '/imagens/CH 03.jpg',
        location: 'Praia Grande, São Luís'
    },
    {
        id: '10',
        title: 'Ladeira do Centro Histórico',
        description: 'Perspectiva de uma das ladeiras pavimentadas com pedras de cantaria no Centro Histórico de São Luís.',
        category: 'fotografia',
        tags: ['Urbanismo', 'Cantaria', 'Rua', 'Centro Histórico'],
        imageUrl: '/imagens/CH 04.jpg',
        location: 'Centro Histórico, São Luís'
    },
    {
        id: '11',
        title: 'Casarão de Azulejos - Detalhe',
        description: 'Close em uma fachada revestida com azulejos portugueses, característica icônica da ilha de São Luís.',
        category: 'fotografia',
        tags: ['Azulejaria', 'Histórico', 'Arquitetura'],
        imageUrl: '/imagens/CH 05.jpg',
        location: 'São Luís'
    },
    {
        id: '12',
        title: 'Rua de Cantaria e Casarões',
        description: 'Registro de rua estreita no núcleo antigo, preservando a escala humana e a densidade construtiva colonial.',
        category: 'fotografia',
        tags: ['Centro Histórico', 'Rua', 'Patrimônio'],
        imageUrl: '/imagens/CH 06.jpg',
        location: 'São Luís'
    },
    {
        id: '13',
        title: 'Patrimônio em Perspectiva',
        description: 'Vista angular de quarteirão histórico demonstrando a harmonia volumétrica do conjunto tombado.',
        category: 'fotografia',
        tags: ['Urbanismo', 'Arquitetura', 'Conjunto Tombado'],
        imageUrl: '/imagens/CH 07.jpg',
        location: 'Centro Histórico, São Luís'
    }
];

const AcervoPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('todas');
    const [selectedItem, setSelectedItem] = useState<AcervoItem | null>(null);

    const categories = [
        { id: 'todas', label: 'Todos', icon: History },
        { id: 'fotografia', label: 'Fotografias', icon: Camera },
        { id: 'mapa', label: 'Mapas', icon: MapIcon },
        { id: 'documento', label: 'Documentos', icon: ImageIcon },
    ];

    const filteredItems = useMemo(() => {
        return acervoData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = activeCategory === 'todas' || item.category === activeCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        acervoData.forEach(item => item.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Section */}
            <div className="bg-[#2D2D2D] text-white pt-20 pb-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-80 pointer-events-none">
                    <img
                        src="/imagens/mapa_sao_luiz.jpg"
                        alt="Background Pattern"
                        className="w-full h-full object-cover grayscale"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#2D2D2D]/60 via-[#2D2D2D]/90 to-[#2D2D2D]"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center md:text-left md:flex md:items-end md:justify-between">
                    <div>
                        <Link to="/acervo-digital" className="inline-flex items-center gap-1.5 text-slate-400 font-bold mb-4 hover:text-white transition-colors text-[10px] uppercase tracking-widest">
                            <ArrowLeft size={12} /> Voltar para o Ecossistema
                        </Link>
                        <h1 className="text-2xl md:text-4xl font-black leading-tight">
                            Acervo <span className="text-[#CC343A]">Digital</span>
                        </h1>
                        <p className="text-xs text-slate-400 max-w-xl leading-relaxed mt-2 font-medium">
                            Coleção de registros históricos, fotografias e mapas que preservam a memória do Maranhão.
                        </p>
                    </div>
                </div>
            </div>

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
                </div>

                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all group flex flex-col h-full"
                            >
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
                                    <h3 className="text-sm font-black text-brand-dark mb-2 line-clamp-2 leading-tight min-h-[2.5em]">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-500 text-[10px] leading-relaxed mb-3 line-clamp-3 font-medium">
                                        {item.description}
                                    </p>

                                    <div className="flex flex-wrap gap-1 mb-4 mt-auto">
                                        {item.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            className="flex-grow py-2 bg-slate-900 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-brand-blue transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <Info size={12} /> Detalhes
                                        </button>
                                        <a
                                            href={item.imageUrl}
                                            download
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
