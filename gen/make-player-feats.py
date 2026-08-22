# Feature covers for the player-build pages (a72-a86) and the AcceleRATE
# calculator (a87) - made AHEAD of publish so flipping the drafts live is one
# command, not an art session.
#
# Same machinery and same series logic as make-missing-feats.py: coverkit's
# scrim over one shared background (the FC 27 key art - a shared background is
# what makes a set read as a series, and fifteen player pages are a series),
# the player's surname in the largest type that fits. One or two words only -
# the phone-thumbnail rule.
#
# The eyebrow says PRO CLUBS BUILD rather than EA SPORTS FC 27: these pages
# are evergreen across releases, and the year would date the art the day the
# cover cache made it permanent.
#
# Assignment happens at publish via set-feature-images.mjs MAP + install on
# the box (the Ghost upload API is broken for images - CLAUDE.md).
import os

from coverkit import keyword_cover

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'assets')
# The FC 27 key art features Mbappé - a named player's face under a
# DIFFERENT player's name is the one mismatch every reader notices (the
# first render of this file put MESSI over it). So the series background is
# a Grounds scene: official, atmospheric, nobody's face. Two exceptions
# where the art IS the player: van Dijk's own key art, and Mbappé keeps the
# FC 27 art he actually fronts.
SERIES_ART = os.path.join(ASSETS, 'EA_FC27_Grounds_Bernabeu.jpg')
ACCEL_ART = os.path.join(ASSETS, 'EA_FC27_Grounds_Atletico.jpg')
SPECIAL = {
    'player-van-dijk': os.path.join(ASSETS, 'FC26_VanDijk_16x9.jpg'),
    'player-mbappe': os.path.join(ASSETS, 'EAS_FC27_KeyArt_16-9_1920.jpg'),
    'accelerate': ACCEL_ART,
}

# (output name, word, ghost slug)
COVERS = [
    ('player-ronaldinho',      'RONALDINHO',  'ronaldinho-pro-clubs-build'),
    ('player-haaland',         'HAALAND',     'haaland-pro-clubs-build'),
    ('player-zidane',          'ZIDANE',      'zidane-pro-clubs-build'),
    ('player-usain-bolt',      'USAIN BOLT',  'usain-bolt-pro-clubs-build'),
    ('player-cristiano',       'CRISTIANO',   'cristiano-ronaldo-pro-clubs-build'),
    ('player-messi',           'MESSI',       'messi-pro-clubs-build'),
    ('player-neymar',          'NEYMAR',      'neymar-pro-clubs-build'),
    ('player-mbappe',          'MBAPPÉ',      'mbappe-pro-clubs-build'),
    ('player-salah',           'SALAH',       'salah-pro-clubs-build'),
    ('player-van-dijk',        'VAN DIJK',    'van-dijk-pro-clubs-build'),
    ('player-isak',            'ISAK',        'isak-pro-clubs-build'),
    ('player-henry',           'HENRY',       'thierry-henry-pro-clubs-build'),
    ('player-maradona',        'MARADONA',    'maradona-pro-clubs-build'),
    ('player-yamal',           'YAMAL',       'lamine-yamal-pro-clubs-build'),
    ('player-bellingham',      'BELLINGHAM',  'bellingham-pro-clubs-build'),
    ('accelerate',             'LENGTHY',     'lengthy-vs-controlled-vs-explosive'),
]

if __name__ == '__main__':
    for name, word, _slug in COVERS:
        src = SPECIAL.get(name, SERIES_ART)
        keyword_cover(os.path.join(ASSETS, f'feat-{name}.jpg'), word, src,
                      eyebrow='PRO CLUBS BUILD' if name != 'accelerate' else 'FC 26 ACCELERATE')
    print(f'\n{len(COVERS)} covers -> assets/feat-player-*.jpg (+accelerate)')
