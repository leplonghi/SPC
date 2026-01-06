import React, { useState, useMemo } from 'react';
import {
    Compass,
    Map as MapIcon,
    Clock,
    TrendingUp,
    ChevronRight,
    Play,
    Info,
    Plus
} from 'lucide-react';
import { HeritageAsset } from '../../types_patrimonio';
import { TOURIST_ROUTES, TouristRoute, ADDITIONAL_SITES } from '../../data/touristData';
import { HERITAGE_SITES } from '../../data/geoManagerData';

// Merge all sites for lookup
const ALL_SITES = [...HERITAGE_SITES, ...ADDITIONAL_SITES];

interface TourismRoutesPanelProps {
    onSelectRoute: (assets: HeritageAsset[], route: TouristRoute) => void;
    onCreateRoute: () => void;
    currentRouteId?: string | null;
    canCreate?: boolean;
}

const CATEGORIES = ['Todos', 'Religioso', 'Institucional', 'Cultural', 'Emblemático'];

export const TourismRoutesPanel: React.FC<TourismRoutesPanelProps> = ({ onSelectRoute, onCreateRoute, currentRouteId, canCreate }) => {
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    const filteredRoutes = useMemo(() => {
        if (selectedCategory === 'Todos') return TOURIST_ROUTES;
        return TOURIST_ROUTES.filter(r => r.category === selectedCategory);
    }, [selectedCategory]);

    const handleStartRoute = (route: TouristRoute) => {
        const assets = route.stops
            .map(id => ALL_SITES.find(site => site.id === id))
            .filter(Boolean) as HeritageAsset[];
        onSelectRoute(assets, route);
    };

    return (
        <div className="absolute top-24 left-4 right-4 md:left-auto md:right-6 md:w-[380px] z-[1000] animate-slide-in-right pointer-events-auto flex flex-col gap-4 max-h-[calc(100vh-140px)]">
            <div className="backdrop-blur-xl bg-white/90 border border-white/20 shadow-2xl rounded-3xl overflow-hidden flex flex-col flex-1">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-fit mb-2">
                                <Compass size={10} /> Tourism AI
                            </span>
                            <h2 className="text-xl font-black text-brand-dark leading-none">Roteiros Curados</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">Explorações Temáticas em São Luís</p>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? 'bg-brand-dark text-white shadow-lg scale-105'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Create Custom Route Card */}
                {canCreate && (
                    <div className="px-4 pt-4">
                        <button
                            onClick={onCreateRoute}
                            className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue to-blue-600 p-4 text-left group shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Compass size={64} className="text-white rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Plus size={16} className="text-white" />
                                </div>
                                <h3 className="text-white font-black text-lg leading-none mb-1">Crie seu Roteiro</h3>
                                <p className="text-white/80 text-[10px] font-bold uppercase tracking-wide pr-8">
                                    Escolha pontos no mapa e a IA montará o trajeto ideal.
                                </p>
                            </div>
                        </button>
                        <div className="h-px bg-slate-100 my-4" />
                    </div>
                )}

                {/* Routes List */}
                <div className="overflow-y-auto px-4 pb-4 space-y-4 flex-1 custom-scrollbar">
                    {filteredRoutes.map(route => {
                        const isActive = currentRouteId === route.id;
                        return (
                            <div
                                key={route.id}
                                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${isActive
                                    ? 'border-brand-blue ring-2 ring-brand-blue/20 shadow-xl'
                                    : 'border-slate-100 hover:border-brand-blue/50 hover:shadow-lg bg-white'
                                    }`}
                            >
                                {/* Image Background Area */}
                                <div className="h-24 w-full relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                                    <img
                                        src={route.imageUrl}
                                        alt={route.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-3 left-3 z-20">
                                        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest text-white backdrop-blur-md ${route.category === 'Religioso' ? 'bg-purple-500/80' :
                                            route.category === 'Institucional' ? 'bg-blue-500/80' :
                                                route.category === 'Emblemático' ? 'bg-amber-500/80' : 'bg-rose-500/80'
                                            }`}>
                                            {route.category}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-3 left-3 right-3 z-20">
                                        <h3 className="text-white font-black text-lg leading-tight mb-0.5">{route.title}</h3>
                                        <div className="flex items-center gap-3 text-white/80 text-[9px] font-bold uppercase tracking-wide">
                                            <span className="flex items-center gap-1"><Clock size={10} /> {route.duration}</span>
                                            <span className="flex items-center gap-1"><TrendingUp size={10} /> {route.difficulty}</span>
                                            <span className="flex items-center gap-1"><MapIcon size={10} /> {route.stops.length} Paradas</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-4 bg-white">
                                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-4 line-clamp-2">
                                        {route.description}
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleStartRoute(route)}
                                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isActive
                                                ? 'bg-brand-blue text-white shadow-lg'
                                                : 'bg-brand-dark text-white hover:bg-black hover:shadow-lg'
                                                }`}
                                        >
                                            {isActive ? 'Em Curso' : 'Iniciar Roteiro'} <Play size={10} className={isActive ? 'animate-pulse' : ''} />
                                        </button>
                                        <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors" title="Mais detalhes">
                                            <Info size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Stats / Info Widget */}
            <div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-xl rounded-2xl p-3 shrink-0">
                <div className="grid grid-cols-2 gap-0 relative">
                    <div className="flex items-center gap-2 justify-center border-r border-slate-200 pr-2">
                        <div className="p-1.5 bg-brand-blue/10 rounded-full text-brand-blue shrink-0">
                            <TrendingUp size={14} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider truncate">Ativos mapeados</p>
                            <p className="text-xs font-black text-brand-dark truncate">{ALL_SITES.length} Locais</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 justify-center pl-2">
                        <div className="p-1.5 bg-brand-red/10 rounded-full text-brand-red shrink-0">
                            <MapIcon size={14} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider truncate">Roteiros Totais</p>
                            <p className="text-xs font-black text-brand-dark truncate">{TOURIST_ROUTES.length} Opções</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
