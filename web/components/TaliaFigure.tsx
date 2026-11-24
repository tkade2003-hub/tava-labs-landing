"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { HERO_TALIA } from "../lib/heroImages";
import type { Dict } from "@/lib/i18n/dictionaries";

/*
  Talia figure for the hero panel, added 2026-11-23 at Vashon direction.
  Her supplied photograph ships with the wall removed and the hem
  feathered into the panel ground. Behind her, a flat gold trend line
  plots the two measured points of the 16 week participant program for
  total acne lesions, 16.8 at baseline and 6.2 at week 16, with no
  invented points between. A frosted stat card floats at her side.
  The line, the figure, and the card drift at different rates on
  scroll; reduced motion turns the drift off.
*/

export default function TaliaFigure({ dict }: { dict: Dict }) {
  const t = dict.hero.talia;
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const root = rootRef.current;
      if (!root) return;
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = Math.max(
        -1,
        Math.min(1, (r.top + r.height / 2 - vh / 2) / vh),
      );
      if (lineRef.current)
        lineRef.current.style.transform = `translate3d(0, ${(-p * 9).toFixed(1)}px, 0)`;
      if (tagsRef.current)
        tagsRef.current.style.transform = `translate3d(0, ${(-p * 9).toFixed(1)}px, 0)`;
      if (imgRef.current)
        imgRef.current.style.transform = `translate3d(0, ${(p * 6).toFixed(1)}px, 0)`;
      if (cardRef.current)
        cardRef.current.style.transform = `translate3d(0, ${(p * 15).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hr-fig" ref={rootRef}>
      <div className="hr-fig-line" ref={lineRef} aria-hidden="true">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path
            className="hr-fig-path"
            d="M 3.5 20 C 35 28, 62 52, 96.5 74"
          />
        </svg>
        <span className="hr-dot hr-dot-a" />
        <span className="hr-dot hr-dot-b" />
      </div>

      <div className="hr-fig-img" ref={imgRef}>
        <Image
          src={HERO_TALIA}
          alt={t.alt}
          fill
          priority
          sizes="(min-width: 900px) 45vw, 88vw"
          style={{ objectFit: "contain", objectPosition: "50% 100%" }}
        />
      </div>

      <div className="hr-fig-tags" ref={tagsRef} aria-hidden="true">
        <span className="hr-tag hr-tag-a">
          <b>{t.baseline}</b>
          <span>16.8</span>
        </span>
        <span className="hr-tag hr-tag-b">
          <b>{t.week16}</b>
          <span>6.2</span>
        </span>
      </div>

      <div className="hr-stat-pos" ref={cardRef}>
        <div className="hr-stat">
          <div className="hr-stat-top">
            <span className="hr-stat-label">{t.week16}</span>
            <span className="hr-stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="17" height="17">
                <path
                  d="M12 2.8c3.6 4.4 6.2 7.9 6.2 10.9a6.2 6.2 0 1 1 -12.4 0c0-3 2.6-6.5 6.2-10.9z"
                  fill="#fff"
                />
              </svg>
            </span>
          </div>
          <p className="hr-stat-big">
            <span aria-hidden="true">↓</span> {t.statBig}
          </p>
          <p className="hr-stat-cap">{t.statCap}</p>
          <p className="hr-stat-note">{t.statNote}</p>
        </div>
      </div>
    </div>
  );
}
