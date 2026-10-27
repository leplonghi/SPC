/**
 * Composição da cena em camadas, no quadro de 1600 x 900.
 * Cada elemento é uma imagem separada (public/cena/<id>.webp), posicionada pelo centro (cx) e pela base (by),
 * com a largura (w) no quadro. "z" é a ordem de profundidade (0 = mais ao fundo).
 * Os nomes (label) são só descrições neutras do que a imagem mostra, sem informação histórica.
 * Elementos que ainda não foram entregues em public/cena/manifest.json simplesmente não aparecem.
 */
export type Motion = 'none' | 'sway' | 'bob' | 'drift';

export interface ElementSpec {
  id: string;
  label: string;
  z: number;
  cx: number;
  by: number;
  w: number;
  motion?: Motion;
  /** 'full' = cobre o quadro inteiro (céu, confete) */
  full?: boolean;
  /** inclinação em graus (cartões de foto) */
  rot?: number;
  /** desenha como foto emoldurada (borda branca, sombra) */
  photo?: boolean;
  /** posição do foco da imagem quando ela cobre o quadro */
  focus?: string;
}

export const CANVAS = { w: 1600, h: 900 };
/** Recorte para celulares: mostra só o miolo da composição. */
export const CROP_WIDE = { x: 0, y: 0, w: 1600, h: 900 };
export const CROP_PHONE = { x: 760, y: 70, w: 850, h: 830 };

export const ELEMENT_LAYOUT: ElementSpec[] = [
  { id: 'ceu', label: 'Céu e sol', z: 0, cx: 800, by: 900, w: 1600, full: true },
  { id: 'guaras', label: 'Guarás em voo', z: 1, cx: 1090, by: 250, w: 360, motion: 'drift' },
  { id: 'dunas', label: 'Dunas e lagoas', z: 2, cx: 900, by: 790, w: 1750 },
  { id: 'farol', label: 'Farol', z: 3, cx: 1410, by: 620, w: 150 },
  { id: 'saveiro', label: 'Saveiro', z: 3, cx: 1240, by: 650, w: 250, motion: 'bob' },
  { id: 'igreja', label: 'Igreja de duas torres', z: 4, cx: 1020, by: 700, w: 240 },
  { id: 'casarao-b', label: 'Casarão com azulejos (B)', z: 5, cx: 870, by: 720, w: 190 },
  { id: 'casarao-a', label: 'Casarão com azulejos (A)', z: 5, cx: 1190, by: 725, w: 300 },
  { id: 'palmeira-b', label: 'Palmeira de babaçu', z: 6, cx: 770, by: 850, w: 190, motion: 'sway' },
  { id: 'palmeira-a', label: 'Palmeira de babaçu', z: 7, cx: 1510, by: 840, w: 230, motion: 'sway' },
  { id: 'chao', label: 'Chão de pedra', z: 8, cx: 800, by: 915, w: 1750 },
  { id: 'azulejos', label: 'Painel de azulejos', z: 8, cx: 1310, by: 870, w: 190 },
  { id: 'tambores', label: 'Tambores', z: 9, cx: 1085, by: 880, w: 250 },
  { id: 'dancarina', label: 'Dançarina de tambor de crioula', z: 10, cx: 930, by: 890, w: 270 },
  { id: 'boi', label: 'Bumba meu boi', z: 10, cx: 1230, by: 890, w: 500 },
  { id: 'bandeirinhas', label: 'Bandeirinhas de festa', z: 11, cx: 1050, by: 190, w: 1200, motion: 'sway' },
  { id: 'hibisco', label: 'Hibisco', z: 12, cx: 1500, by: 910, w: 220, motion: 'sway' },
  { id: 'confete', label: 'Confete', z: 13, cx: 800, by: 900, w: 1600, full: true, motion: 'drift' }
];

/**
 * Cena de fotos reais do acervo, usada enquanto não houver a arte por elemento (public/cena/manifest.json).
 * Cada foto é uma camada em profundidade. Os nomes são só descrições neutras do que a foto mostra.
 */
export interface PhotoSpec extends ElementSpec { file: string; iw: number; ih: number }
export const PHOTO_ELEMENTS: PhotoSpec[] = [
  { id: 'telhados', label: 'Telhados do casario', z: 0, cx: 800, by: 900, w: 1600, full: true, focus: '50% 62%', file: 'telhados.webp', iw: 2200, ih: 2933 },
  { id: 'balcao', label: 'Vista de um balcão', z: 1, cx: 1210, by: 280, w: 400, rot: -2.5, photo: true, file: 'balcao.webp', iw: 1024, ih: 485 },
  { id: 'aerea', label: 'Vista aérea', z: 2, cx: 1010, by: 400, w: 380, rot: 2, photo: true, file: 'aerea.webp', iw: 1024, ih: 571 },
  { id: 'avenida', label: 'Avenida Pedro II (foto antiga)', z: 3, cx: 1440, by: 470, w: 310, rot: 3, photo: true, file: 'avenida.webp', iw: 1024, ih: 640 },
  { id: 'casario', label: 'Casario e rua enfeitada', z: 4, cx: 1190, by: 600, w: 420, rot: -2, photo: true, file: 'casario.webp', iw: 1024, ih: 536 },
  { id: 'azulejos', label: 'Azulejos e pintura mural', z: 5, cx: 1450, by: 740, w: 330, rot: -3.5, photo: true, file: 'azulejos.webp', iw: 1024, ih: 768 },
  { id: 'boi', label: 'Festa popular', z: 6, cx: 1030, by: 740, w: 450, rot: 2, photo: true, file: 'boi.webp', iw: 1024, ih: 576 },
  { id: 'casarao', label: 'Casarão', z: 7, cx: 1290, by: 870, w: 330, rot: 1.5, photo: true, file: 'casarao.webp', iw: 1024, ih: 901 },
  { id: 'rua-noite', label: 'Rua de pedra', z: 8, cx: 1530, by: 890, w: 170, rot: 4, photo: true, file: 'rua-noite.webp', iw: 576, ih: 1024 }
];
