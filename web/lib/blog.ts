import type { PageData } from "@/lib/pageData";
import blogIndexRaw from "@/lib/pages/blog-index.json";
import blogCameraReadySkin from "@/lib/pages/blog-camera-ready-skin.json";
import blogCortisolAndDecisionMaking from "@/lib/pages/blog-cortisol-and-decision-making.json";
import blogFounderStressResponse from "@/lib/pages/blog-founder-stress-response.json";
import blogHowMuchSleepDoFoundersNeed from "@/lib/pages/blog-how-much-sleep-do-founders-need.json";
import blogLookSharpBy9am from "@/lib/pages/blog-look-sharp-by-9am.json";
import blogNightShift from "@/lib/pages/blog-night-shift.json";
import blogPdrnExplained from "@/lib/pages/blog-pdrn-explained.json";
import blogScienceOfAttractiveHealth from "@/lib/pages/blog-science-of-attractive-health.json";
import blogSignsOfFounderBurnout from "@/lib/pages/blog-signs-of-founder-burnout.json";
import blogSleepAndFundraisingPerformance from "@/lib/pages/blog-sleep-and-fundraising-performance.json";
import blogStartSlow from "@/lib/pages/blog-start-slow.json";
import blogWhyFoundersCantSleep from "@/lib/pages/blog-why-founders-cant-sleep.json";

export interface BlogCard {
  href: string;
  meta: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Every published journal post. The index page features six of them; the
// rest are read from their own stored pages so the index lists all twelve.
const POST_FILES: { slug: string; raw: unknown }[] = [
  { slug: "camera-ready-skin", raw: blogCameraReadySkin },
  { slug: "cortisol-and-decision-making", raw: blogCortisolAndDecisionMaking },
  { slug: "founder-stress-response", raw: blogFounderStressResponse },
  { slug: "how-much-sleep-do-founders-need", raw: blogHowMuchSleepDoFoundersNeed },
  { slug: "look-sharp-by-9am", raw: blogLookSharpBy9am },
  { slug: "night-shift", raw: blogNightShift },
  { slug: "pdrn-explained", raw: blogPdrnExplained },
  { slug: "science-of-attractive-health", raw: blogScienceOfAttractiveHealth },
  { slug: "signs-of-founder-burnout", raw: blogSignsOfFounderBurnout },
  { slug: "sleep-and-fundraising-performance", raw: blogSleepAndFundraisingPerformance },
  { slug: "start-slow", raw: blogStartSlow },
  { slug: "why-founders-cant-sleep", raw: blogWhyFoundersCantSleep },
];

// Builds an index card from a post's own stored page: the headline, the
// category and date line, the opening paragraph, and the first image.
function cardFromPost(slug: string, raw: unknown): BlogCard {
  const data = raw as PageData;
  const html = data.contentHtml;
  const titleMatch = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
  const title = titleMatch ? stripTags(titleMatch[1]) : "";
  const metaMatch = /tb-meta[^>]*>([\s\S]*?)<\/div>/.exec(html);
  const imgMatch = /<img[^>]+src="([^"]+)"[^>]*?(?:alt="([^"]*)")?/.exec(html);
  let excerpt = "";
  const pRe = /<p[^>]*>([\s\S]*?)<\/p>/g;
  let p: RegExpExecArray | null;
  while ((p = pRe.exec(html)) !== null) {
    const text = stripTags(p[1]);
    if (text.length >= 40) {
      excerpt = text;
      break;
    }
  }
  return {
    href: `/blog/${slug}`,
    meta: metaMatch ? stripTags(metaMatch[1]) : "",
    title,
    excerpt,
    image: imgMatch ? imgMatch[1] : "",
    imageAlt: imgMatch && imgMatch[2] ? stripTags(imgMatch[2]) : title,
  };
}

// The journal index cards. The six featured posts come from the stored
// index page, in their stored order, with their stored copy and images.
// The remaining posts are appended from their own stored pages, so the
// index links every published post exactly once.
export function getBlogCards(): BlogCard[] {
  const data = blogIndexRaw as unknown as PageData;
  const html = data.contentHtml;
  const cards: BlogCard[] = [];
  const cardRe = /<a class="tb-card" href="([^"]+)">([\s\S]*?)<\/a>/g;
  let m: RegExpExecArray | null;
  while ((m = cardRe.exec(html)) !== null) {
    const body = m[2];
    const img = /<img[^>]+src="([^"]+)"[^>]*?(?:alt="([^"]*)")?/.exec(body);
    const meta = /tb-meta">([^<]+)/.exec(body);
    const title = /<h[23][^>]*>([\s\S]*?)<\/h[23]>/.exec(body);
    const excerpt = /<p>([\s\S]*?)<\/p>/.exec(body);
    cards.push({
      href: m[1],
      meta: meta ? stripTags(meta[1]) : "",
      title: title ? stripTags(title[1]) : "",
      excerpt: excerpt ? stripTags(excerpt[1]) : "",
      image: img ? img[1] : "",
      imageAlt: img && img[2] ? stripTags(img[2]) : "",
    });
  }
  const seen = new Set(cards.map((card) => card.href));
  for (const post of POST_FILES) {
    const href = `/blog/${post.slug}`;
    if (seen.has(href)) continue;
    seen.add(href);
    cards.push(cardFromPost(post.slug, post.raw));
  }
  return cards;
}
