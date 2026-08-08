# Composes the 13 archetype spoke covers: official EA SPORTS FC 26 in-game
# art with the archetype's name in the largest type that fits.
#
# Supersedes make-spoke-feats.py's badged covers (FC 26 key art with the
# archetype glyph bottom-left). Those used the studio key art - purple
# gradient, five posed players - on all thirteen, which read as dated next to
# the FC 27 set. That script still owns feat-spokes.jpg, the clean in-body
# cover figure, so it is not retired.
#
# The art is chosen by the archetype's POSITION, so a keeper article looks
# like a keeper article. Four backgrounds across thirteen covers, which is
# more variety than the FC 27 set has and is earned rather than decorative.
#
# Sources, all official EA: the Neuer, Musiala and Zlatan stills come from
# EA's own CDN (drop-assets.ea.com); the defenders still is EA's publisher
# screenshot from the Steam store listing. The FUT-featured Van Dijk image was
# tried for defenders and rejected - it is a card promo, not gameplay, and it
# broke the in-game feel the rest of the set has.
import json
import os

from coverkit import keyword_cover

ROOT = os.path.join(os.path.dirname(__file__), '..')
ASSETS = os.path.join(ROOT, 'assets')

EYEBROW = 'EA SPORTS FC 26'

ART_BY_POSITION = {
    'Keeper': 'FC26_Neuer_Gameplay_16x9.jpg',       # a diving save
    'Defender': 'FC26_Defenders_16x9.jpg',          # centre-backs shoulder to shoulder
    'Midfielder': 'FC26_Musiala_Gameplay_16x9.jpg',  # carrying through traffic
    'Forward': 'FC26_Zlatan_Archetype_16x9.jpg',    # EA's own filename says Archetype
}

# Per-archetype overrides, which beat the position default. Both are the
# user's calls after seeing the rendered set (2026-08-08):
#
# - magician takes the Musiala still even though the Magician is a forward.
#   Musiala carrying the ball through three defenders is what a Magician does,
#   and it separates it from the two other forwards.
# - finisher takes the FC 26 studio key art - the purple poster the rest of
#   this set was built to replace. Kept deliberately for one cover, where it
#   is a contrast rather than the whole series.
ART_OVERRIDE = {
    'magician': 'FC26_Musiala_Gameplay_16x9.jpg',
    'finisher': 'EAS_FC26_WGE_KeyArt_RGB_16-9_3840x2160.jpg',
}

# The studio key art carries its own EA SPORTS FC 26 lockup, so the eyebrow
# would print the same words twice, a few centimetres apart. Suppressed there
# and only there - every in-game still needs the eyebrow, having no branding
# of its own.
NO_EYEBROW = {'finisher'}


def main():
    archetypes = json.load(open(os.path.join(ROOT, 'data', 'archetypes.json')))
    for a in archetypes:
        art = ART_OVERRIDE.get(a['id']) or ART_BY_POSITION.get(a['position'])
        if not art:
            raise SystemExit(f"no art mapped for position {a['position']!r} ({a['id']})")
        # .upper() rather than trusting the snapshot: the app's catalog was
        # migrated to cased names (Clubs27 #70) and this file is a snapshot
        # that predates it. The cover wants caps either way.
        keyword_cover(os.path.join(ASSETS, f"feat-spoke-{a['id']}.jpg"),
                      a['name'].upper(), os.path.join(ASSETS, art),
                      eyebrow='' if a['id'] in NO_EYEBROW else EYEBROW)


if __name__ == '__main__':
    main()
