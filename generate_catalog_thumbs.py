#!/usr/bin/env python3
"""Generate lightweight WebP thumbnails for the catalog grid (cards + card
carousel), separate from the full-resolution files used on artwork detail
pages, and emit shop.js's CATALOG_THUMBS lookup map + rerun the asset
version stamping.

Rerun after adding new artwork photos to the catalog:
    python generate_catalog_thumbs.py
"""

import hashlib
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
SHOP_JS = ROOT / "shop.js"

MAX_DIM = 700       # ~2x retina headroom for the widest grid cell (~340px)
QUALITY = 82
HASH_LENGTH = 10

# FR and EN reference the exact same source photos (just translated text /
# absolute vs relative paths), so scanning index.html alone is enough to
# know which files the catalog grid can show.
SOURCE_HTML = "index.html"

MAP_MARKER_START = "// __CATALOG_THUMBS_START__"
MAP_MARKER_END = "// __CATALOG_THUMBS_END__"

STRING_PATTERN = re.compile(r'"([^"]+)"')


def extract_set(js_text: str, name: str) -> set:
    pattern = re.compile(r"const " + re.escape(name) + r" = new Set\(\[([\s\S]*?)\]\)")
    m = pattern.search(js_text)
    if not m:
        return set()
    return set(STRING_PATTERN.findall(m.group(1)))


def collect_referenced_images():
    """Mirror shop.js's collectProducts(): only images inside actual
    artwork sections (excludes category/editorial pages and hidden slugs),
    skipping any <img data-shop-exclude> the same way getSectionImages does."""
    shop_js_text = SHOP_JS.read_text(encoding="utf-8")
    category_sections = extract_set(shop_js_text, "CATEGORY_SECTIONS")
    hidden_slugs = extract_set(shop_js_text, "HIDDEN_SLUGS")

    html_text = (ROOT / SOURCE_HTML).read_text(encoding="utf-8")
    section_pattern = re.compile(r'<section id="([\w-]+)-section"[^>]*>([\s\S]*?)</section>')

    paths = set()
    for slug, block in section_pattern.findall(html_text):
        if slug in category_sections or slug in hidden_slugs:
            continue
        for img_tag in re.findall(r"<img[^>]*>", block):
            if "data-shop-exclude" in img_tag:
                continue
            m = re.search(r'(?:data-src|src)="([^"]+\.webp)(?:\?[^"]*)?"', img_tag)
            if not m:
                continue
            paths.add(m.group(1).lstrip("/"))
    return sorted(paths)


def content_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:HASH_LENGTH]


def thumb_path_for(rel_path: str) -> str:
    p = Path(rel_path)
    return str(p.with_name(p.stem + "-thumb" + p.suffix)).replace("\\", "/")


def main():
    referenced = collect_referenced_images()
    print(f"{len(referenced)} fichiers image référencés (fiches détail + catalogue).")

    entries = {}
    generated, reused, missing = 0, 0, 0
    before_total = 0
    after_total = 0

    for rel_path in referenced:
        src_path = ROOT / rel_path
        if not src_path.exists():
            print(f"  ! introuvable, ignoré : {rel_path}")
            missing += 1
            continue

        before_total += src_path.stat().st_size

        with Image.open(src_path) as im:
            w, h = im.size
            if max(w, h) <= MAX_DIM:
                # Already small enough: reuse the original as its own "thumb".
                out_path = src_path
                reused += 1
            else:
                thumb_rel = thumb_path_for(rel_path)
                out_path = ROOT / thumb_rel
                scale = MAX_DIM / max(w, h)
                resized = im.convert("RGB").resize(
                    (round(w * scale), round(h * scale)), Image.LANCZOS
                )
                resized.save(out_path, "WEBP", quality=QUALITY, method=6)
                generated += 1

        after_total += out_path.stat().st_size
        digest = content_hash(out_path)
        out_rel = str(out_path.relative_to(ROOT)).replace("\\", "/")
        entries[rel_path] = f"{out_rel}?v={digest}"

    print(f"Miniatures générées : {generated} | déjà assez légères (réutilisées telles quelles) : {reused} | introuvables : {missing}")
    print(f"Poids total (fichiers sources concernés) : {before_total / 1024 / 1024:.2f} Mo -> {after_total / 1024 / 1024:.2f} Mo")

    # Emit the JS map, sorted for a stable diff.
    js_lines = [MAP_MARKER_START]
    js_lines.append("  const CATALOG_THUMBS = {")
    for key in sorted(entries):
        js_lines.append(f"    {json.dumps(key)}: {json.dumps(entries[key])},")
    js_lines.append("  };")
    js_lines.append(MAP_MARKER_END)
    js_block = "\n".join(js_lines)

    shop_js_text = SHOP_JS.read_text(encoding="utf-8")
    if MAP_MARKER_START in shop_js_text:
        shop_js_text = re.sub(
            re.escape(MAP_MARKER_START) + r"[\s\S]*?" + re.escape(MAP_MARKER_END),
            lambda _m: js_block,
            shop_js_text,
            count=1,
        )
        SHOP_JS.write_text(shop_js_text, encoding="utf-8")
        print("shop.js : CATALOG_THUMBS mis à jour.")
    else:
        print("! Marqueur CATALOG_THUMBS introuvable dans shop.js — insertion manuelle nécessaire.")
        print(js_block)


if __name__ == "__main__":
    main()
