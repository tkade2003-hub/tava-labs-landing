"use client";

import { useCallback, useEffect, useState } from "react";

const MOTION_VIDEOS = [
  "video_1794963376632",
  "video_1794967533613",
  "video_1794974090775",
  "video_1795026257064",
  "video_1795026641447",
  "video_1795026966409",
  "video_1795026997440",
  "video_1795028291814",
  "video_1795028309764",
];

function PlayTriangle() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-1/2 z-[2] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center [filter:drop-shadow(0_1px_5px_rgba(0,0,0,0.5))]"
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="#ffffff" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

export default function MotionCarousel() {
  const [active, setActive] = useState<string | null>(null);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, close]);

  const cards = [...MOTION_VIDEOS, ...MOTION_VIDEOS];

  return (
    <section className="overflow-hidden bg-white pt-[34px] pb-[10px]">
      <p className="mb-[18px] text-center text-[13px] font-semibold text-black">
        Tava in Motion
      </p>
      <p className="mx-auto mb-5 max-w-[640px] px-5 text-center text-[19px] leading-[1.5] text-black">
        Many creators and entrepreneurs already love us.
      </p>
      <div className="tava-marquee overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
        <div className="tava-marquee-track">
          {cards.map((v, i) => {
            const src = `/assets/ads/${v}.mp4`;
            return (
              <div
                key={`${v}-${i}`}
                role="button"
                tabIndex={0}
                aria-label="Play video"
                aria-hidden={i >= MOTION_VIDEOS.length}
                onClick={() => setActive(src)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(src);
                  }
                }}
                className="relative h-[338px] w-[190px] shrink-0 cursor-pointer overflow-hidden rounded-[22px] border-2 border-gold-soft bg-black shadow-[0_10px_28px_rgba(0,0,0,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold max-[600px]:h-[267px] max-[600px]:w-[150px]"
              >
                <PlayTriangle />
                <video
                  src={src}
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="pointer-events-none block h-full w-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(0,0,0,0.92)] p-5"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close video"
            className="absolute top-[18px] right-[22px] flex h-11 w-11 items-center justify-center rounded-full bg-black text-[22px] leading-none text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            &times;
          </button>
          <video
            key={active}
            src={active}
            controls
            playsInline
            autoPlay
            className="max-h-[86vh] w-full max-w-[min(420px,92vw)] rounded-[22px] border-2 border-gold-soft bg-black"
          />
        </div>
      )}
    </section>
  );
}
