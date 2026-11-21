"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/glow-brightening-serum", label: "The Serum" },
  { href: "/about", label: "About" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/faq", label: "FAQs" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-forest text-[#fafaf9]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link href="/" aria-label="Tava Labs home" className="shrink-0">
          <Logo className="h-7 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#fafaf9]/85 transition-colors hover:text-gold-metal"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-[#fafaf9]/85 transition-colors hover:text-gold-metal sm:inline-flex"
          >
            Login
          </Link>
          <Button
            render={<Link href="/quiz" />}
            className="hidden bg-gold text-white hover:bg-gold/85 sm:inline-flex"
            size="lg"
          >
            Take the Quiz
          </Button>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md text-[#fafaf9] lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          className="border-t border-white/10 px-5 pt-2 pb-5 lg:hidden"
          aria-label="Mobile"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2.5 text-base font-medium text-[#fafaf9]/90"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/quiz"
            className="mt-3 block py-2.5 text-base font-semibold text-gold-metal"
            onClick={() => setOpen(false)}
          >
            Take the Quiz
          </Link>
          <Link
            href="/login"
            className="block py-2.5 text-base font-medium text-[#fafaf9]/90"
            onClick={() => setOpen(false)}
          >
            Login
          </Link>
        </nav>
      )}
    </header>
  );
}
