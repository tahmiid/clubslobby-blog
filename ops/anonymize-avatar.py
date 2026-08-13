"""Turn a photograph into a byline avatar that cannot be un-blurred.

Used 2026-08-13 to replace the author photo (see DEPLOYMENT.md §7c). Kept
because the reasoning is easy to get wrong and the wrong version looks
identical to the right one.

**A blur alone does not anonymise a face.** Gaussian blur is a convolution: it
keeps every pixel's contribution, spread out. Deconvolution can pull a
recognisable face back out of a blurred one, and even where it can't, a person
who knows the subject usually still recognises them — a 512px photo blurred to
"soft" is still a photo of somebody.

So the face is destroyed *first*, by throwing pixels away, and only then
smoothed:

  1. downscale to a ~10x10 grid   — the information is now gone, permanently
  2. upscale back with bicubic    — a colour field, not a mosaic
  3. light Gaussian blur          — removes the interpolation seams

Step 1 is the one that matters. Steps 2 and 3 are cosmetic: a visible mosaic
reads as "something is being hidden here", which is a worse look on a byline
than an abstract avatar.

Grid sizes tried against the real photo before picking 10: at 24 the face is
still recognisable to anyone who knows it, at 16 it is a man with dark hair in
a blue shirt, at 10 there is no facial information left at all.

    python3 ops/anonymize-avatar.py source.jpg author-buildmaster-v2.jpg

Then copy it into Ghost's content/images/<yyyy>/<mm>/ as ghost:ghost 644 and
point the user's profile_image at it. **Use a new filename every time** —
Cloudflare caches content/images for a year, so a same-name replacement serves
the old picture more or less forever (DEPLOYMENT.md gotcha, same trap the
cover art hit).
"""
import sys

from PIL import Image, ImageFilter

GRID = 10   # the anonymisation. Lower is safer; higher is recognisable.
BLUR = 22   # cosmetic only
SIZE = 512  # Ghost resizes down from here


def main(src, dst):
    im = Image.open(src).convert("RGB")
    tiny = im.resize((GRID, GRID), Image.LANCZOS)
    big = tiny.resize((SIZE, SIZE), Image.BICUBIC).filter(ImageFilter.GaussianBlur(BLUR))
    big.save(dst, "JPEG", quality=88, optimize=True)
    print(f"{dst}: {im.size[0]}px source -> {GRID}x{GRID} grid -> {SIZE}px, blur {BLUR}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("usage: anonymize-avatar.py <source-image> <output.jpg>")
    main(sys.argv[1], sys.argv[2])
