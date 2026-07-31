#!/usr/bin/env python3
"""Generate lightweight WebP thumbnails for the Expositions masonry gallery
(3-column grid, ~340-700px display width), separate from the full-resolution
source photos, and rewrite the <img src> in index.html / en/index.html to
point to them.

Rerun after adding new photos to the expo gallery:
    python generate_expo_thumbs.py
"""

import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
MAX_DIM = 700
QUALITY = 82
HTML_FILES = ["index.html", "en/index.html"]


def collect_expo_images():
    text = (ROOT / "index.html").read_text(encoding="utf-8")
    m = re.search(r'<section id="expo-section"[^>]*>([\s\S]*?)</section>', text)
    block = m.group(1)
    return sorted(set(re.findall(r'src="galerie-expos/([^"]+\.webp)"', block)))


def thumb_name(name: str) -> str:
    p = Path(name)
    return p.stem + "-thumb" + p.suffix


def main():
    names = collect_expo_images()
    print(f"{len(names)} photos référencées dans la galerie Expositions.")

    generated, reused = 0, 0
    before_total = after_total = 0

    for name in names:
        src_path = ROOT / "galerie-expos" / name
        if not src_path.exists():
            print(f"  ! introuvable, ignoré : {name}")
            continue

        before_total += src_path.stat().st_size

        with Image.open(src_path) as im:
            w, h = im.size
            if max(w, h) <= MAX_DIM:
                out_path = src_path
                reused += 1
            else:
                out_path = ROOT / "galerie-expos" / thumb_name(name)
                scale = MAX_DIM / max(w, h)
                resized = im.convert("RGB").resize(
                    (round(w * scale), round(h * scale)), Image.LANCZOS
                )
                resized.save(out_path, "WEBP", quality=QUALITY, method=6)
                generated += 1

        after_total += out_path.stat().st_size

        if out_path != src_path:
            thumb_rel = thumb_name(name)
            for html_name in HTML_FILES:
                html_path = ROOT / html_name
                text = html_path.read_text(encoding="utf-8")
                pattern = re.compile(
                    r'(src=")(/?)galerie-expos/' + re.escape(name) + r'(")'
                )
                text, count = pattern.subn(
                    lambda m: f'{m.group(1)}{m.group(2)}galerie-expos/{thumb_rel}{m.group(3)}',
                    text,
                )
                if count:
                    html_path.write_text(text, encoding="utf-8")

    print(f"Miniatures générées : {generated} | déjà assez légères : {reused}")
    print(f"Poids total : {before_total / 1024 / 1024:.2f} Mo -> {after_total / 1024 / 1024:.2f} Mo")


if __name__ == "__main__":
    main()
