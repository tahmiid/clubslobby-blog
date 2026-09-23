# Covers for the FC 27 sweep (2026-09-23): the pages rebuilt from FC 26 to
# FC 27 had FC 26 art ("EA SPORTS FC 26" in the eyebrow) or the August
# Pillow-geometry set. Same treatment as every FC 27 cover: the FC 27 key art
# with one or two words in the largest type that fits (coverkit). A word the
# series already uses on this art for ANOTHER page (STRIKERS, DISRUPTOR...) is
# avoided so two pages never share a thumbnail.
import os
import sys

from coverkit import keyword_cover

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'assets')
KEY_ART = os.path.join(ASSETS, 'EAS_FC27_KeyArt_16-9_1920.jpg')

COVERS = [
    # the twelve archetype build pages
    ('build-magician', 'MAGICIAN'), ('build-shot-stopper', 'SHOT STOPPER'),
    ('build-sweeper-keeper', 'SWEEPER KEEPER'), ('build-progressor', 'PROGRESSOR'),
    ('build-boss', 'BOSS'), ('build-marauder', 'MARAUDER'), ('build-recycler', 'RECYCLER'),
    ('build-maestro', 'MAESTRO'), ('build-creator', 'CREATOR'), ('build-spark', 'SPARK'),
    ('build-finisher', 'FINISHER'), ('build-target', 'TARGET'),
    # tools and roundups rebuilt on FC 27 data
    ('tier-list', 'TIER LIST'), ('striker-archetypes', 'FORWARDS'),
    ('midfielder-archetypes', 'MIDFIELDERS'), ('defender-archetypes', 'BACK LINE'),
    ('goalkeeper-archetypes', 'GOALKEEPERS'), ('compared', 'CEILINGS'),
    ('quiz', 'ARCHETYPE QUIZ'), ('accelerate', 'ACCELERATE'),
    ('accelerate-calculator', 'CALCULATOR'), ('playstyles', 'PLAYSTYLES'),
    ('head-to-head', 'VERSUS'),
]

if __name__ == '__main__':
    only = set(sys.argv[1:])
    for stem, words in COVERS:
        if only and stem not in only:
            continue
        keyword_cover(os.path.join(ASSETS, f'feat-fc27-{stem}.jpg'), words, KEY_ART)
