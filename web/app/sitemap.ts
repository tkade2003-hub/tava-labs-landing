import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://tavalabs.app", changeFrequency: "weekly", priority: 1.0 },
    { url: "https://tavalabs.app/about", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/contact", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/faq", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/ingredients", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://tavalabs.app/research", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://tavalabs.app/partners", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/glow-brightening-serum", changeFrequency: "monthly", priority: 0.9 },
    { url: "https://tavalabs.app/quiz", changeFrequency: "monthly", priority: 0.9 },
    { url: "https://tavalabs.app/blog", changeFrequency: "weekly", priority: 0.8 },
    { url: "https://tavalabs.app/blog/camera-ready-skin", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/blog/cortisol-and-decision-making", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/blog/founder-stress-response", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/blog/how-much-sleep-do-founders-need", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/blog/look-sharp-by-9am", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/blog/night-shift", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/blog/pdrn-explained", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/blog/science-of-attractive-health", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/blog/signs-of-founder-burnout", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/blog/sleep-and-fundraising-performance", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/blog/start-slow", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/blog/why-founders-cant-sleep", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://tavalabs.app/terms", changeFrequency: "yearly", priority: 0.3 },
    { url: "https://tavalabs.app/privacy", changeFrequency: "yearly", priority: 0.3 },
    { url: "https://tavalabs.app/cookies", changeFrequency: "yearly", priority: 0.3 },
    { url: "https://tavalabs.app/shipping", changeFrequency: "yearly", priority: 0.3 },
    { url: "https://tavalabs.app/returns", changeFrequency: "yearly", priority: 0.3 }
  ];
}
