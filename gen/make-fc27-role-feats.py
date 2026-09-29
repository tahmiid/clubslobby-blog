# The covers for the "best FC 27 builds by position" pages
# (gen/fc27-role-builds.mjs): the FC 27 key art carrying the position in the
# largest type that fits, the same treatment as the other FC 27 covers so the
# set reads as a series in search results and Discover. One word each.
#
# The five single-position pages (2026-09-29) carry the abbreviation people
# type. A two- or three-letter word stops at coverkit's size cap instead of
# filling the width, which is what the cap is for.
import os

from coverkit import keyword_cover

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'assets')
KEY_ART = os.path.join(ASSETS, 'EAS_FC27_KeyArt_16-9_1920.jpg')

# stem -> word
COVERS = [
    ('strikers', 'STRIKERS'),
    ('wingers', 'WINGERS'),
    ('midfield', 'MIDFIELD'),
    ('defenders', 'DEFENDERS'),
    ('keepers', 'KEEPERS'),
    ('cdm', 'CDM'),
    ('cm', 'CM'),
    ('cam', 'CAM'),
    ('cb', 'CB'),
    ('fullbacks', 'FULL-BACKS'),
]

if __name__ == '__main__':
    import sys
    only = set(sys.argv[1:])
    for stem, word in COVERS:
        if only and stem not in only:
            continue
        keyword_cover(os.path.join(ASSETS, f'feat-fc27-{stem}.jpg'), word, KEY_ART)
