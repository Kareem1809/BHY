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


def main():
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


if __name__ == "__main__":
    main()
