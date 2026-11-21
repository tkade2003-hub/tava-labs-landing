import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SiteShell from "@/components/SiteShell";
import FreeFrom from "@/components/FreeFrom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pageMetadata } from "@/lib/pageMeta";
import { getBlogCards } from "@/lib/blog";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/index.json";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

const COMING_SOON = [
  {
    name: "Peptide Moisturizer",
    size: "1.7 fl oz (50ml)",
    img: "/assets/products/IMG_3380.jpeg",
    alt: "Tava Labs Peptide Moisturizer white tube with a pink splash",
    desc: "A peptide moisturizer that targets wrinkles and hydrates, made for skin that has to look composed all day.",
  },
  {
    name: "Peptide Eye Cream",
    size: "1 fl oz (30ml)",
    img: "/assets/products/IMG_3381.jpeg",
    alt: "Tava Labs Peptide Eye Cream white tube with a champagne drop",
    desc: "Reduces the appearance of eye puffiness and targets wrinkles in the eye area, for a rested look on camera.",
  },
  {
    name: "Skin Firming Cream",
    size: "2 oz (56g)",
    img: "/assets/products/IMG_3382.jpeg",
    alt: "Tava Labs Skin Firming Cream white jar with a gold wave backdrop",
    desc: "Hyaluronic acid and CoQ10 in a rich cream that leaves skin looking firm and cared for.",
  },
  {
    name: "Peptide Hair Growth Serum",
    size: "1 fl oz (30ml)",
    img: "/assets/products/IMG_3383.jpeg",
    alt: "Tava Labs Peptide Hair Growth Serum amber dropper bottle",
    desc: "Nourishes the scalp, for hair that looks as cared for as your skin.",
  },
];

