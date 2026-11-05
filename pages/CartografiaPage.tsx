import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, FileText, Landmark, MapPin, ArrowUpRight, Layers, BookOpen } from 'lucide-react';
import { PanZoomImage } from '../components/ui/PanZoomImage';
import { MAPAS_HISTORICOS, type MapaHistorico, type PontoMapaHistorico } from '../data/mapasHistoricos';
import { BENS_TOMBADOS, DECRETOS_PDF, type BemTombado } from '../data/bensTombados';
import { MunicipiosMap, SEDE_MUNICIPIO, type MapPoint } from '../components/dataviz/MunicipiosMap';
import { usePageTitle } from '../hooks/usePageTitle';

export const CartografiaPage: React.FC = () => {
  usePageTitle('Cartografia histórica e mapas');
  const navigate = useNavigate();

  const [selectedMapId, setSelectedMapId] = useState<string>(MAPAS_HISTORICOS[0].id);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(MAPAS_HISTORICOS[0].points[0]?.id ?? null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);

  const activeMap: MapaHistorico = useMemo(
    () => MAPAS_HISTORICOS.find((m) => m.id === selectedMapId) || MAPAS_HISTORICOS[0],
    [selectedMapId]
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

  const handleSelectMap = (map: MapaHistorico) => {
    setSelectedMapId(map.id);
    setSelectedPointId(map.points[0]?.id ?? null);
  };

  return (
    <div className="bg-[#FAF8F5] text-slate-800 min-h-screen">
      {/* Cabeçalho Institucional da Cartografia */}
      <header className="bg-[#071D33] text-white border-b border-brand-sand/30 py-10">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E9B44C]">
            <Compass size={15} aria-hidden="true" />
            <span>Cartografia Histórica & Território</span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white">
            Mapas e Plantas Históricas do Maranhão
          </h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-200 leading-relaxed">
            Explore a evolução urbana de São Luís por meio de gravuras e plantas históricas digitalizadas.
            Selecione um período abaixo e clique nos marcos assinalados na planta para consultar as fichas de
            tombamento estadual e os respectivos decretos na relação oficial da SPC.
          </p>
        </div>
      </header>

      {/* Seção 1: Linha do Tempo de Mapas Históricos */}
      <section aria-labelledby="linha-tempo-mapas" className="max-w-[1240px] mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
              Linha do Tempo Cartográfica ({MAPAS_HISTORICOS.length} pranchas disponíveis)
            </span>
            <h2 id="linha-tempo-mapas" className="text-2xl font-black text-brand-navy mt-1">
              Selecione a época ou prancha histórica
            </h2>
          </div>
          <Link
            to="/bens-tombados"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-navy underline underline-offset-4 hover:text-brand-terracotta"
          >
            <Landmark size={15} aria-hidden="true" />
            Ver catálogo completo dos {BENS_TOMBADOS.length} bens tombados
          </Link>
        </div>

        {/* Abas / Cartões Seletores de Mapa */}
        <div
          role="tablist"
          aria-label="Plantas históricas disponíveis"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {MAPAS_HISTORICOS.map((mapa) => {
            const isSelected = mapa.id === activeMap.id;
            return (
              <button
                key={mapa.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleSelectMap(mapa)}
                className={`text-left rounded-2xl p-5 border-2 transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-brand-navy text-white border-brand-navy shadow-lg'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-brand-terracotta/60 hover:bg-amber-50/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        isSelected ? 'bg-[#E9B44C] text-brand-navy' : 'bg-slate-100 text-brand-navy'
                      }`}
                    >
                      {mapa.ano}
                    </span>
                    <span className={`text-[11px] font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {mapa.points.length} marcos mapeados
                    </span>
                  </div>
                  <h3 className={`mt-2.5 text-base font-bold leading-snug ${isSelected ? 'text-white' : 'text-brand-navy'}`}>
                    {mapa.titulo}
                  </h3>
                  <p className={`mt-1 text-xs line-clamp-2 ${isSelected ? 'text-slate-200' : 'text-slate-600'}`}>
                    {mapa.epocaLabel} · {mapa.autor}
                  </p>
                </div>
                <div className={`text-[11px] font-bold flex items-center gap-1 ${isSelected ? 'text-[#E9B44C]' : 'text-brand-terracotta'}`}>
                  <Layers size={13} aria-hidden="true" />
                  <span>{isSelected ? 'Planta em exibição abaixo' : 'Alternar para esta planta'}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Palco Principal: PanZoomImage + Ficha do Marco Selecionado */}
        <div className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 pb-6 border-b border-white/15">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#E9B44C] font-bold uppercase tracking-wider">
                <span>{activeMap.municipio}</span>
                <span aria-hidden="true">·</span>
                <span>{activeMap.epocaLabel}</span>
              </div>
              <h3 className="text-2xl font-black text-white">{activeMap.titulo}</h3>
              <p className="text-sm text-slate-200 leading-relaxed">{activeMap.resumo}</p>
            </div>
            <div className="text-xs text-slate-300 bg-white/5 border border-white/10 rounded-2xl p-4 lg:max-w-xs shrink-0 space-y-1">
              <p className="font-bold text-white">Autoria e Fonte Documental</p>
              <p>{activeMap.autor}</p>
              <p className="text-slate-300">{activeMap.fonte}</p>
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
                <strong>Leitura urbana:</strong> {activeMap.leituraUrbana}
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
                      Marco selecionado na planta
                    </span>
                    <h4 className="mt-2 text-lg font-black text-brand-navy leading-snug">
                      “{activePoint.label}”
                    </h4>
                    <p className="text-xs font-bold text-slate-600 mt-0.5">
                      Denominação atual: <span className="text-slate-900">{activePoint.nomeAtual}</span>
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
                      <ul className="space-y-2.5">
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

                  <div className="pt-2">
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

      {/* Seção 2: Mapa Geográfico dos Municípios Maranhenses com Bens Tombados */}
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
                Além da cartografia histórica de São Luís, o cadastro oficial da SPC abrange{' '}
                <strong>{BENS_TOMBADOS.length} inscrições estaduais</strong> distribuídas em{' '}
                <strong>{municipioPoints.length} municípios maranhenses</strong> (incluindo Alcântara, Caxias, Viana, Carolina, Itapecuru-Mirim, Pindaré-Mirim, Paço do Lumiar, Rosário, Barreirinhas e Buriti).
              </p>
              <p className="text-xs text-slate-600">
                Clique em um círculo no mapa ao lado ou acesse a página de Bens Tombados para filtrar as inscrições e baixar os decretos de tombamento.
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

