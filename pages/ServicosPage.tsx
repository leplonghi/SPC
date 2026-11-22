import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText,
  ArrowRight,
  CheckSquare,
  History,
  Sparkles,
  Hammer,
  Mail,
  ExternalLink,
  ShieldAlert,
  Copy,
  Printer,
  CheckCircle2,
  Send,
  Landmark,
  Megaphone
} from 'lucide-react';
import { Department } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';

interface Service {
  id: string;
  shortTitle: string;
  title: string;
  category: string;
  department_responsible: Department;
  description: string;
  icon: React.ElementType;
  bring: string[];
  stages: string[];
  references: { label: string; to?: string; href?: string }[];
}

const SERVICOS_LIST: Service[] = [
  {
    id: 's1',
    shortTitle: 'Reformar imóvel tombado',
    title: 'Autorização para Intervenção em Imóvel Tombado',
    category: 'Obras e Projetos',
    department_responsible: Department.DPHAP,
    icon: Hammer,
    description:
      'Obrigatório antes de qualquer reforma, restauração, pintura de fachada ou alteração estrutural em imóvel tombado ou poligonal protegida.',
    bring: [
      'Documento de identificação do requerente (RG/CPF ou CNPJ) e procuração, se aplicável',
      'Comprovante de endereço e certidão de matrícula do imóvel ou título de posse',
      'Fotografias nítidas e atualizadas da fachada e áreas que receberão intervenção',
      'Memorial descritivo detalhando materiais, cores e técnicas a empregar',
      'Projeto arquitetônico assinado por profissional habilitado (CAU/CREA), para obras de médio/grande porte'
    ],
    stages: [
      '1. Protocolo do requerimento com formulário e documentos',
      '2. Vistoria técnica no imóvel pela equipe da SPC',
      '3. Parecer Técnico Conclusivo e Certificado de Autorização'
    ],
    references: [
      { label: 'Legislação estadual de proteção', to: '/legislacao' },
      { label: 'Consultar se o bem é tombado', to: '/bens-tombados' }
    ]
  },
  {
    id: 's2',
    shortTitle: 'Pedir certidão de poligonal',
    title: 'Certidão de Limites de Poligonal e Tombamento',
    category: 'Certidões',
    department_responsible: Department.DPHAP,
    icon: Landmark,
    description:
      'Atesta oficialmente se um imóvel ou terreno está dentro da área tombada estadual, área de entorno ou se possui tombamento individual.',
    bring: [
      'Identificação do solicitante (RG/CPF ou CNPJ)',
      'Endereço exato do imóvel (logradouro, número, lote, quadra e município)',
      'Certidão de matrícula atualizada ou croqui de localização',
      'Número de inscrição imobiliária (IPTU), se houver'
    ],
    stages: [
      '1. Conferência cartográfica com a base de decretos e poligonais estaduais',
      '2. Emissão da certidão oficial assinada pela autoridade competente'
    ],
    references: [
      { label: 'Baixar mapas de poligonal dos municípios', to: '/mapa?categoria=tombamento' },
      { label: 'Consultar bens tombados', to: '/bens-tombados' }
    ]
  },
  {
    id: 's3',
    shortTitle: 'Instalar placa ou letreiro',
    title: 'Autorização para Engenhos Publicitários',
    category: 'Comunicação Visual',
    department_responsible: Department.DPHAP,
    icon: Megaphone,
    description:
      'Aprovação para colocação de placas indicativas, letreiros e toldos em imóveis localizados em centros históricos protegidos.',
    bring: [
      'Identificação da empresa e do responsável pelo imóvel',
      'Fotomontagem ou croqui da fachada com o engenho nas dimensões exatas',
      'Especificação de materiais, cores, fixação e iluminação',
      'Adequação às Diretrizes Técnicas de Engenhos Publicitários da SPC'
    ],
    stages: [
      '1. Protocolo da proposta de comunicação visual',
      '2. Exame de harmonia com a arquitetura histórica',
      '3. Expedição do alvará de autorização'
    ],
    references: [
      { label: 'Baixar Cartilha de Engenhos Publicitários (PDF)', href: '/documentos/legislacao/diretrizes-dphap-engenhos-publicitarios.pdf' },
      { label: 'Ver Infográfico Visual (JPG)', href: '/imagens/infografico_engenhos.jpg' }
    ]
  },
  {
    id: 's4',
    shortTitle: 'Registrar patrimônio imaterial',
    title: 'Solicitação de Registro de Patrimônio Imaterial',
    category: 'Patrimônio Imaterial',
    department_responsible: Department.DPI,
    icon: Sparkles,
    description:
      'Abertura de pedido para reconhecimento de saberes, celebrações, formas de expressão ou lugares tradicionais no Maranhão.',
    bring: [
      'Requerimento assinado por associação, grupo detentor ou entidade cultural',
      'Anuência prévia da comunidade ou grupo detentor da manifestação',
      'Histórico descritivo da prática cultural e território de ocorrência',
      'Registros fotográficos, audiovisuais ou bibliográficos existentes'
    ],
    stages: [
      '1. Recebimento e análise preliminar pelo DPI/SPC',
      '2. Pesquisa técnica e inventário participativo',
      '3. Deliberação e inscrição no Livro de Registro correspondente'
    ],
    references: [
      { label: 'Conheça o Departamento de Patrimônio Imaterial (DPI)', to: '/dpi' },
      { label: 'Decreto Federal nº 3.551/2000', to: '/legislacao' }
    ]
  },
  {
    id: 's5',
    shortTitle: 'Tirar dúvida técnica de projeto',
    title: 'Consulta Técnica Prévia de Projetos e Restauro',
    category: 'Projetos Especiais',
    department_responsible: Department.DPE,
    icon: History,
    description:
      'Orientação técnica preliminar para arquitetos, engenheiros, gestores e proprietários antes do projeto executivo de restauro.',
    bring: [
      'Identificação do solicitante ou responsável técnico (CAU/CREA)',
      'Localização do imóvel e eventual número de inscrição no Livro do Tombo',
      'Estudo preliminar, levantamento métrico ou programa de necessidades',
      'Descrição das patologias construtivas observadas'
    ],
    stages: [
      '1. Apresentação do estudo preliminar ao DPE/SPC',
      '2. Reunião técnica ou análise orientativa sobre materiais e técnicas',
      '3. Emissão de orientação técnica prévia'
    ],
    references: [
      { label: 'Conheça o Departamento de Projetos Especiais (DPE)', to: '/dpe' },
      { label: 'Portaria IPHAN nº 289/2025', to: '/legislacao' }
    ]
  }
];

