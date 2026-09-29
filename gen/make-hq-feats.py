# Covers for the 29 Sep 2026 batch that are not position pages:
#
#   feat-fc27-height-weight.jpg   the height and weight table (a203) - the
#                                 FC 27 key art, like every FC 27 data page
#   feat-hq-teammates.jpg         the lobby page (a204)
#   feat-hq-build-photo.jpg       build from a photo (a205)
#   feat-hq-app.jpg               the phone app (a206)
#
# The three feature pages are about OUR product, so their eyebrow says
# PRO CLUBS HQ, never EA SPORTS FC 27: an "EA SPORTS FC 27 / THE APP" cover
# would read as EA's own app. The app and build-photo covers sit on
# screenshots of the app itself (assets/og-raw, captured by
# gen/make-og-shots.mjs); the lobby cover sits on EA's render of a kickabout
# in The Grounds, the one piece of official art that shows people looking for
# a game. One or two words each (coverkit).
import os

from PIL import Image, ImageDraw

from coverkit import BASE, H, MARGIN, TEAL, TEXT, W, fit, font, keyword_cover, tracked

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'assets')
KEY_ART = os.path.join(ASSETS, 'EAS_FC27_KeyArt_16-9_1920.jpg')
RAW = os.path.join(ASSETS, 'og-raw')

# out, words, source, eyebrow, crop_square
COVERS = [
    ('feat-fc27-height-weight.jpg', 'HEIGHT + WEIGHT', KEY_ART, 'EA SPORTS FC 27', False),
    ('feat-hq-teammates.jpg', 'TEAMMATES', os.path.join(ASSETS, 'EA_FC27_Grounds_BalloonKickabout.jpg'), 'PRO CLUBS HQ', True),
    ('feat-hq-build-photo.jpg', 'PHOTO TO BUILD', os.path.join(RAW, 'builder.png'), 'PRO CLUBS HQ', False),
    ('feat-hq-app.jpg', 'THE APP', os.path.join(RAW, 'builds.png'), 'PRO CLUBS HQ', False),
]

def screenshot_cover(out, words, src, eyebrow):
    """A screenshot of the app above, the words in THEIR OWN STRIP below - the
    layout of the app's share images (gen/make-og-cards.py), which the owner
    approved on 22 Sep. keyword_cover's bottom scrim is made for a photo with
    one subject; a screenshot is small type from edge to edge, and a word laid
    over it fights every line behind it. Never blurred (owner, 25 Sep)."""
    strip = 400
    shot = Image.open(src).convert('RGB')
    w, h = shot.size
    shot = shot.resize((W, round(h * W / w)), Image.LANCZOS).crop((0, 0, W, H - strip))
    img = Image.new('RGB', (W, H), BASE)
    img.paste(shot, (0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle((0, H - strip, W, H - strip + 4), fill=TEAL)
    big = fit('archivo-800', words, W - MARGIN * 2, cap=230)
    bbox = d.textbbox((0, 0), words, font=big)
    wy = H - 70 - (bbox[3] - bbox[1]) - bbox[1]
    tracked(d, (MARGIN, H - strip + 46), eyebrow, font('manrope-700', 34), TEAL, 6)
    d.text((MARGIN, wy), words, font=big, fill=TEXT)
    img.save(out, quality=86, optimize=True, progressive=True)
    print(f'  {os.path.basename(out):34} "{words}" at {big.size}px')


if __name__ == '__main__':
    for out, words, src, eyebrow, square in COVERS:
        if not os.path.exists(src):
            raise SystemExit(f'missing source art: {src} (the og-raw shots come from gen/make-og-shots.mjs)')
        if src.startswith(RAW):
            screenshot_cover(os.path.join(ASSETS, out), words, src, eyebrow)
        else:
            keyword_cover(os.path.join(ASSETS, out), words, src, eyebrow=eyebrow, crop_square=square)
