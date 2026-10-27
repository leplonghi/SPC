import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowRight, ChevronDown, ChevronRight, ShieldCheck } from 'lucide-react';
import { ElementScene, LoadedElement } from './ElementScene';
import { ELEMENT_LAYOUT, PHOTO_ELEMENTS } from './sceneLayout';


const useMedia = (q: string) => {
  const [m, setM] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(q).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(q);
    const h = () => setM(mq.matches);
    h();
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [q]);
  return m;
};


/**
 * Lê public/cena/manifest.json (gerado por scripts/ingest_cena.py a partir da arte entregue).
 * Com o manifesto, a cena usa a arte por elemento (art = true). Sem ele, usa as fotos reais do acervo em camadas.
 * undefined = ainda carregando.
 */
const useSceneElements = (): { els: LoadedElement[]; art: boolean } | undefined => {
  const [res, setRes] = useState<{ els: LoadedElement[]; art: boolean } | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    const photos = (): { els: LoadedElement[]; art: boolean } => ({
      art: false,
      els: PHOTO_ELEMENTS.map((p) => ({ ...p, src: `/cena-fotos/${p.file}` }))
    });
    fetch('/cena/manifest.json', { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (!alive) return;
        const list: { id: string; file: string; w: number; h: number }[] = m?.elements ?? [];
        const loaded = ELEMENT_LAYOUT.flatMap((spec) => {
          const f = list.find((x) => x.id === spec.id);
          return f ? [{ ...spec, src: `/cena/${f.file}`, iw: f.w, ih: f.h }] : [];
        });
        setRes(loaded.length > 0 ? { els: loaded, art: true } : photos());
      })
      .catch(() => alive && setRes(photos()));
    return () => { alive = false; };
  }, []);
  return res;
};

interface Stat { label: string; value: string | number }

/**
 * Hero imersivo: cena maranhense em camadas. Ao rolar, o texto some e a cena se desmonta mostrando cada camada.
 * O palco é "sticky" dentro de um bloco alto: não sequestra a rolagem, só a acompanha.
 */
