import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import FreeFrom from "@/components/FreeFrom";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/ingredients.json";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

const KEY_INGREDIENTS = [
  {
    name: "PDRN (Polydeoxyribonucleotide)",
    body: "The headline active. Supports a brighter, more even looking complexion and a composed, camera ready look.",
  },
  {
    name: "Acetyl Hexapeptide-8",
    body: "A peptide that supports the look of firmness and smoothness.",
  },
  {
    name: "Sodium Hyaluronate (Hyaluronic Acid)",
    body: "Draws in moisture for hydrated, comfortable skin.",
  },
  {
    name: "Panthenol",
    body: "Soothes and supports the skin barrier.",
  },
  {
    name: "Glycerin + Sodium PCA",
    body: "Humectants that help skin hold water through the day.",
  },
];

export default function Page() {
  return (
    <SiteShell>
      {/* Intro */}
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8 lg:pt-20">
        <p className="text-sm font-semibold tracking-wide text-gold">
          Ingredients
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] font-semibold text-forest-deep sm:text-6xl">
          What&rsquo;s inside, and <span className="text-gold">what we leave out.</span>
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink/80">
          Here is every ingredient in the PDRN Brightening Serum, what each
          one does, and the full list exactly as it appears on the label.
        </p>
        <p className="mt-4 text-sm font-medium text-ink/60">
          PDRN Brightening Serum &middot; 1 fl oz (30 ml) &middot; Made in
          the USA &middot; Suitable for all skin types.
        </p>
      </section>

      {/* Key ingredients */}
      <section className="border-t border-linestone">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <h2 className="font-display text-4xl font-semibold text-forest-deep">
            Key Ingredients
          </h2>
          <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {KEY_INGREDIENTS.map((item) => (
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
              Full Ingredients
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
      <FreeFrom />

      {/* How to use + warning */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-semibold text-forest-deep">
              How to Use
            </h2>
            <p className="mt-4 leading-relaxed text-ink/80">
              Apply 2 to 4 pumps to clean, dry skin, morning and night.
              Follow with moisturizer. Start once a day if you are new to
              active skincare.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button render={<Link href="/glow-brightening-serum" />} size="lg">
                Shop the Serum
              </Button>
              <Button render={<Link href="/quiz" />} variant="outline" size="lg">
                Take the Skin Quiz
              </Button>
            </div>
          </div>
          <div className="border-t-2 border-gold pt-5">
            <h2 className="font-display text-3xl font-semibold text-forest-deep">
              Warning
            </h2>
            <p className="mt-3 leading-relaxed text-ink/75">
              For external use only. Avoid direct contact with eyes. If
              irritation occurs, discontinue use. Keep out of reach of
              children.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
