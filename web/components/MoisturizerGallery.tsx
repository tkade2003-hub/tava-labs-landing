"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";
import { EN_DICT } from "@/lib/i18n/dictionaries";
import { MOISTURIZER_IMAGES } from "@/lib/moisturizerImages";

export default function MoisturizerGallery({ dict = EN_DICT }: { dict?: Dict }) {
  const g = dict.moisturizer.gallery;
  const VIEWS = MOISTURIZER_IMAGES.map((src, i) => ({ src, alt: g.alts[i] ?? "" }));
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-linen">
        <Image
          key={VIEWS[active].src}
          src={VIEWS[active].src}
          alt={VIEWS[active].alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {VIEWS.map((view, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={fmt(g.view, { n: i + 1 })}
            aria-pressed={active === i}
            className={cn(
              "relative aspect-square overflow-hidden rounded-xl bg-linen ring-offset-2 transition",
              active === i
                ? "ring-2 ring-forest"
                : "opacity-70 hover:opacity-100"
            )}
          >
            <Image
              src={view.src}
              alt=""
              fill
              sizes="20vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
