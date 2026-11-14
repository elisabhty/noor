"""Détoure la mascotte Noor et fabrique ses expressions.

Entrée  : assets/mascot/noor-source.png (l'image générée, fond sombre avec halo).
Sorties : assets/mascot/noor-{happy,calm,wow,sleepy}.png (fond transparent, sans halo)
          et assets/mascot/box.json (position de la lanterne dans l'image d'origine).

Le détourage utilise le modèle ISNet (rembg). Les expressions sont refaites à partir du visage
d'origine : yeux effacés puis redessinés (calme, endormie), yeux agrandis et bouche ronde (émerveillée).
Les positions du visage sont détectées dans l'image ; si la mascotte change beaucoup, revoir les seuils.

Dépendances : pip install onnxruntime opencv-python-headless scipy pillow
Modèle      : curl -L -o ~/.cache/noor/isnet-general-use.onnx \\
              https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx
Lancement   : python3 scripts/mascot/make_mascot.py   (depuis la racine du projet), puis npm run assets
"""
import json
import os
import sys

import cv2
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'assets', 'mascot', 'noor-source.png')
OUT = os.path.join(ROOT, 'assets', 'mascot')
MODEL = os.path.expanduser('~/.cache/noor/isnet-general-use.onnx')


def segment(rgb):
    """Masque alpha (0-1) de la lanterne, sans le halo."""
    if not os.path.exists(MODEL):
        sys.exit(f'Modèle manquant : {MODEL} (voir la commande curl en haut du fichier).')
    sess = ort.InferenceSession(MODEL, providers=['CPUExecutionProvider'])
    x = np.asarray(Image.fromarray(rgb).resize((1024, 1024), Image.Resampling.LANCZOS)).astype(np.float32)
    x = (x / max(x.max(), 1e-6) - 0.5).transpose(2, 0, 1)[None]
    pred = sess.run(None, {sess.get_inputs()[0].name: x})[0][0, 0]
    pred = (pred - pred.min()) / (pred.max() - pred.min())
    m = np.asarray(Image.fromarray((pred * 255).astype(np.uint8)).resize(rgb.shape[1::-1], Image.Resampling.LANCZOS)) / 255.0
    a = np.clip((m - 0.03) / 0.94, 0, 1)
    # Garde la lanterne seule (pas de petites taches isolées).
    lab, n = ndi.label(a > 0.5)
    sizes = ndi.sum(a > 0.5, lab, range(1, n + 1))
    keep = ndi.binary_dilation(lab == 1 + int(np.argmax(sizes)), iterations=6)
    return a * keep


def face_parts(bgr):
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(int)
    hue, val = hsv[..., 0] * 2, hsv[..., 2] / 255
    glass = (val > 0.72) & (hue >= 10) & (hue <= 70)
    lab, n = ndi.label(glass)
    sizes = ndi.sum(glass, lab, range(1, n + 1))
    region = ndi.binary_fill_holes(lab == 1 + int(np.argmax(sizes)))
    lab, n = ndi.label(region & (val < 0.62))
    parts = []
    for i in range(1, n + 1):
        m = lab == i
        if m.sum() < 300:
            continue
        ys, xs = np.nonzero(m)
        parts.append(dict(mask=ndi.binary_fill_holes(m), x0=xs.min(), x1=xs.max(), y0=ys.min(), y1=ys.max(), n=int(m.sum())))
    eyes = sorted([p for p in parts if p['n'] > 3000], key=lambda p: p['x0'])
    brows = sorted([p for p in parts if p['n'] < 1000 and p['y1'] < min(e['y0'] for e in eyes)], key=lambda p: p['x0'])
    mouth = [p for p in parts if 1000 <= p['n'] <= 3000 and p['y0'] > max(e['y0'] for e in eyes)][0]
    ink = tuple(int(c) for c in bgr[eyes[0]['mask'] & (val < 0.3)].mean(0))
    assert len(eyes) == 2 and len(brows) == 2, 'Visage non reconnu : revoir les seuils.'
    return eyes, brows, mouth, ink


def erase(img, masks, grow=7):
    """Efface des traits du visage en reconstituant le verre autour."""
    m = np.zeros(img.shape[:2], np.uint8)
    for mk in masks:
        m |= ndi.binary_dilation(mk, iterations=grow).astype(np.uint8)
    filled = cv2.inpaint(img, m * 255, 13, cv2.INPAINT_TELEA).astype(float)
    smooth = cv2.GaussianBlur(filled, (0, 0), 7)
    w = cv2.GaussianBlur(ndi.binary_dilation(m, iterations=4).astype(np.float32), (0, 0), 4)[..., None]
    return (filled * (1 - w) + smooth * w).astype(np.uint8)


def draw(img, ink, shapes, ss=4):
    """Dessine des traits lisses (arcs, lignes, ellipses) de la couleur du visage."""
    h, w = img.shape[:2]
    layer = Image.new('L', (w * ss, h * ss), 0)
    d = ImageDraw.Draw(layer)

    def dot(x, y, r):
        d.ellipse([ss * (x - r), ss * (y - r), ss * (x + r), ss * (y + r)], fill=255)

    for kind, args in shapes:
        if kind == 'arc':
            cx, cy, rx, ry, a0, a1, width = args
            d.arc([ss * (cx - rx), ss * (cy - ry), ss * (cx + rx), ss * (cy + ry)], a0, a1, fill=255, width=int(width * ss))
            for ang in (a0, a1):
                t = np.radians(ang)
                dot(cx + (rx - width / 2) * np.cos(t), cy + (ry - width / 2) * np.sin(t), width / 2)
        elif kind == 'line':
            x0, y0, x1, y1, width = args
            d.line([ss * x0, ss * y0, ss * x1, ss * y1], fill=255, width=int(width * ss))
            dot(x0, y0, width / 2)
            dot(x1, y1, width / 2)
        elif kind == 'ellipse':
            cx, cy, rx, ry = args
            d.ellipse([ss * (cx - rx), ss * (cy - ry), ss * (cx + rx), ss * (cy + ry)], fill=255)
    a = np.asarray(layer.resize((w, h), Image.Resampling.LANCZOS)).astype(float)[..., None] / 255
    return (img * (1 - a) + np.array(ink) * a).astype(np.uint8)


def paste(base, src, part, scale, dy):
    """Recopie un trait du visage d'origine, agrandi et/ou déplacé."""
    m = cv2.GaussianBlur(ndi.binary_dilation(part['mask'], iterations=3).astype(np.float32), (0, 0), 1.2)
    x0, y0, x1, y1 = part['x0'] - 8, part['y0'] - 8, part['x1'] + 9, part['y1'] + 9
    patch, pm = src[y0:y1, x0:x1], m[y0:y1, x0:x1]
    if scale != 1:
        size = (int(round(patch.shape[1] * scale)), int(round(patch.shape[0] * scale)))
        patch = cv2.resize(patch, size, interpolation=cv2.INTER_CUBIC)
        pm = cv2.resize(pm, size, interpolation=cv2.INTER_LINEAR)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2 + dy
    X0, Y0 = int(round(cx - patch.shape[1] / 2)), int(round(cy - patch.shape[0] / 2))
    roi = base[Y0:Y0 + patch.shape[0], X0:X0 + patch.shape[1]].astype(float)
    base[Y0:Y0 + patch.shape[0], X0:X0 + patch.shape[1]] = (roi * (1 - pm[..., None]) + patch * pm[..., None]).astype(np.uint8)


def main():
    bgr = cv2.imread(SRC)
    alpha = segment(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
    eyes, brows, mouth, ink = face_parts(bgr)
    center = lambda p: ((p['x0'] + p['x1']) / 2, (p['y0'] + p['y1']) / 2)
    (lx, ly), (rx, ry) = center(eyes[0]), center(eyes[1])
    ew = (eyes[0]['x1'] - eyes[0]['x0']) / 2
    mx, my = center(mouth)

    calm = erase(bgr, [e['mask'] for e in eyes])
    calm = draw(calm, ink, [('arc', (lx, ly - 2, ew * 0.78, 20, 20, 160, 10)), ('arc', (rx, ry - 2, ew * 0.78, 20, 20, 160, 10))])

    sleepy = erase(bgr, [e['mask'] for e in eyes] + [mouth['mask']])
    sleepy = draw(sleepy, ink, [('arc', (lx, ly + 4, ew * 0.74, 12, 15, 165, 9.5)), ('arc', (rx, ry + 4, ew * 0.74, 12, 15, 165, 9.5)),
                                ('line', (mx - 16, my - 2, mx + 16, my - 2, 9))])

    wow = erase(bgr, [e['mask'] for e in eyes] + [b['mask'] for b in brows] + [mouth['mask']], grow=8)
    for e in eyes:
        paste(wow, bgr, e, 1.16, -4)
    for b in brows:
        paste(wow, bgr, b, 1.0, -16)
    wow = draw(wow, ink, [('ellipse', (mx, my + 2, 17, 21))])

    ys, xs = np.nonzero(alpha > 0.02)
    pad = 12
    x0, x1, y0, y1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, bgr.shape[1]), max(ys.min() - pad, 0), min(ys.max() + pad + 1, bgr.shape[0])
    # Position de la lanterne dans l'image d'origine (sert à l'icône et à l'écran de lancement).
    with open(os.path.join(OUT, 'box.json'), 'w') as f:
        json.dump({'source': [int(bgr.shape[1]), int(bgr.shape[0])], 'box': [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1]}, f)
    a8 = (alpha * 255).round().astype(np.uint8)
    for name, img in (('happy', bgr), ('calm', calm), ('wow', wow), ('sleepy', sleepy)):
        rgba = np.dstack([cv2.cvtColor(img, cv2.COLOR_BGR2RGB), a8])[y0:y1, x0:x1]
        Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, f'noor-{name}.png'), optimize=True)
        print(f'noor-{name}.png', rgba.shape[1], 'x', rgba.shape[0])


if __name__ == '__main__':
    main()
