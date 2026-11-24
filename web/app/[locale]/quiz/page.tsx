import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/pageMeta";
import { getLocalizedPageData } from "@/lib/pagesLocalized";
import { isLocale, NON_EN_LOCALES, type Locale } from "@/lib/i18n/config";

export function generateStaticParams() {
  return NON_EN_LOCALES.map((locale) => ({ locale }));
}

async function validLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") notFound();
  return locale;
}

import PageView from "@/components/PageView";

const NAME = "quiz";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await validLocale(params);
  return pageMetadata(getLocalizedPageData(NAME, locale), locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await validLocale(params);
  return <PageView data={getLocalizedPageData(NAME, locale)} locale={locale} />;
}
