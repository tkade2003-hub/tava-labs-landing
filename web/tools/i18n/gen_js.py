#!/usr/bin/env python3
"""Generate a localized page script from its English source.

Only string literals change. The string table for a script lives in
web/lib/i18n/js-strings/<table>.en.json (entries with the exact English
literal, its quote kind, and an optional anchor context) and the
translation in <table>.<locale>.json (same keys, field "t").

Replacement rules:
- dq/sq entries replace every occurrence of the quoted literal, except
  anchored entries, which replace only inside their anchor snippet
  (used where the same literal is also a code identifier, such as a
  form field id).
- tpl entries replace the single template literal; the translation
  must carry the exact same ${...} expressions and no backticks.

After generation the caller should run verify_js.py, which checks the
localized file against the English one with all string literal
contents stripped: the two must be identical outside the literals.

Usage: gen_js.py <quiz|success> <locale>
Writes public/page-scripts-i18n/<file>.<locale>.js
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TABLES = {
    "quiz": ("quiz", "quiz-41.js"),
    "success": ("success", "checkout-success-42.js"),
}
QUOTE = {"dq": '"', "sq": "'", "tpl": "`"}
EXPR_RE = re.compile(r"\$\{[^}]*\}")


def escape(text: str, quote: str) -> str:
    out = text.replace("\\", "\\\\")
    if quote == '"':
        out = out.replace('"', '\\"')
    elif quote == "'":
        out = out.replace("'", "\\'")
    out = out.replace("\n", "\\n").replace("\r", "\\r")
    return out


def main():
    table_key, locale = sys.argv[1], sys.argv[2]
    table_name, filename = TABLES[table_key]
    strings_dir = ROOT / "lib" / "i18n" / "js-strings"
    en_table = json.loads(
        (strings_dir / f"{table_name}.en.json").read_text(encoding="utf-8")
    )
    loc_table = json.loads(
        (strings_dir / f"{table_name}.{locale}.json").read_text(encoding="utf-8")
    )
    translations = {e["k"]: e["t"] for e in loc_table["entries"]}
    src = (ROOT / "public" / "page-scripts" / filename).read_text(encoding="utf-8")

    for entry in en_table["entries"]:
        k, q, en = entry["k"], entry["q"], entry["en"]
        if k not in translations:
            raise SystemExit(f"missing translation for {k}")
        t = translations[k]
        quote = QUOTE[q]
        if q == "tpl":
            if "`" in t:
                raise SystemExit(f"{k}: translation contains a backtick")
            if sorted(EXPR_RE.findall(en)) != sorted(EXPR_RE.findall(t)):
                raise SystemExit(f"{k}: template expressions differ")
            needle = quote + en + quote
            if src.count(needle) != 1:
                raise SystemExit(f"{k}: template found {src.count(needle)} times")
            src = src.replace(needle, quote + t + quote)
        elif "anchor" in entry:
            anchor = entry["anchor"]
            if src.count(anchor) != 1:
                raise SystemExit(f"{k}: anchor found {src.count(anchor)} times")
            new_anchor = anchor.replace(
                quote + en + quote, quote + escape(t, quote) + quote
            )
            src = src.replace(anchor, new_anchor)
        else:
            needle = quote + en + quote
            if needle not in src:
                raise SystemExit(f"{k}: literal not found")
            src = src.replace(needle, quote + escape(t, quote) + quote)

    out_dir = ROOT / "public" / "page-scripts-i18n"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{filename[:-3]}.{locale}.js"
    out_path.write_text(src, encoding="utf-8")
    print(f"gen {out_path.name}: ok")


if __name__ == "__main__":
    main()
