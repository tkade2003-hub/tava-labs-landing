import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import ProductGallery from "@/components/ProductGallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sparkles, Droplets, Leaf } from "lucide-react";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/glow-brightening-serum.json";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

const DETAILS = [
  {
    title: "Meet PDRN Brightening Serum",
    body: "A lightweight, hydrating formula for smoother, more radiant looking skin. It absorbs quickly, leaves no residue, and keeps skin comfortable.",
  },
  {
    title: "Ingredients and Formulation",
    body: "Aqua, Glycerin, Propanediol, Panthenol, Sodium Hyaluronate, Sodium PCA, Polydeoxyribonucleotide (PDRN), Acetyl Hexapeptide-8, Hydroxyethylcellulose, Phenoxyethanol, Ethylhexylglycerin.",
  },
  {
    title: "How to Apply",
    body: "Apply 2 to 4 drops to clean, dry skin. Massage gently over face and neck until absorbed. Use twice daily, morning and evening. Follow with moisturizer or sunscreen.",
  },
  {
    title: "Clean Skincare Guarantee",
    body: "Formulated to certified cruelty free standards, and made without fragrance, silicones, parabens, mineral oil, sulfates, phthalates, or common allergens. Dermatologist tested on all skin types.",
  },
];

const INNOVATION = [
  {
    n: "01",
    label: "Cellular Renewal",
    title: "PDRN Bio Actives",
    body: "Marine PDRN speeds up cell turnover, reviving a dull complexion and smoothing visible texture.",
  },
  {
    n: "02",
    label: "Bio Peptide Complex",
    title: "Acetyl Hexapeptide-8",
    body: "Signal peptides ease surface tension and support natural collagen elasticity, for firmer looking skin with more bounce.",
  },
  {
    n: "03",
    label: "Deep Hydration",
    title: "Hydration Matrix",
    body: "Hyaluronic acid, sodium PCA, and panthenol work together to hold moisture in the skin barrier for over 24 hours.",
  },
];

const ECOSYSTEM = [
  "A personalized skin diagnostic and regimen guide from your skin quiz",
  "A treatment plan that starts slow and builds over time",
  "Application reminders you control, morning and evening",
  "Message support right inside the app",
  "Subscribe and Save delivery every month, pause or cancel anytime",
];

const FORMULARY_OTHERS = [
  {
    name: "Peptide Moisturizer",
    img: "/assets/products/IMG_3380.jpeg",
    rows: [
      ["Primary Benefit", "Daily Hydration"],
      ["Size", "1.7 fl oz (50ml)"],
    ],
  },
  {
    name: "Peptide Eye Cream",
    img: "/assets/products/IMG_3381.jpeg",
    rows: [
      ["Primary Benefit", "Eye Area Care"],
      ["Size", "1 fl oz (30ml)"],
    ],
  },
  {
    name: "Skin Firming Cream",
    img: "/assets/products/IMG_3382.jpeg",
    rows: [
      ["Primary Benefit", "Firming and Hydration"],
      ["Size", "2 oz (56g)"],
      ["Active ingredient", "Hyaluronic Acid and CoQ10"],
    ],
  },
  {
    name: "Peptide Hair Growth Serum",
    img: "/assets/products/IMG_3383.jpeg",
    rows: [
      ["Primary Benefit", "Scalp and Hair Care"],
      ["Size", "1 fl oz (30ml)"],
    ],
  },
];

const PROTOCOL = [
  {
    title: "Cleanse, with a gentle wash",
    body: "Cleanse with a gentle, pH balanced wash to clear debris and prepare the skin, without stripping its natural lipids.",
  },
  {
    title: "PDRN Serum, 2 to 4 drops",
    body: "Apply 2 to 4 drops of PDRN Serum onto damp skin. Gently press and pat over face and neck until thoroughly absorbed.",
  },
  {
    title: "Moisturize and hydrate",
    body: "Seal with moisturizer to hold in the peptides and support the ceramide barrier.",
  },
  {
    title: "Protect (AM only), SPF 30+",
    body: "Finish the morning routine with broad spectrum SPF 30+ to protect skin against UV and free radical damage.",
  },
  {
    title: "Your personal plan, included",
    body: "Your skin quiz builds your plan, including how to start slow and when to build up.",
  },
];

