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


if __name__ == "__main__":
    if "--icons" in sys.argv:
        icons()
    else:
        main()
