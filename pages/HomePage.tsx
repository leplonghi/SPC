import React from 'react';
import { Link } from 'react-router-dom';
import { OrigamiMenu } from '../components/ui/OrigamiMenu';
import { PanZoomImage, type PanZoomPoint } from '../components/ui/PanZoomImage';
import { PUBLIC_LEGAL_DOCUMENTS } from '../data/publicLegalDocuments';
import { BENS_TOMBADOS, DECRETOS_PDF } from '../data/bensTombados';
import { SITE_CONTACT, DEPARTMENTS } from '../data/siteContact';
import { usePageTitle } from '../hooks/usePageTitle';

/** Pontos lidos diretamente na planta de 1912 (posição aproximada em fração da imagem). */
const PLANTA_PONTOS: PanZoomPoint[] = [
  { id: 'governo', label: 'Palacio do Governo', x: 0.238, y: 0.634 },
  { id: 'se', label: 'Igd da Sé', x: 0.316, y: 0.576 },
  { id: 'theatro', label: 'Theatro', x: 0.35, y: 0.547 },
  { id: 'carmo', label: 'Ig. do Carmo', x: 0.375, y: 0.579 },
  { id: 'mercado', label: 'Mercado', x: 0.427, y: 0.599 },
  { id: 'alfandega', label: 'Alfandêga', x: 0.338, y: 0.653 },
  { id: 'merces', label: 'Ig. de N.S. das Mercês', x: 0.385, y: 0.705 },
  { id: 'cemiterio', label: 'Cemiterio Municipal', x: 0.679, y: 0.602 }
];

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
        <dl className="max-w-[1240px] mx-auto px-6 py-4 grid grid-cols-3 gap-4 text-center">
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
        </dl>
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
              <Link to="/servicos" className={linkClass}>Montar requerimento</Link>
            </p>
          </div>
          <ol className="space-y-2 text-sm text-slate-700 list-decimal pl-5">
            {ETAPAS_OBRA.map((e) => (<li key={e}>{e}</li>))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="planta-titulo" className="bg-brand-navy text-white py-12">
        <div className="mx-auto max-w-[1240px] px-6">
          <h2 id="planta-titulo" className="text-2xl font-bold text-white">Planta da cidade de São Luís, 1912</h2>
          <p className="mt-2 mb-6 max-w-2xl text-sm text-slate-200">
            Planta de Justo Jansen Ferreira. Use o zoom para ver edifícios e logradouros da época.
          </p>
          <PanZoomImage
            src="/cena-fotos/planta-1912-mini.webp"
            srcFull="/cena-fotos/planta-1912.webp"
            width={1200}
            height={896}
            alt="Planta da Cidade de S. Luiz, Capital do Estado do Maranhão, de 1912, adaptada por Justo Jansen Ferreira"
            points={PLANTA_PONTOS}
          />
          <p className="mt-3 text-xs text-slate-300">
            Nomes na grafia original do mapa. Fonte: Biblioteca Nacional (cota ARC.10,05,18).
          </p>
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
