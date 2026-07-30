#!/usr/bin/env python3
"""Stamp style.css/site-tweaks.css/shop.css/shop.js with a content hash (?v=...)
in index.html and en/index.html, so Cloudflare/browser caches bust only when
the file content actually changes.

Rerun after any edit to one of the tracked assets:
    python update_asset_versions.py
"""

import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent

TRACKED_FILES = ["style.css", "site-tweaks.css", "shop.css", "shop.js"]
HTML_FILES = ["index.html", "en/index.html"]

HASH_LENGTH = 10


def content_hash(path: Path) -> str:
    data = path.read_bytes()
    return hashlib.sha256(data).hexdigest()[:HASH_LENGTH]


def main() -> None:
    hashes = {}
    for name in TRACKED_FILES:
        path = ROOT / name
        if not path.exists():
            print(f"  ! skipping {name}: file not found")
            continue
        hashes[name] = content_hash(path)

    for html_name in HTML_FILES:
        html_path = ROOT / html_name
        if not html_path.exists():
            print(f"  ! skipping {html_name}: file not found")
            continue

        text = html_path.read_text(encoding="utf-8")
        original = text
        changed_here = []

        for name, digest in hashes.items():
            escaped = re.escape(name)
            pattern = re.compile(
                r'((?:href|src)=")([^"]*/)?' + escaped + r'(\?v=[a-f0-9]+)?(")'
            )

            def replace(match, name=name, digest=digest):
                attr, prefix, _old_v, quote = match.groups()
                prefix = prefix or ""
                return f"{attr}{prefix}{name}?v={digest}{quote}"

            text, count = pattern.subn(replace, text)
            if count:
                changed_here.append((name, digest, count))

        if text != original:
            html_path.write_text(text, encoding="utf-8")
            for name, digest, count in changed_here:
                print(f"  {html_name}: {name} -> ?v={digest} ({count} ref)")
        else:
            print(f"  {html_name}: no changes")

    print("Done.")


if __name__ == "__main__":
    main()
