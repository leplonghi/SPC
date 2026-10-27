#!/usr/bin/env python3
"""
Prepara as imagens da cena a partir dos PNGs gerados no ChatGPT (fundo branco).

Uso:  python3 scripts/ingest_cena.py <pasta com os PNGs> [pasta de saída = public/cena]

Para cada arquivo (boi.png, igreja.png...):
  1. tira o fundo branco ligado às bordas (o branco DENTRO do desenho é preservado);
  2. limpa o halo branco da borda, devolvendo ao contorno a cor do próprio desenho;
  3. recorta a margem vazia e reduz para o tamanho de uso;
  4. grava .webp com transparência e atualiza manifest.json (id, arquivo, largura, altura).
Exceções: "ceu" fica retangular (é o fundo inteiro); "confete" é recortado mas não é aparado.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

MAX_SIDE = {'dunas': 1800, 'chao': 1800, 'bandeirinhas': 1600, 'confete': 1600, 'ceu': 1920}
DEFAULT_MAX = 1100
NO_TRIM = {'confete', 'ceu'}
NO_CUT = {'ceu'}
WHITE = 244  # acima disto em R, G e B conta como "fundo branco"


def cut_background(rgb: np.ndarray) -> np.ndarray:
    near_white = (rgb >= WHITE).all(axis=2)
    lab, n = ndi.label(near_white)
    border = np.unique(np.concatenate([lab[0, :], lab[-1, :], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, border[border != 0])
    bg = ndi.binary_dilation(bg, iterations=1) & near_white | bg  # pega a franja quase branca da borda
    fg = ~bg
    # borda suave: 1 px de transição
    alpha = ndi.gaussian_filter(fg.astype(np.float32), 0.8)
    alpha = np.clip((alpha - 0.15) / 0.7, 0, 1)
    # devolve ao contorno a cor do vizinho opaco mais próximo (tira o halo branco)
    solid = alpha > 0.98
    idx = ndi.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    rgb2 = rgb[idx[0], idx[1]]
    out = np.dstack([rgb2, (alpha * 255).astype(np.uint8)])
    return out.astype(np.uint8)


def process(path: Path, out_dir: Path):
    pid = path.stem.lower()
    im = Image.open(path).convert('RGBA')
    flat = Image.new('RGB', im.size, (255, 255, 255))
    flat.paste(im, mask=im.split()[3])
    rgb = np.array(flat)
    if pid in NO_CUT:
        out = Image.fromarray(rgb, 'RGB').convert('RGBA')
    else:
        out = Image.fromarray(cut_background(rgb), 'RGBA')
        if pid not in NO_TRIM:
            bbox = out.split()[3].point(lambda v: 255 if v > 8 else 0).getbbox()
            if bbox:
                pad = 4
                bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(out.width, bbox[2] + pad), min(out.height, bbox[3] + pad))
                out = out.crop(bbox)
    m = MAX_SIDE.get(pid, DEFAULT_MAX)
    if max(out.size) > m:
        k = m / max(out.size)
        out = out.resize((round(out.width * k), round(out.height * k)), Image.LANCZOS)
    dest = out_dir / f'{pid}.webp'
    out.save(dest, 'WEBP', quality=90, method=6)
    return {'id': pid, 'file': f'{pid}.webp', 'w': out.width, 'h': out.height, 'kb': round(dest.stat().st_size / 1024)}


def main():
    src = Path(sys.argv[1])
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parent.parent / 'public' / 'cena'
    out_dir.mkdir(parents=True, exist_ok=True)
    items = []
    for p in sorted(src.glob('*.png')):
        r = process(p, out_dir)
        print(f"{r['id']:14s} {r['w']}x{r['h']}  {r['kb']} KB")
        items.append({k: r[k] for k in ('id', 'file', 'w', 'h')})
    (out_dir / 'manifest.json').write_text(json.dumps({'elements': items}, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'{len(items)} elementos em {out_dir}')


if __name__ == '__main__':
    main()
