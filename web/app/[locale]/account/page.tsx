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

import AccountClient from "@/components/AccountClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await validLocale(params);
  const m = getDictionary(locale).meta.account;
  return { ...localizedMetadata("/account", m.title, m.description, locale), robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await validLocale(params);
  return <AccountClient locale={locale} />;
}
