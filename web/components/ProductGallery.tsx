"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const VIEWS = [
  { src: "/assets/products/pdrn-bright-serum/view-1-mockup.jpg", alt: "PDRN Brightening Serum bottle" },
  { src: "/assets/products/pdrn-bright-serum/view-2-mockup.jpg", alt: "Serum bottle view 2" },
  { src: "/assets/products/pdrn-bright-serum/view-3-mockup.jpg", alt: "Serum bottle view 3" },
  { src: "/assets/products/pdrn-bright-serum/view-4-mockup.jpg", alt: "Serum bottle view 4" },
  { src: "/assets/products/pdrn-bright-serum/view-5-mockup.jpg", alt: "Serum bottle view 5" },
];

export default function ProductGallery() {
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
      <div className="mt-3 grid grid-cols-5 gap-3">
        {VIEWS.map((view, i) => (
          <button
            key={view.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`View ${i + 1}`}
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
