import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  FileText,
  Landmark,
  Users,
  Search,
  RotateCcw,
  Sparkles,
  Compass,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { BENS_TOMBADOS, DECRETOS_PDF, anoDoDecreto } from '../../data/bensTombados';
import { PUBLIC_LEGAL_DOCUMENTS } from '../../data/publicLegalDocuments';
import { SITE_CONTACT } from '../../data/siteContact';

/**
 * ORIGAMI 3D CIRCULAR & CARROSSEL IMERSIVO MOBILE
 * 
 * Geometria Tridimensional:
 * 1. MODO RECOLHIDO (Fechado):
 *    As 5 seções formam um CILINDRO POLIGONAL CIRCULAR 3D regular (pentágono regular em coordenadas polares 3D).
 *    Com tampa em ouro/latão contendo a Rosa dos Ventos colonial e rotação orbital livre 360° em todos os eixos.
 *
 * 2. MODO DESDOBRADO NO DESKTOP:
 *    Desabrocha em fita horizontal plana de 5 colunas, desdobrando suas dobras verticais.
 *
 * 3. MODO DESDOBRADO NO MOBILE (Imersivo e Adaptado ao Espaço):
 *    Desabrocha no palco 3D em leque/carrossel espacial em profundidade Z.
 *    A seção ativa fica centralizada e desdobra fisicamente suas 2 dobras verticais em 3D (capa + texto + links).
 *    As seções anterior e seguinte posicionam-se em perspectiva 3D nas asas laterais, permitindo toque,
 *    gesto de swipe ou clique nos botões/indicadores, com ZERO rolagem horizontal no documento.
 */

const N = 5;
const TAN_36 = Math.tan((36 * Math.PI) / 180); // ~0.72654
const COS_36 = Math.cos((36 * Math.PI) / 180); // ~0.80902
const SER = "'Lora', Georgia, 'Iowan Old Style', 'Palatino Linotype', Palatino, ui-serif, serif";

type LinkItem = { label: string; to: string; hint?: string };
type Sheet = {
  id: string;
  num: string;
  kicker: string;
  title: string;
  to: string;
  tone: 'blue' | 'terra' | 'sage' | 'red' | 'navy';
  photo: string;
  focus: string;
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  headline: string;
  text: string;
  stamp?: string;
  linksTitle: string;
  links: LinkItem[];
};

const TONES: Record<Sheet['tone'], { paper: string; deep: string; rgb: string }> = {
  blue: { paper: '#2F5F78', deep: '#1D4358', rgb: '47,95,120' },
  terra: { paper: '#B94734', deep: '#8A3123', rgb: '185,71,52' },
  sage: { paper: '#256B58', deep: '#17483B', rgb: '37,107,88' },
  red: { paper: '#C01B29', deep: '#8A1019', rgb: '192,27,41' },
  navy: { paper: '#071D33', deep: '#040F1C', rgb: '7,29,51' }
};

interface PentagonCapProps {
  circumRadius: number;
  radius: number;
  sheets: Sheet[];
  facing?: 'up' | 'down';
  hasCompass?: boolean;
}

/**
 * Tampa Pentagonal 3D que fecha perfeitamente o cilindro de origami por todos os lados,
 * dividida em 5 setores triangulares radiais com as cores oficiais de cada folha
 * e selo colonial da Rosa dos Ventos em ouro.
 */
