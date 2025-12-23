
import React from 'react';
import {
    Hammer,
    Info,
    MapPin,
    Mail,
    Phone,
    FileText,
    ArrowRight,
    CheckSquare,
    Construction,
    Ruler,
    Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DpePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="bg-[#2D2D2D] pt-12 pb-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-60">
                    <img
                        src="/imagens/card_especiais.jpg"
                        alt="Projetos Especiais"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#2D2D2D] via-[#2D2D2D]/95 to-transparent"></div>

                <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-dark/20 text-white border border-white/30 rounded-full text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                            <Hammer size={10} /> Departamento Técnico
                        </div>
                        <h1 className="text-xl md:text-3xl font-black text-white leading-tight">
                            DPE <br />
                            <span className="text-slate-400">Projetos Especiais</span>
                        </h1>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium max-w-lg">
                            O Departamento de Projetos Especiais gerencia grandes intervenções urbanas, obras de restauro em equipamentos públicos e projetos estruturantes em áreas de interesse histórico e cultural.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link to="/servicos" className="px-5 py-2.5 bg-brand-dark text-white border border-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 active:scale-95 shadow-xl">
                                Ver Projetos <ArrowRight size={12} />
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
                                <CheckSquare size={16} className="text-brand-dark" /> Atribuições
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: "Gestão de Obras", desc: "Acompanhamento e fiscalização de obras de restauro contratadas pelo Estado." },
                                    { title: "Projetos Urbanos", desc: "Desenvolvimento de propostas de requalificação de espaços públicos." },
                                    { title: "Acessibilidade", desc: "Adaptação de prédios históricos para garantir acessibilidade universal." },
                                    { title: "Manutenção", desc: "Planejamento de rotinas de manutenção preventiva em equipamentos culturais." }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 hover:border-brand-dark/30 hover:shadow-lg transition-all group">
                                        <div className="w-7 h-7 rounded-lg bg-brand-dark/10 text-brand-dark flex items-center justify-center mb-3 group-hover:bg-brand-dark group-hover:text-white transition-colors">
                                            <Construction size={14} />
                                        </div>
                                        <h3 className="text-sm font-black text-brand-dark mb-1">{item.title}</h3>
                                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Projetos em Destaque (Placeholder for now) */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
                                <Ruler size={16} className="text-brand-dark" /> Projetos em Andamento
                            </h2>
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 text-center space-y-3">
                                <Construction size={32} className="text-slate-200 mx-auto" />
                                <p className="text-slate-500 font-bold text-xs">Em breve, mapa interativo de obras estaduais.</p>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div id="contato" className="bg-brand-dark text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info size={14} className="text-slate-300" /> Contato
                            </h3>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin size={12} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Endereço</h4>
                                        <p className="text-[10px] font-medium leading-relaxed text-slate-200">
                                            Rua do Giz, 445 (Anexo)<br />
                                            Centro Histórico<br />
                                            São Luís - MA, 65010-060
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Mail size={12} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Email</h4>
                                        <a href="mailto:dpe@spc.ma.gov.br" className="text-[10px] font-medium text-white hover:text-brand-blue transition-colors">
                                            dpe@spc.ma.gov.br
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Phone size={12} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Telefone</h4>
                                        <span className="text-[10px] font-medium text-slate-200">
                                            (98) 3218-9999
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10">
                                <p className="text-[9px] text-slate-400 font-medium">
                                    Atendimento: Seg a Sex, 8h às 18h
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-100 p-5 rounded-[2rem] border border-slate-200">
                            <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Building2 size={12} /> Diretoria
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center text-white font-black text-sm shadow-md shadow-brand-dark/20">
                                    C
                                </div>
                                <div>
                                    <p className="font-black text-brand-dark text-xs">Eng. Carlos Alberto</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Diretor do DPE</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DpePage;
