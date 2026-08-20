"""Derived controller glyphs — everything not shipped in the owner's pack.

The pack (`Buttons.zip`) is the source and is NEVER edited. Anything this repo
needs beyond it is generated here, from the pack, so it can be rebuilt from
scratch and so the provenance of every file is obvious from its name.

Run after replacing the pack:  python3 gen/make-derived-glyphs.py

## Naming convention

    {token}.svg              straight from the pack — do not edit
    {token}-badge.svg        the stick without its outer rim, for the corner of
                             a flick icon
    {token}-locked.svg       the stick with a bar through it: "keep centred"

A suffix always describes a TREATMENT of the token it hangs off, never a new
control. `r-badge` is still the right stick. Anything that is a different
control gets its own token, taken from the dataset's vocabulary
(see ClubsUI-main/backend/CONTROLS.md §2).

## The three jobs

1. **Share the stick glyphs across platforms.** `L` and `R` are the same
   physical control on both pads and carry the same letter, but the pack draws
   the Xbox pair with a slanted letterform whose angled leg is hard to read at
   badge size. The owner's call (2026-08-20) is to use the PlayStation drawing
   on both. This applies ONLY to the sticks — face buttons, shoulders and
   triggers are genuinely different controls per platform and must stay as the
   pack has them.

2. **Badge variants.** At badge size the stick's outer rim is most of what you
   see and the letter inside it is not. Each set draws that rim differently — a
   stroked `<circle class="st1">` in colour/PS, a full-canvas donut `<path>` in
   the others — so both forms are removed.

3. **Locked variants.** A stick the wording calls "centred" must stay untouched
   for the whole action. That is an instruction, not an absence of one, so it
   gets its own glyph rather than being left off the sequence.
"""
import os, re, shutil

ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'controls')
SETS, PLATFORMS, STICKS = ('mono', 'colour'), ('ps', 'xbox'), ('l', 'r')

RING_CIRCLE = re.compile(r'<circle[^>]*class="st1"[^>]*/>')
SHAPE = re.compile(r'<path[^>]*\sd="([^"]+)"[^>]*/>')
# A donut: starts at the canvas edge and carries a second subpath, which is the hole.
is_ring = lambda d: d.startswith('M250,0') and d.count('M250,') >= 2

BAR = ('<g><line x1="95" y1="405" x2="405" y2="95" stroke="#0a1826" stroke-width="58" '
       'stroke-linecap="round"/><line x1="95" y1="405" x2="405" y2="95" stroke="#fff" '
       'stroke-width="34" stroke-linecap="round"/></g>')


def strip_rim(svg):
    svg = RING_CIRCLE.sub('', svg)
    for m in list(SHAPE.finditer(svg)):
        if is_ring(m.group(1)):
            svg = svg.replace(m.group(0), '', 1)
    return svg


def main():
    shared = badges = locks = 0
    for st in SETS:
        # 1. the PlayStation stick drawing wins on both platforms
        for tok in STICKS:
            src = os.path.join(ROOT, st, 'ps', f'{tok}.svg')
            dst = os.path.join(ROOT, st, 'xbox', f'{tok}.svg')
            if os.path.exists(src):
                shutil.copyfile(src, dst); shared += 1

        for pl in PLATFORMS:
            for tok in STICKS:
                src = os.path.join(ROOT, st, pl, f'{tok}.svg')
                if not os.path.exists(src):
                    continue
                base = open(src).read()
                # 2. badge
                open(os.path.join(ROOT, st, pl, f'{tok}-badge.svg'), 'w').write(strip_rim(base))
                badges += 1
                # 3. locked
                open(os.path.join(ROOT, st, pl, f'{tok}-locked.svg'), 'w').write(
                    re.sub(r'</svg>\s*$', BAR + '</svg>', base))
                locks += 1
    print(f'  stick drawings shared to Xbox: {shared}')
    print(f'  -badge variants:               {badges}')
    print(f'  -locked variants:              {locks}')


if __name__ == '__main__':
    main()
