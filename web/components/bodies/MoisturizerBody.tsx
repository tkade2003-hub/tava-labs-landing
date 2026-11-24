import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import MoisturizerGallery from "@/components/MoisturizerGallery";
import MoisturizerCta from "@/components/MoisturizerCheckout";
import { Badge } from "@/components/ui/badge";
import { Droplets, Leaf, Sparkles, Briefcase } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { MOISTURIZER_IMAGES } from "@/lib/moisturizerImages";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BULLET_ICONS = [Droplets, Leaf, Sparkles, Briefcase];

export function MoisturizerBody({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.moisturizer;
  const lh = (href: string) => localizeHref(href, locale);

  return (
    <SiteShell locale={locale}>
      {/* Buy section */}
      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <p className="text-sm text-ink/55">
          <Link href={lh("/")} className="hover:text-forest">
            {t.breadcrumbHome}
          </Link>{" "}
          / <span className="text-forest-deep">Peptide Moisturizer</span>
        </p>
        <div className="mt-6 grid gap-12 pb-16 lg:grid-cols-2">
          <MoisturizerGallery dict={dict} />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-forest text-[#fafaf9]">{t.inStock}</Badge>
              <p className="tava-label">{t.subBadge}</p>
            </div>
            <p className="mt-5 text-sm text-ink/60">{t.madeLine}</p>
            <h1 className="mt-2 font-display text-5xl leading-[1.05] font-semibold text-forest-deep sm:text-6xl">
              {t.titleLead} <span className="gold-metal-text">{t.titleAccent}</span>
            </h1>
            <p className="mt-5 font-display text-3xl text-forest">
              $27.99{" "}
              <span className="text-xl text-ink/60">{t.pricePerUnit}</span>
            </p>
            <p className="mt-5 leading-relaxed text-ink/75">{t.intro}</p>

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
              <MoisturizerCta locale={locale} dict={dict} />
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

      {/* Key ingredients */}
      <section className="border-t border-linestone">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="tava-label">{t.keyIngredients.label}</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep sm:text-5xl">
            {t.keyIngredients.titleLead}{" "}
            <span className="gold-metal-text">{t.keyIngredients.titleAccent}</span>
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/75">
            {t.keyIngredients.sub}
          </p>
          <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {t.keyIngredients.items.map((item, i) => (
              <article key={i} className="border-t-2 border-forest pt-5">
                <p className="gold-word text-lg font-semibold">
                  {String(i + 1).padStart(2, "0")}
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
          <MoisturizerCta locale={locale} dict={dict} className="mt-8" />
        </div>
      </section>

      {/* How to use */}
      <section className="bg-linen/60">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="tava-label">{t.howToUse.label}</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep">
            {t.howToUse.title}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/75">
            {t.howToUse.sub}
          </p>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            {t.howToUse.steps.map((step, i) => (
              <article key={i} className="border-t-2 border-forest pt-5">
                <p className="gold-word text-lg font-semibold">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-forest-deep">
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-ink/75">{step.body}</p>
              </article>
            ))}
          </div>
          <MoisturizerCta locale={locale} dict={dict} className="mt-8" />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="tava-label">{t.faqSection.label}</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep">
              {t.faqSection.title}
            </h2>
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
                src={MOISTURIZER_IMAGES[0]}
                alt={t.gallery.alts[0]}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                {t.finalCta.title}
              </h2>
              <p className="mt-2 text-sm text-[#fafaf9]/70">{t.finalCta.line}</p>
            </div>
          </div>
          <MoisturizerCta locale={locale} dict={dict} />
        </div>
      </section>
    </SiteShell>
  );
}
