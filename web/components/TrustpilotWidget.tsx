"use client";

import Script from "next/script";

// Trustpilot TrustBox, Review Collector. The snippet was supplied by Vashon
// on 2026-11-23 and is installed exactly as given. The bootstrap script is
// the companion piece Trustpilot requires: it finds the widget div on the
// page and replaces it with the rendered TrustBox. Both live only in this
// component, which only the home page renders, so no other page carries it.
export default function TrustpilotWidget() {
  return (
    <section className="border-t border-linestone">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <Script
          id="trustpilot-bootstrap"
          src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          strategy="afterInteractive"
        />
        <div
          className="trustpilot-widget"
          data-locale="en-US"
          data-template-id="56278e9abfbbba0bdcd568bc"
          data-businessunit-id="6b040ef8a7dbf30ad4d391b2"
          data-style-height="52px"
          data-style-width="100%"
        >
          <a
            href="https://www.trustpilot.com/review/tavalabs.app"
            target="_blank"
            rel="noopener"
          >
            Trustpilot
          </a>
        </div>
      </div>
    </section>
  );
}
