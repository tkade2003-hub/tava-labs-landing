import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Account | Tava Labs",
  description:
    "Your Tava Labs account on the web: your plan, orders, routine, and support, tied to the same email as the mobile app.",
  alternates: { canonical: "https://tavalabs.app/account" },
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
