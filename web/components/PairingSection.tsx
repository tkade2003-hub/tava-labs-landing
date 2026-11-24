import Link from "next/link";
import { Button } from "@/components/ui/button";
import MoisturizerCheckout from "@/components/MoisturizerCheckout";
import RoutineCheckout from "@/components/RoutineCheckout";
import type { Dict } from "@/lib/i18n/dictionaries";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export function PairingSection({
  locale,
  dict,
  current,
}: {
  locale: Locale;
  dict: Dict;
  current: "serum" | "moisturizer";
}) {
  const p = dict.pairing;
  const otherIsMoisturizer = current === "serum";

  return (
    <section className="border-t border-linestone">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <p className="tava-label">{p.label}</p>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <article className="border-t-2 border-forest pt-5">
            <p className="gold-word text-lg font-semibold">
              {otherIsMoisturizer ? p.moisturizerStep : p.serumStep}
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-forest-deep">
              {otherIsMoisturizer ? p.moisturizerTitle : p.serumTitle}
            </h3>
            <p className="mt-2 leading-relaxed text-ink/75">
              {otherIsMoisturizer ? p.moisturizerBody : p.serumBody}
            </p>
            <p className="mt-3 font-display text-xl text-forest">
              {otherIsMoisturizer ? p.moisturizerPriceLine : p.serumPriceLine}
            </p>
            <div className="mt-5">
              {otherIsMoisturizer ? (
                <MoisturizerCheckout locale={locale} dict={dict} />
              ) : (
                <Button
                  render={<Link href={localizeHref("/quiz", locale)} />}
                  size="lg"
                  className="accent-btn px-7"
                >
                  {dict.chrome.addToRoutine}
                </Button>
              )}
            </div>
          </article>

          <article className="rounded-[22px] bg-linen/60 p-6">
            <h3 className="font-display text-2xl font-semibold text-forest-deep">
              {p.routineTitle}
            </h3>
            <p className="mt-2 leading-relaxed text-ink/75">{p.routineBody}</p>
            <p className="mt-3 font-display text-xl text-forest">{p.routinePriceLine}</p>
            <div className="mt-5">
              <RoutineCheckout locale={locale} dict={dict} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default PairingSection;
