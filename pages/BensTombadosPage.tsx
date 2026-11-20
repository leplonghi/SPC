import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  FileText,
  Info,
  Download,
  X,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Printer,
  Compass,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
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
import { MAPAS_HISTORICOS, getMapasTombamentoPorMunicipio } from '../data/mapasHistoricos';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const fmtData = (iso: string | null) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const MUNICIPIOS = Array.from(new Set(BENS_TOMBADOS.map((b) => b.municipio))).sort((a, b) =>
  a.localeCompare(b, 'pt-BR')
);

type FiltroPdf = '' | 'com' | 'sem';
type Pular = 'municipio' | 'tipo' | 'periodo' | 'pdf' | null;
type OrdenacaoOpcao = 'inscricao-asc' | 'inscricao-desc' | 'nome-asc' | 'ano-desc' | 'ano-asc';

const ANOS = Array.from({ length: 1993 - 1979 + 1 }, (_, k) => 1979 + k);
const ordemMunicipios = Array.from(
  BENS_TOMBADOS.reduce((m, b) => m.set(b.municipio, (m.get(b.municipio) ?? 0) + 1), new Map<string, number>())
)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
  .map(([n]) => n);

const BensTombadosPage: React.FC = () => {
  usePageTitle('Bens tombados');
  const [params] = useSearchParams();
  const qInicial = params.get('q') ?? '';
  const municipioInicial = params.get('municipio') ?? '';
  const anoInicial = Number(params.get('ano'));

  const [busca, setBusca] = useState(qInicial);
  const [municipio, setMunicipio] = useState(MUNICIPIOS.includes(municipioInicial) ? municipioInicial : '');
  const [tipo, setTipo] = useState('');
  const [faixa, setFaixa] = useState('');
  const [ano, setAno] = useState<number | null>(ANOS.includes(anoInicial) ? anoInicial : null);
  const [pdf, setPdf] = useState<FiltroPdf>('');

  React.useEffect(() => {
    const qParam = params.get('q');
    const munParam = params.get('municipio');
    const anoParam = Number(params.get('ano'));
    if (qParam !== null) setBusca(qParam);
    if (munParam !== null && MUNICIPIOS.includes(munParam)) setMunicipio(munParam);
    if (anoParam && ANOS.includes(anoParam)) setAno(anoParam);
  }, [params]);

  const [viewMode, setViewMode] = useState<'cards' | 'tabela'>('cards');
  const [ordenacao, setOrdenacao] = useState<OrdenacaoOpcao>('inscricao-asc');
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [mostrarPainelGraficos, setMostrarPainelGraficos] = useState(false);

  const toggleExpand = (id: string) => setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));

  const copiarCitacao = (bem: BemTombado) => {
    const dataDecreto = fmtData(bem.decreto.data);
    const textoDecreto = `Decreto Estadual nº ${bem.decreto.numero}${dataDecreto ? ` de ${dataDecreto}` : bem.decreto.ano ? ` (${bem.decreto.ano})` : ''}`;
    const folha = bem.livro.folha ? `Livro do Tombo Histórico, folha ${bem.livro.folha}` : 'Livro do Tombo Histórico';
    const local = bem.local ? `, ${bem.local}` : '';
    const citacao = `${bem.nome} — ${bem.municipio}${local}. Inscrição nº ${bem.id}, ${folha}. ${textoDecreto}. DPHAP/SPC.`;
    navigator.clipboard.writeText(citacao);
    setCopiadoId(bem.id);
    setTimeout(() => setCopiadoId(null), 2200);
  };

  const temPdf = (b: BemTombado) => Boolean(DECRETOS_PDF[b.decreto.numero]);

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
      case 'ano-asc':
        return lista.sort((a, b) => (anoDoDecreto(a) ?? 9999) - (anoDoDecreto(b) ?? 9999));
      case 'ano-desc':
        return lista.sort((a, b) => (anoDoDecreto(b) ?? 0) - (anoDoDecreto(a) ?? 0));
      default:
        return lista.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    }
  }, [resultados, ordenacao]);

  const exportarCsv = () => {
    const cabecalho = ['Inscricao', 'Nome_do_Bem', 'Municipio', 'Localizacao', 'Categoria', 'Decreto_Numero', 'Decreto_Data', 'Livro_Folha', 'PDF_Disponivel'];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const linhas = resultadosOrdenados.map((b) =>
      [
        esc(b.id),
        esc(b.nome),
        esc(b.municipio),
        esc(b.local ?? ''),
        esc(TIPO_POR_INSCRICAO[b.id] ?? 'Patrimônio Edificado'),
        esc(b.decreto.numero),
        esc(fmtData(b.decreto.data) ?? (b.decreto.ano ? String(b.decreto.ano) : '')),
        esc(b.livro.folha),
        esc(DECRETOS_PDF[b.decreto.numero] ? 'Sim' : 'Físico no acervo')
      ].join(';')
    );
    const blob = new Blob(['\uFEFF' + [cabecalho.join(';'), ...linhas].join('\r\n')], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spc-bens-tombados-${municipio ? norm(municipio).replace(/\s+/g, '-') : 'maranhao'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const g = useMemo(() => {
    const base = (p: Pular) => BENS_TOMBADOS.filter((b) => passa(b, p));
    const porMun = base('municipio');
    const porAno = base('periodo');
    const porPdf = base('pdf');
    return {
      municipios: ordemMunicipios.map((m) => ({ key: m, label: m, value: porMun.filter((b) => b.municipio === m).length })),
      anos: ANOS.map((y) => ({
        key: String(y),
        label: String(y),
        short: `’${String(y).slice(2)}`,
        parts: [{ id: 'bens', value: porAno.filter((b) => anoDoDecreto(b) === y).length }]
      })),
      com: porPdf.filter(temPdf).length,
      sem: porPdf.filter((b) => !temPdf(b)).length
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, municipio, tipo, faixa, ano, pdf]);

  const pontos = MUNICIPIOS.filter((m) => SEDE_MUNICIPIO[m]).map((m) => ({
    nome: m,
    lat: SEDE_MUNICIPIO[m][0],
    lng: SEDE_MUNICIPIO[m][1],
    n: g.municipios.find((x) => x.key === m)?.value ?? 0
  }));

  const temFiltroAtivo = Boolean(busca.trim() || municipio || tipo || faixa || ano !== null || pdf);
  const limparTudo = () => {
    setBusca('');
    setMunicipio('');
    setTipo('');
    setFaixa('');
    setAno(null);
    setPdf('');
  };

  const mapasMunicipioAtivo = municipio
    ? getMapasTombamentoPorMunicipio(municipio)
    : MAPAS_HISTORICOS.filter((m) => m.categoria === 'Mapa de Tombamento');

  return (
    <div className="bg-brand-surface text-slate-800 min-h-screen">
      {/* Cabeçalho Editorial Compacto com Busca Direta */}
      <header className="bg-brand-navy text-white py-9 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            Livro do Tombo Estadual · {BENS_TOMBADOS.length} bens · {MUNICIPIOS.length} municípios
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white">
            Bens Tombados do Maranhão
          </h1>
          <p className="mt-2 max-w-[62ch] text-sm sm:text-base text-slate-200 leading-relaxed">
            Consulte as inscrições estaduais (1979–1993), baixe os decretos digitalizados e acesse os mapas de poligonal dos municípios.
          </p>

          <div className="mt-6 max-w-2xl relative">
            <label htmlFor="bens-busca" className="sr-only">
              Buscar bem por nome, rua, município ou decreto
            </label>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="bens-busca"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, rua, município ou decreto (ex.: Alcântara, 10.089)..."
              className="w-full min-h-[48px] rounded-xl bg-white pl-11 pr-4 py-3 text-sm font-medium text-brand-navy placeholder:text-slate-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
        </div>
      </header>

      <div id="resultados" className="max-w-5xl mx-auto px-4 sm:px-6 py-7 space-y-5">
        {/* Barra Única e Clean de Filtros */}
        <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div>
              <label htmlFor="bens-municipio" className="sr-only">Município</label>
              <select
                id="bens-municipio"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-[#E5DDD5] bg-brand-surface px-3 py-2 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-blue"
              >
                <option value="">Todos os municípios ({MUNICIPIOS.length})</option>
                {MUNICIPIOS.map((m) => (
                  <option key={m} value={m}>
                    {m} ({BENS_TOMBADOS.filter((b) => b.municipio === m).length})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bens-tipo" className="sr-only">Categoria</label>
              <select
                id="bens-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-[#E5DDD5] bg-brand-surface px-3 py-2 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-blue"
              >
                <option value="">Todas as categorias</option>
                {TIPOS_BEM.map((t) => (
                  <option key={t} value={t}>
                    {t} ({BENS_TOMBADOS.filter((b) => TIPO_POR_INSCRICAO[b.id] === t).length})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bens-faixa" className="sr-only">Período do decreto</label>
              <select
                id="bens-faixa"
                value={faixa}
                onChange={(e) => {
                  setFaixa(e.target.value);
                  setAno(null);
                }}
                className="w-full min-h-[42px] rounded-xl border border-[#E5DDD5] bg-brand-surface px-3 py-2 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-blue"
              >
                <option value="">Todos os períodos</option>
                {FAIXAS_DECRETO.map((f) => (
                  <option key={f.id} value={f.id}>
                    Decretos de {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bens-ordem" className="sr-only">Ordenação</label>
              <select
                id="bens-ordem"
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as OrdenacaoOpcao)}
                className="w-full min-h-[42px] rounded-xl border border-[#E5DDD5] bg-brand-surface px-3 py-2 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-blue"
              >
                <option value="inscricao-asc">Inscrição (001 → 065)</option>
                <option value="inscricao-desc">Inscrição (065 → 001)</option>
                <option value="nome-asc">Nome (A → Z)</option>
                <option value="ano-desc">Mais recentes primeiro</option>
                <option value="ano-asc">Mais antigos primeiro</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPdf(pdf === 'com' ? '' : 'com')}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  pdf === 'com'
                    ? 'bg-brand-sage-dark text-white'
                    : 'bg-brand-surface text-slate-700 hover:bg-brand-sand/60'
                }`}
              >
                Somente com PDF ({BENS_TOMBADOS.filter(temPdf).length})
              </button>

              <button
                type="button"
                onClick={() => setMostrarPainelGraficos((v) => !v)}
                className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  mostrarPainelGraficos
                    ? 'bg-brand-navy text-white'
                    : 'bg-brand-surface text-brand-navy hover:bg-brand-sand/60'
                }`}
              >
                <BarChart3 size={13} aria-hidden="true" />
                <span>{mostrarPainelGraficos ? 'Ocultar mapa e gráficos' : 'Ver mapa e gráficos'}</span>
              </button>

              {temFiltroAtivo && (
                <button
                  type="button"
                  onClick={limparTudo}
                  className="min-h-[36px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-brand-terracotta hover:bg-brand-terracotta/10"
                >
                  <X size={13} aria-hidden="true" />
                  Limpar filtros
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={exportarCsv}
                disabled={resultadosOrdenados.length === 0}
                className="min-h-[36px] inline-flex items-center gap-1 rounded-xl border border-[#E5DDD5] bg-white px-2.5 py-1.5 text-xs font-bold text-brand-navy hover:bg-brand-surface disabled:opacity-40"
              >
                <Download size={13} aria-hidden="true" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[36px] inline-flex items-center gap-1 rounded-xl border border-[#E5DDD5] bg-white px-2.5 py-1.5 text-xs font-bold text-brand-navy hover:bg-brand-surface print:hidden"
                aria-label="Imprimir lista"
              >
                <Printer size={13} aria-hidden="true" />
              </button>
              <div className="flex rounded-xl border border-[#E5DDD5] bg-brand-surface p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg ${viewMode === 'cards' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500'}`}
                  aria-label="Visualização em cartões"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('tabela')}
                  className={`p-1.5 rounded-lg ${viewMode === 'tabela' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500'}`}
                  aria-label="Visualização em tabela"
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Painel de Mapa & Gráficos Interativos (Sob Demanda — não bloqueia a lista!) */}
        {mostrarPainelGraficos && (
          <div className="grid gap-4 lg:grid-cols-12">
            <ChartCard
              className="lg:col-span-7"
              title="Distribuição por Município"
              subtitle="Clique em um município para filtrar a relação abaixo."
              activeLabel={municipio || null}
              onClear={() => setMunicipio('')}
              table={{ head: ['Município', 'Bens'], rows: g.municipios.map((m) => [m.label, m.value]) }}
              source="Relação de Bens Tombados (SPC/DPHAP)."
            >
              <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
                <MunicipiosMap height={260} points={pontos} selected={municipio || null} onSelect={(m) => setMunicipio(m ?? '')} />
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

            <div className="lg:col-span-5 space-y-4">
              <ChartCard
                title="Tombamentos por Ano"
                subtitle="Clique em uma coluna para filtrar o ano."
                activeLabel={ano ? String(ano) : null}
                onClear={() => setAno(null)}
                table={{ head: ['Ano', 'Bens'], rows: g.anos.map((c) => [c.label, c.parts[0].value]) }}
                source="Ano do decreto de tombamento."
              >
                <ColumnChart
                  cols={g.anos}
                  selected={ano ? [String(ano)] : []}
                  onSelect={(k) => {
                    const y = Number(k);
                    setFaixa('');
                    setAno(ano === y ? null : y);
                  }}
                  unit="bens"
                  ariaLabel="Bens tombados por ano"
                  emptyNote="Sem tombamentos"
                  height={160}
                  compactLabels
                />
              </ChartCard>

              <ChartCard
                title="Decretos Digitalizados"
                subtitle="Situação das cópias disponíveis em PDF."
                activeLabel={pdf ? (pdf === 'com' ? 'Com PDF' : 'Sem PDF') : null}
                onClear={() => setPdf('')}
                table={{ head: ['Situação', 'Bens'], rows: [['Digitalizado', g.com], ['Físico', g.sem]] }}
                source="Arquivo de decretos da SPC."
              >
                <ShareBar
                  parts={[
                    { id: 'com', label: 'PDF disponível', value: g.com, color: HUE },
                    { id: 'sem', label: 'Acervo físico', value: g.sem, color: '#8996A3' }
                  ]}
                  selected={pdf || null}
                  onSelect={(id) => setPdf((id as FiltroPdf) ?? '')}
                  unit="bens"
                  ariaLabel="Situação de digitalização"
                />
              </ChartCard>
            </div>
          </div>
        )}

        {/* Faixa Compacta de Mapas de Tombamento (apenas quando existem mapas para o município/filtro) */}
        {mapasMunicipioAtivo.length > 0 && (
          <div className="rounded-2xl bg-white border border-[#E5DDD5] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Compass size={15} className="text-brand-terracotta shrink-0" aria-hidden="true" />
              <span>
                <strong className="text-brand-navy">
                  {municipio ? `Mapas de tombamento de ${municipio}:` : 'Mapas de tombamento disponíveis:'}
                </strong>{' '}
                {!municipio && 'São Luís, Alcântara, Viana, Caxias e Carolina'}
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              {mapasMunicipioAtivo.map((m) => (
                <a
                  key={m.id}
                  href={m.downloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-brand-surface border border-[#E5DDD5] px-2.5 py-1 text-xs font-bold text-brand-navy hover:border-brand-terracotta hover:text-brand-terracotta transition-colors"
                >
                  <Download size={11} aria-hidden="true" />
                  <span>{m.ano}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contagem limpa */}
        <p className="text-xs font-semibold text-slate-600 px-1" role="status" aria-live="polite">
          Exibindo <strong className="text-brand-navy">{resultadosOrdenados.length}</strong>{' '}
          {resultadosOrdenados.length === 1 ? 'bem tombado' : 'bens tombados'}
          {municipio ? ` em ${municipio}` : ''}
        </p>

        {/* Resultados: Cards Limpos ou Tabela */}
        {resultadosOrdenados.length === 0 ? (
          <div className="rounded-2xl border border-[#E5DDD5] bg-white p-10 text-center space-y-3">
            <Info size={28} className="mx-auto text-slate-400" />
            <p className="font-bold text-brand-navy">Nenhum bem encontrado com os filtros selecionados.</p>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              O imóvel pode integrar um conjunto tombado (como o Centro Histórico de São Luís ou Alcântara) ou possuir proteção federal (IPHAN).
            </p>
            <button
              type="button"
              onClick={limparTudo}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-blue"
            >
              Mostrar todos os bens
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="space-y-3">
            {resultadosOrdenados.map((bem) => {
              const dataDecreto = fmtData(bem.decreto.data);
              const dataLivro = fmtData(bem.livro.data);
              const pdfDecreto = DECRETOS_PDF[bem.decreto.numero];
              const tipoBem = TIPO_POR_INSCRICAO[bem.id] ?? 'Patrimônio Edificado';
              const isExpanded = Boolean(expandidos[bem.id]);
              const mapasMun = getMapasTombamentoPorMunicipio(bem.municipio);

              return (
                <article
                  key={bem.id}
                  className="rounded-2xl border border-[#E5DDD5] bg-white p-5 sm:p-6 shadow-sm hover:border-brand-navy/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <p className="text-xs font-bold text-slate-500 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-brand-navy">#{bem.id}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-brand-terracotta">{bem.municipio}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tipoBem}</span>
                      </p>

                      <h2 className="font-display text-base sm:text-lg font-bold text-brand-navy leading-snug">
                        {bem.nome}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        {bem.local && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400 shrink-0" aria-hidden="true" />
                            {bem.local}
                          </span>
                        )}
                        <span className="text-slate-400" aria-hidden="true">·</span>
                        <span>
                          Decreto nº <strong className="text-slate-800">{bem.decreto.numero}</strong>
                          {bem.decreto.ano ? ` (${bem.decreto.ano})` : ''}
                        </span>
                      </p>
                    </div>

                    {/* Ações Primárias Limpas */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {pdfDecreto && (
                        <a
                          href={pdfDecreto.url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-brand-navy px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-blue transition-colors"
                        >
                          <Download size={13} aria-hidden="true" />
                          <span>Decreto (PDF)</span>
                        </a>
                      )}
                      {mapasMun.length > 0 && (
                        <a
                          href={mapasMun[0].downloadUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-[#E5DDD5] bg-brand-surface px-3.5 py-2 text-xs font-bold text-brand-navy hover:border-brand-terracotta hover:text-brand-terracotta transition-colors"
                          title={`Baixar ${mapasMun[0].titulo}`}
                        >
                          <Download size={13} aria-hidden="true" />
                          <span>Mapa ({bem.municipio})</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Rodapé discreto */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => toggleExpand(bem.id)}
                        className="inline-flex items-center gap-1 font-bold text-brand-blue-dark hover:text-brand-navy py-1"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span>{isExpanded ? 'Ocultar ficha técnica' : 'Ver ficha técnica e mapas'}</span>
                      </button>

                      {mapasMun.length > 0 && (
                        <Link
                          to={`/mapa?mapa=${encodeURIComponent(mapasMun[0].id)}`}
                          className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-brand-terracotta"
                        >
                          <Compass size={13} aria-hidden="true" />
                          <span>Abrir no visor</span>
                        </Link>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => copiarCitacao(bem)}
                      className="inline-flex items-center gap-1.5 text-slate-500 hover:text-brand-navy font-semibold px-2.5 py-1 rounded-lg hover:bg-brand-surface transition-colors"
                    >
                      {copiadoId === bem.id ? (
                        <>
                          <Check size={13} className="text-brand-sage-dark" />
                          <span className="text-brand-sage-dark font-bold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copiar citação</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Ficha Técnica Expandida sob Demanda */}
                  {isExpanded && (
                    <div className="mt-4 rounded-xl bg-brand-surface border border-[#E5DDD5] p-4 space-y-3 text-xs text-slate-700">
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Decreto Estadual</span>
                          <p className="font-bold text-brand-navy mt-0.5">Nº {bem.decreto.numero}</p>
                          <p className="text-slate-600">{dataDecreto ?? (bem.decreto.ano ? `Ano ${bem.decreto.ano}` : 'Data a confirmar')}</p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Livro do Tombo</span>
                          <p className="font-bold text-brand-navy mt-0.5">Folha {bem.livro.folha}</p>
                          <p className="text-slate-600">{dataLivro ? `Inscrito em ${dataLivro}` : 'Registro DPHAP'}</p>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Diário Oficial</span>
                          <p className="font-bold text-brand-navy mt-0.5">{bem.diario ?? 'Publicado no DOE/MA'}</p>
                          <p className="text-slate-600">{pdfDecreto ? 'Cópia digital disponível' : 'Cópia física no acervo'}</p>
                        </div>
                      </div>

                      {mapasMun.length > 1 && (
                        <div className="pt-2.5 border-t border-[#E5DDD5] flex flex-wrap items-center gap-2">
                          <span className="font-bold text-brand-navy">Todos os mapas de {bem.municipio}:</span>
                          {mapasMun.map((m) => (
                            <a
                              key={m.id}
                              href={m.downloadUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-white border border-[#E5DDD5] px-2.5 py-1 font-bold text-brand-navy hover:border-brand-terracotta hover:text-brand-terracotta"
                            >
                              <Download size={11} /> {m.ano}
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="pt-2.5 border-t border-[#E5DDD5] flex items-start gap-2 text-slate-600">
                        <ShieldCheck size={15} className="text-brand-sage-dark shrink-0 mt-0.5" aria-hidden="true" />
                        <span>
                          Proteção estadual permanente (Lei nº 5.561/1992). Obras ou intervenções exigem autorização prévia em{' '}
                          <Link to="/servicos" className="font-bold text-brand-blue-dark underline">Serviços</Link>.
                        </span>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E5DDD5] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-navy text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">Insc.</th>
                    <th className="py-3 px-4">Bem & Município</th>
                    <th className="py-3 px-4">Decreto</th>
                    <th className="py-3 px-4 text-right">Downloads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultadosOrdenados.map((bem) => {
                    const pdfDecreto = DECRETOS_PDF[bem.decreto.numero];
                    const mapasRow = getMapasTombamentoPorMunicipio(bem.municipio);
                    return (
                      <tr key={bem.id} className="hover:bg-brand-surface/70">
                        <td className="py-3 px-4 font-mono font-bold text-brand-navy whitespace-nowrap">#{bem.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-brand-navy">{bem.nome}</div>
                          <div className="text-[11px] text-slate-500">{bem.municipio}{bem.local ? ` · ${bem.local}` : ''}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                          Nº {bem.decreto.numero} {bem.decreto.ano ? `(${bem.decreto.ano})` : ''}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {mapasRow[0] && (
                              <a
                                href={mapasRow[0].downloadUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-[#E5DDD5] bg-brand-surface px-2.5 py-1 font-bold text-brand-navy hover:border-brand-terracotta"
                              >
                                <Download size={11} /> Mapa
                              </a>
                            )}
                            {pdfDecreto ? (
                              <a
                                href={pdfDecreto.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg bg-brand-navy px-2.5 py-1 font-bold text-white hover:bg-brand-blue"
                              >
                                <Download size={11} /> Decreto
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400">Físico</span>
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

        {/* Nota de Fonte Discreta */}
        <footer className="pt-6 border-t border-[#E5DDD5] text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
          <FileText size={15} className="shrink-0 mt-0.5 text-slate-400" aria-hidden="true" />
          <p>
            Fonte: Relação de Bens Tombados e Livro do Tombo Histórico (DPHAP/SPC). Inscrições 020 e 021 canceladas no Livro do Tombo. Dúvidas ou retificações:{' '}
            <a href={`mailto:${SITE_CONTACT.email}`} className="font-bold text-brand-blue-dark underline">
              {SITE_CONTACT.email}
            </a>.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default BensTombadosPage;
