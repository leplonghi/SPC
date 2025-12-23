
import React, { useState } from 'react';
import {
  FileText,
  Search,
  ArrowRight,
  Download,
  CheckSquare,
  Clock,
  HelpCircle,
  ChevronDown,
  Info,
  ShieldCheck,
  ClipboardList,
  History,
  Sparkles,
  Hammer,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  MessageCircle,
  MapPin
} from 'lucide-react';
import { Department } from '../types';

interface ServiceFAQ {
  question: string;
  answer: string;
}

interface Service {
  id: string;
  title: string;
  category: string;
  department_responsible: Department;
  description: string;
  steps: string[];
  documents: string[];
  deadline: string;
  form_link: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  faq: ServiceFAQ[];
}

const DEPARTAMENTOS_INFO = [
  {
    id: Department.DPHAP,
    name: 'DPHAP',
    fullName: 'Patrimônio Material',
    icon: History,
    color: 'text-brand-blue',
    bgColor: 'bg-brand-blue/10',
    borderColor: 'border-brand-blue/20',
    description: 'Atua na preservação física de bens. Realiza consultas sobre poligonais, autoriza obras e reformas arquitetônicas.',
    link: '#',
    resources: [
      { label: 'Diretrizes de Intervenção', url: '#' },
      { label: 'Análises Técnicas', url: '#' },
      { label: 'Licenciamento Urbano', url: '#' }
    ]
  },
  {
    id: Department.DPI,
    name: 'DPI',
    fullName: 'Patrimônio Imaterial',
    icon: Sparkles,
    color: 'text-brand-red',
    bgColor: 'bg-brand-red/10',
    borderColor: 'border-brand-red/20',
    description: 'Responsável pelo registro de saberes, celebrações e apoio às comunidades detentoras de tradições.',
    link: '#',
    resources: []
  },
  {
    id: Department.DPE,
    name: 'DPE',
    fullName: 'Projetos Especiais',
    icon: Hammer,
    color: 'text-brand-dark',
    bgColor: 'bg-brand-dark/10',
    borderColor: 'border-brand-dark/20',
    description: 'Gerencia grandes intervenções urbanas e projetos estruturantes em áreas históricas protegidas.',
    link: '#',
    resources: []
  }
];

const SERVICOS_LIST: Service[] = [
  {
    id: 's1',
    title: 'Autorização para Intervenção em Bem Tombado',
    category: 'Obras e Projetos',
    department_responsible: Department.DPHAP,
    description: 'Solicitação necessária para realizar reformas, restauros ou qualquer alteração em imóveis protegidos ou situados em área de entorno.',
    steps: [
      'Abertura de processo no protocolo digital (SEI) ou presencial.',
      'Análise técnica do projeto arquitetônico pela equipe do DPHAP.',
      'Vistoria in loco para verificação das condições atuais.',
      'Emissão de parecer técnico favorável ou pedido de ajustes.',
      'Emissão da Certidão de Autorização.'
    ],
    documents: [
      'Requerimento preenchido',
      'Documento de propriedade do imóvel',
      'Projeto arquitetônico completo',
      'Relatório fotográfico atualizado',
      'RRT/ART do responsável técnico'
    ],
    deadline: 'Até 45 dias úteis',
    form_link: 'https://sei.ma.gov.br/protocolo-externo',
    contact: {
      email: 'dphap@spc.ma.gov.br',
      phone: '(98) 3218-1234',
      address: 'Rua do Giz, 445 - Centro Histórico, São Luís/MA'
    },
    faq: [
      {
        question: 'Posso pintar a fachada de outra cor?',
        answer: 'Qualquer alteração cromática deve seguir a paleta histórica da região e requer aprovação técnica prévia do DPHAP.'
      },
      {
        question: 'Preciso de autorização para reparos internos?',
        answer: 'Sim, se o imóvel for tombado individualmente, qualquer intervenção estrutural ou estética interna deve ser comunicada.'
      }
    ]
  },
  {
    id: 's2',
    title: 'Registro de Patrimônio Imaterial',
    category: 'Salvaguarda',
    department_responsible: Department.DPI,
    description: 'Processo de identificação e registro oficial de manifestações culturais maranhenses (festas, saberes, formas de expressão).',
    steps: [
      'Solicitação por grupo organizado, comunidade ou órgão público.',
      'Elaboração de dossiê de registro pela equipe do DPI.',
      'Consulta pública e análise pelo Conselho Estadual de Cultura.',
      'Assinatura do decreto de registro pelo Governador.'
    ],
    documents: [
      'Carta de anuência da comunidade detentora',
      'Relato histórico da manifestação',
      'Vídeos e fotos representativas',
      'Referências bibliográficas e documentos históricos'
    ],
    deadline: 'De 6 a 12 meses',
    form_link: 'https://sei.ma.gov.br/protocolo-externo',
    contact: {
      email: 'dpi@spc.ma.gov.br',
      phone: '(98) 3218-5678',
      address: 'Rua do Sol, 112 - Centro, São Luís/MA'
    },
    faq: [
      {
        question: 'Quem pode solicitar o registro?',
        answer: 'Associações, comunidades detentoras, prefeituras ou o próprio estado podem iniciar o pedido de registro.'
      },
      {
        question: 'O registro garante verba direta?',
        answer: 'O registro habilita a manifestação a participar de editais de fomento específicos para salvaguarda do patrimônio imaterial.'
      }
    ]
  },
  {
    id: 's3',
    title: 'Certidão de Limites de Poligonal',
    category: 'Consulta',
    department_responsible: Department.DPHAP,
    description: 'Certifica se um imóvel está inserido em área de tombamento ou área envoltória de proteção oficial.',
    steps: [
      'Preenchimento do formulário de consulta online.',
      'Análise cartográfica baseada no endereço ou coordenadas.',
      'Emissão da certidão digital.'
    ],
    documents: [
      'Endereço completo do imóvel',
      'Matrícula ou croqui de localização',
      'Cópia do IPTU (opcional)'
    ],
    deadline: 'Até 10 dias úteis',
    form_link: 'https://forms.spc.ma.gov.br/certidao-poligonal',
    contact: {
      email: 'cartografia@spc.ma.gov.br',
      phone: '(98) 3218-9000',
      address: 'Rua do Giz, 445 - Centro Histórico, São Luís/MA'
    },
    faq: [
      {
        question: 'A certidão tem validade?',
        answer: 'A certidão reflete o estado atual das poligonais. Caso haja alteração na legislação de proteção, uma nova consulta deve ser feita.'
      },
      {
        question: 'A certidão é gratuita?',
        answer: 'Sim, a emissão da certidão de limites de poligonal é um serviço gratuito oferecido pela SPC.'
      }
    ]
  }
];

const ServicosPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeService, setActiveService] = useState<string | null>(null);

  const filteredServices = SERVICOS_LIST.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department_responsible.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-[#2D2D2D] pt-12 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-80">
          <img
            src="/imagens/CH 01.jpg"
            alt="Centro Histórico"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#2D2D2D]/60 via-[#2D2D2D]/90 to-[#2D2D2D]"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#CC343A]/20 text-[#CC343A] border border-[#CC343A]/30 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
            Atendimento Cidadão
          </div>
          <h1 className="text-xl md:text-3xl font-black text-white leading-tight">
            Serviços <span className="text-[#CC343A]">Online</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
            Orientações rápidas e formulários para suas solicitações.
          </p>

          <div className="w-full max-w-md mx-auto relative group pt-1">
            <Search className="absolute left-4 top-[calc(50%+2px)] -translate-y-1/2 text-slate-300 group-focus-within:text-[#CC343A] transition-colors" size={14} />
            <input
              type="text"
              placeholder="Ex: Reforma, DPHAP, Certidão..."
              className="w-full pl-10 pr-5 py-2 bg-white/10 border border-white/10 backdrop-blur-md rounded-xl text-xs font-medium text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#CC343A]/20 focus:border-[#CC343A] transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Dept Competencies */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEPARTAMENTOS_INFO.map((dept) => (
            <div key={dept.id} className={`flex flex-col p-6 bg-white rounded-[1.5rem] border ${dept.borderColor} shadow-sm hover:shadow-lg transition-all group relative`}>
              <a href={dept.link} className="block flex-1">
                <div className={`w-10 h-10 ${dept.bgColor} ${dept.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <dept.icon size={20} />
                </div>
                <h3 className="text-base font-black text-brand-dark mb-1">{dept.name}</h3>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">{dept.fullName}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{dept.description}</p>
              </a>

              {dept.resources && dept.resources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 opacity-80">
                    <FileText size={10} /> Acesso Rápido
                  </p>
                  <div className="space-y-1.5">
                    {dept.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        className="flex items-center gap-2 text-[10px] font-bold text-slate-600 hover:text-brand-blue transition-colors group/link p-1.5 rounded-lg hover:bg-slate-50"
                      >
                        <ArrowRight size={10} className="text-brand-blue/50 group-hover/link:text-brand-blue transition-colors" />
                        {res.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Services Listing */}
      <section className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        <h2 className="text-lg font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
          <Building2 size={18} className="text-[#CC343A]" /> Catálogo SPC
        </h2>

        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100">
            <Info className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum serviço encontrado.</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden transition-all duration-500 ${activeService === service.id ? 'border-[#5283A9]/30 ring-8 ring-[#5283A9]/5 shadow-2xl scale-[1.01]' : 'hover:border-slate-200 hover:shadow-lg'}`}
            >
              <div
                onClick={() => setActiveService(activeService === service.id ? null : service.id)}
                className="w-full p-6 text-left flex items-center justify-between group cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveService(activeService === service.id ? null : service.id);
                  }
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest bg-brand-blue/10 px-2.5 py-0.5 rounded-full">
                      {service.category}
                    </span>
                    <a
                      href={DEPARTAMENTOS_INFO.find(d => d.id === service.department_responsible)?.link || '#'}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white hover:opacity-80 transition-opacity ${service.department_responsible === Department.DPHAP ? 'bg-brand-blue' :
                        service.department_responsible === Department.DPI ? 'bg-brand-red' :
                          'bg-brand-dark'
                        }`}>
                      {service.department_responsible}
                    </a>
                  </div>
                  <h3 className="text-xl font-black text-[#2D2D2D] group-hover:text-[#CC343A] transition-colors">{service.title}</h3>
                  <p className="text-slate-500 text-xs font-medium max-w-lg line-clamp-1">{service.description}</p>
                </div>
                <div className={`p-3 rounded-xl bg-slate-50 text-slate-400 transition-all ${activeService === service.id ? 'rotate-180 bg-[#CC343A] text-white' : 'group-hover:bg-slate-100'}`}>
                  <ChevronDown size={20} />
                </div>
              </div>

              {activeService === service.id && (
                <div className="px-6 pb-8 space-y-8 animate-in slide-in-from-top-4 duration-500 border-t border-slate-50 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Flow and FAQ */}
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-brand-dark uppercase tracking-widest flex items-center gap-2"><ArrowRight size={14} className="text-brand-red" /> Fluxo do Processo</h4>
                        <div className="space-y-4">
                          {service.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-4 items-start">
                              <span className="w-6 h-6 rounded-lg bg-brand-dark text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-lg">{idx + 1}</span>
                              <p className="text-slate-600 text-xs font-medium leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-brand-dark uppercase tracking-widest flex items-center gap-2"><MessageCircle size={14} className="text-brand-blue" /> Perguntas Frequentes</h4>
                        <div className="space-y-3">
                          {service.faq.map((q, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs font-black text-brand-dark mb-1">{q.question}</p>
                              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{q.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Requisites and Contact */}
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-brand-dark uppercase tracking-widest flex items-center gap-2"><CheckSquare size={14} className="text-brand-blue" /> Requisitos</h4>
                        <div className="space-y-2">
                          {service.documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-brand-blue/30 transition-colors cursor-default">
                              <Download size={14} className="text-brand-blue" /> {doc}
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest"><Clock size={12} /> Prazo Médio: {service.deadline}</span>
                          <a
                            href={service.form_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-6 py-3 bg-brand-red text-white rounded-xl font-black uppercase tracking-widest hover:bg-brand-red/90 hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-brand-red/20 text-[10px]"
                          >
                            Solicitar Agora <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>

                      <div className="space-y-4 p-6 bg-brand-dark text-white rounded-[2rem] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><HelpCircle size={14} className="text-brand-blue" /> Contato do Departamento</h4>
                        <div className="space-y-3 text-slate-300">
                          <div className="flex items-center gap-3">
                            <Mail size={14} className="text-brand-red" />
                            <span className="text-xs font-bold">{service.contact.email}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone size={14} className="text-brand-blue" />
                            <span className="text-xs font-bold">{service.contact.phone}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <MapPin size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-[10px] font-medium leading-relaxed">{service.contact.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {/* Footer Banner */}
      <section className="bg-brand-dark py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white leading-tight">Suporte Técnico</h2>
            <p className="text-slate-400 text-xs font-medium">
              Dúvidas sobre legislação ou como proceder com sua solicitação? Nossa central de atendimento está disponível para orientação.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-5 py-2.5 bg-brand-red text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-red/90 transition-all flex items-center justify-center gap-2 active:scale-95">
                <HelpCircle size={14} /> Canal Dúvidas
              </button>
              <button className="px-5 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2 active:scale-95">
                <ShieldCheck size={14} /> Ouvidoria MA
              </button>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] space-y-3">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-xl"><FileText size={20} /></div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Protocolo Digital</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Inicie seu processo de forma 100% digital através do Sistema Eletrônico de Informações do Maranhão.
            </p>
            <a href="https://sei.ma.gov.br" target="_blank" className="inline-flex items-center gap-2 text-brand-blue font-black uppercase tracking-widest text-[9px] hover:gap-3 transition-all">
              Ir para o SEI <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicosPage;
