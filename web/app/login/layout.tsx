import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Tava Labs",
  description:
    "Sign in to your Tava Labs account with an emailed sign in link. Your plan, orders and routine, tied to your email.",
  alternates: { canonical: "https://tavalabs.app/login" },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
