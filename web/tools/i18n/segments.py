#!/usr/bin/env python3
"""Segment extraction and reassembly for PageData JSON content.

The blob pages (blog posts, legal pages, quiz, checkout success and
cancel) store their body as one contentHtml string. Translating them
safely means translating only the human readable text while every tag,
attribute, class, and image stays byte identical.

extract:  python3 segments.py extract <page.json> <segments.json>
  Writes a segments file: the page title and description plus every
  text node and every display attribute value (alt, title, placeholder,
  aria-label, data-step-label), in document order. Inline data URI
  images are swapped for tokens first so segment files stay small; the
  tokens are rehydrated on apply.

apply:    python3 segments.py apply <page.json> <segments.json> <out.json>
  Rebuilds the page JSON with the translated segments in place of the
  English ones, verifying that every source segment still matches the
  English text recorded at extract time.

A segments file is plain JSON: {"title": ..., "description": ...,
"segments": [{"id": 0, "text": "..."}, ...]}. Translators edit the
"text" values (and title/description) and nothing else.
"""
import json
import re
import sys
from pathlib import Path

DATA_URI_RE = re.compile(r"data:[a-zA-Z0-9/;,+=._-]+")
TOKEN_FMT = "§IMG{}§"
ATTR_NAMES = ["alt", "title", "placeholder", "aria-label", "data-step-label"]
ATTR_RE = {
    name: re.compile(r'(?<![\w-])' + re.escape(name) + r'="([^"]*)"')
    for name in ATTR_NAMES
}


def tokenize(html: str):
    """Split html into ('tag'|'text', chunk) pieces, preserving bytes."""
    pieces = []
    i = 0
    n = len(html)
    while i < n:
        if html[i] == "<":
            # Tag, comment, or doctype: scan to the closing '>' while
            # respecting quoted attribute values.
            j = i + 1
            quote = None
            while j < n:
                c = html[j]
                if quote:
                    if c == quote:
                        quote = None
                elif c in "\"'":
                    quote = c
                elif c == ">":
                    break
                j += 1
            pieces.append(("tag", html[i : j + 1]))
            i = j + 1
        else:
            j = html.find("<", i)
            if j == -1:
                j = n
            pieces.append(("text", html[i:j]))
            i = j
    return pieces


def detokenize_data_uris(html: str):
    uris = []

    def repl(m):
        uris.append(m.group(0))
        return TOKEN_FMT.format(len(uris) - 1)

    return DATA_URI_RE.sub(repl, html), uris


def segmentable(pieces):
    """Yield (seg_index, piece_index, kind, attr_name, current_text).

    Text and attributes inside <script> and <style> elements are never
    segments: their content is code, not copy.
    """
    idx = 0
    suppressed = None  # "script" or "style" while inside such an element
    for pi, (kind, chunk) in enumerate(pieces):
        if kind == "tag":
            low = chunk.lower()
            if suppressed:
                if low.startswith(f"</{suppressed}"):
                    suppressed = None
                continue
            if low.startswith("<script") and not chunk.rstrip().endswith("/>"):
                suppressed = "script"
                continue
            if low.startswith("<style") and not chunk.rstrip().endswith("/>"):
                suppressed = "style"
                continue
            for name in ATTR_NAMES:
                for m in ATTR_RE[name].finditer(chunk):
                    if m.group(1).strip():
                        yield idx, pi, "attr", name, m.group(1)
                        idx += 1
        else:
            if suppressed:
                continue
            if chunk.strip():
                yield idx, pi, "text", None, chunk
                idx += 1


def extract(page_path: Path, out_path: Path):
    data = json.loads(page_path.read_text(encoding="utf-8"))
    html, uris = detokenize_data_uris(data.get("contentHtml", ""))
    pieces = tokenize(html)
    segments = []
    for idx, _pi, _kind, _attr, text in segmentable(pieces):
        segments.append({"id": idx, "text": text})
    out = {
        "slug": data.get("slug"),
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "segments": segments,
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    print(
        f"extract {page_path.name}: {len(segments)} segments, "
        f"{len(uris)} data uris tokenized"
    )


def apply(page_path: Path, seg_path: Path, out_path: Path):
    data = json.loads(page_path.read_text(encoding="utf-8"))
    seg = json.loads(seg_path.read_text(encoding="utf-8"))
    translations = {s["id"]: s["text"] for s in seg["segments"]}
    html, uris = detokenize_data_uris(data.get("contentHtml", ""))
    pieces = tokenize(html)
    seen = 0
    rebuilt = []
    seg_iter = segmentable(pieces)
    seg_map = {}
    for idx, pi, kind, attr, text in seg_iter:
        seg_map.setdefault(pi, []).append((idx, kind, attr, text))
        seen += 1
    if seen != len(translations):
        raise SystemExit(
            f"segment count mismatch: source {seen} vs translations {len(translations)}"
        )
    for pi, (kind, chunk) in enumerate(pieces):
        if pi not in seg_map:
            rebuilt.append(chunk)
            continue
        if kind == "text":
            idx = seg_map[pi][0][0]
            rebuilt.append(translations[idx])
        else:
            new_chunk = chunk
            # Replace attribute values from the last occurrence backwards
            # so offsets stay valid within this tag chunk.
            entries = seg_map[pi]
            spans = []
            for idx, _k, attr, text in entries:
                for m in ATTR_RE[attr].finditer(new_chunk):
                    if m.group(1) == text:
                        spans.append((m.start(1), m.end(1), translations[idx]))
                        break
                else:
                    raise SystemExit(f"attr segment not found: {attr}={text!r}")
            for start, end, value in sorted(spans, reverse=True):
                new_chunk = new_chunk[:start] + value + new_chunk[end:]
            rebuilt.append(new_chunk)
    html = "".join(rebuilt)
    for i, uri in enumerate(uris):
        html = html.replace(TOKEN_FMT.format(i), uri)
    data["contentHtml"] = html
    data["title"] = seg.get("title", data.get("title", ""))
    data["description"] = seg.get("description", data.get("description", ""))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    print(f"apply {page_path.name} -> {out_path.name}: ok")


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "extract":
        extract(Path(sys.argv[2]), Path(sys.argv[3]))
    elif cmd == "apply":
        apply(Path(sys.argv[2]), Path(sys.argv[3]), Path(sys.argv[4]))
    else:
        raise SystemExit(f"unknown command {cmd}")
