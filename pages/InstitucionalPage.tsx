
import React, { useState } from 'react';
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

const StaffCard = ({ name, role, dept, image, color }: { name: string, role: string, dept: string, image: string, color: string }) => (
  <div className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
    <div className="relative mb-6">
      <div className={`absolute inset-0 ${color} rounded-[2rem] opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
      <img src={image} alt={name} className="w-full h-64 object-cover rounded-[2rem] grayscale group-hover:grayscale-0 transition-all duration-700 shadow-inner" />
      <div className={`absolute bottom-4 right-4 w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500`}>
        <UserCheck size={20} />
      </div>
    </div>
    <div className="space-y-1">
      <h4 className="text-xl font-black text-[#2D2D2D] leading-tight">{name}</h4>
      <p className={`text-[10px] font-black uppercase tracking-widest ${color.replace('bg-', 'text-')}`}>{dept}</p>
      <p className="text-sm text-slate-500 font-medium pt-2 border-t border-slate-50 mt-4">{role}</p>
    </div>
  </div>
);

const InstitucionalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quem-somos' | 'estrutura' | 'competencias'>('quem-somos');

  const sections = {
    'quem-somos': {
      title: 'Quem Somos',
      icon: Users,
      color: '#CC343A'
    },
    'estrutura': {
      title: 'Estrutura',
      icon: Building2,
      color: '#5283A9'
    },
    'competencias': {
      title: 'Atuação',
      icon: Gavel,
      color: '#2D2D2D'
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-[#2D2D2D] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1590483736622-39da8af7541c?auto=format&fit=crop&q=80&w=2000"
            alt="Centro Histórico de São Luís"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D2D2D]/40 via-[#2D2D2D] to-[#2D2D2D]"></div>

        <div className="relative max-w-7xl mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#CC343A]/20 text-[#CC343A] border border-[#CC343A]/30 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4">
            Institucional
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white leading-tight">
            Identidade e <span className="text-[#CC343A]">Memória</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A SPC é a guardiã oficial do rico patrimônio cultural maranhense, atuando na proteção e valorização do nosso legado histórico desde sua fundação.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="sticky top-20 z-40 bg-white border-b border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex py-1">
            {Object.entries(sections).map(([id, section]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-3 px-10 py-6 text-xs font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === id
                    ? `border-[#CC343A] text-[#CC343A]`
                    : 'border-transparent text-slate-400 hover:text-[#2D2D2D] hover:bg-slate-50'
                  }`}
              >
                <section.icon size={18} />
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-20">
        {activeTab === 'quem-somos' && (
          <div className="space-y-32 animate-in fade-in duration-500">
            {/* Missão e Visão Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
                <div className="w-16 h-16 bg-[#CC343A]/10 text-[#CC343A] rounded-[1.5rem] flex items-center justify-center shadow-inner">
                  <Target size={32} />
                </div>
                <h3 className="text-3xl font-black text-[#2D2D2D]">Missão</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Preservar e salvaguardar o patrimônio cultural do Maranhão através de políticas públicas integradas, garantindo que a riqueza histórica do estado seja desfrutada pelas gerações presentes e futuras.
                </p>
              </div>
              <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
                <div className="w-16 h-16 bg-[#5283A9]/10 text-[#5283A9] rounded-[1.5rem] flex items-center justify-center shadow-inner">
                  <Eye size={32} />
                </div>
                <h3 className="text-3xl font-black text-[#2D2D2D]">Visão</h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Consolidar o Maranhão como referência internacional em gestão do patrimônio cultural, unindo tradição e contemporaneidade como pilares de desenvolvimento social e identidade.
                </p>
              </div>
            </div>

            {/* Liderança Principal */}
            <div className="space-y-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-[#2D2D2D] uppercase tracking-tighter">Corpo Diretivo</h2>
                <div className="h-1.5 w-16 bg-[#CC343A] mx-auto rounded-full"></div>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">Conheça os gestores responsáveis por conduzir as políticas de preservação no Maranhão.</p>
              </div>

              {/* Superintendente Destaque */}
              <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl p-10 md:p-16 flex flex-col lg:flex-row gap-12 items-center">
                <div className="lg:w-1/3 w-full">
                  <img src="/imagens/superintendente.jpg" className="w-full h-[450px] object-cover rounded-[3rem] shadow-2xl" alt="Superintendente Eduardo Longhi" />
                </div>
                <div className="lg:w-2/3 space-y-8">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#CC343A]/10 text-[#CC343A] rounded-full text-[10px] font-black uppercase tracking-widest">Gabinete da Superintendência</span>
                    <h3 className="text-4xl font-black text-[#2D2D2D]">Eduardo Longhi</h3>
                    <p className="text-lg text-[#5283A9] font-bold">Superintendente do Patrimônio Cultural</p>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-lg italic">
                    "Nossa gestão foca na aproximação do cidadão com o seu patrimônio. Preservar não é apenas manter prédios de pé, é manter viva a alma do nosso povo e garantir que cada maranhense sinta orgulho de sua história."
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-slate-500">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#5283A9]"><Award size={20} /></div>
                      <span className="text-sm font-bold uppercase tracking-widest">Especialista em Gestão Pública</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#CC343A]"><Briefcase size={20} /></div>
                      <span className="text-sm font-bold uppercase tracking-widest">Atuação desde 2012</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chefes de Departamento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <StaffCard
                  name="Arq. Mariana Rocha"
                  role="Diretora do Departamento de Patrimônio Material. Especialista em Restauro pela UFMA."
                  dept="Chefia DPHAP"
                  image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800"
                  color="bg-[#5283A9]"
                />
                <StaffCard
                  name="Profa. Benedita Soares"
                  role="Diretora de Patrimônio Imaterial. Antropóloga com foco em culturas quilombolas."
                  dept="Chefia DPI"
                  image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
                  color="bg-[#CC343A]"
                />
                <StaffCard
                  name="Eng. Carlos Alberto"
                  role="Diretor de Projetos Especiais. Especialista em infraestrutura urbana de centros históricos."
                  dept="Chefia DPE"
                  image="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800"
                  color="bg-[#2D2D2D]"
                />
              </div>
            </div>

            {/* Corpo Técnico Menor Grid */}
            <div className="bg-slate-100/50 rounded-[4rem] p-16 space-y-12">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-black text-[#2D2D2D] uppercase tracking-widest">Nossa Equipe Técnica</h3>
                <p className="text-slate-500 text-sm max-w-lg mx-auto">Uma equipe multidisciplinar dedicada ao monitoramento e proteção dos 42 municípios sob nossa guarda.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { name: 'Ana Beatriz', role: 'Arquiteta Urbanista', dept: 'DPHAP' },
                  { name: 'Ricardo Mendes', role: 'Historiador', dept: 'DPHAP' },
                  { name: 'Clara Nunes', role: 'Socióloga', dept: 'DPI' },
                  { name: 'Paulo Victor', role: 'Engenheiro Civil', dept: 'DPE' },
                  { name: 'Fernanda Lima', role: 'Arqueóloga', dept: 'DPHAP' },
                  { name: 'Gabriel Souza', role: 'Geógrafo / GIS', dept: 'Gabinete' },
                  { name: 'Sueli Martins', role: 'Advogada Patrimonial', dept: 'Jurídico' },
                  { name: 'João Batista', role: 'Mestre de Obras Históricas', dept: 'DPE' }
                ].map((staff, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow">
                    <h5 className="font-black text-[#2D2D2D] text-sm mb-1">{staff.name}</h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">{staff.dept}</p>
                    <p className="text-[10px] text-slate-500">{staff.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trajectory Section (Existing) */}
            <div className="bg-[#2D2D2D] rounded-[4rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#CC343A] opacity-10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="lg:w-1/2 p-16 lg:p-24 space-y-10 text-white relative z-10">
                <h2 className="text-4xl font-black tracking-tight">Um compromisso com a história</h2>
                <div className="space-y-8 text-slate-300 leading-relaxed text-lg">
                  <p>
                    A SPC nasceu da necessidade de um órgão estadual especializado em gerir o vasto acervo colonial do Maranhão, complementando a atuação federal do IPHAN.
                  </p>
                  <p>
                    Atuamos em parceria com comunidades locais para registrar saberes ancestrais, restaurar prédios e garantir que a "Cidade dos Azulejos" continue a brilhar para as próximas gerações.
                  </p>
                </div>
              </div>
              <div className="lg:w-1/2 relative h-80 lg:h-auto overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1629235483813-906d20364d08?auto=format&fit=crop&q=80&w=1200"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  alt="Patrimônio Colonial"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'estrutura' && (
          <div className="space-y-20 animate-in slide-in-from-bottom-8 duration-500">
            <div className="text-center max-w-2xl mx-auto space-y-6">
              <h2 className="text-4xl font-black text-[#2D2D2D] uppercase tracking-tighter">Organograma Técnico</h2>
              <div className="h-1.5 w-16 bg-[#5283A9] mx-auto rounded-full"></div>
              <p className="text-slate-500 text-lg">Três departamentos especializados garantem a cobertura integral de todas as dimensões da nossa cultura.</p>
            </div>

            <div className="grid grid-cols-1 gap-10">
              {/* DPHAP */}
              <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-2xl transition-all border-l-[16px] border-l-[#5283A9]">
                <div className="md:w-1/4 bg-[#5283A9]/5 p-12 flex flex-col items-center justify-center text-center">
                  <History size={64} className="text-[#5283A9] mb-6" />
                  <h3 className="text-3xl font-black text-[#5283A9]">DPHAP</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Patrimônio Material</span>
                </div>
                <div className="p-12 md:p-16 flex-grow space-y-6">
                  <h4 className="text-2xl font-black text-[#2D2D2D]">Gestão e Conservação de Bens Físicos</h4>
                  <p className="text-slate-500 text-lg leading-relaxed">
                    Responsável pelo inventário, tombamento e fiscalização técnica de conjuntos arquitetônicos e monumentos. Define as diretrizes para obras de restauro e preservação da paisagem urbana.
                  </p>
                  <ul className="flex flex-wrap gap-3">
                    {['Tombamentos', 'Fiscalização', 'Diretrizes', 'Restauro'].map(tag => (
                      <li key={tag} className="px-4 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-100">{tag}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* DPI */}
              <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-2xl transition-all border-l-[16px] border-l-[#CC343A]">
                <div className="md:w-1/4 bg-[#CC343A]/5 p-12 flex flex-col items-center justify-center text-center">
                  <Sparkles size={64} className="text-[#CC343A] mb-6" />
                  <h3 className="text-3xl font-black text-[#CC343A]">DPI</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Patrimônio Imaterial</span>
                </div>
                <div className="p-12 md:p-16 flex-grow space-y-6">
                  <h4 className="text-2xl font-black text-[#2D2D2D]">Salvaguarda de Saberes e Vivências</h4>
                  <p className="text-slate-500 text-lg leading-relaxed">
                    Atua no registro de manifestações culturais, celebrações, formas de expressão e saberes tradicionais. Coordena planos de salvaguarda que protegem a alma coletiva do Maranhão.
                  </p>
                  <ul className="flex flex-wrap gap-3">
                    {['Registros', 'Mapeamento', 'Salvaguarda', 'Celebrações'].map(tag => (
                      <li key={tag} className="px-4 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-100">{tag}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* DPE */}
              <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-2xl transition-all border-l-[16px] border-l-[#2D2D2D]">
                <div className="md:w-1/4 bg-slate-50 p-12 flex flex-col items-center justify-center text-center">
                  <Hammer size={64} className="text-[#2D2D2D] mb-6" />
                  <h3 className="text-3xl font-black text-[#2D2D2D]">DPE</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Especiais</span>
                </div>
                <div className="p-12 md:p-16 flex-grow space-y-6">
                  <h4 className="text-2xl font-black text-[#2D2D2D]">Intervenções e Reabilitação Estratégica</h4>
                  <p className="text-slate-500 text-lg leading-relaxed">
                    Coordena projetos especiais de intervenção urbana em centros históricos, visando a reabilitação, infraestrutura e sustentabilidade de áreas de grande relevância patrimonial.
                  </p>
                  <ul className="flex flex-wrap gap-3">
                    {['Urbanismo', 'Obras', 'Revitalização', 'Planejamento'].map(tag => (
                      <li key={tag} className="px-4 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-100">{tag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'competencias' && (
          <div className="space-y-20 animate-in zoom-in duration-500">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl font-black text-[#2D2D2D] uppercase tracking-tighter">Nosso Papel Social</h2>
              <div className="h-1.5 w-16 bg-[#CC343A] mx-auto rounded-full"></div>
              <p className="text-slate-500 text-lg">Entenda como a SPC impacta o seu dia a dia de forma simplificada e direta.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Proteger o que é nosso',
                  desc: 'Asseguramos que prédios históricos e festas populares não desapareçam através de leis de proteção oficial.',
                  icon: Shield,
                  color: 'bg-[#CC343A]/10 text-[#CC343A]'
                },
                {
                  title: 'Orientar Reformas',
                  desc: 'Ajudamos proprietários a realizar melhorias em casas históricas respeitando a arquitetura e segurança.',
                  icon: Hammer,
                  color: 'bg-[#5283A9]/10 text-[#5283A9]'
                },
                {
                  title: 'Valorizar a Cultura',
                  desc: 'Registramos nossos saberes ancestrais para que recebam o devido valor e apoio para sua continuidade.',
                  icon: Palette,
                  color: 'bg-amber-50 text-amber-600'
                },
                {
                  title: 'Cuidar das Cidades',
                  desc: 'Trabalhamos para que os centros históricos sejam lugares vivos, seguros e vibrantes para todos.',
                  icon: MapPin,
                  color: 'bg-green-50 text-green-600'
                },
                {
                  title: 'Educar a Sociedade',
                  desc: 'Produzimos conteúdo para que cada maranhense aprenda a amar e zelar por sua própria história.',
                  icon: FileBadge,
                  color: 'bg-purple-50 text-purple-600'
                },
                {
                  title: 'Fiscalizar o Zelo',
                  desc: 'Atuamos contra o abandono e destruição de bens que pertencem a toda a população.',
                  icon: Gavel,
                  color: 'bg-[#2D2D2D]/10 text-[#2D2D2D]'
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[2.8rem] border border-slate-100 shadow-sm hover:translate-y-[-8px] transition-all group">
                  <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${item.color}`}>
                    <item.icon size={32} />
                  </div>
                  <h4 className="text-2xl font-black text-[#2D2D2D] mb-4">{item.title}</h4>
                  <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="bg-[#CC343A] rounded-[4rem] p-16 md:p-24 text-center text-white space-y-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 opacity-10 -rotate-12 translate-x-12 -translate-y-12">
                <Anchor size={400} />
              </div>
              <h2 className="text-4xl md:text-6xl font-black relative z-10 leading-tight">Vamos construir <br /> o futuro juntos?</h2>
              <p className="text-red-100 text-xl max-w-2xl mx-auto relative z-10 font-medium">
                Nossa equipe técnica atende proprietários, pesquisadores e cidadãos interessados na preservação da nossa cultura.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                <button className="px-12 py-5 bg-white text-[#CC343A] rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95">
                  Falar com SPC <Users size={20} />
                </button>
                <button className="px-12 py-5 bg-[#2D2D2D] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all border border-white/10 flex items-center justify-center gap-3 active:scale-95">
                  Serviços Disponíveis <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InstitucionalPage;
