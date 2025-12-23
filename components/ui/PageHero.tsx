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
        <div className="bg-brand-dark text-white pt-32 pb-20 relative overflow-hidden">
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
                        className="inline-flex items-center gap-2 text-brand-blue font-bold mb-8 hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft size={16} /> {breadcrumb.label}
                    </Link>
                )}

                {/* Badge */}
                {badge && (
                    <div className="mb-6">
                        <span className="inline-flex items-center px-3 py-1 bg-brand-red/10 text-brand-red border border-brand-red/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                            {badge}
                        </span>
                    </div>
                )}

                {/* Title */}
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-white">
                    {title}
                </h1>

                {/* Description */}
                {description && (
                    <p className="text-lg text-slate-300 max-w-2xl leading-relaxed font-medium">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};
