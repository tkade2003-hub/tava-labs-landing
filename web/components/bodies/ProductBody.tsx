import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import ProductGallery from "@/components/ProductGallery";
import PairingSection from "@/components/PairingSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Droplets, Leaf } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BULLET_ICONS = [Sparkles, Droplets, Leaf];

const INNOVATION_IMGS = [
  { src: "/assets/products/product-page/IMG_3320.jpeg" },
  { src: "/assets/products/product-page/IMG_3318.jpeg" },
  { src: "/assets/products/product-page/IMG_3316.jpeg" },
];

const CLINICAL_IMGS = [
  { src: "/assets/products/product-page/IMG_3424.jpeg" },
  { src: "/assets/products/product-page/IMG_3423.jpeg" },
  { src: "/assets/products/product-page/IMG_3422.jpeg" },
];

const FORMULARY_OTHERS_META = [
  { name: "Peptide Moisturizer", img: "/assets/products/IMG_3380.jpeg" },
  { name: "Peptide Eye Cream", img: "/assets/products/IMG_3381.jpeg" },
  { name: "Skin Firming Cream", img: "/assets/products/IMG_3382.jpeg" },
  { name: "Peptide Hair Growth Serum", img: "/assets/products/IMG_3383.jpeg" },
];

export function ProductBody({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.product;
  const lh = (href: string) => localizeHref(href, locale);
  const addToRoutine = dict.chrome.addToRoutine;

  return (
    <SiteShell locale={locale}>
      {/* Buy section */}
      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <p className="text-sm text-ink/55">
          <Link href={lh("/")} className="hover:text-forest">
            {t.breadcrumbHome}
          </Link>{" "}
          / <span className="text-forest-deep">PDRN Brightening Serum</span>
        </p>
        <div className="mt-6 grid gap-12 pb-16 lg:grid-cols-2">
          <ProductGallery dict={dict} />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-forest text-[#fafaf9]">{t.inStock}</Badge>
              <p className="tava-label">
                {t.cleanVegan}
              </p>
            </div>
            <p className="mt-5 text-sm text-ink/60">
              {t.dermTested}
            </p>
            <h1 className="mt-2 font-display text-5xl leading-[1.05] font-semibold text-forest-deep sm:text-6xl">
              {t.titleLead} <span className="gold-metal-text">{t.titleAccent}</span>
            </h1>
            <p className="mt-5 font-display text-3xl text-forest">
              $49.00{" "}
              <span className="text-xl text-ink/60">{t.pricePerUnit}</span>
            </p>
            <p className="mt-1 text-sm font-medium text-ink/70">
              {t.subPrice}
            </p>

            <ul className="mt-7 space-y-4 border-t border-linestone pt-7">
              {t.bullets.map((b, i) => {
                const Icon = BULLET_ICONS[i];
                return (
                  <li key={i} className="flex gap-3">
                    <Icon className="mt-0.5 size-5 shrink-0 text-gold" />
                    <span className="leading-relaxed text-ink/80">{b}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button render={<Link href={lh("/quiz")} />} size="lg" className="accent-btn px-7">
                {addToRoutine}
              </Button>
              <a
                href="#formulation"
                className="text-sm font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
              >
                {t.viewFormulation}
              </a>
            </div>

            <Accordion className="mt-10 border-t border-linestone">
              {t.details.map((item) => (
                <AccordionItem key={item.title} value={item.title}>
                  <AccordionTrigger className="py-4 font-display text-xl font-semibold text-forest-deep">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-ink/75">
                    {item.body}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Innovation */}
      <section className="border-t border-linestone">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="tava-label">
            {t.innovation.label}
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep sm:text-5xl">
            {t.innovation.titleLead} <span className="gold-metal-text">{t.innovation.titleAccent}</span>
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/75">
            {t.innovation.sub}
          </p>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {t.innovation.items.map((item, i) => (
              <article key={i} className="border-t-2 border-forest pt-5">
                <p className="gold-word text-lg font-semibold">
                  {String(i + 1).padStart(2, "0")} / {item.label}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-forest-deep">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {INNOVATION_IMGS.map((img, i) => (
              <div key={img.src} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={img.src}
                  alt={t.innovation.imgAlts[i]}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-ink/55">
            {t.innovation.footnote}
          </p>
          <Button render={<Link href={lh("/quiz")} />} size="lg" className="accent-btn mt-8">
            {addToRoutine}
          </Button>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="bg-linen/60">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="tava-label">
            {t.ecosystem.label}
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep">
            {t.ecosystem.title}
          </h2>
          <p className="mt-4 text-ink/75">
            {t.ecosystem.sub}
          </p>
          <ol className="mt-8 max-w-3xl">
            {t.ecosystem.items.map((item, i) => (
              <li
                key={i}
                className="flex gap-5 border-t border-linestone py-4"
              >
                <span className="gold-word text-xl font-semibold">
                  {i + 1}
                </span>
                <span className="leading-relaxed text-ink/80">{item}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button render={<Link href={lh("/quiz")} />} size="lg" className="accent-btn">
              {addToRoutine}
            </Button>
            <p className="max-w-md text-sm text-ink/65">
              {t.ecosystem.note}
            </p>
          </div>
        </div>
      </section>

      <PairingSection locale={locale} dict={dict} current="serum" />

      {/* Clinical efficacy */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <p className="tava-label">
          {t.clinical.label}
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold text-forest-deep">
          {t.clinical.titleLead} <span className="gold-metal-text">{t.clinical.titleAccent}</span>
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {CLINICAL_IMGS.map((img, i) => (
            <div key={img.src} className="relative aspect-square overflow-hidden rounded-2xl bg-linen">
              <Image
                src={img.src}
                alt={t.clinical.imgAlts[i]}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-ink/60">
          {t.clinical.note}
        </p>
        <Button render={<Link href={lh("/quiz")} />} size="lg" className="accent-btn mt-8">
          {addToRoutine}
        </Button>
      </section>

      {/* Formulary */}
      <section id="formulation" className="border-t border-linestone">
        <div className="mx-auto max-w-7xl scroll-mt-8 px-5 py-16 sm:px-8 lg:py-20">
          <p className="tava-label">
            {t.formulary.label}
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep">
            {t.formulary.title}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/75">
            {t.formulary.sub}
          </p>

          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <article className="border-t-2 border-gold pt-5">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-linen">
                <Image
                  src="/assets/products/pdrn-bright-serum/view-1-mockup.jpg"
                  alt={t.formulary.serumAlt}
                  fill
                  sizes="(min-width: 1280px) 20vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold text-forest-deep">
                PDRN Brightening Serum
              </h3>
              <p className="mt-2 font-display text-xl text-forest">
                {t.formulary.serumPriceLine}
              </p>
              <p className="text-sm text-ink/60">{t.formulary.serumOneTime}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="font-semibold text-forest-deep">{t.formulary.primaryBenefit}</dt>
                  <dd className="text-ink/70">{t.formulary.serumBenefitValue}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-forest-deep">{t.formulary.howToUse}</dt>
                  <dd className="text-ink/70">{t.formulary.serumHowValue}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-forest-deep">{t.formulary.activeIngredient}</dt>
                  <dd className="text-ink/70">{t.formulary.serumActiveValue}</dd>
                </div>
              </dl>
              <Button render={<Link href={lh("/quiz")} />} className="mt-5">
                {t.formulary.selectSerum}
              </Button>
            </article>

            {FORMULARY_OTHERS_META.map((meta, i) => (
              <article key={meta.name} className="border-t-2 border-forest pt-5">
                {i === 0 ? (
                  <Link href={lh("/peptide-moisturizer")} className="block">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-linen">
                      <Image
                        src={meta.img}
                        alt={meta.name}
                        fill
                        sizes="(min-width: 1280px) 20vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  </Link>
                ) : (
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-linen">
                    <Image
                      src={meta.img}
                      alt={meta.name}
                      fill
                      sizes="(min-width: 1280px) 20vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="mt-4 flex items-start justify-between gap-2">
                  <h3 className="font-display text-2xl font-semibold text-forest-deep">
                    {i === 0 ? (
                      <Link href={lh("/peptide-moisturizer")}>{meta.name}</Link>
                    ) : (
                      meta.name
                    )}
                  </h3>
                  {i !== 0 && (
                    <Badge variant="secondary" className="shrink-0">
                      {t.formulary.comingSoon}
                    </Badge>
                  )}
                </div>
                {i === 0 && (
                  <p className="mt-2 font-display text-xl text-forest">$27.99</p>
                )}
                <dl className="mt-3 space-y-2 text-sm">
                  {t.formulary.others[i].rows.map(([k, v], j) => (
                    <div key={j}>
                      <dt className="font-semibold text-forest-deep">{k}</dt>
                      <dd className="text-ink/70">{v}</dd>
                    </div>
                  ))}
                  {i !== 0 && (
                    <div>
                      <dt className="font-semibold text-forest-deep">{t.formulary.status}</dt>
                      <dd className="text-ink/70">{t.formulary.comingSoon}</dd>
                    </div>
                  )}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Regimen protocol */}
      <section className="bg-linen/60">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="tava-label">
            {t.protocol.label}
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep">
            {t.protocol.titleLead} <span className="gold-metal-text">{t.protocol.titleAccent}</span>
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/75">
            {t.protocol.sub}
          </p>
          <div className="mt-10 grid items-start gap-12 lg:grid-cols-2">
            <div>
              <p className="tava-label">
                {t.protocol.progressionLabel}
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-forest-deep">
                {t.protocol.progressionTitle}
              </h3>
              <p className="mt-3 leading-relaxed text-ink/75">
                {t.protocol.progressionBody}
              </p>
              <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-2xl">
                <Image
                  src="/assets/products/product-page/timeline.jpg"
                  alt={t.protocol.timelineAlt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            <Accordion className="border-t border-linestone">
              {t.protocol.steps.map((step, i) => (
                <AccordionItem key={step.title} value={step.title}>
                  <AccordionTrigger className="py-4 text-left">
                    <span className="flex items-baseline gap-3">
                      <span className="gold-word text-lg font-semibold">
                        {i + 1}
                      </span>
                      <span className="font-display text-xl font-semibold text-forest-deep">
                        {step.title}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-ink/75">
                    {step.body}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="tava-label">
              {t.faqSection.label}
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep">
              {t.faqSection.title}
            </h2>
            <Link
              href={lh("/faq")}
              className="mt-4 inline-block text-sm font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
            >
              {t.faqSection.viewAll}
            </Link>
          </div>
          <Accordion className="border-t border-linestone">
            {t.faqSection.items.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="py-4 font-display text-xl font-semibold text-forest-deep">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="leading-relaxed text-ink/75">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-[28px] bg-forest-deep px-6 py-12 text-[#fafaf9] sm:px-10">
          <div className="flex items-center gap-5">
            <div className="relative hidden size-20 shrink-0 overflow-hidden rounded-xl sm:block">
              <Image
                src="/assets/products/pdrn-bright-serum/view-1-mockup.jpg"
                alt={t.formulary.serumAlt}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                {t.finalCta.title}
              </h2>
              <p className="mt-2 text-sm text-[#fafaf9]/70">
                {t.finalCta.line}
              </p>
            </div>
          </div>
          <Button
            render={<Link href={lh("/quiz")} />}
            size="lg"
            className="accent-btn bg-gold px-7 text-white hover:bg-gold/85"
          >
            {addToRoutine}
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
