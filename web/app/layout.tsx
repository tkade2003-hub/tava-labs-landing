import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Kanit } from "next/font/google";
import "./globals.css";
import { GTM_CODE, POSTHOG_CODE } from "@/lib/analytics";

/* Site fonts, matching the live tavalabs.app at Vashon direction on
   2026-11-21: Cormorant Garamond for headings, Kanit for body text. */
const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-kanit",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tavalabs.app"),
  icons: {
    icon: "/assets/icon-t-period.svg",
    apple: "/assets/logo-tava-avatar-white-bg.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${kanit.variable} ${cormorant.variable}`}>
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
