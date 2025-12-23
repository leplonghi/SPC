import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageHeroProps {
    title: React.ReactNode;
    description?: string;
    badge?: string;
    breadcrumb?: {
        label: string;
        to: string;
    };
    backgroundImage?: string;
}

export const PageHero: React.FC<PageHeroProps> = ({
    title,
    description,
    badge,
    breadcrumb,
    backgroundImage = '/imagens/mapa_sao_luiz.jpg'
}) => {
    return (
        <div className="bg-brand-dark text-white pt-12 pb-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <img
                    src={backgroundImage}
                    alt="Background Pattern"
                    className="w-full h-full object-cover grayscale"
                />
            </div>

            {/* Gradient Overlay - Standard Brand Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/60 via-brand-dark/90 to-brand-dark"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Breadcrumb / Back Link */}
                {breadcrumb && (
                    <Link
                        to={breadcrumb.to}
                        className="inline-flex items-center gap-2 text-brand-blue font-bold mb-4 hover:text-white transition-colors text-[10px] uppercase tracking-widest"
                    >
                        <ArrowLeft size={12} /> {breadcrumb.label}
                    </Link>
                )}

                {/* Badge */}
                {badge && (
                    <div className="mb-3">
                        <span className="inline-flex items-center px-2 py-0.5 bg-brand-red/10 text-brand-red border border-brand-red/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                            {badge}
                        </span>
                    </div>
                )}

                {/* Title */}
                <h1 className="text-xl md:text-3xl font-black mb-2 leading-tight text-white">
                    {title}
                </h1>

                {/* Description */}
                {description && (
                    <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed font-medium">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};
