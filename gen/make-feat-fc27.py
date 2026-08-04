#!/usr/bin/env python3
"""Feature images for the FC 27 feature articles (a13-a17).

Same visual language as the existing feat-* set: the exact background navy is
sampled from feat-a5.png rather than hard-coded, so a Ghost card wall of old
and new posts reads as one series. All geometry, no text — titles belong to
Ghost's card layout, not the image.

Run:  python3 gen/make-feat-fc27.py
Out:  assets/feat-a13.png … feat-a17.png  (1200x630 each)
"""
import math
import os

from PIL import Image, ImageDraw

A = os.path.join(os.path.dirname(__file__), '..', 'assets')
W, H = 1200, 630

BG = Image.open(os.path.join(A, 'feat-a5.png')).convert('RGB').getpixel((5, 5))
FAINT = tuple(min(255, c + 24) for c in BG)      # the corner-arc line colour
LINE = tuple(min(255, c + 55) for c in BG)       # structural lines
BLUE = (37, 106, 191)                            # brand #256abf
BLUE_SOFT = (109, 167, 236)                      # brand light #6da7ec
INK = (232, 236, 242)                            # near-white marks


def canvas():
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    # Corner arcs, same as the existing set: big faint circles cut by the edge.
    d.ellipse([-160, -160, 180, 180], outline=FAINT, width=3)
    d.ellipse([W - 180, H - 180, W + 160, H + 160], outline=FAINT, width=3)
    return im, d


def ring(d, cx, cy, r, fill=None, outline=None, width=3):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=outline, width=width)


# a13 Masteries: 13 nodes on an orbit, every one wired into a single core —
# each archetype levelled feeds the same permanent centre.
im, d = canvas()
cx, cy, R = W // 2, H // 2, 218
ring(d, cx, cy, R, outline=LINE, width=3)
pts = []
for i in range(13):
    a = -math.pi / 2 + i * 2 * math.pi / 13
    pts.append((cx + R * math.cos(a), cy + R * math.sin(a)))
for x, y in pts:
    d.line([x, y, cx, cy], fill=LINE, width=2)
for x, y in pts:
    ring(d, x, y, 22, fill=BG, outline=INK, width=4)
    ring(d, x, y, 9, fill=BLUE_SOFT)
ring(d, cx, cy, 58, fill=BLUE)
ring(d, cx, cy, 58, outline=INK, width=4)
d.line([cx - 22, cy, cx + 22, cy], fill=INK, width=9)   # the permanent "+"
d.line([cx, cy - 22, cx, cy + 22], fill=INK, width=9)
im.save(os.path.join(A, 'feat-a13.png'), 'PNG', optimize=True)

# a14 Amps: two dashed Standard slots and one solid Signature slot with a bolt.
im, d = canvas()
sw, sh, gap = 250, 320, 60
x0 = (W - 3 * sw - 2 * gap) // 2
y0 = (H - sh) // 2
for i in range(3):
    x = x0 + i * (sw + gap)
    if i < 2:
        # dashed rounded frame, drawn as arc/segment dashes over a path
        step = 26
        for t in range(0, 2 * (sw + sh), step * 2):
            # walk the perimeter: top, right, bottom, left
            def per(p):
                p %= 2 * (sw + sh)
                if p < sw: return (x + p, y0)
                p -= sw
                if p < sh: return (x + sw, y0 + p)
                p -= sh
                if p < sw: return (x + sw - p, y0 + sh)
                p -= sw
                return (x, y0 + sh - p)
            d.line([per(t), per(t + step)], fill=LINE, width=5)
        ring(d, x + sw // 2, y0 + sh // 2, 30, outline=LINE, width=5)
    else:
        d.rounded_rectangle([x, y0, x + sw, y0 + sh], 26, fill=tuple(min(255, c + 12) for c in BG), outline=BLUE, width=6)
        bx, by = x + sw // 2, y0 + sh // 2
        d.polygon([(bx + 14, by - 78), (bx - 34, by + 14), (bx - 4, by + 14),
                   (bx - 14, by + 78), (bx + 36, by - 12), (bx + 4, by - 12)], fill=BLUE_SOFT)
im.save(os.path.join(A, 'feat-a14.png'), 'PNG', optimize=True)

# a15 archetype changes: an open padlock — access without the unlock step.
im, d = canvas()
bw, bh = 340, 250
bx, by = (W - bw) // 2, 280
d.rounded_rectangle([bx, by, bx + bw, by + bh], 30, fill=tuple(min(255, c + 12) for c in BG), outline=INK, width=7)
ring(d, bx + bw // 2, by + 95, 34, fill=BLUE)
d.rectangle([bx + bw // 2 - 13, by + 95, bx + bw // 2 + 13, by + 178], fill=BLUE)
# shackle: swung open to the right, hinged at the body's right shoulder
sr = 105
sx = bx + bw - 60          # hinge x
d.arc([sx - sr, by - 205, sx + sr, by + 5], start=180, end=340, fill=INK, width=22)
d.line([sx - sr + 11, by - 100, sx - sr + 11, by + 4], fill=INK, width=22)
im.save(os.path.join(A, 'feat-a15.png'), 'PNG', optimize=True)

# a16 tournaments: a bracket converging left-to-right into a final node.
im, d = canvas()
x1, x2, x3 = 190, 560, 930
ys1 = [120, 250, 380, 510]
ys2 = [185, 445]
yf = 315
for y in ys1:
    ring(d, x1, y, 17, fill=BG, outline=INK, width=4)
for a, b, m in [(ys1[0], ys1[1], ys2[0]), (ys1[2], ys1[3], ys2[1])]:
    d.line([x1 + 17, a, x2 - 60, a], fill=LINE, width=4)
    d.line([x1 + 17, b, x2 - 60, b], fill=LINE, width=4)
    d.line([x2 - 60, a, x2 - 60, b], fill=LINE, width=4)
    d.line([x2 - 60, m, x2 - 17, m], fill=LINE, width=4)
    ring(d, x2, m, 17, fill=BG, outline=INK, width=4)
for m in ys2:
    d.line([x2 + 17, m, x3 - 80, m], fill=LINE, width=4)
d.line([x3 - 80, ys2[0], x3 - 80, ys2[1]], fill=LINE, width=4)
d.line([x3 - 80, yf, x3 - 46, yf], fill=LINE, width=4)
ring(d, x3, yf, 46, fill=BLUE)
ring(d, x3, yf, 46, outline=INK, width=5)
ring(d, x3, yf, 17, fill=INK)
im.save(os.path.join(A, 'feat-a16.png'), 'PNG', optimize=True)

# a17 objectives: three tiers, progressively complete — the third ticked.
im, d = canvas()
r = 92
xs = [W // 2 - 350, W // 2, W // 2 + 350]
cy = H // 2
for i, (x, frac) in enumerate(zip(xs, [0.33, 0.66, 1.0])):
    ring(d, x, cy, r, outline=LINE, width=10)
    d.arc([x - r, cy - r, x + r, cy + r], start=-90, end=-90 + 360 * frac,
          fill=BLUE_SOFT if i < 2 else BLUE, width=10)
    if i == 2:
        d.line([x - 34, cy + 2, x - 8, cy + 30], fill=INK, width=13)
        d.line([x - 8, cy + 30, x + 40, cy - 26], fill=INK, width=13)
    else:
        ring(d, x, cy, 12, fill=LINE)
im.save(os.path.join(A, 'feat-a17.png'), 'PNG', optimize=True)

for n in range(13, 18):
    p = os.path.join(A, f'feat-a{n}.png')
    print(p, Image.open(p).size, f'{os.path.getsize(p) // 1024}KB')
