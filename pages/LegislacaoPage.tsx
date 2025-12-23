
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
      <section className="bg-brand-dark pt-32 pb-20 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
          <img
            src="/imagens/legislacao_hero.jpg"
            alt="Pianta della Città di S. Luigi"
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/40 to-brand-dark"></div>
        </div>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red opacity-5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-blue opacity-5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/20 text-brand-blue border border-brand-blue/30 rounded-full text-xs font-black uppercase tracking-[0.2em]">
            <Gavel size={16} /> Biblioteca Jurídica
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white leading-tight">
            Legislação e <span className="text-brand-red">Documentos</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Acesso público a todas as normativas, decretos de tombamento e manuais técnicos que regem o patrimônio maranhense.
          </p>

          <div className="max-w-2xl mx-auto relative group mt-10">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors" size={24} />
            <input
              type="text"
              placeholder="Buscar por título, palavra-chave ou ano..."
              className="w-full pl-16 pr-6 py-6 bg-white/5 border-2 border-white/10 rounded-[2rem] text-lg text-white font-medium focus:outline-none focus:ring-8 focus:ring-brand-red/5 focus:border-brand-red transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-20 flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0 space-y-10">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
              <Filter size={14} className="text-brand-red" /> Categorias
            </h3>
            <div className="flex flex-col gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeCategory === cat
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                    : 'bg-white text-slate-500 hover:bg-slate-100'
                    }`}
                >
                  {cat}
                  <ChevronRight size={14} className={activeCategory === cat ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-brand-red/5 rounded-[2rem] border border-brand-red/10 space-y-4">
            <h4 className="text-xs font-black text-brand-red uppercase tracking-widest">Dúvida Técnica?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Caso não encontre o documento desejado ou precise de interpretação normativa, entre em contato com nosso setor jurídico.
            </p>
            <button className="w-full py-3 bg-brand-red text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-red/90 transition-colors">
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
            <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100">
              <BookOpen className="mx-auto text-slate-200 mb-6" size={80} />
              <p className="text-xl font-bold text-slate-400">Nenhum documento encontrado.</p>
              <button onClick={() => { setSearchTerm(''); setActiveCategory('Todos') }} className="mt-4 text-brand-blue font-black uppercase tracking-widest text-xs">Limpar filtros</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-brand-blue/30 hover:shadow-xl transition-all group flex flex-col md:flex-row md:items-center gap-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${doc.category === 'Lei' ? 'bg-brand-red/10 text-brand-red' :
                    doc.category === 'Decreto' ? 'bg-brand-blue/10 text-brand-blue' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                    <FileText size={32} />
                  </div>

                  <div className="flex-grow space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${doc.category === 'Lei' ? 'bg-brand-red text-white' :
                        doc.category === 'Decreto' ? 'bg-brand-blue text-white' :
                          'bg-slate-900 text-white'
                        }`}>
                        {doc.category}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                        <Calendar size={12} /> {new Date(doc.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-brand-dark group-hover:text-brand-blue transition-colors">{doc.title}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">{doc.description}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {doc.tags.map(tag => (
                        <span key={tag} className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[140px]">
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-blue/90 transition-all active:scale-95">
                      Download <Download size={14} />
                    </button>
                    <span className="text-[9px] text-center font-bold text-slate-300 uppercase tracking-widest">Tamanho: {doc.size}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Featured Downloads Section */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-brand-dark tracking-tighter uppercase">Destaques e Formulários</h2>
              <div className="h-1.5 w-16 bg-brand-red rounded-full"></div>
              <p className="text-slate-500 max-w-lg">Documentos essenciais para solicitações rápidas e conhecimento de base.</p>
            </div>
            <button className="flex items-center gap-2 px-8 py-4 bg-[#2D2D2D] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all">
              Ver Todos <ExternalLink size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Plano de Salvaguarda DPI', color: 'bg-brand-red', icon: ShieldCheck },
              { title: 'Checklist para Reformas', color: 'bg-brand-blue', icon: FileText },
              { title: 'Guia de Tombamento Federal', color: 'bg-brand-dark', icon: BookOpen }
            ].map((item, i) => (
              <div key={i} className="group relative overflow-hidden bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 hover:shadow-2xl transition-all">
                <div className={`absolute top-0 right-0 w-32 h-32 ${item.color} opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full`}></div>
                <item.icon size={48} className={`${item.color.replace('bg-', 'text-')} mb-6 opacity-40 group-hover:opacity-100 transition-opacity`} />
                <h4 className="text-xl font-black text-brand-dark mb-4">{item.title}</h4>
                <button className="flex items-center gap-2 text-[10px] font-black text-brand-blue uppercase tracking-widest group-hover:gap-4 transition-all">
                  Download PDF <Download size={14} />
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
