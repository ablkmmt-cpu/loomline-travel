#!/usr/bin/env python3
"""
optimize-images.py — 把 assets 下的照片型图片转换为 WebP，并可为社交分享图生成 JPEG。

用途：上线前 / 每次新增行程产品图片后运行。
- 品牌 logo、favicon、apple-touch-icon、线稿图 journey-line.png 会保留原格式。
- 默认把 jpg/png 照片转成 WebP（减少显示体积）；
- 加 --og 会扫描各页面的 og:image/twitter:image，缺省时生成对应的 -og.jpg 分享图（社交平台全兼容）。

用法:
    python3 tools/optimize-images.py            # 全量转 WebP
    python3 tools/optimize-images.py --og       # 同时为各页分享图生成/补齐 -og.jpg
    python3 tools/optimize-images.py --dry      # 只预览，不写入
    python3 tools/optimize-images.py --q 82     # 指定质量（默认 PNG=85, JPG=80）
"""
import os
import sys
import re
import glob
import argparse
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")

# 保留原格式的路径（品牌 logo / favicon / apple-touch-icon / 线稿图）
KEEP = ("assets/brand/", "assets/services/custom-tour/journey-line.png")


def keep(path):
    rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
    return any(rel.startswith(p) or rel == p for p in KEEP)


def target_files():
    out = []
    for dirpath, _dirs, files in os.walk(ASSETS):
        for fn in files:
            low = fn.lower()
            # -og.jpg 是社交分享图（JPEG），不能再转 webp
            if low.endswith("-og.jpg"):
                continue
            if low.endswith((".png", ".jpg", ".jpeg")):
                p = os.path.join(dirpath, fn)
                if keep(p):
                    continue
                out.append(p)
    return out


def _to_rgb(im):
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        rgba = im.convert("RGBA")
        bg = Image.new("RGB", rgba.size, (255, 255, 255))
        bg.paste(rgba, mask=rgba.split()[-1])
        return bg
    return im.convert("RGB")


def gen_og(quality=85):
    """扫描各页面 og:image / twitter:image，为缺失的生成 <名>-og.jpg（JPEG 分享图）。"""
    urls = set()
    for f in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
        if "/previews/" in f or "/templates/" in f:
            continue
        try:
            s = open(f, encoding="utf-8").read()
        except OSError:
            continue
        for m in re.finditer(r'(?:property|name)="(?:og:image|twitter:image)"\s+content="([^"]+)"', s):
            u = m.group(1)
            if u.startswith("https://loomlinetravel.com/assets/"):
                urls.add(u.replace("https://loomlinetravel.com/", ""))
    made = 0
    for rel in sorted(urls):
        if not rel or "{OG" in rel:
            continue
        src = os.path.join(ROOT, rel)
        if not os.path.isfile(src):
            continue
        base, _ext = os.path.splitext(src)
        og = base + "-og.jpg"          # 与 rel 同目录 / <名字>-og.jpg
        if os.path.isfile(og):
            continue
        try:
            im = _to_rgb(Image.open(src))
            im.save(og, "JPEG", quality=quality, optimize=True)
            print("  ✅ 分享图 %s" % os.path.relpath(og, ROOT).replace(os.sep, "/"))
            made += 1
        except Exception as e:  # noqa: BLE001
            print("  [跳过] %s (%s)" % (rel, e))
    print("分享图: 新生成 %d 张（其余已存在）" % made)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--q", type=int, default=None, help="统一质量覆盖")
    ap.add_argument("--dry", action="store_true", help="仅预览")
    ap.add_argument("--og", action="store_true", help="同时为各页分享图生成/补齐 -og.jpg")
    args = ap.parse_args()

    files = target_files()
    total_before = total_after = 0
    for p in sorted(files):
        stem, ext = os.path.splitext(p)
        newp = stem + ".webp"
        try:
            im = _to_rgb(Image.open(p))
        except Exception as e:  # noqa: BLE001
            print("  [跳过] %s (%s)" % (p, e))
            continue
        q = args.q or (85 if ext.lower() == ".png" else 80)
        before = os.path.getsize(p)
        if args.dry:
            print("  [dry] %s -> %s (q%s)" % (p, newp, q))
            continue
        im.save(newp, "WEBP", quality=q, method=6)
        after = os.path.getsize(newp)
        rel = os.path.relpath(p, ROOT).replace(os.sep, "/")
        total_before += before
        total_after += after
        print("  ✅ %s -> %s  (%.2fMB -> %.2fMB)" % (
            rel, os.path.relpath(newp, ROOT).replace(os.sep, "/"),
            before / 1048576, after / 1048576))
        os.remove(p)

    if not args.dry:
        print("\nWebP 合计: %.1fMB -> %.1fMB (省 %.0f%%)" % (
            total_before / 1048576, total_after / 1048576,
            100 * (1 - total_after / max(total_before, 1))))

    if args.og:
        gen_og()


if __name__ == "__main__":
    main()
