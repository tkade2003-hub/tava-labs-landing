import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import FreeFrom from "@/components/FreeFrom";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/partners.json";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

const AUDIENCES = [
  {
    img: "/assets/partners/IMG_3360.jpeg",
    alt: "Startup founders at an accelerator session",
    title: "For Accelerators",
    body: "Your founders are pitching, demoing, and filming content from day one. Give them a month of daily maintenance that helps them show up composed and camera ready, and one less thing to think about during the program.",
    how: "How it works: we ship each founder in your cohort one free bottle, with a personal plan from the skin quiz. You introduce us once; we handle everything else.",
  },
  {
    img: "/assets/partners/IMG_3358.jpeg",
    alt: "University students on campus",
    title: "For Universities",
    body: "Entrepreneurship students are building in public: pitch competitions, demo days, founder talks, and first investor meetings. A free month of Tava Labs is a practical, memorable gift for the students in your program.",
    how: "How it works: we provide bottles for your cohort, class, or event, plus a simple handout. No cost to the university and no cost to the students.",
  },
  {
    img: "/assets/partners/IMG_3359.jpeg",
    alt: "Investor meeting with a founder",
    title: "For Angel Investors",
    body: "You back the person as much as the company. A free month of Tava Labs is a thoughtful gift for the founders in your portfolio, and it supports the daily routine of the people you have invested in.",
    how: "How it works: tell us how many founders you would like to gift, and we arrange delivery and their personal plans. No cost to you and no cost to them.",
  },
];

const WHY = [
  {
    title: "More value from day one",
    body: "Your members get a real product and a personal plan, not a discount code they will forget.",
  },
  {
    title: "Zero cost to you",
    body: "The first month is on us, for every person you gift.",
  },
  {
    title: "Zero effort to you",
    body: "We handle shipping, onboarding, and support. You make one introduction.",
  },
  {
    title: "A gift they will actually use",
    body: "One step, morning and night. It fits a founder schedule because it was designed for one.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Reach out",
    body: "Tell us about your program and how many people you would like to gift.",
  },
  {
    n: "2",
    title: "We arrange the gift",
    body: "We ship the serum and set up each person's personal plan from the skin quiz.",
  },
  {
    n: "3",
    title: "You give the gift",
    body: "Your members get a free month of daily maintenance, with our thanks to you in every box.",
  },
];

export default function Page() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8 lg:pt-20">
        <p className="text-sm font-semibold tracking-wide text-gold">
          Partner With Tava Labs
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] font-semibold text-forest-deep sm:text-6xl">
          Give your founders a free month of <span className="text-gold">Tava Labs.</span>
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink/80">
          Tava Labs partners with accelerators, universities, angel
          investors, and founder communities. Your members get their first
          month of the PDRN Brightening Serum free, so the people building
          companies can look after the person behind the company.
        </p>
        <p className="mt-4 font-display text-2xl text-forest italic">
          A free month, on us, with no strings attached.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button render={<a href="mailto:talia@tavalabs.app" />} size="lg">
            Become a Partner
          </Button>
          <Button render={<Link href="/contact#partnerships" />} variant="outline" size="lg">
            Partnerships Contact
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
          Zero cost. Zero effort. <span className="text-gold">Real value.</span>
        </h2>
        <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((item) => (
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
          Clean, considered formulation.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink/75">
          The serum is made without the ingredients your members ask about
          most:
        </p>
        <div className="mt-8">
          <FreeFrom />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <h2 className="font-display text-4xl font-semibold text-forest-deep">
          How a partnership works
        </h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {STEPS.map((step) => (
            <article key={step.n} className="border-t-2 border-gold pt-5">
              <p className="font-display text-4xl font-semibold text-gold">
                {step.n}
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
            Let&rsquo;s put a free month in your founders&rsquo; <span className="text-gold-soft">hands.</span>
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-[#fafaf9]/75">
            Email{" "}
            <a
              href="mailto:talia@tavalabs.app"
              className="font-semibold text-gold-soft underline underline-offset-4"
            >
              talia@tavalabs.app
            </a>{" "}
            or call{" "}
            <a href="tel:+19099061308" className="font-semibold text-gold-soft">
              909-906-1308
            </a>
            , and we will set it up.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              render={<a href="mailto:talia@tavalabs.app" />}
              size="lg"
              className="bg-gold text-white hover:bg-gold/85"
            >
              Become a Partner
            </Button>
            <Button
              render={<Link href="/contact#partnerships" />}
              size="lg"
              variant="outline"
              className="border-[#fafaf9]/40 bg-transparent text-[#fafaf9] hover:bg-[#fafaf9]/10"
            >
              Partnerships Contact
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
