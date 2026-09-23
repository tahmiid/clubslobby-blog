# The covers for the per-archetype stats pages (gen/archetype-stats.mjs,
# a193-a197) and the all-archetype AP-costs hub (a11, rewritten for FC 27 on
# 2026-09-23): the FC 27 key art with two words in the largest type that
# fits, the same treatment as the other FC 27 covers so the set reads as a
# series in search results and Discover. Two words, never three (coverkit).
#
# "<ARCHETYPE> STATS", not the archetype alone: the Disruptor build page
# already wears DISRUPTOR on this art, and two identical covers for two
# different pages would read as one page twice in a results list.
import os

from coverkit import keyword_cover

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'assets')
KEY_ART = os.path.join(ASSETS, 'EAS_FC27_KeyArt_16-9_1920.jpg')

# stem -> words
COVERS = [
    ('magician-stats', 'MAGICIAN STATS'),
    ('spark-stats', 'SPARK STATS'),
    ('finisher-stats', 'FINISHER STATS'),
    ('maestro-stats', 'MAESTRO STATS'),
    ('disruptor-stats', 'DISRUPTOR STATS'),
    ('ap-costs', 'AP COSTS'),
]

if __name__ == '__main__':
    for stem, words in COVERS:
        keyword_cover(os.path.join(ASSETS, f'feat-fc27-{stem}.jpg'), words, KEY_ART)
