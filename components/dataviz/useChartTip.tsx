import React, { useCallback, useRef, useState } from 'react';
import { INK } from './tokens';

export interface TipRow { label: string; value: string; color?: string }
export interface TipContent { title: string; rows?: TipRow[]; note?: string }
interface TipState extends TipContent { x: number; y: number }

/**
 * Dica flutuante dos gráficos. Aparece com o mouse e também com o foco do teclado.
 * Todo texto entra como texto (nunca como HTML).
 */
export const useChartTip = () => {
  const wrap = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<TipState | null>(null);

  const place = useCallback((x: number, y: number, content: TipContent) => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    const half = 110;
    const px = Math.min(Math.max(x - r.left, half), Math.max(half, r.width - half));
    setTip({ ...content, x: px, y: y - r.top });
  }, []);

  const showAtPointer = useCallback((e: { clientX: number; clientY: number }, content: TipContent) => place(e.clientX, e.clientY - 12, content), [place]);
  const showForElement = useCallback((el: Element, content: TipContent) => {
    const b = el.getBoundingClientRect();
    place(b.left + b.width / 2, b.top - 6, content);
  }, [place]);
  const hide = useCallback(() => setTip(null), []);

  const node = tip ? (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-30 w-max max-w-[15rem] rounded-xl border border-[#E7E2DE] bg-white px-3 py-2 shadow-lg"
      style={{ left: tip.x, top: tip.y, transform: 'translate(-50%, -100%)' }}
    >
      <p className="text-xs font-semibold" style={{ color: INK.secondary }}>{tip.title}</p>
      {tip.rows?.map((r) => (
        <p key={r.label} className="mt-1 flex items-center gap-2 text-sm leading-tight">
          {r.color && <span aria-hidden="true" className="inline-block h-[3px] w-3 rounded-full" style={{ background: r.color }} />}
          <span className="font-bold" style={{ color: INK.primary }}>{r.value}</span>
          <span style={{ color: INK.secondary }}>{r.label}</span>
        </p>
      ))}
      {tip.note && <p className="mt-1 text-xs leading-snug" style={{ color: INK.muted }}>{tip.note}</p>}
    </div>
  ) : null;

  return { wrap, showAtPointer, showForElement, hide, node };
};
