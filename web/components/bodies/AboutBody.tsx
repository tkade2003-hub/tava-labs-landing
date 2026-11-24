import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function AboutBody({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.about;
  const lh = (href: string) => localizeHref(href, locale);
  return (
    <SiteShell locale={locale}>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8 lg:pt-20">
        <p className="tava-label">
          {t.label}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] font-semibold text-forest-deep sm:text-6xl">
          {t.titleLead} <span className="gold-metal-text">{t.titleAccent}</span>
        </h1>
        <p className="mt-4 font-display text-2xl text-forest italic">
          {t.tagline}
        </p>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="space-y-5 leading-relaxed text-ink/80">
            <p>{t.p1}</p>
            <p>{t.p2}</p>
          </div>
          <div className="space-y-5 leading-relaxed text-ink/80">
            <p>{t.p3}</p>
            <p>{t.p4}</p>
          </div>
        </div>
      </section>

      {/* The serum */}
      <section className="bg-linen/60">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-20">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="/assets/products/pdrn-bright-serum/view-1-mockup.jpg"
              alt={t.serumAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="tava-label">
              {t.serumLabel}
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep">
              {t.serumTitle}
            </h2>
            <p className="mt-4 leading-relaxed text-ink/80">
              {t.serumBody}
            </p>
            <ul className="mt-6 space-y-2 border-t border-linestone pt-6 text-ink/80">
              {t.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <p className="mt-6 font-display text-2xl text-forest">
              {t.priceLine}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button render={<Link href={lh("/glow-brightening-serum")} />} size="lg">
                {dict.chrome.addToRoutine}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <p className="tava-label">
          {t.philosophyLabel}
        </p>
        <blockquote className="mt-4 max-w-3xl font-display text-3xl leading-snug font-medium text-forest-deep sm:text-4xl">
          {t.quote}
        </blockquote>
        <p className="mt-3 text-sm text-ink/55">{t.philosophyCaption}</p>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <p className="leading-relaxed text-ink/80">
            {t.philosophyP1}
          </p>
          <p className="leading-relaxed text-ink/80">
            {t.philosophyP2}
          </p>
        </div>
      </section>

      {/* Online only */}
      <section className="border-t border-linestone">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-12 sm:px-8">
          <div>
            <h2 className="font-display text-3xl font-semibold text-forest-deep">
              {t.onlineTitle}
            </h2>
            <p className="mt-2 max-w-xl leading-relaxed text-ink/75">
              {t.onlineSegments.map((seg, i) =>
                seg.href ? (
                  <a
                    key={i}
                    href={seg.href}
                    className="font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
                  >
                    {seg.text}
                  </a>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </p>
          </div>
          <Button render={<Link href={lh("/contact")} />} variant="outline" size="lg">
            {t.contactUs}
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
