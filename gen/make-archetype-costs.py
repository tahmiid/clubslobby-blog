# Two social images about AP COST (owner, 22 Sep 2026: "which attributes are
# cheaper for which archetypes" - the ceilings sheet was too dense to read):
#  1. fc27-cheap-to-raise.png - per archetype, the attributes in its cheapest
#     tier (green) and its most expensive tier (red).
#  2. fc27-cost-to-90.png - per popular attribute, what base -> 90 costs in AP
#     on the three cheapest archetypes and the dearest one.
# Every number is computed from data/fc27/rules_progression.json (the four
# per-point cost tiers and each archetype's attribute->tier map) and
# data/fc27/archetypes.json (base values). Nothing typed by hand.
import json
import os

from PIL import Image, ImageDraw

from coverkit import TEAL, TEXT, font, tracked

ROOT = os.path.join(os.path.dirname(__file__), '..')
D = lambda *p: os.path.join(ROOT, 'data', *p)
OUT = os.path.join(ROOT, 'assets', 'social')
ARCH = {a['id']: a for a in json.load(open(D('fc27', 'archetypes.json')))}
ATTRS = json.load(open(D('attributes.json')))
PROG = json.load(open(D('fc27', 'rules_progression.json')))
TIERS = PROG['apCostTiers']
COSTS = PROG['archetypeCosts']
ORDER = ['finisher', 'magician', 'spark', 'target', 'creator', 'disruptor', 'maestro',
         'recycler', 'boss', 'marauder', 'progressor', 'shot-stopper', 'sweeper-keeper']
BG, PANEL, MUTED = (4, 4, 10), (14, 15, 25), (154, 160, 174)
GREEN, RED = (45, 226, 197), (255, 107, 138)
GREEN_INK, RED_INK = (4, 30, 26), (60, 10, 22)
aname = lambda k: ATTRS.get(k, {}).get('name', k)


def per_point(tier, value):
    for r in TIERS[tier]:
        if r['min'] <= value <= r['max']:
            return r['cost']
    raise ValueError((tier, value))


def cost_to(aid, key, target):
    """AP from the archetype's base to `target` (or its cap, if lower)."""
    a = ARCH[aid]
    at = a['attributes'].get(key)
    if not at:
        return None
    tier = COSTS[aid]['tiers'][key]
    top = min(target, at['max'])
    return sum(per_point(tier, v) for v in range(at['min'] + 1, top + 1)), top


def chips(d, x, y, items, fill, ink, f, max_w, gap=8, pad=12, h=34):
    """Rounded chips that wrap; returns the y after the last row."""
    cx, cy = x, y
    for text in items:
        w = d.textlength(text, font=f) + pad * 2
        if cx + w > max_w:
            cx, cy = x, cy + h + gap
        d.rounded_rectangle([cx, cy, cx + w, cy + h], radius=9, fill=fill)
        d.text((cx + pad, cy + 8), text, font=f, fill=ink)
        cx += w + gap
    return cy + h


def cheap_to_raise():
    W, PAD = 1200, 40
    f_chip = font('manrope-700', 16)
    # measure rows first so the canvas fits
    rows = []
    for aid in ORDER:
        tiers = COSTS[aid]['tiers']
        keys = [k for k in ARCH[aid]['attributes']]
        cheap = [aname(k) for k in keys if tiers.get(k) == 'tier0']
        dear = [aname(k) for k in keys if tiers.get(k) == 'tier3']
        rows.append((aid, cheap, dear))
    scratch = ImageDraw.Draw(Image.new('RGB', (W, 10)))
    heights = []
    for aid, cheap, dear in rows:
        y1 = chips(scratch, PAD + 260, 0, cheap, GREEN, GREEN_INK, f_chip, W - PAD)
        y2 = chips(scratch, PAD + 260, y1 + 14, dear, RED, RED_INK, f_chip, W - PAD)
        heights.append(y2 + 24)
    H = 230 + sum(h + 14 for h in heights) + 150
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    tracked(d, (PAD, 36), 'EA SPORTS FC 27  ·  PRO CLUBS ARCHETYPES', font('manrope-700', 22), TEAL, 5)
    d.text((PAD, 66), 'What each archetype is cheap to raise', font=font('archivo-800', 46), fill=TEXT)
    d.text((PAD, 124), 'every attribute sits in one of four AP price tiers per archetype', font=font('manrope-700', 20), fill=MUTED)
    chips(d, PAD, 160, ['cheapest tier'], GREEN, GREEN_INK, f_chip, W)
    chips(d, PAD + 150, 160, ['most expensive tier'], RED, RED_INK, f_chip, W)
    d.text((PAD + 372, 168), 'the other two tiers sit in between', font=font('manrope-700', 16), fill=MUTED)
    y = 230
    for (aid, cheap, dear), h in zip(rows, heights):
        a = ARCH[aid]
        d.rectangle([PAD, y, W - PAD, y + h], fill=PANEL)
        d.text((PAD + 22, y + 18), a['name'], font=font('archivo-800', 27), fill=TEXT)
        d.text((PAD + 22, y + 56), a['position'], font=font('manrope-700', 14), fill=TEAL)
        d.text((PAD + 22, y + 76), (a.get('inspiredBy') or ''), font=font('manrope-700', 14), fill=MUTED)
        y1 = chips(d, PAD + 260, y + 14, cheap, GREEN, GREEN_INK, f_chip, W - PAD)
        chips(d, PAD + 260, y1 + 14, dear, RED, RED_INK, f_chip, W - PAD)
        y += h + 14
    y += 20
    d.line([(PAD, y), (W - PAD, y)], fill=TEAL, width=2)
    tracked(d, (PAD, y + 20), 'PROCLUBSHQ.COM', font('manrope-700', 20), TEAL, 6)
    ex = cost_to('finisher', 'finishing', 90)[0], cost_to('boss', 'finishing', 90)
    d.text((PAD, y + 50), f'Tiers from the retail catalog, re-read in-game 22 Sep · the gap is real: 90 Finishing is {ex[0]} AP on a Finisher; a Boss stops at {ex[1][1]}, and that alone is {ex[1][0]} AP · 962 AP at level 40',
           font=font('manrope-700', 15), fill=MUTED)
    out = os.path.join(OUT, 'fc27-cheap-to-raise.png')
    img.save(out, optimize=True)
    print(f'  {os.path.basename(out)}  {W}x{H}  {os.path.getsize(out) // 1024} KB')


