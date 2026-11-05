import React, { useEffect, useRef, useState } from 'react';

/** Faz o bloco aparecer suavemente ao entrar na tela. Sem JavaScript ou com "reduzir movimento", o conteúdo já aparece. */
export const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
}> = ({ children, className = '', delay = 0, as = 'div' }) => {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as any;
  return (
    <Tag ref={ref} className={`reveal ${seen ? 'is-in' : ''} ${className}`} style={{ ['--reveal-delay' as any]: `${delay}ms` }}>
      {children}
    </Tag>
  );
};

/** Faixa de azulejo multicolor, só decorativa. */
export const AzulejoBand: React.FC<{ large?: boolean; className?: string }> = ({ large, className = '' }) => (
  <div aria-hidden="true" className={`azulejo-band deco ${large ? 'azulejo-band-lg' : ''} ${className}`} />
);
