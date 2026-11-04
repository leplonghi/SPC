import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  FileText,
  Info,
  Download,
  ArrowDown,
  X,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Landmark,
  Calendar,
  BookOpen,
  ArrowUpDown,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { AzulejoBand } from '../components/ui/Reveal';
import { StatTile } from '../components/dataviz/StatTile';
import { ChartCard } from '../components/dataviz/ChartCard';
import { BarList } from '../components/dataviz/BarList';
import { ColumnChart } from '../components/dataviz/ColumnChart';
import { ShareBar } from '../components/dataviz/ShareBar';
import { MunicipiosMap, SEDE_MUNICIPIO } from '../components/dataviz/MunicipiosMap';
import { HUE } from '../components/dataviz/tokens';
import {
  BENS_TOMBADOS,
  BemTombado,
  DECRETOS_PDF,
  FAIXAS_DECRETO,
  TIPOS_BEM,
  TIPO_POR_INSCRICAO,
  anoDoDecreto
} from '../data/bensTombados';
import { SITE_CONTACT } from '../data/siteContact';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const fmtData = (iso: string | null) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const MUNICIPIOS = Array.from(new Set(BENS_TOMBADOS.map((b) => b.municipio))).sort((a, b) => a.localeCompare(b, 'pt-BR'));

/** Cor da lateral da ficha por período do decreto. */
const bordaPeriodo = (b: BemTombado) => {
  const a = anoDoDecreto(b);
  if (a === null) return 'border-l-slate-300';
  return a <= 1981
    ? 'border-l-brand-blue'
    : a <= 1988
    ? 'border-l-brand-sage'
    : a === 1990
    ? 'border-l-brand-terracotta'
    : 'border-l-brand-red';
};

const periodoBadge = (b: BemTombado) => {
  const a = anoDoDecreto(b);
  if (a === null) return { bg: 'bg-slate-100 text-slate-700', label: 'Ano a definir' };
  if (a <= 1981) return { bg: 'bg-brand-blue/10 text-brand-blue-dark', label: '1979–1981' };
  if (a <= 1988) return { bg: 'bg-brand-sage/10 text-brand-sage-dark', label: '1982–1988' };
  if (a === 1990) return { bg: 'bg-brand-terracotta/10 text-brand-terracotta', label: '1990' };
  return { bg: 'bg-brand-red/10 text-brand-red-dark', label: '1991–1993' };
};

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-xl font-extrabold text-brand-navy mb-3">{children}</h2>
);

type FiltroPdf = '' | 'com' | 'sem';
type Pular = 'municipio' | 'tipo' | 'periodo' | 'pdf' | null;
type OrdenacaoOpcao = 'inscricao-asc' | 'inscricao-desc' | 'nome-asc' | 'nome-desc' | 'ano-asc' | 'ano-desc';

const ANOS = Array.from({ length: 1993 - 1979 + 1 }, (_, k) => 1979 + k);
const ordemMunicipios = Array.from(
  BENS_TOMBADOS.reduce((m, b) => m.set(b.municipio, (m.get(b.municipio) ?? 0) + 1), new Map<string, number>())
).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR')).map(([n]) => n);

