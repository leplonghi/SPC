
import React from 'react';
import {
    Library,
    Gavel,
    Database,
    FileText,
    Search,
    ArrowRight,
    ShieldCheck,
    Download,
    ExternalLink,
    Info,
    Archive
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ResourceCard = ({ title, description, icon: Icon, color, link, items }: any) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col h-full">
        <div className={`h-1.5 bg-gradient-to-r ${color}`}></div>
        <div className="p-4 flex flex-col flex-grow">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 shadow-md transition-transform ${color} text-white`}>
                <Icon size={16} />
            </div>
            <h3 className="text-base font-black text-brand-dark mb-2">{title}</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed mb-3 flex-grow font-medium">
                {description}
            </p>

            <div className="space-y-1 mb-4">
                {items.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                        <div className={`w-1 h-1 rounded-full ${color.includes('blue') ? 'bg-brand-blue' : color.includes('red') ? 'bg-brand-red' : 'bg-slate-700'}`}></div>
                        {item}
                    </div>
                ))}
            </div>

            <Link
                to={link}
                className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-brand-blue transition-all w-full justify-center group/btn"
            >
                Acessar <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
        </div>
    </div>
);

const AcervoDigitalPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Hero Section */}
            <section className="bg-[#2D2D2D] pt-12 pb-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-80">
                    <img
                        src="/imagens/1912 - justo jansen - mapa.jpg"
                        alt="Acervo Histórico"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#2D2D2D]/60 via-[#2D2D2D]/90 to-[#2D2D2D]"></div>

                <div className="relative max-w-7xl mx-auto px-4 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#CC343A]/20 text-[#CC343A] border border-[#CC343A]/30 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                        Ecossistema Digital SPC
                    </div>
                    <h1 className="text-xl md:text-3xl font-black text-white leading-tight">
                        Digitalização e <span className="text-[#CC343A]">Conhecimento</span>
                    </h1>
                    <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
                        Acesso simplificado a arquivos históricos e normas do Maranhão.
                    </p>
                </div>
            </section>

            {/* Resource Grid */}
            <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ResourceCard
                        title="Acervo Digital"
                        description="Base de dados multimídia contendo fotografias históricas, mapas antigos e registros iconográficos do patrimônio cultural."
                        icon={Library}
                        color="from-brand-blue to-blue-600"
                        link="/acervo"
                        items={[
                            'Mapas Georreferenciados',
                            'Fotografias de Época',
                            'Modelagens 3D de Bens',
                            'Registros Sonoros'
                        ]}
                    />
                    <ResourceCard
                        title="Legislação"
                        description="Compilado atualizado de leis federais, estaduais e municipais que regem a proteção do patrimônio maranhense."
                        icon={Gavel}
                        color="from-brand-red to-orange-600"
                        link="/legislacao"
                        items={[
                            'Decretos Estaduais',
                            'Normativas Municipais',
                            'Leis de Tombamento',
                            'Instruções Normativas'
                        ]}
                    />
                    <ResourceCard
                        title="Repositório"
                        description="Biblioteca técnica com dossiês de tombamento, pareceres públicos, editais e publicações acadêmicas da SPC."
                        icon={Database}
                        color="from-brand-dark to-slate-700"
                        link="/repositorio"
                        items={[
                            'Dossiês Técnicos',
                            'Publicações da SPC',
                            'Editais de Fomento',
                            'Atas do Conselho'
                        ]}
                    />
                </div>
            </section>

            {/* Search & Help CTA */}
            <section className="max-w-7xl mx-auto px-6 mt-12">
                <div className="bg-brand-blue rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center gap-8 shadow-2xl shadow-brand-blue/20">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    </div>

                    <div className="relative z-10 lg:w-1/2 space-y-4 text-white">
                        <h2 className="text-xl md:text-2xl font-black leading-tight">Busca Unificada <br />de Documentos</h2>
                        <p className="text-blue-100 text-xs font-medium leading-relaxed">
                            Encontre rapidamente qualquer documento oficial através do nosso indexador dinâmico. Digite termos chave acima ou utilize os filtros.
                        </p>
                        <div className="flex gap-4">
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center flex-1">
                                <span className="block text-xl font-black">+15k</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-blue-200">Arquivos</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center flex-1">
                                <span className="block text-xl font-black">24/7</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-blue-200">Disponibilidade</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 lg:w-1/2 w-full">
                        <div className="bg-white rounded-[2rem] p-6 shadow-xl space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-brand-dark uppercase tracking-widest">O que você procura?</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Ex: Lei 1.234, Bumba meu Boi..."
                                        className="w-full pl-10 pr-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-brand-blue transition-all text-xs font-medium"
                                    />
                                </div>
                            </div>
                            <button className="w-full py-3 bg-black text-white rounded-xl font-black uppercase tracking-[0.2em] text-[9px] hover:bg-[#CC343A] transition-all flex items-center justify-center gap-2">
                                <ArrowRight size={16} /> Iniciar Pesquisa
                            </button>
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400">
                                <span className="text-[8px] font-bold flex items-center gap-1.5"><ShieldCheck size={12} /> Dados Oficiais</span>
                                <span className="text-[8px] font-bold flex items-center gap-1.5"><Download size={12} /> Acesso Público</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AcervoDigitalPage;
