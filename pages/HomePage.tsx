
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Map as MapIcon,
  History,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { Department } from '../types';

const DeptCard = ({ title, description, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col h-full">
    <div className={`w-16 h-16 rounded-2xl ${colorClass} flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-lg`}>
      <Icon size={32} />
    </div>
    <h3 className="text-2xl font-black text-brand-dark mb-4">{title}</h3>
    <p className="text-slate-600 leading-relaxed mb-8 flex-grow">{description}</p>
    <Link to={`/institucional`} className="inline-flex items-center text-sm font-black text-brand-blue uppercase tracking-widest hover:gap-3 transition-all">
      Explorar <ArrowRight size={18} />
    </Link>
  </div>
);

const HomePage: React.FC = () => {
  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[700px] flex items-center overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 opacity-40">
          <img
            src="/imagens/hero_bg.jpg"
            alt="Centro Histórico de São Luís"
            className="w-full h-full object-cover scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red/10 text-brand-red border border-brand-red/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              <ShieldCheck size={12} /> Patrimônio Cultural do Maranhão
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tight">
              Preservando a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-orange-400 to-yellow-500">Memória</span> <br />
              Maranhense.
            </h1>
            <p className="text-lg text-slate-300 max-w-lg leading-relaxed font-medium">
              Explore o Mapa do Patrimônio, consulte serviços e conheça as ações da SPC para garantir o futuro da nossa história.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link
                to="/mapa"
                className="px-10 py-5 bg-brand-blue text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-blue/90 hover:shadow-2xl hover:shadow-brand-blue/30 transition-all active:scale-95 shadow-lg"
              >
                <MapIcon size={18} /> Explorar o Mapa
              </Link>
              <Link
                to="/servicos"
                className="px-10 py-5 bg-white/5 text-white border border-white/10 backdrop-blur-md rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
              >
                Serviços Online
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center relative">
            <div className="absolute w-[600px] h-[600px] bg-brand-blue blur-[150px] opacity-10 animate-pulse"></div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-white/5 rounded-[2.5rem] blur-xl opacity-20 transition duration-1000"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-sm p-4 rounded-[2.2rem] border border-white/10 shadow-2xl overflow-hidden group-hover:scale-[1.02] transition-all duration-500">
                <div className="relative">
                  <img
                    src="/imagens/hero_bg.jpg"
                    className="rounded-[1.5rem] w-[500px] h-[380px] object-cover opacity-90"
                    alt="Arquitetura Maranhense"
                  />
                  {/* Card Bottom Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-slate-900/90 to-transparent flex justify-between items-end">
                    <div>
                      <h4 className="text-white font-bold text-sm">Casarões Coloniais, São Luís</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Patrimônio da Humanidade</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Quick Grid */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Bens Tombados', value: '2.451', color: 'text-brand-red' },
            { label: 'Cidades Protegidas', value: '42', color: 'text-brand-blue' },
            { label: 'Patrimônio Imaterial', value: '38', color: 'text-white bg-brand-dark p-8 rounded-[2rem]' },
            { label: 'Obras Ativas', value: '15', color: 'text-slate-900' }
          ].map((stat, i) => (
            <div key={i} className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl text-center ${stat.color.includes('bg-') ? stat.color : ''}`}>
              <span className={`block text-4xl font-black mb-1 ${!stat.color.includes('bg-') ? stat.color : ''}`}>{stat.value}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Departments Section */}
      <section className="max-w-7xl mx-auto px-4 py-32 space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-brand-dark tracking-tight">Atuação Setorial</h2>
          <div className="h-1.5 w-24 bg-brand-red mx-auto rounded-full"></div>
          <p className="text-lg text-slate-500 leading-relaxed">Nossa estrutura é organizada para garantir a excelência técnica na gestão de cada pilar da cultura maranhense.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <DeptCard
            title="DPHAP"
            description="Departamento focado no patrimônio material, conservação de imóveis históricos e conjuntos urbanos."
            icon={History}
            colorClass="bg-brand-blue"
          />
          <DeptCard
            title="DPI"
            description="Salvaguarda das manifestações imateriais, saberes, festejos e a alma do povo do Maranhão."
            icon={Sparkles}
            colorClass="bg-brand-red"
          />
          <DeptCard
            title="DPE"
            description="Gestão de projetos estratégicos de revitalização urbana e obras de grande impacto."
            icon={ArrowRight}
            colorClass="bg-brand-dark"
          />
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-brand-blue rounded-[3.5rem] p-12 md:p-24 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
            <div className="space-y-6 text-white text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-black leading-tight">Viu algo irregular?</h2>
              <p className="text-blue-100 text-lg max-w-md">Ajude a SPC a proteger nosso patrimônio. Denuncie danos ou obras irregulares em áreas históricas.</p>
              <Link to="/denuncia" className="inline-flex items-center gap-3 px-10 py-5 bg-brand-red text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-red/90 hover:shadow-2xl shadow-lg transition-all">
                <AlertTriangle size={20} /> Fazer Denúncia
              </Link>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white text-brand-blue rounded-xl flex items-center justify-center font-black">01</div>
                    <p className="text-sm font-bold text-white uppercase tracking-wider">Identifique o Local</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white text-brand-blue rounded-xl flex items-center justify-center font-black">02</div>
                    <p className="text-sm font-bold text-white uppercase tracking-wider">Envie Fotos</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white text-brand-blue rounded-xl flex items-center justify-center font-black">03</div>
                    <p className="text-sm font-bold text-white uppercase tracking-wider">Acompanhe o Status</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;