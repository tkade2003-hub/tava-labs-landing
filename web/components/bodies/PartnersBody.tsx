import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import FreeFrom, { FREE_FROM } from "@/components/FreeFrom";

const AUDIENCE_IMGS = [
  { img: "/assets/partners/IMG_3360.jpeg" },
  { img: "/assets/partners/IMG_3358.jpeg" },
  { img: "/assets/partners/IMG_3359.jpeg" },
];

export function PartnersBody({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.partners;
  const lh = (href: string) => localizeHref(href, locale);
  const freeFromItems = dict.home.freeFromItems.map((item, i) => ({
    ...item,
    img: FREE_FROM[i].img,
  }));
  const AUDIENCES = t.audiences.map((a, i) => ({ ...a, img: AUDIENCE_IMGS[i].img }));
  return (
    <SiteShell locale={locale}>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8 lg:pt-20">
        <p className="gold-word font-semibold">
          {t.label}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] font-semibold text-forest-deep sm:text-6xl">
          {t.titleLead} <span className="gold-metal-text">{t.titleAccent}</span>
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink/80">
          {t.intro}
        </p>
        <p className="mt-4 font-display text-2xl text-forest italic">
          {t.tagline}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button render={<a href="mailto:talia@tavalabs.app" />} size="lg">
            {t.becomePartner}
          </Button>
          <Button render={<Link href={lh("/contact#partnerships")} />} variant="outline" size="lg">
            {t.partnershipsContact}
          </Button>
        </div>
      </section>

      {/* Audiences */}
      {AUDIENCES.map((section, i) => (
        <section
          key={section.title}
          className={i % 2 === 0 ? "bg-linen/60" : undefined}
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2">
            <div
              className={`relative aspect-[4/3] overflow-hidden rounded-3xl ${i % 2 === 1 ? "lg:order-2" : ""}`}
            >
              <Image
                src={section.img}
                alt={section.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-display text-4xl font-semibold text-forest-deep">
                {section.title}
              </h2>
              <p className="mt-4 leading-relaxed text-ink/80">{section.body}</p>
              <p className="mt-4 border-t border-linestone pt-4 leading-relaxed text-ink/75">
                {section.how}
              </p>
            </div>
          </div>
        </section>
      ))}

      {/* Why */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <h2 className="font-display text-4xl font-semibold text-forest-deep">
          {t.whyTitleLead} <span className="gold-metal-text">{t.whyTitleAccent}</span>
        </h2>
        <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {t.why.map((item) => (
            <article key={item.title} className="border-t-2 border-forest pt-5">
              <h3 className="font-display text-2xl font-semibold text-forest-deep">
                {item.title}
              </h3>
              <p className="mt-2 leading-relaxed text-ink/75">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <h2 className="font-display text-4xl font-semibold text-forest-deep">
          {t.formulationTitle}
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink/75">
          {t.formulationSub}
        </p>
        <div className="mt-8">
          <FreeFrom items={freeFromItems} />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <h2 className="font-display text-4xl font-semibold text-forest-deep">
          {t.stepsTitle}
        </h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {t.steps.map((step, i) => (
            <article key={i} className="border-t-2 border-gold pt-5">
              <p className="gold-word text-4xl font-semibold">
                {i + 1}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-forest-deep">
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-ink/75">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="rounded-[28px] bg-forest-deep px-6 py-14 text-[#fafaf9] sm:px-10 lg:px-14">
          <h2 className="max-w-2xl font-display text-4xl font-semibold">
            {t.closingTitleLead} <span className="gold-metal-text">{t.closingTitleAccent}</span>
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-[#fafaf9]/75">
            {t.closingSegments.map((seg, i) =>
              seg.href ? (
                <a
                  key={i}
                  href={seg.href}
                  className={
                    seg.href.startsWith("mailto:")
                      ? "gold-word font-semibold underline underline-offset-4"
                      : "gold-word font-semibold"
                  }
                >
                  {seg.text}
                </a>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              render={<a href="mailto:talia@tavalabs.app" />}
              size="lg"
              className="bg-gold text-white hover:bg-gold/85"
            >
              {t.becomePartner}
            </Button>
            <Button
              render={<Link href={lh("/contact#partnerships")} />}
              size="lg"
              variant="outline"
              className="border-[#fafaf9]/40 bg-transparent text-[#fafaf9] hover:bg-[#fafaf9]/10"
            >
              {t.partnershipsContact}
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
