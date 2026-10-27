import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Minus, Plus, Maximize2, Hand } from 'lucide-react';

export type PanZoomPoint = {
  id: string;
  /** Rótulo exatamente como aparece no documento. */
  label: string;
  /** Posição na imagem, de 0 a 1 (x da esquerda, y do topo). */
  x: number;
  y: number;
};

type Props = {
  /** Versão leve, carregada de imediato. */
  src: string;
  /** Versão grande, carregada só quando a pessoa começa a explorar. */
  srcFull?: string;
  alt: string;
  /** Largura e altura reais da imagem (para a proporção). */
  width: number;
  height: number;
  points?: PanZoomPoint[];
  maxScale?: number;
};

type View = { s: number; x: number; y: number };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Visualizador de imagem com zoom e arrasto: roda do mouse (com Ctrl), pinça no celular,
 * botões +/−, duplo clique, setas do teclado. Não prende a rolagem da página.
 */
export const PanZoomImage: React.FC<Props> = ({ src, srcFull, alt, width, height, points = [], maxScale = 6 }) => {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View>({ s: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [full, setFull] = useState(false);
  const [fullReady, setFullReady] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [hint, setHint] = useState(true);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const last = useRef<{ x: number; y: number; d: number } | null>(null);
  const moved = useRef(false);

  // O "ajuste" é a escala em que a imagem cobre a largura da caixa
  const fit = size.w && size.h ? Math.min(size.w / width, size.h / height) : 1;
  const imgW = width * fit;
  const imgH = height * fit;

  const limit = useCallback(
    (v: View): View => {
      const s = clamp(v.s, 1, maxScale);
      const W = imgW * s;
      const H = imgH * s;
      const x = W <= size.w ? (size.w - W) / 2 : clamp(v.x, size.w - W, 0);
      const y = H <= size.h ? (size.h - H) / 2 : clamp(v.y, size.h - H, 0);
      return { s, x, y };
    },
    [imgW, imgH, size.w, size.h, maxScale]
  );

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Reenquadra quando a caixa muda de tamanho
  useEffect(() => {
    if (size.w) setView((v) => limit(v));
  }, [size.w, size.h, limit]);

  // Carrega a imagem grande só quando faz sentido
  useEffect(() => {
    if (!srcFull || !full) return;
    const im = new Image();
    im.onload = () => setFullReady(true);
    im.src = srcFull;
  }, [full, srcFull]);

  const wake = () => {
    setFull(true);
    setHint(false);
  };

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number) => {
      setView((v) => {
        const s = clamp(v.s * factor, 1, maxScale);
        const k = s / v.s;
        return limit({ s, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k });
      });
    },
    [limit, maxScale]
  );

  const centerZoom = (factor: number) => {
    wake();
    setAnimate(true);
    zoomAt(factor, size.w / 2, size.h / 2);
  };

  const [animate, setAnimate] = useState(false);

  const reset = () => {
    setAnimate(true);
    setActive(null);
    setView(limit({ s: 1, x: 0, y: 0 }));
  };

  const focusPoint = (p: PanZoomPoint) => {
    wake();
    setActive(p.id);
    setAnimate(true);
    const s = Math.min(maxScale, 3.4);
    setView(limit({ s, x: size.w / 2 - p.x * imgW * s, y: size.h / 2 - p.y * imgH * s }));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-ctl]')) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
    setAnimate(false);
    setDragging(true);
    wake();
    const pts = [...pointers.current.values()];
    last.current = {
      x: pts.reduce((a, p) => a + p.x, 0) / pts.length,
      y: pts.reduce((a, p) => a + p.y, 0) / pts.length,
      d: pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const d = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    const l = last.current;
    if (!l) return;
    const dx = cx - l.x;
    const dy = cy - l.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true;
    const rect = box.current!.getBoundingClientRect();
    setView((v) => {
      let nv = { ...v, x: v.x + dx, y: v.y + dy };
      if (pts.length > 1 && l.d > 0) {
        const f = d / l.d;
        const s = clamp(nv.s * f, 1, maxScale);
        const k = s / nv.s;
        const px = cx - rect.left;
        const py = cy - rect.top;
        nv = { s, x: px - (px - nv.x) * k, y: py - (py - nv.y) * k };
      }
      return limit(nv);
    });
    last.current = { x: cx, y: cy, d };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) {
      setDragging(false);
      last.current = null;
    } else {
      const pts = [...pointers.current.values()];
      last.current = { x: pts[0].x, y: pts[0].y, d: 0 };
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    // Só com Ctrl/Cmd, para não roubar a rolagem da página
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    wake();
    setAnimate(false);
    const rect = box.current!.getBoundingClientRect();
    zoomAt(Math.exp(-e.deltaY * 0.0022), e.clientX - rect.left, e.clientY - rect.top);
  };

  // preventDefault em wheel precisa de listener não passivo
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const h = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    el.addEventListener('wheel', h, { passive: false });
    return () => el.removeEventListener('wheel', h);
  }, []);

  const onDouble = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-ctl]')) return;
    wake();
    setAnimate(true);
    const rect = box.current!.getBoundingClientRect();
    if (view.s > 1.5) reset();
    else zoomAt(2.6, e.clientX - rect.left, e.clientY - rect.top);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = 60;
    if (e.key === '+' || e.key === '=') { e.preventDefault(); centerZoom(1.5); }
    else if (e.key === '-') { e.preventDefault(); centerZoom(1 / 1.5); }
    else if (e.key === '0') { e.preventDefault(); reset(); }
    else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      wake();
      setAnimate(false);
      setView((v) =>
        limit({
          ...v,
          x: v.x + (e.key === 'ArrowLeft' ? step : e.key === 'ArrowRight' ? -step : 0),
          y: v.y + (e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0)
        })
      );
    }
  };

  const zoomed = view.s > 1.05;

  return (
    <div className="space-y-3">
      <div
        ref={box}
        role="group"
        tabIndex={0}
        aria-label={`${alt}. Visualizador com zoom: use as teclas de mais e menos para aproximar e as setas para mover.`}
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={onDouble}
        className={`relative w-full overflow-hidden rounded-3xl bg-[#E9DFCF] shadow-xl ring-1 ring-brand-navy/10 select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ height: 'clamp(300px, min(72vh, 90vw), 720px)', touchAction: 'none' }}
      >
        <div
          className="absolute left-0 top-0 will-change-transform"
          style={{
            width: imgW,
            height: imgH,
            transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})`,
            transformOrigin: '0 0',
            transition: animate ? 'transform 650ms cubic-bezier(.22,.8,.24,1)' : 'none'
          }}
          onTransitionEnd={() => setAnimate(false)}
        >
          <img src={src} alt={alt} draggable={false} width={width} height={height} className="absolute inset-0 h-full w-full" />
          {srcFull && fullReady && (
            <img src={srcFull} alt="" aria-hidden="true" draggable={false} className="absolute inset-0 h-full w-full" />
          )}
          {points.map((p) => {
            const on = active === p.id;
            return (
              <button
                key={p.id}
                type="button"
                data-ctl
                onClick={(e) => { e.stopPropagation(); focusPoint(p); }}
                aria-label={`Ir para ${p.label}`}
                aria-pressed={on}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, transform: `translate(-50%,-50%) scale(${1 / view.s})` }}
              >
                <span className={`relative flex h-5 w-5 items-center justify-center`}>
                  <span aria-hidden="true" className={`absolute inset-0 rounded-full bg-brand-red/40 ${on ? '' : 'animate-ping'}`} />
                  <span className={`relative h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-red-dark shadow ${on ? 'scale-125' : ''}`} />
                </span>
                <span className={`pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-navy px-2 py-1 text-[11px] font-bold text-white shadow-lg transition-opacity ${on ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}>
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Controles */}
        <div data-ctl className="absolute right-3 top-3 flex flex-col gap-1.5">
          <button type="button" onClick={() => centerZoom(1.6)} aria-label="Aproximar" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-navy shadow-lg transition hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-blue">
            <Plus size={18} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => centerZoom(1 / 1.6)} aria-label="Afastar" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-navy shadow-lg transition hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-blue">
            <Minus size={18} aria-hidden="true" />
          </button>
          <button type="button" onClick={reset} aria-label="Ver a planta inteira" className={`flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-navy shadow-lg transition hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-blue ${zoomed ? '' : 'opacity-60'}`}>
            <Maximize2 size={16} aria-hidden="true" />
          </button>
        </div>

        {hint && (
          <div aria-hidden="true" className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-brand-navy/90 px-4 py-2 text-xs font-bold text-white shadow-lg">
            <Hand size={14} /> Arraste ou toque duas vezes
          </div>
        )}
      </div>

      {points.length > 0 && (
        <div className="flex flex-wrap gap-2" role="list" aria-label="Pontos da planta">
          {points.map((p) => (
            <button
              key={p.id}
              type="button"
              role="listitem"
              onClick={() => focusPoint(p)}
              aria-pressed={active === p.id}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-blue ${
                active === p.id
                  ? 'border-[#E9B44C] bg-[#E9B44C] text-brand-navy'
                  : 'border-white/30 bg-white text-brand-navy hover:border-[#E9B44C] hover:bg-[#FBEFD3]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
