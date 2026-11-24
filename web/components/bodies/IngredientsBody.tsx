import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import FreeFrom, { FREE_FROM } from "@/components/FreeFrom";

export function IngredientsBody({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.ingredients;
  const lh = (href: string) => localizeHref(href, locale);
  const freeFromItems = dict.home.freeFromItems.map((item, i) => ({
    ...item,
    img: FREE_FROM[i].img,
  }));
  return (
    <SiteShell locale={locale}>
      {/* Intro */}
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8 lg:pt-20">
        <p className="tava-label">
          {t.label}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] font-semibold text-forest-deep sm:text-6xl">
          {t.titleLead} <span className="gold-metal-text">{t.titleAccent}</span>
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink/80">
          {t.intro}
        </p>
        <p className="mt-4 text-sm font-medium text-ink/60">
          {t.metaLine}
        </p>
      </section>

      {/* Key ingredients */}
      <section className="border-t border-linestone">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <h2 className="font-display text-4xl font-semibold text-forest-deep">
            {t.keyTitle}
          </h2>
          <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {t.keyItems.map((item) => (
              <article key={item.name} className="border-t-2 border-forest pt-5">
                <h3 className="font-display text-2xl font-semibold text-forest-deep">
                  {item.name}
                </h3>
                <p className="mt-2 leading-relaxed text-ink/75">{item.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 rounded-2xl border border-linestone bg-linen/50 p-6 sm:p-8">
            <h3 className="font-display text-2xl font-semibold text-forest-deep">
              {t.fullTitle}
            </h3>
            <p className="mt-3 leading-relaxed text-ink/80">
              Aqua (Water), Glycerin, Propanediol, Panthenol, Sodium
              Hyaluronate, Sodium PCA, Polydeoxyribonucleotide, Acetyl
              Hexapeptide-8, Hydroxyethylcellulose, Phenoxyethanol,
              Ethylhexylglycerin, Sodium Hydroxide.
            </p>
          </div>
        </div>
      </section>

      {/* What we leave out */}
      <FreeFrom items={freeFromItems} />

      {/* How to use + warning */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-semibold text-forest-deep">
              {t.howTitle}
            </h2>
            <p className="mt-4 leading-relaxed text-ink/80">
              {t.howBody}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button render={<Link href={lh("/glow-brightening-serum")} />} size="lg">
                {dict.chrome.addToRoutine}
              </Button>
            </div>
          </div>
          <div className="border-t-2 border-gold pt-5">
            <h2 className="font-display text-3xl font-semibold text-forest-deep">
              {t.warningTitle}
            </h2>
            <p className="mt-3 leading-relaxed text-ink/75">
              {t.warningBody}
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
