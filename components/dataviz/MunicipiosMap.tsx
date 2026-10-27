import React, { useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { HUE, HUE_DEEP, DIM } from './tokens';

export interface MapPoint { nome: string; lat: number; lng: number; n: number }

/**
 * Posição aproximada da sede de cada município (referência geográfica, só para localizar no mapa).
 * Não é limite municipal nem localização exata do bem.
 */
export const SEDE_MUNICIPIO: Record<string, [number, number]> = {
  'São Luís': [-2.5307, -44.3068],
  'Alcântara': [-2.4083, -44.4136],
  'Caxias': [-4.8628, -43.3611],
  'Itapecuru-Mirim': [-3.4008, -44.3536],
  'Viana': [-3.2036, -44.9922],
  'Carolina': [-7.3333, -47.4667],
  'Pindaré-Mirim': [-3.6, -45.3417],
  'Paço do Lumiar': [-2.5167, -44.1],
  'Rosário': [-2.9367, -44.2506],
  'Barreirinhas': [-2.7589, -42.8244],
  'Buriti': [-3.9419, -42.9189]
};

const Fit: React.FC<{ points: MapPoint[] }> = ({ points }) => {
  const map = useMap();
  const boundsRef = React.useRef<L.LatLngBounds | null>(null);
  const fit = React.useCallback(() => {
    if (boundsRef.current) map.fitBounds(boundsRef.current, { padding: [36, 36], maxZoom: 7, animate: false });
  }, [map]);
  useEffect(() => {
    if (!points.length) return;
    boundsRef.current = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    fit();
  }, [points, fit]);
  // Quando a caixa muda de tamanho (painel fixo, janela, celular), o Leaflet recalcula e reenquadra
  useEffect(() => {
    const ro = new ResizeObserver(() => { map.invalidateSize(); fit(); });
    ro.observe(map.getContainer());
    return () => ro.disconnect();
  }, [map, fit]);
  return null;
};

interface Props {
  points: MapPoint[];
  selected: string | null;
  onSelect: (nome: string | null) => void;
  height?: number | 'fill';
  /** cor dos círculos com bens (padrão: azul do painel) */
  accent?: string;
  /** deixa o mapa só para olhar (sem clique) */
  readOnly?: boolean;
}

/** Mapa do Maranhão com um círculo por município, do tamanho do número de bens. Clicar filtra a lista. */
export const MunicipiosMap: React.FC<Props> = ({ points, selected, onSelect, height = 340, accent, readOnly }) => (
  <div className={`overflow-hidden rounded-2xl border border-[#E7E2DE] ${height === 'fill' ? 'h-full min-h-[340px]' : ''}`} style={height === 'fill' ? undefined : { height }} role="group" aria-label="Mapa do Maranhão com os municípios que têm bens tombados. As mesmas informações estão na lista ao lado.">
    <MapContainer
      center={[-4.2, -45]}
      zoom={6}
      scrollWheelZoom={false}
      dragging={!readOnly}
      touchZoom={!readOnly}
      doubleClickZoom={!readOnly}
      boxZoom={!readOnly}
      keyboard={!readOnly}
      zoomControl={!readOnly}
      className="h-full w-full font-sans"
      attributionControl={true}
      minZoom={5}
      maxZoom={11}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">Colaboradores do OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="spc-tiles"
      />
      <Fit points={points} />
      {[...points].sort((a, b) => b.n - a.n).map((p) => {
        const active = selected === p.nome;
        const faded = selected !== null && !active;
        const empty = p.n === 0;
        return (
          <CircleMarker
            key={p.nome}
            center={[p.lat, p.lng]}
            radius={empty ? 6 : 8 + Math.sqrt(p.n) * 3.4}
            pathOptions={{
              color: '#FFFFFF',
              weight: 2,
              fillColor: faded || empty ? DIM : active ? HUE_DEEP : (accent ?? HUE),
              fillOpacity: faded || empty ? 0.85 : 0.8
            }}
            eventHandlers={readOnly ? {} : { click: () => onSelect(active ? null : p.nome) }}
          >
            <Tooltip direction="top" offset={[0, -6]} sticky={false}>
              <strong>{p.nome}</strong>: {p.n} {p.n === 1 ? 'bem tombado' : 'bens tombados'}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  </div>
);
