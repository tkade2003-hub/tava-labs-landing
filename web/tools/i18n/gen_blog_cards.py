#!/usr/bin/env python3
"""Generate localized blog card data for the journal index and home.

Mirrors lib/blog.ts: the six featured posts keep the stored index
order, every post's card is derived from its own stored page (headline,
meta line, first long paragraph, first image). For a locale, cards are
derived from that locale's post JSONs in lib/pages-i18n/, falling back
to the English post when a translation is not present yet.

Usage: gen_blog_cards.py <locale>
Writes lib/pages-i18n/blog-cards.<locale>.json
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PAGES = ROOT / "lib" / "pages"
I18N = ROOT / "lib" / "pages-i18n"

POST_SLUGS = [
    "camera-ready-skin",
    "cortisol-and-decision-making",
    "founder-stress-response",
    "how-much-sleep-do-founders-need",
    "look-sharp-by-9am",
    "night-shift",
    "pdrn-explained",
    "science-of-attractive-health",
    "signs-of-founder-burnout",
    "sleep-and-fundraising-performance",
    "start-slow",
    "why-founders-cant-sleep",
]


def strip_tags(html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", html)
    for ent, ch in [
        ("&amp;", "&"),
        ("&mdash;", "—"),
        ("&rsquo;", "’"),
        ("&lsquo;", "‘"),
        ("&ldquo;", "“"),
        ("&rdquo;", "”"),
        ("&#x27;", "'"),
        ("&#39;", "'"),
        ("&nbsp;", " "),
    ]:
        text = text.replace(ent, ch)
    return re.sub(r"\s+", " ", text).strip()


def card_from_post(slug: str, data: dict) -> dict:
    html = data["contentHtml"]
    title_m = re.search(r"<h1[^>]*>([\s\S]*?)</h1>", html)
    meta_m = re.search(r"tb-meta[^>]*>([\s\S]*?)</div>", html)
    img_m = re.search(r'<img[^>]+src="([^"]+)"[^>]*?(?:alt="([^"]*)")?', html)
    excerpt = ""
    for p in re.finditer(r"<p[^>]*>([\s\S]*?)</p>", html):
        text = strip_tags(p.group(1))
        if len(text) >= 40:
            excerpt = text
            break
    title = strip_tags(title_m.group(1)) if title_m else ""
    return {
        "href": f"/blog/{slug}",
        "meta": strip_tags(meta_m.group(1)) if meta_m else "",
        "title": title,
        "excerpt": excerpt,
        "image": img_m.group(1) if img_m else "",
        "imageAlt": strip_tags(img_m.group(2)) if img_m and img_m.group(2) else title,
    }


def load_post(slug: str, locale: str) -> dict:
    localized = I18N / f"blog-{slug}.{locale}.json"
    if locale != "en" and localized.exists():
        return json.loads(localized.read_text(encoding="utf-8"))
    return json.loads((PAGES / f"blog-{slug}.json").read_text(encoding="utf-8"))


def main():
    locale = sys.argv[1]
    index = json.loads((PAGES / "blog-index.json").read_text(encoding="utf-8"))
    featured = []
    for m in re.finditer(r'<a class="tb-card" href="([^"]+)">', index["contentHtml"]):
        href = m.group(1)
        slug = href.rsplit("/", 1)[-1]
        if slug in POST_SLUGS and slug not in featured:
            featured.append(slug)
    order = featured + [s for s in POST_SLUGS if s not in featured]
    cards = [card_from_post(slug, load_post(slug, locale)) for slug in order]
    I18N.mkdir(parents=True, exist_ok=True)
    out = I18N / f"blog-cards.{locale}.json"
    out.write_text(json.dumps(cards, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"blog cards {locale}: {len(cards)} cards")


if __name__ == "__main__":
    main()
