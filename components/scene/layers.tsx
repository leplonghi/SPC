import React from 'react';

/**
 * Cena ilustrada do hero: desenho original da SPC no portal, em camadas (SVG), com símbolos da cultura maranhense.
 * Cada função devolve o conteúdo de UMA camada. A ordem e a profundidade ficam em MaranhaoScene.tsx.
 * Paleta: Manual de Identidade Visual (#071D33, #3F7893, #E63343, #F4EFEA, #E8E1DD, #B94734, #2E7D68),
 * mais um ocre de sol (#E9B44C) usado só na ilustração.
 */
export const C = {
  navy: '#071D33',
  navyDeep: '#0B1824',
  blue: '#3F7893',
  blueDark: '#2F5F78',
  blueLight: '#8FB6C8',
  red: '#E63343',
  terracotta: '#B94734',
  terracottaDark: '#8E3A2C',
  sage: '#2E7D68',
  sageDark: '#1F5E4D',
  sageLight: '#4BA58B',
  cream: '#F4EFEA',
  sand: '#E8E1DD',
  ochre: '#E9B44C',
  ochreLight: '#F2CB75',
  dune1: '#F3E3C6',
  dune2: '#EBCF9F',
  dune3: '#E3BE86',
  skin: '#5A3220',
  hair: '#1A0F0A'
};

/** Encolhe e empurra a cena para a direita, deixando a metade esquerda livre para o texto. */
export const T = 'translate(215 8) scale(0.86)';

const star = (cx: number, cy: number, r: number, ri = r * 0.42) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : ri;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
};

const Flower: React.FC<{ x: number; y: number; r: number; petal: string; center: string }> = ({ x, y, r, petal, center }) => (
  <g transform={`translate(${x} ${y})`}>
    {[0, 72, 144, 216, 288].map((a) => (
      <circle key={a} cx={Math.cos((a * Math.PI) / 180) * r * 0.62} cy={Math.sin((a * Math.PI) / 180) * r * 0.62} r={r * 0.46} fill={petal} />
    ))}
    <circle r={r * 0.34} fill={center} />
  </g>
);

/** Palmeira (babaçu): tronco curvo e coroa de folhas. */
const Palm: React.FC<{ x: number; y: number; s?: number; flip?: boolean; h?: number }> = ({ x, y, s = 1, flip, h = 260 }) => {
  const rings = Array.from({ length: 9 }, (_, i) => i);
  const leaf = 'M0 0 C 34 -50, 105 -58, 168 -6 C 112 -30, 46 -26, 0 0Z';
  const angles = [-168, -134, -102, -68, -34, -4, 28, 62, 100];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d={`M0 0 C 14 ${-h * 0.3}, -12 ${-h * 0.62}, 8 ${-h}`} stroke="#7A4A2B" strokeWidth="15" fill="none" strokeLinecap="round" />
      <path d={`M-3 0 C 9 ${-h * 0.3}, -17 ${-h * 0.62}, 3 ${-h}`} stroke="#9A6338" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
      {rings.map((i) => (
        <path key={i} d={`M-8 ${-24 - i * (h / 10.5)} l 16 -4`} stroke="#5E3720" strokeWidth="2.5" opacity="0.55" />
      ))}
      <g transform={`translate(8 ${-h})`}>
        {angles.map((a, i) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d={leaf} fill={i % 2 ? C.sage : C.sageDark} />
            <path d="M0 0 C 40 -34, 100 -40, 150 -8" stroke={C.sageLight} strokeWidth="2.5" fill="none" opacity="0.7" />
          </g>
        ))}
        <circle r="9" fill="#7A4A2B" />
      </g>
    </g>
  );
};

const Bird: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = C.red }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-34 -16 Q-16 -34 2 -2 Q18 -34 38 -18 Q18 -10 4 8 Q-16 -6 -34 -16Z" fill={c} />
    <path d="M-34 -16 Q-30 -20 -24 -22 L-22 -14Z M38 -18 Q34 -22 28 -24 L26 -16Z" fill={C.navy} />
    <path d="M2 6 L2 16 M6 4 L12 14" stroke={c} strokeWidth="2" strokeLinecap="round" />
  </g>
);

