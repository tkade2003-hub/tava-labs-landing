#!/usr/bin/env python3
"""Validate locale dictionaries against en.json.

Checks, for every locale JSON in web/lib/i18n/locales/:
- the key structure matches en.json exactly (same dict keys, same list
  lengths, same leaf types), walking recursively;
- no leaf string is empty;
- price strings are preserved: every $ amount that appears in the
  English leaf appears in the translated leaf;
- protected product names survive: "PDRN Brightening Serum" and
  "Tava Skin Complex" appear wherever the English leaf carries them;
- banned provider names (MyDose, PanelRoute) appear nowhere.

Usage: check_dicts.py [locale ...]   (default: all locales present)
Exit code 0 when everything passes.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCALES_DIR = ROOT / "lib" / "i18n" / "locales"
PRICE_RE = re.compile(r"\$\d+(?:\.\d+)?")
PROTECTED = ["PDRN Brightening Serum", "Tava Skin Complex"]
BANNED = ["MyDose", "PanelRoute", "mydose", "panelroute"]


def walk(en, other, path, errors, locale):
    if isinstance(en, dict):
        if not isinstance(other, dict):
            errors.append(f"{locale}:{path}: expected object")
            return
        for k in en:
            if k not in other:
                errors.append(f"{locale}:{path}.{k}: MISSING KEY")
            else:
                walk(en[k], other[k], f"{path}.{k}", errors, locale)
        for k in other:
            if k not in en:
                errors.append(f"{locale}:{path}.{k}: EXTRA KEY")
    elif isinstance(en, list):
        if not isinstance(other, list):
            errors.append(f"{locale}:{path}: expected list")
            return
        if len(en) != len(other):
            errors.append(
                f"{locale}:{path}: list length {len(other)} != {len(en)}"
            )
            return
        for i, (a, b) in enumerate(zip(en, other)):
            walk(a, b, f"{path}[{i}]", errors, locale)
    elif isinstance(en, str):
        if not isinstance(other, str):
            errors.append(f"{locale}:{path}: expected string")
            return
        if other.strip() == "" and en.strip() != "":
            errors.append(f"{locale}:{path}: EMPTY STRING")
            return
        en_prices = sorted(PRICE_RE.findall(en))
        other_prices = sorted(PRICE_RE.findall(other))
        if en_prices != other_prices:
            errors.append(
                f"{locale}:{path}: prices differ en={en_prices} got={other_prices}"
            )
        for name in PROTECTED:
            if name in en and name not in other:
                errors.append(f"{locale}:{path}: lost protected name {name!r}")
        for name in BANNED:
            if name in other:
                errors.append(f"{locale}:{path}: banned provider name {name!r}")


def main():
    en = json.loads((LOCALES_DIR / "en.json").read_text(encoding="utf-8"))
    wanted = sys.argv[1:]
    files = sorted(LOCALES_DIR.glob("*.json"))
    errors = []
    checked = []
    for f in files:
        locale = f.stem
        if locale == "en":
            continue
        if wanted and locale not in wanted:
            continue
        checked.append(locale)
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except Exception as e:  # noqa: BLE001
            errors.append(f"{locale}: INVALID JSON {e}")
            continue
        walk(en, data, locale, errors, locale)
    for e in errors:
        print(e)
    print(f"checked {len(checked)} locales, {len(errors)} errors")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