const MOTION_VIDEOS = [
  "video_1794963376632",
  "video_1794967533613",
  "video_1794974090775",
  "video_1795026257064",
  "video_1795026641447",
  "video_1795026966409",
  "video_1795026997440",
  "video_1795028291814",
  "video_1795028309764",
];

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
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="py-14 lg:py-20">
          <div className="tava-reveal max-w-3xl">
            <p className="text-sm font-semibold tracking-wide text-gold">
              Tava Labs
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] font-semibold text-forest-deep sm:text-6xl lg:text-7xl">
              The Science of <span className="text-gold">Attractive Health</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">
              Skincare and prescription peptide programs for people building
              something. Start with the serum, explore the programs, and let
              licensed providers handle the medicine.
            </p>
          </div>

          <div className="tava-reveal-delay mt-12">
            <div className="grid gap-5 lg:grid-cols-2">
              <Link
                href="/glow-brightening-serum"
                aria-label="Shop the PDRN Brightening Serum"
                className="relative flex min-h-[320px] overflow-hidden rounded-[28px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <Image
                  src="/assets/IMG_3265.jpeg"
                  alt="Tava Labs PDRN Brightening Serum bottle over cream silk"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#08251d] via-[#08251d]/50 to-transparent"
                  aria-hidden="true"
                />
                <div className="relative mt-auto flex w-full items-end justify-between gap-4 p-7 sm:p-9">
                  <div>
                    <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                      Start with the serum
                    </h2>
                    <p className="mt-2 text-sm font-semibold tracking-wide text-gold-soft">
                      Shop the PDRN Brightening Serum
                    </p>
                  </div>
                  <ChevronRight
                    className="mb-1 h-6 w-6 shrink-0 text-gold-soft"
                    aria-hidden="true"
                  />
                </div>
              </Link>

              <a
                href="https://tava.mydose.store"
                target="_blank"
                rel="noreferrer"
                aria-label="Find your peptide program at the Tava store"
                className="flex min-h-[320px] overflow-hidden rounded-[28px] bg-forest-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <div className="flex flex-1 flex-col justify-end p-7 sm:p-9">
                  <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                    Peptide programs, prescribed online
                  </h2>
                  <p className="mt-2 flex items-center gap-1 text-sm font-semibold tracking-wide text-gold-soft">
                    Find your program
                    <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </p>
                </div>
                <div className="relative m-5 ml-0 w-2/5 shrink-0 overflow-hidden rounded-3xl sm:w-1/3">
                  <Image
                    src="https://tava.mydose.store/_next/static/media/art-1.0jdcptfgwq9oq.webp"
                    alt="Prescription peptide vial on a beige background"
                    fill
                    sizes="(min-width: 1024px) 17vw, (min-width: 640px) 33vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </a>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href="https://tava.mydose.store/products/tirzepatide-b12-cyanocobalamin"
                target="_blank"
                rel="noreferrer"
                aria-label="Lose weight: GLP-1 programs with provider review"
                className="flex items-start justify-between gap-3 rounded-3xl bg-linen p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <span>
                  <span className="block font-display text-2xl font-semibold text-forest-deep">
                    Lose weight
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-ink/70">
                    GLP-1 programs with provider review
                  </span>
                </span>
                <ChevronRight
                  className="mt-1.5 h-5 w-5 shrink-0 text-gold"
                  aria-hidden="true"
                />
              </a>
              <a
                href="https://tava.mydose.store/products/bpc-157"
                target="_blank"
                rel="noreferrer"
                aria-label="Recover and rebuild: BPC-157, TB-500, and blends"
                className="flex items-start justify-between gap-3 rounded-3xl bg-linen p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <span>
                  <span className="block font-display text-2xl font-semibold text-forest-deep">
                    Recover and rebuild
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-ink/70">
                    BPC-157, TB-500, and blends
                  </span>
                </span>
                <ChevronRight
                  className="mt-1.5 h-5 w-5 shrink-0 text-gold"
                  aria-hidden="true"
                />
              </a>
              <a
                href="https://tava.mydose.store/products/nad-injectable"
                target="_blank"
                rel="noreferrer"
                aria-label="Support longevity: NAD+, sermorelin, and more"
                className="flex items-start justify-between gap-3 rounded-3xl bg-linen p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <span>
                  <span className="block font-display text-2xl font-semibold text-forest-deep">
                    Support longevity
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-ink/70">
                    NAD+, sermorelin, and more
                  </span>
                </span>
                <ChevronRight
                  className="mt-1.5 h-5 w-5 shrink-0 text-gold"
                  aria-hidden="true"
                />
              </a>
              <a
                href="https://tava.mydose.store/products/pt-141"
                target="_blank"
                rel="noreferrer"
                aria-label="Sexual health: PT-141, prescribed online"
                className="flex items-start justify-between gap-3 rounded-3xl bg-linen p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <span>
                  <span className="block font-display text-2xl font-semibold text-forest-deep">
                    Sexual health
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-ink/70">
                    PT-141, prescribed online
                  </span>
                </span>
                <ChevronRight
                  className="mt-1.5 h-5 w-5 shrink-0 text-gold"
                  aria-hidden="true"
                />
              </a>
            </div>

            <p className="mt-8 text-sm text-ink/70">
              Not sure where to start?{" "}
              <Link
                href="/quiz"
                className="font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4 hover:text-forest-deep"
              >
                Take the skin quiz
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="border-t border-linestone">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-3xl">
            <h2 className="font-display text-4xl font-semibold text-forest-deep sm:text-5xl">
              Brighter, hydrated, <span className="text-gold">healthy looking skin</span>
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

      {/* Your next meeting */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="relative overflow-hidden rounded-[28px] bg-forest-deep text-[#fafaf9]">
          <div className="absolute inset-0" aria-hidden="true">
            <Image
              src="/assets/home/IMG_3363.jpeg"
              alt=""
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#08251d]/10 via-[#08251d]/60 to-[#08251d]" />
          </div>
          <div className="relative max-w-3xl px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <h2 className="font-display text-4xl leading-tight font-semibold sm:text-5xl">
              Your next meeting starts with <span className="text-gold-soft">you.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[#fafaf9]/80">
              Your appearance is part of your professional presence. One daily
              routine, built for people who pitch, present, and record, helps
              you look composed and polished on the days that ask the most of
              you. Build your business. Do not neglect yourself.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                render={<Link href="/glow-brightening-serum" />}
                size="lg"
                className="bg-gold px-6 text-white hover:bg-gold/85"
              >
                Get started
              </Button>
              <Button
                render={<Link href="/quiz" />}
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent px-6 text-[#fafaf9] hover:bg-white/10 hover:text-white"
              >
                Take the quiz
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The product */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-linen">
            <Image
              src="/assets/products/pdrn-bright-serum/view-1-mockup.jpg"
              alt="PDRN Brightening Serum bottle"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-gold">
              Available now
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep sm:text-5xl">
              PDRN Brightening Serum
            </h2>
            <p className="mt-2 text-sm font-medium text-ink/60">
              1 fl oz (30ml)
            </p>
            <p className="mt-5 max-w-xl leading-relaxed text-ink/75">
              One lightweight step, morning and evening, with PDRN, peptides,
              sodium hyaluronate, and panthenol. Made for days of meetings,
              pitches, and camera work.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-linestone pt-5">
                <p className="font-medium text-forest-deep">
                  One time purchase, $49
                </p>
                <Button render={<Link href="/glow-brightening-serum" />}>
                  Buy Now, $49
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-linestone pt-5">
                <p className="font-medium text-forest-deep">
                  Subscribe and save, $39 per month
                </p>
                <Button
                  render={<Link href="/glow-brightening-serum" />}
                  variant="secondary"
                >
                  Subscribe and Save, $39 per month
                </Button>
              </div>
            </div>
            <p className="mt-6 text-sm">
              <Link
                href="/ingredients"
                className="font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
              >
                See the ingredients
              </Link>
              <span className="mx-2 text-ink/40">&middot;</span>
              <Link
                href="/quiz"
                className="font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
              >
                Take the skin quiz
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Coming soon */}
      <section className="border-t border-linestone">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <h2 className="font-display text-4xl font-semibold text-forest-deep">
            Coming soon to your routine
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/75">
            Four new formulas join the shelf soon, each one built for the same
            standard of daily maintenance.
          </p>
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {COMING_SOON.map((item) => (
              <article key={item.name} className="border-t-2 border-forest pt-5">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-linen">
                  <Image
                    src={item.img}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <h3 className="font-display text-2xl font-semibold text-forest-deep">
                    {item.name}
                  </h3>
                  <Badge variant="secondary" className="shrink-0">
                    Coming Soon
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-ink/60">{item.size}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">
                  {item.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

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
          <Button render={<Link href="/quiz" />} size="lg" className="mt-6 px-6">
            Take the Skin Quiz
          </Button>
        </div>
      </section>

      {/* Tava in Motion */}
      <section className="border-t border-linestone bg-linen/50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <h2 className="font-display text-4xl font-semibold text-forest-deep">
            Tava in Motion
          </h2>
          <p className="mt-3 text-ink/75">
            Short clips from founders and creators.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MOTION_VIDEOS.map((v) => (
              <video
                key={v}
                src={`/assets/ads/${v}.mp4`}
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
                className="aspect-[3/4] w-full rounded-2xl object-cover"
              />
            ))}
          </div>
        </div>
      </section>

      {/* What we leave out */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <h2 className="font-display text-4xl font-semibold text-forest-deep">
          Quality ingredients, combined <span className="text-gold">with care.</span>
        </h2>
        <p className="mt-3 max-w-2xl text-ink/75">
          What we leave out matters as much as what we put in.
        </p>
        <div className="mt-8">
          <FreeFrom />
        </div>
      </section>

      {/* Subscribe and Save */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="rounded-[28px] bg-linen px-6 py-14 sm:px-10 lg:px-14">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-4xl font-semibold text-forest-deep">
                  Subscribe and Save
                </h2>
                <Badge className="bg-gold text-white">
                  Most Popular &middot; Save 20%
                </Badge>
              </div>
              <p className="mt-4 font-display text-3xl text-forest">
                $39 per month &middot; Delivered monthly
              </p>
              <p className="mt-3 leading-relaxed text-ink/75">
                A fresh bottle every month, automatically.
                <br />
                Pause, skip, or cancel anytime.
              </p>
            </div>
            <Button
              render={<Link href="/glow-brightening-serum" />}
              size="lg"
              className="px-6"
            >
              Subscribe &amp; Save
            </Button>
          </div>
        </div>
      </section>

      {/* Founder message */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold tracking-wide text-gold">
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
                  <p className="mt-4 text-xs font-semibold tracking-[0.16em] text-gold uppercase">
                    {card.meta.replace(/ · [A-Z][a-z]+ \d+, \d{4}$/, "")}
                  </p>
                  <h3 className="mt-2 font-display text-2xl leading-snug font-semibold text-forest-deep">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">
                    {card.excerpt}
                  </p>
                  <p className="mt-3 text-xs font-semibold tracking-[0.16em] text-forest uppercase">
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
