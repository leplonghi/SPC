import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  FileText,
  Landmark,
  MapPin,
  ArrowUpRight,
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

  const totalHistoricos = MAPAS_HISTORICOS.filter((m) => m.categoria === 'Planta e Carta Histórica').length;
  const totalTombamento = MAPAS_HISTORICOS.filter((m) => m.categoria === 'Mapa de Tombamento').length;

  const temFiltroAtivo = Boolean(busca.trim() || filtroMunicipio || filtroCategoria !== 'todas');
  const limparFiltros = () => {
    setBusca('');
    setFiltroMunicipio('');
    setFiltroCategoria('todas');
  };

  const handleSelectMap = (map: MapaHistorico) => {
    setSelectedMapId(map.id);
    setSelectedPointId(map.points[0]?.id ?? null);
    setSearchParams({ mapa: map.id }, { replace: true });
  };

  return (
    <div className="bg-brand-surface text-slate-800 min-h-screen">
      {/* Cabeçalho Mapoteca: Marinho + Ouro + Fotografia Aérea */}
      <header className="relative overflow-hidden bg-[#071D33] text-white py-9 sm:py-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-30 saturate-110"
          style={{ backgroundImage: "url('/cena-fotos/aerea.webp')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#071D33]/95 via-[#071D33]/82 to-[#071D33]/65"
        />
        <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E9B44C] flex items-center gap-1.5">
            <Compass size={14} aria-hidden="true" />
            <span>Mapoteca Digital · {MAPAS_HISTORICOS.length} pranchas oficiais</span>
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-white">
            Explorador de Mapas e Poligonais
          </h1>
          <p className="mt-2 max-w-[62ch] text-sm sm:text-base text-slate-100 leading-relaxed">
            Escolha uma prancha na lateral para aproximar com zoom, clicar nos marcos históricos e baixar o arquivo original em PDF ou alta resolução.
          </p>

          <div className="mt-5 max-w-2xl relative">
            <label htmlFor="mapa-busca" className="sr-only">Buscar mapa</label>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="mapa-busca"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por cidade, ano ou tipo (ex.: Alcântara, Viana, 1858, Caxias, Carolina)..."
              className="w-full min-h-[48px] rounded-xl bg-white pl-11 pr-4 py-3 text-sm font-medium text-[#071D33] placeholder:text-slate-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#E9B44C]"
            />
          </div>
        </div>
      </header>

      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Filtros em 1 Clique */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFiltroCategoria('todas')}
              className={`min-h-[38px] shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filtroCategoria === 'todas'
                  ? 'bg-[#071D33] text-white shadow-sm'
                  : 'bg-white border border-[#E5DDD5] text-[#071D33] hover:border-[#071D33]'
              }`}
            >
              Todas ({MAPAS_HISTORICOS.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroCategoria('Planta e Carta Histórica')}
              className={`min-h-[38px] shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filtroCategoria === 'Planta e Carta Histórica'
                  ? 'bg-[#2F5F78] text-white shadow-sm'
                  : 'bg-white border border-[#E5DDD5] text-[#071D33] hover:border-[#2F5F78]'
              }`}
            >
              Cartas Históricas ({totalHistoricos})
            </button>
            <button
              type="button"
              onClick={() => setFiltroCategoria('Mapa de Tombamento')}
              className={`min-h-[38px] shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filtroCategoria === 'Mapa de Tombamento'
                  ? 'bg-[#B94734] text-white shadow-sm'
                  : 'bg-white border border-[#E5DDD5] text-[#071D33] hover:border-[#B94734]'
              }`}
            >
              Poligonais de Tombamento ({totalTombamento})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filtrar por território"
              value={filtroMunicipio}
              onChange={(e) => setFiltroMunicipio(e.target.value)}
              className="min-h-[38px] rounded-xl border border-[#E5DDD5] bg-white px-3 py-1.5 text-xs font-semibold text-[#071D33]"
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
                className="min-h-[38px] inline-flex items-center gap-1 px-2.5 text-xs font-bold text-[#B94734] hover:underline"
              >
                <X size={13} /> Limpar
              </button>
            )}
          </div>
        </div>

        {/* LAYOUT EXPLORADOR MAPOTECA: Lista Lateral (Desktop) / Pills (Mobile) + Visor Interativo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Mobile: Barra horizontal rápida */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 snap-x">
            {mapasFiltrados.map((mapa) => {
              const selected = mapa.id === activeMap.id;
              return (
                <button
                  key={mapa.id}
                  type="button"
                  onClick={() => handleSelectMap(mapa)}
                  className={`snap-start shrink-0 min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-bold whitespace-nowrap ${
                    selected
                      ? 'bg-[#071D33] text-white border-[#071D33]'
                      : 'bg-white text-[#071D33] border-[#E5DDD5]'
                  }`}
                >
                  {mapa.ano}
                </button>
              );
            })}
          </div>

          {/* Desktop: Lista Lateral Compacta com Download em 1 Clique */}
          <aside className="hidden lg:block lg:col-span-4 bg-white rounded-2xl border border-[#E5DDD5] shadow-sm overflow-hidden sticky top-20">
            <div className="px-4 py-3 border-b border-slate-100 bg-[#FAF8F5] flex items-center justify-between text-xs">
              <span className="font-bold text-[#071D33]">{mapasFiltrados.length} pranchas</span>
              <span className="text-slate-500">Clique para visualizar</span>
            </div>
            <ul className="divide-y divide-slate-100 max-h-[75vh] overflow-y-auto">
              {mapasFiltrados.map((mapa) => {
                const isSelected = mapa.id === activeMap.id;
                const isTombamento = mapa.categoria === 'Mapa de Tombamento';
                return (
                  <li key={mapa.id}>
                    <div
                      className={`px-4 py-3.5 transition-colors border-l-4 flex items-start justify-between gap-2 ${
                        isSelected
                          ? isTombamento
                            ? 'bg-[#B94734]/10 border-l-[#B94734]'
                            : 'bg-[#071D33]/8 border-l-[#071D33]'
                          : 'bg-white border-l-transparent hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectMap(mapa)}
                        className="text-left min-w-0 flex-1 space-y-0.5"
                      >
                        <div className="flex items-center gap-1.5 text-[11px] font-bold">
                          <span className={isTombamento ? 'text-[#B94734]' : 'text-[#2F5F78]'}>
                            {mapa.ano}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500 font-normal truncate">{mapa.municipio}</span>
                        </div>
                        <p className="text-sm font-bold text-[#071D33] leading-snug line-clamp-2">
                          {mapa.titulo}
                        </p>
                      </button>
                      <a
                        href={mapa.downloadUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Baixar ${mapa.titulo}`}
                        className="shrink-0 p-2 rounded-lg text-slate-500 hover:bg-[#071D33] hover:text-white transition-colors"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Palco Interativo Principal (8 colunas no desktop) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-[#071D33] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/15">
                <div className="space-y-1.5">
                  <p className="text-xs text-[#E9B44C] font-bold uppercase tracking-wider">
                    {activeMap.categoria} · {activeMap.municipio}
                  </p>
                  <h2 className="font-serif text-xl sm:text-2xl font-medium text-white leading-snug">
                    {activeMap.titulo}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-[62ch]">
                    {activeMap.resumo}
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                  <a
                    href={activeMap.downloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#E9B44C] hover:bg-[#F1C56A] px-4 py-2 text-xs font-black text-[#071D33] transition-colors"
                  >
                    <Download size={14} />
                    <span>Baixar {activeMap.downloadUrl.endsWith('.pdf') ? 'PDF' : 'Original'}</span>
                  </a>
                  {activeMap.downloadUrl.endsWith('.pdf') && (
                    <a
                      href={activeMap.srcFull || activeMap.src}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20"
                    >
                      <ImageIcon size={13} />
                      <span>Baixar JPG</span>
                    </a>
                  )}
                </div>
              </div>

              <PanZoomImage
                src={activeMap.src}
                srcFull={activeMap.srcFull}
                width={activeMap.width}
                height={activeMap.height}
                alt={activeMap.alt}
                points={activeMap.points}
                onSelectPoint={(ptId) => setSelectedPointId(ptId)}
              />

              {/* Ficha do Marco Selecionado logo abaixo do Visor */}
              {activePoint && (
                <div className="bg-white text-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#B94734] flex items-center gap-1">
                        <MapPin size={12} /> Marco selecionado na prancha
                      </p>
                      <h3 className="text-base font-bold text-[#071D33] mt-0.5">{activePoint.label}</h3>
                      <p className="text-xs text-slate-600">{activePoint.nomeAtual}</p>
                    </div>
                    {activeMap.municipiosRelacionados.length === 1 && (
                      <Link
                        to={`/bens-tombados?municipio=${encodeURIComponent(activeMap.municipiosRelacionados[0])}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#2F5F78] hover:text-[#071D33] underline"
                      >
                        <Landmark size={13} /> Bens de {activeMap.municipiosRelacionados[0]}
                      </Link>
                    )}
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">{activePoint.descricao}</p>

                  {linkedAssets.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                      {linkedAssets.map((bem) => {
                        const pdf = DECRETOS_PDF[bem.decreto.numero];
                        return (
                          <div
                            key={bem.id}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#FAF8F5] border border-[#E5DDD5] px-3 py-1.5 text-xs"
                          >
                            <Link
                              to={`/bens-tombados?q=${encodeURIComponent(bem.id)}`}
                              className="font-bold text-[#071D33] hover:text-[#B94734] inline-flex items-center gap-1"
                            >
                              <span>#{bem.id} {bem.nome}</span>
                              <ArrowUpRight size={11} />
                            </Link>
                            {pdf && (
                              <a
                                href={pdf.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#256B58] font-bold hover:underline inline-flex items-center gap-0.5"
                              >
                                <FileText size={11} /> PDF
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mapa Estadual dos Municípios */}
      <section aria-labelledby="mapa-municipios-titulo" className="bg-white border-t border-[#E5DDD5] py-10 mt-6">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#B94734]">Território Maranhense</p>
            <h2 id="mapa-municipios-titulo" className="font-serif text-2xl font-medium text-[#071D33]">
              Municípios com Bens Tombados
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Clique em qualquer cidade no mapa para abrir diretamente os bens tombados, decretos e poligonais correspondentes.
            </p>
            <Link
              to="/bens-tombados"
              className="inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F5F78] text-white text-xs font-bold hover:bg-[#071D33] transition-colors"
            >
              <Landmark size={15} /> Abrir Explorador de Bens Tombados
            </Link>
          </div>
          <div className="lg:col-span-7">
            <MunicipiosMap
              points={municipioPoints}
              selected={selectedMunicipio}
              onSelect={(mun) => {
                setSelectedMunicipio(mun);
                if (mun) navigate(`/bens-tombados?municipio=${encodeURIComponent(mun)}`);
              }}
              height={320}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CartografiaPage;
