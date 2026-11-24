"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LOCALES, localizeHref, type Locale } from "@/lib/i18n/config";

// The language switcher: a dropdown in the header listing every language
// by its own native name. Choosing one navigates to the same page in
// that language (English lives at the root, the rest under /<locale>).
export default function LanguageSwitcher({
  locale,
  label,
  dark = false,
}: {
  locale: Locale;
  label: string;
  dark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  // The current page path with any locale prefix stripped.
  const bare = (() => {
    const parts = pathname.split("/");
    if (parts.length > 1 && LOCALES.some((l) => l.code === parts[1] && parts[1] !== "en")) {
      return "/" + parts.slice(2).join("/");
    }
    return pathname;
  })();

  const current = LOCALES.find((l) => l.code === locale);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
          dark
            ? "text-forest-deep hover:text-forest"
            : "text-[#fafaf9]/85 hover:text-gold-metal"
        }`}
      >
        <Globe className="size-4" aria-hidden="true" />
        <span className="hidden md:inline">{current?.native}</span>
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute right-0 z-[120] mt-2 max-h-[70vh] w-52 overflow-y-auto rounded-2xl border border-linestone bg-white p-1.5 shadow-[0_18px_44px_rgba(8,37,29,0.22)]"
        >
          {LOCALES.map((l) => {
            const active = l.code === locale;
            return (
              <a
                key={l.code}
                role="option"
                aria-selected={active}
                href={localizeHref(bare === "" ? "/" : bare, l.code)}
                hrefLang={l.code}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm ${
                  active
                    ? "bg-linen font-semibold text-forest-deep"
                    : "text-ink/80 hover:bg-linen/70"
                }`}
              >
                <span>{l.native}</span>
                {active ? (
                  <Check className="size-4 text-forest" aria-hidden="true" />
                ) : null}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Static placeholder with the same footprint, used as the Suspense
// fallback in the header: on routes whose path is not known during
// prerendering (dynamic segments), usePathname must sit inside a
// Suspense boundary, and this renders until the real switcher hydrates.
export function LanguageSwitcherFallback({
  locale,
  label,
  dark = false,
}: {
  locale: Locale;
  label: string;
  dark?: boolean;
}) {
  const current = LOCALES.find((l) => l.code === locale);
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={label}
        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
          dark
            ? "text-forest-deep hover:text-forest"
            : "text-[#fafaf9]/85 hover:text-gold-metal"
        }`}
      >
        <Globe className="size-4" aria-hidden="true" />
        <span className="hidden md:inline">{current?.native}</span>
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
