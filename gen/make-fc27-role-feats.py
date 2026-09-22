# The five covers for the "best FC 27 builds by position" pages
# (gen/fc27-role-builds.mjs): the FC 27 key art carrying the position in the
# largest type that fits, the same treatment as the other FC 27 covers so the
# set reads as a series in search results and Discover. One word each.
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
]

if __name__ == '__main__':
    for stem, word in COVERS:
        keyword_cover(os.path.join(ASSETS, f'feat-fc27-{stem}.jpg'), word, KEY_ART)
