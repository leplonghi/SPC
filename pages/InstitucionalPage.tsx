
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Sparkles,
  ArrowRight,
  Target,
  Shield,
  Eye,
  Users,
  Building2,
  FileBadge,
  MapPin,
  Gavel,
  Hammer,
  Palette,
  Anchor,
  UserCheck,
  Award,
  Briefcase
} from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';

const StaffCard = ({ name, role, dept, image, color }: { name: string, role: string, dept: string, image: string, color: string }) => (
  <div className="group bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className="relative mb-4 overflow-hidden rounded-xl aspect-[4/5]">
      <div className={`absolute inset-0 ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-10`}></div>
      <img src={image} alt={name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110" />
      <div className={`absolute bottom-2 right-2 w-8 h-8 ${color} text-white rounded-lg flex items-center justify-center shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20`}>
        <UserCheck size={16} />
      </div>
    </div>
    <div className="space-y-1">
      <h4 className="text-base font-black text-brand-dark leading-tight">{name}</h4>
      <p className={`text-[9px] font-black uppercase tracking-widest ${color.replace('bg-', 'text-')}`}>{dept}</p>
      <p className="text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-50 mt-2 leading-relaxed">{role}</p>
    </div>
  </div>
);

const InstitucionalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quem-somos' | 'estrutura' | 'competencias'>('quem-somos');

  const sections = {
    'quem-somos': {
      title: 'Quem Somos',
      icon: Users,
      id: 'quem-somos'
    },
    'estrutura': {
      title: 'Estrutura',
      icon: Building2,
      id: 'estrutura'
    },
    'competencias': {
      title: 'Atuação',
      icon: Gavel,
      id: 'competencias'
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section - Condensed */}
      <PageHero
        align="center"
        backgroundImage="/imagens/CH 01.jpg"
        badge={{
          text: 'Institucional',
          variant: 'red'
        }}
        title={<>Identidade e <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-orange-500">Memória</span></>}
        description="A SPC é a guardiã oficial do rico patrimônio cultural maranhense, atuando na proteção e valorização do nosso legado histórico para as futuras gerações."
      />

      {/* Navigation Tabs - Modern Pill Style */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center p-2 gap-2 overflow-x-auto no-scrollbar">
            {Object.entries(sections).map(([id, section]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === id
                  ? 'bg-brand-dark text-white shadow-lg scale-105'
                  : 'text-slate-400 hover:text-brand-dark hover:bg-slate-100'
                  }`}
              >
                <section.icon size={14} className={activeTab === id ? 'text-brand-red' : ''} />
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'quem-somos' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Missão e Visão - Compact format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group bg-white p-5 md:p-6 rounded-[1.5rem] shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-red/10 text-brand-red rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Target size={20} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-brand-dark">Missão</h3>
                    <p className="text-slate-600 text-xs leading-relaxed font-medium">
                      Preservar e salvaguardar o patrimônio cultural do Maranhão através de políticas públicas integradas, garantindo que a riqueza histórica do estado seja desfrutada pelas gerações presentes e futuras.
                    </p>
                  </div>
                </div>
              </div>
              <div className="group bg-white p-5 md:p-6 rounded-[1.5rem] shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Eye size={20} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-brand-dark">Visão</h3>
                    <p className="text-slate-600 text-xs leading-relaxed font-medium">
                      Consolidar o Maranhão como referência internacional em gestão do patrimônio cultural, unindo tradição e contemporaneidade como pilares de desenvolvimento social e identidade.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liderança Principal - Improved Card */}
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-2xl md:text-3xl font-black text-brand-dark uppercase tracking-tight">Corpo Diretivo</h2>
                <div className="h-1 w-12 bg-brand-red mx-auto rounded-full"></div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-stretch overflow-hidden group">
                <div className="md:w-1/3 w-full relative overflow-hidden rounded-[2.5rem]">
                  <img
                    src="/imagens/superintendente.jpg"
                    className="w-full h-[400px] md:h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                    alt="Superintendente Eduardo Longhi"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="md:w-2/3 flex flex-col justify-center space-y-6 py-4 md:pr-8">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-red/10 text-brand-red rounded-full text-[9px] font-black uppercase tracking-widest self-start">
                      Gabinete
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-brand-dark tracking-tight">Eduardo Longhi</h3>
                    <p className="text-sm text-brand-blue font-bold tracking-wide uppercase">Superintendente do Patrimônio Cultural</p>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs md:text-sm font-medium border-l-4 border-brand-red/20 pl-5 italic">
                    "Nossa gestão foca na aproximação do cidadão com o seu patrimônio. Preservar não é apenas manter prédios de pé, é manter viva a alma do nosso povo e garantir que cada maranhense sinta orgulho de sua história."
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Award size={14} className="text-brand-blue" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Gestão Pública</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Briefcase size={14} className="text-brand-red" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Desde 2012</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chefes de Departamento Grid - Dense */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <StaffCard
                  name="Arq. Giuliane Brito"
                  role="Diretora do Departamento de Patrimônio Material."
                  dept="Chefia DPHAP"
                  image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800"
                  color="bg-brand-blue"
                />
                <StaffCard
                  name="Neto de Azile"
                  role="Diretor do Departamento de Patrimônio Imaterial."
                  dept="Chefia DPI"
                  image="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800"
                  color="bg-brand-red"
                />
                <StaffCard
                  name="Arq. Keila Maria Espíndola"
                  role="Arquiteta e Urbanista do DPHAP."
                  dept="DPHAP"
                  image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
                  color="bg-brand-blue"
                />
              </div>
            </div>

            {/* Equipe Técnica - Compact List */}
            <div className="bg-slate-50 rounded-[3rem] p-10 md:p-14 space-y-8 border border-slate-100">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-brand-dark uppercase tracking-widest">Nossa Equipe Técnica</h3>
                <p className="text-slate-400 text-xs font-medium max-w-md mx-auto">Multidisciplinaridade para cobrir todas as frentes de preservação.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Ana Beatriz', role: 'Arquiteta', dept: 'DPHAP' },
                  { name: 'Ricardo Mendes', role: 'Historiador', dept: 'DPHAP' },
                  { name: 'Clara Nunes', role: 'Socióloga', dept: 'DPI' },
                  { name: 'Paulo Victor', role: 'Eng. Civil', dept: 'DPE' },
                  { name: 'Fernanda Lima', role: 'Arqueóloga', dept: 'DPHAP' },
                  { name: 'Gabriel Souza', role: 'Geógrafo', dept: 'Gabinete' },
                  { name: 'Sueli Martins', role: 'Advogada', dept: 'Jurídico' },
                  { name: 'João Batista', role: 'Mestre Obras', dept: 'DPE' }
                ].map((staff, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-bold text-brand-dark text-xs">{staff.name}</h5>
                      <span className="text-[8px] font-black text-white bg-slate-300 px-2 py-0.5 rounded-full uppercase tracking-widest">{staff.dept}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">{staff.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'estrutura' && (
          <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">Organograma Técnico</h2>
              <div className="h-1 w-12 bg-brand-blue mx-auto rounded-full"></div>
              <p className="text-slate-500 text-sm">Três departamentos especializados garantem a cobertura integral de todas as dimensões da nossa cultura.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[
                {
                  id: 'DPHAP',
                  name: 'Patrimônio Material',
                  desc: 'Responsável pelo inventário, tombamento e fiscalização técnica de conjuntos arquitetônicos e monumentos.',
                  icon: History,
                  color: 'text-brand-blue',
                  border: 'border-l-brand-blue',
                  tags: ['Tombamentos', 'Fiscalização', 'Diretrizes', 'Restauro'],
                  link: '/dphap'
                },
                {
                  id: 'DPI',
                  name: 'Patrimônio Imaterial',
                  desc: 'Atua no registro de manifestações culturais, celebrações, formas de expressão e saberes tradicionais.',
                  icon: Sparkles,
                  color: 'text-brand-red',
                  border: 'border-l-brand-red',
                  tags: ['Registros', 'Mapeamento', 'Salvaguarda', 'Celebrações'],
                  link: '/dpi'
                },
                {
                  id: 'DPE',
                  name: 'Projetos Especiais',
                  desc: 'Coordena projetos estratégicos de intervenção urbana em centros históricos, visando a reabilitação sustentável.',
                  icon: Hammer,
                  color: 'text-brand-dark',
                  border: 'border-l-brand-dark',
                  tags: ['Urbanismo', 'Obras', 'Revitalização', 'Planejamento'],
                  link: '/dpe'
                }
              ].map((dept, idx) => (
                <Link to={dept.link} key={idx} className={`bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all border-l-[8px] ${dept.border} group cursor-pointer`}>
                  <div className={`md:w-64 p-8 flex flex-col items-center justify-center text-center bg-slate-50/50`}>
                    <dept.icon size={40} className={`${dept.color} mb-3 group-hover:scale-110 transition-transform`} />
                    <h3 className={`text-2xl font-black ${dept.color}`}>{dept.id}</h3>
                  </div>
                  <div className="p-8 md:p-10 flex-grow space-y-4">
                    <h4 className="text-xl font-black text-brand-dark uppercase tracking-wide">{dept.name}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-2xl font-medium">
                      {dept.desc}
                    </p>
                    <ul className="flex flex-wrap gap-2 pt-2">
                      {dept.tags.map(tag => (
                        <li key={tag} className="px-3 py-1 bg-white text-slate-500 text-[9px] font-bold uppercase tracking-widest rounded-full border border-slate-100 shadow-sm">{tag}</li>
                      ))}
                    </ul>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'competencias' && (
          <div className="space-y-16 animate-in zoom-in duration-500">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">Nosso Papel Social</h2>
              <div className="h-1 w-12 bg-brand-red mx-auto rounded-full"></div>
              <p className="text-slate-500 text-sm">Entenda como a SPC impacta o seu dia a dia de forma simplificada.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Proteger', desc: 'Asseguramos que prédios e festas não desapareçam.', icon: Shield, color: 'text-brand-red bg-brand-red/10' },
                { title: 'Orientar', desc: 'Ajudamos em reformas de imóveis históricos.', icon: Hammer, color: 'text-brand-blue bg-brand-blue/10' },
                { title: 'Valorizar', desc: 'Registramos nossos saberes ancestrais.', icon: Palette, color: 'text-orange-600 bg-orange-50' },
                { title: 'Cuidar', desc: 'Centros históricos vivos e vibrantes.', icon: MapPin, color: 'text-emerald-600 bg-emerald-50' },
                { title: 'Educar', desc: 'Produzimos conteúdo sobre nossa história.', icon: FileBadge, color: 'text-purple-600 bg-purple-50' },
                { title: 'Fiscalizar', desc: 'Atuamos contra o abandono e destruição.', icon: Gavel, color: 'text-brand-dark bg-brand-dark/10' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.color}`}>
                    <item.icon size={24} />
                  </div>
                  <h4 className="text-lg font-black text-brand-dark mb-2">{item.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="bg-brand-red rounded-[2.5rem] p-8 md:p-10 text-center text-white space-y-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 opacity-10 -rotate-12 translate-x-12 -translate-y-12">
                <Anchor size={300} />
              </div>
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl md:text-5xl font-black leading-tight">Vamos construir <br /> o futuro juntos?</h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="px-8 py-4 bg-white text-brand-red rounded-xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95 text-xs shadow-xl">
                    Falar com SPC <Users size={16} />
                  </button>
                  <button className="px-8 py-4 bg-brand-dark text-white rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all border border-brand-dark hover:border-white/20 flex items-center justify-center gap-2 active:scale-95 text-xs shadow-xl">
                    Serviços Disponíveis <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InstitucionalPage;
