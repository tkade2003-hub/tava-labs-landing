import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RootShell from "@/components/RootShell";
import { isLocale, NON_EN_LOCALES } from "@/lib/i18n/config";

export const metadata: Metadata = {
  metadataBase: new URL("https://tavalabs.app"),
  icons: {
    icon: "/assets/icon-t-period.svg",
    apple: "/assets/logo-tava-avatar-white-bg.png",
  },
};

export function generateStaticParams() {
  return NON_EN_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === "en") notFound();
  return <RootShell lang={locale}>{children}</RootShell>;
}