/* ───────── Camada 0: céu, sol e faixas ───────── */
export const SkyLayer: React.FC = () => (
  <>
    <g transform={T}>
    <defs>
      <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F8F1E5" />
        <stop offset="0.55" stopColor="#F6DEB9" />
        <stop offset="1" stopColor="#F0C58A" />
      </linearGradient>
    </defs>
    <rect x="-300" y="-300" width="2200" height="1500" fill="url(#skyG)" />
    {/* faixas de céu em papel recortado */}
    <path d="M520 -10 C 760 70, 980 30, 1230 150 C 1390 225, 1500 195, 1620 120 L1620 -10Z" fill={C.blue} opacity="0.9" />
    <path d="M560 70 C 790 130, 990 100, 1210 205 C 1370 275, 1500 250, 1620 190 L1620 130 C 1500 190, 1380 215, 1230 150 C 1000 50, 780 90, 560 70Z" fill={C.cream} opacity="0.85" />
    <path d="M700 150 C 900 190, 1060 170, 1240 255 C 1380 320, 1500 300, 1620 250 L1620 232 C 1500 280, 1380 300, 1240 238 C 1070 160, 900 170, 700 150Z" fill={C.terracotta} opacity="0.9" />
    {/* sol */}
    <g className="spin-slow" style={{ transformOrigin: '1130px 300px' }}>
      {Array.from({ length: 24 }, (_, i) => (
        <path key={i} d="M1130 300 L1118 90 L1142 90Z" fill={C.ochre} opacity="0.35" transform={`rotate(${i * 15} 1130 300)`} />
      ))}
    </g>
    <circle cx="1130" cy="300" r="190" fill={C.ochre} opacity="0.28" />
    <circle cx="1130" cy="300" r="150" fill={C.ochre} />
    <circle cx="1130" cy="300" r="118" fill={C.ochreLight} />
    <path d="M1060 250 C 1090 215 1150 210 1185 238 C 1150 232 1100 240 1060 250Z" fill="#FFFFFF" opacity="0.35" />
    </g>
  </>
);

/* ───────── Camada 1: guarás-vermelhos ───────── */
export const BirdsLayer: React.FC = () => (
  <>
    <g transform={T}>
    <g className="drift-a"><Bird x={900} y={190} s={1.1} /></g>
    <g className="drift-b"><Bird x={1010} y={120} s={0.8} /></g>
    <g className="drift-a"><Bird x={1330} y={170} s={1.0} c={C.red} /></g>
    <g className="drift-b"><Bird x={1450} y={250} s={0.7} /></g>
    <g className="drift-a"><Bird x={760} y={290} s={0.6} /></g>
    </g>
  </>
);

/* ───────── Camada 2: dunas ao fundo, mar, saveiro e farol ───────── */
export const FarLayer: React.FC = () => (
  <>
    <g transform={T}>
    <path d="M-2600 650 L-60 610 C 140 540, 340 520, 540 575 C 720 625, 880 598, 1050 548 C 1240 495, 1430 510, 1680 585 L1680 1600 L-2600 1600Z" fill={C.dune1} />
    {/* mar com ondas */}
    <path d="M980 560 C 1100 530, 1300 520, 1680 540 L1680 640 C 1450 625, 1200 640, 980 600Z" fill={C.blue} />
    <path d="M1030 575 C 1120 560, 1260 556, 1420 566 M1120 600 C 1240 590, 1380 590, 1560 600" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round" strokeDasharray="22 16" />
    {/* farol */}
    <g transform="translate(1530 560)">
      <path d="M-14 0 L-9 -96 L9 -96 L14 0Z" fill={C.cream} />
      <path d="M-12 -32 L-10.5 -52 L10.5 -52 L12 -32Z M-9.5 -72 L-9 -88 L9 -88 L9.5 -72Z" fill={C.red} />
      <rect x="-12" y="-110" width="24" height="14" fill={C.navy} />
      <path d="M-12 -110 L0 -128 L12 -110Z" fill={C.terracotta} />
      <circle cx="0" cy="-103" r="4" fill={C.ochreLight} />
    </g>
    {/* saveiro */}
    <g transform="translate(1260 565)"><g className="bob">
      <path d="M-70 0 C -40 22, 40 22, 76 -4 L 68 -10 L -64 -10Z" fill={C.navy} />
      <path d="M-4 -12 L -4 -150" stroke={C.navy} strokeWidth="4" />
      <path d="M0 -146 C 52 -110, 62 -62, 64 -16 L 0 -16Z" fill={C.terracotta} />
      <path d="M-8 -130 C -44 -100, -56 -60, -58 -16 L -8 -16Z" fill={C.cream} />
      <path d="M0 -146 L 18 -152 L 0 -158Z" fill={C.red} />
    </g></g>
    </g>
  </>
);

