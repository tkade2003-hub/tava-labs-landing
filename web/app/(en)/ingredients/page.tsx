import type { Metadata } from "next";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/ingredients.json";
import FreeFrom, { FREE_FROM } from "@/components/FreeFrom";
import { IngredientsBody } from "@/components/bodies/IngredientsBody";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

export default function Page() {
  return <IngredientsBody locale="en" />;
}
