import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { BENS_TOMBADOS, anoDoDecreto } from '../../data/bensTombados';
import { MunicipiosMap, SEDE_MUNICIPIO } from '../dataviz/MunicipiosMap';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** Altura do cabeçalho fixo do site quando a página está rolada (px). */
const HEADER_H = 57;
const ANOS = Array.from({ length: 1993 - 1979 + 1 }, (_, k) => 1979 + k);
const MUNICIPIOS = Array.from(new Set(BENS_TOMBADOS.map((b) => b.municipio)));

const useWide = () => {
  const [w, setW] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const h = () => setW(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return w;
};

/**
 * Linha do tempo dos tombamentos estaduais, ano a ano (1979 a 1993), ligada ao mapa.
 * No computador a seção fica fixa e a rolagem avança os anos; no celular, os anos são botões.
 * Tudo vem de data/bensTombados.ts (ano do decreto). Anos sem tombamento não entram como parada.
 */
export const TimelineStory: React.FC = () => {
  const porAno = useMemo(() => {
    const m = new Map<number, typeof BENS_TOMBADOS>();
    BENS_TOMBADOS.forEach((b) => {
      const a = anoDoDecreto(b);
      if (a === null) return;
      m.set(a, [...(m.get(a) ?? []), b]);
    });
    return m;
  }, []);
  const paradas = useMemo(() => ANOS.filter((a) => porAno.has(a)), [porAno]);
  const comAno = useMemo(() => paradas.reduce((s, a) => s + (porAno.get(a)?.length ?? 0), 0), [paradas, porAno]);
  const wide = useWide();
  const [curto, setCurto] = useState(() => typeof window !== 'undefined' && window.innerHeight < 900);
  useEffect(() => {
    const h = () => setCurto(window.innerHeight < 900);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  const trackRef = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!wide) return;
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const r = track.getBoundingClientRect();
      const total = Math.max(1, r.height - (window.innerHeight - HEADER_H));
      const p = clamp((HEADER_H - r.top) / total);
      const i = Math.min(paradas.length - 1, Math.floor(p * paradas.length));
      setIdx((cur) => (cur === i ? cur : i));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [wide, paradas.length]);

  const irPara = (i: number) => {
    if (!wide) { setIdx(i); return; }
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const total = track.offsetHeight - (window.innerHeight - HEADER_H);
    window.scrollTo({ top: top - HEADER_H + ((i + 0.5) / paradas.length) * total, behavior: 'smooth' });
  };

  const ano = paradas[idx];
  const bens = porAno.get(ano) ?? [];
  const acumulado = paradas.slice(0, idx + 1).reduce((s, a) => s + (porAno.get(a)?.length ?? 0), 0);
  const pontos = MUNICIPIOS.filter((m) => SEDE_MUNICIPIO[m]).map((m) => ({
    nome: m, lat: SEDE_MUNICIPIO[m][0], lng: SEDE_MUNICIPIO[m][1], n: bens.filter((b) => b.municipio === m).length
  }));
  const mostrar = bens.slice(0, wide ? (curto ? 3 : 5) : 4);
  const acumMun = (() => {
    const m = new Map<string, number>();
    paradas.slice(0, idx + 1).forEach((a) => (porAno.get(a) ?? []).forEach((b) => m.set(b.municipio, (m.get(b.municipio) ?? 0) + 1)));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'));
  })();
  const maxMun = Math.max(1, ...acumMun.map(([, n]) => n));

  const painel = (
    <div className="grid h-full min-h-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      <div className="flex min-h-0 flex-col">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-200">Tombamentos estaduais por ano do decreto</p>
        <div className="mt-1 flex items-end gap-4">
          <p key={ano} className={`tl-year font-display font-black leading-none tabular-nums ${curto ? "text-[5.5rem] sm:text-[6.5rem] lg:text-[7rem]" : "text-[5.5rem] sm:text-[8rem] lg:text-[9rem]"}`} aria-live="polite">{ano}</p>
          <p className="pb-3 text-sm leading-snug text-slate-200 sm:pb-5">
            <strong className="block font-display text-3xl text-white">{bens.length}</strong>
            {bens.length === 1 ? 'bem tombado' : 'bens tombados'}
          </p>
        </div>

        <div style={wide ? { height: curto ? 268 : 392 } : undefined}>
        <ul className="mt-3 grid min-h-0 content-start gap-2 sm:grid-cols-2 lg:grid-cols-1" aria-label={`Bens tombados em ${ano}`}>
          {mostrar.map((b, i) => (
            <li key={`${ano}-${b.id}`} className="tl-card rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur" style={{ ['--i' as any]: i }}>
              <p className="line-clamp-2 text-[13px] font-bold leading-snug text-white">{b.nome}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-200">
                <MapPin size={12} aria-hidden="true" /> {b.municipio} · decreto nº {b.decreto.numero}
              </p>
            </li>
          ))}
        </ul>
        <Link to={`/bens-tombados?ano=${ano}`} className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-brand-navy hover:bg-brand-terracotta hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40">
          {bens.length > mostrar.length ? `Ver os ${bens.length} bens de ${ano}` : `Ver os bens de ${ano}`} <ArrowRight size={14} aria-hidden="true" />
        </Link>
        </div>
        {wide && !curto && (
          <div className="mt-4 max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-200">Acumulado até {ano}, por município</p>
            <ul className="mt-2 space-y-1.5">
              {acumMun.slice(0, 4).map(([m, n]) => (
                <li key={m} className="grid grid-cols-[8.5rem_1fr_1.75rem] items-center gap-3 text-xs text-white">
                  <span className="truncate">{m}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
                    <span className="chart-mark-absolute block h-full rounded-full transition-[width] duration-500" style={{ width: `${(n / maxMun) * 100}%`, backgroundColor: "#E9B44C" }} />
                  </span>
                  <span className="text-right font-bold tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-col">
        <div className="relative min-h-[260px] flex-1 overflow-hidden rounded-3xl border border-white/20 shadow-2xl [&>div]:!absolute [&>div]:inset-0 [&>div]:!min-h-0 [&>div]:!rounded-none [&>div]:!border-0">
          <MunicipiosMap height="fill" points={pontos} selected={null} onSelect={() => {}} accent="#C2512F" readOnly />
        </div>
        <p className="mt-2 text-xs text-slate-200">
          Círculos marcam a sede do município (não o local exato). Cinza: sem tombamento neste ano.
        </p>
        <p className="mt-1 text-xs text-slate-200">
          <strong className="font-bold text-white">Fonte:</strong> Relação de Bens Tombados (SPC/DPHAP), conferida com os decretos de tombamento e o Livro do Tombo. Mapa base: OpenStreetMap.
        </p>
      </div>
    </div>
  );

  // trilho com todos os anos; os anos sem tombamento aparecem apagados
  const trilho = (
    <div className="mt-5 lg:mt-4">
      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
        <span>{acumulado} de {comAno} bens até aqui</span>
        <span className="hidden sm:inline">1979 a 1993</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(acumulado / comAno) * 100}%`, background: 'linear-gradient(90deg,#3F7893,#E63343,#B94734)' }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 pb-1" role="group" aria-label="Escolher o ano">
        {ANOS.map((a) => {
          const i = paradas.indexOf(a);
          const tem = i >= 0;
          const ativo = tem && i === idx;
          return (
            <button
              key={a}
              type="button"
              disabled={!tem}
              aria-pressed={ativo}
              aria-label={tem ? `${a}: ${porAno.get(a)?.length} bens` : `${a}: nenhum tombamento`}
              onClick={() => tem && irPara(i)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-bold tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${ativo ? 'bg-white text-brand-navy' : tem ? 'bg-white/15 text-white hover:bg-white/25' : 'cursor-default text-white/40'}`}
            >
              <span className="hidden sm:inline">{a}</span><span className="sm:hidden">’{String(a).slice(2)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <section
      ref={trackRef}
      aria-label="Linha do tempo dos tombamentos estaduais"
      className="relative bg-brand-navy text-white"
      style={wide ? { height: `${(paradas.length + 1) * 52}vh` } : undefined}
    >
      <div aria-hidden="true" className="absolute inset-0" style={{ background: 'radial-gradient(900px 500px at 85% 20%, rgba(63,120,147,.35), transparent 70%), radial-gradient(700px 500px at 5% 90%, rgba(185,71,52,.28), transparent 70%)' }} />
      <div className={wide ? 'sticky flex flex-col overflow-hidden' : 'relative'} style={wide ? { top: HEADER_H, height: `calc(100svh - ${HEADER_H}px)`, minHeight: 520 } : undefined}>
        <div className={`relative mx-auto w-full max-w-[1200px] px-6 ${wide ? 'flex min-h-0 flex-1 flex-col py-4' : 'py-10'}`}>
          {!wide && <div className="mb-6 -mt-2">{trilho}</div>}
          <div className={wide ? 'min-h-0 flex-1' : undefined}>{painel}</div>
          {wide && <div className="shrink-0">{trilho}</div>}
        </div>
      </div>
    </section>
  );
};