const FAQS = [
  {
    q: "What is PDRN and how does it benefit the skin?",
    a: "PDRN (Polydeoxyribonucleotide) is made of DNA fragments that are bio compatible with human skin cells. It promotes natural cell regeneration, stimulates microcirculation, and helps repair the skin barrier, for visible radiance and firmness.",
  },
  {
    q: "How do I incorporate PDRN Brightening Serum into my skincare routine?",
    a: "Use PDRN Brightening Serum twice daily after cleansing and toning. Dispense 2 to 4 drops directly onto fingertips or damp skin, smoothing across the face, neck, and décolletage. Follow with your moisturizer and morning sunscreen.",
  },
  {
    q: "Is this serum suitable for sensitive and acne prone skin?",
    a: "Yes. Our formulation is non comedogenic, oil free, fragrance free, and enriched with soothing Panthenol. It calms sensitivity while hydrating deeply without clogging pores or triggering irritation.",
  },
  {
    q: "Can I layer PDRN with retinol, vitamin C, or AHA/BHA?",
    a: "Yes. PDRN works well alongside active treatments like retinoids and vitamin C. Its hydrating base helps soothe the flaking or redness that chemical exfoliants can cause.",
  },
  {
    q: "How long does one 30ml bottle typically last?",
    a: "When applied at 2 to 4 drops twice daily, one 30ml (1 fl oz) bottle typically lasts 4 to 6 weeks. Subscribe and Save sends the next bottle before you run out.",
  },
];

