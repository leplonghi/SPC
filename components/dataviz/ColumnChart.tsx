import React, { useEffect, useState } from 'react';
import { DIM, GRID, HUE, INK, niceTicks } from './tokens';
import { useChartTip } from './useChartTip';

export interface ColSeries { id: string; label: string; color: string }
export interface Col {
  key: string;
  label: string;
  /** Rótulo curto para telas estreitas */
  short?: string;
  parts: { id: string; value: number }[];
}

interface Props {
  cols: Col[];
  series?: ColSeries[];
  selected: string[];
  onSelect: (key: string) => void;
  unit: string;
  ariaLabel: string;
  height?: number;
  /** Colunas cujo valor é o maior ganham o número em cima. */
  labelMax?: boolean;
  fixedMax?: number;
  emptyNote?: string;
  /** Usa o rótulo curto também em telas grandes (muitas colunas) */
  compactLabels?: boolean;
}

const GAP = 2;

/**
 * Colunas (uma ou várias séries empilhadas). Coluna fina (até 24px) com a ponta de cima arredondada,
 * 2px de respiro entre segmentos, grade em hairline, eixo com números redondos.
 * Cada coluna é um botão com área de clique de altura total.
 */
export const ColumnChart: React.FC<Props> = ({
  cols, series, selected, onSelect, unit, ariaLabel, height = 190, labelMax = true, fixedMax, emptyNote, compactLabels = false
}) => {
  const { wrap, showAtPointer, showForElement, hide, node } = useChartTip();
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(t); }, []);

  const sums = cols.map((c) => c.parts.reduce((s, p) => s + p.value, 0));
  const dataMax = Math.max(1, ...sums);
  const ticks = niceTicks(fixedMax ?? dataMax);
  const top = ticks[ticks.length - 1];
  const hasSel = selected.length > 0;
  const colorOf = (id: string) => series?.find((s) => s.id === id)?.color ?? HUE;

  return (
    <div ref={wrap} className="relative pt-5">
      <div className="flex" style={{ height: height + 28 }}>
        {/* eixo vertical */}
        <div className="relative w-8 flex-shrink-0" style={{ height }} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="chart-label absolute right-2 -translate-y-1/2 text-[11px] tabular-nums" style={{ bottom: `${(t / top) * 100}%`, color: INK.muted }}>{t}</span>
          ))}
        </div>
        <div className="relative flex-1" role="group" aria-label={ariaLabel}>
          {/* grade */}
          <div className="absolute inset-x-0 top-0" style={{ height }} aria-hidden="true">
            {ticks.map((t) => (
              <div key={t} className="absolute inset-x-0" style={{ bottom: `${(t / top) * 100}%`, height: 1, background: t === 0 ? '#C9C2BC' : GRID }} />
            ))}
          </div>
          <div className="relative flex h-full items-stretch justify-between gap-[2px]">
            {cols.map((c, i) => {
              const sum = sums[i];
              const active = selected.includes(c.key);
              const faded = hasSel && !active;
              const content = {
                title: c.label,
                rows: sum === 0
                  ? undefined
                  : (series && series.length > 1
                    ? c.parts.filter((p) => p.value > 0).map((p) => ({ label: series.find((s) => s.id === p.id)?.label ?? p.id, value: String(p.value), color: colorOf(p.id) }))
                    : [{ label: sum === 1 ? unit.replace(/s$/, '') : unit, value: String(sum) }]),
                note: sum === 0 ? (emptyNote ?? 'Nenhum registro neste período') : (series && series.length > 1 ? `Total: ${sum}` : undefined)
              };
              const parts = c.parts.filter((p) => p.value > 0);
              const isMax = labelMax && sum > 0 && sum === dataMax;
              return (
                <button
                  key={c.key}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${c.label}: ${sum} ${sum === 1 ? unit.replace(/s$/, '') : unit}`}
                  onClick={() => onSelect(c.key)}
                  onPointerMove={(e) => showAtPointer(e, content)}
                  onPointerLeave={hide}
                  onFocus={(e) => showForElement(e.currentTarget.querySelector('[data-slot]') ?? e.currentTarget, content)}
                  onBlur={hide}
                  className={`group relative flex min-w-0 flex-1 flex-col rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A78A8] ${active ? 'bg-[#EAF2F7]' : 'hover:bg-[#F4EFEA]'}`}
                >
                  <span data-slot className="relative block w-full" style={{ height }}>
                    <span className="absolute inset-x-0 bottom-0 flex flex-col-reverse items-center" style={{ gap: GAP }}>
                      {parts.map((p, j) => {
                        const h = ready ? Math.max(2, (p.value / top) * height - (parts.length > 1 ? GAP : 0)) : 0;
                        const isTop = j === parts.length - 1;
                        return (
                          <span
                            key={p.id}
                            aria-hidden="true"
                            className="chart-mark-absolute block w-full max-w-[24px] transition-[height,background-color] duration-700 ease-out"
                            style={{
                              height: h,
                              background: faded ? DIM : colorOf(p.id),
                              borderRadius: isTop ? '4px 4px 0 0' : 0,
                              transitionDelay: ready ? `${i * 25}ms` : '0ms'
                            }}
                          />
                        );
                      })}
                      {sum === 0 && <span aria-hidden="true" className="chart-mark-absolute block h-[2px] w-full max-w-[24px] rounded-full" style={{ background: DIM }} />}
                    </span>
                    {(isMax || active) && sum > 0 && (
                      <span
                        aria-hidden="true"
                        className="chart-label absolute inset-x-0 text-center text-xs font-bold tabular-nums"
                        style={{ bottom: (sum / top) * height + 3, color: INK.primary }}
                      >
                        {sum}
                      </span>
                    )}
                  </span>
                  <span className="mt-1.5 block h-5 text-center text-[11px] leading-5 tabular-nums" style={{ color: active ? INK.primary : INK.secondary, fontWeight: active ? 700 : 500 }}>
                    {compactLabels ? <span>{c.short ?? c.label}</span> : (<><span className="hidden sm:inline">{c.label}</span><span className="sm:hidden">{c.short ?? c.label}</span></>)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {node}
    </div>
  );
};
