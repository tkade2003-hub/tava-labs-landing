import SiteShell from "./SiteShell";
import RawHtml from "./RawHtml";
import type { PageData } from "@/lib/pageData";
import { rewriteHrefs } from "@/lib/i18n/rewriteHtml";
import type { Locale } from "@/lib/i18n/config";

/**
 * Blog post in the new shell: the stored article markup (tb-* classes,
 * styled by the .tava-blog prose rules in globals.css) inside the new
 * Header and Footer. The stored Webflow header and footer are dropped.
 */
export default function BlogPostView({
  data,
  locale = "en",
}: {
  data: PageData;
  locale?: Locale;
}) {
  return (
    <SiteShell locale={locale}>
      <div className="tava-blog">
        <RawHtml html={rewriteHrefs(data.contentHtml, locale)} />
      </div>
    </SiteShell>
  );
}
