import type { Metadata } from "next";
import type { PageData } from "@/lib/pageData";
import {
  languageAlternates,
  localizedCanonical,
  type Locale,
} from "@/lib/i18n/config";

const OG_IMAGE = "/assets/IMG_3265.jpeg";

// Builds the page metadata from the stored page record, the same way the
// ported pages did, so titles, descriptions, and canonicals do not drift.
// Open Graph and Twitter cards ride on the same title and description so
// shared links present the same message as search results.
//
// With a locale, the canonical becomes the locale prefixed URL and the
// full hreflang language map is attached; the English default keeps the
// historical behavior byte for byte apart from the added alternates.
export function pageMetadata(data: PageData, locale: Locale = "en"): Metadata {
  const path = data.canonical ?? undefined;
  const url = path ? localizedCanonical(path, locale) : undefined;
  const isArticle =
    !!path && path.startsWith("/blog/") && path !== "/blog";
  return {
    title: data.title,
    description: data.description,
    ...(path
      ? {
          alternates: {
            canonical: url,
            languages: languageAlternates(path),
          },
        }
      : {}),
    openGraph: {
      title: data.title,
      description: data.description,
      siteName: "Tava Labs",
      type: isArticle ? "article" : "website",
      ...(url ? { url } : {}),
      images: [{ url: OG_IMAGE, alt: "Tava Labs PDRN Brightening Serum" }],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: [OG_IMAGE],
    },
  };
}

/** Metadata for the React pages, whose copy lives in the dictionaries. */
export function localizedMetadata(
  path: string,
  title: string,
  description: string,
  locale: Locale,
): Metadata {
  const url = localizedCanonical(path, locale);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      title,
      description,
      siteName: "Tava Labs",
      type: "website",
      url,
      images: [{ url: OG_IMAGE, alt: "Tava Labs PDRN Brightening Serum" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}
