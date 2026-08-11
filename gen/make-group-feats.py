# Composes the five covers for the roundup set (a31-a35): the tier list and
# the four position pages. Same treatment and same art language as the spoke
# covers - the position stills say what the page is about, so a striker page
# looks like a striker page, at the cost of one more use per still (accepted;
# the user's bound is "no more than a few repeats").
#
# The tier list takes the FC 26 studio key art: five posed players is a
# lineup, which is what a tier list is. Like the finisher cover, the key art
# carries its own EA SPORTS FC 26 lockup, so the eyebrow is suppressed there.
# The Van Dijk still stays unused - rejected for this series on 2026-08-08 as
# a card promo, not gameplay.
import os

from coverkit import keyword_cover

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'assets')

EYEBROW = 'EA SPORTS FC 26'
KEY_ART = 'EAS_FC26_WGE_KeyArt_RGB_16-9_3840x2160.jpg'

# stem -> (word, art, eyebrow)
COVERS = [
    ('feat-a31', 'TIER LIST', KEY_ART, ''),
    ('feat-a32', 'STRIKERS', 'FC26_Zlatan_Archetype_16x9.jpg', EYEBROW),
    ('feat-a33', 'MIDFIELD', 'FC26_Musiala_Gameplay_16x9.jpg', EYEBROW),
    ('feat-a34', 'DEFENDERS', 'FC26_Defenders_16x9.jpg', EYEBROW),
    ('feat-a35', 'KEEPERS', 'FC26_Neuer_Gameplay_16x9.jpg', EYEBROW),
]

if __name__ == '__main__':
    for stem, word, art, eyebrow in COVERS:
        keyword_cover(os.path.join(ASSETS, f'{stem}.jpg'), word,
                      os.path.join(ASSETS, art), eyebrow=eyebrow)
