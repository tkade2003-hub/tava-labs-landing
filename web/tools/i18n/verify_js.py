#!/usr/bin/env python3
"""Verify a localized page script differs from English only in strings.

Strips the contents of every string literal (single, double, and
template quotes) from both files with a small state machine and
compares what remains: code, identifiers, numbers, punctuation, and
literal boundaries must be identical. Also asserts the protected
constants (prices, product id, SKU, endpoint URLs) survive verbatim.

Usage: verify_js.py <english.js> <localized.js>
"""
import sys

PROTECTED = [
    "cbbc7de1-994e-45be-94d8-ac4be3b8cc18",
    "VASHO-PBS-8FB6",
    "funnel-intake",
    "claim-lookup",
]


def strip_literals(src: str) -> str:
    out = []
    i = 0
    n = len(src)
    while i < n:
        c = src[i]
        if c in "\"'`":
            quote = c
            out.append(quote)
            i += 1
            depth = 0
            while i < n:
                ch = src[i]
                if ch == "\\":
                    i += 2
                    continue
                if quote == "`" and ch == "$" and i + 1 < n and src[i + 1] == "{":
                    depth += 1
                    out.append("${")
                    i += 2
                    # Copy the expression verbatim; it is code, and it
                    # may itself contain string literals, which we keep
                    # because both files must share them exactly.
                    start = i
                    d = 1
                    while i < n and d > 0:
                        if src[i] == "{":
                            d += 1
                        elif src[i] == "}":
                            d -= 1
                        i += 1
                    out.append(src[start:i])
                    depth -= 1
                    continue
                if ch == quote:
                    out.append(quote)
                    i += 1
                    break
                i += 1
            continue
        if c == "/" and i + 1 < n and src[i + 1] == "/":
            j = src.find("\n", i)
            j = n if j == -1 else j
            out.append(src[i:j])
            i = j
            continue
        if c == "/" and i + 1 < n and src[i + 1] == "*":
            j = src.find("*/", i)
            j = n if j == -1 else j + 2
            out.append(src[i:j])
            i = j
            continue
        out.append(c)
        i += 1
    return "".join(out)


def main():
    en = open(sys.argv[1], encoding="utf-8").read()
    loc = open(sys.argv[2], encoding="utf-8").read()
    if strip_literals(en) != strip_literals(loc):
        print("FAIL: code outside string literals differs")
        a, b = strip_literals(en), strip_literals(loc)
        for i, (x, y) in enumerate(zip(a, b)):
            if x != y:
                print(f"first diff at {i}: en={a[max(0,i-60):i+60]!r}")
                print(f"               loc={b[max(0,i-60):i+60]!r}")
                break
        if len(a) != len(b):
            print(f"stripped lengths differ: {len(a)} vs {len(b)}")
        return 1
    for token in PROTECTED:
        en_has = token in en
        if en_has and token not in loc:
            print(f"FAIL: protected token lost: {token}")
            return 1
    print("OK: identical outside string literals")
    return 0


if __name__ == "__main__":
    sys.exit(main())
