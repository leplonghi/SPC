import React from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Sparkles,
  Hammer,
  CheckCircle2,
  FileText,
  Download,
  ArrowRight,
  MapPin,
  Mail,
  ShieldAlert,
  Landmark,
  Compass,
  Gavel,
  BookOpen
} from 'lucide-react';
import { DEPARTMENTS, SITE_CONTACT } from '../data/siteContact';
import { BENS_TOMBADOS, DECRETOS_PDF } from '../data/bensTombados';
import { PUBLIC_LEGAL_DOCUMENTS } from '../data/publicLegalDocuments';
import { MAPAS_HISTORICOS } from '../data/mapasHistoricos';
import { usePageTitle } from '../hooks/usePageTitle';

interface DepartamentoOficialPageProps {
  code: 'DPHAP' | 'DPI' | 'DPE';
}

const DEPT_CONFIG = {
  DPHAP: {
    badge: 'Patrimônio Material, Arqueológico e Paisagístico',
    icon: History,
    accentBg: 'bg-brand-blue',
    atribuicoes: [
      'Instrução técnica de processos de tombamento estadual e guarda do Livro do Tombo Histórico e Artístico.',
      'Análise e emissão de autorização prévia para obras, reformas, pinturas de fachada e restaurações em bens tombados e poligonais protegidas.',
      'Expedição de Certidão de Limites de Poligonal e Tombamento Estadual.',
      'Análise e licenciamento de engenhos publicitários (placas, letreiros e toldos) em centros históricos sob tutela estadual.',
      'Vistoria técnica e fiscalização preventiva e corretiva contra danos, demolições ou intervenções irregulares.'
    ],
    servicos: [
      {
        titulo: 'Autorização para Intervenção em Imóvel Tombado',
        desc: 'Análise de memorial descritivo e projeto arquitetônico para obras, reformas ou pintura em imóvel protegido.'
      },
      {
        titulo: 'Certidão de Limites de Poligonal e Tombamento',
        desc: 'Atestado oficial sobre o enquadramento de imóvel em área tombada estadual ou entorno.'
      },
      {
        titulo: 'Autorização para Instalação de Engenhos Publicitários',
        desc: 'Aprovação de placas indicativas, letreiros e toldos conforme a diretriz técnica do DPHAP.'
      }
    ],
    normasIds: [
      'ma-lei-5082-1990',
      'ma-decreto-12350-1992',
      'ma-decreto-10089-1986',
      'ma-decreto-11591-1990',
      'spc-diretrizes-engenhos-publicitarios'
    ]
  },
  DPI: {
    badge: 'Salvaguarda e Registro do Patrimônio Imaterial',
    icon: Sparkles,
    accentBg: 'bg-brand-terracotta',
    atribuicoes: [
      'Identificação, inventário participativo e instrução técnica de processos de Registro de Patrimônio Cultural Imaterial no Maranhão.',
      'Acompanhamento de planos de salvaguarda junto a mestres, grupos detentores, comunidades tradicionais e coletivos culturais.',
      'Documentação de saberes, modos de fazer, celebrações, festas populares, formas de expressão e lugares de memória coletiva.',
      'Apoio técnico à difusão, educação patrimonial e valorização da diversidade cultural maranhense.'
    ],
    servicos: [
      {
        titulo: 'Solicitação de Registro de Patrimônio Cultural Imaterial',
        desc: 'Abertura de pedido de reconhecimento de saberes, celebrações, formas de expressão ou lugares tradicionais.'
      },
      {
        titulo: 'Orientação sobre Inventários e Salvaguarda',
        desc: 'Atendimento técnico a grupos detentores, associações culturais e pesquisadores sobre documentação imaterial.'
      }
    ],
    normasIds: [
      'br-constituicao-arts-215-216',
      'br-decreto-3551-2000',
      'ma-lei-5082-1990'
    ]
  },
  DPE: {
    badge: 'Conservação, Arquitetura e Projetos Especiais',
    icon: Hammer,
    accentBg: 'bg-brand-navy',
    atribuicoes: [
      'Elaboração e acompanhamento de projetos especiais de arquitetura, conservação e restauro do patrimônio edificado.',
      'Consulta técnica prévia e orientação metodológica para arquitetos, engenheiros e órgãos públicos em intervenções complexas.',
      'Diagnóstico de patologias construtivas e especificação de materiais tradicionais (alvenaria histórica, telhados coloniais, esquadrias e azulejaria).',
      'Articulação técnica em obras de requalificação de edifícios e espaços públicos de valor histórico no Maranhão.'
    ],
    servicos: [
      {
        titulo: 'Consulta Técnica Prévia de Projetos e Restauro',
        desc: 'Orientação técnica preliminar antes da elaboração executiva de projetos de intervenção em bens tombados.'
      },
      {
        titulo: 'Apoio Técnico a Projetos de Conservação',
        desc: 'Diretrizes construtivas sobre compatibilidade de materiais e técnicas tradicionais em imóveis históricos.'
      }
    ],
    normasIds: [
      'iphan-portaria-289-2025',
      'ma-lei-5082-1990',
      'br-decreto-lei-25-1937',
      'spc-diretrizes-engenhos-publicitarios'
    ]
  }
} as const;

