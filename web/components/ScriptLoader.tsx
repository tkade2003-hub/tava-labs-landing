"use client";

import { useEffect, useRef } from "react";
import type { PageScript } from "@/lib/pageData";

interface Props {
  scripts: PageScript[];
  htmlAttrs?: Record<string, string>;
  bodyClass?: string;
}

// Loads the page scripts preserved from the original static site, in their
// original order, after the server rendered markup is in place. Each script
// is appended as a real script element so it executes exactly as it did when
// the browser parsed it at the end of the original page body.
export default function ScriptLoader({ scripts, htmlAttrs, bodyClass }: Props) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (htmlAttrs) {
      for (const [name, value] of Object.entries(htmlAttrs)) {
        if (name === "lang") continue;
        document.documentElement.setAttribute(name, value);
      }
    }
    if (bodyClass) {
      document.body.classList.add(...bodyClass.split(/\s+/).filter(Boolean));
    }

    let cancelled = false;
    (async () => {
      for (const script of scripts) {
        if (cancelled) return;
        await new Promise<void>((resolve) => {
          const el = document.createElement("script");
          el.src = script.src;
          if (script.type) el.type = script.type;
          el.onload = () => resolve();
          el.onerror = () => resolve();
          document.body.appendChild(el);
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scripts, htmlAttrs, bodyClass]);

  return null;
}
