
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  X, 
  MapPin, 
  Calendar, 
  FileText, 
  Layers, 
  List,
  ChevronDown,
  Share2,
  Download,
  Info
} from 'lucide-react';
import HeritageMap from '../components/Map/HeritageMap';
import { MOCK_ASSETS, MOCK_POLYGONS } from '../data/mockData';
import { HeritageAsset, AssetType, ProtectionLevel, AssetStatus, Department } from '../types';

const MapaPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<HeritageAsset | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPolygons, setShowPolygons] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    municipality: 'Todos',
    protection: 'Todos',
    status: 'Todos',
    dept: 'Todos'
  });

  const filteredAssets = useMemo(() => {
    return MOCK_ASSETS.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           asset.municipality.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMunicipality = activeFilters.municipality === 'Todos' || asset.municipality === activeFilters.municipality;
      const matchesProtection = activeFilters.protection === 'Todos' || asset.protection_level === activeFilters.protection;
      const matchesStatus = activeFilters.status === 'Todos' || asset.status === activeFilters.status;
      const matchesDept = activeFilters.dept === 'Todos' || asset.department_responsible === activeFilters.dept;
      
      return matchesSearch && matchesMunicipality && matchesProtection && matchesStatus && matchesDept;
    });
  }, [searchTerm, activeFilters]);

  const uniqueMunicipalities = Array.from(new Set(MOCK_ASSETS.map(a => a.municipality))).sort();

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col md:flex-row overflow-hidden relative">
      {/* Sidebar Panel (Desktop: Left, Mobile: Bottom/Drawer handled by absolute) */}
      <div className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl overflow-hidden">
        {/* Search Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin size={24} className="text-red-600" />
            Mapa do Patrimônio
          </h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou cidade..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showFilters ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              <Filter size={14} /> {showFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
            </button>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {filteredAssets.length} Resultados
            </span>
          </div>
        </div>

        {/* Filters Panel (Collapsible) */}
        {showFilters && (
          <div className="p-6 border-b border-slate-200 bg-blue-50/30 space-y-4 animate-in slide-in-from-top-4 duration-300">
             <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Município</label>
                <select 
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  value={activeFilters.municipality}
                  onChange={(e) => setActiveFilters({...activeFilters, municipality: e.target.value})}
                >
                  <option>Todos</option>
                  {uniqueMunicipalities.map(m => <option key={m}>{m}</option>)}
                </select>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Proteção</label>
                  <select 
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    value={activeFilters.protection}
                    onChange={(e) => setActiveFilters({...activeFilters, protection: e.target.value as ProtectionLevel})}
                  >
                    <option>Todos</option>
                    {Object.values(ProtectionLevel).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Situação</label>
                  <select 
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    value={activeFilters.status}
                    onChange={(e) => setActiveFilters({...activeFilters, status: e.target.value as AssetStatus})}
                  >
                    <option>Todos</option>
                    {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
             </div>
             <div className="flex items-center gap-3 py-2 border-t border-slate-100">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                  type="checkbox" 
                  checked={showPolygons} 
                  onChange={() => setShowPolygons(!showPolygons)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                 <span className="text-xs font-medium text-slate-700">Ver Poligonais</span>
               </label>
             </div>
          </div>
        )}

        {/* Results List */}
        <div className="flex-grow overflow-y-auto bg-slate-50/30">
          {filteredAssets.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search size={32} />
              </div>
              <p className="text-slate-500 text-sm">Nenhum patrimônio encontrado com estes critérios.</p>
              <button 
                onClick={() => setActiveFilters({ municipality: 'Todos', protection: 'Todos', status: 'Todos', dept: 'Todos' })}
                className="text-blue-600 text-sm font-bold hover:underline"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAssets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`w-full p-5 text-left transition-all hover:bg-white hover:shadow-md border-l-4 ${selectedAsset?.id === asset.id ? 'bg-white border-blue-600 shadow-inner' : 'border-transparent'}`}
                >
                  <div className="flex gap-4">
                    <img src={asset.image_url} className="w-16 h-16 rounded-xl object-cover bg-slate-200 flex-shrink-0" alt="" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 truncate mb-1">{asset.name}</h4>
                      <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2">
                        <MapPin size={10} /> {asset.municipality}
                      </div>
                      <div className="flex gap-1">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] rounded-full font-bold uppercase">{asset.protection_level}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] rounded-full font-bold uppercase">{asset.status}</span>
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
      <div className="flex-grow relative bg-slate-200">
        <HeritageMap 
          assets={filteredAssets} 
          polygons={MOCK_POLYGONS} 
          selectedAssetId={selectedAsset?.id}
          onSelectAsset={setSelectedAsset}
          showPolygons={showPolygons}
        />
        
        {/* Mobile Filter Toggle Overlay */}
        <div className="absolute top-4 right-4 z-[1000] md:hidden">
          <button className="p-3 bg-white rounded-full shadow-xl">
             <Layers size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Detail Drawer (Right Side) */}
      {selectedAsset && (
        <div className="absolute inset-0 md:relative md:w-[450px] bg-white z-[1001] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-200">
          <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-6 flex items-center justify-between border-b border-slate-100">
            <button 
              onClick={() => setSelectedAsset(null)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-slate-600" />
            </button>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Share2 size={20} className="text-slate-600" /></button>
              <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Download size={20} className="text-slate-600" /></button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto">
            <img src={selectedAsset.image_url} className="w-full h-72 object-cover" alt={selectedAsset.name} />
            
            <div className="p-8 space-y-10">
              <header className="space-y-4">
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-extrabold rounded-full uppercase tracking-widest">{selectedAsset.protection_level}</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-extrabold rounded-full uppercase tracking-widest">{selectedAsset.status}</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">{selectedAsset.name}</h1>
                <p className="flex items-center gap-2 text-slate-500 font-medium">
                  <MapPin size={18} className="text-red-500" /> {selectedAsset.address_text}, {selectedAsset.municipality}
                </p>
              </header>

              <section className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" /> Base Legal
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Instrumento</p>
                      <p className="text-sm font-semibold text-slate-700">{selectedAsset.legal_basis.instrument_type} nº {selectedAsset.legal_basis.instrument_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Data</p>
                      <p className="text-sm font-semibold text-slate-700">{new Date(selectedAsset.legal_basis.instrument_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Resumo</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{selectedAsset.legal_basis.summary}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Info size={18} className="text-blue-600" /> Descrição Histórica
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {selectedAsset.description}
                  {selectedAsset.description}
                </p>
              </section>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Código: {selectedAsset.code}</span>
                <span>Resp: {selectedAsset.department_responsible}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaPage;
