import React, { useEffect, useRef } from 'react';
import {
  SkyLayer, BirdsLayer, FarLayer, TownLayer, NearLayer, PalmsLayer, TilesLayer, FigureLayer, ForeLayer
} from './layers';

export interface SceneLayer {
  id: string;
  /** Nome mostrado quando a cena está desmontada. */
  label: string;
  Comp: React.FC;
}

export const SCENE_LAYERS: SceneLayer[] = [
  { id: 'ceu', label: 'Céu, sol e guarás-vermelhos', Comp: SkyLayer },
  { id: 'aves', label: 'Guarás em voo', Comp: BirdsLayer },
  { id: 'mar', label: 'Mar, saveiro e farol', Comp: FarLayer },
  { id: 'cidade', label: 'Casario e igreja do Centro Histórico', Comp: TownLayer },
  { id: 'dunas', label: 'Dunas e lagoas dos Lençóis', Comp: NearLayer },
  { id: 'palmas', label: 'Palmeiras de babaçu', Comp: PalmsLayer },
  { id: 'azulejos', label: 'Azulejos e bandeirinhas', Comp: TilesLayer },
  { id: 'gente', label: 'Bumba meu boi e tambor de crioula', Comp: FigureLayer },
  { id: 'frente', label: 'Folhagem, hibisco e confete', Comp: ForeLayer }
];

const PERSP = 1300;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

interface Props {
  /** Bloco alto que contém o palco fixo: serve para medir a rolagem. */
  trackRef: React.RefObject<HTMLElement>;
  /** Recebe o progresso suavizado (0 = cena montada, 1 = totalmente desmontada). */
  onProgress?: (e: number) => void;
  /** Recorte da ilustração (celular mostra só o miolo). */
  viewBox: string;
  reduced: boolean;
  className?: string;
}

/**
 * Cena em camadas com profundidade real (CSS 3D).
 * - Mouse (desktop) ou inclinação do aparelho (celular): as camadas se deslocam em velocidades diferentes.
 * - Rolagem: a pilha gira e se afasta, mostrando cada camada em separado ("desmonta").
 * Sem movimento quando o visitante pede "reduzir movimento".
 */
export const MaranhaoScene: React.FC<Props> = ({ trackRef, onProgress, viewBox, reduced, className = '' }) => {
  const rigRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    if (reduced) return;
    const rig = rigRef.current;
    const track = trackRef.current;
    if (!rig || !track) return;

    const s = { p: 0, tp: 0, px: 0, py: 0, tx: 0, ty: 0, run: true, raf: 0 };
    const n = SCENE_LAYERS.length;
    const mid = (n - 1) / 2;

    const readScroll = () => {
      const r = track.getBoundingClientRect();
      // o palco fica preso a 62 px do topo; o progresso conta só enquanto ele está preso
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
      const e = s.p * s.p * (3 - 2 * s.p); // suaviza o começo e o fim
      const small = window.innerWidth < 768;
      const calm = 1 - e * 0.85;
      rig.style.transform =
        `translate3d(${(e * (small ? 0 : 4)).toFixed(2)}%, ${(-e * (small ? 4 : 7)).toFixed(2)}%, 0) ` +
        `rotateX(${(e * 62 - s.py * 6 * calm).toFixed(2)}deg) ` +
        `rotateY(${(s.px * 8 * calm).toFixed(2)}deg) ` +
        `rotateZ(${(-e * 30).toFixed(2)}deg) ` +
        `scale(${(1 - e * (small ? 0.4 : 0.46)).toFixed(3)})`;
      rig.style.setProperty('--cr', `${(e * 30).toFixed(1)}px`);
      rig.style.setProperty('--fo', e.toFixed(3));
      rig.style.setProperty('--ci', e.toFixed(3));
      const gap = 22 + e * (small ? 120 : 112);
      const cancel = 1 - e * 0.65;
      layerRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = (i - mid) / mid; // -1 (céu) a +1 (primeiro plano)
        const z = (i - mid) * gap;
        const comp = Math.max(1 - (z / PERSP) * cancel, 1 - e); // montada: nunca menor que o palco, sem bordas à mostra
        const ox = -s.px * d * 38 * calm;
        const oy = -s.py * d * 22 * calm;
        el.style.transform = `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, ${z.toFixed(1)}px) scale(${comp.toFixed(4)})`;
      });
      rig.classList.toggle('exploded', e > 0.22);
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
    // Android e navegadores sem pedido de permissão; no iPhone a rolagem já faz o efeito
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
  }, [reduced, trackRef]);

  return (
    <div className={`scene-stage ${className}`} aria-hidden="true" style={{ perspective: `${PERSP}px`, perspectiveOrigin: '50% 42%' }}>
      <div ref={rigRef} className="scene-rig absolute inset-0" style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
        {SCENE_LAYERS.map(({ id, Comp }, i) => (
          <div
            key={id}
            ref={(el) => { layerRefs.current[i] = el; }}
            className="scene-layer absolute inset-0"
            style={{ willChange: 'transform' }}
          >
            <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full overflow-visible" focusable="false">
              <Comp />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};
