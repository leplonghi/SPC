import React from 'react';
import {
    X,
    Printer,
    MapPin,
    Clock,
    Compass,
    Info,
    Calendar,
    Building2,
    CheckCircle2
} from 'lucide-react';
import { HeritageAsset } from '../../types_patrimonio';
import { TouristRoute } from '../../data/touristData';
import { GlassPanel } from '../ui/GlassPanel';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';

// Use a simpler marker icon for print to ensure it shows up well
const getPrintMarkerIcon = (index: number) => L.divIcon({
    html: `
        <div style="
            width: 24px; 
            height: 24px; 
            background: #1E88E5; 
            border: 2px solid white; 
            border-radius: 50%; 
            color: white; 
            font-size: 12px; 
            font-weight: 900; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">${index + 1}</div>
    `,
    className: 'print-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

interface RouteReportProps {
    sequence: HeritageAsset[];
    routeInfo?: TouristRoute | null;
    activeRoute?: [number, number][] | null;
    onClose: () => void;
}

export const RouteReport: React.FC<RouteReportProps> = ({ sequence, routeInfo, activeRoute, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    const today = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="fixed inset-0 z-[5000] bg-slate-50 overflow-y-auto font-sans animate-fade-in no-scrollbar">
            {/* Header Controls - Hidden in print */}
            <div className="sticky top-0 z-[5001] bg-white/80 backdrop-blur-xl border-b border-slate-200 p-4 flex justify-between items-center px-4 md:px-12 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-dark flex items-center justify-center text-white shadow-xl">
                        <Compass size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-brand-dark uppercase tracking-widest leading-none">Relatório de Roteiro</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Visualização para Exportação</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2.5 bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-brand-blue/20"
                    >
                        <Printer size={16} /> Imprimir / PDF
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Document Content */}
            <div className="max-w-[1200px] mx-auto py-8 px-4 md:px-8 print:p-0 print:max-w-full">
                <div className="bg-white shadow-2xl rounded-[32px] overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none">

                    {/* Compact Hero Section */}
                    <div className="relative h-[180px] w-full bg-brand-dark overflow-hidden print:h-[120px]">
                        <img
                            src={routeInfo?.imageUrl || sequence[0]?.imagens_historicas?.[0] || 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&q=80&w=1200'}
                            className="w-full h-full object-cover opacity-50"
                            alt="Header"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />

                        <div className="absolute bottom-6 left-8 right-8 text-white">
                            <h1 className="text-3xl font-black mb-1 leading-tight uppercase tracking-tight">
                                {routeInfo?.title || 'Meu Roteiro Personalizado'}
                            </h1>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                {routeInfo?.description?.substring(0, 100) || 'Exploração técnica e cultural do patrimônio histórico.'}...
                            </p>
                        </div>
                    </div>

                    {/* Metadata Strip */}
                    <div className="bg-slate-50 border-b border-slate-100 px-8 py-3 flex flex-wrap gap-6 items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-brand-blue" /> {today}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-brand-blue" /> SÃO LUÍS - MA
                        </div>
                        <div className="flex items-center gap-1.5 text-brand-dark">
                            <Building2 size={12} className="text-brand-blue" /> SPC - PORTAL DO PATRIMÔNIO
                        </div>
                    </div>

                    {/* 1-Page Layout Grid */}
                    <div className="p-6 md:p-8 grid md:grid-cols-12 gap-6">

                        {/* Left: Map & Summary (Col 1-8) */}
                        <div className="md:col-span-8 flex flex-col gap-6">
                            {/* Map Container - Compact but readable */}
                            <div className="bg-white rounded-[24px] overflow-hidden border border-slate-200 shadow-md h-[450px] relative print:h-[500px]">
                                <MapContainer
                                    center={[sequence[0]?.lat || -2.5298, sequence[0]?.lng || -44.3060]}
                                    zoom={16}
                                    scrollWheelZoom={false}
                                    dragging={false}
                                    zoomControl={false}
                                    className="w-full h-full z-10"
                                >
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                    />
                                    {activeRoute && (
                                        <>
                                            <Polyline positions={activeRoute} color="#1E88E5" weight={5} opacity={0.6} />
                                            <Polyline positions={activeRoute} color="#FFFFFF" weight={2} opacity={0.8} dashArray="5, 8" />
                                        </>
                                    )}
                                    {sequence.map((stop, idx) => (
                                        <Marker
                                            key={stop.id}
                                            position={[stop.lat, stop.lng]}
                                            icon={getPrintMarkerIcon(idx)}
                                        />
                                    ))}
                                </MapContainer>
                                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
                                    <p className="text-[8px] font-black text-brand-blue uppercase tracking-widest text-center">Visão Geoespacial</p>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Distância</p>
                                    <p className="text-base font-black text-brand-dark uppercase">~1.5 KM</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tempo Est.</p>
                                    <p className="text-base font-black text-brand-dark uppercase">~2 HORAS</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Dificuldade</p>
                                    <p className="text-base font-black text-brand-dark uppercase">{routeInfo?.difficulty || 'MÉDIA'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Point List (Col 9-12) */}
                        <div className="md:col-span-4 flex flex-col gap-4">
                            <h3 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Itinerário Detalhado</h3>
                            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 no-scrollbar print:max-h-none">
                                {sequence.map((stop, idx) => (
                                    <div key={stop.id} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm break-inside-avoid">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-6 h-6 rounded-lg bg-brand-dark text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </div>
                                            <h4 className="text-[11px] font-black text-slate-800 leading-tight uppercase truncate">{stop.titulo}</h4>
                                        </div>
                                        <p className="text-[9px] text-slate-500 leading-relaxed font-serif line-clamp-3 italic mb-2">
                                            "{stop.descricao || 'Ativo histórico tombado pelo estado do Maranhão.'}"
                                        </p>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                            <span className="text-[8px] font-black text-brand-blue uppercase">{stop.categoria}</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase">SÉC. {stop.ano_construcao?.includes('1') ? 'XIX' : 'XX'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Branding Footer inside page */}
                            <div className="mt-auto pt-6 text-center border-t border-slate-100">
                                <img src="/spc-logo.png" className="h-6 mx-auto opacity-20 grayscale mb-3" alt="SPC Logo" />
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Secretaria de Cultura - MA</p>
                                <p className="text-[7px] font-bold text-slate-400 mt-1 uppercase">Relatório Gerado via Geomanager AI</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body { background: white !important; }
                    .print-hidden { display: none !important; }
                    .bg-slate-50 { background-color: transparent !important; }
                    @page { margin: 20mm; }
                    .break-inside-avoid { break-inside: avoid; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};
