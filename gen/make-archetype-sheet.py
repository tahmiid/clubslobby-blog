# Two social images from the FC 27 catalog (owner, 22 Sep 2026: "we can
# generate much better data, much more visually understandable"):
#  1. fc27-archetype-ceilings.png - every attribute for all 13 archetypes as
#     base -> ceiling, coloured by the ceiling, with the PlayStyle+ each
#     specialization grants. The sheet people post shows only the base values.
#  2. fc27-archetype-tops.png - a phone-readable companion: each archetype's
#     five highest ceilings and its four PlayStyle+.
# Numbers come from data/fc27/archetypes.json (the retail catalog); nothing here
# is typed by hand.
import json
import os

from PIL import Image, ImageDraw

from coverkit import TEAL, TEXT, font, tracked

ROOT = os.path.join(os.path.dirname(__file__), '..')
D = lambda *p: os.path.join(ROOT, 'data', *p)
OUT = os.path.join(ROOT, 'assets', 'social')
ARCH = json.load(open(D('fc27', 'archetypes.json')))
PS = json.load(open(D('fc27', 'playstyles.json')))
ATTRS = json.load(open(D('attributes.json')))
ps_name = lambda s: PS.get(s, {}).get('name', s.replace('-', ' ').title())
ORDER = ['finisher', 'magician', 'spark', 'target', 'creator', 'disruptor', 'maestro',
         'recycler', 'boss', 'marauder', 'progressor', 'shot-stopper', 'sweeper-keeper']
CATS = [
    ('Pace', ['acceleration', 'sprintSpeed']),
    ('Scoring', ['attPosition', 'finishing', 'shotPower', 'longShots', 'volleys', 'penalties']),
    ('Passing', ['vision', 'crossing', 'fkAcc', 'shortPass', 'longPass', 'curve']),
    ('Ball Control', ['agility', 'balance', 'reactions', 'ballControl', 'dribbling', 'composure']),
    ('Defending', ['interceptions', 'headingAcc', 'defAware', 'standTackle', 'slideTackle']),
    ('Physical', ['jumping', 'strength', 'stamina', 'aggression']),
    ('Goalkeeping', ['gkDiving', 'gkHandling', 'gkKicking', 'gkReflexes', 'gkPositioning']),
]
BG = (4, 4, 10)
PANEL = (14, 15, 25)
LINE = (255, 255, 255, 28)
MUTED = (154, 160, 174)
BAND = {'Pace': (13, 110, 253), 'Scoring': (220, 53, 69), 'Passing': (16, 150, 110), 'Ball Control': (40, 90, 220),
        'Defending': (222, 120, 20), 'Physical': (130, 60, 200), 'Goalkeeping': (60, 130, 230)}


def heat(v):
    """Ceiling colour: 60 dark slate -> 80 teal -> 99 gold."""
    if v is None:
        return (22, 23, 34)
    t = max(0.0, min(1.0, (v - 60) / 39))
    if t < 0.5:
        a, b, u = (28, 44, 70), (13, 143, 124), t / 0.5
    else:
        a, b, u = (13, 143, 124), (245, 196, 81), (t - 0.5) / 0.5
    return tuple(int(a[i] + (b[i] - a[i]) * u) for i in range(3))


def rotated(text, f, fill):
    tmp = Image.new('RGBA', (600, 60), (0, 0, 0, 0))
    d = ImageDraw.Draw(tmp)
    d.text((0, 0), text, font=f, fill=fill)
    box = d.textbbox((0, 0), text, font=f)
    return tmp.crop((0, 0, box[2] + 2, box[3] + 2)).rotate(90, expand=True)


def arch(id_):
    return next(a for a in ARCH if a['id'] == id_)


