#!/usr/bin/env python3
"""Feature images for every published post — one generator, sixteen images.

Replaces the first-generation set, which put white archetype icons on the same
navy with the same corner arcs every time. Individually fine; as a card wall,
sixteen near-identical rectangles. Nothing distinguished a Career-adjacent news
post from an AP-cost calculator at thumbnail size.

So the variable here is deliberately colour and structure, not decoration:

* Eight palettes, two of them LIGHT. A light card between dark ones is the
  single most effective thing for breaking up a grid, which is why `cream` and
  `slate` carry four of the sixteen.
* Palettes are assigned so that no two cards sharing a row of Ghost's 3-up
  index grid use the same one — see PALETTE_OF and the row check at the bottom.
* Sixteen distinct compositions, one per article, each saying something about
  its subject: bars that miss a threshold for PlayStyle requirements, a wall of
  rising cost for AP, a bracket for tournaments.
* Backgrounds vary too (flat, gradient, dot grid, wedge, rings). The old set's
  identical corner arcs were half the sameness problem.

What stays constant is the discipline, and that is what keeps it one site: flat
geometry only, no text, no photographs, one idea per image, wide margins,
consistent stroke weights and corner radii.

Everything renders at 3x and downsamples with LANCZOS. PIL's ellipse and arc
are visibly jagged at final size, and these sit at the top of every post.

Run:  python3 gen/make-feat.py            # all sixteen
      python3 gen/make-feat.py a13 a16    # just those
Out:  assets/feat-a1.png … feat-a17.png   (1200x630, no a7 — still a draft)
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

A = os.path.join(os.path.dirname(__file__), '..', 'assets')
W, H = 1200, 630
S = 3  # supersample factor

# ── palettes ────────────────────────────────────────────────────────────────
# bg is a two-stop gradient (identical stops = flat). `ink` is the primary
# mark, `accent` the one thing the eye should land on, `dim` everything
# supporting. Contrast of ink against bg is kept high in all eight.
PAL = {
    'navy':    dict(bg=((13, 33, 69), (21, 48, 99)),     ink=(238, 242, 248), accent=(77, 148, 255), dim=(72, 96, 143)),
    'cream':   dict(bg=((244, 239, 228), (233, 224, 206)), ink=(23, 21, 18),  accent=(200, 80, 58),  dim=(168, 152, 128)),
    'teal':    dict(bg=((5, 46, 43), (10, 69, 64)),      ink=(230, 255, 251), accent=(47, 212, 181), dim=(43, 125, 114)),
    'plum':    dict(bg=((36, 16, 46), (59, 26, 74)),     ink=(247, 236, 255), accent=(197, 107, 255), dim=(111, 74, 134)),
    'ember':   dict(bg=((42, 18, 6), (72, 32, 10)),      ink=(255, 242, 230), accent=(255, 138, 61),  dim=(150, 85, 42)),
    'grass':   dict(bg=((13, 42, 18), (21, 66, 29)),     ink=(238, 251, 239), accent=(82, 214, 102),  dim=(60, 122, 69)),
    'slate':   dict(bg=((232, 234, 238), (215, 219, 226)), ink=(20, 24, 31),  accent=(47, 95, 208),   dim=(151, 160, 174)),
    'crimson': dict(bg=((43, 10, 19), (74, 18, 32)),     ink=(255, 238, 242), accent=(255, 77, 109),  dim=(148, 55, 77)),
}

# Ghost's index is 3-up, newest first: a17 a16 a15 / a14 a13 a12 / a11 a10 a9 /
# a8 a6 a5 / a4 a3 a2 / a1. Assignments below give every row three different
# palettes, and put a light card in five of the six rows.
PALETTE_OF = {
    'a1': 'grass',  'a2': 'slate',  'a3': 'plum',   'a4': 'teal',
    'a5': 'ember',  'a6': 'crimson', 'a8': 'navy',  'a9': 'cream',
    'a10': 'teal',  'a11': 'crimson', 'a12': 'slate', 'a13': 'navy',
    'a14': 'ember', 'a15': 'plum',  'a16': 'cream', 'a17': 'grass',
}
ROWS = [('a17', 'a16', 'a15'), ('a14', 'a13', 'a12'), ('a11', 'a10', 'a9'),
        ('a8', 'a6', 'a5'), ('a4', 'a3', 'a2'), ('a1',)]


# ── drawing helpers (all take unscaled 1200x630 coordinates) ────────────────
def grad(c1, c2, angle=90):
    """Linear gradient across the full canvas. angle 90 = top-to-bottom."""
    w, h = W * S, H * S
    a = math.radians(angle)
    x = np.linspace(0, 1, w)[None, :] * math.cos(a)
    y = np.linspace(0, 1, h)[:, None] * math.sin(a)
    t = x + y
    t = (t - t.min()) / max(t.max() - t.min(), 1e-9)
    arr = np.zeros((h, w, 3), np.uint8)
    for i in range(3):
        arr[..., i] = (c1[i] + (c2[i] - c1[i]) * t).astype(np.uint8)
    return Image.fromarray(arr)


def mix(c1, c2, t):
    return tuple(int(round(c1[i] + (c2[i] - c1[i]) * t)) for i in range(3))


def rrect(d, box, r, fill=None, outline=None, width=3):
    d.rounded_rectangle([v * S for v in box], r * S, fill=fill, outline=outline, width=int(width * S))


def rect(d, box, fill=None, outline=None, width=3):
    d.rectangle([v * S for v in box], fill=fill, outline=outline, width=int(width * S))


def disc(d, cx, cy, r, fill):
    d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S], fill=fill)


def ring(d, cx, cy, r, colour, width=3):
    d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S], outline=colour, width=int(width * S))


def arc(d, cx, cy, r, a0, a1, colour, width=3):
    d.arc([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S], a0, a1, fill=colour, width=int(width * S))


def line(d, pts, colour, width=3, joint='curve'):
    d.line([(p[0] * S, p[1] * S) for p in pts], fill=colour, width=int(width * S), joint=joint)


def poly(d, pts, fill):
    d.polygon([(p[0] * S, p[1] * S) for p in pts], fill=fill)


def dashed_v(d, x, y0, y1, colour, width=3, dash=16, gap=12):
    y = y0
    while y < y1:
        line(d, [(x, y), (x, min(y + dash, y1))], colour, width)
        y += dash + gap


def dot_grid(d, colour, step=46, r=2.6, jitter=0):
    for gy in range(0, H + step, step):
        for gx in range(0, W + step, step):
            disc(d, gx + (jitter if (gy // step) % 2 else 0), gy, r, colour)


def bolt(d, cx, cy, h, colour):
    u = h / 100.0
    poly(d, [(cx + 14 * u, cy - 50 * u), (cx - 30 * u, cy + 6 * u), (cx - 3 * u, cy + 6 * u),
             (cx - 12 * u, cy + 50 * u), (cx + 32 * u, cy - 8 * u), (cx + 4 * u, cy - 8 * u)], colour)


def canvas(pal, angle=90):
    im = grad(pal['bg'][0], pal['bg'][1], angle)
    return im, ImageDraw.Draw(im)


def save(im, name):
    im = im.resize((W, H), Image.LANCZOS)
    p = os.path.join(A, f'feat-{name}.png')
    im.save(p, 'PNG', optimize=True)
    return p


# ── compositions ────────────────────────────────────────────────────────────
def a1(pal):
    """All 13 archetypes: thirteen tiles, one picked out. Dot-grid ground."""
    im, d = canvas(pal, 70)
    dot_grid(d, mix(pal['bg'][0], pal['ink'], 0.10))
    tw, th, g = 132, 132, 26
    rows = [5, 5, 3]
    y = (H - (len(rows) * th + (len(rows) - 1) * g)) / 2
    n = 0
    for count in rows:
        x = (W - (count * tw + (count - 1) * g)) / 2
        for _ in range(count):
            hot = (n == 7)
            rrect(d, [x, y, x + tw, y + th], 26,
                  fill=pal['accent'] if hot else mix(pal['bg'][1], pal['ink'], 0.13),
                  outline=pal['ink'] if hot else pal['dim'], width=4 if hot else 2.5)
            disc(d, x + tw / 2, y + th / 2, 21 if hot else 17,
                 pal['bg'][0] if hot else pal['dim'])
            x += tw + g
            n += 1
        y += th + g
    return im


def a2(pal):
    """Ceilings compared: floor-to-ceiling ranges, stacked and capped.

    Horizontal ranges rather than vertical bars — the article is about the
    span between floor and ceiling, and it keeps this off the same visual
    shelf as a8 and a11.
    """
    im, d = canvas(pal, 90)
    x0 = 168
    span = 830
    rows = [(.12, .74), (.22, .93), (.08, .58), (.30, .99), (.18, .66), (.26, .81)]
    y = 132
    for i, (lo, hi) in enumerate(rows):
        hot = (hi == max(r[1] for r in rows))
        line(d, [(x0, y), (x0 + span, y)], mix(pal['bg'][0], pal['ink'], 0.10), 2)
        rrect(d, [x0 + span * lo, y - 15, x0 + span * hi, y + 15], 15,
              fill=pal['accent'] if hot else pal['dim'])
        disc(d, x0 + span * lo, y, 7, pal['bg'][0])
        line(d, [(x0 + span * hi, y - 30), (x0 + span * hi, y + 30)],
             pal['ink'] if hot else mix(pal['bg'][0], pal['ink'], 0.45), 4)
        y += 73
    return im


def a3(pal):
    """Quiz: four inputs converge, one archetype comes out ringed."""
    im, d = canvas(pal, 30)
    x0, x1, x2 = 150, 560, 940
    ys = [130, 275, 420, 545]
    for y in ys:
        rrect(d, [x0 - 62, y - 26, x0 + 62, y + 26], 26, fill=mix(pal['bg'][1], pal['ink'], 0.12))
        line(d, [(x0 + 62, y), (x1 - 46, y), (x1 - 46, 337), (x1 - 8, 337)], pal['dim'], 4)
    ring(d, x1 + 34, 337, 42, pal['dim'], 5)
    line(d, [(x1 + 76, 337), (x2 - 96, 337)], pal['dim'], 4)
    disc(d, x2, 337, 96, mix(pal['bg'][1], pal['accent'], 0.18))
    ring(d, x2, 337, 96, pal['accent'], 8)
    ring(d, x2, 337, 62, pal['ink'], 5)
    disc(d, x2, 337, 26, pal['accent'])
    return im


def a4(pal):
    """AcceleRATE: three speed profiles as streaks that space out differently."""
    im, d = canvas(pal, 90)
    rows = [
        (196, [0, 34, 62, 84, 100, 112, 120, 126, 130]),      # explosive: front-loaded
        (330, [0, 14, 30, 50, 74, 102, 134, 170, 210]),        # lengthy: back-loaded
        (464, [0, 26, 52, 78, 104, 130, 156, 182, 208]),       # controlled: even
    ]
    for i, (y, offs) in enumerate(rows):
        hot = (i == 0)
        col = pal['accent'] if hot else pal['dim']
        x = 176
        for j, o in enumerate(offs):
            w = 30 + j * 11
            rrect(d, [x + o * 3.0, y - 15, x + o * 3.0 + w, y + 15], 15,
                  fill=col if j > 2 else mix(pal['bg'][1], col, 0.42))
        disc(d, 118, y, 22, pal['ink'] if hot else pal['dim'])
    return im


def a5(pal):
    """The Grounds: three districts ringing a central hub, inside a world arc."""
    im, d = canvas(pal, 120)
    cx, cy = W / 2, H / 2
    for r, t in ((300, 0.07), (232, 0.10)):
        ring(d, cx, cy, r, mix(pal['bg'][1], pal['ink'], t), 3)
    pts = []
    for k in range(3):
        a = -math.pi / 2 + k * 2 * math.pi / 3
        pts.append((cx + 232 * math.cos(a), cy + 232 * math.sin(a)))
    for p in pts:
        line(d, [(cx, cy), p], pal['dim'], 4)
    for i, (x, y) in enumerate(pts):
        disc(d, x, y, 62, mix(pal['bg'][1], pal['ink'], 0.14))
        ring(d, x, y, 62, pal['dim'], 5)
        disc(d, x, y, 26, pal['accent'] if i == 0 else pal['dim'])
    disc(d, cx, cy, 74, pal['accent'])
    ring(d, cx, cy, 74, pal['ink'], 6)
    ring(d, cx, cy, 34, pal['bg'][0], 6)
    return im


def a6(pal):
    """Platforms: four in, three struck out, hard divide between them."""
    im, d = canvas(pal, 0)
    rect(d, [700, 0, W, H], fill=mix(pal['bg'][1], (0, 0, 0), 0.22))
    for i in range(4):
        x, y = 132 + (i % 2) * 224, 150 + (i // 2) * 196
        rrect(d, [x, y, x + 168, y + 148], 26, fill=pal['accent'])
        disc(d, x + 84, y + 74, 30, pal['bg'][0])
    dashed_v(d, 700, 60, H - 60, pal['dim'], 5, 20, 16)
    for i in range(3):
        x, y = 848, 96 + i * 156
        rrect(d, [x, y, x + 150, y + 122], 22, fill=None, outline=pal['dim'], width=4)
        line(d, [(x + 26, y + 26), (x + 124, y + 96)], pal['accent'], 6)
        line(d, [(x + 124, y + 26), (x + 26, y + 96)], pal['accent'], 6)
    return im


def a8(pal):
    """PlayStyle requirements: a threshold line some attributes clear, some miss."""
    im, d = canvas(pal, 90)
    thr = 268
    rect(d, [0, 0, W, thr], fill=mix(pal['bg'][0], pal['ink'], 0.045))
    vals = [310, 214, 356, 168, 288, 402, 236]
    bw, g = 96, 40
    x = (W - (len(vals) * bw + (len(vals) - 1) * g)) / 2
    base = 552
    for v in vals:
        top = base - v
        ok = top < thr
        rrect(d, [x, top, x + bw, base], 14, fill=pal['accent'] if ok else pal['dim'])
        if ok:
            disc(d, x + bw / 2, top - 30, 9, pal['ink'])
        x += bw + g
    line(d, [(60, thr), (W - 60, thr)], pal['ink'], 5)
    for dx in range(70, W - 60, 34):
        line(d, [(dx, thr), (dx + 16, thr)], pal['bg'][0], 5)
    return im


def a9(pal):
    """Specializations: one archetype forking into three, then into nine.

    Deliberately dense and fanning outward, to read as the opposite of a16's
    sparse converging bracket — they share the cream palette.
    """
    im, d = canvas(pal, 45)
    poly(d, [(W, 0), (W, 420), (W - 520, 0)], mix(pal['bg'][1], pal['ink'], 0.07))
    x0, x1, x2 = 118, 486, 928
    mids = [128, 315, 502]
    for m in mids:
        line(d, [(x0 + 58, 315), (x1 - 104, 315), (x1 - 104, m), (x1 - 56, m)], pal['dim'], 5)
        for k in (-1, 0, 1):
            ly = m + k * 62
            line(d, [(x1 + 56, m), (x2 - 128, m), (x2 - 128, ly), (x2 - 32, ly)], pal['dim'], 3)
            disc(d, x2, ly, 21, mix(pal['bg'][1], pal['ink'], 0.14))
            ring(d, x2, ly, 21, pal['dim'], 4)
    for m in mids:
        disc(d, x1, m, 54, mix(pal['bg'][1], pal['ink'], 0.10))
        ring(d, x1, m, 54, pal['dim'], 6)
        disc(d, x1, m, 22, pal['accent'] if m == 315 else pal['dim'])
    disc(d, x0, 315, 70, pal['accent'])
    ring(d, x0, 315, 70, pal['ink'], 7)
    return im


def a10(pal):
    """Levels 1-100: a serpentine track of stops, milestones flagged.

    A journey rather than a staircase — it is a 100-step schedule, and the
    wrapping track keeps it clear of every other bar-shaped image in the set.
    """
    im, d = canvas(pal, 105)
    xl, xr = 200, 1000
    ys = [172, 315, 458]
    r = (ys[1] - ys[0]) / 2
    track = mix(pal['bg'][1], pal['ink'], 0.20)
    for y in ys:
        line(d, [(xl, y), (xr, y)], track, 11)
    arc(d, xr, (ys[0] + ys[1]) / 2, r, -90, 90, track, 11)
    arc(d, xl, (ys[1] + ys[2]) / 2, r, 90, 270, track, 11)
    stops = []
    for i, y in enumerate(ys):
        n = 7
        seq = [xl + (xr - xl) * k / (n - 1) for k in range(n)]
        stops += [(x, y) for x in (seq if i != 1 else seq[::-1])]
    for i, (x, y) in enumerate(stops):
        milestone = i in (5, 12, 20)
        if milestone:
            disc(d, x, y, 26, pal['accent'])
            ring(d, x, y, 26, pal['ink'], 4)
            line(d, [(x, y - 26), (x, y - 62)], pal['ink'], 4)
            poly(d, [(x, y - 62), (x + 40, y - 53), (x, y - 44)], pal['ink'])
        else:
            disc(d, x, y, 13, pal['bg'][0])
            ring(d, x, y, 13, mix(pal['bg'][1], pal['ink'], 0.42), 3)
    return im


def a11(pal):
    """AP costs: four tiers, the last one a wall you save up for."""
    im, d = canvas(pal, 90)
    dot_grid(d, mix(pal['bg'][0], pal['ink'], 0.08), 54, 2.4)
    hs = [86, 168, 300, 486]
    bw, g = 178, 46
    x = (W - (4 * bw + 3 * g)) / 2
    base = 560
    for i, h in enumerate(hs):
        last = (i == 3)
        rrect(d, [x, base - h, x + bw, base], 18,
              fill=pal['accent'] if last else mix(pal['bg'][1], pal['ink'], 0.16 + i * 0.05),
              outline=pal['ink'] if last else None, width=5)
        for k in range(i + 1):
            disc(d, x + bw / 2 - i * 15 + k * 30, base - h - 34, 8,
                 pal['ink'] if last else pal['dim'])
        x += bw + g
    line(d, [(50, base), (W - 50, base)], pal['ink'], 5)
    return im


def a12(pal):
    """Head to head: two builds mirrored across a halfway line."""
    im, d = canvas(pal, 0)
    rect(d, [W / 2, 0, W, H], fill=mix(pal['bg'][1], pal['ink'], 0.05))
    left = [.86, .54, .72, .38, .64]
    right = [.58, .80, .46, .77, .50]
    y = 150
    for i in range(5):
        ml, mr = W / 2 - 46, W / 2 + 46
        wl, wr = left[i] * 400, right[i] * 400
        rrect(d, [ml - wl, y - 17, ml, y + 17], 17, fill=pal['accent'])
        rrect(d, [mr, y - 17, mr + wr, y + 17], 17, fill=pal['dim'])
        y += 84
    dashed_v(d, W / 2, 40, H - 40, pal['ink'], 4, 18, 14)
    disc(d, W / 2, H / 2, 44, pal['bg'][0])
    ring(d, W / 2, H / 2, 44, pal['ink'], 5)
    return im


def a13(pal):
    """Masteries: thirteen archetypes, one permanent core."""
    im, d = canvas(pal, 115)
    cx, cy, R = W / 2, H / 2, 222
    ring(d, cx, cy, R, mix(pal['bg'][1], pal['ink'], 0.18), 3)
    pts = []
    for i in range(13):
        a = -math.pi / 2 + i * 2 * math.pi / 13
        pts.append((cx + R * math.cos(a), cy + R * math.sin(a)))
    for p in pts:
        line(d, [p, (cx, cy)], pal['dim'], 2.5)
    for x, y in pts:
        disc(d, x, y, 25, pal['bg'][0])
        ring(d, x, y, 25, pal['ink'], 4)
        disc(d, x, y, 10, pal['accent'])
    disc(d, cx, cy, 66, pal['accent'])
    ring(d, cx, cy, 66, pal['ink'], 5)
    line(d, [(cx - 26, cy), (cx + 26, cy)], pal['bg'][0], 11)
    line(d, [(cx, cy - 26), (cx, cy + 26)], pal['bg'][0], 11)
    return im


def a14(pal):
    """Amps: two standard slots empty, the signature slot live."""
    im, d = canvas(pal, 35)
    sw, sh, g = 244, 316, 58
    x0 = (W - (3 * sw + 2 * g)) / 2
    y0 = (H - sh) / 2
    for i in range(3):
        x = x0 + i * (sw + g)
        if i < 2:
            rrect(d, [x, y0, x + sw, y0 + sh], 30, fill=None, outline=pal['dim'], width=5)
            ring(d, x + sw / 2, y0 + sh / 2, 34, pal['dim'], 5)
        else:
            rrect(d, [x, y0, x + sw, y0 + sh], 30,
                  fill=mix(pal['bg'][1], pal['accent'], 0.22), outline=pal['accent'], width=7)
            bolt(d, x + sw / 2, y0 + sh / 2, 190, pal['accent'])
    return im


def a15(pal):
    """Archetype changes: the lock is open — everything unlocked, resets free."""
    im, d = canvas(pal, 60)
    disc(d, 940, 130, 300, mix(pal['bg'][1], pal['ink'], 0.055))
    bw, bh = 348, 254
    bx, by = (W - bw) / 2 - 40, 306
    sr, sx = 108, bx + bw - 58
    arc(d, sx, by - 100, sr, 182, 342, pal['ink'], 23)
    line(d, [(sx - sr + 11, by - 100), (sx - sr + 11, by + 6)], pal['ink'], 23)
    rrect(d, [bx, by, bx + bw, by + bh], 32,
          fill=mix(pal['bg'][1], pal['ink'], 0.10), outline=pal['ink'], width=7)
    disc(d, bx + bw / 2, by + 96, 35, pal['accent'])
    poly(d, [(bx + bw / 2 - 14, by + 96), (bx + bw / 2 + 14, by + 96),
             (bx + bw / 2 + 9, by + 182), (bx + bw / 2 - 9, by + 182)], pal['accent'])
    return im


def a16(pal):
    """Club Tournaments: a bracket resolving to one winner."""
    im, d = canvas(pal, 90)
    x1, x2, x3 = 176, 552, 936
    ys1 = [116, 250, 384, 518]
    ys2 = [183, 451]
    yf = 317
    for y in ys1:
        disc(d, x1, y, 19, pal['bg'][0])
        ring(d, x1, y, 19, pal['dim'], 5)
    for (a_, b_, m) in ((ys1[0], ys1[1], ys2[0]), (ys1[2], ys1[3], ys2[1])):
        line(d, [(x1 + 19, a_), (x2 - 68, a_), (x2 - 68, b_), (x1 + 19, b_)], pal['dim'], 4)
        line(d, [(x2 - 68, m), (x2 - 22, m)], pal['dim'], 4)
        disc(d, x2, m, 22, pal['bg'][0])
        ring(d, x2, m, 22, pal['dim'], 5)
    line(d, [(x2 + 22, ys2[0]), (x3 - 90, ys2[0]), (x3 - 90, ys2[1]), (x2 + 22, ys2[1])], pal['dim'], 4)
    line(d, [(x3 - 90, yf), (x3 - 54, yf)], pal['accent'], 5)
    disc(d, x3, yf, 54, pal['accent'])
    ring(d, x3, yf, 54, pal['ink'], 6)
    disc(d, x3, yf, 20, pal['ink'])
    return im


def a17(pal):
    """Club Objectives: bronze, silver, gold — the last one closed out."""
    im, d = canvas(pal, 145)
    xs = [268, 600, 932]
    fr = [0.34, 0.68, 1.0]
    rr = [76, 94, 112]
    for i, (x, f, r) in enumerate(zip(xs, fr, rr)):
        ring(d, x, H / 2, r, mix(pal['bg'][1], pal['ink'], 0.16), 15)
        d.arc([(x - r) * S, (H / 2 - r) * S, (x + r) * S, (H / 2 + r) * S],
              -90, -90 + 360 * f, fill=pal['accent'] if i == 2 else pal['dim'], width=int(15 * S))
        if i == 2:
            line(d, [(x - 40, H / 2 + 2), (x - 11, H / 2 + 34), (x + 46, H / 2 - 32)], pal['ink'], 15)
        else:
            disc(d, x, H / 2, 13, mix(pal['bg'][1], pal['ink'], 0.28))
    return im


BUILD = {'a1': a1, 'a2': a2, 'a3': a3, 'a4': a4, 'a5': a5, 'a6': a6, 'a8': a8,
         'a9': a9, 'a10': a10, 'a11': a11, 'a12': a12, 'a13': a13, 'a14': a14,
         'a15': a15, 'a16': a16, 'a17': a17}

only = set(sys.argv[1:])
for name, fn in BUILD.items():
    if only and name not in only:
        continue
    p = save(fn(PAL[PALETTE_OF[name]]), name)
    print(f'  {name:4s} {PALETTE_OF[name]:8s} {os.path.getsize(p) // 1024:3d}KB  {p}')

# A row of the index showing the same palette twice is the exact failure this
# file exists to prevent, so it is checked rather than eyeballed.
for row in ROWS:
    used = [PALETTE_OF[a] for a in row]
    assert len(set(used)) == len(used), f'palette repeats within index row {row}: {used}'
print(f'  ok    {len(BUILD)} images, no palette repeats within any index row')
