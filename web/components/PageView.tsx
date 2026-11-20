import RawHtml from "./RawHtml";
import ScriptLoader from "./ScriptLoader";
import type { PageData } from "@/lib/pageData";
import sharedStyles from "@/lib/shared-styles.json";

// Renders one ported page: its preserved stylesheets and style blocks, its
// structured data, the shared site chrome for its family, the page content
// exactly as it appeared on the static site, and its preserved scripts.
export default function PageView({ data }: { data: PageData }) {
  const styles = [
    ...(data.family === "webflow" ? (sharedStyles as string[]) : []),
    ...data.styles,
  ];
  return (
    <>
      {data.preconnects.map((href) => (
        <link key={href} rel="preconnect" href={href} />
      ))}
      {data.cssLinks.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {styles.map((css, i) => (
        <style key={i} dangerouslySetInnerHTML={{ __html: css }} />
      ))}
      {data.ldjson.map((json, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}
      {data.headerHtml ? <RawHtml html={data.headerHtml} /> : null}
      <RawHtml html={data.contentHtml} />
      {data.footerHtml ? <RawHtml html={data.footerHtml} /> : null}
      <ScriptLoader
        scripts={data.scripts}
        htmlAttrs={data.htmlAttrs}
        bodyClass={data.bodyClass}
      />
    </>
  );
}
