import React from 'react';
import { DIM, INK, pct } from './tokens';
import { useChartTip } from './useChartTip';

export interface SharePart { id: string; label: string; value: number; color: string }

interface Props {
  parts: SharePart[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  unit: string;
  ariaLabel: string;
}

/** Barra única de proporção (parte do todo) com legenda sempre visível. Segmentos separados por 2px. */
export const ShareBar: React.FC<Props> = ({ parts, selected, onSelect, unit, ariaLabel }) => {
  const { wrap, showAtPointer, showForElement, hide, node } = useChartTip();
  const total = parts.reduce((s, p) => s + p.value, 0);
  const visible = parts.filter((p) => p.value > 0);

  return (
    <div ref={wrap} className="relative">
      <div className="flex h-5 w-full gap-[2px] overflow-hidden rounded-md" role="group" aria-label={ariaLabel}>
        {visible.map((p, i) => {
          const active = selected === p.id;
          const faded = selected !== null && !active;
          const content = { title: p.label, rows: [{ label: unit, value: String(p.value), color: p.color }], note: `${pct(p.value, total)}% do total mostrado` };
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={active}
              aria-label={`${p.label}: ${p.value} ${unit}`}
              onClick={() => onSelect(active ? null : p.id)}
              onPointerMove={(e) => showAtPointer(e, content)}
              onPointerLeave={hide}
              onFocus={(e) => showForElement(e.currentTarget, content)}
              onBlur={hide}
              className="chart-mark-absolute h-full transition-[flex-grow,background-color] duration-700 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#071D33]"
              style={{
                flexGrow: p.value,
                flexBasis: 0,
                background: faded ? DIM : p.color,
                borderRadius: `${i === 0 ? 6 : 0}px ${i === visible.length - 1 ? 6 : 0}px ${i === visible.length - 1 ? 6 : 0}px ${i === 0 ? 6 : 0}px`
              }}
            />
          );
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1" aria-label="Legenda">
        {parts.map((p) => {
          const active = selected === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(active ? null : p.id)}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A78A8] ${active ? 'bg-[#EAF2F7]' : 'hover:bg-[#F4EFEA]'}`}
              >
                <span aria-hidden="true" className="chart-mark-absolute inline-block h-[3px] w-4 flex-shrink-0 rounded-full" style={{ background: p.color, height: 10, width: 10, borderRadius: 3 }} />
                <span className="min-w-0" style={{ color: INK.primary, fontWeight: active ? 700 : 500 }}>{p.label}</span>
                <span className="font-bold tabular-nums" style={{ color: INK.primary }}>{p.value}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {node}
    </div>
  );
};
