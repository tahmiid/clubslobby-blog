# Composes the four FC 27 article feature images on EA's official FC 27 key
# art (Mbappé over The Grounds), each carrying its own biggest keyword in the
# largest type that fits.
#
# Why this differs from make-spoke-feats.py: the FC 26 key art is dark purple,
# so a glyph dropped on it reads immediately. The FC 27 art is bright daylight
# with the subject dead centre top-to-bottom, so every one of these needs a
# bottom scrim to carry white type at all — without it the words sit on sky
# and pale stonework and disappear.
#
# The Grounds cover uses an actual Grounds screenshot rather than the key art:
# EA's own 1:1 Easter-egg render of the cage pitch, centre-cropped to 16:9.
#
# Fonts come from the app repo beside this one, same convention as this
# script's sibling reaching into frontend/public/assets/playstyles.
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'assets')
FONTS = os.path.expanduser('~/Desktop/Claude/ClubsUI-main/backend/app/assets/fonts')
KEY_ART = os.path.join(ASSETS, 'EAS_FC27_KeyArt_16-9_1920.jpg')
GROUNDS_SHOT = os.path.join(ASSETS, 'EA_FC27_Grounds_BalloonKickabout.jpg')

W, H = 1920, 1080
MARGIN = 96

TEXT = (242, 243, 247)
TEAL = (45, 226, 197)
GREEN = (47, 210, 107)
RED = (217, 84, 47)
MUTED = (154, 160, 174)


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, f'{name}.ttf'), size)


def fit(name, text, target_w, cap=340):
    """Largest size at which `text` still fits `target_w`. Binary search rather
    than a loop of +1s because the range is wide and truetype metrics are not
    linear in size."""
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
    mask = grad.resize((W, H))
    dark = Image.new('RGB', (W, H), (4, 4, 10))
    return Image.composite(dark, img, mask)


def base(path, crop_square=False, blur=0, veil=0.0):
    img = Image.open(path).convert('RGB')
    if crop_square:
        # 1:1 source -> 16:9: keep the middle band, which is where the pitch
        # and the crowd are.
        w, h = img.size
        keep = int(w * 9 / 16)
        img = img.crop((0, (h - keep) // 2, w, (h - keep) // 2 + keep))
    img = img.resize((W, H), Image.LANCZOS)
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(blur))
    if veil:
        # A flat darkening across the whole frame, for covers whose type does
        # not sit in one band and therefore cannot rely on the bottom scrim.
        img = Image.blend(img, Image.new('RGB', (W, H), (4, 4, 10)), veil)
    return img


def keyword_cover(out, word, eyebrow='EA SPORTS FC 27', src=None, crop_square=False):
    """The masteries/amps/grounds treatment: one word, as large as the canvas
    allows, over a scrimmed photo."""
    img = scrim(base(src or KEY_ART, crop_square))
    d = ImageDraw.Draw(img)

    eb = font('manrope-700', 34)
    big = fit('archivo-800', word, W - MARGIN * 2)
    # Anchor from the bottom so the word always clears the edge by MARGIN,
    # whatever size it settled at.
    bbox = d.textbbox((0, 0), word, font=big)
    word_h = bbox[3] - bbox[1]
    wy = H - MARGIN - word_h - bbox[1]
    tracked(d, (MARGIN, wy - 60), eyebrow, eb, TEAL, 6)
    d.text((MARGIN, wy), word, font=big, fill=TEXT)

    img.save(out, quality=86, optimize=True, progressive=True)
    print(f'  {os.path.basename(out)}  "{word}" at {big.size}px')


def platforms_cover(out):
    """Not a console-rivalry cover. The research notes say The Grounds and the
    new Clubs are PS5 / Series X|S / PC / Switch 2 only, and old-gen is not
    mentioned anywhere — so the cover answers the question people actually
    search: does my old console run it."""
    # The subject stands dead centre through the full height, and this cover
    # has type at three different heights - a bottom scrim cannot save any of
    # them. So the art becomes texture: blurred and veiled, Mbappé reads as a
    # shape rather than competing with the words. Learned by rendering it the
    # other way first, where "NOT SUPPORTED" collided with his shoulder and
    # the struck-through row crossed a white shirt.
    img = base(KEY_ART, blur=9, veil=0.62)
    d = ImageDraw.Draw(img)

    eb = font('manrope-700', 34)
    tracked(d, (MARGIN, 150), 'EA SPORTS FC 27 CLUBS', eb, TEAL, 6)

    head = font('archivo-800', 92)
    row = font('archivo-800', 62)
    label = font('manrope-700', 30)

    y = 250
    d.text((MARGIN, y), 'NOT SUPPORTED', font=head, fill=RED)
    y += 118
    old = 'PS4   ·   XBOX ONE   ·   SWITCH'
    d.text((MARGIN, y), old, font=row, fill=(196, 200, 210))
    # Struck through: the whole point of the row.
    ow = d.textlength(old, font=row)
    d.line([(MARGIN - 8, y + 42), (MARGIN + ow + 8, y + 42)], fill=RED, width=7)

    y += 168
    d.text((MARGIN, y), 'SUPPORTED', font=head, fill=GREEN)
    y += 118
    d.text((MARGIN, y), 'PS5   ·   SERIES X|S   ·   PC   ·   SWITCH 2', font=row, fill=TEXT)

    d.text((MARGIN, H - MARGIN - 34), 'The Grounds is new-gen only', font=label, fill=MUTED)

    img.save(out, quality=86, optimize=True, progressive=True)
    print(f'  {os.path.basename(out)}  old-gen struck through')


STADIUM_SHOT = os.path.join(ASSETS, 'EA_FC27_Grounds_Bernabeu.jpg')
FLAG_SHOT = os.path.join(ASSETS, 'EA_FC27_Grounds_Atletico.jpg')

# name -> (word, source, crop_square). One or two words only: the whole point
# is that it is legible as a thumbnail on a phone, and three words forces the
# type down to a size that defeats it.
#
# Backgrounds are mostly the key art on purpose - the 13 spoke pages already
# establish that a shared background reads as a series. It varies only where
# a different official asset is *thematically* earned: a stadium for
# tournaments, and the Atlético flag draped over a building for objectives -
# club colours flown in public is what "earn fans and Club reputation" looks
# like. I argued against the flag first, on the grounds that the crest
# dominates the frame; the user's call was that it is the more interesting
# image, and at thumbnail size the colour block is what carries it.
COVERS = [
    ('masteries', 'MASTERIES', None, False),
    ('amps', 'AMPS', None, False),
    ('grounds', 'THE GROUNDS', GROUNDS_SHOT, True),
    ('archetypes', 'ARCHETYPES', None, False),
    ('tournaments', 'TOURNAMENTS', STADIUM_SHOT, True),
    ('objectives', 'OBJECTIVES', FLAG_SHOT, True),
]


if __name__ == '__main__':
    for name, word, src, sq in COVERS:
        keyword_cover(os.path.join(ASSETS, f'feat-fc27-{name}.jpg'), word,
                      src=src, crop_square=sq)
    platforms_cover(os.path.join(ASSETS, 'feat-fc27-platforms.jpg'))
