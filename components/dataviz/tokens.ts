/**
 * Cores e tipografia dos gráficos.
 * A paleta categórica foi validada (separação para daltonismo, contraste e saturação) com o validador
 * da skill de dataviz: #2A78A8, #C2512F, #2E9170, #B07F0C, nesta ordem fixa.
 * Os verdes/azuis da identidade visual ficam para a marca; nos gráficos o azul é o destaque e o cinza é o contexto.
 */
export const INK = { primary: '#1F1F1F', secondary: '#475569', muted: '#5B6675' };
export const GRID = '#E7E2DE';
export const HUE = '#2A78A8';
export const HUE_DEEP = '#1F5F86';
export const DIM = '#C3D3DE';
export const SURFACE = '#FFFFFF';

export const ESFERA_COR: Record<string, string> = {
  Estadual: '#2A78A8',
  Federal: '#C2512F',
  Municipal: '#2E9170',
  SPC: '#B07F0C'
};

/** Escolhe um passo "bonito" para o eixo vertical (0, 5, 10...). */
export const niceTicks = (max: number): number[] => {
  const steps = [1, 2, 5, 10, 20, 50, 100];
  const step = steps.find((s) => max / s <= 4) ?? 100;
  const top = Math.max(step, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return ticks;
};

export const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);
