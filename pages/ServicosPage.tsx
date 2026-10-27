import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  ArrowRight,
  CheckSquare,
  ChevronDown,
  Info,
  History,
  Sparkles,
  Hammer,
  Building2,
  Mail,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Download,
  Copy,
  Printer,
  CheckCircle2,
  Send,
  HelpCircle
} from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Department } from '../types';
import { SITE_CONTACT, DEPARTMENTS } from '../data/siteContact';
import { usePageTitle } from '../hooks/usePageTitle';

interface Service {
  id: string;
  title: string;
  category: string;
  department_responsible: Department;
  description: string;
  bring: string[];
  stages: string[];
  deadlineHint: string;
  references: { label: string; to?: string; href?: string }[];
}

const DEPARTAMENTOS_INFO = [
  {
    id: Department.DPHAP,
    name: 'DPHAP',
    fullName: 'Proteção do Patrimônio Histórico, Artístico, Arqueológico e Paisagístico',
    icon: History,
    color: 'text-brand-blue-dark',
    bgColor: 'bg-brand-blue/10',
    borderColor: 'border-slate-200',
    description: 'Tombamento, fiscalização e autorização de intervenções em bens tombados e poligonais de proteção.',
    link: '/institucional',
    resources: [
      {
        label: 'Diretrizes para engenhos publicitários (PDF)',
        url: '/documentos/legislacao/diretrizes-dphap-engenhos-publicitarios.pdf'
      }
    ]
  },
  {
    id: Department.DPI,
    name: 'DPI',
    fullName: 'Patrimônio Imaterial',
    icon: Sparkles,
    color: 'text-brand-terracotta',
    bgColor: 'bg-brand-red/10',
    borderColor: 'border-slate-200',
    description: 'Registro e salvaguarda de saberes, celebrações, formas de expressão e lugares de memória.',
    link: '/institucional',
    resources: []
  },
  {
    id: Department.DPE,
    name: 'DPE',
    fullName: 'Projetos Especiais',
    icon: Hammer,
    color: 'text-brand-dark',
    bgColor: 'bg-brand-dark/10',
    borderColor: 'border-slate-200',
    description: 'Projetos, obras de restauração, intervenções arquitetônicas e conservação de edifícios públicos.',
    link: '/institucional',
    resources: []
  }
];

