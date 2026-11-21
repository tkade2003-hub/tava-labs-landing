import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/contact.json";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

const TOPICS = [
  {
    id: "general",
    title: "General",
    body: "General questions about Tava Labs and the serum.",
  },
  {
    id: "wholesale",
    title: "Wholesale",
    body: "Wholesale and retail enquiries for the PDRN Brightening Serum.",
  },
  {
    id: "sales-support",
    title: "Sales Support",
    body: "Questions about ordering, Subscribe & Save, and checkout.",
  },
  {
    id: "product-support",
    title: "Product Support",
    body: "Help with using the serum, routines, and your personal plan.",
  },
  {
    id: "partnerships",
    title: "Partnerships",
    body: "Partnerships with accelerators, universities, investors, and communities.",
  },
  {
    id: "pr",
    title: "PR",
    body: "Press and media enquiries.",
  },
];

export default function Page() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8 lg:pt-20">
        <p className="text-sm font-semibold tracking-wide text-gold">
          Contact Us
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] font-semibold text-forest-deep sm:text-6xl">
          We would love to hear from you.
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink/80">
          Email us and we will get back to you. Pick the topic that fits, or
          just write to us directly.
        </p>
        <p className="mt-4 text-ink/80">
          Email:{" "}
          <a
            href="mailto:talia@tavalabs.app"
            className="font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
          >
            talia@tavalabs.app
          </a>{" "}
          &middot; Phone:{" "}
          <a href="tel:+19099061308" className="font-semibold text-forest">
            909 906 1308
          </a>
        </p>

        <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((topic) => (
            <article
              key={topic.id}
              id={topic.id}
              className="scroll-mt-8 border-t-2 border-forest pt-5"
            >
              <h2 className="font-display text-2xl font-semibold text-forest-deep">
                {topic.title}
              </h2>
              <p className="mt-2 leading-relaxed text-ink/75">{topic.body}</p>
              <p className="mt-3 text-sm">
                Email:{" "}
                <a
                  href="mailto:talia@tavalabs.app"
                  className="font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
                >
                  talia@tavalabs.app
                </a>
              </p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
