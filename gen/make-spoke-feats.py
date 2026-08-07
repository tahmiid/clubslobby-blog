# Composes the 13 spoke feature images: EA's official FC 26 key art with the
# archetype's own icon badged bottom-left (feat-spoke-<id>.jpg). The clean art
# is also saved as feat-spokes.jpg for the in-body cover figure.
#
# macOS-only: there is no SVG rasteriser in the repo's toolchain, so the icons
# go through `qlmanage`. Each SVG is pre-processed to white-on-black and the
# thumbnail's luminance becomes the alpha mask (qlmanage output is opaque).
#
# Usage: python3 gen/make-spoke-feats.py   (writes into assets/)
import os
import re
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'assets')
KEY_ART = os.path.join(ASSETS, 'EAS_FC26_WGE_KeyArt_RGB_16-9_3840x2160.jpg')

ARCHES = ['shot-stopper', 'sweeper-keeper', 'progressor', 'boss', 'engine', 'marauder',
          'recycler', 'maestro', 'creator', 'spark', 'magician', 'finisher', 'target']


def rasterize_icons(tmp):
    for aid in ARCHES:
        svg = open(os.path.join(ASSETS, 'archetypes', f'{aid}.svg')).read()
        m = re.search(r'width="(\d+)" height="(\d+)"', svg)
        svg = svg.replace('fill="#CCCCCC"', 'fill="#FFFFFF"')
        svg = re.sub(r'(<svg[^>]*>)',
                     rf'\1<rect x="0" y="0" width="{m.group(1)}" height="{m.group(2)}" fill="#000000"/>',
                     svg, count=1)
        open(os.path.join(tmp, f'{aid}.svg'), 'w').write(svg)
    r = subprocess.run(['qlmanage', '-t', '-s', '500', '-o', tmp]
                       + [os.path.join(tmp, f'{a}.svg') for a in ARCHES], capture_output=True)
    if r.returncode:
        sys.exit(f'qlmanage failed: {r.stderr.decode()[:200]}')


def icon_white(tmp, aid):
    im = Image.open(os.path.join(tmp, f'{aid}.svg.png'))
    out = Image.new('RGBA', im.size, (255, 255, 255, 0))
    out.putalpha(im.convert('L'))  # luminance -> alpha
    return out


def main():
    art = Image.open(KEY_ART).resize((1920, 1080), Image.LANCZOS).convert('RGB')
    art.save(os.path.join(ASSETS, 'feat-spokes.jpg'), quality=84, optimize=True, progressive=True)
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 44, index=1)  # Bold
    with tempfile.TemporaryDirectory() as tmp:
        rasterize_icons(tmp)
        for aid in ARCHES:
            label = aid.replace('-', ' ').upper()
            img = art.copy()
            d = ImageDraw.Draw(img, 'RGBA')
            icon = icon_white(tmp, aid)
            icon.thumbnail((210, 210))  # no outline, bigger icon — user's call
            tw = d.textlength(label, font=font)
            bw = int(max(tw, icon.width) + 88)
            bh = 36 + 210 + 14 + 52 + 34
            bx, by = 56, 1080 - 56 - bh  # bottom-left: the one clean corner of the art
            d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=26, fill=(13, 13, 20, 216))
            ix = bx + (bw - icon.width) // 2
            img.paste(icon, (ix, by + 36), icon)
            d.text((bx + (bw - tw) // 2, by + 36 + 210 + 14), label, font=font, fill=(255, 255, 255, 255))
            out = os.path.join(ASSETS, f'feat-spoke-{aid}.jpg')
            img.save(out, quality=84, optimize=True, progressive=True)
            print(f'{aid}: {os.path.getsize(out) // 1024}KB')


if __name__ == '__main__':
    main()
