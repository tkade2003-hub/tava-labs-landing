"use client";

import { useEffect } from "react";

// The platform app's own root: in production only login.html and
// app.html (plus _next assets) are deployed to the site root — the
// marketing index.html already lives there and is NOT replaced. This
// page exists for local dev completeness and simply forwards to login.
export default function RootPage() {
  useEffect(() => {
    window.location.href = "login.html";
  }, []);
  return (
    <main className="p-wrap">
      <div className="p-card">
        <p className="p-sub" style={{ margin: 0 }}>
          Taking you to <a href="login.html">sign in</a>…
        </p>
      </div>
    </main>
  );
}
