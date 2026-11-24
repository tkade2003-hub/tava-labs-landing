import type { Metadata } from "next";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/contact.json";
import { ContactBody } from "@/components/bodies/ContactBody";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

export default function Page() {
  return <ContactBody locale="en" />;
}