def sheet():
    archs = [arch(i) for i in ORDER]
    LABEL_W, BAND_W, COL_W, ROW_H = 250, 46, 128, 36
    HEAD_H, TITLE_H, FOOT_ROWS = 96, 150, 6
    rows = sum(len(k) for _, k in CATS)
    W = BAND_W + LABEL_W + COL_W * len(archs) + 40
    H = TITLE_H + HEAD_H + ROW_H * rows + 30 + 58 * FOOT_ROWS + 110
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    tracked(d, (40, 34), 'EA SPORTS FC 27  ·  PRO CLUBS ARCHETYPES', font('manrope-700', 22), TEAL, 5)
    d.text((40, 64), 'Where every attribute starts, and where it can go', font=font('archivo-800', 44), fill=TEXT)
    d.text((40, 116), 'base → ceiling for all 13 archetypes, from the retail catalog · colour is the ceiling',
           font=font('manrope-700', 20), fill=MUTED)
    x0 = BAND_W + LABEL_W + 20
    y = TITLE_H
    # header
    for i, a in enumerate(archs):
        x = x0 + i * COL_W
        d.rectangle([x, y, x + COL_W - 4, y + HEAD_H - 6], fill=PANEL)
        nf = font('archivo-800', 20 if len(a['name']) < 12 else 16)
        d.text((x + 10, y + 14), a['name'], font=nf, fill=TEXT)
        d.text((x + 10, y + 44), a['position'], font=font('manrope-700', 14), fill=TEAL)
        d.text((x + 10, y + 64), (a.get('inspiredBy') or '')[:16], font=font('manrope-700', 13), fill=MUTED)
    y += HEAD_H
    for cat, keys in CATS:
        top = y
        for k in keys:
            d.rectangle([BAND_W + 20, y, BAND_W + LABEL_W + 16, y + ROW_H - 3], fill=PANEL)
            d.text((BAND_W + 34, y + 8), ATTRS.get(k, {}).get('name', k), font=font('manrope-700', 17), fill=TEXT)
            for i, a in enumerate(archs):
                x = x0 + i * COL_W
                at = a['attributes'].get(k)
                if not at:
                    d.rectangle([x, y, x + COL_W - 4, y + ROW_H - 3], fill=(16, 17, 26))
                    d.text((x + COL_W // 2 - 6, y + 8), '–', font=font('manrope-700', 17), fill=(70, 72, 86))
                    continue
                d.rectangle([x, y, x + COL_W - 4, y + ROW_H - 3], fill=heat(at['max']))
                ink = (8, 8, 12) if at['max'] >= 80 else TEXT
                d.text((x + 12, y + 9), f"{at['min']}", font=font('manrope-700', 15), fill=ink)
                d.text((x + 44, y + 9), '→', font=font('manrope-700', 15), fill=ink)
                d.text((x + 66, y + 6), f"{at['max']}", font=font('archivo-800', 20), fill=ink)
            y += ROW_H
        d.rectangle([20, top, BAND_W + 12, y - 3], fill=BAND[cat])
        lab = rotated(cat, font('manrope-700', 16), TEXT)
        img.paste(lab, (20 + (BAND_W - 8 - lab.size[0]) // 2, top + (y - 3 - top - lab.size[1]) // 2), lab)
    y += 30
    FOOT_H = 58
    foot = [('Signature PlayStyle+', lambda a: (ps_name(a['signature'][0]) if a.get('signature') else '–', ''))]
    for n in range(3):
        foot.append((f'Specialization {n + 1}',
                     lambda a, n=n: ((a['specializations'][n]['name'].title(), '→ ' + ps_name(a['specializations'][n]['psPlus']) + '+')
                                     if len(a.get('specializations', [])) > n else ('–', ''))))
    foot.append(('Perks', lambda a: tuple((p['name'] for p in a.get('perks', [])[:2])) if a.get('perks') else ('–', '')))
    foot.append(('Skill moves / weak foot', lambda a: (f"skill {a['skillMoves']['min']}–{a['skillMoves']['max']} stars", f"weak foot {a['weakFoot']['min']}–{a['weakFoot']['max']} stars")))
    for label, fn in foot:
        d.rectangle([BAND_W + 20, y, BAND_W + LABEL_W + 16, y + FOOT_H - 4], fill=PANEL)
        d.text((BAND_W + 34, y + 19), label, font=font('manrope-700', 15), fill=TEAL)
        for i, a in enumerate(archs):
            x = x0 + i * COL_W
            d.rectangle([x, y, x + COL_W - 4, y + FOOT_H - 4], fill=PANEL)
            l1, l2 = (fn(a) + ('',))[:2]
            d.text((x + 8, y + 9), str(l1)[:19], font=font('manrope-700', 14), fill=TEXT)
            d.text((x + 8, y + 31), str(l2)[:21], font=font('manrope-700', 13), fill=TEAL if l2.startswith('→') else MUTED)
        y += FOOT_H
    y += 24
    d.line([(40, y), (W - 40, y)], fill=(45, 226, 197), width=2)
    tracked(d, (40, y + 20), 'PROCLUBSHQ.COM', font('manrope-700', 20), TEAL, 6)
    d.text((40, y + 50), 'Every FC 27 archetype, priced live in a free builder · 962 AP at level 40 buys one signature PlayStyle+, three regular slots and the attributes you choose',
           font=font('manrope-700', 16), fill=MUTED)
    out = os.path.join(OUT, 'fc27-archetype-ceilings.png')
    img.save(out, optimize=True)
    print(f'  {os.path.basename(out)}  {W}x{H}  {os.path.getsize(out) // 1024} KB')


def tops():
    """Each archetype's SHAPE: the average ceiling of every attribute category,
    as bars, with the four PlayStyle+ it can wear. A top-five list was
    meaningless - nearly every archetype holds a fistful of 99s."""
    archs = [arch(i) for i in ORDER]
    cats = [c for c in CATS if c[0] != 'Goalkeeping']
    W, ROW_H, PAD = 1200, 128, 40
    H = 210 + ROW_H * len(archs) + 120
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    tracked(d, (PAD, 36), 'EA SPORTS FC 27  ·  PRO CLUBS ARCHETYPES', font('manrope-700', 22), TEAL, 5)
    d.text((PAD, 66), 'The shape of every archetype', font=font('archivo-800', 46), fill=TEXT)
    d.text((PAD, 122), 'average attribute ceiling per category (goalkeeping shown for the keepers), and the four PlayStyle+ each can wear',
           font=font('manrope-700', 18), fill=MUTED)
    y = 210
    x_bars = PAD + 300
    bar_w = (W - PAD - x_bars) // 6 - 10
    for a in archs:
        d.rectangle([PAD, y, W - PAD, y + ROW_H - 10], fill=PANEL)
        d.text((PAD + 22, y + 16), a['name'], font=font('archivo-800', 27), fill=TEXT)
        d.text((PAD + 22, y + 54), f"{a['position']} · {(a.get('inspiredBy') or '')}", font=font('manrope-700', 14), fill=MUTED)
        use = cats if a['position'] != 'Keeper' else [c for c in CATS if c[0] in ('Goalkeeping', 'Pace', 'Passing', 'Ball Control', 'Defending', 'Physical')]
        for j, (cat, keys) in enumerate(use):
            vals = [a['attributes'][k]['max'] for k in keys if k in a['attributes']]
            if not vals:
                continue
            v = round(sum(vals) / len(vals))
            x = x_bars + j * (bar_w + 10)
            h = int((v - 50) / 49 * 56)
            d.rectangle([x, y + 14, x + bar_w, y + 72], fill=(22, 23, 34))
            d.rectangle([x, y + 72 - h, x + bar_w, y + 72], fill=heat(v))
            d.text((x + 6, y + 76), {'Ball Control': 'Control', 'Defending': 'Defence', 'Goalkeeping': 'Keeping'}.get(cat, cat), font=font('manrope-700', 12), fill=MUTED)
            ink = (8, 8, 12) if v >= 80 and h > 26 else TEXT
            d.text((x + bar_w - 34, y + 72 - h + 4 if h > 26 else y + 40), str(v), font=font('archivo-800', 18), fill=ink)
        plus = [ps_name(a['signature'][0])] + [ps_name(s['psPlus']) for s in a.get('specializations', [])[:3]]
        d.text((x_bars, y + 96), '  ·  '.join(p + '+' for p in plus), font=font('manrope-700', 15), fill=TEAL)
        y += ROW_H
    y += 20
    d.line([(PAD, y), (W - PAD, y)], fill=(45, 226, 197), width=2)
    tracked(d, (PAD, y + 20), 'PROCLUBSHQ.COM', font('manrope-700', 20), TEAL, 6)
    d.text((PAD, y + 50), 'Ceilings from the retail catalog · every archetype priced live in a free builder', font=font('manrope-700', 16), fill=MUTED)
    out = os.path.join(OUT, 'fc27-archetype-shapes.png')
    img.save(out, optimize=True)
    print(f'  {os.path.basename(out)}  {W}x{H}  {os.path.getsize(out) // 1024} KB')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    sheet()
    tops()