/* ───────── Camada 3: casario colonial com azulejos e igreja ───────── */
type House = { x: number; w: number; h: number; base: string; tiled?: boolean; roof?: string; trim?: string };
const HOUSES: House[] = [
  { x: 676, w: 132, h: 250, base: C.ochre, roof: C.terracottaDark, trim: C.cream },
  { x: 808, w: 124, h: 300, base: C.blueDark, tiled: true, roof: C.terracotta, trim: C.cream },
  { x: 1166, w: 134, h: 292, base: C.terracotta, roof: C.terracottaDark, trim: C.cream },
  { x: 1300, w: 126, h: 240, base: C.cream, tiled: true, roof: C.terracotta, trim: C.blueDark },
  { x: 1426, w: 128, h: 270, base: C.sage, roof: C.terracottaDark, trim: C.cream }
];
const GROUND = 705;

const Window: React.FC<{ x: number; y: number; w: number; h: number; trim: string; balcony?: boolean }> = ({ x, y, w, h, trim, balcony }) => (
  <g>
    <path d={`M${x - 4} ${y + h} L${x - 4} ${y + w / 2} A${(w + 8) / 2} ${(w + 8) / 2} 0 0 1 ${x + w + 4} ${y + w / 2} L${x + w + 4} ${y + h}Z`} fill={trim} />
    <path d={`M${x} ${y + h} L${x} ${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} L${x + w} ${y + h}Z`} fill={C.navy} />
    <path d={`M${x + w / 2} ${y + 2} L${x + w / 2} ${y + h}`} stroke={trim} strokeWidth="2" opacity="0.6" />
    {balcony && (
      <g stroke={C.navyDeep} strokeWidth="2.5">
        <path d={`M${x - 8} ${y + h - 18} H${x + w + 8}`} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M${x - 6 + i * ((w + 12) / 5)} ${y + h - 18} V${y + h + 2}`} />
        ))}
        <path d={`M${x - 10} ${y + h + 2} H${x + w + 10}`} strokeWidth="4" />
      </g>
    )}
  </g>
);

const HouseShape: React.FC<{ d: House }> = ({ d }) => {
  const top = GROUND - d.h;
  const floors = d.h >= 280 ? 3 : 2;
  const fh = (d.h - 74) / floors;
  const ww = 28;
  return (
    <g>
      <rect x={d.x} y={top} width={d.w} height={d.h} fill={d.tiled && d.base !== C.cream ? C.cream : d.base} />
      {d.tiled && <rect x={d.x} y={top} width={d.w} height={d.h} fill="url(#azPat)" />}
      <rect x={d.x} y={top} width={6} height={d.h} fill="#000" opacity="0.08" />
      {/* beiral e telhado */}
      <path d={`M${d.x - 8} ${top} L${d.x + d.w + 8} ${top} L${d.x + d.w - 8} ${top - 40} L${d.x + 8} ${top - 40}Z`} fill={d.roof} />
      <path d={`M${d.x - 8} ${top} h${d.w + 16} v10 h-${d.w + 16}Z`} fill={d.trim} />
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M${d.x + 10 + i * (d.w / 5)} ${top - 38} L${d.x + 4 + i * (d.w / 5)} ${top}`} stroke="#000" opacity="0.18" strokeWidth="2" />
      ))}
      {/* janelas */}
      {Array.from({ length: floors }, (_, f) => {
        const y = top + 22 + f * fh;
        return [0, 1].map((c) => (
          <Window key={`${f}-${c}`} x={d.x + 20 + c * (d.w - 40 - ww)} y={y} w={ww} h={fh - 26} trim={d.trim!} balcony={f > 0 || floors === 2} />
        ));
      })}
      {/* porta */}
      <path d={`M${d.x + d.w / 2 - 15} ${GROUND} V${GROUND - 46} A15 15 0 0 1 ${d.x + d.w / 2 + 15} ${GROUND - 46} V${GROUND}Z`} fill={C.navyDeep} />
    </g>
  );
};

