"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { Suspense } from "react";
import LanguageSwitcher, { LanguageSwitcherFallback } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";

export default function Header({
  locale = "en",
  dict,
}: {
  locale?: Locale;
  dict: Dict;
}) {
  const [open, setOpen] = useState(false);
  const c = dict.chrome;
  const NAV = [
    { href: "/glow-brightening-serum", label: c.navSerum },
    { href: "/about", label: c.navAbout },
    { href: "/ingredients", label: c.navIngredients },
    { href: "/faq", label: c.navFaqs },
    { href: "/blog", label: c.navBlog },
    { href: "/contact", label: c.navContact },
  ];
  const lh = (href: string) => localizeHref(href, locale);
  return (
    <header className="bg-forest text-[#fafaf9]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link href={lh("/")} aria-label={c.homeAria} className="shrink-0">
          <Logo className="h-7 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label={c.primaryNavAria}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={lh(item.href)}
              className="text-sm font-medium text-[#fafaf9]/85 transition-colors hover:text-gold-metal"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Suspense fallback={<LanguageSwitcherFallback locale={locale} label={c.language} />}>
            <LanguageSwitcher locale={locale} label={c.language} />
          </Suspense>
          <Link
            href={lh("/login")}
            className="hidden text-sm font-medium text-[#fafaf9]/85 transition-colors hover:text-gold-metal sm:inline-flex"
          >
            {c.login}
          </Link>
          <Button
            render={<Link href={lh("/glow-brightening-serum")} />}
            className="accent-btn hidden border-[#D8C19A]/60 sm:inline-flex"
            size="lg"
          >
            {c.addToRoutine}
          </Button>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md text-[#fafaf9] lg:hidden"
            aria-expanded={open}
            aria-label={open ? c.closeMenu : c.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          className="border-t border-white/10 px-5 pt-2 pb-5 lg:hidden"
          aria-label={c.mobileNavAria}
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={lh(item.href)}
              className="block py-2.5 text-base font-medium text-[#fafaf9]/90"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={lh("/glow-brightening-serum")}
            className="mt-3 block py-2.5 text-base font-semibold text-gold-metal"
            onClick={() => setOpen(false)}
          >
            {c.addToRoutine}
          </Link>
          <Link
            href={lh("/login")}
            className="block py-2.5 text-base font-medium text-[#fafaf9]/90"
            onClick={() => setOpen(false)}
          >
            {c.login}
          </Link>
        </nav>
      )}
    </header>
  );
}
