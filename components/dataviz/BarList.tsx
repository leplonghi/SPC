import React, { useEffect, useState } from 'react';
import { DIM, HUE, INK, pct } from './tokens';
import { useChartTip } from './useChartTip';

export interface BarItem { key: string; label: string; value: number; note?: string }

interface Props {
  items: BarItem[];
  selected: string | null;
  onSelect: (key: string | null) => void;
  /** Palavra no plural para o texto da dica, ex.: "bens" */
  unit: string;
  ariaLabel: string;
  /** Escala fixa (para as barras não "pularem" quando um filtro muda). */
  max?: number;
}

/**
 * Barras horizontais ordenadas. Cada linha é um botão: clicar seleciona (filtra), clicar de novo limpa.
 * Barra fina, ponta arredondada de 4px, valor na ponta, destaque em um tom só e o resto em cinza-azulado.
 */
export const BarList: React.FC<Props> = ({ items, selected, onSelect, unit, ariaLabel, max }) => {
  const { wrap, showAtPointer, showForElement, hide, node } = useChartTip();
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(t); }, []);
  const total = items.reduce((s, i) => s + i.value, 0);
  const top = max ?? Math.max(1, ...items.map((i) => i.value));

  return (
    <div ref={wrap} className="relative">
      <ul className="space-y-1" aria-label={ariaLabel}>
        {items.map((it) => {
          const active = selected === it.key;
          const faded = selected !== null && !active;
          const content = {
            title: it.label,
            rows: [{ label: it.value === 1 ? unit.replace(/s$/, '') : unit, value: String(it.value) }],
            note: `${pct(it.value, total)}% do total mostrado${it.note ? `. ${it.note}` : ''}`
          };
          return (
            <li key={it.key}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(active ? null : it.key)}
                onPointerMove={(e) => showAtPointer(e, content)}
                onPointerLeave={hide}
                onFocus={(e) => showForElement(e.currentTarget, content)}
                onBlur={hide}
                className={`group block w-full rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[#F4EFEA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A78A8] ${active ? 'bg-[#EAF2F7]' : ''}`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className={`text-[13px] leading-snug ${active ? 'font-bold' : 'font-medium'}`} style={{ color: INK.primary }}>{it.label}</span>
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="chart-mark-absolute block h-3 rounded-r-[4px] transition-[width,background-color] duration-700 ease-out"
                    style={{
                      width: ready ? `${it.value > 0 ? Math.max(1.5, (it.value / top) * 86) : 0.6}%` : '0%',
                      minWidth: 2,
                      background: faded || it.value === 0 ? DIM : HUE
                    }}
                  />
                  <span className="text-[13px] font-bold tabular-nums" style={{ color: INK.primary }}>{it.value}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {node}
    </div>
  );
};