export const TownLayer: React.FC = () => (
  <>
    <g transform={T}>
    <defs>
      <pattern id="azPat" width="34" height="34" patternUnits="userSpaceOnUse">
        <rect width="34" height="34" fill="#F4EFEA" />
        <path d="M17 2 L32 17 L17 32 L2 17Z" fill="none" stroke={C.blue} strokeWidth="2.5" />
        <circle cx="17" cy="17" r="5" fill={C.blue} />
        <circle cx="0" cy="0" r="6" fill={C.blueDark} opacity="0.85" />
        <circle cx="34" cy="0" r="6" fill={C.blueDark} opacity="0.85" />
        <circle cx="0" cy="34" r="6" fill={C.blueDark} opacity="0.85" />
        <circle cx="34" cy="34" r="6" fill={C.blueDark} opacity="0.85" />
      </pattern>
    </defs>
    {/* igreja de duas torres ao fundo */}
    <g>
      <rect x="936" y="458" width="228" height="250" fill={C.cream} />
      <path d="M926 458 L1050 392 L1174 458Z" fill={C.sand} />
      <circle cx="1050" cy="448" r="16" fill={C.navy} /><circle cx="1050" cy="448" r="9" fill={C.blueLight} />
      {[940, 1124].map((x) => (
        <g key={x}>
          <rect x={x} y="372" width="48" height="340" fill={C.cream} />
          <rect x={x - 4} y="372" width="56" height="10" fill={C.sand} />
          <path d={`M${x} 372 Q ${x + 24} 316 ${x + 48} 372Z`} fill={C.ochre} />
          <path d={`M${x + 24} 322 V300 M${x + 16} 309 H${x + 32}`} stroke={C.navy} strokeWidth="3" />
          <path d={`M${x + 12} 440 V418 A12 12 0 0 1 ${x + 36} 418 V440Z`} fill={C.navy} />
          <path d={`M${x + 12} 520 V500 A12 12 0 0 1 ${x + 36} 500 V520Z`} fill={C.navy} />
        </g>
      ))}
      <path d="M1022 708 V600 A28 28 0 0 1 1078 600 V708Z" fill={C.terracottaDark} />
      <path d="M1050 600 V708" stroke={C.cream} strokeWidth="2" opacity="0.6" />
    </g>
    {HOUSES.map((h) => (
      <HouseShape key={h.x} d={h} />
    ))}
    </g>
  </>
);

/* ───────── Camada 4: dunas da frente com lagoas (Lençóis) ───────── */
export const NearLayer: React.FC = () => (
  <>
    <g transform={T}>
    <path d="M-2600 740 L-60 700 C 200 640, 420 650, 640 690 C 860 730, 1060 700, 1250 664 C 1420 632, 1560 650, 1680 676 L1680 1600 L-2600 1600Z" fill={C.dune2} />
    {[[760, 706, 120], [1010, 724, 190], [1380, 696, 120]].map(([x, y, rx], i) => (
      <g key={i}>
        <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.1} fill={C.blue} />
        <ellipse cx={x + 12} cy={y - 2} rx={rx * 0.72} ry={rx * 0.05} fill={C.blueLight} />
      </g>
    ))}
    <path d="M60 760 C 220 730, 360 744, 520 770 M700 790 C 880 760, 1020 780, 1200 800 M1260 740 C 1400 722, 1500 736, 1620 756" stroke={C.dune3} strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M-2600 840 L-60 800 C 240 760, 520 790, 760 820 C 1000 850, 1300 820, 1680 800 L1680 1600 L-2600 1600Z" fill={C.dune3} opacity="0.75" />
    </g>
  </>
);

