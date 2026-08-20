"""The covers the FC 27 wave and the skill cluster shipped without.

Nineteen published articles had no feature image at all (audited 2026-08-20
against Ghost's own posts table, not against this repo). That is not cosmetic:
Google shows the feature image in results and Discover, and an article without
one competes with a hand tied behind it.

Same machinery and same rules as make-fc27-feats.py — coverkit's scrim, the
teal eyebrow, and the article's biggest keyword in the largest type that fits.
The keyword is cut to one or two words on purpose: the type is sized to fill
the width, so every extra word shrinks it, and under ~150px it stops working
as a phone thumbnail. "Giant Fake Shot" becomes FAKE SHOT for that reason,
not to be terse.

Background is the FC 27 key art throughout. That repetition is the point —
make-fc27-feats.py's own note says a shared background is what makes a set
read as a series, and thirteen skill how-tos are the most series-like thing
on the site.
"""
import os

from coverkit import keyword_cover

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'assets')
KEY_ART = os.path.join(ASSETS, 'EAS_FC27_KeyArt_16-9_1920.jpg')

# (output name, word, ghost slug, alt text)
COVERS = [
    ('fc27-all13',    'ALL 13',          'fc27-archetypes',
     'EA SPORTS FC 27 key art with ALL 13 across it'),
    ('fc27-specs',    'SPECIALIZATIONS', 'fc27-best-specializations',
     'EA SPORTS FC 27 key art with SPECIALIZATIONS across it'),
    ('fc27-controls', 'CONTROLS',        'fc27-control-changes',
     'EA SPORTS FC 27 key art with CONTROLS across it'),
    ('fc27-disruptor','DISRUPTOR',       'fc27-disruptor-build',
     'EA SPORTS FC 27 key art with DISRUPTOR across it'),
    ('fc27-level40',  'LEVEL 40',        'fc27-level-40-builds',
     'EA SPORTS FC 27 key art with LEVEL 40 across it'),
    ('fc27-skills',   'SKILL MOVES',     'fc27-new-skill-moves',
     'EA SPORTS FC 27 key art with SKILL MOVES across it'),
]

# The thirteen how-tos. Each keyword is the distinctive part of the move's
# name, not the whole name — see the module docstring.
MOVES = [
    ('giant-fake-shot',        'FAKE SHOT'),
    ('stop-and-go',            'STOP & GO'),
    ('drag-to-drag',           'DRAG TO DRAG'),
    ('foot-to-foot',           'FOOT TO FOOT'),
    ('lateral-heel-to-heel',   'HEEL TO HEEL'),
    ('drag-turn',              'DRAG TURN'),
    ('standing-scoop-turn',    'SCOOP TURN'),
    ('flair-roulette',         'ROULETTE'),
    ('four-touch-skill',       'FOUR TOUCH'),
    ('skilled-bridge',         'SKILLED BRIDGE'),
    ('first-time-spin',        'FIRST TIME SPIN'),
    ('alternate-elastico-chop','ELASTICO CHOP'),
    ('running-fake-drag',      'FAKE DRAG'),
]
for slug, word in MOVES:
    COVERS.append((f'skill-{slug}', word, f'fc27-how-to-{slug}',
                   f'EA SPORTS FC 27 key art with {word} across it'))

if __name__ == '__main__':
    for name, word, slug, _alt in COVERS:
        keyword_cover(os.path.join(ASSETS, f'feat-{name}.jpg'), word, KEY_ART)
    print(f'\n{len(COVERS)} covers -> assets/feat-*.jpg')
