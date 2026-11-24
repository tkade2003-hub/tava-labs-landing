import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import MotionCarousel from "@/components/MotionCarousel";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import AppTeaser from "@/components/AppTeaser";
import TrustpilotWidget from "@/components/TrustpilotWidget";
import { SKINCARE, BIOMARKERS } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/pageMeta";
import { getBlogCardsLocalized } from "@/lib/blogLocalized";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizeCategory } from "@/lib/i18n/localizeCategory";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import FreeFrom, { FREE_FROM } from "@/components/FreeFrom";

const JOURNAL_SLUGS = [
  "/blog/why-founders-cant-sleep",
  "/blog/founder-stress-response",
  "/blog/sleep-and-fundraising-performance",
];

export function HomeBody({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.home;
  const lh = (href: string) => localizeHref(href, locale);
  const journal = getBlogCardsLocalized(locale).filter((c) =>
    JOURNAL_SLUGS.includes(c.href),
  );
  const freeFromItems = t.freeFromItems.map((item, i) => ({
    ...item,
    img: FREE_FROM[i].img,
  }));

  return (
    <SiteShell locale={locale}>
      {/* Hero */}
      <Hero dict={dict} locale={locale} />

      {/* Intro */}
      <section className="border-t border-linestone">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-3xl">
            <h2 className="font-display text-4xl font-semibold text-forest-deep sm:text-5xl">
              {t.introTitleLead} <span className="gold-metal-text">{t.introTitleAccent}</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink/75">
              {t.introBody}
            </p>
          </div>
        </div>
      </section>

      {/* Marquee line */}
      <div className="border-y border-linestone bg-linen/60 py-4">
        <p className="text-center font-display text-xl text-forest italic sm:text-2xl">
          PDRN Brightening Serum &nbsp;&#10022;&nbsp; {t.marqueeTagline}
          &nbsp;&#10022;&nbsp; {t.marqueeSlogan}
        </p>
      </div>

      {/* Built for the builders */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl font-semibold text-forest-deep sm:text-5xl">
            {t.buildersTitle}
          </h2>
          <p className="mt-4 font-display text-2xl text-forest italic">
            {t.buildersTagline}
          </p>
          <p className="mt-5 leading-relaxed text-ink/75">
            {t.buildersBody}
          </p>
        </div>
        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src="/assets/home/IMG_3365.jpeg"
                alt={t.pitchAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-5">
              <h3 className="font-display text-2xl font-semibold text-forest-deep">
                {t.pitchTitle}
              </h3>
              <p className="mt-2 leading-relaxed text-ink/75">
                {t.pitchBody}
              </p>
            </figcaption>
          </figure>
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src="/assets/home/IMG_3363.jpeg"
                alt={t.cameraAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-5">
              <h3 className="font-display text-2xl font-semibold text-forest-deep">
                {t.cameraTitle}
              </h3>
              <p className="mt-2 leading-relaxed text-ink/75">
                {t.cameraBody}
              </p>
            </figcaption>
          </figure>
        </div>
        <div className="mt-16 border-t border-linestone pt-10 text-center">
          <h3 className="font-display text-3xl font-semibold text-forest-deep">
            {t.maintenanceTitle}
          </h3>
          <p className="mt-3 text-ink/75">
            {t.maintenanceBody}
          </p>
          <Button render={<Link href={lh("/glow-brightening-serum")} />} size="lg" className="mt-6 px-6">
            {dict.chrome.addToRoutine}
          </Button>
        </div>
      </section>

      {/* Category sections */}
      <div className="mt-16 sm:mt-24">
        <CategorySection
          config={localizeCategory(SKINCARE, dict.categories.skincare)}
          chrome={dict.categoryChrome}
          locale={locale}
        />
      </div>

      {/* Tava in Motion */}
      <MotionCarousel dict={dict} />

      {/* Peptides and Mental health sections hidden at Vashon direction on
          2026-11-21. To bring them back, restore the PEPTIDES and
          MENTAL_HEALTH imports above and uncomment:
      <div className="mt-16 sm:mt-24">
        <CategorySection config={PEPTIDES} />
      </div>
      <div className="mt-16 sm:mt-24">
        <CategorySection config={MENTAL_HEALTH} />
      </div>
      */}
      <div className="my-16 sm:my-24">
        <CategorySection
          config={localizeCategory(BIOMARKERS, dict.categories.biomarkers)}
          chrome={dict.categoryChrome}
          locale={locale}
        />
      </div>

      {/* App teaser, aperture reveal */}
      <AppTeaser dict={dict} locale={locale} />

      {/* What we leave out */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <h2 className="font-display text-4xl font-semibold text-forest-deep">
          {t.freeFromTitleLead} <span className="gold-metal-text">{t.freeFromTitleAccent}</span>
        </h2>
        <p className="mt-3 max-w-2xl text-ink/75">
          {t.freeFromSub}
        </p>
        <div className="mt-8">
          <FreeFrom items={freeFromItems} />
        </div>
      </section>

      {/* Founder message */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="tava-label">
              {t.founderLabel}
            </p>
            <blockquote className="mt-4 font-display text-4xl leading-snug font-semibold text-forest-deep italic sm:text-5xl">
              {t.founderQuote}
            </blockquote>
            <p className="mt-6 max-w-xl leading-relaxed text-ink/75">
              {t.founderBody1}
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-ink/75">
              {t.founderBody2}
            </p>
            <p className="mt-4 font-display text-xl text-forest italic">
              {t.founderPhilosophy}
            </p>
            <Button
              render={<Link href={lh("/glow-brightening-serum")} />}
              size="lg"
              className="mt-8 px-6"
            >
              {t.shopSerum}
            </Button>
          </div>
          <video
            src="/assets/Captions_AF0C36.mp4"
            poster="/assets/IMG_3269.jpeg"
            controls
            playsInline
            preload="metadata"
            aria-label={t.founderVideoAria}
            className="aspect-[4/3] w-full rounded-3xl object-cover"
          />
        </div>
      </section>

      {/* Journal */}
      <section className="border-t border-linestone">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl font-semibold text-forest-deep">
                {t.journalTitle}
              </h2>
              <p className="mt-2 text-ink/75">{t.journalSub}</p>
            </div>
            <Link
              href={lh("/blog")}
              className="text-sm font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
            >
              {t.readJournal}
            </Link>
          </div>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {journal.map((card) => (
              <article key={card.href} className="border-t-2 border-forest pt-5">
                <Link href={lh(card.href)} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image}
                    alt={card.imageAlt || card.title}
                    className="aspect-[16/10] w-full rounded-2xl object-cover"
                    loading="lazy"
                  />
                  <p className="mt-4 tava-label">
                    {card.meta.replace(/ · [A-Z][a-z]+ \d+, \d{4}$/, "")}
                  </p>
                  <h3 className="mt-2 font-display text-2xl leading-snug font-semibold text-forest-deep">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    {card.excerpt}
                  </p>
                  <p className="mt-3 text-[13px] font-semibold text-forest">
                    {t.readStory} &rarr;
                  </p>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trustpilot reviews, last section before the footer */}
      <TrustpilotWidget />
    </SiteShell>
  );
}
