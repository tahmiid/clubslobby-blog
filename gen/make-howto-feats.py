"""Feature images for the carried-over skill-move and celebration how-tos
(gen/fc27-howtos.mjs, 2026-09-14) — the same treatment as the thirteen new-move
pages in make-missing-feats.py: EA's official FC 27 key art, the teal eyebrow,
and the move's distinctive word in the largest type that fits.

The word comes from data/fc27-howtos.json (`cover`), which is where the page's
name and slug live too, so a page cannot ship without a cover word and a cover
cannot be composed for a page that does not exist. One or two words, three at
most where the name is three short ones (FIRST TIME SPIN set that precedent);
under ~150px the type stops working as a phone thumbnail.

    python3 gen/make-howto-feats.py            # all 80
    python3 gen/make-howto-feats.py knee-slide  # one slug

Output: assets/feat-howto-<slug>.jpg. Assignment is set-feature-images.mjs's
generated block (written by gen/fc27-howtos.mjs), run on the box.
"""
import json
import os
import sys

from coverkit import keyword_cover

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'assets')
KEY_ART = os.path.join(ASSETS, 'EAS_FC27_KeyArt_16-9_1920.jpg')

with open(os.path.join(ROOT, 'data', 'fc27-howtos.json'), encoding='utf-8') as f:
    D = json.load(f)

only = set(sys.argv[1:])
n = 0
for rec in D['skills'] + D['celebrations']:
    if only and rec['slug'] not in only:
        continue
    keyword_cover(os.path.join(ASSETS, f"feat-howto-{rec['slug']}.jpg"), rec['cover'], KEY_ART)
    n += 1
print(f'\n{n} covers -> assets/feat-howto-*.jpg')
