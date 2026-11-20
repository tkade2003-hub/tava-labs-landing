import type { Metadata } from "next";
import PageView from "@/components/PageView";
import type { PageData } from "@/lib/pageData";
import rawData from "@/lib/pages/about.json";

const data = rawData as unknown as PageData;

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
  ...(data.canonical
    ? {
        alternates: {
          canonical:
            "https://tavalabs.app" +
            (data.canonical === "/" ? "" : data.canonical),
        },
      }
    : {}),
};

export default function Page() {
  return <PageView data={data} />;
}
