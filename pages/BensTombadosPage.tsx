import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  FileText,
  FileSpreadsheet,
  Download,
  X,
  Copy,
  Check,
  Printer,
  Compass,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Landmark
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { downloadCatalogXlsx, ExportCatalogOptions, printCatalogPdf } from '../utils/exportCatalog';
import { ChartCard } from '../components/dataviz/ChartCard';
import { BarList } from '../components/dataviz/BarList';
import { ColumnChart } from '../components/dataviz/ColumnChart';
import { MunicipiosMap, SEDE_MUNICIPIO } from '../components/dataviz/MunicipiosMap';
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
import { getMapasTombamentoPorMunicipio } from '../data/mapasHistoricos';

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

const ordemMunicipios = Array.from(
  BENS_TOMBADOS.reduce((m, b) => m.set(b.municipio, (m.get(b.municipio) ?? 0) + 1), new Map<string, number>())
)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
  .map(([n]) => n);

const ANOS = Array.from({ length: 1993 - 1979 + 1 }, (_, k) => 1979 + k);

const BensTombadosPage: React.FC = () => {
  usePageTitle('Bens tombados');
  const [params] = useSearchParams();
  const qInicial = params.get('q') ?? '';
  const munInicial = params.get('municipio') ?? '';

  const [busca, setBusca] = useState(qInicial);
  const [municipio, setMunicipio] = useState(ordemMunicipios.includes(munInicial) ? munInicial : '');
  const [tipo, setTipo] = useState('');
  const [faixa, setFaixa] = useState('');
  const [soPdf, setSoPdf] = useState(false);
  const [mostrarGraficos, setMostrarGraficos] = useState(false);

  const [selectedId, setSelectedId] = useState<string>(BENS_TOMBADOS[0].id);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  useEffect(() => {
    const qParam = params.get('q');
    const munParam = params.get('municipio');
    if (qParam !== null) setBusca(qParam);
    if (munParam !== null && ordemMunicipios.includes(munParam)) setMunicipio(munParam);
  }, [params]);

  const temPdf = (b: BemTombado) => Boolean(DECRETOS_PDF[b.decreto.numero]);

  const resultados = useMemo(() => {
    const q = norm(busca.trim());
    return BENS_TOMBADOS.filter((b) => {
      if (municipio && b.municipio !== municipio) return false;
      if (tipo && TIPO_POR_INSCRICAO[b.id] !== tipo) return false;
      if (faixa) {
        const f = FAIXAS_DECRETO.find((x) => x.id === faixa);
        const a = anoDoDecreto(b);
        if (f && (a === null || a < f.de || a > f.ate)) return false;
      }
      if (soPdf && !temPdf(b)) return false;
      if (q && !norm(`${b.id} ${b.nome} ${b.municipio} ${b.local ?? ''} ${b.decreto.numero}`).includes(q)) return false;
      return true;
    }).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [busca, municipio, tipo, faixa, soPdf]);

  const activeBem: BemTombado | null = useMemo(
    () => resultados.find((b) => b.id === selectedId) || resultados[0] || null,
    [resultados, selectedId]
  );

  const handleSelectBem = (bem: BemTombado) => {
    setSelectedId(bem.id);
    setMobileDrawerOpen(true);
  };

  const copiarCitacao = (bem: BemTombado) => {
    const dataDecreto = fmtData(bem.decreto.data);
    const textoDecreto = `Decreto Estadual nº ${bem.decreto.numero}${dataDecreto ? ` de ${dataDecreto}` : bem.decreto.ano ? ` (${bem.decreto.ano})` : ''}`;
    const folha = bem.livro.folha ? `Livro do Tombo Histórico, folha ${bem.livro.folha}` : 'Livro do Tombo Histórico';
    const local = bem.local ? `, ${bem.local}` : '';
    navigator.clipboard.writeText(`${bem.nome} — ${bem.municipio}${local}. Inscrição nº ${bem.id}, ${folha}. ${textoDecreto}. DPHAP/SPC.`);
    setCopiadoId(bem.id);
    setTimeout(() => setCopiadoId(null), 2200);
  };

  const buildBensExport = (): ExportCatalogOptions<BemTombado> => {
    const filtros: string[] = [];
    if (municipio) filtros.push(`Município: ${municipio}`);
    if (tipo) filtros.push(`Categoria: ${tipo}`);
    if (faixa) {
      const f = FAIXAS_DECRETO.find((x) => x.id === faixa);
      if (f) filtros.push(`Período: ${f.label}`);
    }
    if (soPdf) filtros.push('Somente com Decreto em PDF');
    if (busca.trim()) filtros.push(`Busca: "${busca.trim()}"`);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const slugMun = municipio ? norm(municipio).replace(/\s+/g, '-') : 'maranhao';

    return {
      title: 'Relação de Bens Tombados do Estado do Maranhão',
      subtitle: 'Livro do Tombo Estadual · DPHAP / Superintendência do Patrimônio Cultural (SPC/SECMA)',
      filterSummary: filtros.length ? filtros.join(' · ') : `Acervo completo (${resultados.length} inscrições ativas)`,
      sheetName: 'Bens_Tombados_MA',
      fileNameBase: `spc-bens-tombados-${slugMun}`,
      rows: resultados,
      sourceUrl: `${origin}/bens-tombados`,
      columns: [
        { header: 'Inscrição', width: 11, value: (b) => `#${b.id}` },
        { header: 'Denominação do Bem', width: 42, value: (b) => b.nome },
        { header: 'Município', width: 18, value: (b) => b.municipio },
        { header: 'Localização', width: 32, value: (b) => b.local ?? '—' },
        { header: 'Categoria', width: 22, value: (b) => TIPO_POR_INSCRICAO[b.id] ?? 'Patrimônio Edificado' },
        { header: 'Decreto Estadual', width: 16, value: (b) => `Nº ${b.decreto.numero}` },
        { header: 'Ano', width: 9, value: (b) => String(b.decreto.ano ?? '—') },
        { header: 'Livro / Folha', width: 14, value: (b) => b.livro.folha ? `Fl. ${b.livro.folha}` : '—' },
        {
          header: 'Decreto Digital',
          width: 18,
          value: (b) => (temPdf(b) ? 'PDF disponível' : 'Acervo físico')
        }
      ]
    };
  };

  const limparTudo = () => {
    setBusca('');
    setMunicipio('');
    setTipo('');
    setFaixa('');
    setSoPdf(false);
  };

  const temFiltroAtivo = Boolean(busca.trim() || municipio || tipo || faixa || soPdf);

  const pontosMapa = ordemMunicipios
    .filter((m) => SEDE_MUNICIPIO[m])
    .map((m) => ({
      nome: m,
      lat: SEDE_MUNICIPIO[m][0],
      lng: SEDE_MUNICIPIO[m][1],
      n: BENS_TOMBADOS.filter((b) => b.municipio === m).length
    }));

  const renderDossier = (bem: BemTombado) => {
    const pdfDecreto = DECRETOS_PDF[bem.decreto.numero];
    const mapasMun = getMapasTombamentoPorMunicipio(bem.municipio);
    const dataDecreto = fmtData(bem.decreto.data);
    const dataLivro = fmtData(bem.livro.data);
    const tipoBem = TIPO_POR_INSCRICAO[bem.id] ?? 'Patrimônio Edificado';

    return (
      <div className="space-y-5">
        {/* Identificação + Título */}
        <div className="space-y-2 pb-4 border-b border-[#E5DDD5]">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="px-2.5 py-0.5 rounded-md bg-[#2F5F78] text-white font-mono">Inscrição #{bem.id}</span>
            <span className="text-[#B94734]">{bem.municipio}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">{tipoBem}</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#071D33] leading-snug">
            {bem.nome}
          </h2>
          {bem.local && (
            <p className="text-sm text-slate-600 flex items-center gap-1.5">
              <MapPin size={15} className="text-[#B94734] shrink-0" aria-hidden="true" />
              <span>{bem.local} — {bem.municipio}</span>
            </p>
          )}
        </div>

        {/* Downloads Diretos em Destaque (Decreto + Mapas do Município) */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            Documentos & Mapas Oficiais
          </p>
          <div className="flex flex-wrap gap-2.5">
            {pdfDecreto ? (
              <a
                href={pdfDecreto.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#2F5F78] hover:bg-[#071D33] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
              >
                <Download size={15} aria-hidden="true" />
                <span>Baixar Decreto nº {bem.decreto.numero} (PDF)</span>
              </a>
            ) : (
              <span className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-600">
                <FileText size={14} aria-hidden="true" />
                <span>Decreto nº {bem.decreto.numero} (cópia física no acervo)</span>
              </span>
            )}

            {mapasMun.map((m) => (
              <a
                key={m.id}
                href={m.downloadUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#B94734] hover:bg-[#933525] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
              >
                <Download size={15} aria-hidden="true" />
                <span>Mapa: {m.ano}</span>
              </a>
            ))}

            {mapasMun.length > 0 && (
              <Link
                to={`/mapa?mapa=${encodeURIComponent(mapasMun[0].id)}`}
                className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-[#2F5F78]/35 bg-[#2F5F78]/10 hover:bg-[#2F5F78] hover:text-white px-4 py-2.5 text-xs font-bold text-[#2F5F78] transition-colors"
              >
                <Compass size={15} aria-hidden="true" />
                <span>Explorar no Visor</span>
              </Link>
            )}
          </div>
        </div>

        {/* Dados do Ato Legal e Livro do Tombo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DDD5] p-4 text-xs">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Decreto Estadual</span>
            <p className="font-bold text-[#071D33] text-sm mt-0.5">Nº {bem.decreto.numero}</p>
            <p className="text-slate-600">{dataDecreto ?? (bem.decreto.ano ? `Ano ${bem.decreto.ano}` : 'Data a confirmar')}</p>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Livro do Tombo</span>
            <p className="font-bold text-[#071D33] text-sm mt-0.5">Folha {bem.livro.folha}</p>
            <p className="text-slate-600">{dataLivro ? `Inscrito em ${dataLivro}` : 'Registro DPHAP'}</p>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Diário Oficial</span>
            <p className="font-bold text-[#071D33] text-sm mt-0.5">{bem.diario ?? 'DOE/MA'}</p>
            <p className="text-slate-600">Vigência permanente</p>
          </div>
        </div>

        {pdfDecreto?.nota && (
          <p className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-950">
            <strong>Nota documental:</strong> {pdfDecreto.nota}
          </p>
        )}

        {/* Proteção e Atalhos Diretos */}
        <div className="rounded-2xl bg-[#071D33] text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-200">
            <ShieldCheck size={18} className="text-[#E9B44C] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Bem protegido pela Lei Estadual nº 5.561/1992. Vai reformar ou pintar este imóvel ou seu entorno?
            </span>
          </div>
          <Link
            to="/servicos?servico=s1"
            className="shrink-0 min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#E9B44C] hover:bg-[#F1C56A] px-3.5 py-2 text-xs font-extrabold text-[#071D33] transition-colors"
          >
            <span>Pedir Autorização</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>

        {/* Rodapé: Copiar citação */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            type="button"
            onClick={() => copiarCitacao(bem)}
            className="inline-flex items-center gap-1.5 font-bold text-[#2F5F78] hover:text-[#071D33]"
          >
            {copiadoId === bem.id ? (
              <>
                <Check size={14} className="text-[#256B58]" />
                <span className="text-[#256B58]">Citação copiada!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copiar citação técnica</span>
              </>
            )}
          </button>
          <a href={`mailto:${SITE_CONTACT.email}?subject=Consulta%20Bem%20%23${bem.id}`} className="text-slate-500 hover:text-[#071D33] underline">
            Reportar divergência
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-brand-surface text-slate-800 min-h-screen">
      {/* Cabeçalho com Identidade Própria: Azul Azulejo (#2F5F78) + Fotografia Colonial */}
      <header className="relative overflow-hidden bg-[#1D4358] text-white py-9 sm:py-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-30 saturate-110"
          style={{ backgroundImage: "url('/cena-fotos/casarao.webp')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0F2C3D]/95 via-[#1D4358]/85 to-[#2F5F78]/70"
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E9B44C] flex items-center gap-1.5">
            <Landmark size={14} aria-hidden="true" />
            <span>Livro do Tombo Estadual · {BENS_TOMBADOS.length} inscrições</span>
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white">
            Explorador de Bens Tombados
          </h1>
          <p className="mt-2 max-w-[60ch] text-sm sm:text-base text-slate-100 leading-relaxed">
            Filtre por município em 1 clique, selecione qualquer imóvel na lista e acesse imediatamente o decreto em PDF e o mapa de tombamento.
          </p>

          <div className="mt-5 max-w-2xl relative">
            <label htmlFor="bens-busca" className="sr-only">Buscar bem tombado</label>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="bens-busca"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, rua, município ou nº do decreto (ex.: Alcântara, 10.089)..."
              className="w-full min-h-[48px] rounded-xl bg-white pl-11 pr-4 py-3 text-sm font-medium text-[#071D33] placeholder:text-slate-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#E9B44C]"
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Chips Visuais de Município em 1 Clique (Zero caça em dropdown!) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => setMunicipio('')}
            className={`min-h-[38px] shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              !municipio
                ? 'bg-[#2F5F78] text-white shadow-sm'
                : 'bg-white border border-[#E5DDD5] text-[#071D33] hover:border-[#2F5F78]'
            }`}
          >
            Todos ({BENS_TOMBADOS.length})
          </button>
          {ordemMunicipios.map((m) => {
            const count = BENS_TOMBADOS.filter((b) => b.municipio === m).length;
            const selected = municipio === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMunicipio(selected ? '' : m)}
                className={`min-h-[38px] shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selected
                    ? 'bg-[#2F5F78] text-white shadow-sm'
                    : 'bg-white border border-[#E5DDD5] text-[#071D33] hover:border-[#2F5F78]'
                }`}
              >
                {m} ({count})
              </button>
            );
          })}
        </div>

        {/* Barra Compacta de Refinamento + Ações */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-white border border-[#E5DDD5] px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filtrar por categoria"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="min-h-[36px] rounded-xl border border-[#E5DDD5] bg-brand-surface px-3 py-1.5 text-xs font-semibold text-[#071D33]"
            >
              <option value="">Todas as categorias</option>
              {TIPOS_BEM.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              aria-label="Filtrar por período"
              value={faixa}
              onChange={(e) => setFaixa(e.target.value)}
              className="min-h-[36px] rounded-xl border border-[#E5DDD5] bg-brand-surface px-3 py-1.5 text-xs font-semibold text-[#071D33]"
            >
              <option value="">Todos os anos</option>
              {FAIXAS_DECRETO.map((f) => (
                <option key={f.id} value={f.id}>Decretos {f.label}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setSoPdf((v) => !v)}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                soPdf ? 'bg-[#256B58] text-white' : 'bg-brand-surface text-slate-700 hover:bg-brand-sand/60'
              }`}
            >
              Só com PDF
            </button>

            {temFiltroAtivo && (
              <button
                type="button"
                onClick={limparTudo}
                className="min-h-[36px] inline-flex items-center gap-1 px-2.5 text-xs font-bold text-[#B94734] hover:underline"
              >
                <X size={13} /> Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMostrarGraficos((v) => !v)}
              className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                mostrarGraficos ? 'bg-[#071D33] text-white' : 'bg-brand-surface text-[#071D33] border border-[#E5DDD5]'
              }`}
            >
              <BarChart3 size={13} />
              <span>{mostrarGraficos ? 'Ocultar mapa' : 'Mapa & Gráficos'}</span>
            </button>
            <button
              type="button"
              disabled={resultados.length === 0}
              onClick={() => downloadCatalogXlsx(buildBensExport())}
              title={`Baixar ${resultados.length} ${resultados.length === 1 ? 'bem tombado' : 'bens tombados'} em planilha Excel (.xlsx)`}
              className="min-h-[36px] inline-flex items-center gap-1.5 rounded-xl border border-[#256B58]/35 bg-white hover:bg-[#256B58] hover:text-white px-3 py-1.5 text-xs font-bold text-[#256B58] transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <FileSpreadsheet size={13} aria-hidden="true" />
              <span>Excel</span>
            </button>
            <button
              type="button"
              disabled={resultados.length === 0}
              onClick={() => printCatalogPdf(buildBensExport())}
              title={`Imprimir ou salvar em PDF (${resultados.length} ${resultados.length === 1 ? 'bem tombado' : 'bens tombados'})`}
              className="min-h-[36px] inline-flex items-center gap-1.5 rounded-xl border border-[#E5DDD5] bg-white hover:bg-[#071D33] hover:text-white px-3 py-1.5 text-xs font-bold text-[#071D33] transition-colors disabled:opacity-40 disabled:pointer-events-none print:hidden"
            >
              <Printer size={13} aria-hidden="true" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Painel de Mapa & Gráficos sob demanda */}
        {mostrarGraficos && (
          <div className="grid gap-4 lg:grid-cols-12">
            <ChartCard
              className="lg:col-span-7"
              title="Distribuição Geográfica"
              subtitle="Clique em um município para filtrar a lista."
              activeLabel={municipio || null}
              onClear={() => setMunicipio('')}
              table={{ head: ['Município', 'Bens'], rows: ordemMunicipios.map((m) => [m, BENS_TOMBADOS.filter((b) => b.municipio === m).length]) }}
              source="SPC/DPHAP"
            >
              <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
                <MunicipiosMap height={240} points={pontosMapa} selected={municipio || null} onSelect={(m) => setMunicipio(m ?? '')} />
                <BarList
                  items={ordemMunicipios.map((m) => ({ key: m, label: m, value: BENS_TOMBADOS.filter((b) => b.municipio === m).length }))}
                  selected={municipio || null}
                  onSelect={(k) => setMunicipio(k ?? '')}
                  unit="bens"
                  ariaLabel="Bens por município"
                  max={45}
                />
              </div>
            </ChartCard>
            <ChartCard
              className="lg:col-span-5"
              title="Linha do Tempo (1979–1993)"
              subtitle="Bens tombados por ano do decreto."
              table={{ head: ['Ano', 'Bens'], rows: ANOS.map((y) => [String(y), BENS_TOMBADOS.filter((b) => anoDoDecreto(b) === y).length]) }}
              source="SPC/DPHAP"
            >
              <ColumnChart
                cols={ANOS.map((y) => ({
                  key: String(y),
                  label: String(y),
                  short: `’${String(y).slice(2)}`,
                  parts: [{ id: 'bens', value: BENS_TOMBADOS.filter((b) => anoDoDecreto(b) === y).length }]
                }))}
                selected={[]}
                onSelect={() => {}}
                unit="bens"
                ariaLabel="Bens por ano"
                emptyNote="0"
                height={200}
                compactLabels
              />
            </ChartCard>
          </div>
        )}

        {/* LAYOUT EXPLORADOR (Master-Detail no Desktop / Lista + Gaveta no Mobile) */}
        {resultados.length === 0 ? (
          <div className="rounded-2xl border border-[#E5DDD5] bg-white p-10 text-center space-y-3">
            <p className="font-bold text-[#071D33]">Nenhum bem encontrado com esses filtros.</p>
            <button
              type="button"
              onClick={limparTudo}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#2F5F78] text-white text-xs font-bold"
            >
              Mostrar todos os {BENS_TOMBADOS.length} bens
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* COLUNA ESQUERDA: Lista Compacta Escaneável (8–10 itens visíveis de uma vez) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5DDD5] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-[#FAF8F5] flex items-center justify-between text-xs">
                <span className="font-bold text-[#071D33]" role="status" aria-live="polite">
                  {resultados.length} {resultados.length === 1 ? 'bem tombado' : 'bens tombados'}
                </span>
                <span className="text-slate-500">Toque para abrir o dossiê</span>
              </div>

              <ul className="divide-y divide-slate-100 max-h-[68vh] lg:max-h-[72vh] overflow-y-auto">
                {resultados.map((bem) => {
                  const isSelected = activeBem?.id === bem.id;
                  const hasPdf = temPdf(bem);
                  const hasMap = getMapasTombamentoPorMunicipio(bem.municipio).length > 0;
                  return (
                    <li key={bem.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectBem(bem)}
                        className={`w-full text-left px-4 py-3.5 transition-colors flex items-start justify-between gap-3 border-l-4 ${
                          isSelected
                            ? 'bg-[#2F5F78]/10 border-l-[#2F5F78]'
                            : 'bg-white border-l-transparent hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold">
                            <span className="font-mono text-[#2F5F78]">#{bem.id}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-[#B94734] truncate">{bem.municipio}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500 font-normal">{bem.decreto.ano ?? 's/d'}</span>
                          </div>
                          <p className="text-sm font-bold text-[#071D33] leading-snug line-clamp-2">
                            {bem.nome}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
                          {hasPdf && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#256B58]/15 text-[#256B58]">
                              PDF
                            </span>
                          )}
                          {hasMap && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#B94734]/12 text-[#B94734]">
                              Mapa
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* COLUNA DIREITA (Desktop): Painel Fixo de Leitura e Downloads */}
            <aside className="hidden lg:block lg:col-span-7 sticky top-20 bg-white rounded-2xl border border-[#E5DDD5] p-6 sm:p-7 shadow-sm">
              {activeBem && renderDossier(activeBem)}
            </aside>
          </div>
        )}
      </div>

      {/* GAVETA DESLIZANTE (Mobile Bottom Sheet) */}
      {mobileDrawerOpen && activeBem && (
        <div
          className="lg:hidden fixed inset-0 z-[180] bg-[#071D33]/60 backdrop-blur-xs flex items-end"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-full max-h-[86vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl animate-slide-in-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Dossiê do Bem Tombado
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="min-h-[36px] min-w-[36px] rounded-full bg-slate-100 text-[#071D33] flex items-center justify-center"
                aria-label="Fechar dossiê"
              >
                <X size={18} />
              </button>
            </div>
            {renderDossier(activeBem)}
          </div>
        </div>
      )}
    </div>
  );
};

export default BensTombadosPage;
