"""One-shot image pipeline for the BHY site.

- Composes the social share card  (assets/og.jpg, 1200x630)
- Converts every photo to WebP: a full-size print + a phone print
- Renames the journal photos to process-N (the section they now serve)

Run from the repo root:  python3 tools/images.py
The JPEG/PNG originals are left in place; delete them by hand once the
WebP prints have been checked.
"""
import os
import sys

from PIL import Image, ImageEnhance, ImageOps

A = "app/public/assets"


def load(path):
    return ImageOps.exif_transpose(Image.open(path))


def fit_width(im, w):
    if im.width <= w:
        return im
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def webp(im, path, q):
    im.save(path, "WEBP", quality=q, method=6)
    return os.path.getsize(path)


def compose_og():
    poster = load(f"{A}/hero-poster.jpg").convert("RGB")
    og = ImageOps.fit(poster, (1200, 630), Image.LANCZOS)
    # a soft dark foot so the ivory lockup reads on the cream film frame
    mask = Image.new("L", (1, 630))
    for y in range(630):
        t = max(0.0, (y - 260) / 370)
        mask.putpixel((0, y), int(215 * t * t))
    mask = mask.resize((1200, 630))
    dark = Image.new("RGB", og.size, (25, 15, 9))
    og = Image.composite(dark, og, mask)
    logo = load(f"{A}/logo.png").convert("RGBA")
    logo = fit_width(logo, 430)
    rgb = ImageEnhance.Brightness(logo.convert("RGB")).enhance(1.22)
    logo = Image.merge("RGBA", (*rgb.split(), logo.split()[3]))
    og.paste(logo, (1200 - logo.width - 64, 630 - logo.height - 36), logo)
    og.save(f"{A}/og.jpg", "JPEG", quality=86, optimize=True, progressive=True)
    print(f"og.jpg {og.size} {os.path.getsize(f'{A}/og.jpg') // 1024}KB")


def light_logo():
    """The print for dark ground.

    The lockup's own colours are mid-tone bronze and olive: measured against
    the espresso section they read at 4.0:1 on average and 1.4:1 at the worst,
    which is why the mark sank into the brown instead of standing on it. This
    keeps the artwork's alpha exactly as drawn and repaints it in paper, with a
    whisper of the original modelling left so the leaves and the column do not
    flatten into one shape. On the espresso that is 11:1.
    """
    im = load(f"{A}/logo.webp").convert("RGBA")
    alpha = im.split()[3]
    grey = im.convert("L")
    paper = (245, 239, 230)
    # 0.86 -> 1.0 of paper, following the original's own light and shade
    shade = grey.point(lambda v: int(220 + 35 * (v / 255)))
    out = Image.merge(
        "RGBA",
        (
            shade.point(lambda v: min(255, round(v * paper[0] / 255))),
            shade.point(lambda v: min(255, round(v * paper[1] / 255))),
            shade.point(lambda v: min(255, round(v * paper[2] / 255))),
            alpha,
        ),
    )
    out.save(f"{A}/logo-light.webp", "WEBP", lossless=True, quality=100, method=6)
    print(f"logo-light.webp {out.size} {os.path.getsize(f'{A}/logo-light.webp') // 1024}KB")


def main():
    if "--light-logo" in sys.argv:
        light_logo()
        return
    if not os.path.exists(f"{A}/hero-poster.jpg"):
        sys.exit("originals already converted, nothing to do")
    compose_og()

    # (source, output, cap width, quality, phone width)
    jobs = [
        ("hero-poster", "hero-poster", 2880, 78, 1280),
        ("services-bg", "services-bg", 1600, 80, 720),
        ("about-main", "about-main", 1400, 82, 720),
        ("about-side", "about-side", 1400, 82, 720),
    ]
    jobs += [(f"journal-{i}", f"process-{i}", 1000, 82, 720) for i in range(1, 5)]
    jobs += [(f"service-{i}", f"service-{i}", 1000, 82, 720) for i in range(1, 5)]
    jobs += [
        (f"projects/proj{p}-{k}", f"projects/proj{p}-{k}", 1600, 82, 720)
        for p in range(1, 5)
        for k in range(1, 5)
    ]

    before = after = 0
    for src, out, cap, q, sm_w in jobs:
        im = load(f"{A}/{src}.jpg").convert("RGB")
        orig = os.path.getsize(f"{A}/{src}.jpg")
        before += orig
        full = webp(fit_width(im, cap), f"{A}/{out}.webp", q)
        sm = webp(fit_width(im, sm_w), f"{A}/{out}-sm.webp", q - 2)
        after += full
        print(f"{out:22s} {im.width:4d}px {orig // 1024:4d}KB -> {full // 1024:4d}KB   phone {sm // 1024:3d}KB")

    for name in ("logo", "footer-logo"):
        im = load(f"{A}/{name}.png").convert("RGBA")
        orig = os.path.getsize(f"{A}/{name}.png")
        before += orig
        im.save(f"{A}/{name}.webp", "WEBP", lossless=True, quality=100, method=6)
        size = os.path.getsize(f"{A}/{name}.webp")
        after += size
        print(f"{name:22s} {im.width:4d}px {orig // 1024:4d}KB -> {size // 1024:4d}KB   (lossless)")

    print(f"\nfull prints: {before / 1e6:.2f}MB -> {after / 1e6:.2f}MB")


