import type { Metadata } from "next";
import type { PageData } from "@/lib/pageData";

const SITE_URL = "https://tavalabs.app";
const OG_IMAGE = "/assets/IMG_3265.jpeg";

// Builds the page metadata from the stored page record, the same way the
// ported pages did, so titles, descriptions, and canonicals do not drift.
// Open Graph and Twitter cards ride on the same title and description so
// shared links present the same message as search results.
export function pageMetadata(data: PageData): Metadata {
  const url = data.canonical
    ? SITE_URL + (data.canonical === "/" ? "" : data.canonical)
    : undefined;
  const isArticle =
    !!data.canonical &&
    data.canonical.startsWith("/blog/") &&
    data.canonical !== "/blog";
  return {
    title: data.title,
    description: data.description,
    ...(data.canonical
      ? {
          alternates: {
            canonical: url,
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
