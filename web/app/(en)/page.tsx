import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import FreeFrom, { FREE_FROM } from "@/components/FreeFrom";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/index.json";
import { pageMetadata } from "@/lib/pageMeta";
import { HomeBody } from "@/components/bodies/HomeBody";

// PEPTIDES and MENTAL_HEALTH imports return when their sections are unhidden.

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

export default function Page() {
  return <HomeBody locale="en" />;
}
