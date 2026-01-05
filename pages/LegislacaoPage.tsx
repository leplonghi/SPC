
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

interface Document {
  id: string;
  title: string;
  category: 'Lei' | 'Decreto' | 'Portaria' | 'Manual' | 'Edital' | 'Outro';
  date: string;
  size: string;
  description: string;
  tags: string[];
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
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  const filteredDocs = DOCUMENTS.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Todos', 'Lei', 'Decreto', 'Portaria', 'Manual', 'Edital'];

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

          {filteredDocs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-lg font-bold text-slate-400">Nenhum documento encontrado.</p>
              <button onClick={() => { setSearchTerm(''); setActiveCategory('Todos') }} className="mt-4 text-brand-blue font-black uppercase tracking-widest text-[10px]">Limpar filtros</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-100 hover:border-brand-blue/30 hover:shadow-lg transition-all group flex flex-col md:flex-row md:items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.category === 'Lei' ? 'bg-brand-red/10 text-brand-red' :
                    doc.category === 'Decreto' ? 'bg-brand-blue/10 text-brand-blue' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                    <FileText size={24} />
                  </div>

                  <div className="flex-grow space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${doc.category === 'Lei' ? 'bg-[#CC343A] text-white' :
                        doc.category === 'Decreto' ? 'bg-brand-blue text-white' :
                          'bg-slate-900 text-white'
                        }`}>
                        {doc.category}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                        <Calendar size={10} /> {new Date(doc.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-brand-dark group-hover:text-brand-blue transition-colors leading-tight">{doc.title}</h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-2xl">{doc.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {doc.tags.map(tag => (
                        <span key={tag} className="text-[8px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <a
                      href={doc.id === 'infog-1' ? '/imagens/infografico_engenhos.jpg' : '#'}
                      target={doc.id === 'infog-1' ? '_blank' : undefined}
                      rel={doc.id === 'infog-1' ? 'noopener noreferrer' : undefined}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg font-black uppercase tracking-widest text-[9px] transition-all active:scale-95 ${doc.id === 'infog-1' ? 'bg-brand-red animate-pulse shadow-lg shadow-brand-red/20' : 'bg-brand-blue hover:bg-brand-blue/90'}`}
                    >
                      {doc.id === 'infog-1' ? 'Ver Infográfico' : 'Download'} <Download size={12} />
                    </a>
                    <span className="text-[8px] text-center font-bold text-slate-300 uppercase tracking-widest">Tamanho: {doc.size}</span>
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
