import Header from "./Header";
import Footer from "./Footer";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

// The shared shell for rebuilt pages: forest green header and footer
// around the page content. The locale selects the dictionary the chrome
// renders in; English is the default and stays at the root.
export default function SiteShell({
  children,
  locale = "en",
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);
  return (
    <>
      <Header locale={locale} dict={dict} />
      <main>{children}</main>
      <Footer locale={locale} dict={dict} />
    </>
  );
}
