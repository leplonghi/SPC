
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { HeritageAsset, HeritageArea } from '../../types_patrimonio';
import MarkerClusterGroup from './MarkerClusterGroup';
import { Layers, X, MapPin } from 'lucide-react';

// Custom Marker Icons
const getIcon = (category: string = 'other', status: string) => {
  let color = '#546E7A'; // Default (Blue Grey)

  switch (category) {
    case 'religious': color = '#5D4037'; break; // Brown
    case 'civil': color = '#1E88E5'; break; // Blue
    case 'military': color = '#2E7D32'; break; // Green
    case 'ruin': color = '#FF6F00'; break; // Amber/Orange
    case 'monument': color = '#8E24AA'; break; // Purple
    case 'area': color = '#CC343A'; break; // Red
  }

  const opacity = status === 'ok' ? 1 : 0.6;
  const borderColor = status === 'ok' ? 'white' : '#FFD54F'; // Yellow border if needs review

  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border: 2px solid ${borderColor};
      border-radius: 50% 50% 50% 0;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: ${opacity};
    ">
      <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
    </div>`,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

interface HeritageMapProps {
  assets: HeritageAsset[];
  areas: HeritageArea[];
  selectedAssetId?: string;
  onSelectAsset: (asset: HeritageAsset) => void;
  showPolygons: boolean;
}

const FlyToControl = ({ selectedAsset }: { selectedAsset?: HeritageAsset }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedAsset) {
      if (selectedAsset.lat && selectedAsset.lng) {
        map.flyTo([selectedAsset.lat, selectedAsset.lng], 17, {
          duration: 2.0
        });
      }
    }
  }, [selectedAsset, map]);
  return null;
};

const HeritageMap: React.FC<HeritageMapProps> = ({ assets, areas, selectedAssetId, onSelectAsset, showPolygons }) => {
  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);
  const [showLegend, setShowLegend] = React.useState(true);

  // Filter only valid assets
  const validAssets = useMemo(() => assets.filter(a => a.lat !== 0 && a.lng !== 0), [assets]);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[-2.5284, -44.3044]}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full z-0 font-sans"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {showPolygons && areas.map(area => (
          area.geojson && (
            <GeoJSON
              key={area.id}
              data={area.geojson}
              style={{
                color: '#CC343A',
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 5',
                fillColor: '#CC343A',
                fillOpacity: 0.1
              }}
            >
              <Popup>
                <strong>{area.titulo}</strong><br />
                {area.tipo_area}
              </Popup>
            </GeoJSON>
          )
        ))}

        <MarkerClusterGroup>
          {validAssets.map(asset => (
            <Marker
              key={asset.id}
              position={[asset.lat, asset.lng]}
              icon={getIcon(asset.categoria, asset.status)}
              eventHandlers={{
                click: () => onSelectAsset(asset)
              }}
            >
              <Popup closeButton={false} className="brand-popup">
                <div className="p-2 min-w-[200px]">
                  <h4 className="font-bold text-sm mb-1">{asset.titulo}</h4>
                  <p className="text-xs text-slate-500 mb-2">{asset.endereco_original}</p>
                  <div className="flex gap-2 text-[10px]">
                    <span className="bg-slate-100 px-1 rounded font-bold uppercase">{asset.categoria || 'Geral'}</span>
                  </div>
                  <button
                    className="mt-2 w-full bg-slate-900 text-white text-xs py-1.5 rounded hover:bg-slate-700 font-bold uppercase"
                    onClick={() => onSelectAsset(asset)}>
                    Ver Detalhes
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        <FlyToControl selectedAsset={selectedAsset} />
      </MapContainer>

      {/* Legend Toggle Button */}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-6 left-6 z-[1000] bg-white text-slate-700 p-3 rounded-full shadow-xl hover:scale-110 transition-all border border-slate-100"
        >
          <Layers size={20} />
        </button>
      )}

      {/* Legend */}
      {showLegend && (
        <div className={`absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-4 transition-all duration-300 origin-bottom-left max-w-[200px]`}>
          <div className="flex justify-between items-center mb-2">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers size={12} /> Categoria
            </h5>
            <button onClick={() => setShowLegend(false)} className="hover:bg-slate-100 p-1 rounded-full"><X size={12} className="text-slate-400" /></button>
          </div>
          <div className="space-y-2 text-xs font-medium text-slate-700">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#5D4037]"></span> Religioso</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1E88E5]"></span> Civil (Solar/Casa)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#2E7D32]"></span> Militar/Forte</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#FF6F00]"></span> Ruínas</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#8E24AA]"></span> Monumento/Fonte</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#546E7A]"></span> Outros</div>
            <div className="flex items-center gap-2 border-t pt-2 mt-2"><span className="w-3 h-3 rounded-full border-2 border-[#FFD54F] bg-transparent"></span> Com alerta (Revisar)</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeritageMap;
