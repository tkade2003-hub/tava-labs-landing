#!/usr/bin/env python3
"""Build compact localized PageData files into lib/pages-i18n/.

For each locale and page: applies the translated segments file from
tools/i18n/staging/<locale>/ onto the English page JSON (verifying
segment alignment), then writes a compact record {title, description,
contentHtml} with data URIs swapped back to §IMGn§ tokens.

Usage: build_localized.py <locale> [page ...]
Pages default to every staged file for the locale.
"""
import json
import re
import sys
from pathlib import Path

WEB = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(WEB / "tools" / "i18n"))
import segments as seg  # noqa: E402

DATA_URI_RE = re.compile(r"data:[a-zA-Z0-9/;,+=._-]+")


def compact(html: str) -> str:
    out = []
    last = 0
    n = 0
    for m in DATA_URI_RE.finditer(html):
        out.append(html[last : m.start()])
        out.append(f"§IMG{n}§")
        n += 1
        last = m.end()
    out.append(html[last:])
    return "".join(out)


def main() -> int:
    locale = sys.argv[1]
    stage = WEB / "tools" / "i18n" / "staging" / locale
    names = sys.argv[2:] or sorted(
        p.name.replace(".segments.json", "") for p in stage.glob("*.segments.json")
    )
    outdir = WEB / "lib" / "pages-i18n"
    outdir.mkdir(exist_ok=True)
    import tempfile

    for name in names:
        with tempfile.NamedTemporaryFile(
            "r", suffix=".json", delete=False
        ) as tmp:
            tmp_path = Path(tmp.name)
        seg.apply(WEB / "lib" / "pages" / f"{name}.json", stage / f"{name}.segments.json", tmp_path)
        built = json.loads(tmp_path.read_text(encoding="utf-8"))
        tmp_path.unlink()
        record = {
            "title": built["title"],
            "description": built["description"],
            "contentHtml": compact(built["contentHtml"]),
        }
        (outdir / f"{name}.{locale}.json").write_text(
            json.dumps(record, ensure_ascii=False), encoding="utf-8"
        )
        print(f"{locale}/{name}: ok ({len(record['contentHtml'])} chars)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