const PentagonCap: React.FC<PentagonCapProps> = ({
  circumRadius,
  radius,
  sheets,
  facing = 'up',
  hasCompass = true
}) => {
  const size = Math.ceil(circumRadius * 2) + 6;
  const cx = size / 2;
  const cy = size / 2;
  const N_SIDES = 5;

  // Vértices do pentágono regular calculados para casar 100% com as facetas 3D
  const vertices = useMemo(() => {
    return Array.from({ length: N_SIDES }, (_, k) => {
      const angleDeg = k * (360 / N_SIDES) - 36;
      const rad = (angleDeg * Math.PI) / 180;
      const signY = facing === 'up' ? 1 : -1;
      return {
        x: cx + circumRadius * Math.sin(rad),
        y: cy + signY * circumRadius * Math.cos(rad)
      };
    });
  }, [circumRadius, cx, cy, facing]);

  const perimeterPoints = vertices.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full overflow-visible drop-shadow-2xl"
    >
      <defs>
        <radialGradient id={`cap-glow-${facing}-${hasCompass ? 'cmp' : 'seal'}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E9B44C" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#071D33" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base pentagonal 100% opaca que veda o interior do prisma */}
      <polygon
        points={perimeterPoints}
        fill="#040F1C"
        stroke="none"
      />

      {/* 5 Setores Triangulares Coloridos — Mantém as cores oficiais de cada folha */}
      {sheets.map((s, i) => {
        const v1 = vertices[i];
        const v2 = vertices[(i + 1) % N_SIDES];
        const t = TONES[s.tone];
        return (
          <polygon
            key={s.id}
            points={`${cx.toFixed(1)},${cy.toFixed(1)} ${v1.x.toFixed(1)},${v1.y.toFixed(1)} ${v2.x.toFixed(1)},${v2.y.toFixed(1)}`}
            fill={t.paper}
            stroke="#E9B44C"
            strokeWidth="0.8"
            strokeOpacity="0.85"
          />
        );
      })}

      {/* Borda perimetral dourada do pentágono */}
      <polygon
        points={perimeterPoints}
        fill="none"
        stroke="#E9B44C"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <polygon
        points={perimeterPoints}
        fill="none"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Medalhão Central da Rosa dos Ventos Colonial */}
      <g transform={`translate(${cx}, ${cy})`}>
        <circle r={radius * 0.44} fill={`url(#cap-glow-${facing}-${hasCompass ? 'cmp' : 'seal'})`} />
        <circle r={radius * 0.36} fill="#071D33" stroke="#E9B44C" strokeWidth="2" />
        <circle r={radius * 0.30} fill="none" stroke="#E9B44C" strokeWidth="0.75" strokeDasharray="2,2" />

        {hasCompass ? (
          <>
            <path
              d={`M 0,${-radius * 0.24} L ${radius * 0.06},${-radius * 0.06} L ${radius * 0.24},0 L ${radius * 0.06},${radius * 0.06} L 0,${radius * 0.24} L ${-radius * 0.06},${radius * 0.06} L ${-radius * 0.24},0 L ${-radius * 0.06},${-radius * 0.06} Z`}
              fill="#E9B44C"
              stroke="#FFF"
              strokeWidth="0.5"
            />
            <circle r={radius * 0.06} fill="#B94734" stroke="#FFF" strokeWidth="0.75" />
            <circle r={radius * 0.02} fill="#FFF" />
          </>
        ) : (
          <>
            <circle r={radius * 0.18} fill="#040F1C" stroke="#E9B44C" strokeWidth="1" />
            <circle r={radius * 0.05} fill="#E9B44C" />
          </>
        )}
      </g>
    </svg>
  );
};

const useFlat = () => {
  const [flat, setFlat] = useState(() => typeof document !== 'undefined' && document.body.classList.contains('high-contrast'));
  useEffect(() => {
    const sync = () => setFlat(document.body.classList.contains('high-contrast'));
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    sync();
    return () => mo.disconnect();
  }, []);
  return flat;
};

export const OrigamiMenu: React.FC = () => {
  const flat = useFlat();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  
  const [w, setW] = useState(1100);
  const [searchQuery, setSearchQuery] = useState('');
  
  // O origami começa RECOLHIDO NO FORMATO CIRCULAR 3D
  const [anyOpen, setAnyOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState(0);

  // Estados de Rotação 3D exclusivamente no sentido horizontal (eixo Y)
  const INITIAL_PITCH = 0;
  const INITIAL_YAW = 0;
  const rotX = useRef(0);
  const rotY = useRef(INITIAL_YAW);
  const rotZ = useRef(0);
  const targetRotX = useRef(0);
  const targetRotY = useRef(INITIAL_YAW);
  const targetRotZ = useRef(0);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0, time: 0 });
  const lastPointer = useRef({ x: 0, y: 0, time: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const isTransitioning = useRef(false);
  const [isRotating, setIsRotating] = useState(false);

  // Detecção de toque para gesto de swipe no mobile
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Dimensões responsivas do origami
  const isWide = !flat && w >= 960;
  const isTablet = !flat && w >= 640 && w < 960;
  
  const pw = isWide ? 236 : isTablet ? 190 : 170;
  const sh = isWide ? 204 : isTablet ? 186 : 176;
  
  // No mobile desdobrado, a folha ativa ocupa largura confortável para leitura sem transbordar
  const mobilePw = Math.min(300, Math.max(260, w - 48));
  const mobileSh = 175;

  // Raio do cilindro circular (apótema do pentágono regular)
  const radius = Math.round(pw / (2 * TAN_36)); // ~162px (desktop), ~117px (mobile)
  // Circunraio do pentágono regular (distância do centro aos 5 vértices)
  const circumRadius = radius / COS_36;

  // Medição da largura da tela
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const medir = () => {
      setW(el.clientWidth);
    };
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    window.addEventListener('resize', medir);
    medir();
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', medir);
    };
  }, [flat]);

  // Dados das folhas do origami alinhados com o conteúdo real das páginas do portal
  const sheets: Sheet[] = useMemo(() => {
    const porMun = new Map<string, number>();
    const anos: number[] = [];
    BENS_TOMBADOS.forEach((b) => {
      porMun.set(b.municipio, (porMun.get(b.municipio) ?? 0) + 1);
      const a = anoDoDecreto(b);
      if (a) anos.push(a);
    });
    const muns = Array.from(porMun.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'));
    const totalComPdf = BENS_TOMBADOS.filter((b) => DECRETOS_PDF[b.decreto.numero]).length;
    const de = anos.length ? Math.min(...anos) : null;
    const ate = anos.length ? Math.max(...anos) : null;
    return [
      {
        id: 'bens', num: '01', kicker: 'Consulta', title: 'Este bem é tombado?', to: '/bens-tombados', tone: 'blue',
        photo: '/cena-fotos/casarao.webp', focus: '50% 40%', icon: Landmark,
        headline: `${BENS_TOMBADOS.length} bens em ${muns.length} municípios`,
        text: `Relação oficial com localização, decreto, Livro do Tombo e ${totalComPdf} inscrições com decreto digitalizado.`,
        stamp: de && ate ? `${de} a ${ate}` : undefined,
        linksTitle: 'Atalhos de consulta',
        links: [
          { label: 'Relação completa de bens', to: '/bens-tombados', hint: String(BENS_TOMBADOS.length) },
          ...muns.slice(0, 2).map(([m, n]) => ({ label: `Só em ${m}`, to: `/bens-tombados?municipio=${encodeURIComponent(m)}`, hint: String(n) }))
        ]
      },
      {
        id: 'servicos', num: '02', kicker: 'Atendimento', title: 'Serviços ao cidadão', to: '/servicos', tone: 'terra',
        photo: '/cena-fotos/telhados.webp', focus: '50% 45%', icon: FileText,
        headline: 'Carta de serviços e requerimento',
        text: 'Documentação exigida, etapas de análise (DPHAP, DPI e DPE) e assistente para gerar requerimento de atendimento.',
        stamp: 'DPHAP · DPI · DPE',
        linksTitle: 'Serviços disponíveis',
        links: [
          { label: 'Intervenção em imóvel tombado', to: '/servicos', hint: 'DPHAP' },
          { label: 'Certidão de poligonal e tombamento', to: '/servicos', hint: 'DPHAP' },
          { label: 'Engenhos publicitários', to: '/servicos', hint: 'DPHAP' }
        ]
      },
      {
        id: 'legislacao', num: '03', kicker: 'Biblioteca', title: 'Consultar a legislação', to: '/legislacao', tone: 'sage',
        photo: '/cena-fotos/azulejos.webp', focus: '50% 30%', icon: BookOpen,
        headline: `${PUBLIC_LEGAL_DOCUMENTS.length} normas na biblioteca`,
        text: 'Leis, decretos, portarias e diretrizes (Federal, Estadual, Municipal e SPC), com resumo didático e fonte de cada documento.',
        stamp: 'Com fonte',
        linksTitle: 'Em destaque',
        links: [
          { label: 'Biblioteca completa de normas', to: '/legislacao', hint: String(PUBLIC_LEGAL_DOCUMENTS.length) },
          { label: 'Lei Estadual nº 5.082/1990', to: '/legislacao?q=5.082', hint: '1990' },
          { label: 'Decreto Estadual nº 10.089/1986', to: '/legislacao?q=10.089', hint: '1986' }
        ]
      },
      {
        id: 'denuncia', num: '04', kicker: 'Fiscalização', title: 'Denúncias', to: '/denuncia', tone: 'red',
        photo: '/cena-fotos/rua-noite.webp', focus: '50% 55%', icon: AlertTriangle,
        headline: 'Comunicação de irregularidade',
        text: 'Canal para informar obra sem autorização, risco de demolição, descaracterização de fachada ou abandono em bem protegido.',
        stamp: 'DPHAP',
        linksTitle: 'Como agir',
        links: [
          { label: 'Denunciar dano ou obra irregular', to: '/denuncia' },
          { label: 'Conferir se o bem é tombado', to: '/bens-tombados' },
          { label: 'Canais de atendimento', to: '/contato' }
        ]
      },
      {
        id: 'spc', num: '05', kicker: 'Institucional', title: 'Sobre a SPC', to: '/institucional', tone: 'navy',
        photo: '/cena-fotos/balcao.webp', focus: '50% 50%', icon: Users,
        headline: 'Quem somos e estrutura',
        text: `Órgão vinculado à SECMA, dividido em DPHAP, DPE e DPI, com sede no ${SITE_CONTACT.buildingName} (${SITE_CONTACT.city}).`,
        stamp: 'SECMA',
        linksTitle: 'Para saber mais',
        links: [
          { label: 'Quem somos e departamentos', to: '/institucional' },
          { label: 'Transparência e acesso à informação', to: '/transparencia' },
          { label: `Sede: ${SITE_CONTACT.buildingName}`, to: '/contato' }
        ]
      }
    ];
  }, []);

  /* ===== Motor de Rotação 3D Exclusivamente Horizontal (Eixo Y) ===== */
  useEffect(() => {
    let animId = 0;
    const update3D = () => {
      animId = requestAnimationFrame(update3D);
      const tilt = tiltRef.current;
      if (!tilt) return;

      rotX.current = 0;
      rotZ.current = 0;
      targetRotX.current = 0;
      targetRotZ.current = 0;

      if (!anyOpen) {
        // MODO RECOLHIDO: CILINDRO CIRCULAR 3D COM ROTAÇÃO APENAS HORIZONTAL (EIXO Y)
        if (isDragging.current) {
          rotY.current += (targetRotY.current - rotY.current) * 0.4;
        } else if (isTransitioning.current) {
          rotY.current += (0 - rotY.current) * 0.25;
        } else {
          // Desaceleração inercial horizontal pós-arrasto (fica parado após desacelerar)
          if (Math.abs(velocity.current.x) > 0.04) {
            targetRotY.current += velocity.current.x;
            velocity.current.x *= 0.93;
          } else {
            velocity.current.x = 0;
          }

          rotY.current += (targetRotY.current - rotY.current) * 0.15;
        }

        tilt.style.transform = `rotateX(0deg) rotateY(${rotY.current.toFixed(2)}deg) rotateZ(0deg)`;
      } else {
        // MODO DESDOBRADO: Alinhamento frontal estável para leitura e clique
        rotY.current += (0 - rotY.current) * 0.18;
        tilt.style.transform = `rotateX(0deg) rotateY(${rotY.current.toFixed(2)}deg) rotateZ(0deg)`;
      }
    };

    animId = requestAnimationFrame(update3D);
    return () => cancelAnimationFrame(animId);
  }, [anyOpen]);

  // Gestos de arrasto para girar o cilindro circular 3D apenas na horizontal quando recolhido
  const handlePointerDown = (e: React.PointerEvent) => {
    if (anyOpen) return;
    const target = e.target as HTMLElement;
    if (target.closest('button.om-control-btn') || target.closest('a')) return;

    isDragging.current = true;
    setIsRotating(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: 0,
      rotY: targetRotY.current,
      time: Date.now()
    };
    lastPointer.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    velocity.current = { x: 0, y: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || anyOpen) return;
    const now = Date.now();
    const dt = Math.max(1, now - lastPointer.current.time);
    const dx = e.clientX - dragStart.current.x;
    const stepX = e.clientX - lastPointer.current.x;

    targetRotY.current = dragStart.current.rotY + dx * 0.65;
    targetRotX.current = 0;
    targetRotZ.current = 0;

    velocity.current = {
      x: (stepX / dt) * 12,
      y: 0
    };

    lastPointer.current = { x: e.clientX, y: e.clientY, time: now };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsRotating(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const totalDist = Math.hypot(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y);
    const totalTime = Date.now() - dragStart.current.time;

    // Toque simples (sem arrastar) desdobra o origami
    if (totalDist < 6 && totalTime < 300 && !anyOpen) {
      handleToggle();
    }
  };

  // Gestos de Swipe tátil no Mobile quando desdobrado
  const handleMobileTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleMobileTouchEnd = (e: React.TouchEvent) => {
    if (!anyOpen || isWide) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Se foi um movimento primariamente horizontal (swipe)
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        // Swipe para esquerda -> avança seção
        setActiveMobileTab((prev) => Math.min(N - 1, prev + 1));
      } else {
        // Swipe para direita -> volta seção
        setActiveMobileTab((prev) => Math.max(0, prev - 1));
      }
    }
  };

  const handleSpin360 = () => {
    targetRotY.current += 360;
  };

  const handleResetAngle = () => {
    targetRotX.current = INITIAL_PITCH;
    targetRotY.current = INITIAL_YAW;
    targetRotZ.current = 0;
    velocity.current = { x: 0, y: 0 };
  };

  const handleToggle = () => {
    if (anyOpen) {
      // Recolher para o cilindro circular 3D
      setAnyOpen(false);
      window.setTimeout(() => {
        targetRotX.current = INITIAL_PITCH;
        targetRotY.current = INITIAL_YAW;
        targetRotZ.current = 0;
      }, 500);
    } else {
      // Desdobrar para fita aberta
      isTransitioning.current = true;
      targetRotX.current = 0;
      targetRotY.current = 0;
      targetRotZ.current = 0;
      window.setTimeout(() => {
        setAnyOpen(true);
        isTransitioning.current = false;
      }, 200);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/bens-tombados?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/bens-tombados');
    }
  };

  // Cálculo de Transformação 3D para cada faceta do origami (Desktop e Mobile)
  const getFacetTransform = (i: number): React.CSSProperties => {
    if (!anyOpen) {
      // CILINDRO CIRCULAR 3D:
      // Formando um prisma pentagonal regular com ângulo i * 72°.
      const angle = i * (360 / N); // 0, 72, 144, 216, 288 graus
      return {
        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
        zIndex: Math.round(100 + Math.cos((angle + rotY.current) * (Math.PI / 180)) * 50),
        opacity: 1,
        pointerEvents: 'auto'
      };
    } else {
      // MODO DESDOBRADO:
      if (isWide) {
        // Desktop: As 5 facetas alinham-se frontalmente em fita horizontal plana
        const spacing = pw + 16;
        const offsetX = (i - 2) * spacing;
        return {
          transform: `rotateY(0deg) translateZ(0px) translateX(${offsetX}px)`,
          zIndex: 10 + i,
          opacity: 1,
          pointerEvents: 'auto'
        };
      } else {
        // Mobile: Biombo / Leque 3D Origami Imersivo em Profundidade Z
        const k = i - activeMobileTab;
        if (k === 0) {
          // Faceta ativa no centro: nítida, desdobrada e em primeiro plano
          return {
            transform: `translateX(0px) translateZ(0px) rotateY(0deg) scale(1)`,
            zIndex: 50,
            opacity: 1,
            pointerEvents: 'auto'
          };
        } else if (k === -1) {
          // Faceta anterior à esquerda em perspectiva 3D (asa de biombo)
          const offset = Math.min(85, Math.max(65, (w - 40) * 0.22));
          return {
            transform: `translateX(-${offset}px) translateZ(-65px) rotateY(24deg) scale(0.88)`,
            zIndex: 40,
            opacity: 0.7,
            cursor: 'pointer',
            pointerEvents: 'auto'
          };
        } else if (k === 1) {
          // Faceta seguinte à direita em perspectiva 3D (asa de biombo)
          const offset = Math.min(85, Math.max(65, (w - 40) * 0.22));
          return {
            transform: `translateX(${offset}px) translateZ(-65px) rotateY(-24deg) scale(0.88)`,
            zIndex: 40,
            opacity: 0.7,
            cursor: 'pointer',
            pointerEvents: 'auto'
          };
        } else {
          // Demais facetas recuadas no fundo da cena 3D
          const sign = k > 0 ? 1 : -1;
          return {
            transform: `translateX(${sign * 170}px) translateZ(-190px) rotateY(${sign * -38}deg) scale(0.72)`,
            zIndex: 10,
            opacity: 0,
            pointerEvents: 'none'
          };
        }
      }
    }
  };

  // Renderização de cada faceta com dobradiças físicas reais de origami
  const renderFacet = (i: number) => {
    const s = sheets[i];
    const t = TONES[s.tone];
    const ids = `om-${s.id}`;
    const facetStyle = getFacetTransform(i);
    
    // Dimensões da folha de acordo com o modo
    const facetPw = anyOpen && !isWide ? mobilePw : pw;
    const facetSh = anyOpen && !isWide ? mobileSh : sh;
    
    // No mobile, a folha ativa desdobra suas dobras verticais; no desktop todas desdobram
    const isUnfoldedHere = anyOpen && (isWide || i === activeMobileTab);

    return (
      <div
        key={s.id}
        className="om-facet"
        style={{
          ...facetStyle,
          ['--paper' as string]: t.paper,
          ['--paper-deep' as string]: t.deep,
          ['--rgb' as string]: t.rgb,
          width: facetPw + (anyOpen ? 0 : 2),
          height: isUnfoldedHere ? facetSh * 3 : facetSh,
          marginLeft: -((facetPw + (anyOpen ? 0 : 2)) / 2)
        } as React.CSSProperties}
        data-sheet={s.id}
        onClick={() => {
          if (!isWide && anyOpen && i !== activeMobileTab) {
            setActiveMobileTab(i);
          }
        }}
      >
        {/* Borda chanfrada de iluminação física da folha */}
        <div className="om-facet-edge" />

        {/* 1. CAPA PRINCIPAL (visível sempre; no cilindro fechado e no topo do desdobrado) */}
        <div className="om-seg" style={{ height: facetSh }}>
          <div
            className="om-face om-front om-cover-face"
            style={{
              backgroundColor: t.paper
            }}
          >
            {/* Foto de fundo do acervo cultural integrada à cor nobre */}
            <img
              src={s.photo}
              alt=""
              className="om-photo"
              style={{
                objectPosition: s.focus,
                opacity: anyOpen ? 0.95 : 0.20,
                mixBlendMode: anyOpen ? 'normal' : 'multiply',
                filter: anyOpen ? 'saturate(1.05) contrast(1.02)' : 'contrast(1.3) brightness(0.9)',
                transition: 'opacity 0.6s ease, mix-blend-mode 0.6s ease, filter 0.6s ease'
              }}
              loading="lazy"
            />
            {/* Camada de cor nobre do patrimônio — vibrante quando fechado */}
            <div
              className="om-wash"
              style={{
                background: anyOpen
                  ? `linear-gradient(180deg, rgba(${t.rgb}, .16) 0%, rgba(${t.rgb}, .35) 45%, rgba(${t.rgb}, .95) 92%)`
                  : `linear-gradient(180deg, rgba(${t.rgb}, .94) 0%, rgba(${t.rgb}, .88) 40%, rgba(${t.rgb}, .98) 100%)`,
                transition: 'background 0.6s ease'
              }}
            />

            {/* Filete de encadernação colonial em ouro */}
            <div
              className="absolute inset-1.5 rounded-lg border pointer-events-none z-[3] transition-opacity duration-500"
              style={{
                borderColor: anyOpen ? 'rgba(255, 255, 255, 0.2)' : 'rgba(233, 180, 76, 0.45)'
              }}
            />
            
            <button
              type="button"
              className="om-cover"
              onClick={() => {
                if (!isWide && anyOpen && i !== activeMobileTab) {
                  setActiveMobileTab(i);
                } else {
                  handleToggle();
                }
              }}
              aria-label={`${s.num} - ${s.title}`}
            >
              <span className="om-cover-top">
                <span className="om-num font-mono bg-black/45 border border-[#E9B44C]/50 text-[#E9B44C] shadow-sm">
                  {s.num}
                </span>
                <span
                  className="om-ico shadow-md transition-colors duration-500"
                  style={{
                    backgroundColor: anyOpen ? '#FFFFFF' : '#E9B44C',
                    color: anyOpen ? t.paper : '#071D33'
                  }}
                >
                  <s.icon size={16} aria-hidden={true} />
                </span>
              </span>

              <span className="om-cover-bottom">
                <span className="om-kicker text-[#E9B44C] font-bold tracking-widest">{s.kicker}</span>
                <span className="om-title font-serif text-white">{s.title}</span>
                <span className="om-hint text-[10px] font-bold tracking-wider text-[#E9B44C] mt-1 flex items-center gap-1">
                  {anyOpen ? (
                    !isWide && i !== activeMobileTab ? (
                      <>✦ Toque para ver</>
                    ) : (
                      <>Recolher <ChevronDown size={12} className="rotate-180" /></>
                    )
                  ) : (
                    <>✦ Clique para abrir</>
                  )}
                </span>
              </span>
            </button>
          </div>

          {/* Verso Oficial ao rotacionar 180° no espaço */}
          <div className="om-face om-back om-packet-back flex flex-col justify-between p-4 text-center">
            <div className="border border-white/20 p-3 rounded-lg h-full flex flex-col justify-center items-center">
              <span className="text-[9px] font-bold tracking-widest text-[#E9B44C] uppercase">
                Governo do Maranhão
              </span>
              <p className="font-serif text-xs font-bold text-white mt-1">
                Superintendência do Patrimônio Cultural
              </p>
              <span className="text-[10px] text-slate-300 mt-2 font-mono">
                SECMA · {s.kicker}
              </span>
            </div>
          </div>
        </div>

        {/* 2. PRIMEIRA DOBRA VERTICAL (Headline e Descrição Normativa) */}
        <div
          className="om-hx"
          id={`${ids}-dobra-1`}
          style={{
            top: facetSh,
            height: facetSh,
            transform: `rotateX(${isUnfoldedHere ? 0 : 180}deg)`,
            opacity: isUnfoldedHere ? 1 : 0,
            visibility: isUnfoldedHere ? 'visible' : 'hidden',
            transition: isUnfoldedHere
              ? `transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${isWide ? i * 60 : 80}ms, opacity 0.35s ease ${isWide ? i * 60 : 80}ms`
              : 'transform 0.45s ease, opacity 0.3s ease, visibility 0s linear 0.45s'
          }}
          inert={!isUnfoldedHere}
        >
          <div className="om-seg" style={{ height: facetSh }}>
            <div className="om-face om-front om-text-face om-crease">
              <div className="om-body">
                <p className="om-eyebrow">{s.num} · {s.kicker}</p>
                <h3 className="om-h3 font-serif">{s.headline}</h3>
                <p className="om-p">{s.text}</p>
              </div>
            </div>
            <div className="om-face om-back" />
          </div>

          {/* 3. SEGUNDA DOBRA VERTICAL (Atalhos, Links Oficiais e Botão de Acesso) */}
          <div
            className="om-hx"
            id={`${ids}-dobra-2`}
            style={{
              top: facetSh,
              height: facetSh,
              transform: `rotateX(${isUnfoldedHere ? 0 : 180}deg)`,
              opacity: isUnfoldedHere ? 1 : 0,
              visibility: isUnfoldedHere ? 'visible' : 'hidden',
              transition: isUnfoldedHere
                ? `transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${isWide ? i * 60 + 120 : 180}ms, opacity 0.35s ease ${isWide ? i * 60 + 120 : 180}ms`
                : 'transform 0.45s ease, opacity 0.3s ease, visibility 0s linear 0.45s'
            }}
            inert={!isUnfoldedHere}
          >
            <div className="om-seg" style={{ height: facetSh }}>
              <div className="om-face om-front om-links-face om-crease">
                <div className="om-body">
                  <p className="om-eyebrow om-eyebrow-dark">{s.linksTitle}</p>
                  <ul className="om-list">
                    {s.links.map((l) => (
                      <li key={l.label}>
                        <Link to={l.to} className="om-link" tabIndex={isUnfoldedHere ? 0 : -1}>
                          <span>{l.label}</span>
                          {l.hint ? <small>{l.hint}</small> : <ArrowRight size={13} aria-hidden={true} />}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link to={s.to} className="om-go" tabIndex={isUnfoldedHere ? 0 : -1}>
                    Acessar Página <ArrowRight size={13} aria-hidden={true} />
                  </Link>
                </div>
                {s.stamp && <span className="om-stamp">{s.stamp}</span>}
              </div>
              <div className="om-face om-back om-back-cream" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Grade plana de alto contraste (Acessibilidade)
  const flatGrid = (
    <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sheets.map((s) => {
        const t = TONES[s.tone];
        return (
          <li key={s.id} className="overflow-hidden rounded-2xl border-2 border-current bg-white text-brand-navy shadow">
            <div className="relative h-32" style={{ background: t.paper }}>
              <p className="absolute inset-x-0 bottom-0 bg-black/60 px-4 py-2 font-display text-lg font-extrabold text-white">{s.title}</p>
            </div>
            <div className="space-y-3 p-4">
              <h3 className="font-display text-base font-extrabold">{s.headline}</h3>
              <p className="text-sm leading-relaxed">{s.text}</p>
              <ul className="list-none space-y-1">
                {s.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="flex items-center justify-between border-b border-slate-300 py-2 text-sm font-bold underline-offset-4 hover:underline">
                      <span>{l.label}</span>{l.hint && <small>{l.hint}</small>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ul>
  );

  return (
    <section
      ref={rootRef}
      aria-labelledby="origami-titulo"
      className="om relative z-30 overflow-hidden max-w-full w-full"
      style={{ ['--serif' as string]: SER } as React.CSSProperties}
    >
      {/* 1. CABEÇALHO INSTITUCIONAL COM BUSCA RÁPIDA INTEGRADA */}
      <div className="om-intro-band pt-8 pb-4">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-[#E9B44C]">
                Governo do Estado do Maranhão · SECMA
              </div>
              <h1 id="origami-titulo" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight font-serif">
                Superintendência do Patrimônio Cultural
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
                Bens tombados, biblioteca de normas, procedimentos para reformas em centros históricos e salvaguarda cultural do Maranhão.
              </p>
            </div>

            {/* Barra de Busca Universal Integrada */}
            <div className="w-full md:w-auto md:min-w-[360px] lg:min-w-[420px]">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center" role="search">
                <Search size={16} className="absolute left-3.5 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar bem, município ou decreto..."
                  className="w-full pl-10 pr-24 py-2.5 bg-white/15 hover:bg-white/20 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-300 focus:placeholder:text-slate-400 border border-white/25 focus:border-white rounded-xl text-xs font-medium transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-[#E9B44C]/30"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-3 py-1.5 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors"
                >
                  Buscar
                </button>
              </form>
            </div>
          </div>

          {/* BARRA DE CONTROLE DO ORIGAMI 3D CIRCULAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 w-full">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold text-[#E9B44C] tracking-wide uppercase">
              <Compass size={14} className={anyOpen ? '' : 'animate-spin-slow'} />
              <span>
                {anyOpen
                  ? isWide
                    ? 'Origami Desdobrado — 5 Seções em Exibição'
                    : `Origami Desdobrado 3D — Seção ${sheets[activeMobileTab].num}: ${sheets[activeMobileTab].kicker}`
                  : '✦ Cilindro 3D Circular: Arraste na horizontal para girar em 360°'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!anyOpen && (
                <>
                  <button
                    type="button"
                    onClick={handleSpin360}
                    className="om-control-btn px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    title="Girar cilindro 360 graus"
                  >
                    <RotateCcw size={12} />
                    <span>Girar 360°</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAngle}
                    className="om-control-btn px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors"
                    title="Resetar ângulo de visualização"
                  >
                    Resetar Vista
                  </button>
                </>
              )}

              <button
                ref={toggleRef}
                type="button"
                onClick={handleToggle}
                aria-expanded={anyOpen}
                aria-controls="om-stage"
                className="om-control-btn px-5 py-2 rounded-full bg-brand-terracotta hover:bg-white hover:text-brand-navy text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
              >
                <span aria-hidden="true" className={`om-toggle-ico ${anyOpen ? 'on' : ''}`} />
                <span>{anyOpen ? 'Recolher em 3D Circular' : 'Desdobrar Origami'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CENA 3D COM O CILINDRO CIRCULAR E DESDOBRAMENTO IMERSIVO */}
      <div
        id="om-stage"
        ref={wrapRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`mx-auto max-w-[1560px] px-4 sm:px-6 pb-12 pt-4 select-none overflow-hidden max-w-full touch-pan-y ${
          !anyOpen ? (isRotating ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        {flat ? (
          flatGrid
        ) : isWide ? (
          /* MODO DESKTOP / TABLET AMPLO: CILINDRO CIRCULAR 3D E DESDOBRAMENTO EM FITA */
          <div className="relative" style={{ height: (anyOpen ? sh * 3 : sh) + 100 }}>
            <div
              className="om-scene"
              style={{
                width: anyOpen ? pw * N : radius * 2.4,
                height: anyOpen ? sh * 3 : sh,
                marginLeft: anyOpen ? -(pw * N) / 2 : -(radius * 1.2),
                ['--pw' as string]: `${pw}px`,
                ['--sh' as string]: `${sh}px`,
                transition: 'width 0.85s cubic-bezier(0.16, 1, 0.3, 1), margin-left 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
              } as React.CSSProperties}
            >
              <div
                ref={tiltRef}
                className="om-tilt"
                style={{
                  transformOrigin: `50% ${sh / 2}px 0`
                }}
              >
                <div className="om-polyhedron">
                  {/* 1. TAMPA SUPERIOR PENTAGONAL (Y = 0) - DUPLA FACE (Fechada por cima e por baixo) */}
                  <div
                    className="om-cylinder-cap om-cylinder-cap-top"
                    style={{
                      top: 0,
                      width: Math.ceil(circumRadius * 2) + 6,
                      height: Math.ceil(circumRadius * 2) + 6,
                      marginLeft: -((Math.ceil(circumRadius * 2) + 6) / 2),
                      marginTop: -((Math.ceil(circumRadius * 2) + 6) / 2),
                      transform: 'rotateX(90deg)',
                      transformOrigin: '50% 50% 0',
                      opacity: anyOpen ? 0 : 1,
                      transition: 'opacity 0.5s ease'
                    }}
                  >
                    <PentagonCap circumRadius={circumRadius} radius={radius} sheets={sheets} facing="up" hasCompass={true} />
                  </div>
                  <div
                    className="om-cylinder-cap om-cylinder-cap-top-inner"
                    style={{
                      top: 0,
                      width: Math.ceil(circumRadius * 2) + 6,
                      height: Math.ceil(circumRadius * 2) + 6,
                      marginLeft: -((Math.ceil(circumRadius * 2) + 6) / 2),
                      marginTop: -((Math.ceil(circumRadius * 2) + 6) / 2),
                      transform: 'rotateX(-90deg)',
                      transformOrigin: '50% 50% 0',
                      opacity: anyOpen ? 0 : 1,
                      transition: 'opacity 0.5s ease'
                    }}
                  >
                    <PentagonCap circumRadius={circumRadius} radius={radius} sheets={sheets} facing="down" hasCompass={false} />
                  </div>

                  {/* 2. BASE INFERIOR PENTAGONAL (Y = sh) - DUPLA FACE (Fechada por baixo e por cima) */}
                  <div
                    className="om-cylinder-cap om-cylinder-cap-bottom"
                    style={{
                      top: 0,
                      width: Math.ceil(circumRadius * 2) + 6,
                      height: Math.ceil(circumRadius * 2) + 6,
                      marginLeft: -((Math.ceil(circumRadius * 2) + 6) / 2),
                      marginTop: -((Math.ceil(circumRadius * 2) + 6) / 2),
                      transform: `translateY(${sh}px) rotateX(-90deg)`,
                      transformOrigin: '50% 50% 0',
                      opacity: anyOpen ? 0 : 1,
                      transition: 'opacity 0.5s ease'
                    }}
                  >
                    <PentagonCap circumRadius={circumRadius} radius={radius} sheets={sheets} facing="down" hasCompass={true} />
                  </div>
                  <div
                    className="om-cylinder-cap om-cylinder-cap-bottom-inner"
                    style={{
                      top: 0,
                      width: Math.ceil(circumRadius * 2) + 6,
                      height: Math.ceil(circumRadius * 2) + 6,
                      marginLeft: -((Math.ceil(circumRadius * 2) + 6) / 2),
                      marginTop: -((Math.ceil(circumRadius * 2) + 6) / 2),
                      transform: `translateY(${sh}px) rotateX(90deg)`,
                      transformOrigin: '50% 50% 0',
                      opacity: anyOpen ? 0 : 1,
                      transition: 'opacity 0.5s ease'
                    }}
                  >
                    <PentagonCap circumRadius={circumRadius} radius={radius} sheets={sheets} facing="up" hasCompass={false} />
                  </div>

                  {/* AS 5 FACETAS DO ORIGAMI CIRCULAR */}
                  {sheets.map((_, i) => renderFacet(i))}
                </div>
              </div>

              {/* Sombra de apoio no chão */}
              <span
                aria-hidden="true"
                className="om-ground"
                style={{
                  width: anyOpen ? pw * 5.2 : radius * 2.4,
                  transition: 'width 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>
          </div>
        ) : (
          /* MODO DISPOSITIVOS MÓVEIS (Smartphone) — DESDOBRAMENTO 3D IMERSIVO SEM SCROLL HORIZONTAL */
          <div className="flex flex-col items-center gap-4 w-full max-w-full overflow-hidden">
            {/* Seletor rápido de 5 seções em grade proporcional (100% da largura) */}
            {anyOpen && (
              <div className="w-full max-w-sm px-2 animate-fade-in">
                <div className="grid grid-cols-5 gap-1 p-1 bg-[#071D33]/95 rounded-2xl border border-white/15 w-full shadow-lg">
                  {sheets.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveMobileTab(idx)}
                      className={`py-2 px-1 rounded-xl text-center transition-all ${
                        activeMobileTab === idx
                          ? 'bg-brand-terracotta text-white shadow-md scale-105'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="block font-mono text-[10px] font-bold leading-none">{s.num}</span>
                      <span className="block text-[8px] font-bold tracking-tight truncate leading-tight mt-1">{s.kicker}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PALCO 3D DO ORIGAMI NO MOBILE (Tanto fechado quanto desdobrado com dobras reais!) */}
            <div
              className="relative py-2 w-full flex justify-center items-center overflow-hidden"
              style={{
                height: anyOpen ? mobileSh * 3 + 40 : sh + 50,
                transition: 'height 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onTouchStart={handleMobileTouchStart}
              onTouchEnd={handleMobileTouchEnd}
            >
              <div
                className="om-scene"
                style={{
                  width: anyOpen ? mobilePw : radius * 2.2,
                  height: anyOpen ? mobileSh * 3 : sh,
                  marginLeft: anyOpen ? -(mobilePw / 2) : -(radius * 1.1),
                  perspective: anyOpen ? '1100px' : '1600px',
                  perspectiveOrigin: '50% 35%',
                  ['--pw' as string]: `${anyOpen ? mobilePw : pw}px`,
                  ['--sh' as string]: `${anyOpen ? mobileSh : sh}px`,
                  transition: 'width 0.85s cubic-bezier(0.16, 1, 0.3, 1), margin-left 0.85s cubic-bezier(0.16, 1, 0.3, 1), height 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
                } as React.CSSProperties}
              >
                <div
                  ref={tiltRef}
                  className="om-tilt"
                  style={{
                    transformOrigin: `50% ${sh / 2}px 0`
                  }}
                >
                  <div className="om-polyhedron">
                    {/* 1. TAMPA SUPERIOR PENTAGONAL NO MOBILE (Y = 0) - DUPLA FACE */}
                    <div
                      className="om-cylinder-cap om-cylinder-cap-top"
                      style={{
                        top: 0,
                        width: Math.ceil(circumRadius * 2) + 6,
                        height: Math.ceil(circumRadius * 2) + 6,
                        marginLeft: -((Math.ceil(circumRadius * 2) + 6) / 2),
                        marginTop: -((Math.ceil(circumRadius * 2) + 6) / 2),
                        transform: 'rotateX(90deg)',
                        transformOrigin: '50% 50% 0',
                        opacity: anyOpen ? 0 : 1,
                        transition: 'opacity 0.5s ease'
                      }}
                    >
                      <PentagonCap circumRadius={circumRadius} radius={radius} sheets={sheets} facing="up" hasCompass={true} />
                    </div>
                    <div
                      className="om-cylinder-cap om-cylinder-cap-top-inner"
                      style={{
                        top: 0,
                        width: Math.ceil(circumRadius * 2) + 6,
                        height: Math.ceil(circumRadius * 2) + 6,
                        marginLeft: -((Math.ceil(circumRadius * 2) + 6) / 2),
                        marginTop: -((Math.ceil(circumRadius * 2) + 6) / 2),
                        transform: 'rotateX(-90deg)',
                        transformOrigin: '50% 50% 0',
                        opacity: anyOpen ? 0 : 1,
                        transition: 'opacity 0.5s ease'
                      }}
                    >
                      <PentagonCap circumRadius={circumRadius} radius={radius} sheets={sheets} facing="down" hasCompass={false} />
                    </div>

                    {/* 2. BASE INFERIOR PENTAGONAL NO MOBILE (Y = sh) - DUPLA FACE */}
                    <div
                      className="om-cylinder-cap om-cylinder-cap-bottom"
                      style={{
                        top: 0,
                        width: Math.ceil(circumRadius * 2) + 6,
                        height: Math.ceil(circumRadius * 2) + 6,
                        marginLeft: -((Math.ceil(circumRadius * 2) + 6) / 2),
                        marginTop: -((Math.ceil(circumRadius * 2) + 6) / 2),
                        transform: `translateY(${sh}px) rotateX(-90deg)`,
                        transformOrigin: '50% 50% 0',
                        opacity: anyOpen ? 0 : 1,
                        transition: 'opacity 0.5s ease'
                      }}
                    >
                      <PentagonCap circumRadius={circumRadius} radius={radius} sheets={sheets} facing="down" hasCompass={true} />
                    </div>
                    <div
                      className="om-cylinder-cap om-cylinder-cap-bottom-inner"
                      style={{
                        top: 0,
                        width: Math.ceil(circumRadius * 2) + 6,
                        height: Math.ceil(circumRadius * 2) + 6,
                        marginLeft: -((Math.ceil(circumRadius * 2) + 6) / 2),
                        marginTop: -((Math.ceil(circumRadius * 2) + 6) / 2),
                        transform: `translateY(${sh}px) rotateX(90deg)`,
                        transformOrigin: '50% 50% 0',
                        opacity: anyOpen ? 0 : 1,
                        transition: 'opacity 0.5s ease'
                      }}
                    >
                      <PentagonCap circumRadius={circumRadius} radius={radius} sheets={sheets} facing="up" hasCompass={false} />
                    </div>

                    {/* As 5 facetas com dobras físicas em 3D */}
                    {sheets.map((_, i) => renderFacet(i))}
                  </div>
                </div>

                {/* Sombra de apoio no chão */}
                <span
                  aria-hidden="true"
                  className="om-ground"
                  style={{
                    width: anyOpen ? mobilePw * 1.1 : radius * 2.2,
                    transition: 'width 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
              </div>
            </div>

            {/* Barra de Navegação Tátil entre Seções 3D no Mobile */}
            {anyOpen && (
              <div className="flex items-center justify-between w-full max-w-sm px-4 pt-1 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setActiveMobileTab((prev) => Math.max(0, prev - 1))}
                  disabled={activeMobileTab === 0}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-25 disabled:pointer-events-none text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                  aria-label="Seção anterior"
                >
                  <ChevronLeft size={16} />
                  <span>Anterior</span>
                </button>

                {/* Indicador de pontos (1 a 5) com contador textual */}
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    {sheets.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setActiveMobileTab(dotIdx)}
                        className={`h-2 rounded-full transition-all ${
                          activeMobileTab === dotIdx
                            ? 'w-6 bg-brand-terracotta'
                            : 'w-2 bg-white/40 hover:bg-white/70'
                        }`}
                        aria-label={`Ir para seção ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-slate-300 font-bold uppercase tracking-wider">
                    {sheets[activeMobileTab].num} de 05 · {sheets[activeMobileTab].kicker}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveMobileTab((prev) => Math.min(N - 1, prev + 1))}
                  disabled={activeMobileTab === N - 1}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-25 disabled:pointer-events-none text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                  aria-label="Próxima seção"
                >
                  <span>Próxima</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dicas e fontes oficiais */}
        <div className="flex flex-col items-center gap-2 mt-4 text-center">
          {!flat && !anyOpen && (
            <p className="text-[11px] font-mono uppercase tracking-widest text-[#E9B44C] bg-[#071D33]/80 px-4 py-1.5 rounded-full border border-white/10 shadow-sm">
              ✦ Formato Circular 3D: Arraste na horizontal para girar em 360° · Clique para desdobrar
            </p>
          )}
          {anyOpen && !isWide && (
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-300 bg-[#071D33]/70 px-3.5 py-1 rounded-full border border-white/10">
              Deslize para os lados ou toque nas abas para folhear as seções em 3D
            </p>
          )}
          <p className="om-fonte">
            <strong>Acervo Oficial:</strong> Relação de bens tombados do Estado (SPC/DPHAP), decretos estaduais, Livro do Tombo e biblioteca de normas sob curadoria oficial da SPC/SECMA.
          </p>
        </div>
      </div>
    </section>
  );
};
