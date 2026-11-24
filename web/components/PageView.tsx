import RawHtml from "./RawHtml";
import ScriptLoader from "./ScriptLoader";
import type { PageData } from "@/lib/pageData";
import sharedStyles from "@/lib/shared-styles.json";
import { rewriteHrefs } from "@/lib/i18n/rewriteHtml";
import type { Locale } from "@/lib/i18n/config";

// Renders one ported page: its preserved stylesheets and style blocks, its
// structured data, the shared site chrome for its family, the page content
// exactly as it appeared on the static site, and its preserved scripts.
export default function PageView({
  data,
  locale = "en",
}: {
  data: PageData;
  locale?: Locale;
}) {
  if (locale !== "en") {
    data = {
      ...data,
      contentHtml: rewriteHrefs(data.contentHtml, locale),
      headerHtml: data.headerHtml
        ? rewriteHrefs(data.headerHtml, locale)
        : data.headerHtml,
      footerHtml: data.footerHtml
        ? rewriteHrefs(data.footerHtml, locale)
        : data.footerHtml,
      scripts: data.scripts.map((sc) =>
        sc.src === "/page-scripts/quiz-41.js"
          ? { ...sc, src: `/page-scripts-i18n/quiz-41.${locale}.js` }
          : sc.src === "/page-scripts/checkout-success-42.js"
            ? { ...sc, src: `/page-scripts-i18n/checkout-success-42.${locale}.js` }
            : sc,
      ),
    };
  }
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
