import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { AzulejoBand, Reveal } from './Reveal';

interface InfoPageProps {
  title: string;
  intro?: string;
  eyebrow?: string;
  children: React.ReactNode;
}

/** Estrutura simples para páginas de texto: faixa de título, conteúdo e link de volta. */
export const InfoPage: React.FC<InfoPageProps> = ({ title, intro, eyebrow, children }) => {
  usePageTitle(title);
  return (
    <>
      <section className="bg-brand-navy text-white relative overflow-hidden">
        <div aria-hidden="true" className="deco absolute -right-20 -top-24 w-[28rem] h-[28rem] glow-blue" />
        <div className="relative max-w-4xl mx-auto px-6 py-14 md:py-16">
          {eyebrow && (
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-200 mb-4">
              <span aria-hidden="true" className="w-6 h-1 rounded-full bg-brand-terracotta" />{eyebrow}
            </p>
          )}
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">{title}</h1>
          {intro && <p className="mt-4 text-base md:text-lg text-slate-200 leading-relaxed max-w-2xl">{intro}</p>}
        </div>
        <AzulejoBand />
      </section>
      <div className="max-w-4xl mx-auto px-6 py-12 text-slate-700 leading-relaxed space-y-8">
        {React.Children.map(children, (c, i) => (c ? <Reveal delay={Math.min(i, 4) * 60}>{c}</Reveal> : c))}
        <p className="pt-6 border-t border-slate-200">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue-dark hover:underline">
            <ArrowLeft size={14} aria-hidden="true" /> Voltar ao início
          </Link>
        </p>
      </div>
    </>
  );
};

export const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-xl font-extrabold text-brand-navy mb-3">{children}</h2>
);