/* ───────── Camada 5: palmeiras ───────── */
export const PalmsLayer: React.FC = () => (
  <>
    <g transform={T}>
      <g className="sway-b"><Palm x={1250} y={730} s={0.95} h={290} flip /></g>
      <g className="sway"><Palm x={1130} y={742} s={0.7} h={220} /></g>
    </g>
  </>
);

/* ───────── Camada 6: azulejos soltos e bandeirinhas ───────── */
const Tile: React.FC<{ x: number; y: number; s: number; r: number }> = ({ x, y, s, r }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x="-60" y="-60" width="120" height="120" rx="8" fill={C.cream} stroke={C.blueDark} strokeWidth="5" />
    <path d="M0 -48 L48 0 L0 48 L-48 0Z" fill={C.blue} />
    <path d="M0 -30 L30 0 L0 30 L-30 0Z" fill={C.cream} />
    <circle r="14" fill={C.terracotta} />
    <circle r="6" fill={C.cream} />
    {[[-42, -42], [42, -42], [-42, 42], [42, 42]].map(([cx, cy]) => (
      <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="9" fill={C.blueDark} />
    ))}
  </g>
);

export const TilesLayer: React.FC = () => {
  const pennants = Array.from({ length: 16 }, (_, i) => i);
  const cols = [C.red, C.blue, C.ochre, C.cream, C.sage, C.terracotta];
  const pt = (t: number) => {
    const x0 = 820, y0 = 36, x1 = 1640, y1 = 150, cx = 1200, cy = 140;
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    return [x, y];
  };
  return (
    <>
    <g transform={T}>
      <path d="M820 36 Q 1200 140 1640 150" stroke={C.navy} strokeWidth="2.5" fill="none" opacity="0.7" />
      {pennants.map((i) => {
        const [x, y] = pt((i + 0.5) / pennants.length);
        return <path key={i} d={`M${x - 14} ${y} L${x + 14} ${y} L${x} ${y + 36}Z`} fill={cols[i % cols.length]} stroke={C.navy} strokeWidth="1" strokeOpacity="0.25" />;
      })}
      <g className="bob"><Tile x={730} y={410} s={0.8} r={-14} /></g>
      <g className="bob-b"><Tile x={1020} y={150} s={0.55} r={10} /></g>
    </g>
    </>
  );
};

