"""Derive badge variants of the stick glyphs — the disc and its letter, no rim.

The right-stick flick icon puts the stick in the corner of the arrow. At that
size the outer rim is most of what you see and the letter inside it is not.

Each set draws that rim differently, which is why a single regex only ever
fixed one of them:
  · colour/ps      a stroked <circle class="st1"> at r=242
  · mono/ps        a donut <path>: full-canvas outer edge with an inner cutout
  · mono/xbox      the same donut shape, a thinner rim
  · colour/xbox    likewise

So this removes both forms: the stroked circle, and any path that is a
full-canvas ring (starts at the canvas edge and carries a second subpath, which
is the hole). The pack's own files are never modified — these are extra assets.
"""
import os, re

ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'controls')
RING_CIRCLE = re.compile(r'<circle[^>]*class="st1"[^>]*/>')
SHAPE = re.compile(r'<path[^>]*\sd="([^"]+)"[^>]*/>')

def is_full_canvas_ring(d):
    """A donut: begins at the canvas edge (250,0) and has a second subpath."""
    return d.startswith('M250,0') and d.count('M250,') >= 2

made = 0
for st in ('mono', 'colour'):
    for pl in ('ps', 'xbox'):
        for tok in ('l', 'r'):
            src = os.path.join(ROOT, st, pl, f'{tok}.svg')
            if not os.path.exists(src):
                continue
            s = open(src).read()
            s, n_c = RING_CIRCLE.subn('', s)
            n_p = 0
            for m in list(SHAPE.finditer(s)):
                if is_full_canvas_ring(m.group(1)):
                    s = s.replace(m.group(0), '', 1); n_p += 1
            open(os.path.join(ROOT, st, pl, f'{tok}-badge.svg'), 'w').write(s)
            made += 1
            print(f'  {st}/{pl}/{tok}-badge.svg   circle:{n_c} ring-path:{n_p}')
print(f'\n{made} badge glyphs')
