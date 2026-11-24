import type { Metadata } from "next";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/blog-index.json";
import { BlogIndexBody } from "@/components/bodies/BlogIndexBody";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

export default function Page() {
  return <BlogIndexBody locale="en" />;
}
