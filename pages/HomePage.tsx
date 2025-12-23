
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Map as MapIcon,
  History,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  AlertTriangle,
  Library,
  Database
} from 'lucide-react';
import { Department } from '../types';

const DeptCard = ({ title, description, icon: Icon, colorClass, image }: any) => (
  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full overflow-hidden">
    <div className="h-40 overflow-hidden relative">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className={`absolute bottom-3 left-5 w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center text-white shadow-lg`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="text-xl font-black text-brand-dark mb-3">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">{description}</p>
      <Link to={`/institucional`} className="inline-flex items-center text-xs font-black text-brand-blue uppercase tracking-widest hover:gap-2 transition-all">
        Explorar <ArrowRight size={16} />
      </Link>
    </div>
  </div>
);

const HomePage: React.FC = () => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % 5);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="relative h-[55vh] min-h-[450px] flex items-center overflow-hidden bg-brand-dark group">
        <div className="absolute inset-0 opacity-80">
          {[
            "/imagens/carousel_01.jpg",
            "/imagens/carousel_02.png",
            "/imagens/carousel_03.jpg",
            "/imagens/carousel_04.jpg",
            "/imagens/carousel_05.jpg"
          ].map((img, index) => (
            <div
              key={img}
              className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
              <img
                src={img}
                alt={`Centro Histórico - Destaque ${index + 1}`}
                className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${index === currentHeroIndex ? 'scale-110' : 'scale-100'
                  }`}
              />
            </div>
          ))}
        </div>

        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/50 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent z-10"></div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {[0, 1, 2, 3, 4].map((idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroIndex(idx)}
              className={`h-1 rounded-full transition-all duration-500 ${idx === currentHeroIndex
                ? 'w-6 bg-brand-red shadow-[0_0_10px_rgba(226,46,60,0.5)]'
                : 'w-1.5 bg-white/30 hover:bg-white/50'
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 z-20">
          <div className="space-y-5">
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 backdrop-blur-md text-white border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <ShieldCheck size={10} className="text-brand-red" /> Patrimônio Cultural do Maranhão
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Preservando a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-orange-400 to-yellow-500 animate-gradient-x">Memória</span> <br />
              Maranhense.
            </h1>
            <p className="text-sm text-slate-300 max-w-md leading-relaxed font-medium drop-shadow-md">
              Explore o Mapa do Patrimônio, consulte serviços e conheça as ações da SPC para garantir o futuro da nossa história.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/mapa"
                className="group px-6 py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-blue/90 transition-all hover:shadow-[0_0_20px_rgba(79,134,171,0.4)] active:scale-95"
              >
                <MapIcon size={14} className="group-hover:animate-bounce" /> Explorar o Mapa
              </Link>
              <Link
                to="/servicos"
                className="px-6 py-3 bg-white/5 text-white border border-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all hover:shadow-lg"
              >
                Serviços Online
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center relative perspective-1000">
            <div className="relative transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-all duration-700 ease-out group-hover:scale-105">
              <div className="absolute inset-0 bg-brand-blue/20 blur-2xl -z-10 animate-pulse"></div>
              <div className="bg-slate-900/40 backdrop-blur-sm p-3 rounded-[1.8rem] border border-white/10 shadow-2xl overflow-hidden">
                <img
                  src="/imagens/CH 01.jpg"
                  className="rounded-[1.2rem] w-[350px] h-[240px] object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  alt="Arquitetura Maranhense"
                />
              </div>

              {/* Floating Card Element */}
              <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-lg border border-white/20 p-3 rounded-xl shadow-xl animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white">
                    <History size={16} />
                  </div>
                  <div>
                    <p className="text-white text-[11px] font-bold">400+ Anos</p>
                    <p className="text-white/60 text-[9px]">de História</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Quick Grid */}
      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Bens Tombados', value: '2.451', color: 'text-brand-red' },
            { label: 'Cidades Protegidas', value: '42', color: 'text-brand-blue' },
            { label: 'Patrimônio Imaterial', value: '38', color: 'text-white bg-brand-dark p-4 rounded-[1.2rem]' },
            { label: 'Obras Ativas', value: '15', color: 'text-slate-900' }
          ].map((stat, i) => (
            <div key={i} className={`bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-lg text-center ${stat.color.includes('bg-') ? stat.color : ''}`}>
              <span className={`block text-xl font-black mb-1 ${!stat.color.includes('bg-') ? stat.color : ''}`}>{stat.value}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Resources Section */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="lg:w-1/2 space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                <BookOpen size={10} /> Recursos Digitais
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-brand-dark leading-tight">
                Acesso <span className="text-brand-blue">Simplificado</span> ao <br />
                Patrimônio Maranhense.
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                Nossa plataforma oferece ferramentas digitais para facilitar a pesquisa, o acesso a documentos e o acompanhamento das ações de preservação em todo o estado.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link to="/acervo-digital" className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-brand-blue hover:shadow-lg transition-all group">
                  <Library className="text-brand-blue mb-3 transition-transform" size={20} />
                  <h4 className="text-base font-black text-brand-dark mb-1">Acervo Digital</h4>
                  <p className="text-[10px] text-slate-500">Imagens, mapas e registros históricos digitalizados.</p>
                </Link>
                <Link to="/acervo-digital" className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-brand-red hover:shadow-lg transition-all group">
                  <Database className="text-brand-red mb-3 transition-transform" size={20} />
                  <h4 className="text-base font-black text-brand-dark mb-1">Repositório</h4>
                  <p className="text-[10px] text-slate-500">Documentação técnica, leis e normativas oficiais.</p>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 relative w-full">
              <div className="bg-brand-dark rounded-[2rem] overflow-hidden shadow-xl aspect-video relative group">
                <img
                  src="/imagens/card_especiais.jpg"
                  alt="Digital Library"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent flex items-end p-6">
                  <div className="space-y-1.5">
                    <span className="px-2.5 py-1 bg-brand-red text-white text-[8px] font-black uppercase tracking-widest rounded">Em Breve</span>
                    <h3 className="text-lg font-black text-white">Nova Biblioteca GIS</h3>
                    <p className="text-slate-300 text-[10px] max-w-xs">Integração total do acervo com dados georreferenciados.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-brand-dark tracking-tight">Atuação Setorial</h2>
          <div className="h-1.5 w-20 bg-brand-red mx-auto rounded-full"></div>
          <p className="text-base text-slate-500 leading-relaxed">Nossa estrutura é organizada para garantir a excelência técnica na gestão de cada pilar da cultura maranhense.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DeptCard
            title="DPHAP"
            description="Departamento focado no patrimônio material, conservação de imóveis históricos e conjuntos urbanos."
            icon={History}
            colorClass="bg-brand-blue"
            image="/imagens/card_material.jpg"
          />
          <DeptCard
            title="DPI"
            description="Salvaguarda das manifestações imateriais, saberes, festejos e a alma do povo do Maranhão."
            icon={Sparkles}
            colorClass="bg-brand-red"
            image="/imagens/card_imaterial.jpg"
          />
          <DeptCard
            title="DPE"
            description="Gestão de projetos estratégicos de revitalização urbana e obras de grande impacto."
            icon={ArrowRight}
            colorClass="bg-brand-dark"
            image="/imagens/card_especiais.jpg"
          />
        </div>
      </section>

      {/* Superintendente Section */}
      <section className="bg-brand-dark py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-blue blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[3rem] p-8 md:p-12 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/3 relative">
              <div className="absolute -inset-4 bg-brand-red/20 blur-2xl rounded-full opacity-50"></div>
              <img
                src="/imagens/superintendente.jpg"
                alt="Eduardo Longhi - Superintendente"
                className="w-full h-[350px] object-cover rounded-[2rem] shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="lg:w-2/3 space-y-6 text-white">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-red/20 text-brand-red border border-brand-red/30 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                  Palavra do Superintendente
                </span>
                <h2 className="text-3xl md:text-4xl font-black leading-tight">
                  Liderando a <span className="text-brand-blue">Transformação</span> Digital do Patrimônio.
                </h2>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed italic font-medium">
                "Nossa missão é democratizar o acesso à informação e garantir que a tecnologia seja uma aliada poderosa na preservação da nossa história. Estamos construindo uma SPC mais técnica, transparente e conectada com o maranhense."
              </p>
              <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h4 className="text-xl font-black text-white">Eduardo Longhi</h4>
                  <p className="text-brand-blue font-bold uppercase tracking-widest text-[10px]">Superintendente do Patrimônio Cultural</p>
                </div>
                <Link to="/institucional" className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-dark rounded-xl font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all shadow-xl text-[10px]">
                  Conhecer a Gestão <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-brand-blue rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src="/imagens/banner_denuncia.jpg" alt="Denúncia" className="w-full h-full object-cover opacity-20" />
              <div className="absolute inset-0 bg-brand-blue/80 backdrop-blur-sm"></div>
            </div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full z-10"></div>
            <div className="relative z-20 flex flex-col md:flex-row items-center justify-between gap-10 w-full">
              <div className="space-y-4 text-white text-center md:text-left">
                <h2 className="text-3xl md:text-5xl font-black leading-tight">Viu algo irregular?</h2>
                <p className="text-blue-100 text-sm max-w-md">Ajude a SPC a proteger nosso patrimônio. Denuncie danos ou obras irregulares em areas históricas.</p>
                <Link to="/denuncia" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-red text-white rounded-xl font-black uppercase tracking-widest hover:bg-brand-red/90 hover:shadow-2xl shadow-lg transition-all text-xs">
                  <AlertTriangle size={18} /> Fazer Denúncia
                </Link>
              </div>
              <div className="flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border border-white/20">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white text-brand-blue rounded-xl flex items-center justify-center font-black text-sm">01</div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Identifique o Local</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white text-brand-blue rounded-xl flex items-center justify-center font-black text-sm">02</div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Envie Fotos</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white text-brand-blue rounded-xl flex items-center justify-center font-black text-sm">03</div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Acompanhe o Status</p>
                    </div>
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