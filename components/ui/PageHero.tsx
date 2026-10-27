import React from 'react';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AzulejoBand } from './Reveal';
import { Tone } from './theme';

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
    /** Cor da área (padrão: azul). Muda o brilho de fundo e o marcador do selo. */
    tone?: Tone;
}

const GLOW: Record<Tone, string> = {
    blue: 'glow-blue',
    terracotta: 'glow-terracotta',
    sage: 'glow-sage',
    red: 'glow-terracotta',
    navy: 'glow-blue',
};

const DOT: Record<Tone, string> = {
    blue: 'bg-brand-blue',
    terracotta: 'bg-brand-terracotta',
    sage: 'bg-brand-sage',
    red: 'bg-brand-red',
    navy: 'bg-white',
};

/** Faixa de título das páginas internas: fundo azul-marinho com azulejo, brilho da cor da área e faixa de azulejo na base. */
export const PageHero: React.FC<PageHeroProps> = ({
    title,
    description,
    badge,
    breadcrumb,
    backgroundImage = '/imagens/card_imaterial.jpg',
    actions,
    align = 'left',
    tone = 'blue'
}) => {
    const centered = align === 'center';

    return (
        <section className="bg-brand-navy relative overflow-hidden text-white">
            {/* Camadas decorativas (somem no alto contraste) */}
            <div aria-hidden="true" className={`deco absolute -right-24 -top-24 w-[34rem] h-[34rem] ${GLOW[tone]}`} />
            <div aria-hidden="true" className="deco absolute -left-32 bottom-0 w-[26rem] h-[26rem] glow-terracotta opacity-60" />
            <div
                aria-hidden="true"
                className="deco absolute inset-y-0 right-0 w-full md:w-1/2 opacity-30 md:opacity-40"
                style={{
                    backgroundImage: `url("${backgroundImage}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    WebkitMaskImage: 'linear-gradient(to left, black 0%, transparent 85%)',
                    maskImage: 'linear-gradient(to left, black 0%, transparent 85%)',
                }}
            />

            <div className={`relative max-w-[1200px] mx-auto px-6 pt-12 pb-14 md:pt-16 md:pb-20 ${centered ? 'text-center' : ''}`}>
                <div className={`space-y-5 ${centered ? 'max-w-3xl mx-auto' : 'max-w-3xl'}`}>
                    {breadcrumb && (
                        <Link
                            to={breadcrumb.to}
                            className={`inline-flex items-center gap-2 font-bold hover:text-white transition-colors text-xs uppercase tracking-widest text-slate-200 ${centered ? 'justify-center' : ''}`}
                        >
                            <ArrowLeft size={14} aria-hidden="true" /> {breadcrumb.label}
                        </Link>
                    )}

                    {badge && (
                        <div className={centered ? 'flex justify-center' : ''}>
                            <div className="inline-flex items-center gap-2.5 pl-2 pr-4 py-1.5 bg-white/10 border border-white/25 rounded-full text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur-md text-white">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${DOT[tone]}`}>
                                    {badge.icon ? <badge.icon size={11} aria-hidden="true" /> : <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                                {badge.text}
                            </div>
                        </div>
                    )}

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.08] tracking-tight">
                        {title}
                    </h1>

                    {description && (
                        <p className={`text-base md:text-lg text-slate-200 leading-relaxed ${centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
                            {description}
                        </p>
                    )}

                    {actions && (
                        <div className={`flex flex-wrap gap-3 pt-2 ${centered ? 'justify-center' : ''}`}>
                            {actions}
                        </div>
                    )}
                </div>
            </div>
            <AzulejoBand large />
        </section>
    );
};
