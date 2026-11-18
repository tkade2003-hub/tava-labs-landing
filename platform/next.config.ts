import type { NextConfig } from "next";

// Static export ONLY: hosting is GitHub Pages at tavalabs.app (no Node
// server). `next build` emits plain HTML/JS to platform/out/, and the
// exported login.html + app.html + _next/ assets are committed at the
// landing repo root, alongside the existing static marketing/quiz/legal
// pages, which this app does not touch.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,
};

export default nextConfig;