const DPHAP_EMAIL = 'dphapspc@gmail.com';

const ServicosPage: React.FC = () => {
  usePageTitle('Serviços e Formulários');
  const [params] = useSearchParams();
  const initialSrv = params.get('servico');

  const [selectedId, setSelectedId] = useState<string>(
    SERVICOS_LIST.some((s) => s.id === initialSrv) ? initialSrv! : 's1'
  );
  const [step, setStep] = useState<'docs' | 'form'>('form');

  const handleSelectService = (id: string) => {
    setSelectedId(id);
    setStep('form');
    setShowSummary(false);
    window.setTimeout(() => {
      document.getElementById('painel-requerimento')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const [userName, setUserName] = useState('');
  const [userDoc, setUserDoc] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState('Proprietário(a)');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyCity, setPropertyCity] = useState('São Luís');
  const [interventionDesc, setInterventionDesc] = useState('');
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const sParam = params.get('servico');
    if (sParam && SERVICOS_LIST.some((s) => s.id === sParam)) {
      setSelectedId(sParam);
    }
  }, [params]);

  const service = SERVICOS_LIST.find((s) => s.id === selectedId) || SERVICOS_LIST[0];

  const getFormattedSummaryText = () => {
    const docsChecklist = service.bring
      .map((item) => `  [${checkedDocs[item] ? 'X' : ' '}] ${item}`)
      .join('\n');

    return `À SUPERINTENDÊNCIA DO PATRIMÔNIO CULTURAL DO MARANHÃO (SPC/SECMA)
REQUERIMENTO FORMAL DE ATENDIMENTO / PROTOCOLO

1. SERVIÇO: ${service.title} (${service.department_responsible})
2. REQUERENTE: ${userName || '[Não informado]'} | CPF/CNPJ: ${userDoc || '[Não informado]'} | ${userRole}
   E-mail: ${userEmail || '[Não informado]'} | Telefone: ${userPhone || '[Não informado]'}
3. IMÓVEL / BEM: ${propertyAddress || '[Não informado]'} — ${propertyCity}/MA
4. DESCRIÇÃO DA SOLICITAÇÃO:
${interventionDesc || '[Não informado]'}

5. CHECKLIST DE DOCUMENTOS:
${docsChecklist}

Data: ${new Date().toLocaleDateString('pt-BR')} — ${propertyCity}/MA`;
  };

  const mailtoLink = `mailto:${DPHAP_EMAIL}?subject=${encodeURIComponent(
    `Requerimento SPC: ${service.title} - ${userName || 'Cidadão'}`
  )}&body=${encodeURIComponent(getFormattedSummaryText())}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(getFormattedSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-brand-surface text-slate-800">
      {/* Cabeçalho Terracota + Fotografia de Telhados Coloniais */}
      <header className="relative overflow-hidden bg-[#7D2B1E] text-white py-9 sm:py-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-30 saturate-110"
          style={{ backgroundImage: "url('/cena-fotos/telhados.webp')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#581C12]/95 via-[#7D2B1E]/85 to-[#B94734]/70"
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E9B44C]">
              Atendimento e Formulários · SPC/SECMA
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white">
              O que você precisa fazer hoje?
            </h1>
            <p className="mt-2 max-w-[58ch] text-sm sm:text-base text-slate-100 leading-relaxed">
              Escolha o serviço abaixo para conferir os documentos obrigatórios e gerar o requerimento pronto em 2 passos.
            </p>
          </div>
          <Link
            to="/denuncia"
            className="shrink-0 min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 px-4 py-2.5 text-xs font-bold text-white transition-colors"
          >
            <ShieldAlert size={15} className="text-[#E9B44C]" />
            <span>Denunciar obra irregular →</span>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 space-y-6">
        {/* PASSO 1: 5 Ações Compactas — 1 clique leva direto ao formulário */}
        <section aria-label="Escolha o serviço">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {SERVICOS_LIST.map((srv) => {
              const Icon = srv.icon;
              const active = srv.id === selectedId;
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => handleSelectService(srv.id)}
                  className={`text-left rounded-xl px-3.5 py-3 border transition-all flex items-center gap-3 ${
                    active
                      ? 'bg-[#B94734] text-white border-[#B94734] shadow-md'
                      : 'bg-white text-[#071D33] border-[#E5DDD5] hover:border-[#B94734]/60 shadow-sm'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      active ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-[#B94734] border border-[#E5DDD5]'
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-xs font-bold leading-snug line-clamp-2">{srv.shortTitle}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${active ? 'text-[#E9B44C]' : 'text-slate-500'}`}>
                      {srv.department_responsible}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* PASSO 2: Painel Focado — abre direto no Formulário com aba rápida de Documentos */}
        <section
          id="painel-requerimento"
          className="scroll-mt-20 bg-white rounded-3xl border border-[#E5DDD5] shadow-sm overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-[#E5DDD5] bg-[#FAF8F5] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#B94734]">
                {service.department_responsible} · {service.category}
              </p>
              <h2 className="font-serif text-lg sm:text-xl font-medium text-[#071D33]">
                {service.title}
              </h2>
            </div>

            {/* Alternador Rápido: Formulário (Padrão) | Documentos & Etapas */}
            <div className="inline-flex rounded-xl bg-white border border-[#E5DDD5] p-1 shrink-0 self-start">
              <button
                type="button"
                onClick={() => setStep('form')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  step === 'form' ? 'bg-[#B94734] text-white' : 'text-slate-600 hover:text-[#071D33]'
                }`}
              >
                Formulário
              </button>
              <button
                type="button"
                onClick={() => setStep('docs')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  step === 'docs' ? 'bg-[#071D33] text-white' : 'text-slate-600 hover:text-[#071D33]'
                }`}
              >
                Documentos ({service.bring.length})
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {step === 'docs' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#071D33] flex items-center gap-2">
                    <CheckSquare size={15} className="text-[#B94734]" />
                    Checklist de Documentos Obrigatórios (marque o que já separou)
                  </h3>
                  <div className="space-y-2">
                    {service.bring.map((item) => {
                      const checked = Boolean(checkedDocs[item]);
                      return (
                        <label
                          key={item}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                            checked
                              ? 'bg-[#256B58]/10 border-[#256B58]/40 text-[#071D33] font-medium'
                              : 'bg-[#FAF8F5] border-[#E5DDD5] text-slate-700 hover:border-[#B94734]/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setCheckedDocs((p) => ({ ...p, [item]: !p[item] }))}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#256B58]"
                          />
                          <span>{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-5">
                  <div className="rounded-2xl bg-[#FAF8F5] border border-[#E5DDD5] p-5 space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#071D33]">
                      Etapas de Tramitação
                    </h3>
                    <ol className="space-y-2 text-xs sm:text-sm text-slate-700">
                      {service.stages.map((st) => (
                        <li key={st} className="bg-white rounded-xl px-3.5 py-2.5 border border-[#E5DDD5]">
                          {st}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="rounded-2xl bg-[#FAF8F5] border border-[#E5DDD5] p-5 space-y-2.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#071D33]">
                      Normas & Materiais de Apoio
                    </h3>
                    {service.references.map((ref) => (
                      <div key={ref.label}>
                        {ref.to ? (
                          <Link
                            to={ref.to}
                            className="text-xs font-bold text-[#2F5F78] hover:text-[#B94734] underline inline-flex items-center gap-1"
                          >
                            {ref.label} <ArrowRight size={12} />
                          </Link>
                        ) : (
                          <a
                            href={ref.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#2F5F78] hover:text-[#B94734] underline inline-flex items-center gap-1"
                          >
                            {ref.label} <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="w-full min-h-[48px] rounded-xl bg-[#B94734] hover:bg-[#933525] text-white text-xs sm:text-sm font-extrabold transition-colors shadow-md inline-flex items-center justify-center gap-2"
                  >
                    <FileText size={16} />
                    <span>Avançar: Preencher Requerimento</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowSummary(true);
                }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="req-nome" className="block text-xs font-bold text-[#071D33] mb-1">Nome / Razão Social *</label>
                    <input
                      id="req-nome"
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Ex.: Maria dos Santos"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5DDD5] rounded-xl text-sm focus:outline-none focus:border-[#B94734]"
                    />
                  </div>
                  <div>
                    <label htmlFor="req-doc" className="block text-xs font-bold text-[#071D33] mb-1">CPF / CNPJ *</label>
                    <input
                      id="req-doc"
                      type="text"
                      required
                      value={userDoc}
                      onChange={(e) => setUserDoc(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5DDD5] rounded-xl text-sm focus:outline-none focus:border-[#B94734]"
                    />
                  </div>
                  <div>
                    <label htmlFor="req-role" className="block text-xs font-bold text-[#071D33] mb-1">Condição</label>
                    <select
                      id="req-role"
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5DDD5] rounded-xl text-sm focus:outline-none focus:border-[#B94734]"
                    >
                      <option>Proprietário(a)</option>
                      <option>Responsável Técnico (CAU/CREA)</option>
                      <option>Procurador(a) / Representante</option>
                      <option>Detentor(a) Cultural / Coletivo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="req-email" className="block text-xs font-bold text-[#071D33] mb-1">E-mail *</label>
                    <input
                      id="req-email"
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5DDD5] rounded-xl text-sm focus:outline-none focus:border-[#B94734]"
                    />
                  </div>
                  <div>
                    <label htmlFor="req-phone" className="block text-xs font-bold text-[#071D33] mb-1">Telefone / WhatsApp *</label>
                    <input
                      id="req-phone"
                      type="tel"
                      required
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="(98) 90000-0000"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5DDD5] rounded-xl text-sm focus:outline-none focus:border-[#B94734]"
                    />
                  </div>
                  <div>
                    <label htmlFor="req-city" className="block text-xs font-bold text-[#071D33] mb-1">Município *</label>
                    <input
                      id="req-city"
                      type="text"
                      required
                      value={propertyCity}
                      onChange={(e) => setPropertyCity(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5DDD5] rounded-xl text-sm focus:outline-none focus:border-[#B94734]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="req-addr" className="block text-xs font-bold text-[#071D33] mb-1">Endereço do Imóvel / Bem *</label>
                  <input
                    id="req-addr"
                    type="text"
                    required
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    placeholder="Ex.: Rua Portugal, nº 185, Centro Histórico"
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5DDD5] rounded-xl text-sm focus:outline-none focus:border-[#B94734]"
                  />
                </div>

                <div>
                  <label htmlFor="req-desc" className="block text-xs font-bold text-[#071D33] mb-1">Descrição da Solicitação *</label>
                  <textarea
                    id="req-desc"
                    rows={3}
                    required
                    value={interventionDesc}
                    onChange={(e) => setInterventionDesc(e.target.value)}
                    placeholder="Descreva resumidamente a intervenção ou solicitação pretendida..."
                    className="w-full p-3.5 bg-[#FAF8F5] border border-[#E5DDD5] rounded-xl text-sm focus:outline-none focus:border-[#B94734]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="min-h-[46px] px-6 py-2.5 bg-[#B94734] hover:bg-[#933525] text-white rounded-xl text-xs font-extrabold inline-flex items-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 size={16} /> Gerar Requerimento Pronto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSummary(true);
                      setTimeout(() => window.print(), 150);
                    }}
                    className="min-h-[46px] px-5 py-2.5 bg-[#071D33] hover:bg-[#2F5F78] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
                  >
                    <Printer size={15} /> Imprimir Folha de Rosto
                  </button>
                </div>

                {showSummary && (
                  <div className="mt-6 pt-6 border-t border-[#E5DDD5] space-y-4">
                    <pre className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DDD5] text-xs font-mono text-[#071D33] whitespace-pre-wrap leading-relaxed">
                      {getFormattedSummaryText()}
                    </pre>
                    <div className="flex flex-wrap gap-2.5">
                      <a
                        href={mailtoLink}
                        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#256B58] hover:bg-[#071D33] text-white text-xs font-bold inline-flex items-center gap-2"
                      >
                        <Send size={14} /> Enviar por E-mail à SPC ({DPHAP_EMAIL})
                      </a>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E5DDD5] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#071D33] inline-flex items-center gap-2"
                      >
                        <Copy size={14} /> {copied ? 'Texto copiado!' : 'Copiar texto'}
                      </button>
                      <a
                        href={`mailto:${DPHAP_EMAIL}?subject=${encodeURIComponent(`Dúvida: ${service.title}`)}`}
                        className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-[#2F5F78] inline-flex items-center gap-1.5 hover:underline"
                      >
                        <Mail size={14} /> Falar com a equipe
                      </a>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServicosPage;
