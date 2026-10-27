import React from 'react';
import { X } from 'lucide-react';
import { INK } from './tokens';

export interface TableView { head: string[]; rows: (string | number)[][] }

interface Props {
  title: string;
  subtitle?: string;
  /** Texto do filtro ativo; mostra o botão "Limpar" */
  activeLabel?: string | null;
  onClear?: () => void;
  table?: TableView;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Origem dos dados (obrigatória em página institucional) */
  source?: React.ReactNode;
}

/** Cartão de gráfico: título, subtítulo, filtro ativo com botão de limpar e a versão em tabela dos mesmos dados. */
export const ChartCard: React.FC<Props> = ({ title, subtitle, activeLabel, onClear, table, className = '', children, footer, source }) => (
  <section className={`flex min-w-0 flex-col rounded-3xl border border-[#E7E2DE] bg-white p-5 shadow-[0_1px_0_rgba(7,29,51,0.04),0_12px_32px_-18px_rgba(7,29,51,0.25)] md:p-6 ${className}`}>
    <header className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-base font-extrabold leading-tight md:text-lg" style={{ color: '#071D33' }}>{title}</h2>
        {subtitle && <p className="mt-1 text-[13px] leading-snug" style={{ color: INK.secondary }}>{subtitle}</p>}
      </div>
      {activeLabel && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-[#071D33] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#C01B29] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A78A8] focus-visible:ring-offset-2"
          aria-label={`Limpar filtro: ${activeLabel}`}
        >
          <span className="max-w-[9rem] truncate">{activeLabel}</span> <X size={12} aria-hidden="true" />
        </button>
      )}
    </header>
    <div className="flex-1">{children}</div>
    {footer && <div className="mt-3 text-xs leading-snug" style={{ color: INK.muted }}>{footer}</div>}
    {source && <p className="mt-3 border-t border-[#E7E2DE] pt-3 text-xs leading-snug" style={{ color: INK.secondary }}><span className="font-bold" style={{ color: INK.primary }}>Fonte: </span>{source}</p>}
    {table && (
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer font-bold underline decoration-dotted underline-offset-4" style={{ color: '#2F5F78' }}>Ver estes dados em tabela</summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-xl border border-[#E7E2DE]">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{title}</caption>
            <thead className="bg-[#F4EFEA]">
              <tr>{table.head.map((h) => <th key={h} scope="col" className="px-3 py-2 font-bold" style={{ color: INK.primary }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {table.rows.map((r, i) => (
                <tr key={i} className="border-t border-[#E7E2DE]">
                  {r.map((cell, j) => <td key={j} className="px-3 py-1.5 tabular-nums" style={{ color: INK.primary }}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    )}
  </section>
);
