
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
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden flex flex-col h-full">
        <div className={`h-3 bg-gradient-to-r ${color}`}></div>
        <div className="p-10 flex flex-col flex-grow">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform ${color} text-white`}>
                <Icon size={32} />
            </div>
            <h3 className="text-3xl font-black text-brand-dark mb-4">{title}</h3>
            <p className="text-slate-500 leading-relaxed mb-10 flex-grow font-medium">
                {description}
            </p>

            <div className="space-y-4 mb-10">
                {items.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <div className={`w-1.5 h-1.5 rounded-full ${color.split(' ')[1]}`}></div>
                        {item}
                    </div>
                ))}
            </div>

            <Link
                to={link}
                className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-blue transition-all w-full justify-center group/btn"
            >
                Acessar Página <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
            </Link>
        </div>
    </div>
);

const AcervoDigitalPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Hero Section */}
            <section className="bg-[#2D2D2D] pt-16 pb-10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <img
                        src="/imagens/1912 - justo jansen - mapa.jpg"
                        alt="Acervo Histórico"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#2D2D2D]/60 via-[#2D2D2D]/90 to-[#2D2D2D]"></div>

                <div className="relative max-w-7xl mx-auto px-4 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#CC343A]/20 text-[#CC343A] border border-[#CC343A]/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                        Ecossistema Digital SPC
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
                        Digitalização e <span className="text-[#CC343A]">Conhecimento</span>
                    </h1>
                    <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
                        Acesso simplificado a arquivos históricos e normas do Maranhão.
                    </p>
                </div>
            </section>

            {/* Resource Grid */}
            <section className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
            <section className="max-w-7xl mx-auto px-4 mt-32">
                <div className="bg-brand-blue rounded-[4rem] p-12 md:p-24 relative overflow-hidden flex flex-col lg:flex-row items-center gap-16 shadow-2xl shadow-brand-blue/20">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    </div>

                    <div className="relative z-10 lg:w-1/2 space-y-8 text-white">
                        <h2 className="text-4xl md:text-5xl font-black leading-tight">Busca Unificada <br />de Documentos</h2>
                        <p className="text-blue-100 text-lg font-medium leading-relaxed">
                            Encontre rapidamente qualquer documento oficial através do nosso indexador dinâmico. Digite termos chave acima ou utilize os filtros.
                        </p>
                        <div className="flex gap-4">
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center flex-1">
                                <span className="block text-3xl font-black">+15k</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Arquivos</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center flex-1">
                                <span className="block text-3xl font-black">24/7</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Disponibilidade</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 lg:w-1/2 w-full">
                        <div className="bg-white rounded-[3rem] p-10 shadow-xl space-y-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-brand-dark uppercase tracking-widest">O que você procura?</label>
                                <div className="relative">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Ex: Lei 1.234, Bumba meu Boi..."
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-brand-blue transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <button className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-red transition-all flex items-center justify-center gap-3">
                                <ArrowRight size={20} /> Iniciar Pesquisa
                            </button>
                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-slate-400">
                                <span className="text-xs font-bold flex items-center gap-2"><ShieldCheck size={16} /> Dados Oficiais</span>
                                <span className="text-xs font-bold flex items-center gap-2"><Download size={16} /> Acesso Público</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AcervoDigitalPage;
