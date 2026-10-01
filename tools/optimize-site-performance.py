#!/usr/bin/env python3
"""Build lightweight responsive images and improve static HTML loading hints.

Run from the repository root. The script is intentionally conservative:
- social sharing JPEGs stay JPEG for broad crawler compatibility;
- large content JPEGs become WebP;
- only images large enough to benefit receive one 640 px mobile derivative;
- existing markup and formatting are preserved as much as possible.
"""

from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import urlsplit

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
PHOTO_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}
TEXT_SUFFIXES = {".html", ".css", ".js", ".json"}
MOBILE_WIDTH = 640


def save_webp(source: Path, destination: Path, max_width: int | None = None) -> None:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        if max_width and image.width > max_width:
            height = round(image.height * max_width / image.width)
            image = image.resize((max_width, height), Image.Resampling.LANCZOS)
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, "WEBP", quality=78, method=6)


def replace_asset_references(replacements: dict[str, str]) -> None:
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        if ".git" in path.parts:
            continue
        original = path.read_text(encoding="utf-8")
        updated = original
        for old, new in replacements.items():
            updated = updated.replace(old, new)
        if updated != original:
            path.write_text(updated, encoding="utf-8")


def resolve_image(html_path: Path, raw_url: str) -> Path | None:
    if not raw_url or raw_url.startswith(("data:", "http://", "https://", "${")):
        return None
    clean = urlsplit(raw_url).path
    if clean.startswith("/assets/"):
        candidate = ROOT / clean.lstrip("/")
    else:
        candidate = (html_path.parent / clean).resolve()
    try:
        candidate.relative_to(ROOT)
    except ValueError:
        return None
    return candidate


def mobile_url(raw_url: str) -> str:
    path, separator, query = raw_url.partition("?")
    mobile = str(Path(path).with_suffix("")) + f"-{MOBILE_WIDTH}.webp"
    return mobile + (separator + query if separator else "")


def add_image_hints(html_path: Path, source_widths: dict[Path, int]) -> None:
    original = html_path.read_text(encoding="utf-8")

    def update_tag(match: re.Match[str]) -> str:
        tag = match.group(0)
        lower = tag.lower()
        source_match = re.search(r'\b(data-lazy-src|data-src|src)\s*=\s*(["\'])(.*?)\2', tag, re.I | re.S)
        if not source_match:
            return tag

        attribute = source_match.group(1).lower()
        raw_url = source_match.group(3)
        source_path = resolve_image(html_path, raw_url)
        is_brand = "/brand/" in raw_url.replace("\\", "/")
        is_primary_hero = bool(
            re.search(r'\bid\s*=\s*["\']heroImage["\']', tag, re.I)
            or re.search(r'\bclass\s*=\s*["\'][^"\']*\b(?:ct-hero-image|hero-slide\s+is-active)\b', tag, re.I)
            or ("/hero.webp" in raw_url and "loading=" not in lower)
        )

        additions: list[str] = []
        if "decoding=" not in lower:
            additions.append('decoding="async"')
        if "loading=" not in lower and not is_brand and not is_primary_hero:
            additions.append('loading="lazy"')
        if is_primary_hero and "fetchpriority=" not in lower:
            additions.append('fetchpriority="high"')

        if source_path and source_path in source_widths and "srcset=" not in lower:
            responsive_attr = "data-lazy-srcset" if attribute == "data-lazy-src" else "data-srcset" if attribute == "data-src" else "srcset"
            additions.append(
                f'{responsive_attr}="{mobile_url(raw_url)} {MOBILE_WIDTH}w, {raw_url} {source_widths[source_path]}w"'
            )
            if "sizes=" not in lower:
                sizes = "100vw" if is_primary_hero else "(max-width: 720px) 100vw, 960px"
                additions.append(f'sizes="{sizes}"')

        if not additions:
            return tag
        close = " />" if tag.endswith(" />") else ">"
        body = tag[: -len(close)].rstrip()
        return f'{body} {" ".join(additions)}{close}'

    updated = re.sub(r"<img\b[^>]*>", update_tag, original, flags=re.I | re.S)
    if updated != original:
        html_path.write_text(updated, encoding="utf-8")


def replace_google_fonts(html_path: Path) -> None:
    original = html_path.read_text(encoding="utf-8")
    updated = re.sub(
        r'\s*<link\s+rel=["\']preconnect["\']\s+href=["\']https://fonts\.(?:googleapis|gstatic)\.com["\'](?:\s+crossorigin)?\s*/?>',
        "",
        original,
        flags=re.I,
    )
    updated = re.sub(
        r'\s*<link\b(?=[^>]*href=["\']https://fonts\.googleapis\.com/)[^>]*>',
        "",
        updated,
        flags=re.I | re.S,
    )
    if updated != original and "/assets/local-fonts.css" not in updated:
        marker = '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
        font_link = '\n    <link rel="stylesheet" href="/assets/local-fonts.css?v=1" />'
        if marker in updated:
            updated = updated.replace(marker, marker + font_link, 1)
        else:
            updated = updated.replace("</head>", f"  {font_link.strip()}\n  </head>", 1)
    if updated != original:
        html_path.write_text(updated, encoding="utf-8")


def main() -> None:
    replacements: dict[str, str] = {}

    # Convert large content JPEGs and the decorative journey PNG to WebP.
    conversion_candidates = [
        path
        for path in ASSETS.rglob("*")
        if path.is_file()
        and path.suffix.lower() in {".jpg", ".jpeg"}
        and not path.name.endswith("-og.jpg")
        and path.stat().st_size >= 300_000
    ]
    journey_line = ASSETS / "products/tailor-made-trips/journey-line.png"
    if journey_line.exists():
        conversion_candidates.append(journey_line)

    for source in conversion_candidates:
        destination = source.with_suffix(".webp")
        save_webp(source, destination, max_width=1600)
        replacements[source.relative_to(ROOT).as_posix()] = destination.relative_to(ROOT).as_posix()

    replace_asset_references(replacements)

    # Generate a single mobile derivative only where it saves meaningful bytes.
    responsive_widths: dict[Path, int] = {}
    for source in ASSETS.rglob("*"):
        if not source.is_file() or source.suffix.lower() not in PHOTO_SUFFIXES:
            continue
        if source.name.endswith("-og.jpg") or re.search(r"-\d+\.webp$", source.name):
            continue
        if source.stat().st_size < 180_000:
            continue
        try:
            with Image.open(source) as image:
                width = image.width
        except OSError:
            continue
        if width <= 800:
            continue
        mobile = source.with_name(f"{source.stem}-{MOBILE_WIDTH}.webp")
        save_webp(source, mobile, max_width=MOBILE_WIDTH)
        responsive_widths[source.resolve()] = width

    for html_path in ROOT.rglob("*.html"):
        if ".git" in html_path.parts:
            continue
        replace_google_fonts(html_path)
        add_image_hints(html_path, responsive_widths)

    print(f"Converted {len(conversion_candidates)} large content images to WebP.")
    print(f"Generated {len(responsive_widths)} mobile image variants.")
    print(f"Updated {len(list(ROOT.rglob('*.html')))} HTML files.")
    for old, new in sorted(replacements.items()):
        print(f"  {old} -> {new}")


if __name__ == "__main__":
    main()
