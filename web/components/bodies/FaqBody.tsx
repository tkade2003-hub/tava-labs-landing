import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqBody({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.faq;
  const lh = (href: string) => localizeHref(href, locale);
  return (
    <SiteShell locale={locale}>
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="tava-label">
              {t.label}
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] font-semibold text-forest-deep">
              {t.titleLead} <span className="gold-metal-text">{t.titleAccent}</span>
            </h1>
            <p className="mt-5 leading-relaxed text-ink/80">
              {t.sub}
            </p>
          </div>
          <Accordion className="border-t border-linestone">
            {t.items.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="py-4 font-display text-xl font-semibold text-forest-deep">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="leading-relaxed text-ink/75">
                  <p>
                    {item.a.map((seg, i) =>
                      seg.href ? (
                        <Link
                          key={i}
                          href={lh(seg.href)}
                          className="font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
                        >
                          {seg.text}
                        </Link>
                      ) : (
                        <span key={i}>{seg.text}</span>
                      )
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </SiteShell>
  );
}
