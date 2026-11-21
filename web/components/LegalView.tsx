import SiteShell from "./SiteShell";
import RawHtml from "./RawHtml";
import type { PageData } from "@/lib/pageData";

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

export default function LegalView({ data }: { data: PageData }) {
  return (
    <SiteShell>
      <div className="tava-legal">
        <RawHtml html={stripChromePlaceholders(data.contentHtml)} />
      </div>
    </SiteShell>
  );
}
