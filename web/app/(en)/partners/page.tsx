import type { Metadata } from "next";
import FreeFrom, { FREE_FROM } from "@/components/FreeFrom";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/partners.json";
import { PartnersBody } from "@/components/bodies/PartnersBody";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

export default function Page() {
  return <PartnersBody locale="en" />;
}