export const ImmersiveHero: React.FC<{ stats: Stat[] }> = ({ stats }) => {
  const trackRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const wide = useMedia('(min-width: 1024px)');
  const scene = useSceneElements();
  const elements = scene?.els;
  const dark = scene ? !scene.art : true; // fotos: hero escuro com texto branco; arte ilustrada: hero claro
  const legend = (elements ?? []).filter((e) => !e.full || e.id !== 'confete').map((e, i) => ({ id: String(i), label: e.label }));
  const spotRef = useRef<HTMLDivElement>(null);

  const onProgress = useCallback((e: number) => {
    const t = textRef.current, sc = scrimRef.current, lg = legendRef.current, cue = cueRef.current;
    const textO = 1 - Math.min(1, e * 3.6);
    if (t) {
      t.style.opacity = String(textO);
      t.style.transform = `translate3d(0, ${(-e * 70).toFixed(1)}px, 0)`;
      t.style.visibility = textO < 0.02 ? 'hidden' : 'visible';
    }
    if (sc) sc.style.opacity = String(textO);
    if (lg) {
      const o = Math.max(0, Math.min(1, (e - 0.5) * 3));
      lg.style.opacity = String(o);
      lg.style.visibility = o < 0.02 ? 'hidden' : 'visible';
    }
    if (cue) cue.style.opacity = String(Math.max(0, 1 - e * 5));
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = spotRef.current;
    const sec = trackRef.current;
    if (!el || !sec) return;
    const onMove = (e: PointerEvent) => {
      const r = sec.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - Math.max(r.top, 62)}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, scene]);

  useEffect(() => {
    if (reduced || !textRef.current) return;
    const ctx = gsap.context(() => {
      // só desliza: o texto nunca fica invisível, mesmo se a animação atrasar
      gsap.from('.hero-in', { y: 24, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.05 });
    }, textRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={trackRef}
      aria-label="Apresentação do portal"
      className={`hero-track relative ${reduced ? '' : 'h-[210vh]'}`}
    >
      <div className={`${reduced ? 'relative min-h-[100vh] pb-24' : 'sticky top-[62px] h-[calc(100svh-62px)] min-h-[560px]'} overflow-hidden ${dark ? 'bg-brand-navy' : 'bg-brand-cream'}`}>

        {elements && (
          <ElementScene
            elements={elements}
            trackRef={trackRef}
            onProgress={onProgress}
            phone={!wide}
            reduced={reduced}
            className={wide ? '' : '!top-auto !h-[56%] bottom-0'}
          />
        )}

        {/* lanterna: um brilho suave acompanha o mouse */}
        {!reduced && <div ref={spotRef} aria-hidden="true" className="deco pointer-events-none absolute inset-0 z-10" style={{ background: 'radial-gradient(420px circle at var(--mx, 72%) var(--my, 38%), rgba(255,255,255,0.14), transparent 62%)' }} />}

        {/* véu atrás do texto, só para garantir a leitura */}
        <div
          ref={scrimRef}
          aria-hidden="true"
          className={`deco pointer-events-none absolute inset-0 ${dark
            ? 'bg-gradient-to-r from-brand-navy via-brand-navy/75 to-brand-navy/10 max-lg:bg-gradient-to-b max-lg:from-brand-navy max-lg:via-brand-navy/90 max-lg:to-transparent'
            : 'bg-gradient-to-r from-brand-cream via-brand-cream/80 to-transparent lg:via-brand-cream/55 lg:to-transparent max-lg:bg-gradient-to-b max-lg:from-brand-cream max-lg:via-brand-cream/90 max-lg:to-transparent'}`}
          style={{ width: wide ? '62%' : '100%', height: wide ? '100%' : '62%' }}
        />

        <div ref={textRef} className="relative z-20 mx-auto flex h-full w-full max-w-[1200px] flex-col justify-start px-6 pb-16 pt-8 sm:pt-14 lg:justify-center lg:pb-24 lg:pt-28" style={{ willChange: 'transform, opacity' }}>
          <div className="max-w-xl space-y-5 lg:space-y-7">
            <div className={`hero-in hidden sm:inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur ${dark ? 'border-white/30 bg-white/10 text-white' : 'border-brand-navy/25 bg-white/70 text-brand-navy'}`}>
              <ShieldCheck size={12} aria-hidden="true" />
              Patrimônio Cultural do Maranhão
            </div>

            <h1 className={`hero-in text-[2.1rem] font-black uppercase leading-[1.04] tracking-tight sm:text-5xl lg:text-7xl ${dark ? 'text-white' : 'text-brand-navy'}`}>
              <span className="block">Preservar o</span>
              <span className={`block font-serif font-normal lowercase italic ${dark ? 'text-[#F3A99C]' : 'text-brand-terracotta'}`}>passado,</span>
              <span className="block">inspirar o futuro</span>
            </h1>

            <p className={`hero-in hidden max-w-lg text-base leading-relaxed sm:block lg:text-lg ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
              A SPC protege, valoriza e difunde o patrimônio cultural do Maranhão. Aqui você consulta a legislação, entende como pedir autorização e fala com a equipe.
            </p>

            <div className="hero-in flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/bens-tombados"
                className="group flex items-center justify-center gap-2.5 rounded-full bg-brand-terracotta px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-terracotta/30 transition-all hover:bg-brand-navy active:scale-95 lg:px-8 lg:py-4"
              >
                <span>Este bem é tombado?</span>
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                to="/servicos"
                className={`group flex items-center justify-center gap-2 rounded-full border-2 px-5 py-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 lg:px-7 lg:py-3.5 ${dark ? 'border-white text-white hover:bg-white hover:text-brand-navy' : 'border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white'}`}
              >
                <span>Conhecer serviços</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>

            <dl className={`hero-in hidden w-full max-w-xl gap-x-9 gap-y-3 border-t pt-5 lg:flex lg:flex-wrap ${dark ? 'border-white/25' : 'border-brand-navy/20'}`}>
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className={`text-[11px] font-bold uppercase tracking-wider ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{s.label}</dt>
                  <dd className={`mt-1 font-serif text-3xl font-extrabold ${dark ? 'text-white' : 'text-brand-navy'}`}>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* legenda das camadas, aparece quando a cena está desmontada */}
        {!reduced && (
          <div ref={legendRef} className="pointer-events-none absolute inset-x-0 bottom-0 z-20 opacity-0" style={{ visibility: 'hidden' }}>
            <div className="mx-auto max-w-[1200px] px-6 pb-28 lg:pb-32">
              <div className="max-w-md rounded-3xl bg-brand-navy/90 p-4 text-white shadow-2xl backdrop-blur sm:p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-200 sm:mb-3">Camadas desta cena</p>
                <p className="mt-1 text-xs leading-snug text-slate-200 sm:hidden">Cada elemento da ilustração fica em uma camada própria.</p>
                <ol className="hidden grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid sm:grid-cols-2">
                  {legend.map((l, i) => (
                    <li key={l.id} className="flex items-start gap-2 leading-snug">
                      <span className="mt-0.5 w-5 shrink-0 text-xs font-black text-brand-terracotta" style={{ color: '#F08A7B' }}>{i + 1}</span>
                      {l.label}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {!reduced && (
          <div ref={cueRef} className={`pointer-events-none absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-[11px] font-black uppercase tracking-[0.2em] lg:flex ${dark ? 'text-white' : 'text-brand-navy'}`}>
            Role para desmontar a cena
            <ChevronDown size={16} className="animate-bounce" aria-hidden="true" />
          </div>
        )}
      </div>
    </section>
  );
};