/* ───────── Camada 7: bumba meu boi e tambor de crioula ───────── */
export const FigureLayer: React.FC = () => {
  const fringe = Array.from({ length: 18 }, (_, i) => i);
  return (
    <>
    <g transform={T}>
      <ellipse cx="1100" cy="880" rx="330" ry="20" fill={C.navy} opacity="0.18" />
      {/* ── boi ── */}
      <g>
        <path d="M 960 690 C 975 575 1090 520 1190 545 C 1280 568 1332 650 1338 760 L 1344 884 L 942 884 C 960 824 955 750 960 690 Z" fill="#0F2438" />
        <path d="M 978 700 C 992 600 1092 548 1186 566 C 1264 584 1308 656 1314 760" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 13" opacity="0.85" />
        <rect x="942" y="838" width="402" height="30" fill={C.terracotta} />
        <rect x="942" y="846" width="402" height="6" fill={C.ochre} />
        {fringe.map((i) => (
          <path key={i} d={`M${944 + i * 22.3} 868 L${944 + i * 22.3 + 22} 868 L${944 + i * 22.3 + 11} 896Z`} fill={i % 2 ? C.ochre : C.red} />
        ))}
        <Flower x={1018} y={728} r={30} petal={C.red} center={C.ochre} />
        <Flower x={1098} y={640} r={32} petal={C.ochre} center={C.red} />
        <Flower x={1198} y={648} r={27} petal={C.red} center={C.cream} />
        <Flower x={1134} y={756} r={34} petal={C.blue} center={C.ochreLight} />
        <Flower x={1256} y={744} r={28} petal={C.red} center={C.ochre} />
        <Flower x={1046} y={812} r={22} petal={C.ochre} center={C.terracotta} />
        <Flower x={1216} y={818} r={24} petal={C.cream} center={C.red} />
        <Flower x={1312} y={668} r={20} petal={C.ochre} center={C.red} />
        {/* cabeça */}
        <path d="M 905 650 C 858 612 888 553 955 558 C 1016 563 1048 615 1032 670 C 1020 718 968 762 926 750 C 892 740 905 692 905 650 Z" fill={C.navyDeep} />
        <path d="M 1004 592 C 1030 558 1074 562 1086 584 C 1058 584 1030 598 1004 592Z" fill={C.navyDeep} />
        <path d="M 1018 588 C 1034 574 1056 574 1068 582 C 1050 584 1034 590 1018 588Z" fill={C.ochre} />
        <path d="M 940 572 C 904 542 878 500 888 448 C 914 490 952 520 976 562 Z" fill={C.cream} stroke={C.sand} strokeWidth="2" />
        <path d="M 888 448 C 886 470 890 490 898 506 C 894 486 892 466 888 448Z" fill={C.ochre} />
        <path d="M 1010 566 C 1020 518 1052 484 1102 468 C 1082 504 1070 536 1050 576 Z" fill={C.cream} stroke={C.sand} strokeWidth="2" />
        <polygon points={star(985, 618, 21)} fill="#FFFFFF" />
        <ellipse cx="938" cy="662" rx="12" ry="8.5" fill={C.cream} />
        <circle cx="936" cy="663" r="4.2" fill={C.navy} />
        <path d="M924 650 Q 938 642 952 652" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
        <ellipse cx="918" cy="736" rx="12" ry="6" fill="#1D3550" />
        <path d="M 928 712 Q 950 722 972 706" stroke="#1D3550" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* fitas */}
        <g className="sway-fast" style={{ transformOrigin: '895px 452px' }}>
          <path d="M895 452 C 846 520 886 604 850 700" stroke={C.red} strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M898 456 C 872 530 908 612 884 716" stroke={C.ochre} strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M902 460 C 900 540 930 620 916 728" stroke={C.blue} strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M906 462 C 926 530 954 600 950 690" stroke={C.cream} strokeWidth="8" fill="none" strokeLinecap="round" />
        </g>
        <g className="sway-fast-b" style={{ transformOrigin: '1100px 470px' }}>
          <path d="M1100 470 C 1166 486 1220 450 1276 392" stroke={C.red} strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M1100 474 C 1176 504 1244 476 1296 430" stroke={C.sage} strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M1098 478 C 1170 520 1250 508 1318 470" stroke={C.ochre} strokeWidth="8" fill="none" strokeLinecap="round" />
        </g>
      </g>
      {/* ── dançarina do tambor de crioula ── */}
      <g className="sway-b">
        <g>
          {Array.from({ length: 9 }, (_, i) => <circle key={`a${i}`} cx={1296 + i * 39.5} cy={868} r={21} fill={C.blueDark} />)}
          <path d="M 1276 868 C 1276 806 1350 760 1450 760 C 1550 760 1624 806 1624 868 Z" fill={C.blueDark} />
          {Array.from({ length: 8 }, (_, i) => <circle key={`b${i}`} cx={1322 + i * 38.4} cy={832} r={19} fill={C.cream} />)}
          <path d="M 1304 832 C 1308 782 1370 744 1450 744 C 1530 744 1592 782 1596 832 Z" fill={C.cream} />
          {Array.from({ length: 8 }, (_, i) => <circle key={`c${i}`} cx={1352 + i * 35.5} cy={794} r={17} fill={C.red} />)}
          <path d="M 1336 794 C 1346 750 1396 726 1450 726 C 1504 726 1554 750 1564 794 Z" fill={C.red} />
          <path d="M1380 760 Q 1450 780 1520 760" stroke={C.cream} strokeWidth="3" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
        </g>
        <path d="M 1410 642 C 1414 614 1486 614 1490 642 L 1500 742 L 1400 742 Z" fill={C.cream} />
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={1410 + i * 16} cy={644} r={12} fill={C.cream} stroke={C.sand} strokeWidth="2" />)}
        <path d="M1430 604 H1470 V630 H1430Z" fill={C.skin} />
        <path d="M1428 650 C 1380 690 1346 730 1322 792" stroke={C.skin} strokeWidth="17" fill="none" strokeLinecap="round" />
        <path d="M1472 650 C 1520 690 1556 730 1580 792" stroke={C.skin} strokeWidth="17" fill="none" strokeLinecap="round" />
        <circle cx="1320" cy="796" r="10" fill={C.skin} /><circle cx="1583" cy="796" r="10" fill={C.skin} />
        <circle cx="1450" cy="584" r="31" fill={C.skin} />
        <path d="M 1418 584 C 1414 544 1486 540 1484 584 C 1472 560 1430 560 1418 584Z" fill={C.hair} />
        <circle cx="1422" cy="600" r="8" fill="none" stroke={C.ochre} strokeWidth="3" />
        <Flower x={1480} y={556} r={18} petal={C.red} center={C.ochre} />
        <path d="M1440 598 Q1450 606 1460 598" stroke="#2A140B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </g>
    </>
  );
};

