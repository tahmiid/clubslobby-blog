# Composes the 13 spoke feature images: EA's official FC 26 key art with the
# archetype's icon placed bottom-left — just the glyph, no badge, no text
# (user's call, third iteration). The clean art is also saved as
# feat-spokes.jpg for the in-body cover figure.
#
# macOS-only: icons rasterise through `qlmanage` (no SVG rasteriser in the
# toolchain). The SVGs are rendered AS-AUTHORED on qlmanage's white
# background; the glyph (#CCCCCC fills) is recovered by mapping darkness to
# alpha and recolouring white. Do NOT pre-process fills or inject background
# rects — that path was tried and qlmanage rendered the composite wrongly
# (a phantom filled block); the as-authored render is the reliable one.
# The artwork also only occupies part of each SVG canvas, so the recovered
# glyph is bbox-cropped before scaling.
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'assets')
KEY_ART = os.path.join(ASSETS, 'EAS_FC26_WGE_KeyArt_RGB_16-9_3840x2160.jpg')
# The app's official PlayStyle glyphs (70x70 light-grey on transparency) —
# the same files the articles hotlink from /assets/playstyles/. The app repo
# sits beside this one on the Mac this script runs on.
PS_ICONS = os.path.expanduser('~/Desktop/Claude/ClubsUI-main/frontend/public/assets/playstyles')
GOLD = (212, 175, 55)  # signature gold, matching the articles' chip colour

ARCHES = ['shot-stopper', 'sweeper-keeper', 'progressor', 'boss', 'engine', 'marauder',
          'recycler', 'maestro', 'creator', 'spark', 'magician', 'finisher', 'target']
SIGNATURE = {a['id']: a['signature']
             for a in json.load(open(os.path.join(ROOT, 'data', 'archetypes.json')))}

ICON_H = 270          # archetype glyph height on the 1920x1080 canvas
PS_H = 96             # signature PlayStyle glyph height
PS_GAP = 24           # between PlayStyle glyphs
PS_LEAD = 46          # between the archetype glyph and the first PlayStyle
MARGIN = 64           # from the bottom-left corner


def glyph(tmp, aid):
    """White-on-transparent glyph, cropped to its artwork, from the original SVG."""
    src = os.path.join(ASSETS, 'archetypes', f'{aid}.svg')
    r = subprocess.run(['qlmanage', '-t', '-s', '600', '-o', tmp, src], capture_output=True)
    png = os.path.join(tmp, f'{aid}.svg.png')
    if r.returncode or not os.path.exists(png):
        sys.exit(f'qlmanage failed for {aid}: {r.stderr.decode()[:200]}')
    im = Image.open(png).convert('L')
    # White bg (255) -> alpha 0; the #CCCCCC glyph (204) -> alpha 255;
    # antialiased edges in between scale linearly.
    a = im.point(lambda v: max(0, min(255, int((255 - v) * 255 / (255 - 204)))))
    out = Image.new('RGBA', im.size, (255, 255, 255, 0))
    out.putalpha(a)
    box = a.getbbox()
    if not box:
        sys.exit(f'{aid}: empty glyph')
    return out.crop(box)


def ps_gold(slug):
    """The app's PlayStyle badge recoloured signature-gold.

    The source PNGs are a near-white diamond plate with the pictogram drawn
    in opaque BLACK — not as transparency. A multiply tint therefore does
    exactly the right thing: the plate goes gold, the pictogram stays dark,
    antialiased edges scale in between, and the alpha channel is untouched.
    """
    from PIL import ImageChops
    im = Image.open(os.path.join(PS_ICONS, f'{slug}.png')).convert('RGBA')
    tinted = ImageChops.multiply(im.convert('RGB'), Image.new('RGB', im.size, GOLD))
    out = tinted.convert('RGBA')
    out.putalpha(im.getchannel('A'))
    return out.resize((round(im.width * PS_H / im.height), PS_H), Image.LANCZOS)


def main():
    art = Image.open(KEY_ART).resize((1920, 1080), Image.LANCZOS).convert('RGB')
    art.save(os.path.join(ASSETS, 'feat-spokes.jpg'), quality=84, optimize=True, progressive=True)
    with tempfile.TemporaryDirectory() as tmp:
        for aid in ARCHES:
            g = glyph(tmp, aid)
            g = g.resize((round(g.width * ICON_H / g.height), ICON_H), Image.LANCZOS)
            img = art.copy()
            x, y = MARGIN, 1080 - MARGIN - g.height
            # Everything drawn on one overlay so a single soft shadow carries
            # both the white glyph and the gold PlayStyles — no boxes, no lines.
            over = Image.new('RGBA', img.size, (0, 0, 0, 0))
            over.paste(g, (x, y), g)
            px = x + g.width + PS_LEAD
            py = y + (g.height - PS_H) // 2
            for slug in SIGNATURE[aid]:
                p = ps_gold(slug)
                over.paste(p, (px, py), p)
                px += p.width + PS_GAP
            sh = Image.new('RGBA', img.size, (0, 0, 0, 0))
            sh.paste(Image.new('RGBA', over.size, (10, 10, 20, 150)), (0, 0), over)
            sh = sh.filter(ImageFilter.GaussianBlur(10))
            img = Image.alpha_composite(img.convert('RGBA'), sh)
            img = Image.alpha_composite(img, over)
            out = os.path.join(ASSETS, f'feat-spoke-{aid}.jpg')
            img.convert('RGB').save(out, quality=84, optimize=True, progressive=True)
            print(f'{aid}: {os.path.getsize(out) // 1024}KB glyph {g.width}x{g.height} + {len(SIGNATURE[aid])} sig')


if __name__ == '__main__':
    main()
