import type { Metadata } from "next";
import type { PageData } from "@/lib/pageData";

// Builds the page metadata from the stored page record, the same way the
// ported pages did, so titles, descriptions, and canonicals do not drift.
export function pageMetadata(data: PageData): Metadata {
  return {
    title: data.title,
    description: data.description,
    ...(data.canonical
      ? {
          alternates: {
            canonical:
              "https://tavalabs.app" +
              (data.canonical === "/" ? "" : data.canonical),
          },
        }
      : {}),
  };
}
