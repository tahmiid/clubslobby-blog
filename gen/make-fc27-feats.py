# Composes the seven FC 27 article feature images: official EA art carrying
# each article's biggest keyword in the largest type that fits.
#
# The shared machinery lives in coverkit.py, which make-spoke-covers.py uses
# too. What is specific to FC 27 is here: which art, which word, and the
# platforms cover, which is the one that does not follow the pattern.
import os

from coverkit import (GREEN, MARGIN, MUTED, RED, TEAL, TEXT, H,
                      base, font, keyword_cover, tracked)
from PIL import ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'assets')

KEY_ART = os.path.join(ASSETS, 'EAS_FC27_KeyArt_16-9_1920.jpg')
GROUNDS_SHOT = os.path.join(ASSETS, 'EA_FC27_Grounds_BalloonKickabout.jpg')
STADIUM_SHOT = os.path.join(ASSETS, 'EA_FC27_Grounds_Bernabeu.jpg')
FLAG_SHOT = os.path.join(ASSETS, 'EA_FC27_Grounds_Atletico.jpg')

EYEBROW = 'EA SPORTS FC 27'

# name -> (word, source, crop_square). One or two words only.
#
# Backgrounds are mostly the key art on purpose - the spoke pages already
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


def platforms_cover(out):
    """Not a console-rivalry cover. The research notes say The Grounds and the
    new Clubs are PS5 / Series X|S / PC / Switch 2 only, and old-gen is not
    mentioned anywhere - so the cover answers the question people actually
    search: does my old console run it.

    The subject stands dead centre through the full height, and this cover has
    type at three different heights, so a bottom scrim cannot save any of them.
    The art becomes texture instead: blurred and veiled. Learned by rendering
    it the other way first, where "NOT SUPPORTED" collided with Mbappé's
    shoulder and the struck-through row crossed a white shirt.
    """
    img = base(KEY_ART, blur=9, veil=0.62)
    d = ImageDraw.Draw(img)

    tracked(d, (MARGIN, 150), f'{EYEBROW} CLUBS', font('manrope-700', 34), TEAL, 6)

    head, row = font('archivo-800', 92), font('archivo-800', 62)

    y = 250
    d.text((MARGIN, y), 'NOT SUPPORTED', font=head, fill=RED)
    y += 118
    old = 'PS4   ·   XBOX ONE   ·   SWITCH'
    d.text((MARGIN, y), old, font=row, fill=(196, 200, 210))
    ow = d.textlength(old, font=row)
    d.line([(MARGIN - 8, y + 42), (MARGIN + ow + 8, y + 42)], fill=RED, width=7)

    y += 168
    d.text((MARGIN, y), 'SUPPORTED', font=head, fill=GREEN)
    y += 118
    d.text((MARGIN, y), 'PS5   ·   SERIES X|S   ·   PC   ·   SWITCH 2', font=row, fill=TEXT)
    d.text((MARGIN, H - MARGIN - 34), 'The Grounds is new-gen only',
           font=font('manrope-700', 30), fill=MUTED)

    img.save(out, quality=86, optimize=True, progressive=True)
    print(f'  {os.path.basename(out):34} old-gen struck through')


if __name__ == '__main__':
    for name, word, src, sq in COVERS:
        keyword_cover(os.path.join(ASSETS, f'feat-fc27-{name}.jpg'), word,
                      src or KEY_ART, eyebrow=EYEBROW, crop_square=sq)
    platforms_cover(os.path.join(ASSETS, 'feat-fc27-platforms.jpg'))
