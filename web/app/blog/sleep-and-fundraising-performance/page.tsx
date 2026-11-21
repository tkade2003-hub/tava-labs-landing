import type { Metadata } from "next";
import BlogPostView from "@/components/BlogPostView";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/blog-sleep-and-fundraising-performance.json";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

export default function Page() {
  return <BlogPostView data={data} />;
}
