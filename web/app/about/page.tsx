import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/about.json";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

export default function Page() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8 lg:pt-20">
        <p className="tava-label">
          About Us
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] font-semibold text-forest-deep sm:text-6xl">
          Skincare for <span className="gold-metal-text">the ambitious.</span>
        </h1>
        <p className="mt-4 font-display text-2xl text-forest italic">
          Build your business. Do not neglect yourself.
        </p>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="space-y-5 leading-relaxed text-ink/80">
            <p>
              Tava Labs is a personal maintenance brand for people building
              businesses. Your appearance is part of your professional
              presence. The way you show up on camera, in the pitch, and in
              the room is part of how your work is read.
            </p>
            <p>
              We make one thing, and we make it well. A daily serum that
              keeps your skin looking composed, hydrated, and ready, with no
              complicated routine.
            </p>
          </div>
          <div className="space-y-5 leading-relaxed text-ink/80">
            <p>
              Tava Labs was founded for founders, creators, and professionals
              who invest in the person behind the company. One step, morning
              and night, before the meetings, the pitches, and the camera
              work.
            </p>
            <p>
              This is skincare as maintenance, not vanity. The same
              discipline you bring to your business, applied to yourself.
            </p>
          </div>
        </div>
      </section>

      {/* The serum */}
      <section className="bg-linen/60">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-20">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="/assets/products/pdrn-bright-serum/view-1-mockup.jpg"
              alt="PDRN Brightening Serum"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="tava-label">
              The Serum
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-forest-deep">
              PDRN Brightening Serum
            </h2>
            <p className="mt-4 leading-relaxed text-ink/80">
              A daily complexion routine built around PDRN
              (Polydeoxyribonucleotide) and Acetyl Hexapeptide-8, with Sodium
              Hyaluronate and Panthenol for hydration and comfort. Clean and
              fragrance free, and made without anything on our free from
              list.
            </p>
            <ul className="mt-6 space-y-2 border-t border-linestone pt-6 text-ink/80">
              <li>PDRN for a brighter, more even looking complexion.</li>
              <li>
                Acetyl Hexapeptide-8 to support the look of firmness.
              </li>
              <li>Sodium Hyaluronate and Panthenol for hydration.</li>
              <li>
                Use twice daily: 2 to 4 pumps on clean, dry skin, morning
                and night.
              </li>
            </ul>
            <p className="mt-6 font-display text-2xl text-forest">
              $49 one time, or $39 a month with Subscribe &amp; Save.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button render={<Link href="/glow-brightening-serum" />} size="lg">
                Add to routine
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <p className="tava-label">
          Our Philosophy
        </p>
        <blockquote className="mt-4 max-w-3xl font-display text-3xl leading-snug font-medium text-forest-deep sm:text-4xl">
          &ldquo;Healthy skin is the most attractive thing you can
          wear.&rdquo;
        </blockquote>
        <p className="mt-3 text-sm text-ink/55">The Tava Labs Philosophy</p>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <p className="leading-relaxed text-ink/80">
            We believe in looking after yourself the way you look after your
            work: consistently, and without drama. Small daily maintenance
            beats occasional overhauls.
          </p>
          <p className="leading-relaxed text-ink/80">
            We do not promise transformation. We make a well formulated daily
            serum, tell you exactly what is in it, and let the routine speak
            for itself.
          </p>
        </div>
      </section>

      {/* Online only */}
      <section className="border-t border-linestone">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-12 sm:px-8">
          <div>
            <h2 className="font-display text-3xl font-semibold text-forest-deep">
              Online Only
            </h2>
            <p className="mt-2 max-w-xl leading-relaxed text-ink/75">
              Tava Labs is an online only brand. Questions? Email{" "}
              <a
                href="mailto:talia@tavalabs.app"
                className="font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
              >
                talia@tavalabs.app
              </a>
              .
            </p>
          </div>
          <Button render={<Link href="/contact" />} variant="outline" size="lg">
            Contact Us
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
