
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
    <h3 className="text-2xl font-black text-[#2D2D2D] mb-4">{title}</h3>
    <p className="text-slate-600 leading-relaxed mb-8 flex-grow">{description}</p>
    <Link to={`/institucional`} className="inline-flex items-center text-sm font-black text-[#5283A9] uppercase tracking-widest hover:gap-3 transition-all">
      Explorar <ArrowRight size={18} />
    </Link>
  </div>
);

const HomePage: React.FC = () => {
  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[700px] flex items-center overflow-hidden bg-[#2D2D2D]">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1590483736622-39da8af7541c?auto=format&fit=crop&q=80&w=2000" 
            alt="Centro Histórico de São Luís" 
            className="w-full h-full object-cover scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#2D2D2D] via-[#2D2D2D]/80 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#CC343A]/20 text-[#CC343A] border border-[#CC343A]/30 rounded-full text-xs font-black uppercase tracking-[0.2em]">
              <ShieldCheck size={14} /> Guardiões da Cultura
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] tracking-tight">
              Legado <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CC343A] to-[#5283A9]">Vivo</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-lg leading-relaxed font-medium">
              Conheça as ações da SPC Maranhão na preservação do patrimônio material e imaterial que define nossa alma.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link 
                to="/mapa" 
                className="px-10 py-5 bg-[#CC343A] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#b02c32] hover:shadow-2xl hover:shadow-[#CC343A]/30 transition-all active:scale-95"
              >
                <MapIcon size={20} /> Mapa do Patrimônio
              </Link>
              <Link 
                to="/servicos" 
                className="px-10 py-5 bg-white/10 text-white border-2 border-white/20 backdrop-blur-md rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/20 transition-all"
              >
                Serviços Online
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center justify-center relative">
             <div className="absolute w-[500px] h-[500px] bg-[#5283A9] blur-[120px] opacity-20 animate-pulse"></div>
             <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#CC343A] to-[#5283A9] rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-[#2D2D2D] p-5 rounded-[2.8rem] shadow-2xl transition-all duration-700 hover:rotate-2">
                   <img 
                      src="https://images.unsplash.com/photo-1629235483813-906d20364d08?auto=format&fit=crop&q=80&w=800" 
                      className="rounded-[2rem] w-[450px] h-[350px] object-cover"
                      alt="Arquitetura Maranhense"
                   />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Quick Grid */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Bens Tombados', value: '2.451', color: 'text-[#CC343A]' },
            { label: 'Cidades Protegidas', value: '42', color: 'text-[#5283A9]' },
            { label: 'Patrimônio Imaterial', value: '38', color: 'text-white bg-[#2D2D2D] p-8 rounded-[2rem]' },
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
          <h2 className="text-4xl md:text-5xl font-black text-[#2D2D2D] tracking-tight">Atuação Setorial</h2>
          <div className="h-1.5 w-24 bg-[#CC343A] mx-auto rounded-full"></div>
          <p className="text-lg text-slate-500 leading-relaxed">Nossa estrutura é organizada para garantir a excelência técnica na gestão de cada pilar da cultura maranhense.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <DeptCard 
            title="DPHAP"
            description="Departamento focado no patrimônio material, conservação de imóveis históricos e conjuntos urbanos."
            icon={History}
            colorClass="bg-[#5283A9]"
          />
          <DeptCard 
            title="DPI"
            description="Salvaguarda das manifestações imateriais, saberes, festejos e a alma do povo do Maranhão."
            icon={Sparkles}
            colorClass="bg-[#CC343A]"
          />
          <DeptCard 
            title="DPE"
            description="Gestão de projetos estratégicos de revitalização urbana e obras de grande impacto."
            icon={ArrowRight}
            colorClass="bg-[#2D2D2D]"
          />
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-[#5283A9] rounded-[3.5rem] p-12 md:p-24 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
             <div className="space-y-6 text-white text-center md:text-left">
               <h2 className="text-4xl md:text-6xl font-black leading-tight">Viu algo irregular?</h2>
               <p className="text-blue-100 text-lg max-w-md">Ajude a SPC a proteger nosso patrimônio. Denuncie danos ou obras irregulares em áreas históricas.</p>
               <Link to="/denuncia" className="inline-flex items-center gap-3 px-10 py-5 bg-[#CC343A] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#b02c32] hover:shadow-2xl shadow-lg transition-all">
                 <AlertTriangle size={20} /> Fazer Denúncia
               </Link>
             </div>
             <div className="flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[3rem] border border-white/20">
                   <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white text-[#5283A9] rounded-xl flex items-center justify-center font-black">01</div>
                         <p className="text-sm font-bold text-white uppercase tracking-wider">Identifique o Local</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white text-[#5283A9] rounded-xl flex items-center justify-center font-black">02</div>
                         <p className="text-sm font-bold text-white uppercase tracking-wider">Envie Fotos</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white text-[#5283A9] rounded-xl flex items-center justify-center font-black">03</div>
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