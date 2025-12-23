
import React from 'react';
import {
    History,
    Info,
    MapPin,
    Mail,
    Phone,
    FileText,
    ArrowRight,
    ShieldCheck,
    CheckSquare,
    Building2,
    Database,
    Download,
    Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DphapPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="bg-[#2D2D2D] pt-12 pb-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-60">
                    <img
                        src="/imagens/card_material.jpg"
                        alt="Patrimônio Material"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#2D2D2D] via-[#2D2D2D]/95 to-transparent"></div>

                <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-blue/20 text-brand-blue border border-brand-blue/30 rounded-full text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                            <History size={10} /> Departamento Técnico
                        </div>
                        <h1 className="text-xl md:text-3xl font-black text-white leading-tight">
                            DPHAP <br />
                            <span className="text-brand-blue">Patrimônio Material</span>
                        </h1>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium max-w-lg">
                            O Departamento de Patrimônio Histórico, Artístico e Paisagístico é responsável pela preservação física dos bens culturais do Maranhão, atuando na fiscalização, análise técnica e conservação de imóveis e sítios históricos.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link to="/servicos" className="px-5 py-2.5 bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-blue/90 hover:shadow-lg hover:shadow-brand-blue/20 transition-all flex items-center gap-2 active:scale-95">
                                Solicitar Serviços <ArrowRight size={12} />
                            </Link>
                            <a href="#contato" className="px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">
                                Fale Conosco
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Content Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Atribuições */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
                                <CheckSquare size={16} className="text-brand-blue" /> Atribuições
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: "Análise de Projetos", desc: "Avaliação técnica de intervenções em imóveis tombados e áreas de entorno." },
                                    { title: "Fiscalização", desc: "Monitoramento do estado de conservação e verificação de denúncias." },
                                    { title: "Poligonais", desc: "Definição e revisão de limites de áreas protegidas e zonas de amortecimento." },
                                    { title: "Normatização", desc: "Elaboração de diretrizes para ocupação e uso do solo em áreas históricas." }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 hover:border-brand-blue/30 hover:shadow-lg transition-all group">
                                        <div className="w-7 h-7 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center mb-3 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                            <ShieldCheck size={14} />
                                        </div>
                                        <h3 className="text-sm font-black text-brand-dark mb-1">{item.title}</h3>
                                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Serviços Mais Procurados */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
                                <FileText size={16} className="text-brand-blue" /> Acesso Rápido
                            </h2>
                            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                                <div className="p-1">
                                    {[
                                        "Autorização para Intervenção em Bem Tombado",
                                        "Certidão de Limites de Poligonal",
                                        "Denúncia de Danos ao Patrimônio",
                                        "Consulta Prévia de Viabilidade"
                                    ].map((service, idx) => (
                                        <Link
                                            key={idx}
                                            to="/servicos"
                                            className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer"
                                        >
                                            <span className="text-xs font-bold text-slate-700 group-hover:text-brand-blue transition-colors pl-2">{service}</span>
                                            <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-blue transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Documentos Técnicos */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
                                <Database size={16} className="text-brand-blue" /> Normativas e Publicações
                            </h2>

                            {/* Infográfico Destaque */}
                            <a
                                href="/imagens/infografico_engenhos.jpg"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block group relative overflow-hidden bg-brand-blue rounded-[2rem] p-6 shadow-xl shadow-brand-blue/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors"></div>
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/20 text-white rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md">
                                            <Sparkles size={10} /> Em Destaque
                                        </div>
                                        <h3 className="text-xl font-black text-white leading-tight">
                                            Infográfico: Diretrizes de Intervenção <br />
                                            <span className="text-white/80 font-bold">Engenhos Publicitários no Centro Histórico</span>
                                        </h3>
                                        <p className="text-[10px] text-white/70 font-medium max-w-md">
                                            Guia visual completo sobre regras gerais, modelos permitidos e medidas para instalação de publicidade em áreas tombadas.
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 flex items-center gap-4">
                                        <div className="text-right hidden md:block">
                                            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Formato</p>
                                            <p className="text-xs font-black text-white uppercase">Infográfico HD</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white text-brand-blue rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                            <Download size={24} />
                                        </div>
                                    </div>
                                </div>
                            </a>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    {
                                        title: 'Dossiê de Tombamento - Centro Histórico',
                                        type: 'Dossiê',
                                        date: '1997',
                                        size: '45.2 MB',
                                        link: '#'
                                    },
                                    {
                                        title: 'Guia de Conservação de Fachadas',
                                        type: 'Publicação',
                                        date: '2023',
                                        size: '8.4 MB',
                                        link: '#'
                                    }
                                ].map((doc, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 hover:border-brand-blue/30 hover:shadow-lg transition-all group flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <span className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                {doc.type}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400">{doc.date}</span>
                                        </div>
                                        <h3 className="text-sm font-black text-brand-dark mb-1 leading-tight">{doc.title}</h3>
                                        <div className="mt-auto pt-4 flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-slate-400">{doc.size}</span>
                                            <a href={doc.link} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-brand-blue hover:text-white transition-all">
                                                <Download size={14} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center">
                                <Link to="/repositorio" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-blue hover:underline">
                                    Ver todas as publicações do DPHAP <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div id="contato" className="bg-brand-dark text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info size={14} className="text-brand-blue" /> Contato
                            </h3>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin size={12} className="text-brand-blue" />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Endereço</h4>
                                        <p className="text-[10px] font-medium leading-relaxed text-slate-200">
                                            Rua do Giz, 445 - Centro Histórico<br />
                                            São Luís - MA, 65010-060
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Mail size={12} className="text-brand-blue" />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Email</h4>
                                        <a href="mailto:dphap@spc.ma.gov.br" className="text-[10px] font-medium text-white hover:text-brand-blue transition-colors">
                                            dphap@spc.ma.gov.br
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Phone size={12} className="text-brand-blue" />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Telefone</h4>
                                        <span className="text-[10px] font-medium text-slate-200">
                                            (98) 3218-1234
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10">
                                <p className="text-[9px] text-slate-400 font-medium">
                                    Atendimento: Seg a Sex, 13h às 19h
                                </p>
                            </div>
                        </div>

                        <div className="bg-brand-blue/5 p-5 rounded-[2rem] border border-brand-blue/10">
                            <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Building2 size={12} /> Diretoria
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white font-black text-sm shadow-md shadow-brand-blue/20">
                                    M
                                </div>
                                <div>
                                    <p className="font-black text-brand-dark text-xs">Arq. Mariana Rocha</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Diretora do DPHAP</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DphapPage;
