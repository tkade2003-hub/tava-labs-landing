import Script from "next/script";
import { Cormorant_Garamond, Kanit } from "next/font/google";
import "../app/globals.css";
import { GTM_CODE, POSTHOG_CODE } from "@/lib/analytics";

/* Site fonts, matching the live tavalabs.app at Vashon direction on
   2026-11-21: Cormorant Garamond for headings, Kanit for body text. */
const kanit = Kanit({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-kanit",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export default function RootShell({
  children,
  lang,
}: Readonly<{
  children: React.ReactNode;
  lang: string;
}>) {
  return (
    <html lang={lang} className={`${kanit.variable} ${cormorant.variable}`}>
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
