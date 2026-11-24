import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import ResearchStory from "@/components/ResearchStory";
import { pageMetadata } from "@/lib/pageMeta";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/research.json";

const data = rawData as unknown as PageData;

export const metadata: Metadata = pageMetadata(data);

export default function Page() {
  return (
    <SiteShell>
      <ResearchStory />
    </SiteShell>
  );
}
