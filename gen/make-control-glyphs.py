"""Button glyphs for the skill-move pages.

**These did not exist.** The skill articles wrote inputs as text — "Hold L2 +
▢ or ◯ + ✕" — which is unreadable at a glance and looks nothing like the game.
There was no glyph set anywhere in either repo to reach for, so this draws one.

Original geometry, not copied artwork: circles, rounded rectangles and arrows
with the platforms' own letters. The colours are the authentic ones (PlayStation
face symbols, Xbox ABXY) because that is what makes the row scan as a controller
rather than as a legend — the whole point of the change.

SVG rather than PNG: these render inline in a sentence at ~19px and inside a
table at ~17px, and they must stay crisp on a phone at 3x. Each file is under a
kilobyte. Hosted on our own domain and referenced by <img>, exactly as the
archetype icons are (gen/common.mjs archIcon) — never inlined, because a skill
page carries dozens of them and inlining is what put the tier list at 164KB.
"""
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'controls')
os.makedirs(OUT, exist_ok=True)

DARK   = '#15151f'   # button body, sits on the article's dark card
STROKE = '#3a3a4c'   # rim, so the glyph has an edge on any background
LABEL  = '#e8eaf0'   # shoulder/stick lettering

# Authentic symbol colours. This is the bit that makes it read as the game.
PS = {'triangle': '#4ce0b3', 'circle': '#f0616e', 'cross': '#7aa7ff', 'square': '#e589d8'}
XB = {'y': '#f2c94c', 'b': '#eb5757', 'a': '#5fc97a', 'x': '#56a0f0'}

def wrap(inner, w=64):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} 64" '
            f'width="{w}" height="64" fill="none">{inner}</svg>')

def disc(inner, colour):
    return wrap(f'<circle cx="32" cy="32" r="29" fill="{DARK}" stroke="{STROKE}" '
                f'stroke-width="2.5"/>{inner}')

def write(name, svg):
    with open(os.path.join(OUT, f'{name}.svg'), 'w') as f:
        f.write(svg)

# ── PlayStation face buttons ───────────────────────────────────────────────
c = PS['triangle']
write('ps-triangle', disc(f'<path d="M32 17 L46 43 H18 Z" stroke="{c}" stroke-width="4" '
                          f'stroke-linejoin="round"/>', c))
c = PS['circle']
write('ps-circle', disc(f'<circle cx="32" cy="32" r="13" stroke="{c}" stroke-width="4"/>', c))
c = PS['cross']
write('ps-cross', disc(f'<path d="M22 22 L42 42 M42 22 L22 42" stroke="{c}" stroke-width="4" '
                       f'stroke-linecap="round"/>', c))
c = PS['square']
write('ps-square', disc(f'<rect x="20" y="20" width="24" height="24" rx="3" stroke="{c}" '
                        f'stroke-width="4"/>', c))

# ── Xbox face buttons ──────────────────────────────────────────────────────
for letter, colour in XB.items():
    write(f'xb-{letter}', disc(
        f'<text x="32" y="33" text-anchor="middle" dominant-baseline="central" '
        f'font-family="Helvetica,Arial,sans-serif" font-size="30" font-weight="700" '
        f'fill="{colour}">{letter.upper()}</text>', colour))

# ── Shoulders and triggers ─────────────────────────────────────────────────
# Wider canvas: two characters need the room, and a squeezed "LT" is illegible
# at 19px, which is the size these actually render at.
for name in ('L1', 'R1', 'L2', 'R2', 'LB', 'RB', 'LT', 'RT'):
    write(f'btn-{name.lower()}', wrap(
        f'<rect x="2" y="12" width="92" height="40" rx="13" fill="{DARK}" '
        f'stroke="{STROKE}" stroke-width="2.5"/>'
        f'<text x="48" y="33" text-anchor="middle" dominant-baseline="central" '
        f'font-family="Helvetica,Arial,sans-serif" font-size="25" font-weight="700" '
        f'fill="{LABEL}">{name}</text>', w=96))

# ── Sticks, one per direction ──────────────────────────────────────────────
# The dataset writes these as a letter plus an arrow ("R ↓"), so each
# combination is its own glyph and the parser never has to pair two tokens.
ARROW = {'up': 'M32 15 L32 34 M25 22 L32 15 L39 22',
         'down': 'M32 49 L32 30 M25 42 L32 49 L39 42',
         'left': 'M15 32 L34 32 M22 25 L15 32 L22 39',
         'right': 'M49 32 L30 32 M42 25 L49 32 L42 39'}
for stick in ('l', 'r'):
    for d, path in ARROW.items():
        write(f'stick-{stick}{d}', wrap(
            f'<circle cx="32" cy="32" r="29" fill="{DARK}" stroke="{STROKE}" stroke-width="2.5"/>'
            f'<path d="{path}" stroke="#2DE2C5" stroke-width="4" stroke-linecap="round" '
            f'stroke-linejoin="round"/>'
            f'<text x="32" y="52" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" '
            f'font-size="15" font-weight="700" fill="{LABEL}">{stick.upper()}</text>'))

n = len(os.listdir(OUT))
print(f'{n} glyphs -> assets/controls/')
