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

  const handleSelectMap = (map: MapaHistorico) => {
    setSelectedMapId(map.id);
    setSelectedPointId(map.points[0]?.id ?? null);
    setSearchParams({ mapa: map.id }, { replace: true });
    document.getElementById('palco-cartografico')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    <div className="bg-[#FAF8F5] text-slate-800 min-h-screen">
      {/* Cabeçalho Institucional da Cartografia */}
      <header className="bg-[#071D33] text-white border-b border-brand-sand/30 py-10">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E9B44C]">
            <Compass size={15} aria-hidden="true" />
            <span>Cartografia Histórica & Poligonais de Tombamento</span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white">
            Mapas Históricos e Poligonais de Tombamento do Maranhão
          </h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-200 leading-relaxed">
            Explore interativamente e faça o download de{' '}
            <strong className="text-white">{MAPAS_HISTORICOS.length} pranchas e mapas oficiais</strong> do acervo da
            SPC/SECMA: cartas históricas do Maranhão e de São Luís (1698, 1819, 1858 e 1912) e mapas de tombamento e
            delimitação de poligonais de <strong>São Luís, Alcântara, Viana, Caxias e Carolina</strong>.
          </p>
        </div>
      </header>

      {/* Seção 1: Seletor de Categoria + Pranchas Interativas */}
      <section aria-labelledby="linha-tempo-mapas" className="max-w-[1240px] mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
              Acervo Cartográfico Digital ({MAPAS_HISTORICOS.length} pranchas interativas e para download)
            </span>
            <h2 id="linha-tempo-mapas" className="text-2xl font-black text-brand-navy mt-1">
              Selecione a prancha histórica ou mapa de tombamento
            </h2>
          </div>

          {/* Filtro Rápido de Categoria */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectCategoria('todas')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filtroCategoria === 'todas'
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-navy/40'
              }`}
            >
              Todas as pranchas ({MAPAS_HISTORICOS.length})
            </button>
            <button
              type="button"
              onClick={() => handleSelectCategoria('Planta e Carta Histórica')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filtroCategoria === 'Planta e Carta Histórica'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-blue'
              }`}
            >
              Plantas e Cartas Históricas ({totalHistoricos})
            </button>
            <button
              type="button"
              onClick={() => handleSelectCategoria('Mapa de Tombamento')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filtroCategoria === 'Mapa de Tombamento'
                  ? 'bg-brand-terracotta text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-terracotta'
              }`}
            >
              Mapas de Tombamento ({totalTombamento})
            </button>
          </div>
        </div>

        {/* Abas / Cartões Seletores de Mapa */}
        <div
          role="tablist"
          aria-label="Plantas históricas e mapas de tombamento disponíveis"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          {mapasFiltrados.map((mapa) => {
            const isSelected = mapa.id === activeMap.id;
            const isTombamento = mapa.categoria === 'Mapa de Tombamento';
            return (
              <div
                key={mapa.id}
                className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-brand-navy text-white border-brand-navy shadow-lg'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-brand-terracotta/60 hover:bg-amber-50/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        isSelected
                          ? 'bg-[#E9B44C] text-brand-navy'
                          : isTombamento
                          ? 'bg-brand-terracotta/15 text-brand-terracotta'
                          : 'bg-slate-100 text-brand-navy'
                      }`}
                    >
                      {mapa.ano}
                    </span>
                    <span className={`text-[11px] font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {mapa.categoria} · {mapa.points.length} marcos
                    </span>
                  </div>
                  <h3 className={`mt-2.5 text-base font-bold leading-snug ${isSelected ? 'text-white' : 'text-brand-navy'}`}>
                    {mapa.titulo}
                  </h3>
                  <p className={`mt-1 text-xs line-clamp-2 ${isSelected ? 'text-slate-200' : 'text-slate-600'}`}>
                    {mapa.epocaLabel} · {mapa.autor}
                  </p>
                </div>

                <div className="pt-2 border-t border-current/10 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleSelectMap(mapa)}
                    className={`text-xs font-bold inline-flex items-center gap-1.5 ${
                      isSelected ? 'text-[#E9B44C]' : 'text-brand-navy hover:text-brand-terracotta'
                    }`}
                  >
                    <Layers size={14} aria-hidden="true" />
                    <span>{isSelected ? 'Em exibição no visor abaixo' : 'Interagir no visor (Zoom/Pinos)'}</span>
                  </button>

                  <a
                    href={mapa.downloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                      isSelected
                        ? 'bg-white/15 text-white hover:bg-white/25'
                        : 'bg-brand-sage-dark/10 text-brand-sage-dark hover:bg-brand-sage-dark hover:text-white'
                    }`}
                    title={`Baixar arquivo original (${mapa.formatoDownload})`}
                  >
                    <Download size={12} aria-hidden="true" />
                    <span>Baixar ({mapa.downloadUrl.endsWith('.pdf') ? 'PDF' : 'Imagem'})</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Palco Principal: PanZoomImage + Ficha do Marco Selecionado */}
        <div id="palco-cartografico" className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 shadow-xl scroll-mt-20">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 pb-6 border-b border-white/15">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#E9B44C] font-bold uppercase tracking-wider">
                <span>{activeMap.categoria}</span>
                <span aria-hidden="true">·</span>
                <span>{activeMap.municipio}</span>
                <span aria-hidden="true">·</span>
                <span>{activeMap.epocaLabel}</span>
              </div>
              <h3 className="text-2xl font-black text-white">{activeMap.titulo}</h3>
              <p className="text-sm text-slate-200 leading-relaxed">{activeMap.resumo}</p>

              {/* Botões de Download Direto e Abertura em Tela Cheia da Prancha Selecionada */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={activeMap.downloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E9B44C] px-4 py-2.5 text-xs font-black text-brand-navy shadow-md hover:bg-amber-300 transition-colors"
                >
                  <Download size={15} aria-hidden="true" />
                  <span>Baixar Mapa Original ({activeMap.formatoDownload})</span>
                </a>

                {activeMap.downloadUrl.endsWith('.pdf') && (
                  <a
                    href={activeMap.srcFull || activeMap.src}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    <ImageIcon size={14} aria-hidden="true" />
                    <span>Baixar Versão em Imagem (JPG)</span>
                  </a>
                )}

                {activeMap.municipiosRelacionados.length === 1 && (
                  <Link
                    to={`/bens-tombados?municipio=${encodeURIComponent(activeMap.municipiosRelacionados[0])}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    <Landmark size={14} aria-hidden="true" />
                    <span>Ver Bens Tombados de {activeMap.municipiosRelacionados[0]}</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-white/5 border border-white/10 rounded-2xl p-4 lg:max-w-xs shrink-0 space-y-1.5">
              <p className="font-bold text-white">Autoria e Fonte Documental</p>
              <p>{activeMap.autor}</p>
              <p className="text-slate-300">{activeMap.fonte}</p>
              <p className="text-[11px] text-[#E9B44C] pt-1 font-semibold">
                Dimensões base: {activeMap.width} × {activeMap.height} px
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                <strong>Leitura urbana e patrimonial:</strong> {activeMap.leituraUrbana}
              </p>
            </div>

            {/* Coluna da Ficha de Correspondência Patrimonial (4 colunas no desktop) */}
            <aside
              aria-live="polite"
              className="lg:col-span-4 bg-white text-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 space-y-5"
            >
              {activePoint ? (
                <>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-terracotta/15 text-brand-terracotta text-[11px] font-black uppercase tracking-wider">
                      <MapPin size={12} aria-hidden="true" />
                      Marco selecionado na prancha
                    </span>
                    <h4 className="mt-2 text-lg font-black text-brand-navy leading-snug">
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
                      <ul className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                        {linkedAssets.map((bem) => {
                          const pdf = DECRETOS_PDF[bem.decreto.numero];
                          return (
                            <li
                              key={bem.id}
                              className="rounded-xl bg-[#FAF8F5] border border-slate-200 p-3.5 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-black text-brand-navy">
                                  Inscrição nº {bem.id} · Livro de Tombo
                                </span>
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
                                  <span>Ver ficha #{bem.id} no catálogo</span>
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
                                    <span>Abrir Decreto (PDF)</span>
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
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-sage-dark text-white text-xs font-bold hover:bg-brand-navy transition"
                    >
                      <Download size={14} aria-hidden="true" />
                      <span>Baixar esta Prancha ({activeMap.formatoDownload})</span>
                    </a>
                    <Link
                      to="/bens-tombados"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy/90 transition"
                    >
                      <BookOpen size={14} aria-hidden="true" />
                      <span>Explorar Livro de Tombo completo</span>
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-600">
                  Clique em qualquer ponto vermelho sobre a planta ou nos botões abaixo da imagem para ver o vínculo com os bens tombados.
                </p>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Seção 2: Biblioteca de Download Direto de Mapas de Tombamento e Cartas Históricas */}
      <section aria-labelledby="catalogo-downloads-mapas" className="max-w-[1240px] mx-auto px-6 pb-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-terracotta">
                <ShieldCheck size={14} aria-hidden="true" />
                Repositório Cartográfico Aberto (SPC/DPHAP)
              </span>
              <h2 id="catalogo-downloads-mapas" className="text-xl sm:text-2xl font-black text-brand-navy mt-1">
                Download Direto de Mapas de Tombamento e Plantas Históricas
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Baixe os arquivos originais em PDF vetorial ou imagem de alta resolução para instrução de processos, pesquisas acadêmicas e projetos arquitetônicos.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {MAPAS_HISTORICOS.map((mapa) => (
              <div
                key={`dl-${mapa.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4 hover:border-brand-navy/30 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        mapa.categoria === 'Mapa de Tombamento'
                          ? 'bg-brand-terracotta/15 text-brand-terracotta'
                          : 'bg-brand-blue/15 text-brand-blue-dark'
                      }`}
                    >
                      {mapa.categoria}
                    </span>
                    <span className="text-xs font-bold text-brand-navy">{mapa.municipio}</span>
                    <span className="text-[11px] text-slate-500">· {mapa.ano}</span>
                  </div>
                  <h3 className="text-sm font-bold text-brand-navy leading-snug">{mapa.titulo}</h3>
                  <p className="text-xs text-slate-500 truncate">{mapa.fonte}</p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSelectMap(mapa)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-brand-navy hover:bg-slate-100 transition-colors"
                  >
                    <Layers size={13} aria-hidden="true" />
                    <span>Interagir</span>
                  </button>
                  <a
                    href={mapa.downloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-navy px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-blue transition-colors"
                  >
                    <Download size={13} aria-hidden="true" />
                    <span>{mapa.downloadUrl.endsWith('.pdf') ? 'Baixar PDF' : 'Baixar Mapa'}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 3: Mapa Geográfico dos Municípios Maranhenses com Bens Tombados */}
      <section aria-labelledby="mapa-municipios-titulo" className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
                Distribuição Estadual (SPC/DPHAP)
              </span>
              <h2 id="mapa-municipios-titulo" className="text-2xl font-black text-brand-navy">
                Municípios com Bens Tombados no Maranhão
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                Além da cartografia histórica e das poligonais de tombamento, o cadastro oficial da SPC abrange{' '}
                <strong>{BENS_TOMBADOS.length} inscrições estaduais</strong> distribuídas em{' '}
                <strong>{municipioPoints.length} municípios maranhenses</strong> (incluindo São Luís, Alcântara, Caxias, Viana, Carolina, Itapecuru-Mirim, Pindaré-Mirim, Paço do Lumiar, Rosário, Barreirinhas e Buriti).
              </p>
              <p className="text-xs text-slate-600">
                Clique em um círculo no mapa ao lado ou acesse a página de Bens Tombados para filtrar as inscrições e baixar os decretos e mapas de tombamento de cada município.
              </p>
              <div className="pt-2">
                <Link
                  to="/bens-tombados"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy/90 transition"
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
                height={380}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CartografiaPage;