const SERVICOS_LIST: Service[] = [
  {
    id: 's1',
    title: 'Autorização para Intervenção em Imóvel Tombado',
    category: 'Obras e Projetos',
    department_responsible: Department.DPHAP,
    description:
      'Reformas, restaurações, pinturas de fachada, alterações estruturais ou qualquer modificação em imóvel tombado ou situado em poligonal protegida precisam de análise prévia da SPC.',
    bring: [
      'Documento de identificação do requerente (RG/CPF ou CNPJ) e procuração, se aplicável',
      'Comprovante de endereço e certidão de matrícula do imóvel ou título de posse',
      'Fotografias nítidas e atualizadas da fachada e das áreas internas que receberão intervenção',
      'Memorial descritivo da intervenção detalhando materiais, cores e técnicas a empregar',
      'Projeto arquitetônico (planta baixa, cortes e fachadas) assinado por profissional habilitado (CAU/CREA), em caso de obra civil de médio/grande porte'
    ],
    stages: [
      '1. Protocolo do requerimento com formulário e documentos',
      '2. Vistoria técnica in loco realizada pela equipe da SPC',
      '3. Emissão de Parecer Técnico Conclusivo e Certificado de Autorização'
    ],
    deadlineHint: 'Análise técnica em conformidade com os prazos de tramitação administrativa estadual.',
    references: [
      { label: 'Decretos de tombamento e leis estaduais', to: '/legislacao' },
      {
        label: 'Diretrizes para engenhos publicitários (PDF)',
        href: '/documentos/legislacao/diretrizes-dphap-engenhos-publicitarios.pdf'
      }
    ]
  },
  {
    id: 's2',
    title: 'Certidão de Limites de Poligonal e Tombamento',
    category: 'Certidões',
    department_responsible: Department.DPHAP,
    description:
      'Documento oficial expedido pela SPC que atesta se determinado imóvel ou terreno está situado dentro de poligonal de tombamento, área de entorno ou se é individualmente tombado pelo Estado.',
    bring: [
      'Identificação do solicitante (RG/CPF ou CNPJ)',
      'Endereço exato do imóvel (logradouro, número, lote, quadra e município)',
      'Certidão de matrícula atualizada do Registro de Imóveis ou croqui de localização georreferenciado',
      'Número de inscrição imobiliária (IPTU) se houver'
    ],
    stages: [
      '1. Conferência cartográfica com a base de decretos e poligonais estaduais',
      '2. Emissão da certidão oficial assinada pela autoridade competente'
    ],
    deadlineHint: 'Expedição habitual após validação cadastral.',
    references: [
      { label: 'Consultar relação de bens tombados', to: '/bens-tombados' },
      { label: 'Biblioteca de legislação estadual', to: '/legislacao' }
    ]
  },
  {
    id: 's3',
    title: 'Autorização para Instalação de Engenhos Publicitários',
    category: 'Comunicação Visual',
    department_responsible: Department.DPHAP,
    description:
      'Colocação de placas indicativas, letreiros, toldos e engenhos de propaganda em imóveis localizados em centros históricos e áreas de preservação.',
    bring: [
      'Identificação da empresa e do responsável pelo imóvel',
      'Croqui ou simulação fotográfica (fotomontagem) da fachada com o engenho proposto nas dimensões exatas',
      'Especificação de materiais, cores, fixação e eventual iluminação',
      'Conformidade com a Norma Técnica de Engenhos Publicitários da SPC'
    ],
    stages: [
      '1. Protocolo da proposta de comunicação visual',
      '2. Exame de harmonia cromática e volumétrica com a arquitetura histórica',
      '3. Expedição do alvará de autorização'
    ],
    deadlineHint: 'Sujeito à análise das diretrizes técnicas oficiais.',
    references: [
      {
        label: 'Diretrizes para engenhos publicitários (PDF)',
        href: '/documentos/legislacao/diretrizes-dphap-engenhos-publicitarios.pdf'
      }
    ]
  },
  {
    id: 's4',
    title: 'Registro de Patrimônio Cultural Imaterial',
    category: 'Salvaguarda',
    department_responsible: Department.DPI,
    description:
      'Procedimento formal para reconhecimento e registro de bens culturais imateriais maranhenses (saberes, ofícios, celebrações, formas de expressão e lugares de memória comunitária).',
    bring: [
      'Identificação da comunidade, grupo, detentores culturais ou associação requerente',
      'Denominação e caracterização detalhada da manifestação cultural',
      'Histórico de continuidade histórica da manifestação no Maranhão',
      'Acervo comprobatório (fotografias, registros audiovisuais, depoimentos orais, pesquisas prévias)'
    ],
    stages: [
      '1. Abertura do processo de instrução para registro no DPI',
      '2. Pesquisa de campo e elaboração de dossiê técnico de registro',
      '3. Deliberação e inscrição no Livro de Registro de Patrimônio Imaterial correspondente'
    ],
    deadlineHint: 'Processo participativo com instrução técnica detalhada e ampla consulta pública.',
    references: [{ label: 'Legislação e resoluções sobre patrimônio imaterial', to: '/legislacao' }]
  },
  {
    id: 's5',
    title: 'Consulta Técnica Prévia e Orientação Arquitetônica',
    category: 'Consultoria Técnica',
    department_responsible: Department.DPE,
    description:
      'Esclarecimento técnico com arquitetos e engenheiros da SPC antes do desenvolvimento de projetos definitivos em imóveis de interesse histórico.',
    bring: [
      'Breve resumo da intenção do projeto ou diretrizes preliminares',
      'Endereço do imóvel e registros fotográficos da situação física atual',
      'Dúvidas específicas sobre materiais compatíveis ou diretrizes aplicáveis'
    ],
    stages: [
      '1. Envio da dúvida ou pré-projeto',
      '2. Orientação por equipe técnica do DPE/DPHAP sobre compatibilidade construtiva'
    ],
    deadlineHint: 'Atendimento via canal técnico de atendimento e reuniões agendadas.',
    references: [{ label: 'Conheça o Departamento de Projetos Especiais (DPE)', to: '/institucional' }]
  }
];

