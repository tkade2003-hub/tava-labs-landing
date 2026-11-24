import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedMetadata } from "@/lib/pageMeta";
import { isLocale, NON_EN_LOCALES, type Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return NON_EN_LOCALES.map((locale) => ({ locale }));
}

async function validLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") notFound();
  return locale;
}

import { ContactBody } from "@/components/bodies/ContactBody";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await validLocale(params);
  const m = getDictionary(locale).meta.contact;
  return { ...localizedMetadata("/contact", m.title, m.description, locale) };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await validLocale(params);
  return <ContactBody locale={locale} />;
}
