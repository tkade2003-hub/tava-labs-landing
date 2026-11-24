import type { Metadata } from "next";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/research.json";
import { ResearchBody } from "@/components/bodies/ResearchBody";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

export default function Page() {
  return <ResearchBody locale="en" />;
}
