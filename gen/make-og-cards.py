# The app's static share images: a real screenshot of the page (assets/og-raw,
# from gen/make-og-shots.mjs) with the same FC 27 lockup the blog covers wear
# — a teal tracked EA SPORTS FC 27 eyebrow and one keyword — over a scrim at
# the foot, so the UI stays the picture. 1200x630, the Open Graph size.
import os

from PIL import Image, ImageDraw, ImageFilter

from coverkit import TEAL, TEXT, font, tracked

ROOT = os.path.join(os.path.dirname(__file__), '..')
RAW = os.path.join(ROOT, 'assets', 'og-raw')
OUT = os.path.join(ROOT, 'assets', 'og')
W, H = 1200, 630
MARGIN = 56
EYEBROW = 'EA SPORTS FC 27'

# name -> keyword (one or two words, the way the covers do it)
# A card may name a FOCUS box (1x page coordinates): that region is scaled to
# the strip's height and centred over a blurred, darkened copy of the whole
# shot. The meta page's pitch is a portrait object on the left of a wide
# page; cropped and centred it is the picture, and the chip row above the
# boards (the season's admin label) falls outside the frame.
CARDS = [
    ('builder', 'BUILDER'),
    ('builds', 'BUILDS'),
    ('meta', 'META', (44, 36, 476, 476)),
    ('level-rewards', 'LEVEL 40'),
    ('controls', 'CONTROLS'),
    ('skill-moves', 'SKILL MOVES'),
    ('celebrations', 'CELEBRATIONS'),
]


BAND = 150          # the lockup's own strip at the foot: never over the UI
SHOT_H = H - BAND    # 480px of page above it


def focused(raw, box):
    """The focus box scaled to the strip height, centred over a blurred backdrop."""
    rw, rh = raw.size
    k = rw / W                     # raw is the page at k× (2 in practice)
    x0, y0, x1, y1 = [int(v * k) for v in box]
    obj = raw.crop((x0, y0, x1, y1))
    oh = SHOT_H - 24
    ow = int(obj.size[0] * oh / obj.size[1])
    obj = obj.resize((ow, oh), Image.LANCZOS)
    back = raw.resize((W, int(rh / k)), Image.LANCZOS).crop((0, 0, W, SHOT_H))
    back = back.filter(ImageFilter.GaussianBlur(14))
    back = Image.blend(back, Image.new('RGB', back.size, (4, 4, 10)), 0.45)
    back.paste(obj, ((W - ow) // 2, 12))
    return back


def card(name, word, focus=None, size=78):
    """The page in the top strip (cropped from the top of the raw shot at the
    same width, so nothing is squashed), the lockup in a solid strip below —
    the text never covers a row, a card or a slider."""
    src = os.path.join(RAW, f'{name}.png')
    raw = Image.open(src).convert('RGB')
    rw, rh = raw.size
    scale = W / rw
    shot = focused(raw, focus) if focus else raw.resize((W, int(rh * scale)), Image.LANCZOS).crop((0, 0, W, SHOT_H))
    img = Image.new('RGB', (W, H), (4, 4, 10))
    img.paste(shot, (0, 0))
    # a short fade where the page meets the strip, so the cut reads as a cut
    fade = Image.new('L', (W, 28), 0)
    fd = ImageDraw.Draw(fade)
    for y in range(28):
        fd.line([(0, y), (W, y)], fill=int(255 * (y / 27) ** 1.4))
    img.paste(Image.new('RGB', (W, 28), (4, 4, 10)), (0, SHOT_H - 28), fade)
    d = ImageDraw.Draw(img)
    d.line([(0, SHOT_H), (W, SHOT_H)], fill=(45, 226, 197), width=2)
    big = font('archivo-800', size)
    bbox = d.textbbox((0, 0), word, font=big)
    wh = bbox[3] - bbox[1]
    wy = SHOT_H + (BAND - wh) // 2 + 10 - bbox[1]
    tracked(d, (MARGIN, SHOT_H + 22), EYEBROW, font('manrope-700', 22), TEAL, 5)
    d.text((MARGIN, wy), word, font=big, fill=TEXT)
    out = os.path.join(OUT, f'og-{name}.jpg')
    img.save(out, quality=88, optimize=True, progressive=True)
    print(f'  og-{name}.jpg  "{word}"  {os.path.getsize(out) // 1024} KB')
    return out


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for spec in CARDS:
        name, word, focus = (spec + (None,))[:3]
        if os.path.exists(os.path.join(RAW, f'{name}.png')):
            card(name, word, focus)
        else:
            print(f'  (no raw shot for {name})')