export default function Page() {
  return (
    <SiteShell>
      {/* Buy section */}
      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <p className="text-sm text-ink/55">
          <Link href="/" className="hover:text-forest">
            Home
          </Link>{" "}
          / <span className="text-forest-deep">PDRN Brightening Serum</span>
        </p>
        <div className="mt-6 grid gap-12 pb-16 lg:grid-cols-2">
          <ProductGallery />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-forest text-[#fafaf9]">In Stock</Badge>
              <p className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">
                Clean and Vegan &bull; PDRN Active
              </p>
            </div>
            <p className="mt-5 text-sm text-ink/60">
              Dermatologist tested &bull; Made for all skin types
            </p>
            <h1 className="mt-2 font-display text-5xl leading-[1.05] font-semibold text-forest-deep sm:text-6xl">
              PDRN Brightening <span className="text-gold">Serum</span>
            </h1>
            <p className="mt-5 font-display text-3xl text-forest">
              $49.00{" "}
              <span className="text-xl text-ink/60">/ 30ml (1 fl oz)</span>
            </p>
            <p className="mt-1 text-sm font-medium text-ink/70">
              or $39 per month on Subscribe and Save
            </p>

            <ul className="mt-7 space-y-4 border-t border-linestone pt-7">
              <li className="flex gap-3">
                <Sparkles className="mt-0.5 size-5 shrink-0 text-gold" />
                <span className="leading-relaxed text-ink/80">
                  PDRN, Acetyl Hexapeptide-8, and hyaluronic acid, to support
                  smoother, more radiant looking skin.
                </span>
              </li>
              <li className="flex gap-3">
                <Droplets className="mt-0.5 size-5 shrink-0 text-gold" />
                <span className="leading-relaxed text-ink/80">
                  Deep hydration from glycerin, sodium PCA, and panthenol.
                </span>
              </li>
              <li className="flex gap-3">
                <Leaf className="mt-0.5 size-5 shrink-0 text-gold" />
                <span className="leading-relaxed text-ink/80">
                  100% Cruelty free, fragrance free, paraben free, sulfate
                  free, mineral oil free, silicone free, and vegan.
                </span>
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button render={<Link href="/quiz" />} size="lg" className="px-7">
                Add to Routine
              </Button>
              <a
                href="#formulation"
                className="text-sm font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
              >
                View full formulation and clinical tests
              </a>
            </div>

            <Accordion className="mt-10 border-t border-linestone">
              {DETAILS.map((item) => (
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
          <p className="text-sm font-semibold tracking-wide text-gold">
            Cellular Innovation
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep sm:text-5xl">
            Next Gen Skin <span className="text-gold">Regeneration</span>
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/75">
            Marine actives and targeted hexapeptides, in one daily serum.
          </p>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {INNOVATION.map((item) => (
              <article key={item.n} className="border-t-2 border-forest pt-5">
                <p className="font-display text-lg text-gold">
                  {item.n} / {item.label}
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
            {[
              { src: "/assets/products/product-page/IMG_3320.jpeg", alt: "Serum texture" },
              { src: "/assets/products/product-page/IMG_3318.jpeg", alt: "Crystal and formula" },
              { src: "/assets/products/product-page/IMG_3316.jpeg", alt: "Crystal swatch" },
            ].map((img) => (
              <div key={img.src} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-ink/55">
            *Bio cellular activity assessed via in vitro and ex vivo clinical
            evaluations. Results may vary by individual skin condition.
          </p>
          <Button render={<Link href="/quiz" />} size="lg" className="mt-8">
            Add to Routine
          </Button>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="bg-linen/60">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="text-sm font-semibold tracking-wide text-gold">
            The Full Plan
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep">
            Get complete routine support
          </h2>
          <p className="mt-4 text-ink/75">
            Along with your serum, every Tava Labs plan includes:
          </p>
          <ol className="mt-8 max-w-3xl">
            {ECOSYSTEM.map((item, i) => (
              <li
                key={item}
                className="flex gap-5 border-t border-linestone py-4"
              >
                <span className="font-display text-xl font-semibold text-gold">
                  {i + 1}
                </span>
                <span className="leading-relaxed text-ink/80">{item}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button render={<Link href="/quiz" />} size="lg">
              Add to Routine
            </Button>
            <p className="max-w-md text-sm text-ink/65">
              Pause, adjust, or cancel Subscribe and Save anytime. One time
              purchases stay available at $49.
            </p>
          </div>
        </div>
      </section>

      {/* Clinical efficacy */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <p className="text-sm font-semibold tracking-wide text-gold">
          Clinical Efficacy
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold text-forest-deep">
          Look after your <span className="text-gold">skin health</span>
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            { src: "/assets/products/product-page/IMG_3424.jpeg", alt: "Promotes Radiance diagram" },
            { src: "/assets/products/product-page/IMG_3423.jpeg", alt: "Supports Deep Hydration diagram" },
            { src: "/assets/products/product-page/IMG_3422.jpeg", alt: "Enhances Skin Texture diagram" },
          ].map((img) => (
            <div key={img.src} className="relative aspect-square overflow-hidden rounded-2xl bg-linen">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-ink/60">
          Topical bio active evaluations based on 8 week consumer perception
          and instrumental hydration tests. Individual skin barriers,
          genetics, and environment influence specific timelines and outcomes.
        </p>
        <Button render={<Link href="/quiz" />} size="lg" className="mt-8">
          Add to Routine
        </Button>
      </section>

      {/* Formulary */}
      <section id="formulation" className="border-t border-linestone">
        <div className="mx-auto max-w-7xl scroll-mt-8 px-5 py-16 sm:px-8 lg:py-20">
          <p className="text-sm font-semibold tracking-wide text-gold">
            The Formulary
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep">
            Which skincare treatment is right for you?
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/75">
            Targeted formulas for different skin goals, concerns, and
            routines. Build the regimen that fits yours.
          </p>

          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <article className="border-t-2 border-gold pt-5">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-linen">
                <Image
                  src="/assets/products/pdrn-bright-serum/view-1-mockup.jpg"
                  alt="PDRN Brightening Serum"
                  fill
                  sizes="(min-width: 1280px) 20vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold text-forest-deep">
                PDRN Brightening Serum
              </h3>
              <p className="mt-2 font-display text-xl text-forest">
                Subscribe and Save $39/mo
              </p>
              <p className="text-sm text-ink/60">or $49 one time</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="font-semibold text-forest-deep">Primary Benefit</dt>
                  <dd className="text-ink/70">Luminescence and Firming</dd>
                </div>
                <div>
                  <dt className="font-semibold text-forest-deep">How to use</dt>
                  <dd className="text-ink/70">AM and PM</dd>
                </div>
                <div>
                  <dt className="font-semibold text-forest-deep">Active ingredient</dt>
                  <dd className="text-ink/70">PDRN + Acetyl Hexapeptide-8</dd>
                </div>
              </dl>
              <Button render={<Link href="/quiz" />} className="mt-5">
                Select Serum
              </Button>
            </article>

            {FORMULARY_OTHERS.map((item) => (
              <article key={item.name} className="border-t-2 border-forest pt-5">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-linen">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1280px) 20vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-2">
                  <h3 className="font-display text-2xl font-semibold text-forest-deep">
                    {item.name}
                  </h3>
                  <Badge variant="secondary" className="shrink-0">
                    Coming Soon
                  </Badge>
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  {item.rows.map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-semibold text-forest-deep">{k}</dt>
                      <dd className="text-ink/70">{v}</dd>
                    </div>
                  ))}
                  <div>
                    <dt className="font-semibold text-forest-deep">Status</dt>
                    <dd className="text-ink/70">Coming Soon</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Regimen protocol */}
      <section className="bg-linen/60">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <p className="text-sm font-semibold tracking-wide text-gold">
            Daily Regimen Protocol
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep">
            One simple routine, <span className="text-gold">twice a day</span>
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/75">
            Consistency matters. Follow these steps morning and evening so
            the peptides and PDRN can do their work, and finish by locking in
            moisture.
          </p>
          <div className="mt-10 grid items-start gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold tracking-wide text-gold">
                Clinical Progression
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-forest-deep">
                Visible Results Timeline
              </h3>
              <p className="mt-3 leading-relaxed text-ink/75">
                Enhanced glow and hydration in 7 to 14 days; improved skin
                elasticity and barrier firmness by week 4 to 6.
              </p>
              <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-2xl">
                <Image
                  src="/assets/products/product-page/timeline.jpg"
                  alt="Example results timeline, weeks 1 to 4 and beyond"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            <Accordion className="border-t border-linestone">
              {PROTOCOL.map((step, i) => (
                <AccordionItem key={step.title} value={step.title}>
                  <AccordionTrigger className="py-4 text-left">
                    <span className="flex items-baseline gap-3">
                      <span className="font-display text-lg font-semibold text-gold">
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
            <p className="text-sm font-semibold tracking-wide text-gold">
              Answers and Clarity
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep">
              Frequently asked questions
            </h2>
            <Link
              href="/faq"
              className="mt-4 inline-block text-sm font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
            >
              View all FAQs
            </Link>
          </div>
          <Accordion className="border-t border-linestone">
            {FAQS.map((item) => (
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
                alt="PDRN Brightening Serum"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                Ready for radiant, revitalized skin?
              </h2>
              <p className="mt-2 text-sm text-[#fafaf9]/70">
                PDRN Brightening Serum &middot; $49.00 / 30ml &middot; Clean
                and Vegan &middot; Deep Hydration &middot; Cancel anytime
              </p>
            </div>
          </div>
          <Button
            render={<Link href="/quiz" />}
            size="lg"
            className="bg-gold px-7 text-white hover:bg-gold/85"
          >
            Add to Routine
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
