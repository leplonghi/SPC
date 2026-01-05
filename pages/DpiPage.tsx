
import React from 'react';
import {
    Sparkles,
    Info,
    MapPin,
    Mail,
    Phone,
    FileText,
    ArrowRight,
    CheckSquare,
    Music,
    Building
} from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Link } from 'react-router-dom';

const DpiPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <PageHero
                align="left"
                backgroundImage="/imagens/card_imaterial.jpg"
                badge={{
                    text: 'Departamento Técnico',
                    icon: Sparkles,
                    variant: 'red'
                }}
                title={<>DPI <br /><span className="text-brand-red">Patrimônio Imaterial</span></>}
                description="O Departamento de Patrimônio Imaterial é responsável pelo registro, salvaguarda e promoção das manifestações culturais, saberes, celebrações e formas de expressão que constituem a identidade do Maranhão."
                actions={
                    <>
                        <Link to="/servicos" className="px-5 py-2.5 bg-brand-red text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-red/90 hover:shadow-lg hover:shadow-brand-red/20 transition-all flex items-center gap-2 active:scale-95">
                            Solicitar Registro <ArrowRight size={12} />
                        </Link>
                        <a href="#contato" className="px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">
                            Fale Conosco
                        </a>
                    </>
                }
            />

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Content Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Atribuições */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
                                <CheckSquare size={16} className="text-brand-red" /> Atribuições
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: "Registro", desc: "Instrução de processos para reconhecimento de bens imateriais." },
                                    { title: "Salvaguarda", desc: "Apoio a planos de gestão e sustentabilidade das manifestações." },
                                    { title: "Pesquisa", desc: "Mapeamento e documentação de referências culturais." },
                                    { title: "Fomento", desc: "Auxílio técnico para acesso a editais e recursos." }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 hover:border-brand-red/30 hover:shadow-lg transition-all group">
                                        <div className="w-7 h-7 rounded-lg bg-brand-red/10 text-brand-red flex items-center justify-center mb-3 group-hover:bg-brand-red group-hover:text-white transition-colors">
                                            <Music size={14} />
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
                                <FileText size={16} className="text-brand-red" /> Acesso Rápido
                            </h2>
                            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                                <div className="p-1">
                                    {[
                                        "Solicitação de Registro de Bem Imaterial",
                                        "Apoio a Eventos Tradicionais",
                                        "Consulta ao Livro de Registro",
                                        "Emissão de Certificado de Detentor"
                                    ].map((service, idx) => (
                                        <Link
                                            key={idx}
                                            to="/servicos"
                                            className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer"
                                        >
                                            <span className="text-xs font-bold text-slate-700 group-hover:text-brand-red transition-colors pl-2">{service}</span>
                                            <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-red transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div id="contato" className="bg-brand-dark text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info size={14} className="text-brand-red" /> Contato
                            </h3>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin size={12} className="text-brand-red" />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Endereço</h4>
                                        <p className="text-[10px] font-medium leading-relaxed text-slate-200">
                                            Rua do Sol, 112 - Centro<br />
                                            São Luís - MA, 65020-590
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Mail size={12} className="text-brand-red" />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Email</h4>
                                        <a href="mailto:dpi@spc.ma.gov.br" className="text-[10px] font-medium text-white hover:text-brand-red transition-colors">
                                            dpi@spc.ma.gov.br
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Phone size={12} className="text-brand-red" />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Telefone</h4>
                                        <span className="text-[10px] font-medium text-slate-200">
                                            (98) 3218-5678
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

                        <div className="bg-brand-red/5 p-5 rounded-[2rem] border border-brand-red/10">
                            <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Building size={12} /> Diretoria
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center text-white font-black text-sm shadow-md shadow-brand-red/20">
                                    I
                                </div>
                                <div>
                                    <p className="font-black text-brand-dark text-xs">Profa. Benedita Soares</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Diretora do DPI</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DpiPage;
