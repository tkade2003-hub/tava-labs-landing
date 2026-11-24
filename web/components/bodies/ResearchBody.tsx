import SiteShell from "@/components/SiteShell";
import ResearchStory from "@/components/ResearchStory";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export function ResearchBody({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  return (
    <SiteShell locale={locale}>
      <ResearchStory dict={dict} />
    </SiteShell>
  );
}
