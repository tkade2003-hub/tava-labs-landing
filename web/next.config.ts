import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tava.mydose.store",
        pathname: "/_next/static/media/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
    { source: "/index.html", destination: "/", permanent: true },
    { source: "/product-template.html", destination: "/glow-brightening-serum", permanent: true },
    { source: "/about.html", destination: "/about", permanent: true },
    { source: "/contact.html", destination: "/contact", permanent: true },
    { source: "/faq.html", destination: "/faq", permanent: true },
    { source: "/ingredients.html", destination: "/ingredients", permanent: true },
    { source: "/partners.html", destination: "/partners", permanent: true },
    { source: "/glow-brightening-serum.html", destination: "/glow-brightening-serum", permanent: true },
    { source: "/quiz.html", destination: "/quiz", permanent: true },
    { source: "/blog.html", destination: "/blog", permanent: true },
    { source: "/blog-camera-ready-skin.html", destination: "/blog/camera-ready-skin", permanent: true },
    { source: "/blog-cortisol-and-decision-making.html", destination: "/blog/cortisol-and-decision-making", permanent: true },
    { source: "/blog-founder-stress-response.html", destination: "/blog/founder-stress-response", permanent: true },
    { source: "/blog-how-much-sleep-do-founders-need.html", destination: "/blog/how-much-sleep-do-founders-need", permanent: true },
    { source: "/blog-look-sharp-by-9am.html", destination: "/blog/look-sharp-by-9am", permanent: true },
    { source: "/blog-night-shift.html", destination: "/blog/night-shift", permanent: true },
    { source: "/blog-pdrn-explained.html", destination: "/blog/pdrn-explained", permanent: true },
    { source: "/blog-science-of-attractive-health.html", destination: "/blog/science-of-attractive-health", permanent: true },
    { source: "/blog-signs-of-founder-burnout.html", destination: "/blog/signs-of-founder-burnout", permanent: true },
    { source: "/blog-sleep-and-fundraising-performance.html", destination: "/blog/sleep-and-fundraising-performance", permanent: true },
    { source: "/blog-start-slow.html", destination: "/blog/start-slow", permanent: true },
    { source: "/blog-why-founders-cant-sleep.html", destination: "/blog/why-founders-cant-sleep", permanent: true },
    { source: "/terms.html", destination: "/terms", permanent: true },
    { source: "/privacy.html", destination: "/privacy", permanent: true },
    { source: "/cookies.html", destination: "/cookies", permanent: true },
    { source: "/shipping.html", destination: "/shipping", permanent: true },
    { source: "/returns.html", destination: "/returns", permanent: true },
    { source: "/checkout/success.html", destination: "/checkout/success", permanent: true },
    { source: "/checkout/cancel.html", destination: "/checkout/cancel", permanent: true }
    ];
  },
};

export default nextConfig;
