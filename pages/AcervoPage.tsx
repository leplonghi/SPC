
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
            <div className="bg-brand-dark text-white pt-32 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <img
                        src="/imagens/mapa_sao_luiz.jpg"
                        alt="Background Pattern"
                        className="w-full h-full object-cover grayscale"
                    />
                </div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <Link to="/acervo-digital" className="inline-flex items-center gap-2 text-blue-400 font-bold mb-8 hover:text-white transition-colors">
                        <ArrowLeft size={18} /> Voltar para o Ecossistema Digital
                    </Link>
                    <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                        Acervo <span className="text-brand-red">Digital</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
                        Explore nossa coleção de registros históricos, fotografias raras e mapas cartográficos que preservam a memória do Maranhão.
                    </p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="max-w-7xl mx-auto px-6 -mt-10 mb-16 relative z-20">
                <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-100">
                    <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                        {/* Search Bar */}
                        <div className="w-full lg:max-w-md relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                            <input
                                type="text"
                                placeholder="Pesquisar no acervo..."
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:outline-none focus:border-brand-blue transition-all font-bold text-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-4 justify-center">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all text-sm uppercase tracking-widest ${activeCategory === cat.id
                                        ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/30 -translate-y-1'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                        }`}
                                >
                                    <cat.icon size={20} />
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Popular Tags */}
                    <div className="mt-10 pt-8 border-t border-slate-50">
                        <div className="flex items-center gap-4 flex-wrap">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Filter size={14} /> Filtre por Tags:
                            </span>
                            {allTags.slice(0, 10).map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSearchTerm(tag)}
                                    className="px-4 py-2 bg-slate-50 text-slate-600 rounded-full text-xs font-bold hover:bg-brand-blue hover:text-white transition-all border border-slate-100"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-32">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl font-black text-brand-dark flex items-center gap-4">
                        <ImageIcon className="text-brand-blue" />
                        Mostrando {filteredItems.length} itens encontrados
                    </h2>
                </div>

                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full"
                            >
                                <div className="h-72 overflow-hidden relative cursor-pointer" onClick={() => setSelectedItem(item)}>
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-dark scale-50 group-hover:scale-100 transition-transform">
                                            <Maximize2 size={24} />
                                        </div>
                                    </div>
                                    <div className="absolute top-6 left-6">
                                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${item.category === 'mapa' ? 'bg-brand-red text-white' : 'bg-brand-blue text-white'
                                            }`}>
                                            {item.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-grow">
                                    <h3 className="text-xl font-black text-brand-dark mb-4 line-clamp-2 leading-tight min-h-[3rem]">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {item.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                                        {item.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedItem(item)}
                                            className="flex-grow py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-brand-blue transition-all flex items-center justify-center gap-2"
                                        >
                                            <Info size={16} /> Ver Detalhes
                                        </button>
                                        <a
                                            href={item.imageUrl}
                                            download
                                            className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-brand-red hover:text-white transition-all"
                                            title="Baixar em Alta Resolução"
                                        >
                                            <Download size={18} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                        <Search size={64} className="mx-auto text-slate-200 mb-6" />
                        <h3 className="text-2xl font-black text-brand-dark mb-2">Nenhum resultado encontrado</h3>
                        <p className="text-slate-400">Tente ajustar seus filtros ou termos de pesquisa.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('todas'); }}
                            className="mt-8 text-brand-blue font-bold hover:underline"
                        >
                            Limpar todos os filtros
                        </button>
                    </div>
                )}
            </div>

            {/* Item Modal (Lightbox) */}
            {selectedItem && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl" onClick={() => setSelectedItem(null)}></div>
                    <button
                        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-30 p-2"
                        onClick={() => setSelectedItem(null)}
                    >
                        <X size={40} />
                    </button>

                    <div className="relative z-10 bg-white w-full max-w-6xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
                        {/* Image Preview */}
                        <div className="w-full md:w-2/3 bg-slate-100 flex items-center justify-center overflow-hidden">
                            <img
                                src={selectedItem.imageUrl}
                                alt={selectedItem.title}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Details Panel */}
                        <div className="w-full md:w-1/3 p-10 md:p-12 overflow-y-auto flex flex-col">
                            <div className="mb-8">
                                <span className="text-brand-blue text-xs font-black uppercase tracking-widest mb-4 block">
                                    {selectedItem.category}
                                </span>
                                <h2 className="text-3xl font-black text-brand-dark leading-tight mb-6">
                                    {selectedItem.title}
                                </h2>
                                <div className="space-y-4 text-sm font-medium text-slate-500 border-l-4 border-brand-red pl-6 py-2 bg-slate-50 rounded-r-2xl mb-8">
                                    {selectedItem.date && <p><strong>Data:</strong> {selectedItem.date}</p>}
                                    {selectedItem.location && <p><strong>Local:</strong> {selectedItem.location}</p>}
                                </div>
                            </div>

                            <div className="prose prose-slate mb-10">
                                <h4 className="text-brand-dark font-black text-sm uppercase tracking-widest mb-3">Descrição</h4>
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    {selectedItem.description}
                                </p>
                            </div>

                            <div className="mb-10">
                                <h4 className="text-brand-dark font-black text-sm uppercase tracking-widest mb-4">Tags do Arquivo</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedItem.tags.map(tag => (
                                        <span key={tag} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto space-y-4 pt-8 border-t border-slate-100">
                                <a
                                    href={selectedItem.imageUrl}
                                    download
                                    className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-dark transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-blue/20"
                                >
                                    <Download size={20} /> Baixar Original
                                </a>
                                <div className="flex gap-4">
                                    <button className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                                        <Share2 size={18} /> Compartilhar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcervoPage;
