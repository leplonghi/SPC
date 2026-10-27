import React, { useEffect, useRef } from 'react';
import { CROP_PHONE, CROP_WIDE, ElementSpec } from './sceneLayout';

export interface LoadedElement extends ElementSpec {
  src: string;
  /** tamanho da imagem entregue, para calcular a altura */
  iw: number;
  ih: number;
}

const PERSP = 1300;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

interface Props {
  elements: LoadedElement[];
  trackRef: React.RefObject<HTMLElement>;
  onProgress?: (e: number) => void;
  phone: boolean;
  reduced: boolean;
  className?: string;
}

/**
 * Cena montada com as imagens de cada elemento (boi, casarões, igreja, palmeiras...).
 * Cada elemento é uma camada própria em profundidade (CSS 3D):
 * - mouse ou inclinação do celular: camadas mais próximas se mexem mais que as do fundo;
 * - rolagem: a cena gira e cada elemento se afasta dos outros, até ficar tudo separado.
 */
export const ElementScene: React.FC<Props> = ({ elements, trackRef, onProgress, phone, reduced, className = '' }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const elRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cb = useRef(onProgress);
  cb.current = onProgress;
  const crop = phone ? CROP_PHONE : CROP_WIDE;

  const maxZ = Math.max(1, ...elements.map((e) => e.z));
  const midZ = maxZ / 2;

  // escala da composição para o tamanho do palco (cobre o palco, como "cover")
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const apply = () => {
      const W = stage.clientWidth, H = stage.clientHeight;
      if (!W || !H) return;
      const k = Math.max(W / crop.w, H / crop.h);
      stage.style.setProperty('--k', k.toFixed(5));
      stage.style.setProperty('--ox', `${((W - crop.w * k) / 2 - crop.x * k).toFixed(1)}px`);
      stage.style.setProperty('--oy', `${((H - crop.h * k) / 2 - crop.y * k).toFixed(1)}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [crop.w, crop.h, crop.x, crop.y]);

  useEffect(() => {
    if (reduced) return;
    const rig = rigRef.current;
    const track = trackRef.current;
    if (!rig || !track) return;

    const s = { p: 0, tp: 0, px: 0, py: 0, tx: 0, ty: 0, run: true, raf: 0 };

    const readScroll = () => {
      const r = track.getBoundingClientRect();
      const total = Math.max(1, r.height - (window.innerHeight - 62));
      s.tp = clamp((62 - r.top) / total);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      s.tx = e.clientX / window.innerWidth - 0.5;
      s.ty = e.clientY / window.innerHeight - 0.5;
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      s.tx = clamp(e.gamma / 40, -0.5, 0.5);
      s.ty = clamp((e.beta - 50) / 50, -0.5, 0.5);
    };

    const frame = () => {
      if (!s.run) return;
      s.p += (s.tp - s.p) * 0.1;
      s.px += (s.tx - s.px) * 0.07;
      s.py += (s.ty - s.py) * 0.07;
      const e = s.p * s.p * (3 - 2 * s.p);
      const small = window.innerWidth < 768;
      const calm = 1 - e * 0.85;
      rig.style.transform =
        `translate3d(${(e * (small ? 0 : 5)).toFixed(2)}%, ${(-e * (small ? 3 : 6)).toFixed(2)}%, 0) ` +
        `rotateX(${(e * 58 - s.py * 6 * calm).toFixed(2)}deg) ` +
        `rotateY(${(s.px * 8 * calm).toFixed(2)}deg) ` +
        `rotateZ(${(-e * 28).toFixed(2)}deg) ` +
        `scale(${(1 - e * (small ? 0.38 : 0.44)).toFixed(3)})`;
      const gap = 16 + e * (small ? 92 : 84); // distância em px entre degraus de profundidade
      const cancel = 1 - e * 0.65;
      const stageW = stageRef.current?.clientWidth ?? 1200;
      elRefs.current.forEach((el, i) => {
        if (!el) return;
        const spec = elements[i];
        const d = (spec.z - midZ) / midZ; // -1 fundo, +1 frente
        const z = (spec.z - midZ) * gap;
        const comp = Math.max(1 - (z / PERSP) * cancel, 1 - e);
        const ox = -s.px * d * 40 * calm;
        const oy = -s.py * d * 24 * calm;
        // ao desmontar, cada elemento também se afasta do centro, para não ficarem empilhados
        const spread = spec.full ? 0 : ((spec.cx - 1000) / 1600) * e * stageW * 0.16;
        const lift = spec.full ? 0 : -(spec.z - midZ) * e * 3;
        el.style.transform = `translate3d(${(ox + spread).toFixed(1)}px, ${(oy + lift).toFixed(1)}px, ${z.toFixed(1)}px) scale(${comp.toFixed(4)})`;
      });
      rig.classList.toggle('exploded', e > 0.2);
      cb.current?.(e);
      s.raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        s.run = entry.isIntersecting;
        if (s.run) { cancelAnimationFrame(s.raf); s.raf = requestAnimationFrame(frame); }
      },
      { threshold: 0 }
    );
    io.observe(track);
    readScroll();
    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', readScroll);
    window.addEventListener('pointermove', onMove, { passive: true });
    const DOE: any = (window as any).DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission !== 'function') window.addEventListener('deviceorientation', onTilt);
    s.raf = requestAnimationFrame(frame);

    return () => {
      s.run = false;
      cancelAnimationFrame(s.raf);
      io.disconnect();
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', readScroll);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, [reduced, trackRef, elements, midZ]);

  return (
    <div
      ref={stageRef}
      className={`scene-stage ${className}`}
      aria-hidden="true"
      style={{ perspective: `${PERSP}px`, perspectiveOrigin: '50% 42%' }}
    >
      <div ref={rigRef} className="scene-rig scene-rig-el absolute inset-0" style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
        {elements.map((el, i) => (
          <div
            key={el.id}
            ref={(n) => { elRefs.current[i] = n; }}
            className="scene-el absolute inset-0"
            style={{ willChange: 'transform' }}
          >
            {el.full ? (
              <img
                src={el.src}
                alt=""
                draggable={false}
                decoding="async"
                style={el.focus ? { objectPosition: el.focus } : undefined}
                className={`scene-img absolute inset-0 h-full w-full object-cover ${el.id === 'ceu' ? 'scene-sky' : ''} ${el.motion === 'drift' ? 'el-drift' : ''}`}
              />
            ) : (
              <div
                className="absolute"
                style={{
                  left: `calc(var(--ox) + var(--k) * ${el.cx}px)`,
                  top: `calc(var(--oy) + var(--k) * ${el.by}px)`,
                  width: `calc(var(--k) * ${el.w}px)`,
                  transform: `translate(-50%, -100%)${el.rot ? ` rotate(${el.rot}deg)` : ''}`
                }}
              >
                <img
                  src={el.src}
                  alt=""
                  draggable={false}
                  decoding="async"
                  width={el.iw}
                  height={el.ih}
                  className={`scene-img block h-auto w-full select-none ${el.photo ? 'scene-photo' : ''} ${el.motion && el.motion !== 'none' ? `el-${el.motion}` : ''}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
