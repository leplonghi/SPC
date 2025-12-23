
import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  MapPin,
  FileText,
  Info,
  Database,
  Loader2,
  RefreshCw
} from 'lucide-react';
import HeritageMap from '../components/Map/HeritageMap';
import { HeritageAsset, HeritageArea } from '../types_patrimonio';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { geocodingService } from '../services/GeocodingService';
import { patrimonioSeed } from '../data/patrimonioSeed';

const MapaPage: React.FC = () => {
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

  // Admin/Import State
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    // Real-time subscription
    const unsubAssets = onSnapshot(collection(db, "heritage_assets"), (snap) => {
      const data = snap.docs.map(d => d.data() as HeritageAsset);
      setAssets(data);
      setLoading(false);
    });

    const unsubAreas = onSnapshot(collection(db, "heritage_areas"), (snap) => {
      const data = snap.docs.map(d => d.data() as HeritageArea);
      setAreas(data);
    });

    return () => {
      unsubAssets();
      unsubAreas();
    };
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

  const uniqueCidades = useMemo(() => Array.from(new Set(assets.map(a => a.cidade))).sort(), [assets]);

  const handleImportSeed = async () => {
    if (confirm(`Deseja importar ${patrimonioSeed.length} itens do seed? Isso pode demorar.`)) {
      setIsImporting(true);
      setImportProgress(0);
      await geocodingService.importSeed(patrimonioSeed, (count) => {
        setImportProgress(count);
      });
      setIsImporting(false);
      alert('Importação finalizada!');
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

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col md:flex-row overflow-hidden relative font-sans">
      {/* Sidebar Panel */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl overflow-hidden relative">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-extrabold text-brand-dark mb-3 flex items-center gap-2 uppercase tracking-tight">
            <MapPin size={18} className="text-[#CC343A]" />
            Mapa do Patrimônio
          </h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={14} />
            <input
              type="text"
              placeholder="Buscar por nome, logradouro..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all uppercase tracking-wide ${showFilters ? 'bg-brand-blue text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              <Filter size={10} /> {showFilters ? 'Ocultar' : 'Filtros'}
            </button>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              {filteredAssets.length} Resultados
            </span>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
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
        <div className="flex-grow overflow-y-auto bg-slate-50/30">
          {filteredAssets.length === 0 ? (
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
            <div className="divide-y divide-slate-100">
              {filteredAssets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`w-full p-3 text-left transition-all hover:bg-white hover:shadow-sm border-l-2 ${selectedAsset?.id === asset.id ? 'bg-white border-brand-blue shadow-inner' : 'border-transparent'}`}
                >
                  <div className="flex gap-3 items-center">
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${asset.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      <MapPin size={16} />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <h4 className="font-bold text-slate-900 truncate text-xs leading-tight mb-0.5" title={asset.titulo}>{asset.titulo}</h4>
                      <div className="flex items-center gap-1 text-slate-400 text-[9px] uppercase font-bold tracking-wider mb-1">
                        {asset.cidade}
                      </div>
                      <div className="flex gap-1">
                        <span className={`px-1.5 py-px text-[8px] rounded font-bold uppercase border ${asset.status === 'ok' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                          {asset.status === 'ok' ? 'OK' : 'Revisar'}
                        </span>
                        {asset.geocode_precision !== 'unknown' && (
                          <span className="px-1.5 py-px bg-slate-100 text-slate-500 text-[8px] rounded font-bold uppercase border border-slate-200">{asset.geocode_precision}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-grow relative bg-slate-200 z-10">
        <HeritageMap
          assets={filteredAssets}
          areas={// showPolygons ? areas : []
            areas // Always pass areas, let map handle showing? No heritageMap uses showPolygons
          }
          selectedAssetId={selectedAsset?.id}
          onSelectAsset={setSelectedAsset}
          showPolygons={showPolygons}
        />

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
      </div>

      {/* Detail Drawer */}
      {selectedAsset && (
        <div className="absolute inset-0 md:relative md:w-[350px] bg-white z-[1001] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-200">
          <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 p-4 flex items-center justify-between border-b border-slate-100">
            <button
              onClick={() => setSelectedAsset(null)}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <div className="flex gap-1" title="Confidence Score">
              <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-full text-slate-500">
                CONF: {(selectedAsset.geocode_confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            <header>
              <div className="flex gap-2 mb-2">
                <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-widest ${selectedAsset.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {selectedAsset.status === 'ok' ? 'Verificado' : 'Em Revisão'}
                </span>
                <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-black rounded uppercase tracking-widest">
                  {selectedAsset.geocode_precision}
                </span>
              </div>
              <h1 className="text-xl font-black text-brand-dark leading-tight mb-2">{selectedAsset.titulo}</h1>
              <p className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                <MapPin size={14} className="text-[#CC343A]" /> {selectedAsset.endereco_original}
              </p>
              {selectedAsset.endereco_canonico && (
                <p className="text-[10px] text-slate-400 mt-1 pl-5">
                  Nominatim: {selectedAsset.endereco_canonico}
                </p>
              )}
            </header>

            <section className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h3 className="text-[9px] font-black text-brand-dark uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <FileText size={12} className="text-brand-blue" /> Dados do Tombamento
              </h3>
              <div className="space-y-2">
                <p className="text-xs text-slate-600"><strong className="text-slate-900">Cidade:</strong> {selectedAsset.cidade}</p>
                <p className="text-xs text-slate-600"><strong className="text-slate-900">Categoria:</strong> {selectedAsset.categoria || 'Não informada'}</p>
              </div>
            </section>

            {selectedAsset.geocode_source_urls && selectedAsset.geocode_source_urls.length > 0 && (
              <section>
                <h3 className="text-[9px] font-black text-brand-dark uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Info size={12} className="text-brand-blue" /> Fontes / Referências
                </h3>
                <ul className="space-y-1">
                  {selectedAsset.geocode_source_urls.map((url, i) => (
                    <li key={i}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand-blue hover:underline truncate block">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleReportError}
                disabled={reporting}
                className="w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {reporting ? 'Enviando...' : 'Reportar Erro / Atualizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaPage;
