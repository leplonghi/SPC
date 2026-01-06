
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  MapPin,
  FileText,
  Info,
  Database,
  Loader2,
  RefreshCw,
  X,
  Shield,
  Layers,
  Sparkles,
  Compass,
  Building2
} from 'lucide-react';
import GeoManager from '../components/Map/GeoManager';
import AICommandChat from '../components/Map/AICommandChat';
import { HERITAGE_SITES, INITIAL_ZONES } from '../data/geoManagerData';
import { HeritageAsset, HeritageArea } from '../types_patrimonio';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { geocodingService } from '../services/GeocodingService';
import { patrimonioSeed } from '../data/patrimonioSeed';

import { useAuth } from '../contexts/AuthContext';

// Helper for colors/categories (matching GeoManager)
const getUseColor = (uso?: string) => {
  if (!uso) return '#757575';
  const u = uso.toLowerCase();
  if (u.includes('religio') || u.includes('igreja') || u.includes('capela')) return '#8E24AA'; // Purple
  if (u.includes('institucional') || u.includes('publico') || u.includes('público') || u.includes('governo')) return '#1E88E5'; // Blue
  if (u.includes('comercial') || u.includes('loja') || u.includes('serviço') || u.includes('mercado')) return '#F59E0B'; // Amber
  if (u.includes('residencial') || u.includes('moradia') || u.includes('habita')) return '#43A047'; // Green
  if (u.includes('militar') || u.includes('forte') || u.includes('quartel')) return '#3949AB'; // Indigo
  if (u.includes('monumento') || u.includes('estátua') || u.includes('fonte')) return '#E91E63'; // Pink
  if (u.includes('cultural') || u.includes('teatro') || u.includes('museu')) return '#00ACC1'; // Cyan
  return '#757575';
};

const getUseCategory = (uso?: string) => {
  if (!uso) return 'Outros';
  const u = uso.toLowerCase();
  if (u.includes('religio') || u.includes('igreja') || u.includes('capela')) return 'Religioso';
  if (u.includes('institucional') || u.includes('publico') || u.includes('público') || u.includes('governo')) return 'Institucional';
  if (u.includes('comercial') || u.includes('loja') || u.includes('serviço') || u.includes('mercado')) return 'Comercial';
  if (u.includes('residencial') || u.includes('moradia') || u.includes('habita')) return 'Residencial';
  if (u.includes('militar') || u.includes('forte') || u.includes('quartel')) return 'Militar';
  if (u.includes('monumento') || u.includes('estátua') || u.includes('fonte')) return 'Monumentos';
  if (u.includes('cultural') || u.includes('teatro') || u.includes('museu')) return 'Cultural';
  return 'Outros';
};

const MapaPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<HeritageAsset | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPolygons, setShowPolygons] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    cidade: 'Todos',
    status: 'Todos'
  });

  const [assets, setAssets] = useState<HeritageAsset[]>([]);
  const [areas, setAreas] = useState<HeritageArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // AI Command States
  const [aiMarkers, setAiMarkers] = useState<any[]>([]);
  const [aiRoutes, setAiRoutes] = useState<any[]>([]);
  const [aiPolygons, setAiPolygons] = useState<any[]>([]);

  // Admin/Import State
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [reporting, setReporting] = useState(false);

  const [activeTab, setActiveTab] = useState<'assets' | 'areas' | 'analysis'>('assets');
  const [selectedArea, setSelectedArea] = useState<HeritageArea | null>(null);

  useEffect(() => {
    // Real-time subscription
    const unsubAssets = onSnapshot(collection(db, "heritage_assets"), (snap) => {
      const data = snap.docs.map(d => d.data() as HeritageAsset);
      setAssets(data);
      setLoading(false);
    });

    const unsubAreas = onSnapshot(collection(db, "heritage_areas"), (snap) => {
      const data = snap.docs.map(d => {
        const docData = d.data();
        // Handle GeoJSON that might be stored as string to avoid nested array limits
        if (docData.geojson && typeof docData.geojson === 'string') {
          try {
            docData.geojson = JSON.parse(docData.geojson);
          } catch (e) {
            console.error("Erro ao fazer parse do GeoJSON da área:", docData.id, e);
            docData.geojson = null; // Prevent string data from reaching Leaflet
          }
        }
        return docData as HeritageArea;
      });
      setAreas(data);
    });

    return () => {
      unsubAssets();
      unsubAreas();
    };
  }, []);

  const handleAICommand = useCallback(async (command: any) => {
    const { intent } = command;

    if (intent === 'pin') {
      const { coordinate, label } = command;
      setAiMarkers(prev => [...prev, { id: `ai-p-${Date.now()}`, position: coordinate, label }]);
    } else if (intent === 'polygon') {
      const { coordinates, color } = command;
      setAiPolygons(prev => [...prev, { id: `ai-poly-${Date.now()}`, coordinates, color }]);
    } else if (intent === 'route') {
      const { waypoints } = command;
      try {
        const coordsStr = waypoints.map((w: any) => `${w[1]},${w[0]}`).join(';');
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const routeCoords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          setAiRoutes(prev => [...prev, { id: `ai-r-${Date.now()}`, coordinates: routeCoords }]);
        }
      } catch (err) {
        console.error("Erro ao buscar rota OSRM:", err);
      }
    }
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.cidade.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCidade = activeFilters.cidade === 'Todos' || asset.cidade === activeFilters.cidade;
      const matchesStatus = activeFilters.status === 'Todos' || asset.status === activeFilters.status;

      return matchesSearch && matchesCidade && matchesStatus;
    });
  }, [searchTerm, activeFilters, assets]);

  const categorizedAreas = useMemo(() => {
    const cat = {
      tombamento: [] as HeritageArea[],
      ambiental: [] as HeritageArea[],
      arqueologico: [] as HeritageArea[],
      outros: [] as HeritageArea[]
    };

    const allAreas = areas.length > 0 ? areas : INITIAL_ZONES;

    // Filter by search term if active
    const filtered = allAreas.filter(area =>
      searchTerm === '' ||
      area.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.forEach(area => {
      const type = area.tipo_area;
      if (['federal', 'estadual', 'municipal', 'centro_historico', 'sitio_historico'].includes(type)) {
        cat.tombamento.push(area);
      } else if (['area_paisagistica'].includes(type)) {
        cat.ambiental.push(area);
      } else if (['sitio_arqueologico', 'sitio_paleontologico'].includes(type)) {
        cat.arqueologico.push(area);
      } else {
        cat.outros.push(area);
      }
    });

    return cat;
  }, [areas, searchTerm]);

  const uniqueCidades = useMemo(() => Array.from(new Set(assets.map(a => a.cidade))).sort(), [assets]);

  const categorizedAssets = useMemo(() => {
    const groups: Record<string, HeritageAsset[]> = {};
    const order = ['Religioso', 'Institucional', 'Cultural', 'Residencial', 'Comercial', 'Militar', 'Monumentos', 'Outros'];

    // Sort logic could go here if needed
    filteredAssets.forEach(asset => {
      const cat = getUseCategory(asset.uso_atual || asset.tipologia);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(asset);
    });

    return order.filter(k => groups[k]?.length > 0).map(k => ({
      category: k,
      items: groups[k]
    }));
  }, [filteredAssets]);

  // State to track if we've already attempted auto-import in this session
  const [hasAutoImported, setHasAutoImported] = useState(false);

  useEffect(() => {
    // Auto-import if loaded, empty, and haven't tried yet
    if (!loading && assets.length === 0 && !isImporting && !hasAutoImported) {
      console.log("Auto-importing seed data detected empty database...");
      setHasAutoImported(true);
      handleImportSeed(true);
    }
  }, [loading, assets.length, isImporting, hasAutoImported]);

  const handleImportSeed = async (skipConfirm = false) => {
    if (skipConfirm || confirm(`ATENÇÃO: Deseja LIMPAR o banco de dados e re-importar o seed v2.0 (${patrimonioSeed.length} itens)?`)) {
      setIsImporting(true);
      setImportProgress(0);
      try {
        if (!skipConfirm) await geocodingService.clearDatabase();
        await geocodingService.importSeed(patrimonioSeed, (count) => {
          setImportProgress(count);
        });
        if (!skipConfirm) alert('Base de dados atualizada com sucesso!');
      } catch (error) {
        console.error("Erro na importação:", error);
        alert("Erro na importação: " + error);
      } finally {
        setIsImporting(false);
      }
    }
  };

  const handleReportError = async () => {
    if (!selectedAsset) return;
    const reason = prompt("Descreva o erro ou a correção necessária:");
    if (!reason) return;

    setReporting(true);
    try {
      await addDoc(collection(db, "enrichment_queue"), {
        assetId: selectedAsset.id,
        currentData: selectedAsset,
        reason: reason,
        status: 'pending',
        createdAt: Timestamp.now(),
        reportedBy: 'user-interaction'
      });
      alert("Sua correção foi enviada para a fila de análise. Obrigado!");
    } catch (error) {
      console.error("Error reporting:", error);
      alert("Erro ao enviar reporte.");
    } finally {
      setReporting(false);
    }
  };

  const clearAIOverlay = () => {
    setAiMarkers([]);
    setAiRoutes([]);
    setAiPolygons([]);
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] md:h-[calc(100vh-5rem)] flex flex-col md:flex-row overflow-hidden relative font-sans">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between p-3 bg-white border-b border-slate-200 z-[30]">
        <h2 className="text-sm font-extrabold text-brand-dark flex items-center gap-2 uppercase tracking-tight">
          <MapPin size={16} className="text-[#CC343A]" />
          Patrimônio
        </h2>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-700 active:scale-95 transition-all shadow-sm"
        >
          {isSidebarOpen ? <ChevronLeft size={16} className="rotate-90" /> : <Search size={14} />}
          {isSidebarOpen ? 'Ver Mapa' : 'Lista & Busca'}
        </button>
      </div>

      {/* Sidebar Panel */}
      <div className={`
        fixed inset-0 top-[112px] bottom-0 z-[20] md:relative md:top-0 md:inset-auto
        w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shadow-xl overflow-hidden
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'assets' ? 'bg-white text-brand-blue border-b-2 border-brand-blue' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            Patrimônio
          </button>
          <button
            onClick={() => setActiveTab('areas')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'areas' ? 'bg-white text-brand-blue border-b-2 border-brand-blue' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            Poligonais
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'analysis' ? 'bg-white text-brand-blue border-b-2 border-brand-blue' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            Análise
          </button>
        </div>

        {/* Search Header */}
        <div className="p-3 border-b border-slate-100 bg-white">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={14} />
            <input
              type="text"
              placeholder={activeTab === 'assets' ? "Buscar bens..." : "Buscar poligonais..."}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === 'assets' && (
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold transition-all uppercase tracking-wide ${showFilters ? 'bg-brand-blue text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                <Filter size={10} /> {showFilters ? 'Ocultar' : 'Filtros'}
              </button>
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                {filteredAssets.length} Resultados
              </span>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && activeTab === 'assets' && (
          <div className="p-4 border-b border-slate-200 bg-brand-blue/5 space-y-3 animate-in slide-in-from-top-4 duration-300">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Cidade</label>
              <select
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                value={activeFilters.cidade}
                onChange={(e) => setActiveFilters({ ...activeFilters, cidade: e.target.value })}
              >
                <option>Todos</option>
                {uniqueCidades.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Status</label>
              <select
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                value={activeFilters.status}
                onChange={(e) => setActiveFilters({ ...activeFilters, status: e.target.value })}
              >
                <option>Todos</option>
                <option value="ok">Geolocalizado</option>
                <option value="needs_review">Em Revisão</option>
                <option value="no_result">Sem Resultado</option>
              </select>
            </div>
          </div>
        )}


        {/* Results List */}
        <div className="flex-grow overflow-y-auto bg-slate-50/30 no-scrollbar">
          {activeTab === 'assets' && (
            filteredAssets.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Search size={20} />
                </div>
                <p className="text-slate-500 text-xs">Nenhum patrimônio encontrado.</p>

                {assets.length === 0 && !loading && (
                  <div className="card p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 mb-2">Base de dados vazia.</p>
                    <button
                      onClick={handleImportSeed}
                      disabled={isImporting}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-brand-dark text-white text-xs font-bold rounded hover:bg-black transition-colors"
                    >
                      {isImporting ? <Loader2 className="animate-spin" size={14} /> : <Database size={14} />}
                      {isImporting ? `Importando (${importProgress}/${patrimonioSeed.length})` : 'Importar Seed Inicial'}
                    </button>
                    {isImporting && <p className="text-[9px] text-slate-400 mt-2">Aguarde, respeitando rate limit (1req/s)...</p>}
                  </div>
                )}
              </div>
            ) : (
              <div className="pb-6">
                {categorizedAssets.map(group => (
                  <div key={group.category} className="mb-4">
                    <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm px-4 py-2 border-y border-slate-100 mb-2 flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getUseColor(group.category) }} />
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex-grow">
                        {group.category}
                      </h3>
                      <span className="px-1.5 py-0.5 bg-slate-200 rounded text-[9px] font-bold text-slate-600">
                        {group.items.length}
                      </span>
                    </div>

                    <div className="px-2 space-y-1">
                      {group.items.map(asset => (
                        <button
                          key={asset.id}
                          onClick={() => {
                            setSelectedAsset(asset);
                            setSelectedArea(null);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full group relative overflow-hidden text-left transition-all duration-200 rounded-xl border ${selectedAsset?.id === asset.id ? 'bg-white border-brand-blue shadow-lg scale-[1.02]' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'}`}
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${selectedAsset?.id === asset.id ? 'bg-brand-blue' : 'bg-transparent group-hover:bg-slate-200'}`} style={{ backgroundColor: selectedAsset?.id === asset.id ? undefined : getUseColor(asset.uso_atual || asset.tipologia) + '40' }} />

                          <div className="p-3 pl-4 flex gap-3 items-center">
                            <div
                              className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm"
                              style={{ backgroundColor: getUseColor(asset.uso_atual || asset.tipologia) }}
                            >
                              {group.category === 'Religioso' && <span className="text-[10px]">†</span>}
                              {group.category === 'Institucional' && <Building2 size={12} />}
                              {group.category === 'Cultural' && <Sparkles size={12} />}
                              {(!['Religioso', 'Institucional', 'Cultural'].includes(group.category)) && <MapPin size={12} />}
                            </div>

                            <div className="min-w-0 flex-grow">
                              <h4 className="font-bold text-slate-800 truncate text-[11px] leading-tight mb-0.5 group-hover:text-brand-blue transition-colors">
                                {asset.titulo}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider truncate">
                                  {asset.endereco_original || asset.cidade}
                                </span>
                              </div>
                            </div>

                            {asset.status === 'ok' && (
                              <div className="text-emerald-500" title="Geolocalizado">
                                <Shield size={10} className="fill-current" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'areas' && (
            <div className="p-4 space-y-6">
              {/* Category: Tombamento */}
              {categorizedAreas.tombamento.length > 0 && (
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Shield size={14} className="text-brand-red" /> Poligonais de Tombamento
                  </h3>
                  <div className="space-y-2">
                    {categorizedAreas.tombamento.map(area => (
                      <button
                        key={area.id}
                        onClick={() => {
                          setSelectedArea(area);
                          setSelectedAsset(null);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full p-3 bg-white border rounded-xl text-left transition-all hover:border-brand-red group ${selectedArea?.id === area.id ? 'border-brand-red ring-2 ring-brand-red/10' : 'border-slate-100'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-red/5 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
                            <Layers size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{area.titulo}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase">{area.tipo_area}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Category: Ambiental */}
              {categorizedAreas.ambiental.length > 0 && (
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <MapPin size={14} className="text-emerald-500" /> Ambiental / Paisagística
                  </h3>
                  <div className="space-y-2">
                    {categorizedAreas.ambiental.map(area => (
                      <button
                        key={area.id}
                        onClick={() => {
                          setSelectedArea(area);
                          setSelectedAsset(null);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full p-3 bg-white border rounded-xl text-left transition-all hover:border-emerald-500 group ${selectedArea?.id === area.id ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-100'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50/50 flex items-center justify-center text-emerald-600">
                            <Layers size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{area.titulo}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Paisagística</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Category: Arqueológico */}
              {categorizedAreas.arqueologico.length > 0 && (
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Info size={14} className="text-amber-500" /> Sítios Arqueológicos
                  </h3>
                  <div className="space-y-2">
                    {categorizedAreas.arqueologico.map(area => (
                      <button
                        key={area.id}
                        onClick={() => {
                          setSelectedArea(area);
                          setSelectedAsset(null);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full p-3 bg-white border rounded-xl text-left transition-all hover:border-amber-500 group ${selectedArea?.id === area.id ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-100'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                            <Layers size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{area.titulo}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Arqueológico</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="p-6 space-y-6">
              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Sparkles size={14} className="text-brand-blue" /> Análise Espacial
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Heat Map de Ativos</span>
                      <div className="w-8 h-4 bg-slate-200 rounded-full relative">
                        <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Densidade de bens tombados por m²</p>
                  </div>

                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm cursor-not-allowed opacity-60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Mapa de Tipologias</span>
                      <div className="w-8 h-4 bg-slate-200 rounded-full relative">
                        <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Categorização por estilo e uso</p>
                  </div>

                  <div className="p-4 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center">
                        <Compass size={16} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-brand-blue uppercase">Geração AI-First</p>
                        <p className="text-[9px] text-brand-blue/60 font-bold">Use o chat para criar análises automáticas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-grow h-full relative bg-slate-200 z-10">
        <GeoManager
          assets={assets}
          areas={areas}
          selectedAsset={selectedAsset}
          selectedArea={selectedArea}
          onAssetClick={setSelectedAsset}
          onAreaClick={setSelectedArea}
          onReportError={handleReportError}
        />

        {/* AI Overlay Clear Button */}
        {(aiMarkers.length > 0 || aiRoutes.length > 0 || aiPolygons.length > 0) && (
          <button
            onClick={clearAIOverlay}
            className="absolute top-4 left-4 z-[1000] bg-white text-brand-red px-3 py-1.5 rounded-lg shadow-xl border border-slate-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
          >
            <X size={14} /> Limpar Sobreposição
          </button>
        )}

        {/* Admin Tools (Floating) */}
        {!isImporting && assets.length > 0 && (
          <div className="absolute top-4 right-4 z-[1000] hidden md:block group">
            <button
              onClick={handleImportSeed}
              className="p-2 bg-white rounded-lg shadow-xl border border-slate-200 text-slate-400 hover:text-brand-dark transition-colors"
              title="Re-importar / Atualizar Base"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}

        {/* AI Command Chat */}
        {/* <AICommandChat onCommand={handleAICommand} /> */}
      </div>
    </div>
  );
};

export default MapaPage;
