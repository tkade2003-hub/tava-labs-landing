import { localizeHref, type Locale } from "./config";

// Rewrites root relative hrefs inside stored page HTML so links on a
// localized blob page (blog post, legal page, quiz, checkout) stay
// inside the same locale. External URLs, anchors, mailto and tel links,
// and asset paths pass through localizeHref unchanged by design.
export function rewriteHrefs(html: string, locale: Locale): string {
  if (locale === "en") return html;
  return html.replace(
    /href="(\/[^"]*)"/g,
    (_m, href: string) => `href="${localizeHref(href, locale)}"`,
  );
}
