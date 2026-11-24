import SiteShell from "@/components/SiteShell";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizeHref, type Locale } from "@/lib/i18n/config";

const TOPIC_IDS = ["general", "wholesale", "sales-support", "product-support", "partnerships", "pr"] as const;

const SUPPORT_TOPICS = new Set(["sales-support", "product-support"]);

export function ContactBody({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.contact;
  const ce = dict.chrome.contactEmails;
  const lh = (href: string) => localizeHref(href, locale);
  return (
    <SiteShell locale={locale}>
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8 lg:pt-20">
        <p className="tava-label">
          {t.label}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] font-semibold text-forest-deep sm:text-6xl">
          {t.title}
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink/80">
          {t.sub}
        </p>
        <p className="mt-4 text-ink/80">
          {ce.supportLabel}:{" "}
          <a
            href="mailto:support@tavalabs.app"
            className="font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
          >
            support@tavalabs.app
          </a>
        </p>
        <p className="mt-2 text-ink/80">
          {ce.generalLabel}:{" "}
          <a
            href="mailto:talia@tavalabs.app"
            className="font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
          >
            talia@tavalabs.app
          </a>{" "}
          &middot; {t.phoneLabel}{" "}
          <a href="tel:+19099061308" className="font-semibold text-forest">
            909 906 1308
          </a>
        </p>

        <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {TOPIC_IDS.map((id) => {
            const topic = { id, ...t.topics[id] };
            return (
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
                {t.emailLabel}{" "}
                {SUPPORT_TOPICS.has(topic.id) ? (
                  <a
                    href="mailto:support@tavalabs.app"
                    className="font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
                  >
                    support@tavalabs.app
                  </a>
                ) : (
                  <a
                    href="mailto:talia@tavalabs.app"
                    className="font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
                  >
                    talia@tavalabs.app
                  </a>
                )}
              </p>
            </article>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
