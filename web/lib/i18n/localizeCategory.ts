// Merge a locale dictionary's category text into a CategoryConfig.
//
// The English configs in lib/categories.ts own everything structural:
// images, prices, hrefs, themes, and product titles for the peptide
// programs (program names stay as named). The dictionaries own every
// displayed word. Fields missing from a dictionary slice fall back to
// the English config value, so a partial translation degrades to
// English instead of breaking.

import type { CategoryConfig } from "@/components/CategorySection";

export function localizeCategory(
  config: CategoryConfig,
  slice: unknown,
): CategoryConfig {
  const d = slice as Record<string, unknown>;
  const str = (v: unknown, fallback: string | undefined) =>
    typeof v === "string" ? v : (fallback ?? "");
  const strArr = (v: unknown, fallback: string[]) =>
    Array.isArray(v) ? (v as string[]) : fallback;
  const dProducts = (d.products as Array<Record<string, unknown>>) ?? [];
  return {
    ...config,
    eyebrow: str(d.eyebrow, config.eyebrow),
    heroTitleLead: str(d.heroTitleLead, config.heroTitleLead),
    heroTitleAccent: str(d.heroTitleAccent, config.heroTitleAccent),
    heroCopy: str(d.heroCopy, config.heroCopy),
    heroFinePrint: str(d.heroFinePrint, config.heroFinePrint ?? "") || config.heroFinePrint,
    stamp: str(d.stamp, config.stamp ?? "") || config.stamp,
    primaryCta: {
      ...config.primaryCta,
      label: str(d.primaryCta, config.primaryCta.label),
    },
    secondaryCta: config.secondaryCta
      ? {
          ...config.secondaryCta,
          label: str(d.secondaryCta, config.secondaryCta.label),
        }
      : config.secondaryCta,
    optionsEyebrow: str(d.optionsEyebrow, config.optionsEyebrow),
    optionsTitleLead: str(d.optionsTitleLead, config.optionsTitleLead),
    optionsTitleAccent: str(d.optionsTitleAccent, config.optionsTitleAccent),
    optionsCopy: str(d.optionsCopy, config.optionsCopy),
    products: config.products.map((p, i) => {
      const dp = dProducts[i] ?? {};
      return {
        ...p,
        title: str(dp.title, p.title),
        subtitle: str(dp.subtitle, p.subtitle),
        unit: str(dp.unit, str(d.unitPerMonth, p.unit ?? "") || p.unit),
        imageAlt: str(dp.imageAlt, p.imageAlt),
        badges: strArr(dp.badges, p.badges ?? []),
        description: str(dp.description, p.description),
        linkLabel: str(dp.linkLabel, p.linkLabel),
      };
    }),
    disclaimerLead: str(d.disclaimerLead, config.disclaimerLead),
    disclaimerMore: strArr(d.disclaimerMore, config.disclaimerMore ?? []),
    protocolEyebrow: str(d.protocolEyebrow, config.protocolEyebrow),
    protocolTitleLead: str(d.protocolTitleLead, config.protocolTitleLead),
    protocolTitleAccent: str(d.protocolTitleAccent, config.protocolTitleAccent),
    protocolCopy: str(d.protocolCopy, config.protocolCopy),
    protocolCta: config.protocolCta
      ? { ...config.protocolCta, label: str(d.protocolCta, config.protocolCta.label) }
      : config.protocolCta,
    steps: config.steps.map((s, i) => {
      const ds = ((d.steps as Array<Record<string, unknown>>) ?? [])[i] ?? {};
      return {
        ...s,
        title: str(ds.title, s.title),
        lead: str(ds.lead, s.lead),
        body: str(ds.body, s.body),
      };
    }),
    legalLines: strArr(d.legalLines, config.legalLines),
  };
}
