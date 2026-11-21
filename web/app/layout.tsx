import type { Metadata } from "next";
import Script from "next/script";
import { Italianno, Nunito } from "next/font/google";
import "./globals.css";
import { GTM_CODE, POSTHOG_CODE } from "@/lib/analytics";

/* Tava Labs brand font: one geometric sans for the whole brand.
   See ~/workspace/tava-labs/design-system/typography.md */
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-brand",
  display: "swap",
});

/* Accent font for gold words only, chosen by Vashon on 2026-11-21.
   Never used inside an H1, H2, or H3. */
const italianno = Italianno({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-accent",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tavalabs.app"),
  icons: {
    icon: "/assets/tava-logo.svg",
    apple: "/assets/logo-tava-avatar-white-bg.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${italianno.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5PGX6Q3S"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: GTM_CODE }}
        />
        <Script
          id="posthog"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: POSTHOG_CODE }}
        />
      </body>
    </html>
  );
}
