"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, localizeHref, type Locale } from "@/lib/i18n/config";

// Shared 404 body. Not-found boundaries receive no route params, so the
// locale is read from the URL prefix on the client; English is the
// fallback for root level misses and unknown prefixes.
export default function NotFoundBody() {
  const pathname = usePathname() ?? "";
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  const locale: Locale = isLocale(first) ? first : "en";
  const c = getDictionary(locale).chrome;
  const lh = (href: string) => localizeHref(href, locale);
  return (
    <SiteShell locale={locale}>
      <section className="mx-auto flex max-w-7xl flex-col items-start px-5 py-24 sm:px-8">
        <p className="tava-label">{c.notFoundLabel}</p>
        <h1 className="mt-4 font-display text-5xl font-semibold text-forest-deep sm:text-6xl">
          {c.notFoundTitle}
        </h1>
        <p className="mt-4 max-w-md leading-relaxed text-ink/75">{c.notFoundBody}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button render={<Link href={lh("/")} />} size="lg">
            {c.notFoundHome}
          </Button>
          <Button
            render={<Link href={lh("/glow-brightening-serum")} />}
            variant="outline"
            size="lg"
          >
            {c.notFoundShop}
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
