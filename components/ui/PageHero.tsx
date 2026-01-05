import React from 'react';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageHeroProps {
    title: React.ReactNode;
    description?: string;
    badge?: {
        text: string;
        icon?: LucideIcon;
        variant?: 'red' | 'blue' | 'dark' | 'white';
    };
    breadcrumb?: {
        label: string;
        to: string;
    };
    backgroundImage?: string;
    actions?: React.ReactNode;
    align?: 'left' | 'center';
}

export const PageHero: React.FC<PageHeroProps> = ({
    title,
    description,
    badge,
    breadcrumb,
    backgroundImage = '/imagens/card_imaterial.jpg',
    actions,
    align = 'left'
}) => {
    // Badge Styles
    const badgeStyles = {
        red: 'bg-brand-red/20 text-brand-red border-brand-red/30',
        blue: 'bg-brand-blue/20 text-brand-blue border-brand-blue/30',
        dark: 'bg-brand-dark/20 text-white border-white/30',
        white: 'bg-[#CC343A]/20 text-[#CC343A] border-[#CC343A]/30', // Fallback/Special for Legislacao
    };

    const currentBadgeStyle = badge?.variant ? badgeStyles[badge.variant] : badgeStyles.blue;

    return (
        <section className="bg-[#2D2D2D] pt-12 pb-8 relative overflow-hidden">
            {/* Background Image */}
            <div className={`absolute inset-0 ${align === 'center' ? 'opacity-80' : 'opacity-60'}`}>
                <img
                    src={backgroundImage}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 ${align === 'center'
                    ? 'bg-gradient-to-b from-[#2D2D2D]/60 via-[#2D2D2D]/90 to-[#2D2D2D]'
                    : 'bg-gradient-to-r from-brand-blue via-brand-blue/95 to-transparent'
                }`}></div>

            <div className={`relative max-w-7xl mx-auto px-6 ${align === 'left' ? 'grid grid-cols-1 md:grid-cols-2 gap-8 items-center' : 'text-center space-y-4'
                }`}>
                <div className="space-y-4">
                    {/* Breadcrumb (Optional, strictly usually top-left but sticking to flow) */}
                    {breadcrumb && (
                        <Link
                            to={breadcrumb.to}
                            className={`inline-flex items-center gap-2 font-bold mb-2 hover:text-white transition-colors text-[10px] uppercase tracking-widest ${align === 'center' ? 'justify-center text-slate-400' : 'text-slate-300'}`}
                        >
                            <ArrowLeft size={12} /> {breadcrumb.label}
                        </Link>
                    )}

                    {/* Badge */}
                    {badge && (
                        <div className={align === 'center' ? 'flex justify-center' : ''}>
                            <div className={`inline-flex items-center gap-2 px-2.5 py-1 border rounded-full text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md ${currentBadgeStyle}`}>
                                {badge.icon && <badge.icon size={10} />} {badge.text}
                            </div>
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-xl md:text-3xl font-black text-white leading-tight">
                        {title}
                    </h1>

                    {/* Description */}
                    {description && (
                        <p className={`text-xs text-slate-300 leading-relaxed font-medium ${align === 'center' ? 'max-w-xl mx-auto' : 'max-w-lg'}`}>
                            {description}
                        </p>
                    )}

                    {/* Actions */}
                    {actions && (
                        <div className={`flex flex-wrap gap-3 pt-2 ${align === 'center' ? 'justify-center' : ''}`}>
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