const LIVROS_REGISTRO_IMATERIAL = [
  {
    titulo: 'Livro de Registro dos Saberes',
    desc: 'Conhecimentos e modos de fazer enraizados no cotidiano das comunidades (ofícios tradicionais, culinária, técnicas artesanais).'
  },
  {
    titulo: 'Livro de Registro das Celebrações',
    desc: 'Rituais e festas que marcam a vivência coletiva do trabalho, da religiosidade, do entretenimento e de outras práticas da vida social.'
  },
  {
    titulo: 'Livro de Registro das Formas de Expressão',
    desc: 'Manifestações literárias, musicais, plásticas, cênicas e lúdicas portadoras de referência à identidade e memória maranhense.'
  },
  {
    titulo: 'Livro de Registro dos Lugares',
    desc: 'Mercados, feiras, santuários, praças e demais espaços onde se concentram e reproduzem práticas culturais coletivas.'
  }
];

export const DepartamentoOficialPage: React.FC<DepartamentoOficialPageProps> = ({ code }) => {
  const dept = DEPARTMENTS.find((d) => d.code === code)!;
  const cfg = DEPT_CONFIG[code];
  const Icon = cfg.icon;
  usePageTitle(`${dept.code} — ${dept.name}`);

  const normasRelacionadas = PUBLIC_LEGAL_DOCUMENTS.filter((doc) =>
    (cfg.normasIds as readonly string[]).includes(doc.id)
  );

  const totalBens = BENS_TOMBADOS.length;
  const totalMunicipios = new Set(BENS_TOMBADOS.map((b) => b.municipio)).size;
  const totalDecretosPdf = BENS_TOMBADOS.filter((b) => DECRETOS_PDF[b.decreto.numero]).length;

  return (
    <div className="min-h-screen bg-brand-surface text-slate-800">
      {/* Cabeçalho Institucional do Departamento */}
      <header className="bg-brand-navy text-white py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold flex items-center gap-2">
            <Icon size={14} aria-hidden="true" />
            <span>SPC/SECMA · {cfg.badge}</span>
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white">
            {dept.code} — {dept.name}
          </h1>
          <p className="mt-3 max-w-[65ch] text-sm sm:text-base text-slate-200 leading-relaxed">
            {dept.summary}
          </p>

          {/* Navegação Rápida entre os 3 Departamentos */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {DEPARTMENTS.map((d) => {
              const active = d.code === code;
              return (
                <Link
                  key={d.code}
                  to={`/${d.code.toLowerCase()}`}
                  aria-current={active ? 'page' : undefined}
                  className={`min-h-[38px] inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    active
                      ? 'bg-brand-gold text-brand-navy'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {d.code}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Indicadores de Acervo Público (para DPHAP) */}
        {code === 'DPHAP' && (
          <section aria-label="Indicadores do Patrimônio Material" className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl border border-[#E5DDD5] p-5 shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-brand-navy block">{totalBens}</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 block">Bens tombados (1979–1993)</span>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5DDD5] p-5 shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-brand-navy block">{totalMunicipios}</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 block">Municípios abrangidos</span>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5DDD5] p-5 shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-brand-sage-dark block">{totalDecretosPdf}</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 block">Decretos em PDF</span>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5DDD5] p-5 shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-brand-terracotta block">{MAPAS_HISTORICOS.length}</span>
              <span className="text-xs font-semibold text-slate-600 mt-1 block">Mapas e poligonais</span>
            </div>
          </section>
        )}

        {/* Grade Principal: Atribuições + Serviços do Departamento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-7 bg-white rounded-2xl border border-[#E5DDD5] p-6 shadow-sm space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
                Competências Regimentais
              </p>
              <h2 className="font-serif text-xl sm:text-2xl font-medium text-brand-navy mt-1">
                Atribuições do {dept.code}
              </h2>
            </div>

            <ul className="space-y-2.5">
              {cfg.atribuicoes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-brand-surface border border-[#E5DDD5] text-sm text-slate-700 leading-relaxed"
                >
                  <CheckCircle2 size={17} className="text-brand-sage-dark shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {code === 'DPHAP' && (
              <div className="pt-2 flex flex-wrap gap-2.5">
                <Link
                  to="/bens-tombados"
                  className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-blue transition-colors"
                >
                  <Landmark size={15} aria-hidden="true" />
                  <span>Livro do Tombo ({totalBens} bens)</span>
                </Link>
                <Link
                  to="/mapa"
                  className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-surface text-brand-navy border border-[#E5DDD5] text-xs font-bold hover:border-brand-navy transition-colors"
                >
                  <Compass size={15} aria-hidden="true" />
                  <span>Cartografia e Poligonais</span>
                </Link>
              </div>
            )}
          </section>

          <section className="lg:col-span-5 bg-white rounded-2xl border border-[#E5DDD5] p-6 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
                  Atendimento ao Cidadão
                </p>
                <h2 className="font-serif text-xl font-medium text-brand-navy mt-1">
                  Serviços do {dept.code}
                </h2>
              </div>

              <div className="space-y-2.5">
                {cfg.servicos.map((srv) => (
                  <div key={srv.titulo} className="p-4 rounded-xl bg-brand-surface border border-[#E5DDD5] space-y-1">
                    <h3 className="text-sm font-bold text-brand-navy">{srv.titulo}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{srv.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                to="/servicos"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-blue text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={15} aria-hidden="true" />
                <span>Abrir Assistente de Requerimento</span>
              </Link>
              {code === 'DPHAP' && (
                <Link
                  to="/denuncia"
                  className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-brand-red-dark border border-red-200 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={15} aria-hidden="true" />
                  <span>Comunicar Obra Irregular</span>
                </Link>
              )}
            </div>
          </section>
        </div>

        {/* Seção Específica DPHAP: Cartilha e Infográfico de Engenhos Publicitários */}
        {code === 'DPHAP' && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue-dark text-xs font-black uppercase tracking-wider">
                Orientação Técnica Oficial · DPHAP
              </span>
              <h2 className="text-2xl font-black text-brand-navy">
                Diretrizes para Engenhos Publicitários no Centro Histórico
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                A instalação de placas, letreiros, toldos e engenhos de propaganda em imóveis situados em poligonal de preservação estadual deve respeitar as dimensões, materiais e posições regulamentados pela SPC para preservar a leitura arquitetônica das fachadas, cantarias e azulejos coloniais.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="/documentos/legislacao/diretrizes-dphap-engenhos-publicitarios.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-navy text-white text-xs font-black uppercase tracking-wider hover:bg-brand-navy/90 transition"
                >
                  <Download size={15} aria-hidden="true" />
                  <span>Baixar Cartilha Completa (PDF)</span>
                </a>
                <a
                  href="/imagens/infografico_engenhos.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-brand-navy border border-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition"
                >
                  <span>Ampliar Infográfico (JPG)</span>
                </a>
              </div>
            </div>
            <div className="lg:col-span-6">
              <a
                href="/imagens/infografico_engenhos.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition"
              >
                <img
                  src="/imagens/infografico_engenhos.jpg"
                  alt="Infográfico ilustrativo das diretrizes técnicas da SPC/DPHAP para instalação de engenhos publicitários em fachadas históricas"
                  loading="lazy"
                  className="w-full h-auto max-h-80 object-cover object-top"
                />
              </a>
            </div>
          </section>
        )}

        {/* Seção Específica DPI: Os 4 Livros de Registro do Patrimônio Imaterial */}
        {code === 'DPI' && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-brand-terracotta">
                Metodologia de Salvaguarda
              </span>
              <h2 className="text-2xl font-black text-brand-navy mt-0.5">
                Categorias de Registro do Patrimônio Imaterial
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Em consonância com o art. 216 da Constituição Federal e o Decreto nº 3.551/2000, o reconhecimento de bens culturais de natureza imaterial organiza-se em quatro categorias de registro:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LIVROS_REGISTRO_IMATERIAL.map((livro) => (
                <div key={livro.titulo} className="p-5 rounded-2xl bg-[#FAF8F5] border border-slate-200 space-y-1.5">
                  <h3 className="text-base font-black text-brand-navy flex items-center gap-2">
                    <BookOpen size={16} className="text-brand-terracotta" aria-hidden="true" />
                    <span>{livro.titulo}</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">{livro.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Base Normativa Relacionada ao Departamento */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-brand-terracotta">
                Base Legal Verificada
              </span>
              <h2 className="text-xl md:text-2xl font-black text-brand-navy">
                Normas e Legislação Aplicáveis ao {dept.code}
              </h2>
            </div>
            <Link
              to="/legislacao"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy underline hover:text-brand-terracotta"
            >
              <Gavel size={14} aria-hidden="true" />
              <span>Ver todas as {PUBLIC_LEGAL_DOCUMENTS.length} normas na biblioteca</span>
            </Link>
          </div>

          <div className="divide-y divide-slate-200 border-t border-slate-200">
            {normasRelacionadas.map((norma) => (
              <div key={norma.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-brand-navy/10 text-brand-navy text-[10px] font-black uppercase">
                      {norma.scope} · {norma.category}
                    </span>
                    {norma.officialPublication && (
                      <span className="text-[11px] text-slate-500">{norma.officialPublication}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-brand-navy">{norma.title}</h3>
                  <p className="text-xs text-slate-600">{norma.description}</p>
                </div>
                <a
                  href={norma.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-brand-navy hover:text-white text-xs font-bold text-brand-navy transition"
                >
                  <FileText size={13} aria-hidden="true" />
                  <span>Abrir norma ({norma.format})</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Rodapé de Atendimento Presencial e Eletrônico do Departamento */}
        <section className="bg-brand-navy text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E9B44C]">
              Atendimento Oficial · {dept.code}/SPC
            </span>
            <h2 className="text-xl font-black text-white">
              Fale com a equipe técnica ou protocole na sede
            </h2>
            <p className="text-sm text-slate-200 flex items-center gap-2">
              <MapPin size={15} className="text-[#E9B44C] shrink-0" aria-hidden="true" />
              <span>{SITE_CONTACT.buildingName} — {SITE_CONTACT.addressLine}, {SITE_CONTACT.city}</span>
            </p>
            <p className="text-sm text-slate-200 flex items-center gap-2">
              <Mail size={15} className="text-[#E9B44C] shrink-0" aria-hidden="true" />
              <a href={`mailto:${SITE_CONTACT.email}?subject=Atendimento%20${dept.code}/SPC`} className="underline font-bold hover:text-[#E9B44C]">
                {SITE_CONTACT.email}
              </a>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/servicos"
              className="px-5 py-3 rounded-xl bg-white text-brand-navy text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition flex items-center gap-2"
            >
              <span>Protocolar Requerimento</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <Link
              to="/contato"
              className="px-5 py-3 rounded-xl border border-white/40 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition"
            >
              Todos os canais de contato
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DepartamentoOficialPage;

