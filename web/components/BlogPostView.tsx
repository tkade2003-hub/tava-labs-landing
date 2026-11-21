import SiteShell from "./SiteShell";
import RawHtml from "./RawHtml";
import type { PageData } from "@/lib/pageData";

/**
 * Blog post in the new shell: the stored article markup (tb-* classes,
 * styled by the .tava-blog prose rules in globals.css) inside the new
 * Header and Footer. The stored Webflow header and footer are dropped.
 */
export default function BlogPostView({ data }: { data: PageData }) {
  return (
    <SiteShell>
      <div className="tava-blog">
        <RawHtml html={data.contentHtml} />
      </div>
    </SiteShell>
  );
}
