import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { GTM_CODE, POSTHOG_CODE } from "@/lib/analytics";

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
    <html lang="en">
      <body className="min-h-screen bg-white text-black antialiased">
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
