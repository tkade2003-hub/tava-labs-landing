import fs from "node:fs";
import path from "node:path";
import type { PageData } from "./pageData";
import type { Locale } from "./i18n/config";

// Loads localized PageData for the blob pages (blog posts, legal pages,
// quiz, checkout success and cancel).
//
// Localized files live in lib/pages-i18n/<name>.<locale>.json in a
// compact form: title, description, and contentHtml whose inline data
// URI images are replaced by §IMGn§ tokens (the images are identical in
// every language). At load time the tokens are rehydrated from the
// English page record, and every other field (styles, scripts,
// structured data) comes from the English record as well. When no
// localized file exists yet, the English record is returned unchanged.

const DATA_URI_RE = /data:[a-zA-Z0-9/;,+=._-]+/g;
const TOKEN_RE = /§IMG(\d+)§/g;

const cache = new Map<string, PageData>();

function readJson(file: string): unknown | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return null;
  }
}

export function getLocalizedPageData(name: string, locale: Locale): PageData {
  const key = `${name}.${locale}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const english = readJson(
    path.join(process.cwd(), "lib", "pages", `${name}.json`),
  ) as PageData;
  if (locale === "en") {
    cache.set(key, english);
    return english;
  }

  const loc = readJson(
    path.join(process.cwd(), "lib", "pages-i18n", `${name}.${locale}.json`),
  ) as { title?: string; description?: string; contentHtml?: string } | null;
  if (!loc || typeof loc.contentHtml !== "string") {
    cache.set(key, english);
    return english;
  }

  const images = english.contentHtml.match(DATA_URI_RE) ?? [];
  const contentHtml = loc.contentHtml.replace(
    TOKEN_RE,
    (_m, n: string) => images[Number(n)] ?? "",
  );
  const merged: PageData = {
    ...english,
    title: loc.title ?? english.title,
    description: loc.description ?? english.description,
    contentHtml,
  };
  cache.set(key, merged);
  return merged;
}
