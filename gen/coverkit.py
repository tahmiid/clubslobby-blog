# Shared machinery for the photo-plus-one-word feature covers.
#
# Extracted from make-fc27-feats.py once the same treatment was wanted for the
# 13 archetype spoke pages: a piece of official EA art, a bottom scrim, a teal
# eyebrow, and the article's keyword in the largest type the canvas allows.
#
# Fonts come from the app repo beside this one, the same cross-repo convention
# make-spoke-feats.py uses to reach its PlayStyle glyphs.
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONTS = os.path.expanduser('~/Desktop/Claude/ClubsUI-main/backend/app/assets/fonts')

W, H = 1920, 1080
MARGIN = 96

TEXT = (242, 243, 247)
TEAL = (45, 226, 197)
GREEN = (47, 210, 107)
RED = (217, 84, 47)
MUTED = (154, 160, 174)
BASE = (4, 4, 10)


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, f'{name}.ttf'), size)


def fit(name, text, target_w, cap=340):
    """Largest size at which `text` still fits `target_w`. Binary search rather
    than a loop of +1s because the range is wide and truetype metrics are not
    linear in size.

    `cap` matters: without it a short word like AMPS would scale until its
    *width* filled the canvas and its height overran it."""
    lo, hi, best = 12, cap, 12
    while lo <= hi:
        mid = (lo + hi) // 2
        f = font(name, mid)
        if ImageDraw.Draw(Image.new('RGB', (1, 1))).textlength(text, font=f) <= target_w:
            best, lo = mid, mid + 1
        else:
            hi = mid - 1
    return font(name, best)


def tracked(draw, xy, text, f, fill, tracking):
    """Letter-spaced text. Pillow has no tracking, so the eyebrow is drawn a
    character at a time."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=f, fill=fill)
        x += draw.textlength(ch, font=f) + tracking
    return x


def scrim(img, start=0.42, strength=0.94):
    """Bottom-up darkening, so type reads on whatever the photo is doing.
    Ramps from transparent at `start` of the height to `strength` at the
    bottom, matching the app background's own bottom weighting."""
    grad = Image.new('L', (1, H), 0)
    px = grad.load()
    for y in range(H):
        t = (y / H - start) / (1 - start)
        px[0, y] = 0 if t <= 0 else int(255 * strength * (t ** 1.35))
    return Image.composite(Image.new('RGB', (W, H), BASE), img, grad.resize((W, H)))


def base(path, crop_square=False, blur=0, veil=0.0):
    img = Image.open(path).convert('RGB')
    if crop_square:
        # 1:1 source -> 16:9: keep the middle band, which is where the subject
        # of EA's square renders sits.
        w, h = img.size
        keep = int(w * 9 / 16)
        img = img.crop((0, (h - keep) // 2, w, (h - keep) // 2 + keep))
    img = img.resize((W, H), Image.LANCZOS)
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(blur))
    if veil:
        # A flat darkening across the whole frame, for covers whose type does
        # not sit in one band and therefore cannot rely on the bottom scrim.
        img = Image.blend(img, Image.new('RGB', (W, H), BASE), veil)
    return img


def keyword_cover(out, word, src, eyebrow='EA SPORTS FC 27', crop_square=False,
                  quality=86):
    """One word, as large as the canvas allows, over a scrimmed photo.

    One or two words only. The type is sized to fill the width, so word count
    is what sets how big it renders - a third word drops it under ~150px,
    which is where it stops working as a phone thumbnail.
    """
    img = scrim(base(src, crop_square))
    d = ImageDraw.Draw(img)

    big = fit('archivo-800', word, W - MARGIN * 2)
    # Anchor from the bottom so the word always clears the edge by MARGIN,
    # whatever size it settled at.
    bbox = d.textbbox((0, 0), word, font=big)
    wy = H - MARGIN - (bbox[3] - bbox[1]) - bbox[1]
    tracked(d, (MARGIN, wy - 60), eyebrow, font('manrope-700', 34), TEAL, 6)
    d.text((MARGIN, wy), word, font=big, fill=TEXT)

    img.save(out, quality=quality, optimize=True, progressive=True)
    print(f'  {os.path.basename(out):34} "{word}" at {big.size}px')