const BensTombadosPage: React.FC = () => {
  usePageTitle('Bens tombados');
  const [busca, setBusca] = useState('');
  // A Home leva para cá com ?municipio=Nome ou ?ano=1990; só vale se existir nos dados
  const [params] = useSearchParams();
  const municipioInicial = params.get('municipio') ?? '';
  const anoInicial = Number(params.get('ano'));
  const [municipio, setMunicipio] = useState(MUNICIPIOS.includes(municipioInicial) ? municipioInicial : '');
  const [tipo, setTipo] = useState('');
  const [faixa, setFaixa] = useState('');
  const [ano, setAno] = useState<number | null>(ANOS.includes(anoInicial) ? anoInicial : null);
  const [pdf, setPdf] = useState<FiltroPdf>('');

  // Novos controles de UI/UX
  const [viewMode, setViewMode] = useState<'cards' | 'tabela'>('cards');
  const [ordenacao, setOrdenacao] = useState<OrdenacaoOpcao>('inscricao-asc');
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [mostrarGuiaDidatico, setMostrarGuiaDidatico] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copiarCitacao = (bem: BemTombado) => {
    const dataDecreto = fmtData(bem.decreto.data);
    const textoDecreto = `Decreto Estadual nº ${bem.decreto.numero}${dataDecreto ? ` de ${dataDecreto}` : bem.decreto.ano ? ` (${bem.decreto.ano})` : ''}`;
    const folha = bem.livro.folha ? `Livro do Tombo Histórico, folha ${bem.livro.folha}` : 'Livro do Tombo Histórico';
    const local = bem.local ? `, ${bem.local}` : '';
    const citacao = `${bem.nome} — ${bem.municipio}${local}. Inscrição nº ${bem.id}, ${folha}. ${textoDecreto}. DPHAP/SPC.`;

    navigator.clipboard.writeText(citacao);
    setCopiadoId(bem.id);
    setTimeout(() => setCopiadoId(null), 2500);
  };

  const temPdf = (b: BemTombado) => Boolean(DECRETOS_PDF[b.decreto.numero]);

  /** Aplica todos os filtros, menos o da dimensão "pular": assim cada gráfico mostra as opções que ainda existem ao redor da escolha dele. */
  const passa = (b: BemTombado, pular: Pular = null) => {
    if (pular !== 'municipio' && municipio && b.municipio !== municipio) return false;
    if (pular !== 'tipo' && tipo && TIPO_POR_INSCRICAO[b.id] !== tipo) return false;
    if (pular !== 'periodo') {
      const a = anoDoDecreto(b);
      if (ano !== null && a !== ano) return false;
      const f = FAIXAS_DECRETO.find((x) => x.id === faixa);
      if (f && (a === null || a < f.de || a > f.ate)) return false;
    }
    if (pular !== 'pdf') {
      if (pdf === 'com' && !temPdf(b)) return false;
      if (pdf === 'sem' && temPdf(b)) return false;
    }
    const q = norm(busca.trim());
    if (q && !norm(`${b.nome} ${b.municipio} ${b.local ?? ''} ${b.decreto.numero} ${b.id}`).includes(q)) return false;
    return true;
  };

  const resultados = useMemo(
    () => BENS_TOMBADOS.filter((b) => passa(b)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busca, municipio, tipo, faixa, ano, pdf]
  );

  const resultadosOrdenados = useMemo(() => {
    const lista = [...resultados];
    switch (ordenacao) {
      case 'inscricao-desc':
        return lista.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
      case 'nome-asc':
        return lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      case 'nome-desc':
        return lista.sort((a, b) => b.nome.localeCompare(a.nome, 'pt-BR'));
      case 'ano-asc':
        return lista.sort((a, b) => (anoDoDecreto(a) ?? 9999) - (anoDoDecreto(b) ?? 9999) || a.id.localeCompare(b.id, undefined, { numeric: true }));
      case 'ano-desc':
        return lista.sort((a, b) => (anoDoDecreto(b) ?? 0) - (anoDoDecreto(a) ?? 0) || a.id.localeCompare(b.id, undefined, { numeric: true }));
      case 'inscricao-asc':
      default:
        return lista.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    }
  }, [resultados, ordenacao]);

  const g = useMemo(() => {
    const base = (p: Pular) => BENS_TOMBADOS.filter((b) => passa(b, p));
    const porMun = base('municipio');
    const porTipo = base('tipo');
    const porAno = base('periodo');
    const porPdf = base('pdf');
    return {
      municipios: ordemMunicipios.map((m) => ({ key: m, label: m, value: porMun.filter((b) => b.municipio === m).length })),
      tipos: TIPOS_BEM.map((t) => ({ key: t, label: t, value: porTipo.filter((b) => TIPO_POR_INSCRICAO[b.id] === t).length })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR')),
      anos: ANOS.map((y) => ({ key: String(y), label: String(y), short: `’${String(y).slice(2)}`, parts: [{ id: 'bens', value: porAno.filter((b) => anoDoDecreto(b) === y).length }] })),
      semAno: porAno.filter((b) => anoDoDecreto(b) === null).length,
      com: porPdf.filter(temPdf).length,
      sem: porPdf.filter((b) => !temPdf(b)).length
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, municipio, tipo, faixa, ano, pdf]);

  const totalSL = BENS_TOMBADOS.filter((b) => b.municipio === 'São Luís').length;
  const totalPdf = BENS_TOMBADOS.filter(temPdf).length;
  const faixaSel = FAIXAS_DECRETO.find((x) => x.id === faixa);
  const anosSelecionados = ano !== null ? [String(ano)] : faixaSel ? ANOS.filter((y) => y >= faixaSel.de && y <= faixaSel.ate).map(String) : [];
  const periodoLabel = ano !== null ? String(ano) : faixaSel ? faixaSel.label : null;

  const chips: { label: string; limpar: () => void }[] = [];
  if (busca.trim()) chips.push({ label: `Busca: ${busca.trim()}`, limpar: () => setBusca('') });
  if (municipio) chips.push({ label: municipio, limpar: () => setMunicipio('') });
  if (tipo) chips.push({ label: tipo, limpar: () => setTipo('') });
  if (periodoLabel) chips.push({ label: `Decreto de ${periodoLabel}`, limpar: () => { setAno(null); setFaixa(''); } });
  if (pdf) chips.push({ label: pdf === 'com' ? 'Com decreto digitalizado' : 'Decreto ainda não localizado', limpar: () => setPdf('') });
  const limparTudo = () => { setBusca(''); setMunicipio(''); setTipo(''); setFaixa(''); setAno(null); setPdf(''); };

  const contar = (fn: (b: BemTombado) => boolean) => BENS_TOMBADOS.filter(fn).length;
  const campo = 'w-full rounded-2xl border-2 border-slate-200 bg-white py-3 px-4 text-sm font-medium text-brand-dark focus:border-brand-blue focus:outline-none';
  const rotulo = 'block text-xs font-bold uppercase tracking-widest text-slate-600 mb-1';

  const pontos = MUNICIPIOS.filter((m) => SEDE_MUNICIPIO[m]).map((m) => ({
    nome: m,
    lat: SEDE_MUNICIPIO[m][0],
    lng: SEDE_MUNICIPIO[m][1],
    n: g.municipios.find((x) => x.key === m)?.value ?? 0
  }));

  return (
    <>
      {/* Entrada em formato de painel */}
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <div aria-hidden="true" className="deco absolute -right-24 -top-24 h-[34rem] w-[34rem] glow-blue" />
        <div aria-hidden="true" className="deco absolute -left-32 bottom-0 h-[26rem] w-[26rem] glow-terracotta opacity-60" />
        <div className="relative mx-auto max-w-[1200px] px-6 pb-28 pt-12 md:pb-32 md:pt-16">

          <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h1 className="font-display text-3xl font-black leading-tight md:text-5xl">Bens tombados</h1>
              <p className="mt-3 max-w-xl text-base text-slate-200">
                Bens tombados pelo Estado do Maranhão, com decreto e dados do Livro do Tombo. Os gráficos funcionam como filtro.
              </p>
              <div className="mt-6 max-w-xl">
                <label htmlFor="bens-busca" className="sr-only">Nome, rua ou decreto</label>
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                  <input
                    id="bens-busca"
                    type="search"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Nome, rua ou decreto (ex.: 7.090)"
                    className="w-full rounded-2xl bg-white py-4 pl-11 pr-4 text-sm font-semibold text-brand-dark shadow-2xl placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-[#F3A99C]/50"
                  />
                </div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="col-span-2">
                <dt className="sr-only">Total</dt>
                <dd><StatTile size="hero" label="Bens tombados" value={BENS_TOMBADOS.length} hint={`Decretos de 1979 a 1993. Não há tombamentos estaduais depois de 1993.`} /></dd>
              </div>
              <div><dt className="sr-only">Municípios</dt><dd><StatTile label="Municípios" value={MUNICIPIOS.length} /></dd></div>
              <div><dt className="sr-only">Decretos digitalizados</dt><dd><StatTile label="Decretos digitalizados" value={totalPdf} hint={`de ${BENS_TOMBADOS.length}`} /></dd></div>
            </dl>
          </div>
        </div>
        <AzulejoBand />
      </section>

      {/* Painel */}
      <div className="relative z-10 mx-auto -mt-20 max-w-[1200px] px-4 sm:px-6 md:-mt-24">
        <div className="grid gap-5 lg:grid-cols-12">
          <ChartCard
            className="lg:col-span-7 lg:row-span-2"
            title="Onde estão os bens"
            subtitle={`${totalSL} dos ${BENS_TOMBADOS.length} bens (${Math.round((totalSL / BENS_TOMBADOS.length) * 100)}%) ficam em São Luís. Clique em um município para ver só os bens dele.`}
            activeLabel={municipio || null}
            onClear={() => setMunicipio('')}
            table={{ head: ['Município', 'Bens'], rows: g.municipios.map((m) => [m.label, m.value]) }}
            footer="Cada círculo marca a sede do município e não a localização exata dos bens. Mapa base: OpenStreetMap."
            source="Relação de Bens Tombados (SPC/DPHAP), conferida com o texto dos decretos de tombamento e com o Livro do Tombo."
          >
            <div className="grid h-full min-w-0 gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
              <MunicipiosMap height="fill" points={pontos} selected={municipio || null} onSelect={(m) => setMunicipio(m ?? '')} />
              <BarList
                items={g.municipios}
                selected={municipio || null}
                onSelect={(k) => setMunicipio(k ?? '')}
                unit="bens"
                ariaLabel="Bens tombados por município"
                max={Math.max(...ordemMunicipios.map((m) => BENS_TOMBADOS.filter((b) => b.municipio === m).length))}
              />
            </div>
          </ChartCard>

          <ChartCard
            className="lg:col-span-5"
            title="Quando o Estado tombou"
            subtitle="Bens por ano do decreto. Clique em uma coluna para filtrar o ano."
            activeLabel={periodoLabel}
            onClear={() => { setAno(null); setFaixa(''); }}
            table={{ head: ['Ano do decreto', 'Bens'], rows: g.anos.map((c) => [c.label, c.parts[0].value]) }}
            source="Ano do decreto de tombamento, conforme o texto do decreto. Em três bens (inscrições 017, 031 e 055) o número do decreto consta na Relação, mas a data ainda está em conferência, e o ano usado é o da Relação."
            footer={<>Não há tombamentos estaduais depois de 1993.{g.semAno > 0 && ` ${g.semAno} ${g.semAno === 1 ? 'bem está' : 'bens estão'} com o ano a confirmar e não aparece${g.semAno === 1 ? '' : 'm'} no gráfico.`}</>}
          >
            <ColumnChart
              cols={g.anos}
              selected={anosSelecionados}
              onSelect={(k) => { const y = Number(k); setFaixa(''); setAno(ano === y ? null : y); }}
              unit="bens"
              ariaLabel="Bens tombados por ano do decreto"
              emptyNote="Nenhum tombamento neste ano"
              height={250}
              compactLabels
            />
          </ChartCard>

          <ChartCard
            className="lg:col-span-5"
            title="Decretos digitalizados"
            subtitle="Quantos bens têm cópia do decreto disponível neste portal. As demais cópias serão incluídas à medida que forem localizadas pela SPC."
            activeLabel={pdf ? (pdf === 'com' ? 'Com decreto' : 'Sem decreto') : null}
            onClear={() => setPdf('')}
            table={{ head: ['Situação', 'Bens'], rows: [['Decreto digitalizado', g.com], ['Decreto ainda não localizado', g.sem]] }}
            source="Arquivo de decretos da SPC; só entram cópias que foram lidas antes da publicação."
          >
            <ShareBar
              parts={[
                { id: 'com', label: 'Decreto digitalizado', value: g.com, color: HUE },
                { id: 'sem', label: 'Ainda não localizado', value: g.sem, color: '#8996A3' }
              ]}
              selected={pdf || null}
              onSelect={(id) => setPdf((id as FiltroPdf) ?? '')}
              unit="bens"
              ariaLabel="Situação do decreto digitalizado"
            />
            <button
              type="button"
              onClick={() => { setPdf(pdf === 'com' ? '' : 'com'); document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-sage-dark px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/30"
            >
              <Download size={14} aria-hidden="true" /> {pdf === 'com' ? 'Mostrar todos os bens' : 'Ver só os bens com decreto digitalizado'}
            </button>
          </ChartCard>

        </div>

        {/* Filtros por lista: a mesma coisa que os gráficos, para quem prefere formulário */}
        <details className="mt-5 rounded-3xl border border-brand-sand bg-white p-4 md:p-5">
          <summary className="cursor-pointer text-sm font-bold text-brand-blue-dark">Filtrar por lista</summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="bens-municipio" className={rotulo}>Município</label>
              <select id="bens-municipio" value={municipio} onChange={(e) => setMunicipio(e.target.value)} className={campo}>
                <option value="">Todos ({MUNICIPIOS.length})</option>
                {MUNICIPIOS.map((m) => (<option key={m} value={m}>{m} ({contar((b) => b.municipio === m)})</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="bens-tipo" className={rotulo}>Tipo de bem</label>
              <select id="bens-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className={campo}>
                <option value="">Todos os tipos</option>
                {TIPOS_BEM.map((t) => (
                  <option key={t} value={t}>{t} ({contar((b) => TIPO_POR_INSCRICAO[b.id] === t)})</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="bens-faixa" className={rotulo}>Ano do decreto</label>
              <select id="bens-faixa" value={faixa} onChange={(e) => { setFaixa(e.target.value); setAno(null); }} className={campo}>
                <option value="">Todos os anos</option>
                {FAIXAS_DECRETO.map((f) => (
                  <option key={f.id} value={f.id}>{f.label} ({contar((b) => { const a = anoDoDecreto(b); return a !== null && a >= f.de && a <= f.ate; })})</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      </div>

      {/* Seção de Resultados Aprimorada: Fluida, Intuitiva e Didática */}
      <div id="resultados" className="mx-auto max-w-6xl scroll-mt-24 px-4 sm:px-6 pb-16 pt-10">

        {/* Barra de Filtro Rápido por Categoria / Tipo de Bem */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Landmark size={14} className="text-brand-blue" /> Categorias de Patrimônio:
            </span>
            {tipo && (
              <button
                type="button"
                onClick={() => setTipo('')}
                className="text-xs font-semibold text-brand-red-dark hover:underline"
              >
                Limpar categoria
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => setTipo('')}
              className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                !tipo
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-navy/40 hover:bg-slate-50'
              }`}
            >
              Todos os tipos ({BENS_TOMBADOS.length})
            </button>
            {TIPOS_BEM.map((t) => {
              const totalCat = BENS_TOMBADOS.filter((b) => TIPO_POR_INSCRICAO[b.id] === t).length;
              const isSelected = tipo === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(isSelected ? '' : t)}
                  className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-blue hover:text-brand-navy hover:bg-slate-50'
                  }`}
                >
                  <span>{t}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {totalCat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Guia Didático Rápido (Retrátil) */}
        <div className="mb-6 rounded-2xl border border-brand-sand bg-brand-light/70 p-4 transition-all">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue-dark">
                <Sparkles size={16} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-brand-navy">Como entender os dados de tombamento estadual</h3>
                <p className="text-xs text-slate-600">Entenda os termos oficiais e o significado jurídico de cada registro.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMostrarGuiaDidatico(!mostrarGuiaDidatico)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-brand-navy hover:bg-slate-50 focus:outline-none"
            >
              {mostrarGuiaDidatico ? 'Ocultar guia' : 'Ver guia explicativo'}
              {mostrarGuiaDidatico ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {mostrarGuiaDidatico && (
            <div className="mt-4 grid gap-3 border-t border-slate-200/80 pt-4 sm:grid-cols-3 text-xs leading-relaxed text-slate-700">
              <div className="rounded-xl bg-white p-3 border border-slate-200/60">
                <span className="font-bold text-brand-navy block mb-1">📜 Decreto Estadual</span>
                Ato formal do Governador do Estado que estabelece o tombamento. Fixa a data jurídica em que a proteção entra em vigor no Maranhão.
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200/60">
                <span className="font-bold text-brand-navy block mb-1">📖 Livro do Tombo</span>
                Registro público histórico mantido pelo DPHAP. O número de folha identifica onde os limites e a memória do imóvel foram lavrados.
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200/60">
                <span className="font-bold text-brand-navy block mb-1">🛡️ Proteção & Obras</span>
                Qualquer projeto, reforma, intervenção ou pintura em bem tombado necessita de autorização prévia junto à SPC/DPHAP.
              </div>
            </div>
          )}
        </div>

        {/* Barra de Controles Sticky: Contagem, Ordenação e Modo de Visualização */}
        <div className="sticky top-[62px] z-20 mb-6 rounded-2xl border border-brand-sand bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Lado Esquerdo: Contagem de resultados e chips de filtro */}
            <div className="flex flex-wrap items-center gap-2">
              <div role="status" aria-live="polite" className="text-sm font-bold text-brand-navy mr-1">
                {resultados.length === 0 ? (
                  'Nenhum bem encontrado'
                ) : (
                  <>
                    <span>{resultados.length} {resultados.length === 1 ? 'bem tombado' : 'bens tombados'}</span>
                    <span className="ml-1.5 font-normal text-xs text-slate-500">
                      ({resultados.filter(temPdf).length} com decreto em PDF)
                    </span>
                  </>
                )}
              </div>

              {chips.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={c.limpar}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-bold text-brand-blue-dark hover:bg-brand-blue/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                  aria-label={`Remover filtro: ${c.label}`}
                >
                  <span className="max-w-[12rem] truncate">{c.label}</span>
                  <X size={12} aria-hidden="true" />
                </button>
              ))}

              {chips.length > 0 && (
                <button
                  type="button"
                  onClick={limparTudo}
                  className="text-xs font-bold uppercase tracking-wider text-brand-red-dark hover:underline ml-1"
                >
                  Limpar tudo
                </button>
              )}
            </div>

            {/* Lado Direito: Ordenação e Seletor de Modo (Cards vs Tabela) */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown size={14} className="text-slate-400" />
                <label htmlFor="bens-ordem" className="sr-only">Ordenar resultados</label>
                <select
                  id="bens-ordem"
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value as OrdenacaoOpcao)}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-navy focus:border-brand-blue focus:outline-none"
                >
                  <option value="inscricao-asc">Inscrição (001 a 070)</option>
                  <option value="inscricao-desc">Inscrição (070 a 001)</option>
                  <option value="nome-asc">Nome do bem (A – Z)</option>
                  <option value="nome-desc">Nome do bem (Z – A)</option>
                  <option value="ano-desc">Ano do decreto (recentes primeiro)</option>
                  <option value="ano-asc">Ano do decreto (antigos primeiro)</option>
                </select>
              </div>

              <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-white text-brand-navy shadow-xs'
                      : 'text-slate-600 hover:text-brand-navy'
                  }`}
                  aria-label="Visualização em cartões didáticos"
                >
                  <LayoutGrid size={13} />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('tabela')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                    viewMode === 'tabela'
                      ? 'bg-white text-brand-navy shadow-xs'
                      : 'text-slate-600 hover:text-brand-navy'
                  }`}
                  aria-label="Visualização em tabela técnica"
                >
                  <List size={13} />
                  <span className="hidden sm:inline">Tabela</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Resultados */}
        {resultadosOrdenados.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <Info size={20} />
              </span>
              <div>
                <p className="font-bold text-brand-navy text-base">Nenhum resultado encontrado para estes filtros.</p>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  Não encontrar um imóvel aqui não significa que ele não tenha proteção patrimonial. Ele pode estar dentro de um conjunto tombado (como o Centro Histórico de São Luís ou Alcântara), ou possuir proteção federal (IPHAN) ou municipal.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={limparTudo}
                    className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-brand-blue transition-colors"
                  >
                    Restaurar todos os bens
                  </button>
                  <a
                    className="text-xs font-bold text-brand-blue-dark underline"
                    href={`mailto:${SITE_CONTACT.email}?subject=Consulta%20de%20tombamento`}
                  >
                    Dúvidas sobre um imóvel? Escreva para a SPC ({SITE_CONTACT.email})
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          /* MODO CARDS DIDÁTICOS */
          <div className="space-y-3.5">
            {resultadosOrdenados.map((bem) => {
              const dataDecreto = fmtData(bem.decreto.data);
              const dataLivro = fmtData(bem.livro.data);
              const pdf = DECRETOS_PDF[bem.decreto.numero];
              const tipoBem = TIPO_POR_INSCRICAO[bem.id] ?? 'Patrimônio Edificado';
              const isExpanded = Boolean(expandidos[bem.id]);
              const pBadge = periodoBadge(bem);

              return (
                <article
                  key={bem.id}
                  className={`rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden border-l-4 ${bordaPeriodo(
                    bem
                  )}`}
                >
                  <div className="p-4 sm:p-5">
                    {/* Linha Superior: Tags e Metadados Rápidos */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-brand-navy px-2 py-0.5 text-xs font-mono font-bold text-white tracking-wide">
                          Inscrição #{bem.id}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-semibold text-brand-blue-dark">
                          <Landmark size={12} className="opacity-70" />
                          {tipoBem}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${pBadge.bg}`}>
                          <Calendar size={11} className="opacity-70" />
                          {pBadge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {pdf ? (
                          <a
                            href={pdf.url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-brand-sage-dark/40 bg-brand-sage-dark/10 px-2.5 py-1 text-xs font-bold text-brand-sage-dark hover:bg-brand-sage-dark hover:text-white transition-colors"
                            aria-label={`Baixar o decreto nº ${bem.decreto.numero} em PDF`}
                          >
                            <Download size={12} />
                            <span>PDF do Decreto</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                            <FileText size={11} /> Cópia física no acervo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nome do Bem */}
                    <h3 className="font-display text-base sm:text-lg font-bold text-brand-navy leading-snug">
                      {bem.nome}
                    </h3>

                    {/* Localização */}
                    <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 font-medium">
                      <MapPin size={14} className="text-brand-terracotta flex-shrink-0" />
                      <span>
                        <strong className="text-brand-dark">{bem.municipio}</strong>
                        {bem.local ? ` · ${bem.local}` : ''}
                      </span>
                    </p>

                    {/* Grade de Metadados Didáticos */}
                    <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-3 rounded-xl bg-brand-light/70 p-3 text-xs border border-slate-200/50">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Decreto Estadual
                        </span>
                        <span className="font-semibold text-brand-navy">
                          Nº {bem.decreto.numero}
                        </span>
                        <span className="block text-[11px] text-slate-600">
                          {dataDecreto ? `Data: ${dataDecreto}` : bem.decreto.ano ? `Ano: ${bem.decreto.ano}` : 'Data do ato'}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Livro do Tombo
                        </span>
                        <span className="font-semibold text-brand-navy">
                          Folha {bem.livro.folha}
                        </span>
                        <span className="block text-[11px] text-slate-600">
                          {dataLivro ? `Inscrito: ${dataLivro}` : 'Registro DPHAP'}
                        </span>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Diário Oficial
                        </span>
                        <span className="font-semibold text-brand-navy truncate block">
                          {bem.diario ?? 'Publicado em ato oficial'}
                        </span>
                        <span className="block text-[11px] text-slate-600">
                          Vigência plena no Maranhão
                        </span>
                      </div>
                    </div>

                    {/* Barra de Ações Inferior: Expandir e Copiar Citação */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleExpand(bem.id)}
                        className="inline-flex items-center gap-1.5 font-bold text-brand-blue-dark hover:text-brand-navy transition-colors py-1 focus:outline-none"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={14} /> Recolher ficha completa
                          </>
                        ) : (
                          <>
                            <ChevronDown size={14} /> Ver ficha completa e citação técnica
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => copiarCitacao(bem)}
                        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-brand-navy font-semibold px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors"
                        title="Copiar citação formatada para pesquisa ou processo administrativo"
                      >
                        {copiadoId === bem.id ? (
                          <>
                            <Check size={13} className="text-green-600" />
                            <span className="text-green-700 font-bold">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copiar citação</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Seção Expandida: Detalhes Didáticos e Legais */}
                    {isExpanded && (
                      <div className="mt-3.5 space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-700">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <span className="font-bold text-brand-navy block mb-1">📜 Detalhes do Ato Legal</span>
                            <ul className="space-y-1 list-disc pl-4 text-slate-600">
                              <li><strong>Decreto:</strong> Nº {bem.decreto.numero}</li>
                              <li><strong>Data de expedição:</strong> {dataDecreto ?? (bem.decreto.ano ? `Ano de ${bem.decreto.ano}` : 'Registrada no acervo')}</li>
                              <li><strong>Publicação no Diário Oficial:</strong> {bem.diario ?? 'Consta nos arquivos do DOE'}</li>
                            </ul>
                          </div>

                          <div>
                            <span className="font-bold text-brand-navy block mb-1">📖 Assentamento no Livro do Tombo</span>
                            <ul className="space-y-1 list-disc pl-4 text-slate-600">
                              <li><strong>Livro físico:</strong> Tombo Histórico e Artístico (DPHAP)</li>
                              <li><strong>Folha de registro:</strong> {bem.livro.folha}</li>
                              <li><strong>Data da inscrição:</strong> {dataLivro ?? 'Registrada no termo oficial'}</li>
                            </ul>
                          </div>
                        </div>

                        {pdf?.nota && (
                          <div className="rounded-lg bg-amber-50/80 p-2.5 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                            <strong>Nota sobre o documento:</strong> {pdf.nota}
                          </div>
                        )}

                        <div className="rounded-lg bg-white p-2.5 border border-slate-200 text-slate-600 flex items-start gap-2">
                          <ShieldCheck size={16} className="text-brand-sage-dark flex-shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <strong className="text-brand-navy">Proteção Jurídica:</strong> Este bem possui proteção permanente garantida pelo Estado do Maranhão (Lei Estadual nº 5.561/1992). Intervenções físicas, restaurações ou demolições no bem ou em seu entorno exigem consulta e autorização prévia da SPC.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* MODO TABELA TÉCNICA */
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-navy text-white font-bold tracking-wide">
                  <tr>
                    <th className="py-3 px-3.5 w-16">Insc.</th>
                    <th className="py-3 px-4">Nome do Bem & Localização</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3.5">Decreto</th>
                    <th className="py-3 px-3.5">Livro</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultadosOrdenados.map((bem) => {
                    const dataDecreto = fmtData(bem.decreto.data);
                    const pdf = DECRETOS_PDF[bem.decreto.numero];
                    const tipoBem = TIPO_POR_INSCRICAO[bem.id] ?? 'Patrimônio';

                    return (
                      <tr key={bem.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3.5 font-mono font-bold text-brand-navy whitespace-nowrap">
                          #{bem.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-brand-navy leading-snug">{bem.nome}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin size={11} className="text-brand-terracotta flex-shrink-0" />
                            <span>{bem.municipio}{bem.local ? ` · ${bem.local}` : ''}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-block rounded bg-brand-blue/10 px-2 py-0.5 text-[11px] font-semibold text-brand-blue-dark">
                            {tipoBem}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="font-semibold text-brand-navy">Nº {bem.decreto.numero}</div>
                          <div className="text-[11px] text-slate-500">
                            {dataDecreto ?? (bem.decreto.ano ? `Ano ${bem.decreto.ano}` : '—')}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-700">Fl. {bem.livro.folha}</div>
                          <div className="text-[11px] text-slate-500">
                            {fmtData(bem.livro.data) ?? 'DPHAP'}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => copiarCitacao(bem)}
                              className="rounded p-1.5 text-slate-500 hover:bg-slate-200/70 hover:text-brand-navy transition-colors"
                              title="Copiar citação técnica"
                              aria-label={`Copiar citação da inscrição ${bem.id}`}
                            >
                              {copiadoId === bem.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                            </button>
                            {pdf ? (
                              <a
                                href={pdf.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded bg-brand-sage-dark px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-navy transition-colors"
                                aria-label={`Baixar PDF do decreto nº ${bem.decreto.numero}`}
                              >
                                <Download size={11} /> PDF
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Físico</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Seção Explicativa e Rodapé Legal */}
        <section className="mt-14 space-y-3 text-slate-700 leading-relaxed border-t border-slate-200 pt-8">
          <H2>Como ler esta lista</H2>
          <ul className="list-disc space-y-2 pl-6 text-sm">
            <li>Ela cobre os tombamentos estaduais feitos de 1979 a 1993. A SPC informa que não há tombamentos estaduais posteriores a 1993.</li>
            <li>
              Estar aqui significa proteção estadual. Qualquer obra, reforma ou pintura em bem tombado, ou em seu entorno, precisa de autorização prévia. Veja como pedir em{' '}
              <Link className="font-bold text-brand-blue-dark underline" to="/servicos">Serviços</Link>.
            </li>
            <li>
              Nas fichas com o botão "PDF do Decreto", a SPC já tem o decreto digitalizado. As demais cópias são incluídas à medida que os arquivos físicos forem localizados no acervo do Estado. Leis e decretos gerais estão na{' '}
              <Link className="font-bold text-brand-blue-dark underline" to="/legislacao">biblioteca de legislação</Link>.
            </li>
            <li>O filtro "Categorias de Patrimônio" agrupa os bens pelo nome e pelo uso, para facilitar a busca e a didática visual.</li>
            <li>As inscrições 020 e 021 aparecem como canceladas no Livro do Tombo e por isso não constam da lista. Nomes de proprietários particulares não são publicados em conformidade com a LGPD e o padrão do patrimônio.</li>
          </ul>
          <p className="mt-4 flex items-start gap-2 text-sm text-slate-600">
            <FileText size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>
              Fonte: Relação de Bens Tombados pelo Estado do Maranhão e Livro de Tombo, Departamento de Proteção do Patrimônio Histórico, Artístico, Arqueológico e Paisagístico (DPHAP). Em caso de divergência, prevalece o texto do decreto original. Viu alguma divergência?{' '}
              <a className="font-bold text-brand-blue-dark underline" href={`mailto:${SITE_CONTACT.email}?subject=Correção%20na%20lista%20de%20bens%20tombados`}>Avise a SPC</a>.
            </span>
          </p>

        </section>
      </div>
    </>
  );
};

export default BensTombadosPage;