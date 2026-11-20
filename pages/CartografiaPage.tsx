import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  FileText,
  Landmark,
  MapPin,
  ArrowUpRight,
  Layers,
  BookOpen,
  Download,
  Image as ImageIcon,
  Search,
  X
} from 'lucide-react';
import { PanZoomImage } from '../components/ui/PanZoomImage';
import {
  MAPAS_HISTORICOS,
  type CategoriaMapa,
  type MapaHistorico,
  type PontoMapaHistorico
} from '../data/mapasHistoricos';
import { BENS_TOMBADOS, DECRETOS_PDF, type BemTombado } from '../data/bensTombados';
import { MunicipiosMap, SEDE_MUNICIPIO, type MapPoint } from '../components/dataviz/MunicipiosMap';
import { usePageTitle } from '../hooks/usePageTitle';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const MUNICIPIOS_MAPA = Array.from(new Set(MAPAS_HISTORICOS.map((m) => m.municipio))).sort((a, b) =>
  a.localeCompare(b, 'pt-BR')
);

export const CartografiaPage: React.FC = () => {
  usePageTitle('Cartografia histórica e mapas de tombamento');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const mapaParam = searchParams.get('mapa');
  const categoriaParam = searchParams.get('categoria');

  const initialMap = useMemo(() => {
    if (mapaParam) {
      const found = MAPAS_HISTORICOS.find((m) => m.id === mapaParam);
      if (found) return found;
    }
    return MAPAS_HISTORICOS[0];
  }, [mapaParam]);

  const [busca, setBusca] = useState('');
  const [filtroMunicipio, setFiltroMunicipio] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<'todas' | CategoriaMapa>(
    categoriaParam === 'tombamento' ? 'Mapa de Tombamento' : 'todas'
  );
  const [selectedMapId, setSelectedMapId] = useState<string>(initialMap.id);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(initialMap.points[0]?.id ?? null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);

  useEffect(() => {
    if (mapaParam) {
      const found = MAPAS_HISTORICOS.find((m) => m.id === mapaParam);
      if (found) {
        setSelectedMapId(found.id);
        setSelectedPointId(found.points[0]?.id ?? null);
      }
    }
  }, [mapaParam]);

  const mapasFiltrados = useMemo(() => {
    const q = norm(busca.trim());
    return MAPAS_HISTORICOS.filter((m) => {
      if (filtroCategoria !== 'todas' && m.categoria !== filtroCategoria) return false;
      if (filtroMunicipio && m.municipio !== filtroMunicipio) return false;
      if (q) {
        const hay = norm(`${m.titulo} ${m.municipio} ${m.ano} ${m.autor} ${m.epocaLabel} ${m.resumo}`);
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [busca, filtroCategoria, filtroMunicipio]);

  const activeMap: MapaHistorico = useMemo(
    () => mapasFiltrados.find((m) => m.id === selectedMapId) || mapasFiltrados[0] || MAPAS_HISTORICOS[0],
    [selectedMapId, mapasFiltrados]
  );

  const activePoint: PontoMapaHistorico | null = useMemo(() => {
    if (!selectedPointId) return activeMap.points[0] ?? null;
    return activeMap.points.find((p) => p.id === selectedPointId) || activeMap.points[0] || null;
  }, [activeMap, selectedPointId]);

  const linkedAssets: BemTombado[] = useMemo(() => {
    if (!activePoint?.bemIds?.length) return [];
    const idSet = new Set(activePoint.bemIds);
    return BENS_TOMBADOS.filter((b) => idSet.has(b.id));
  }, [activePoint]);

  const municipioPoints: MapPoint[] = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of BENS_TOMBADOS) {
      counts[b.municipio] = (counts[b.municipio] || 0) + 1;
    }
    return Object.entries(SEDE_MUNICIPIO).map(([nome, [lat, lng]]) => ({
      nome,
      lat,
      lng,
      n: counts[nome] || 0
    }));
  }, []);

  const totalHistoricos = useMemo(
    () => MAPAS_HISTORICOS.filter((m) => m.categoria === 'Planta e Carta Histórica').length,
    []
  );
  const totalTombamento = useMemo(
    () => MAPAS_HISTORICOS.filter((m) => m.categoria === 'Mapa de Tombamento').length,
    []
  );

  const temFiltroAtivo = Boolean(busca.trim() || filtroMunicipio || filtroCategoria !== 'todas');
  const limparFiltros = () => {
    setBusca('');
    setFiltroMunicipio('');
    setFiltroCategoria('todas');
  };

  const handleSelectMap = (map: MapaHistorico, scrollToStage = false) => {
    setSelectedMapId(map.id);
    setSelectedPointId(map.points[0]?.id ?? null);
    setSearchParams({ mapa: map.id }, { replace: true });
    if (scrollToStage) {
      document.getElementById('palco-cartografico')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-brand-surface text-slate-800 min-h-screen">
      {/* Cabeçalho Clean de Alto Contraste */}
      <header className="bg-brand-navy text-white py-9 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            Cartografia Histórica & Poligonais · {MAPAS_HISTORICOS.length} pranchas
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white">
            Mapas Históricos e Poligonais de Tombamento
          </h1>
          <p className="mt-2 max-w-[62ch] text-sm sm:text-base text-slate-200 leading-relaxed">
            Explore com zoom interativo ou baixe os arquivos originais das cartas históricas (1698–1912) e dos mapas de tombamento de São Luís, Alcântara, Viana, Caxias e Carolina.
          </p>

          <div className="mt-6 max-w-2xl relative">
            <label htmlFor="mapa-busca" className="sr-only">
              Buscar mapa por cidade, ano ou título
            </label>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="mapa-busca"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar mapa por município, ano ou título (ex.: Alcântara, Viana, 1858)..."
              className="w-full min-h-[48px] rounded-xl bg-white pl-11 pr-4 py-3 text-sm font-medium text-brand-navy placeholder:text-slate-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
        </div>
      </header>

      <section aria-labelledby="linha-tempo-mapas" className="max-w-6xl mx-auto px-4 sm:px-6 py-7 space-y-5">
        {/* Barra Única e Intuitiva de Filtros */}
        <div className="rounded-2xl bg-white border border-[#E5DDD5] p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setFiltroCategoria('todas')}
              className={`min-h-[38px] shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filtroCategoria === 'todas'
                  ? 'bg-brand-navy text-white'
                  : 'bg-brand-surface text-slate-700 hover:bg-brand-sand/60'
              }`}
            >
              Todas ({MAPAS_HISTORICOS.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroCategoria('Planta e Carta Histórica')}
              className={`min-h-[38px] shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filtroCategoria === 'Planta e Carta Histórica'
                  ? 'bg-brand-navy text-white'
                  : 'bg-brand-surface text-slate-700 hover:bg-brand-sand/60'
              }`}
            >
              Históricas ({totalHistoricos})
            </button>
            <button
              type="button"
              onClick={() => setFiltroCategoria('Mapa de Tombamento')}
              className={`min-h-[38px] shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filtroCategoria === 'Mapa de Tombamento'
                  ? 'bg-brand-navy text-white'
                  : 'bg-brand-surface text-slate-700 hover:bg-brand-sand/60'
              }`}
            >
              Tombamento ({totalTombamento})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <label htmlFor="mapa-municipio" className="sr-only">Município</label>
            <select
              id="mapa-municipio"
              value={filtroMunicipio}
              onChange={(e) => setFiltroMunicipio(e.target.value)}
              className="min-h-[38px] rounded-xl border border-[#E5DDD5] bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-blue"
            >
              <option value="">Todos os territórios</option>
              {MUNICIPIOS_MAPA.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {temFiltroAtivo && (
              <button
                type="button"
                onClick={limparFiltros}
                className="min-h-[38px] inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-terracotta hover:bg-brand-terracotta/10"
              >
                <X size={13} aria-hidden="true" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Barra Horizontal Compacta de Seleção Rápida */}
        {mapasFiltrados.length > 0 && (
          <div
            role="tablist"
            aria-label="Selecionar prancha no visor interativo"
            className="flex gap-2 overflow-x-auto pb-1 snap-x -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {mapasFiltrados.map((mapa) => {
              const isSelected = mapa.id === activeMap.id;
              return (
                <button
                  key={mapa.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectMap(mapa, false)}
                  className={`snap-start shrink-0 min-h-[42px] px-3.5 py-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                      : 'bg-white text-brand-navy border-[#E5DDD5] hover:border-brand-navy/40'
                  }`}
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                      isSelected
                        ? 'bg-brand-gold'
                        : mapa.categoria === 'Mapa de Tombamento'
                        ? 'bg-brand-terracotta'
                        : 'bg-brand-blue'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-bold whitespace-nowrap">{mapa.ano}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Palco Principal Interativo */}
        <div id="palco-cartografico" className="bg-brand-navy text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl scroll-mt-20">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5 pb-5 border-b border-white/15">
            <div className="space-y-2 max-w-3xl">
              <p className="text-xs text-brand-gold font-bold uppercase tracking-wider">
                {activeMap.categoria} · {activeMap.municipio}
              </p>
              <h2 id="linha-tempo-mapas" className="font-serif text-xl sm:text-2xl font-medium text-white leading-snug">
                {activeMap.titulo}
              </h2>
              <p className="text-sm text-slate-200 leading-relaxed max-w-[65ch]">{activeMap.resumo}</p>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <a
                  href={activeMap.downloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-xs font-black text-brand-navy hover:bg-[#F1C56A] transition-colors"
                >
                  <Download size={15} aria-hidden="true" />
                  <span>Baixar Original ({activeMap.formatoDownload})</span>
                </a>

                {activeMap.downloadUrl.endsWith('.pdf') && (
                  <a
                    href={activeMap.srcFull || activeMap.src}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    <ImageIcon size={14} aria-hidden="true" />
                    <span>Baixar JPG</span>
                  </a>
                )}

                {activeMap.municipiosRelacionados.length === 1 && (
                  <Link
                    to={`/bens-tombados?municipio=${encodeURIComponent(activeMap.municipiosRelacionados[0])}`}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    <Landmark size={14} aria-hidden="true" />
                    <span>Bens de {activeMap.municipiosRelacionados[0]}</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-white/5 border border-white/10 rounded-2xl p-4 lg:max-w-xs shrink-0 space-y-1">
              <p className="font-bold text-white">Autoria e Fonte</p>
              <p>{activeMap.autor}</p>
              <p className="text-slate-300">{activeMap.fonte}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <PanZoomImage
                src={activeMap.src}
                srcFull={activeMap.srcFull}
                width={activeMap.width}
                height={activeMap.height}
                alt={activeMap.alt}
                points={activeMap.points}
                onSelectPoint={(ptId) => setSelectedPointId(ptId)}
              />
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-[68ch]">
                <strong className="text-white">Leitura patrimonial:</strong> {activeMap.leituraUrbana}
              </p>
            </div>

            <aside
              aria-live="polite"
              className="lg:col-span-4 bg-white text-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
            >
              {activePoint ? (
                <>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-terracotta flex items-center gap-1">
                      <MapPin size={12} aria-hidden="true" />
                      Marco selecionado
                    </p>
                    <h3 className="mt-1.5 text-base font-bold text-brand-navy leading-snug">
                      {activePoint.label}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">{activePoint.nomeAtual}</p>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                    {activePoint.descricao}
                  </p>

                  {linkedAssets.length > 0 && (
                    <div className="space-y-2.5 border-t border-slate-100 pt-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                        Bens Tombados Vinculados ({linkedAssets.length})
                      </p>
                      <ul className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                        {linkedAssets.map((bem) => {
                          const pdf = DECRETOS_PDF[bem.decreto.numero];
                          return (
                            <li
                              key={bem.id}
                              className="rounded-xl bg-brand-surface border border-[#E5DDD5] p-3 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                                <span className="font-mono font-bold text-brand-navy">#{bem.id}</span>
                                <span>Dec. {bem.decreto.numero}/{bem.decreto.ano ?? 's/d'}</span>
                              </div>
                              <p className="font-bold text-slate-900 leading-snug">{bem.nome}</p>
                              <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Link
                                  to={`/bens-tombados?q=${encodeURIComponent(bem.id)}`}
                                  className="inline-flex items-center gap-0.5 font-bold text-brand-blue-dark hover:text-brand-navy underline"
                                >
                                  Ver ficha <ArrowUpRight size={11} />
                                </Link>
                                {pdf && (
                                  <a
                                    href={pdf.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 font-bold text-brand-terracotta hover:text-brand-navy underline"
                                  >
                                    <FileText size={11} /> Decreto (PDF)
                                  </a>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  <Link
                    to="/bens-tombados"
                    className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-blue transition-colors"
                  >
                    <BookOpen size={14} aria-hidden="true" />
                    <span>Ver Livro do Tombo completo</span>
                  </Link>
                </>
              ) : (
                <p className="text-sm text-slate-600">
                  Selecione um ponto vermelho no mapa ou nos botões abaixo da imagem para consultar os bens tombados correspondentes.
                </p>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Catálogo Limpo para Download Direto */}
      <section aria-labelledby="catalogo-downloads-mapas" className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <h2 id="catalogo-downloads-mapas" className="font-serif text-xl sm:text-2xl font-medium text-brand-navy mb-4">
          Todas as Pranchas ({mapasFiltrados.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mapasFiltrados.map((mapa) => {
            const isSelected = mapa.id === activeMap.id;
            return (
              <article
                key={`card-${mapa.id}`}
                className={`rounded-2xl p-5 border bg-white transition-all flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'border-brand-navy shadow-md'
                    : 'border-[#E5DDD5] hover:border-brand-navy/35 shadow-sm'
                }`}
              >
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <span className={mapa.categoria === 'Mapa de Tombamento' ? 'text-brand-terracotta' : 'text-brand-blue-dark'}>
                      {mapa.categoria}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{mapa.ano}</span>
                  </p>
                  <h3 className="font-display text-sm sm:text-base font-bold text-brand-navy leading-snug">
                    {mapa.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{mapa.epocaLabel}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectMap(mapa, true)}
                    className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E5DDD5] bg-brand-surface px-3 py-2 text-xs font-bold text-brand-navy hover:bg-brand-sand/60 transition-colors"
                  >
                    <Layers size={13} aria-hidden="true" />
                    <span>{isSelected ? 'Em exibição' : 'Abrir visor'}</span>
                  </button>
                  <a
                    href={mapa.downloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-navy px-3 py-2 text-xs font-bold text-white hover:bg-brand-blue transition-colors"
                  >
                    <Download size={13} aria-hidden="true" />
                    <span>{mapa.downloadUrl.endsWith('.pdf') ? 'Baixar PDF' : 'Baixar'}</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Mapa Estadual dos Municípios */}
      <section aria-labelledby="mapa-municipios-titulo" className="bg-white border-t border-[#E5DDD5] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
              Distribuição Estadual
            </p>
            <h2 id="mapa-municipios-titulo" className="font-serif text-2xl font-medium text-brand-navy">
              Municípios com Bens Tombados
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-prose">
              Clique em qualquer município no mapa para filtrar suas inscrições estaduais e acessar os decretos e mapas de tombamento correspondentes.
            </p>
            <div className="pt-1">
              <Link
                to="/bens-tombados"
                className="inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-blue transition-colors"
              >
                <Landmark size={15} aria-hidden="true" />
                <span>Explorar Bens Tombados</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <MunicipiosMap
              points={municipioPoints}
              selected={selectedMunicipio}
              onSelect={(mun) => {
                setSelectedMunicipio(mun);
                if (mun) navigate(`/bens-tombados?municipio=${encodeURIComponent(mun)}`);
              }}
              height={340}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CartografiaPage;