/* ───────── Camada 8: primeiro plano (folhagem, flor e confete de azulejo) ───────── */
export const ForeLayer: React.FC = () => {
  const conf = [
    [780, 420, 12, C.red], [1180, 90, 10, C.blue], [1400, 300, 14, C.ochre], [990, 480, 9, C.terracotta],
    [1560, 520, 12, C.sage], [700, 560, 14, C.blue], [1260, 470, 9, C.red], [880, 120, 11, C.terracotta],
    [1320, 200, 8, C.blue], [1600, 360, 10, C.red], [610, 330, 9, C.ochre], [1090, 560, 8, C.sage]
  ] as const;
  return (
    <>
    <g transform={T}>
      <path d="M-2600 900 L-60 868 C 260 836, 560 860, 820 880 C 1100 900, 1400 880, 1680 860 L1680 1600 L-2600 1600Z" fill={C.dune2} />
      <path d="M-2600 920 L-60 892 C 300 870, 640 890, 900 904 C 1180 918, 1440 900, 1680 888 L1680 1600 L-2600 1600Z" fill={C.dune3} />
      {/* hibisco à direita */}
      <g transform="translate(1536 872)">
        <path d="M-70 40 C -40 -10 -10 -20 30 -40 C 10 0 0 20 -10 40Z" fill={C.sageDark} />
        <path d="M-60 -2 C -30 -40 -10 -50 30 -66 C 14 -30 8 -10 -2 8Z" fill={C.sage} />
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d="M0 0 C 18 -22 46 -26 58 -4 C 46 14 20 14 0 0Z" fill={C.red} transform={`rotate(${a - 20})`} />
        ))}
        <circle r="9" fill={C.ochre} />
        <path d="M0 0 L 34 -30" stroke={C.ochre} strokeWidth="4" strokeLinecap="round" />
      </g>
      {conf.map(([x, y, s, c], i) => (
        <path key={i} className={i % 2 ? 'drift-a' : 'drift-b'} d={`M${x} ${y - s} L${x + s} ${y} L${x} ${y + s} L${x - s} ${y}Z`} fill={c} opacity="0.95" />
      ))}
    </g>
    </>
  );
};
