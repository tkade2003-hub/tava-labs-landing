import type { Metadata } from "next";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/peptide-moisturizer.json";
import { MoisturizerBody } from "@/components/bodies/MoisturizerBody";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

export default function Page() {
  return <MoisturizerBody locale="en" />;
}
