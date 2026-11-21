import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/faq.json";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

type Segment = { text: string; href?: string };

const FAQS: { q: string; a: Segment[] }[] = [
  {
    q: "What is the PDRN Brightening Serum?",
    a: [
      {
        text: "A daily serum built around PDRN (Polydeoxyribonucleotide) and Acetyl Hexapeptide-8, with Sodium Hyaluronate and Panthenol. It is a daily complexion routine: apply morning and night to support a brighter, more even looking complexion and a composed, camera ready look.",
      },
    ],
  },
  {
    q: "How do I use it?",
    a: [
      {
        text: "Apply 2 to 4 drops to clean, dry skin, morning and night. Follow with moisturizer. If you are new to active skincare, start once a day for the first week, then build to twice daily.",
      },
    ],
  },
  {
    q: "How do I get my personal plan?",
    a: [
      { text: "Take the " },
      { text: "Skin Quiz", href: "/quiz" },
      {
        text: ". Your answers build a personal plan, including how to start slow and when to build up.",
      },
    ],
  },
  {
    q: "How much does it cost?",
    a: [
      {
        text: "$49 one time, or $39 per month with Subscribe & Save (20% off). Subscribe & Save can be paused, skipped, or cancelled anytime.",
      },
    ],
  },
  {
    q: "How does shipping work?",
    a: [
      {
        text: "Orders are fulfilled by our partner and shipped to the address you give at checkout. See the ",
      },
      { text: "Shipping Policy", href: "/shipping" },
      { text: " for details." },
    ],
  },
  {
    q: "What is your returns policy?",
    a: [
      { text: "All sales are final. Please read the " },
      { text: "Returns Policy", href: "/returns" },
      { text: " before ordering." },
    ],
  },
  {
    q: "What ingredients does it contain?",
    a: [
      { text: "The full ingredient list is on the " },
      { text: "Ingredients page", href: "/ingredients" },
      {
        text: ". The serum is fragrance free and made without parabens, sulfates, silicones, mineral oil, phthalates, and common allergens.",
      },
    ],
  },
  {
    q: "Is it suitable for my skin type?",
    a: [
      {
        text: "The serum is formulated to suit all skin types. If you have a skin condition or concerns, talk to your dermatologist before starting any new skincare.",
      },
    ],
  },
  {
    q: "How do I contact you?",
    a: [
      { text: "Email talia@tavalabs.app or use the " },
      { text: "Contact Us", href: "/contact" },
      { text: " page." },
    ],
  },
];

export default function Page() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="text-sm font-semibold tracking-wide text-gold">
              FAQs
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] font-semibold text-forest-deep">
              Frequently Asked <span className="text-gold">Questions</span>
            </h1>
            <p className="mt-5 leading-relaxed text-ink/80">
              Answers about the serum, ordering, shipping, and your personal
              plan.
            </p>
          </div>
          <Accordion className="border-t border-linestone">
            {FAQS.map((item) => (
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
                          href={seg.href}
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
