import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SiteShell from "@/components/SiteShell";
import FreeFrom from "@/components/FreeFrom";
import MotionCarousel from "@/components/MotionCarousel";
import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import { SKINCARE, BIOMARKERS } from "@/lib/categories";
// PEPTIDES and MENTAL_HEALTH imports return when their sections are unhidden.
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/pageMeta";
import { getBlogCards } from "@/lib/blog";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/index.json";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);


const JOURNAL_SLUGS = [
  "/blog/why-founders-cant-sleep",
  "/blog/founder-stress-response",
  "/blog/sleep-and-fundraising-performance",
];

export default function Page() {
  const journal = getBlogCards().filter((c) => JOURNAL_SLUGS.includes(c.href));

  return (
    <SiteShell>
      {/* Hero */}
      <Hero />

      {/* Intro */}
      <section className="border-t border-linestone">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-3xl">
            <h2 className="font-display text-4xl font-semibold text-forest-deep sm:text-5xl">
              Brighter, hydrated, <span className="gold-metal-text">healthy looking skin</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink/75">
              Founders live on camera and in the room. You pitch investors,
              close on sales calls, and record the video that sells the
              product. Your face is part of the pitch. The PDRN Brightening
              Serum is one lightweight, fast absorbing step with PDRN,
              peptides, and hyaluronic acid. It helps skin look brighter,
              deeply hydrated, and smooth. Two minutes, twice a day, and you
              show up sharp, rested, and ready.
            </p>
          </div>
        </div>
      </section>

      {/* Marquee line */}
      <div className="border-y border-linestone bg-linen/60 py-4">
        <p className="text-center font-display text-xl text-forest italic sm:text-2xl">
          PDRN Brightening Serum &nbsp;&#10022;&nbsp; The Science of Attractive
          Health &nbsp;&#10022;&nbsp; Skincare for the ambitious
        </p>
      </div>

      {/* Built for the builders */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl font-semibold text-forest-deep sm:text-5xl">
            Built for the builders
          </h2>
          <p className="mt-4 font-display text-2xl text-forest italic">
            Build your business. Do not neglect yourself.
          </p>
          <p className="mt-5 leading-relaxed text-ink/75">
            As a founder, you are always presenting. You pitch investors in
            person, sell on video calls, and record content that has to earn
            trust in seconds. Looking prepared and composed is not vanity. It
            is part of how you present the business. A simple daily routine
            belongs in a founder operating system next to a good wardrobe, a
            quality laptop, and a system you can rely on.
          </p>
        </div>
        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src="/assets/home/IMG_3365.jpeg"
                alt="Founder pitching his idea to an investor"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-5">
              <h3 className="font-display text-2xl font-semibold text-forest-deep">
                In the pitch
              </h3>
              <p className="mt-2 leading-relaxed text-ink/75">
                Across the table from an investor, the room reads you before
                it reads your deck. Show up looking like the person behind a
                company worth backing: rested, sharp, and ready.
              </p>
            </figcaption>
          </figure>
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src="/assets/home/IMG_3363.jpeg"
                alt="Founder speaking in front of a camera"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-5">
              <h3 className="font-display text-2xl font-semibold text-forest-deep">
                On camera
              </h3>
              <p className="mt-2 leading-relaxed text-ink/75">
                On a shoot, a podcast, or a sales call, the lens shows the
                late nights first. Confidence in front of a camera starts with
                how you maintain yourself before you ever press record.
              </p>
            </figcaption>
          </figure>
        </div>
        <div className="mt-16 border-t border-linestone pt-10 text-center">
          <h3 className="font-display text-3xl font-semibold text-forest-deep">
            The founder daily maintenance.
          </h3>
          <p className="mt-3 text-ink/75">
            One serum, morning and night. Look prepared. Feel confident. Show
            up ready.
          </p>
          <Button render={<Link href="/glow-brightening-serum" />} size="lg" className="mt-6 px-6">
            Add to routine
          </Button>
        </div>
      </section>

      {/* Category sections */}
      <div className="mt-16 sm:mt-24">
        <CategorySection config={SKINCARE} />
      </div>

      {/* Tava in Motion */}
      <MotionCarousel />

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
        <CategorySection config={BIOMARKERS} />
      </div>

      {/* What we leave out */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <h2 className="font-display text-4xl font-semibold text-forest-deep">
          Quality ingredients, combined <span className="gold-metal-text">with care.</span>
        </h2>
        <p className="mt-3 max-w-2xl text-ink/75">
          What we leave out matters as much as what we put in.
        </p>
        <div className="mt-8">
          <FreeFrom />
        </div>
      </section>

      {/* Founder message */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="tava-label">
              A Message From Our Founder
            </p>
            <blockquote className="mt-4 font-display text-4xl leading-snug font-semibold text-forest-deep italic sm:text-5xl">
              &ldquo;Healthy skin is the most attractive thing you can
              wear.&rdquo;
            </blockquote>
            <p className="mt-6 max-w-xl leading-relaxed text-ink/75">
              That is the philosophy behind Tava Labs, The Science of
              Attractive Health. The PDRN Brightening Serum is the one step
              the routine is built around: two minutes, twice a day, morning
              and night.
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-ink/75">
              Watch the film to hear the science behind it, in our own words.
            </p>
            <p className="mt-4 font-display text-xl text-forest italic">
              The Tava Labs Philosophy
            </p>
            <Button
              render={<Link href="/glow-brightening-serum" />}
              size="lg"
              className="mt-8 px-6"
            >
              Shop the Serum
            </Button>
          </div>
          <video
            src="/assets/Captions_AF0C36.mp4"
            poster="/assets/IMG_3269.jpeg"
            controls
            playsInline
            preload="metadata"
            aria-label="The Tava Labs film, the science behind the PDRN Brightening Serum"
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
                The Tava Journal
              </h2>
              <p className="mt-2 text-ink/75">On sleep, stress, and showing up ready.</p>
            </div>
            <Link
              href="/blog"
              className="text-sm font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
            >
              Read the Journal
            </Link>
          </div>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {journal.map((card) => (
              <article key={card.href} className="border-t-2 border-forest pt-5">
                <Link href={card.href} className="block">
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
                    Read the story &rarr;
                  </p>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
