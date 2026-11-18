import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tava Labs",
  description:
    "Your Tava Labs account on the web — the same Today routine, orders, shop, and support as the Tava mobile app.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
