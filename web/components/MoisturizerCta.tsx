import Link from "next/link";
import { Button } from "@/components/ui/button";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";

/* The single call to action for the Peptide Moisturizer page.
   Every CTA on the page renders through this component so a later
   phase can swap its internals to a direct checkout in one place. */
export default function MoisturizerCta({
  locale = "en",
  dict,
  className = "px-7",
}: {
  locale?: Locale;
  dict: Dict;
  className?: string;
}) {
  return (
    <Button
      render={<Link href={localizeHref("/quiz", locale)} />}
      size="lg"
      className={`accent-btn ${className}`}
    >
      {dict.chrome.addToRoutine}
    </Button>
  );
}
