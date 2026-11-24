import SiteShell from "./SiteShell";
import RawHtml from "./RawHtml";
import type { PageData } from "@/lib/pageData";
import { rewriteHrefs } from "@/lib/i18n/rewriteHtml";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

/**
 * Legal page in the new shell. The stored text stays byte verbatim; only
 * the empty header and footer component placeholders are removed, since
 * the new Header and Footer components provide the chrome. Styling comes
 * from the .tava-legal prose rules in globals.css.
 */
function stripChromePlaceholders(html: string): string {
  return html
    .replace(/<div data-component="header"><\/div>/g, "")
    .replace(/<div data-component="footer"[^>]*><\/div>/g, "");
}

export default function LegalView({
  data,
  locale = "en",
}: {
  data: PageData;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);
  return (
    <SiteShell locale={locale}>
      <div className="tava-legal">
        <RawHtml
          html={rewriteHrefs(stripChromePlaceholders(data.contentHtml), locale)}
        />
        {locale !== "en" ? <p>{dict.legal.governsNote}</p> : null}
      </div>
    </SiteShell>
  );
}