const ServicosPage: React.FC = () => {
  usePageTitle('Serviços');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeService, setActiveService] = useState<string | null>(null);

  // Estados do Assistente Interativo de Protocolo
  const [protocolService, setProtocolService] = useState('s1');
  const [userName, setUserName] = useState('');
  const [userDoc, setUserDoc] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState('Proprietário(a)');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyCity, setPropertyCity] = useState('São Luís');
  const [interventionDesc, setInterventionDesc] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const normalized = searchTerm.toLowerCase();
  const filteredServices = SERVICOS_LIST.filter(
    (s) =>
      s.title.toLowerCase().includes(normalized) ||
      s.category.toLowerCase().includes(normalized) ||
      s.department_responsible.toLowerCase().includes(normalized) ||
      s.description.toLowerCase().includes(normalized)
  );

  const selectedServiceObj = SERVICOS_LIST.find((s) => s.id === protocolService) || SERVICOS_LIST[0];

  const handleGenerateSummary = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSummary(true);
  };

  const getFormattedSummaryText = () => {
    return `AO DEPARTAMENTO COMPETENTE DA SUPERINTENDÊNCIA DO PATRIMÔNIO CULTURAL DO MARANHÃO (SPC/SECMA)
REQUERIMENTO FORMAL DE ATENDIMENTO / PROTOCOLO

1. IDENTIFICAÇÃO DO SERVIÇO:
- Serviço Solicitado: ${selectedServiceObj.title}
- Categoria: ${selectedServiceObj.category}
- Setor Responsável: ${selectedServiceObj.department_responsible}

2. DADOS DO REQUERENTE:
- Nome Completo / Razão Social: ${userName || '[Não informado]'}
- CPF / CNPJ: ${userDoc || '[Não informado]'}
- Qualidade: ${userRole}
- E-mail de Contato: ${userEmail || '[Não informado]'}
- Telefone / WhatsApp: ${userPhone || '[Não informado]'}

3. LOCALIZAÇÃO DO BEM / IMÓVEL:
- Município: ${propertyCity}
- Endereço Completo: ${propertyAddress || '[Não informado]'}

4. DESCRIÇÃO DA SOLICITAÇÃO / INTERVENÇÃO PRETENDIDA:
${interventionDesc || '[Não informado]'}

5. DOCUMENTOS DE INSTRUÇÃO:
Conforme informado, apresento as fotos, croqui e comprovações cadastrais solicitadas para exame e manifestação técnica da SPC.

Data da Solicitação: ${new Date().toLocaleDateString('pt-BR')}
Local: ${propertyCity} - Maranhão`;
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(getFormattedSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const mailtoLink = `mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent(
    `Requerimento SPC: ${selectedServiceObj.title} - ${userName || 'Cidadão'}`
  )}&body=${encodeURIComponent(getFormattedSummaryText())}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800">
      {/* HERO INSTITUCIONAL */}
      <section className="bg-brand-navy text-white py-14 border-b border-brand-sand/20 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity"
          style={{ backgroundImage: "url('/imagens/CH 01.jpg')" }}
        />
        <div className="relative max-w-[1240px] mx-auto px-6">
          <div className="max-w-3xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/10 text-[#E9B44C] text-xs font-bold uppercase tracking-widest inline-block border border-white/20">
              Atendimento e Protocolo Oficial
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Carta de Serviços ao Cidadão
            </h1>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              Consulte os serviços prestados pela Superintendência do Patrimônio Cultural, documentação exigida, prazos de análise e utilize o Assistente de Requerimento para protocolar seu pedido.
            </p>

            {/* Barra de busca de serviços */}
            <div className="pt-2 max-w-xl">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por reforma, autorização, certidão, engenho ou imaterial..."
                  className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm font-medium border border-white/20 focus:outline-none focus:ring-4 focus:ring-[#E9B44C]/30 shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ÁREA PRINCIPAL: CATÁLOGO + ASSISTENTE INTERATIVO */}
      <div className="max-w-[1240px] mx-auto px-6 py-12 md:py-16 space-y-16">
        {/* SEÇÃO 1: CATÁLOGO DE SERVIÇOS */}
        <section aria-labelledby="catalogo-servicos-titulo" className="space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-brand-terracotta">
              Catálogo Oficial
            </p>
            <h2 id="catalogo-servicos-titulo" className="text-2xl md:text-3xl font-black text-brand-navy">
              Serviços Disponíveis
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Clique em qualquer serviço para expandir a relação de documentos exigidos, etapas e setor responsável.
            </p>
          </div>

          <div className="space-y-4">
            {filteredServices.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
                <Info className="mx-auto text-slate-400 mb-3" size={36} />
                <p className="font-bold text-slate-700">Nenhum serviço encontrado com esse termo.</p>
                <p className="text-sm text-slate-500 mt-1">
                  Dúvidas gerais podem ser encaminhadas para{' '}
                  <a className="font-bold text-brand-navy underline" href={`mailto:${SITE_CONTACT.email}`}>
                    {SITE_CONTACT.email}
                  </a>.
                </p>
              </div>
            ) : (
              filteredServices.map((service) => {
                const isOpen = activeService === service.id;
                return (
                  <div
                    key={service.id}
                    className={`bg-white rounded-2xl border transition-all ${
                      isOpen
                        ? 'border-brand-navy shadow-md ring-1 ring-brand-navy/10'
                        : 'border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`detalhe-${service.id}`}
                      onClick={() => setActiveService(isOpen ? null : service.id)}
                      className="w-full p-5 md:p-6 text-left flex items-start justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                            {service.category}
                          </span>
                          <span className="text-[11px] font-black uppercase tracking-wider bg-brand-navy text-white px-2.5 py-0.5 rounded-md">
                            Setor: {service.department_responsible}
                          </span>
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-brand-navy">
                          {service.title}
                        </h3>
                        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border flex-shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 bg-brand-navy text-white border-brand-navy' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <ChevronDown size={18} />
                      </div>
                    </button>

                    {isOpen && (
                      <div
                        id={`detalhe-${service.id}`}
                        className="px-5 pb-6 pt-2 md:px-6 md:pb-8 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-8"
                      >
                        {/* Coluna 1: Documentos Necessários */}
                        <div className="lg:col-span-7 space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-brand-navy flex items-center gap-2">
                            <CheckSquare size={16} className="text-brand-terracotta" />
                            Documentos Obrigatórios (Tenha em Mãos)
                          </h4>
                          <ul className="space-y-2">
                            {service.bring.map((item, idx) => (
                              <li
                                key={idx}
                                className="text-xs md:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-start gap-2.5"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-navy mt-2 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="pt-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-brand-navy flex items-center gap-2 mb-2">
                              <History size={16} className="text-brand-terracotta" />
                              Etapas do Processo
                            </h4>
                            <div className="space-y-1.5">
                              {service.stages.map((stg, i) => (
                                <p key={i} className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                                  {stg}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Coluna 2: Ações Diretas */}
                        <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between">
                          <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                              Normas e Referências
                            </h4>
                            <ul className="space-y-1.5">
                              {service.references.map((ref, idx) => (
                                <li key={idx}>
                                  {ref.to ? (
                                    <Link
                                      to={ref.to}
                                      className="text-xs font-bold text-brand-navy hover:text-brand-terracotta underline flex items-center gap-1"
                                    >
                                      <span>{ref.label}</span>
                                      <ArrowRight size={12} />
                                    </Link>
                                  ) : (
                                    <a
                                      href={ref.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-bold text-brand-navy hover:text-brand-terracotta underline flex items-center gap-1"
                                    >
                                      <span>{ref.label}</span>
                                      <ExternalLink size={12} />
                                    </a>
                                  )}
                                </li>
                              ))}
                            </ul>

                            <div className="pt-2 text-xs text-slate-500">
                              <p>
                                <strong className="text-slate-700">Prazos:</strong> {service.deadlineHint}
                              </p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-200 space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                setProtocolService(service.id);
                                const el = document.getElementById('assistente-protocolo');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="w-full py-3 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                              <FileText size={14} />
                              <span>Preencher neste Requerimento</span>
                            </button>
                            <a
                              href={`mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent(service.title)}`}
                              className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                            >
                              <Mail size={14} />
                              <span>Tirar Dúvida por E-mail</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* SEÇÃO 2: ASSISTENTE INTERATIVO DE PROTOCOLO E REQUERIMENTO ONLINE */}
        <section
          id="assistente-protocolo"
          aria-labelledby="assistente-titulo"
          className="bg-white rounded-3xl border border-slate-200 p-6 md:p-10 shadow-sm space-y-8"
        >
          <div className="border-b border-slate-200 pb-6">
            <span className="px-3 py-1 rounded-full bg-brand-terracotta/10 text-brand-terracotta text-xs font-bold uppercase tracking-wider inline-block mb-2">
              Autoatendimento Funcional
            </span>
            <h2 id="assistente-titulo" className="text-2xl md:text-3xl font-black text-brand-navy">
              Assistente de Solicitação e Protocolo
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
              Preencha os dados abaixo para gerar instantaneamente a minuta formal de requerimento. Você poderá copiar o texto, enviá-lo por e-mail com 1 clique para a SPC ou imprimir a folha de rosto oficial para protocolo físico na sede.
            </p>
          </div>

          <form onSubmit={handleGenerateSummary} className="space-y-6">
            {/* 1. Seleção do Serviço */}
            <div>
              <label htmlFor="select-service" className="block text-xs font-black uppercase tracking-wider text-brand-navy mb-2">
                1. Serviço Desejado *
              </label>
              <select
                id="select-service"
                value={protocolService}
                onChange={(e) => setProtocolService(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-navy"
                required
              >
                {SERVICOS_LIST.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.title} ({srv.category} - {srv.department_responsible})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Dados do Requerente */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="user-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nome Completo / Razão Social *
                </label>
                <input
                  id="user-name"
                  type="text"
                  required
                  placeholder="Ex: Maria dos Santos"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                />
              </div>

              <div>
                <label htmlFor="user-doc" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  CPF ou CNPJ *
                </label>
                <input
                  id="user-doc"
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={userDoc}
                  onChange={(e) => setUserDoc(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                />
              </div>

              <div>
                <label htmlFor="user-role" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Condição do Solicitante
                </label>
                <select
                  id="user-role"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                >
                  <option value="Proprietário(a)">Proprietário(a)</option>
                  <option value="Procurador(a) legalmente constituído(a)">Procurador(a) / Representante</option>
                  <option value="Responsável Técnico (Arquiteto / Engenheiro)">Responsável Técnico (Arquiteto / Engenheiro)</option>
                  <option value="Locatário(a) / Inquilino(a)">Locatário(a) / Inquilino(a)</option>
                  <option value="Detentor(a) Cultural / Sociedade Civil">Detentor(a) Cultural / Coletivo</option>
                </select>
              </div>
            </div>

            {/* 3. Contatos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="user-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  E-mail para Retorno *
                </label>
                <input
                  id="user-email"
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                />
              </div>

              <div>
                <label htmlFor="user-phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Telefone / WhatsApp *
                </label>
                <input
                  id="user-phone"
                  type="tel"
                  required
                  placeholder="(98) 90000-0000"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                />
              </div>
            </div>

            {/* 4. Dados do Imóvel ou Bem */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="property-city" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Município do Imóvel / Bem *
                </label>
                <input
                  id="property-city"
                  type="text"
                  required
                  placeholder="Ex: São Luís"
                  value={propertyCity}
                  onChange={(e) => setPropertyCity(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="property-address" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Endereço Completo do Imóvel (Rua, Número, Bairro e Ponto de Referência) *
                </label>
                <input
                  id="property-address"
                  type="text"
                  required
                  placeholder="Ex: Rua Portugal, nº 185, Centro Histórico"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                />
              </div>
            </div>

            {/* 5. Descrição da Intervenção */}
            <div>
              <label htmlFor="intervention-desc" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Descrição Detalhada do que Pretende Realizar *
              </label>
              <textarea
                id="intervention-desc"
                rows={4}
                required
                placeholder="Descreva claramente a intervenção (Ex: substituição das telhas de barro mantendo o madeiramento original, pintura da fachada nas cores originais com cal, colocação de placa indicativa de 1,20m x 0,60m em madeira, etc.)."
                value={interventionDesc}
                onChange={(e) => setInterventionDesc(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-navy"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>Gerar Espelho do Requerimento</span>
            </button>
          </form>

          {/* ESPELHO FORMAL GERADO */}
          {showSummary && (
            <div className="mt-8 pt-8 border-t border-slate-200 space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-100 p-4 rounded-2xl">
                <div>
                  <h3 className="font-black text-sm text-brand-navy uppercase tracking-wider">
                    Espelho de Requerimento Administrativo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Documento preparado para envio imediato à SPC/SECMA.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="px-4 py-2 bg-white text-brand-navy border border-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <Copy size={14} />
                    <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-white text-brand-navy border border-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <Printer size={14} />
                    <span>Imprimir</span>
                  </button>

                  <a
                    href={mailtoLink}
                    className="px-5 py-2 bg-brand-navy text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-navy/90 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Send size={14} />
                    <span>Enviar por E-mail</span>
                  </a>
                </div>
              </div>

              {/* Bloco de Visualização Formatada */}
              <div className="p-6 bg-[#FAF8F5] rounded-2xl border border-slate-300 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                {getFormattedSummaryText()}
              </div>

              {/* Instruções de Protocolo Oficial */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 text-xs md:text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <Info size={18} />
                  <span>Como dar entrada no seu processo oficialmente:</span>
                </div>
                <p>
                  <strong>1. Por E-mail Oficial:</strong> Clique no botão <em>"Enviar por E-mail"</em> acima e anexe as fotos do imóvel, documento pessoal e comprovante de endereço. O e-mail é recebido diretamente pela triagem da SPC.
                </p>
                <p>
                  <strong>2. Protocolo Eletrônico (SEI Maranhão):</strong> Se você for usuário do SEI-MA, copie o texto formatado e anexe ao processo administrativo endereçado à SECMA/SPC.
                </p>
                <p>
                  <strong>3. Presencialmente na Sede:</strong> Imprima este requerimento assinado e entregue na sede da SPC: {SITE_CONTACT.buildingName}, {SITE_CONTACT.addressLine}, {SITE_CONTACT.city} - MA.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* SEÇÃO 3: SETORES TÉCNICOS RESPONSÁVEIS */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-brand-navy">
              Departamentos Técnicos da SPC
            </h2>
            <p className="text-slate-600 text-sm">
              Conheça as atribuições técnicas de cada departamento na tramitação do seu processo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEPARTAMENTOS_INFO.map((dept) => (
              <div
                key={dept.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 ${dept.bgColor} ${dept.color} rounded-xl flex items-center justify-center`}>
                    <dept.icon size={20} />
                  </div>
                  <h3 className="text-lg font-black text-brand-navy">{dept.name}</h3>
                  <p className="text-xs font-bold text-slate-500">{dept.fullName}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{dept.description}</p>
                </div>

                {dept.resources.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Documentos de Apoio
                    </p>
                    {dept.resources.map((res) => (
                      <a
                        key={res.url}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-brand-navy hover:text-brand-terracotta underline flex items-center gap-1"
                      >
                        <Download size={12} />
                        <span>{res.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServicosPage;
