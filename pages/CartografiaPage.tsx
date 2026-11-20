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
  ShieldCheck
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
    if (filtroCategoria === 'todas') return MAPAS_HISTORICOS;
    return MAPAS_HISTORICOS.filter((m) => m.categoria === filtroCategoria);
  }, [filtroCategoria]);

  const activeMap: MapaHistorico = useMemo(
    () => MAPAS_HISTORICOS.find((m) => m.id === selectedMapId) || mapasFiltrados[0] || MAPAS_HISTORICOS[0],
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

  const handleSelectMap = (map: MapaHistorico, scrollToStage = false) => {
    setSelectedMapId(map.id);
    setSelectedPointId(map.points[0]?.id ?? null);
    setSearchParams({ mapa: map.id }, { replace: true });
    if (scrollToStage) {
      document.getElementById('palco-cartografico')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectCategoria = (cat: 'todas' | CategoriaMapa) => {
    setFiltroCategoria(cat);
    const list = cat === 'todas' ? MAPAS_HISTORICOS : MAPAS_HISTORICOS.filter((m) => m.categoria === cat);
    if (list.length > 0 && !list.some((m) => m.id === activeMap.id)) {
      setSelectedMapId(list[0].id);
      setSelectedPointId(list[0].points[0]?.id ?? null);
    }
  };

  return (
    <div className="bg-brand-surface text-slate-800 min-h-screen">
      {/* Cabeçalho Compacto e Mobile-First */}
      <header className="bg-brand-navy text-white border-b border-brand-sand/30 py-7 sm:py-9">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
            <Compass size={15} aria-hidden="true" />
            <span>Cartografia Histórica & Poligonais</span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-4xl font-black tracking-tight text-white">
            Mapas Históricos e Poligonais de Tombamento
          </h1>
          <p className="mt-2 max-w-prose text-sm sm:text-base text-slate-200 leading-relaxed">
            Explore com zoom interativo ou baixe os arquivos originais das{' '}
            <strong className="text-white">{MAPAS_HISTORICOS.length} pranchas oficiais</strong> da SPC/SECMA: cartas
            históricas (1698–1912) e mapas de tombamento de São Luís, Alcântara, Viana, Caxias e Carolina.
          </p>
        </div>
      </header>

      {/* Seção 1: Seletor Rápido Horizontal + Visor Interativo IMEDIATAMENTE ACIMA DA DOBRA */}
      <section aria-labelledby="linha-tempo-mapas" className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h2 id="linha-tempo-mapas" className="text-lg sm:text-xl font-black text-brand-navy">
            Visor Interativo ({mapasFiltrados.length} pranchas)
          </h2>

          {/* Filtro Rápido de Categoria (Touch-friendly >= 40px) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              type="button"
              onClick={() => handleSelectCategoria('todas')}
              className={`min-h-[40px] shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filtroCategoria === 'todas'
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-navy/40'
              }`}
            >
              Todas ({MAPAS_HISTORICOS.length})
            </button>
            <button
              type="button"
              onClick={() => handleSelectCategoria('Planta e Carta Histórica')}
              className={`min-h-[40px] shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filtroCategoria === 'Planta e Carta Histórica'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-blue'
              }`}
            >
              Históricas ({totalHistoricos})
            </button>
            <button
              type="button"
              onClick={() => handleSelectCategoria('Mapa de Tombamento')}
              className={`min-h-[40px] shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filtroCategoria === 'Mapa de Tombamento'
                  ? 'bg-brand-terracotta text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-terracotta'
              }`}
            >
              Tombamento ({totalTombamento})
            </button>
          </div>
        </div>

        {/* Barra Horizontal Compacta de Seleção Rápida (Deslize no Mobile / 1 clique no Desktop) */}
        <div
          role="tablist"
          aria-label="Alternar prancha no visor interativo"
          className="flex gap-2 overflow-x-auto pb-3 mb-4 snap-x -mx-4 px-4 sm:mx-0 sm:px-0"
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
                className={`snap-start shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-brand-navy text-white border-brand-navy shadow-md'
                    : 'bg-white text-brand-navy border-slate-200 hover:border-brand-terracotta/60'
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

        {/* Palco Principal: PanZoomImage + Ficha do Marco Selecionado */}
        <div id="palco-cartografico" className="bg-brand-navy text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl scroll-mt-20">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5 pb-5 border-b border-white/15">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-brand-gold font-bold uppercase tracking-wider">
                <span>{activeMap.categoria}</span>
                <span aria-hidden="true">·</span>
                <span>{activeMap.municipio}</span>
                <span aria-hidden="true">·</span>
                <span>{activeMap.epocaLabel}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">{activeMap.titulo}</h3>
              <p className="text-sm text-slate-200 leading-relaxed max-w-prose">{activeMap.resumo}</p>

              {/* Botões de Download Direto (Alvo >= 44px no mobile) */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <a
                  href={activeMap.downloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-xs font-black text-brand-navy shadow-md hover:bg-amber-300 transition-colors"
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
                    <span>Baixar Imagem (JPG)</span>
                  </a>
                )}

                {activeMap.municipiosRelacionados.length === 1 && (
                  <Link
                    to={`/bens-tombados?municipio=${encodeURIComponent(activeMap.municipiosRelacionados[0])}`}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    <Landmark size={14} aria-hidden="true" />
                    <span>Tombamentos de {activeMap.municipiosRelacionados[0]}</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-white/5 border border-white/10 rounded-2xl p-4 lg:max-w-xs shrink-0 space-y-1.5">
              <p className="font-bold text-white">Autoria e Fonte Documental</p>
              <p>{activeMap.autor}</p>
              <p className="text-slate-300">{activeMap.fonte}</p>
              <p className="text-xs text-brand-gold pt-1 font-semibold">
                Resolução base: {activeMap.width} × {activeMap.height} px
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Coluna da Planta Interativa (8 colunas no desktop) */}
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
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-prose">
                <strong className="text-white">Leitura urbana e patrimonial:</strong> {activeMap.leituraUrbana}
              </p>
            </div>

            {/* Coluna da Ficha de Correspondência Patrimonial (4 colunas no desktop) */}
            <aside
              aria-live="polite"
              className="lg:col-span-4 bg-white text-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-200 space-y-4"
            >
              {activePoint ? (
                <>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-terracotta/15 text-brand-terracotta text-xs font-black uppercase tracking-wider">
                      <MapPin size={12} aria-hidden="true" />
                      Marco selecionado
                    </span>
                    <h4 className="mt-2 text-base sm:text-lg font-black text-brand-navy leading-snug">
                      “{activePoint.label}”
                    </h4>
                    <p className="text-xs font-bold text-slate-600 mt-0.5">
                      Correspondência: <span className="text-slate-900">{activePoint.nomeAtual}</span>
                    </p>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                    {activePoint.descricao}
                  </p>

                  {linkedAssets.length > 0 && (
                    <div className="space-y-3 border-t border-slate-200 pt-4">
                      <h5 className="text-xs font-black uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
                        <Landmark size={14} className="text-brand-terracotta" aria-hidden="true" />
                        Bens Tombados Relacionados ({linkedAssets.length})
                      </h5>
                      <ul className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                        {linkedAssets.map((bem) => {
                          const pdf = DECRETOS_PDF[bem.decreto.numero];
                          return (
                            <li
                              key={bem.id}
                              className="rounded-xl bg-brand-surface border border-slate-200 p-3.5 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-black text-brand-navy">Inscrição #{bem.id}</span>
                                <span className="px-2 py-0.5 rounded bg-brand-navy/10 text-brand-navy font-bold">
                                  Dec. {bem.decreto.numero}/{bem.decreto.ano ?? 's/d'}
                                </span>
                              </div>
                              <p className="font-bold text-slate-900 leading-snug">{bem.nome}</p>
                              {bem.local && <p className="text-slate-600">{bem.local} — {bem.municipio}</p>}
                              <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Link
                                  to={`/bens-tombados?q=${encodeURIComponent(bem.id)}`}
                                  className="inline-flex items-center gap-1 font-bold text-brand-navy underline hover:text-brand-terracotta"
                                >
                                  <span>Ver ficha #{bem.id}</span>
                                  <ArrowUpRight size={12} aria-hidden="true" />
                                </Link>
                                {pdf && (
                                  <a
                                    href={pdf.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-bold text-brand-terracotta underline hover:text-brand-navy"
                                  >
                                    <FileText size={12} aria-hidden="true" />
                                    <span>Decreto (PDF)</span>
                                  </a>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 space-y-2">
                    <a
                      href={activeMap.downloadUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-sage-dark text-white text-xs font-bold hover:bg-brand-navy transition"
                    >
                      <Download size={14} aria-hidden="true" />
                      <span>Baixar Prancha ({activeMap.downloadUrl.endsWith('.pdf') ? 'PDF' : 'Imagem'})</span>
                    </a>
                    <Link
                      to="/bens-tombados"
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy/90 transition"
                    >
                      <BookOpen size={14} aria-hidden="true" />
                      <span>Explorar Livro de Tombo completo</span>
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-600">
                  Toque em qualquer ponto vermelho sobre a planta ou nos botões abaixo da imagem para consultar os bens tombados vinculados.
                </p>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Seção 2: Biblioteca Completa de Pranchas e Download Direto */}
      <section aria-labelledby="catalogo-downloads-mapas" className="max-w-[1240px] mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-terracotta">
                <ShieldCheck size={14} aria-hidden="true" />
                Repositório Cartográfico Aberto (SPC/DPHAP)
              </span>
              <h2 id="catalogo-downloads-mapas" className="text-xl sm:text-2xl font-black text-brand-navy mt-1">
                Catálogo Completo para Interação e Download ({mapasFiltrados.length} pranchas)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-prose">
                Baixe os arquivos originais em PDF vetorial ou imagem de alta resolução para instrução de processos, pesquisas acadêmicas e projetos arquitetônicos.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mapasFiltrados.map((mapa) => {
              const isSelected = mapa.id === activeMap.id;
              const isTombamento = mapa.categoria === 'Mapa de Tombamento';
              return (
                <article
                  key={`card-${mapa.id}`}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-brand-navy/5 border-brand-navy shadow-sm'
                      : 'bg-brand-surface border-slate-200 hover:border-brand-terracotta/50'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          isTombamento
                            ? 'bg-brand-terracotta/15 text-brand-terracotta'
                            : 'bg-brand-blue/15 text-brand-blue-dark'
                        }`}
                      >
                        {mapa.ano}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{mapa.points.length} marcos</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-brand-navy leading-snug">{mapa.titulo}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{mapa.epocaLabel} · {mapa.autor}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectMap(mapa, true)}
                      className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-brand-navy hover:bg-slate-100 transition-colors"
                    >
                      <Layers size={13} aria-hidden="true" />
                      <span>{isSelected ? 'No visor acima' : 'Abrir no visor'}</span>
                    </button>
                    <a
                      href={mapa.downloadUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-navy px-3 py-2 text-xs font-bold text-white hover:bg-brand-blue transition-colors"
                    >
                      <Download size={13} aria-hidden="true" />
                      <span>{mapa.downloadUrl.endsWith('.pdf') ? 'Baixar PDF' : 'Baixar Mapa'}</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Seção 3: Mapa Geográfico dos Municípios Maranhenses com Bens Tombados */}
      <section aria-labelledby="mapa-municipios-titulo" className="bg-white border-t border-slate-200 py-10 sm:py-12">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
                Distribuição Estadual (SPC/DPHAP)
              </span>
              <h2 id="mapa-municipios-titulo" className="text-2xl font-black text-brand-navy">
                Municípios com Bens Tombados no Maranhão
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed max-w-prose">
                O cadastro oficial da SPC abrange{' '}
                <strong>{BENS_TOMBADOS.length} inscrições estaduais</strong> distribuídas em{' '}
                <strong>{municipioPoints.length} municípios maranhenses</strong> (incluindo São Luís, Alcântara, Caxias, Viana, Carolina, Itapecuru-Mirim, Pindaré-Mirim, Paço do Lumiar, Rosário, Barreirinhas e Buriti).
              </p>
              <div className="pt-1">
                <Link
                  to="/bens-tombados"
                  className="inline-flex min-h-[44px] items-center gap-2 px-5 py-3 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy/90 transition"
                >
                  <Landmark size={15} aria-hidden="true" />
                  <span>Filtrar bens por município e época</span>
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
                height={360}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CartografiaPage;
