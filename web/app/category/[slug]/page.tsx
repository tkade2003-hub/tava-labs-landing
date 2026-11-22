import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import CategorySection from "@/components/CategorySection";
import { CATEGORIES, getCategory } from "@/lib/categories";

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = getCategory(slug);
  if (!config) return {};
  return {
    title: config.seoTitle,
    description: config.seoDescription,
    alternates: { canonical: `https://tavalabs.app/category/${config.slug}` },
    openGraph: {
      title: config.seoTitle,
      description: config.seoDescription,
      siteName: "Tava Labs",
      type: "website",
      url: `https://tavalabs.app/category/${config.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: config.seoTitle,
      description: config.seoDescription,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getCategory(slug);
  if (!config) notFound();
  return (
    <SiteShell>
      <CategorySection config={config} />
    </SiteShell>
  );
}
