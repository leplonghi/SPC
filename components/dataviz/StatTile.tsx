import React from 'react';
import { useCountUp } from './useCountUp';

interface Props {
  label: string;
  value: number;
  suffix?: string;
  hint?: string;
  /** "hero" = número grande (um por tela); "dark" para fundo azul-marinho */
  size?: 'hero' | 'normal';
  dark?: boolean;
  icon?: React.ReactNode;
}

/** Cartão de número: rótulo, valor que sobe até o total, nota curta. */
export const StatTile: React.FC<Props> = ({ label, value, suffix, hint, size = 'normal', dark = true, icon }) => {
  const v = useCountUp(value);
  return (
    <div className={dark ? 'text-white' : 'text-[#071D33]'}>
      <p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${dark ? 'text-slate-200' : 'text-slate-600'}`}>
        {icon}{label}
      </p>
      <p className={`mt-1 font-display font-black leading-none ${size === 'hero' ? 'text-6xl md:text-7xl' : 'text-3xl md:text-4xl'}`} aria-label={`${value}${suffix ?? ''}`}>
        <span aria-hidden="true">{v}{suffix}</span>
      </p>
      {hint && <p className={`mt-1.5 text-[13px] leading-snug ${dark ? 'text-slate-200' : 'text-slate-600'}`}>{hint}</p>}
    </div>
  );
};