POPULAR = ['sprintSpeed', 'acceleration', 'finishing', 'shotPower', 'dribbling', 'ballControl',
           'shortPass', 'vision', 'crossing', 'interceptions', 'standTackle', 'strength', 'stamina', 'headingAcc']


def cost_to_90():
    W, PAD, ROW_H = 1200, 40, 92
    H = 230 + ROW_H * len(POPULAR) + 150
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    tracked(d, (PAD, 36), 'EA SPORTS FC 27  ·  PRO CLUBS ARCHETYPES', font('manrope-700', 22), TEAL, 5)
    d.text((PAD, 66), 'Want 90 in it? Who pays least', font=font('archivo-800', 46), fill=TEXT)
    d.text((PAD, 124), 'AP from the archetype’s starting value to 90 · the three cheapest archetypes, and the dearest', font=font('manrope-700', 20), fill=MUTED)
    chips(d, PAD, 160, ['cheapest'], GREEN, GREEN_INK, font('manrope-700', 16), W)
    chips(d, PAD + 120, 160, ['dearest'], RED, RED_INK, font('manrope-700', 16), W)
    d.text((PAD + 230, 168), 'archetypes whose ceiling is under 90 are left out of that row', font=font('manrope-700', 16), fill=MUTED)
    y = 230
    f_chip = font('manrope-700', 16)
    for key in POPULAR:
        # Only archetypes that can actually reach 90: a keeper whose Finishing
        # caps at 75 is not "cheap to 90", it stops early. The dearest is the
        # dearest among those that get there.
        costs = []
        short = 0
        for aid in ORDER:
            c = cost_to(aid, key, 90)
            if c and c[1] >= 90:
                costs.append((c[0], c[1], aid))
            elif c:
                short += 1
        costs.sort()
        d.rectangle([PAD, y, W - PAD, y + ROW_H - 10], fill=PANEL)
        d.text((PAD + 22, y + 26), aname(key), font=font('archivo-800', 24), fill=TEXT)
        x = PAD + 260
        for ap, top, aid in costs[:3]:
            label = f"{ARCH[aid]['name']}  {ap} AP" + (f' (caps {top})' if top < 90 else '')
            w = d.textlength(label, font=f_chip) + 24
            d.rounded_rectangle([x, y + 24, x + w, y + 58], radius=9, fill=GREEN)
            d.text((x + 12, y + 32), label, font=f_chip, fill=GREEN_INK)
            x += w + 10
        if short:
            d.text((PAD + 22, y + 58), f"{short} archetype{'s' if short > 1 else ''} cannot reach 90", font=font('manrope-700', 12), fill=MUTED)
        ap, top, aid = costs[-1]
        label = f"{ARCH[aid]['name']}  {ap} AP"
        w = d.textlength(label, font=f_chip) + 24
        x = max(x + 10, W - PAD - w - 14)
        d.rounded_rectangle([x, y + 24, x + w, y + 58], radius=9, fill=RED)
        d.text((x + 12, y + 32), label, font=f_chip, fill=RED_INK)
        y += ROW_H
    y += 20
    d.line([(PAD, y), (W - PAD, y)], fill=TEAL, width=2)
    tracked(d, (PAD, y + 20), 'PROCLUBSHQ.COM', font('manrope-700', 20), TEAL, 6)
    d.text((PAD, y + 50), 'Computed from the retail catalog’s cost tiers and starting values · every archetype priced live in a free builder · 962 AP at level 40',
           font=font('manrope-700', 15), fill=MUTED)
    out = os.path.join(OUT, 'fc27-cost-to-90.png')
    img.save(out, optimize=True)
    print(f'  {os.path.basename(out)}  {W}x{H}  {os.path.getsize(out) // 1024} KB')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    cheap_to_raise()
    cost_to_90()
