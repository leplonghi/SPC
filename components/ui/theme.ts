/**
 * Cores por área do site. Cada área usa uma cor da paleta do Manual de Identidade Visual.
 * As classes ficam escritas por extenso para o Tailwind encontrá-las.
 * Texto branco sobre estes fundos tem contraste AA (ver verificação no build de 2026-10).
 */
export type Tone = 'blue' | 'terracotta' | 'sage' | 'red' | 'navy';

export const TONES: Record<Tone, {
  solid: string;       // fundo cheio com texto branco
  soft: string;        // fundo suave
  text: string;        // texto sobre fundo claro (AA)
  border: string;      // borda de destaque
  dot: string;         // marcador sólido
  ring: string;
}> = {
  blue:       { solid: 'bg-brand-blue-dark text-white', soft: 'bg-brand-blue/10', text: 'text-brand-blue-dark', border: 'border-brand-blue', dot: 'bg-brand-blue', ring: 'focus-visible:ring-brand-blue' },
  terracotta: { solid: 'bg-brand-terracotta text-white', soft: 'bg-brand-terracotta/10', text: 'text-brand-terracotta', border: 'border-brand-terracotta', dot: 'bg-brand-terracotta', ring: 'focus-visible:ring-brand-terracotta' },
  sage:       { solid: 'bg-brand-sage text-white', soft: 'bg-brand-sage/10', text: 'text-brand-sage-dark', border: 'border-brand-sage', dot: 'bg-brand-sage', ring: 'focus-visible:ring-brand-sage' },
  red:        { solid: 'bg-brand-red-dark text-white', soft: 'bg-brand-red/10', text: 'text-brand-red-dark', border: 'border-brand-red', dot: 'bg-brand-red', ring: 'focus-visible:ring-brand-red' },
  navy:       { solid: 'bg-brand-navy text-white', soft: 'bg-brand-navy/5', text: 'text-brand-navy', border: 'border-brand-navy', dot: 'bg-brand-navy', ring: 'focus-visible:ring-brand-navy' },
};
