import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { getBlogCardsLocalized } from "@/lib/blogLocalized";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function BlogIndexBody({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.blog;
  const lh = (href: string) => localizeHref(href, locale);
  const cards = getBlogCardsLocalized(locale);
  return (
    <SiteShell locale={locale}>
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8 lg:pt-20">
        <p className="tava-label">
          {t.label}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] font-semibold text-forest-deep sm:text-6xl">
          {t.titleLead} <span className="gold-metal-text">{t.titleAccent}</span>
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink/80">
          {t.sub}
        </p>

        <div className="mt-14">
          {cards.map((card) => (
            <article
              key={card.href}
              className="grid gap-6 border-t border-linestone py-10 md:grid-cols-[280px_1fr] md:gap-10"
            >
              <Link href={lh(card.href)} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt={card.imageAlt}
                  className="aspect-[16/10] w-full rounded-2xl object-cover"
                  loading="lazy"
                />
              </Link>
              <div>
                <p className="tava-label">
                  {card.meta}
                </p>
                <h2 className="mt-2 font-display text-3xl leading-tight font-semibold text-forest-deep">
                  <Link href={lh(card.href)} className="hover:text-forest">
                    {card.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-ink/75">
                  {card.excerpt}
                </p>
                <Link
                  href={lh(card.href)}
                  className="mt-4 inline-block text-sm font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
                >
                  {t.readStory} &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
