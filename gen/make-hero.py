#!/usr/bin/env python3
"""Turn the locker-room photo into the site hero.

Four things happen here, in order, and each one has a reason:

1. Hue rotation. The source is magenta/purple lighting, which fights the brand
   blue everything else uses. Rotating hue moves the practical lights into the
   #256abf family without touching the neutral concrete or the white kit.
2. A bottom gradient, heavy enough to sink the floor into shadow. This is not
   only a text-readability trick: the source has another club's crest projected
   on the floor, and the site should not appear to be affiliated with it.
3. A top gradient, so the navigation and site title stay legible over it.
4. Overall darkening, because Source renders its heading in white directly on
   this image.

Run:  python3 gen/make-hero.py
Out:  assets/hero-lobby.jpg
"""
from PIL import Image, ImageEnhance
import os

SRC = os.path.join(os.path.dirname(__file__), '..', 'assets', 'locker-room.jpg')
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'hero-lobby.jpg')

# Measured, not guessed: the source lighting sits at 230-250 degrees and the
# brand blue (#256abf) at 213, so the correction is about -22 degrees. PIL's H
# channel is 0-255 rather than 0-359, and conflating the two is exactly how an
# earlier pass overshot by 78 degrees and turned the room teal.
HUE_SHIFT_DEG = -22
HUE_SHIFT = round(HUE_SHIFT_DEG / 360 * 255)

# The other club's crest is projected across rows 62-88% of the frame. A
# gradient never fully buried it, so the bottom is cropped away instead — which
# also yields a wide cinematic hero rather than a near-square one.
CROP_BOTTOM = 0.62
TARGET_W = 1920

img = Image.open(SRC).convert('RGB')
img = img.crop((0, 0, img.width, round(img.height * CROP_BOTTOM)))

h, s, v = img.convert('HSV').split()
h = h.point(lambda p: (p + HUE_SHIFT) % 256)
# Pull saturation back slightly — the source lighting is very intense, and the
# widgets sitting on top of this page are already saturated blue.
s = s.point(lambda p: int(p * 0.86))
img = Image.merge('HSV', (h, s, v)).convert('RGB')

img = ImageEnhance.Brightness(img).enhance(0.80)
img = ImageEnhance.Contrast(img).enhance(1.05)

w, hgt = img.size
overlay = Image.new('L', (1, hgt))
for y in range(hgt):
    t = y / (hgt - 1)
    # Scrims at both edges only: the crest is gone with the crop, so these exist
    # purely so white nav and heading text stay legible over the photo.
    top = max(0.0, 1.0 - t / 0.34) * 0.46
    bottom = max(0.0, (t - 0.62) / 0.38) ** 1.4 * 0.55
    overlay.putpixel((0, y), int(255 * min(1.0, top + bottom)))
mask = overlay.resize((w, hgt))
img = Image.composite(Image.new('RGB', (w, hgt), (8, 26, 56)), img, mask)

if w != TARGET_W:
    img = img.resize((TARGET_W, round(hgt * TARGET_W / w)), Image.LANCZOS)

img.save(OUT, 'JPEG', quality=86, optimize=True, progressive=True)
print(f'{OUT}  {img.size[0]}x{img.size[1]}  {os.path.getsize(OUT) // 1024}KB')
