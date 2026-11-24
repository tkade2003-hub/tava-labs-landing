import type { Metadata } from "next";
import RootShell from "@/components/RootShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://tavalabs.app"),
  icons: {
    icon: "/assets/icon-t-period.svg",
    apple: "/assets/logo-tava-avatar-white-bg.png",
  },
};

export default function EnglishRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RootShell lang="en">{children}</RootShell>;
}