# ---------------------------------------------------------------- icons
# The four app icons shipped with the scaffold were the whole logo squeezed
# into a square, which cut her wordmark through the middle of the letters —
# visible on a home screen, in the install prompt and in the app switcher.
# They are rebuilt here from the emblem alone: the column, the monogram and
# its branches, centred on her paper with nothing running off the edge.
EMBLEM = (572, 99, 1204, 679)  # the emblem band inside assets/logo.webp


def emblem_card(margin=0.09):
    """Her emblem, squared on the paper, with `margin` of clear ground."""
    logo = load(f"{A}/logo.webp").convert("RGBA")
    em = logo.crop(EMBLEM)
    side = round(max(em.size) * (1 + margin * 2))
    card = Image.new("RGBA", (side, side), (245, 239, 230, 255))
    card.alpha_composite(em, ((side - em.width) // 2, (side - em.height) // 2))
    return card.convert("RGB")


def icons():
    card = emblem_card()
    for name, size in (("apple-touch-icon.png", 180), ("icon-192.png", 192), ("icon-512.png", 512)):
        card.resize((size, size), Image.LANCZOS).save(f"app/public/{name}")
        print(f"{name:24s} {size}px  from the emblem")
    # A maskable icon may be cropped to a circle: everything that matters has
    # to sit inside the middle 80%.
    safe = emblem_card(margin=0.28).resize((512, 512), Image.LANCZOS)
    safe.save("app/public/icon-512-maskable.png")
    print(f"{'icon-512-maskable.png':24s} 512px  with the safe zone")

    # And the file every browser asks for by name. Her watercolour hairline
    # cannot survive 16px, so the small sizes carry the monogram the way
    # favicon.svg draws it — her rose on her paper — and 48px carries the
    # emblem itself.
    from PIL import ImageDraw, ImageFont

    def lettered(size):
        im = Image.new("RGB", (size, size), (245, 239, 230))
        draw = ImageDraw.Draw(im)
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia.ttf",
                                  round(size * 0.62))
        box = draw.textbbox((0, 0), "BY", font=font)
        draw.text(((size - box[2] + box[0]) / 2 - box[0],
                   (size - box[3] + box[1]) / 2 - box[1] - size * 0.04),
                  "BY", font=font, fill=(148, 85, 58))
        draw.line((size * 0.26, size * 0.84, size * 0.74, size * 0.84),
                  fill=(125, 122, 78), width=max(1, round(size / 22)))
        return im

    ico = lettered(64)
    ico.save("app/public/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"{'favicon.ico':24s} 16/32/48")


# ------------------------------------------------------------ the maker's mark
# SITENA built this site, and the footer credits them. What Kareem sent is a
# mockup — the lockup photographed on a dark wall — and dropping that dark card
# into an ivory footer looked exactly like what it was: a sticker.
#
# So the artwork is lifted off its wall in its own colours. The wall is dark,
# smooth and almost grey, so a pixel belongs to the lockup if it is brighter
# than its own surroundings (subtract a heavily blurred copy) OR if it carries
# any real colour at all — the second test is what keeps the navy letters,
# which are no brighter than the wall they sit on.
#
# Then one correction: the tagline and the brightest highlights were drawn for
# a dark ground, and on paper they all but vanish. Where a pixel is pale AND
# unsaturated its value is pulled down, so the line reads as type again.
SITENA_SRC = os.path.expanduser("~/Downloads/image-1788459329574.webp")
SITENA_CROP = (285, 195, 1760, 900)


def sitena():
    from PIL import ImageChops, ImageFilter

    art = load(SITENA_SRC).convert("RGB").crop(SITENA_CROP)
    hue, sat, val = art.convert("HSV").split()

    lift = ImageChops.subtract(val, val.filter(ImageFilter.GaussianBlur(30)))
    alpha = ImageChops.lighter(
        lift.point(lambda v: 0 if v < 12 else min(255, int((v - 12) * 3.6))),
        sat.point(lambda v: 0 if v < 60 else min(255, int((v - 60) * 2.0))),
    ).filter(ImageFilter.GaussianBlur(0.5))

    pale = sat.point(lambda v: 255 if v < 45 else 0)
    bright = val.point(lambda v: 255 if v > 150 else 0)
    onPaper = Image.composite(val.point(lambda v: int(v * 0.42)), val,
                              ImageChops.multiply(pale, bright))
    art = Image.merge("HSV", (hue, sat, onPaper)).convert("RGB")

    cut = art.copy()
    cut.putalpha(alpha)
    # 176 CSS px at most on screen, so 600 is already three times a retina
    # pixel: 1200 was six, and four times the bytes for nothing anyone can see.
    cut = fit_width(cut.crop(cut.getbbox()), 600)
    cut.save(f"{A}/sitena.webp", "WEBP", quality=90, method=6, exact=True)
    size = os.path.getsize(f"{A}/sitena.webp")
    print(f"{'sitena.webp':22s} {cut.width}x{cut.height}  {size // 1024}KB  (its own colours, no ground)")


# ------------------------------------------------------- the nav's own prints
# Her lockup is drawn on a 1800x1001 canvas with the artwork itself only 796px
# across the middle of it — more than half the file is empty. In the footer that
# air is welcome; in the navbar it meant the mark was two fifths of the height
# it looked like it had, and on a phone it came out 59px in a 90px bar.
#
# So the navbar gets its own pair of prints, cropped to the artwork and nothing
# else. Both are cut with the SAME box, because they are stacked on top of each
# other and the ink one is clipped to whatever is light behind it: a pixel of
# drift between them would show as a seam through the middle of the mark.
def nav_prints():
    """Two prints of her lockup for the navbar, both in her own colours.

    A repaint in flat ink and flat paper was legible and wrong — Kareem, once
    he saw it: «لععع بديش اياه اسود وابيض». Her mark keeps its bronze and its
    olive; what changes between the two prints is only how the picture is
    exposed. Against paper and against the film's lit ceiling the artwork is
    taken DOWN (72% of its brightness, a little more colour and contrast), which
    is what makes the hairlines of the column hold. Against the espresso it is
    taken UP (126%), which is what keeps the leaves green instead of black. The
    navbar switches between them by reading the ground, so neither has to work
    everywhere.
    """
    from PIL import ImageEnhance

    src = load(f"{A}/logo.webp").convert("RGBA")
    art = src.crop(src.getbbox())
    rgb, alpha = art.convert("RGB"), art.split()[3]

    def tuned(bright, colour, contrast=1.0):
        out = ImageEnhance.Color(ImageEnhance.Brightness(rgb).enhance(bright)).enhance(colour)
        if contrast != 1.0:
            out = ImageEnhance.Contrast(out).enhance(contrast)
        out = out.convert("RGBA")
        out.putalpha(alpha)
        return out

    for mark, name in ((tuned(0.72, 1.25, 1.10), "nav-mark.webp"),
                       (tuned(1.26, 1.20), "nav-mark-light.webp")):
        cut = fit_width(mark, 900)
        cut.save(f"{A}/{name}", "WEBP", lossless=True, quality=100, method=6, exact=True)
        print(f"{name:22s} {cut.width}x{cut.height}  {os.path.getsize(f'{A}/{name}') // 1024}KB")
    print(f"{'':22s} cropped to the artwork, {art.size} of {src.size}")


if __name__ == "__main__":
    if "--nav-prints" in sys.argv:
        nav_prints()
    elif "--sitena" in sys.argv:
        sitena()
    elif "--icons" in sys.argv:
        icons()
    else:
        main()
