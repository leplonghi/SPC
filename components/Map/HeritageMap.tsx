
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { HeritageAsset, TombamentoPolygon, Department } from '../../types';

// Custom Marker Icons - Matching the Logo Red and Blue
const getIcon = (dept: Department) => {
  const color = dept === Department.DPHAP ? '#5283A9' : (dept === Department.DPI ? '#CC343A' : '#2D2D2D');
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border: 3px solid white; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transform: rotate(45deg);"></div>`,
    className: 'custom-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

interface HeritageMapProps {
  assets: HeritageAsset[];
  polygons: TombamentoPolygon[];
  selectedAssetId?: string;
  onSelectAsset: (asset: HeritageAsset) => void;
  showPolygons: boolean;
}

const FlyToControl = ({ selectedAsset }: { selectedAsset?: HeritageAsset }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedAsset) {
      map.flyTo([selectedAsset.latitude, selectedAsset.longitude], 17, {
        duration: 2,
        easeLinearity: 0.25
      });
    }
  }, [selectedAsset, map]);
  return null;
};

const HeritageMap: React.FC<HeritageMapProps> = ({ assets, polygons, selectedAssetId, onSelectAsset, showPolygons }) => {
  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  return (
    <div className="h-full w-full relative group">
      <MapContainer 
        center={[-2.5284, -44.3044]} 
        zoom={14} 
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {showPolygons && polygons.map(poly => (
          <GeoJSON 
            key={poly.id}
            data={poly.geometry}
            style={{
              color: '#CC343A',
              weight: 3,
              opacity: 0.8,
              dashArray: '5, 5',
              fillColor: '#CC343A',
              fillOpacity: 0.08
            }}
          >
            <Popup>
              <div className="p-4 font-sans">
                <span className="text-[9px] font-black uppercase text-[#CC343A] tracking-[0.2em] block mb-1">Poligonal de Proteção</span>
                <h4 className="font-black text-[#2D2D2D] text-lg leading-tight mb-2">{poly.name}</h4>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">{poly.municipality}</p>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[10px] text-slate-600 font-medium">
                  {poly.legal_basis.summary}
                </div>
              </div>
            </Popup>
          </GeoJSON>
        ))}

        {assets.map(asset => (
          <Marker 
            key={asset.id} 
            position={[asset.latitude, asset.longitude]}
            icon={getIcon(asset.department_responsible)}
            eventHandlers={{
              click: () => onSelectAsset(asset)
            }}
          >
            <Popup className="brand-popup">
              <div className="p-1 font-sans min-w-[240px]">
                <div className="relative overflow-hidden rounded-xl mb-3 shadow-sm h-32">
                   <img src={asset.image_url} className="w-full h-full object-cover" alt={asset.name} />
                   <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md text-white text-[8px] font-black uppercase rounded tracking-widest">
                      {asset.code}
                   </div>
                </div>
                <h4 className="font-black text-[#2D2D2D] leading-tight text-base mb-1">{asset.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{asset.municipality}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-[#5283A9]/10 text-[#5283A9] text-[9px] rounded-lg font-black uppercase">{asset.status}</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded-lg font-black uppercase">{asset.protection_level}</span>
                </div>
                <button 
                  onClick={() => onSelectAsset(asset)}
                  className="w-full py-2.5 bg-[#CC343A] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#b02c32] transition-all shadow-lg shadow-[#CC343A]/20"
                >
                  Ver Detalhes Completos
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <FlyToControl selectedAsset={selectedAsset} />
      </MapContainer>

      {/* Map Legend Floating */}
      <div className="absolute bottom-8 left-8 z-[1000] bg-white/95 backdrop-blur-xl p-6 rounded-[2rem] border-2 border-slate-100 shadow-2xl hidden md:block w-72">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Legenda Institucional</h5>
        <div className="space-y-4">
          <div className="flex items-center gap-4 group cursor-help">
            <div className="w-4 h-4 rounded-[3px] bg-[#5283A9] border-2 border-white shadow-md rotate-45 group-hover:scale-125 transition-transform"></div>
            <div>
              <span className="block text-xs font-black text-[#2D2D2D] uppercase tracking-wider">DPHAP</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Patrimônio Material</span>
            </div>
          </div>
          <div className="flex items-center gap-4 group cursor-help">
            <div className="w-4 h-4 rounded-[3px] bg-[#CC343A] border-2 border-white shadow-md rotate-45 group-hover:scale-125 transition-transform"></div>
            <div>
              <span className="block text-xs font-black text-[#2D2D2D] uppercase tracking-wider">DPI</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Patrimônio Imaterial</span>
            </div>
          </div>
          <div className="flex items-center gap-4 group cursor-help">
            <div className="w-4 h-4 rounded-[3px] bg-[#2D2D2D] border-2 border-white shadow-md rotate-45 group-hover:scale-125 transition-transform"></div>
            <div>
              <span className="block text-xs font-black text-[#2D2D2D] uppercase tracking-wider">DPE</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Projetos Especiais</span>
            </div>
          </div>
          <div className="pt-4 flex items-center gap-4 group">
            <div className="w-6 h-6 border-2 border-dashed border-[#CC343A] bg-[#CC343A]/5 rounded-lg group-hover:bg-[#CC343A]/10 transition-colors"></div>
            <div>
              <span className="block text-xs font-black text-[#2D2D2D] uppercase tracking-wider">Poligonal</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Área de Tombamento</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeritageMap;