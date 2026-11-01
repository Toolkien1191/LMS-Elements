#!/usr/bin/env python3
"""Build sensus-et-affectus.html: one self-contained file, no outside requests.

    pip install pillow
    python3 build.py [images_dir] [output.html]

images_dir defaults to ./images and must hold the 16 PNGs named after the
Latin word (amor.png, gaudium.png, ... zelotypia.png). Each image is scaled to
800 px wide, saved as WebP and pasted in as base64, together with the fonts in
./fonts, content.js and app.js.
"""
import base64, io, json, re, sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
WIDTH = 800
QUALITY = 82


def band_fraction(img):
    """Height of the plain cream band at the bottom, as a fraction of the image.

    Walks up from the bottom while rows stay close to the band colour and flat.
    Falls back to 0.2 (the bottom fifth) if the result looks implausible."""
    small = img.convert('RGB').resize((100, 200))
    px = small.load()
    w, h = small.size

    def row(y):
        vals = [px[x, y] for x in range(4, w - 4)]
        mean = tuple(sum(v[i] for v in vals) / len(vals) for i in range(3))
        dev = max(max(abs(v[i] - mean[i]) for i in range(3)) for v in vals)
        return mean, dev

    ref, _ = row(h - 3)
    y = h - 3
    while y > 0:
        mean, dev = row(y - 1)
        if dev > 28 or max(abs(mean[i] - ref[i]) for i in range(3)) > 18:
            break
        y -= 1
    frac = (h - y) / h
    return round(frac, 3) if 0.12 <= frac <= 0.3 else 0.2


def encode(path):
    img = Image.open(path)
    img.load()
    band = band_fraction(img)
    if img.mode not in ('RGB', 'RGBA'):
        img = img.convert('RGBA' if 'A' in img.getbands() else 'RGB')
    if img.width > WIDTH:
        img = img.resize((WIDTH, round(img.height * WIDTH / img.width)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, 'WEBP', quality=QUALITY, method=6)
    data = buf.getvalue()
    return {
        'src': 'data:image/webp;base64,' + base64.b64encode(data).decode(),
        'w': img.width, 'h': img.height, 'band': band,
    }, len(data)


def main():
    images = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / 'images'
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else HERE / 'sensus-et-affectus.html'

    content = (HERE / 'content.js').read_text(encoding='utf-8')
    names = re.findall(r"\{ la: '([a-z]+)'", content)
    missing = [n for n in names if not (images / f'{n}.png').exists()]
    if missing:
        sys.exit(f'missing images in {images}: ' + ', '.join(f'{n}.png' for n in missing))

    imgs, total = {}, 0
    for n in names:
        imgs[n], size = encode(images / f'{n}.png')
        total += size
        print(f'  {n:<11} {imgs[n]["w"]}x{imgs[n]["h"]}  band {imgs[n]["band"]:.3f}  {size // 1024} KB')

    html = (HERE / 'shell.html').read_text(encoding='utf-8')

    def font(m):
        data = (HERE / m.group(1)).read_bytes()
        return "url('data:font/woff2;base64," + base64.b64encode(data).decode() + "')"
    html = re.sub(r"url\('(fonts/[^']+\.woff2)'\)", font, html)

    js_safe = lambda s: s.replace('</script', '<\\/script')
    html = html.replace('<!--IMAGES-->', '<script>const IMAGES = ' + json.dumps(imgs) + ';</script>')
    html = html.replace('<script src="content.js"></script>', '<script>\n' + js_safe(content) + '</script>')
    html = html.replace('<script src="app.js"></script>',
                        '<script>\n' + js_safe((HERE / 'app.js').read_text(encoding='utf-8')) + '</script>')
    assert 'src="' not in re.sub(r'src="(data:|\$\{)', '', html), 'external reference left in output'

    out.write_text(html, encoding='utf-8')
    print(f'images {total // 1024} KB, page {out.stat().st_size // 1024} KB -> {out}')


if __name__ == '__main__':
    main()
