import React from 'react';
import { Link } from 'react-router-dom';
import { OrigamiMenu } from '../components/ui/OrigamiMenu';
import { PUBLIC_LEGAL_DOCUMENTS } from '../data/publicLegalDocuments';
import { BENS_TOMBADOS, DECRETOS_PDF } from '../data/bensTombados';
import { MAPAS_HISTORICOS } from '../data/mapasHistoricos';
import { SITE_CONTACT, DEPARTMENTS } from '../data/siteContact';
import { usePageTitle } from '../hooks/usePageTitle';

const SERVICOS = [
  { label: 'Autorização para obra em imóvel tombado', dept: 'DPHAP' },
  { label: 'Certidão de limites de poligonal e tombamento', dept: 'DPHAP' },
  { label: 'Autorização para engenhos publicitários', dept: 'DPHAP' },
  { label: 'Registro de patrimônio imaterial', dept: 'DPI' },
  { label: 'Consulta técnica prévia', dept: 'DPE' }
];

const ETAPAS_OBRA = [
  'Protocolo do requerimento com formulário e documentos.',
  'Vistoria técnica no imóvel pela equipe da SPC.',
  'Parecer técnico e certificado de autorização.'
];

const linkClass = 'font-bold text-brand-navy underline underline-offset-2 hover:text-brand-terracotta';

export const HomePage: React.FC = () => {
  usePageTitle('Início');
  const featuredNorms = PUBLIC_LEGAL_DOCUMENTS.filter((d) => d.featured).slice(0, 3);
  const totalBens = BENS_TOMBADOS.length;
  const totalMunicipios = new Set(BENS_TOMBADOS.map((b) => b.municipio)).size;
  const totalPdf = BENS_TOMBADOS.filter((b) => DECRETOS_PDF[b.decreto.numero]).length;

  return (
    <div className="bg-[#FAF8F5] text-slate-800 min-h-screen">
      <OrigamiMenu />

      <section className="border-y border-brand-sand/30 bg-[#071D33] text-white" aria-label="Números">
        <dl className="max-w-[1240px] mx-auto px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <dd className="text-2xl font-black">{totalBens}</dd>
            <dt className="text-xs text-slate-300">bens tombados</dt>
          </div>
          <div>
            <dd className="text-2xl font-black">{totalMunicipios}</dd>
            <dt className="text-xs text-slate-300">municípios com bens tombados</dt>
          </div>
          <div>
            <dd className="text-2xl font-black">{totalPdf}</dd>
            <dt className="text-xs text-slate-300">decretos digitalizados</dt>
          </div>
          <div>
            <dd className="text-2xl font-black">{MAPAS_HISTORICOS.length}</dd>
            <dt className="text-xs text-slate-300">
              <Link to="/mapa" className="underline hover:text-[#E9B44C]">
                plantas históricas interativas
              </Link>
            </dt>
          </div>
        </dl>
      </section>

      {/* Vitrine Visual do Acervo, Cartografia e Atendimento */}
      <section className="max-w-[1240px] mx-auto px-6 pt-12 pb-4" aria-labelledby="destaques-titulo">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-brand-terracotta">
              Acervo Público & Território
            </span>
            <h2 id="destaques-titulo" className="text-2xl font-bold text-brand-navy mt-0.5">
              Consultas em destaque no portal
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/bens-tombados"
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col"
          >
            <div className="h-44 overflow-hidden bg-brand-navy relative">
              <img
                src="/cena-fotos/casarao.webp"
                alt="Casarões coloniais no Centro Histórico de São Luís"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 rounded-full bg-brand-navy/90 text-white px-3 py-1 text-[11px] font-bold">
                {totalBens} inscrições · {totalMunicipios} municípios
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-terracotta transition-colors">
                  Livro do Tombo Estadual (1979–1993)
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Consulte a relação completa dos bens tombados pelo Estado do Maranhão, filtre por município, baixe os decretos em PDF ou exporte em CSV.
                </p>
              </div>
              <span className="text-xs font-bold text-brand-navy underline">
                Abrir catálogo de bens tombados →
              </span>
            </div>
          </Link>

          <Link
            to="/mapa"
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col"
          >
            <div className="h-44 overflow-hidden bg-brand-navy relative">
              <img
                src="/cena-fotos/planta-1912-mini.webp"
                alt="Recorte da Planta da Cidade de São Luís de 1912"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 rounded-full bg-brand-terracotta text-white px-3 py-1 text-[11px] font-bold">
                Séculos XVII a XX · {MAPAS_HISTORICOS.length} pranchas
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-terracotta transition-colors">
                  Cartografia Histórica Interativa
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Explore a gravura de 1698 (Pe. Andrea da Silva) e a Planta de 1912 (Ribeiro do Amaral) com zoom e marcos clicáveis vinculados ao Livro do Tombo.
                </p>
              </div>
              <span className="text-xs font-bold text-brand-navy underline">
                Explorar mapas e plantas históricas →
              </span>
            </div>
          </Link>

          <Link
            to="/servicos"
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col"
          >
            <div className="h-44 overflow-hidden bg-brand-navy relative">
              <img
                src="/cena-fotos/azulejos.webp"
                alt="Detalhe de azulejaria histórica em São Luís"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 rounded-full bg-brand-sage-dark text-white px-3 py-1 text-[11px] font-bold">
                DPHAP · DPI · DPE
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-terracotta transition-colors">
                  Autorização de Obras e Serviços
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Veja a documentação obrigatória para reformas, certidões de poligonal, engenhos publicitários e gere a folha formal de requerimento para protocolo.
                </p>
              </div>
              <span className="text-xs font-bold text-brand-navy underline">
                Acessar Carta de Serviços e Requerimento →
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-6 py-12" aria-labelledby="servicos-titulo">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="servicos-titulo" className="text-2xl font-bold text-brand-navy">Serviços</h2>
          <Link to="/servicos" className={linkClass}>Ver todos os serviços</Link>
        </div>
        <ul className="mt-4 border-t border-slate-200">
          {SERVICOS.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-4 border-b border-slate-200 py-3 text-sm">
              <Link to="/servicos" className="font-semibold text-brand-navy hover:underline">{s.label}</Link>
              <span className="text-xs text-slate-600">{s.dept}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-slate-700">
          Departamentos:{' '}
          {DEPARTMENTS.map((d, i) => (
            <React.Fragment key={d.code}>
              {i > 0 && ', '}
              <Link to={`/${d.code.toLowerCase()}`} className={linkClass}>{d.code}</Link>
            </React.Fragment>
          ))}
          .
        </p>
      </section>

      <section className="bg-white border-y border-slate-200 py-12" aria-labelledby="obras-titulo">
        <div className="max-w-[1240px] mx-auto px-6 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 id="obras-titulo" className="text-2xl font-bold text-brand-navy">Obras em bens tombados</h2>
            <p className="mt-3 text-sm text-slate-700 max-w-xl">
              Reforma, pintura de fachada, troca de telhado ou instalação de letreiro em bem tombado, ou em área protegida, precisa de autorização prévia da SPC.
            </p>
            <p className="mt-4 text-sm">
              <Link to="/bens-tombados" className={linkClass}>Consultar bens tombados</Link>
              {' · '}
              <Link to="/mapa" className={linkClass}>Explorar plantas históricas (1698–1912)</Link>
              {' · '}
              <Link to="/servicos" className={linkClass}>Montar requerimento</Link>
            </p>
          </div>
          <ol className="space-y-2 text-sm text-slate-700 list-decimal pl-5">
            {ETAPAS_OBRA.map((e) => (<li key={e}>{e}</li>))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="normas-titulo" className="max-w-[1240px] mx-auto px-6 py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="normas-titulo" className="text-2xl font-bold text-brand-navy">Legislação</h2>
          <Link to="/legislacao" className={linkClass}>Ver todas as normas</Link>
        </div>
        <ul className="mt-4 border-t border-slate-200">
          {featuredNorms.map((norm) => (
            <li key={norm.id} className="flex items-center justify-between gap-4 border-b border-slate-200 py-3 text-sm">
              <Link to={`/legislacao?q=${encodeURIComponent(norm.title.split(',')[0])}`} className="font-semibold text-brand-navy hover:underline">
                {norm.title}
              </Link>
              <span className="flex-shrink-0 text-xs text-slate-600">{norm.category}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-brand-navy text-white py-10" aria-labelledby="contato-titulo">
        <div className="max-w-[1240px] mx-auto px-6 flex flex-wrap items-center justify-between gap-6">
          <div className="text-sm">
            <h2 id="contato-titulo" className="text-lg font-bold">Contato</h2>
            <p className="mt-2 text-slate-200">
              {SITE_CONTACT.buildingName}, {SITE_CONTACT.addressLine}, {SITE_CONTACT.city}
            </p>
            <p className="text-slate-200">
              <a className="underline" href={`mailto:${SITE_CONTACT.email}`}>{SITE_CONTACT.email}</a>
            </p>
          </div>
          <div className="flex gap-3 text-sm font-bold">
            <Link to="/contato" className="rounded bg-white px-4 py-2 text-brand-navy">Contato</Link>
            <Link to="/denuncia" className="rounded border border-white px-4 py-2">Denúncia</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
