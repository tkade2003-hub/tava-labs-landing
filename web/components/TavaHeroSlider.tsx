"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { SERUM_CARD, ADHD_CARD, LABS_CARD } from "@/lib/heroMedia";

const slides = [
  {
    id: 1,
    video: "/assets/home/hero/4b21f433-0611-b15d-e2d6-71b9a2097cba.mov",
    product: SERUM_CARD,
    title: "Look sharp\non Tava",
    badgeTitle: "Tava Labs",
    badgeSub: "PDRN Brightening Serum",
    subtitle: "PDRN Brightening Serum",
  },
  {
    id: 2,
    video: "/assets/home/hero/5f0f1809-5fe9-e9cd-ad9b-5efb16ec611d.mov",
    product: ADHD_CARD,
    title: "Focus better\non Tava",
    badgeTitle: "ADHD",
    badgeSub: "After clinician review",
    subtitle: "After clinician review",
  },
  {
    id: 3,
    video: "/assets/home/hero/18241b3c-f2f5-468c-8df0-14c2b7bfb624.mov",
    product: LABS_CARD,
    title: "Know your data\non Tava",
    badgeTitle: "Lab Biomarkers",
    badgeSub: "Performance insights",
    subtitle: "Performance insights",
  },
];

const heroCss = `
.th-scroll { position: relative; height: 1500px; }
.th-stage { position: sticky; top: 0; height: calc(100vh - 68px); height: calc(100svh - 68px); min-height: 520px; display: flex; align-items: center; justify-content: center; background: #f8f7f5; overflow: hidden; }
.th-hero { position: relative; width: 100%; height: 100%; overflow: hidden; background: #08251D; font-family: var(--font-brand); }
.th-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.9s ease-in-out; }
.th-video-active { animation: th-kenburns 7s ease-out forwards; }
@keyframes th-kenburns { from { transform: scale(1); } to { transform: scale(1.07); } }
.th-overlay { position: absolute; inset: 0; background: linear-gradient(97deg, rgba(8,37,29,0.66) 0%, rgba(8,37,29,0.28) 42%, rgba(8,37,29,0) 68%), linear-gradient(0deg, rgba(8,37,29,0.42) 0%, rgba(8,37,29,0) 34%); }
.th-copy { position: absolute; top: 48px; left: 48px; z-index: 2; color: white; width: 600px; max-width: calc(100% - 360px); }
.th-title { font-family: var(--font-brand); font-size: 56px; font-weight: 800; line-height: 1.05; letter-spacing: -0.01em; text-shadow: 0 2px 18px rgba(8,37,29,0.45); max-width: 100%; white-space: pre-line; margin: 0; }
.th-sub { font-size: 19px; font-weight: 600; line-height: 1.55; color: rgba(255,255,255,0.88); text-shadow: 0 1px 10px rgba(8,37,29,0.5); max-width: 82%; margin: 16px 0 0 0; }
.th-start { position: absolute; right: 48px; bottom: 48px; z-index: 2; background: #12100C; color: #D4AF37; border: 1px solid rgba(216,193,154,0.35); border-radius: 999px; padding: 14px 24px; font-family: "Cattalague", var(--font-brand); font-size: 20px; font-weight: 400; cursor: pointer; transition: background 0.25s ease, color 0.25s ease; }
.th-start:hover { background: #08251D; color: #FAFAF9; }
.th-start:focus-visible, .th-dot:focus-visible { outline: 2px solid #B78B45; outline-offset: 2px; }
.th-card { position: absolute; right: 48px; top: 50%; transform: translateY(-50%); width: 216px; height: 264px; border-radius: 22px; overflow: hidden; border: 1px solid rgba(216,193,154,0.55); box-shadow: 0 24px 48px rgba(8,37,29,0.45), 0 4px 14px rgba(0,0,0,0.25); z-index: 3; background: #08251D; }
.th-card-img { position: absolute; inset: 0; background-size: cover; background-position: center; transition: opacity 0.9s ease-in-out; }
.th-card-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(8,37,29,0) 42%, rgba(8,37,29,0.58) 100%); }
.th-card-inner { position: relative; height: 100%; padding: 14px; display: flex; flex-direction: column; justify-content: flex-end; color: white; box-sizing: border-box; }
.th-badge { background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-radius: 16px; padding: 10px 14px; width: fit-content; max-width: 100%; color: #1a1a1a; box-sizing: border-box; }
.th-badge-title { font-size: 14px; font-weight: 700; margin: 0; }
.th-badge-sub { font-size: 11px; color: #555; margin: 2px 0 0 0; }
.th-dots { display: flex; gap: 2px; background: rgba(255,255,255,0.72); padding: 4px 8px; border-radius: 999px; width: fit-content; margin-top: 10px; }
.th-dot { width: 24px; height: 20px; border-radius: 999px; border: none; padding: 0; cursor: pointer; background-color: transparent; background-repeat: no-repeat; background-position: center; }
@media (max-width: 900px) {
  .th-copy { top: 32px; left: 28px; width: 480px; max-width: calc(100% - 300px); }
  .th-title { font-size: 44px; max-width: 56%; }
  .th-sub { max-width: 82%; }
  .th-card { right: 28px; }
  .th-start { right: 28px; bottom: 28px; }
}
@media (max-width: 640px) {
  .th-copy { top: 22px; left: 18px; right: 18px; width: auto; max-width: none; }
  .th-title { font-size: 36px; max-width: 92%; }
  .th-sub { font-size: 18px; max-width: 84%; margin-top: 10px; }
  .th-card { top: auto; bottom: 20px; transform: none; width: 168px; height: 214px; right: 14px; border-radius: 18px; }
  .th-card-inner { padding: 10px; }
  .th-badge { padding: 8px 10px; border-radius: 13px; }
  .th-badge-title { font-size: 13px; }
  .th-badge-sub { font-size: 10.5px; }
  .th-dots { margin-top: 8px; }
  .th-start { right: auto; left: 16px; bottom: 20px; padding: 13px 22px; }
}
@media (prefers-reduced-motion: reduce) {
  .th-video-active { animation: none; }
  .th-video, .th-card-img { transition: none; }
}
`;

const TavaHeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    mass: 0.4,
  });
  const heroScale = useTransform(smoothProgress, [0, 1], [1, 0.82]);
  const heroRadius = useTransform(smoothProgress, [0, 1], [0, 32]);

  return (
    <div className="th-scroll" ref={targetRef}>
      <style>{heroCss}</style>
      <div className="th-stage">
        <motion.div
          className="th-hero"
          style={{ scale: heroScale, borderRadius: heroRadius }}
        >
          {/* Full hero video background: every slide stays mounted and preloaded, only the active one is visible */}
          {slides.map((s, i) => (
            <video
              key={s.id}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              className={
                i === current && !reduceMotion
                  ? "th-video th-video-active"
                  : "th-video"
              }
              style={{ opacity: i === current ? 1 : 0 }}
            >
              <source src={s.video} />
            </video>
          ))}

          {/* Overlay */}
          <div className="th-overlay" />

          {/* Hero title and subtitle, over the video */}
          <motion.div
            className="th-copy"
            key={slide.id}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="th-title">{slide.title}</h1>
            <p className="th-sub">{slide.subtitle}</p>
          </motion.div>

          {/* Start now, bottom corner of the hero */}
          <button className="th-start"><span className="gold-metal-text">Start now →</span></button>

          {/* The only card in the hero: the product image card on the right,
              with the badge chip and dots chip on it */}
          <div className="th-card">
            {slides.map((s, i) => (
              <div
                key={s.id}
                className="th-card-img"
                style={{
                  backgroundImage: `url(${s.product})`,
                  opacity: i === current ? 1 : 0,
                }}
              />
            ))}
            <div className="th-card-shade" />
            <div className="th-card-inner">
              <div>
                <div className="th-badge">
                  <h3 className="th-badge-title">{slide.badgeTitle}</h3>
                  <p className="th-badge-sub">{slide.badgeSub}</p>
                </div>

                <div className="th-dots">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-label={`Go to slide ${i + 1}`}
                      aria-current={i === current}
                      onClick={() => setCurrent(i)}
                      className="th-dot"
                      style={{
                        backgroundImage: `radial-gradient(circle, ${
                          i === current ? "#B78B45" : "#a89f92"
                        } 3.5px, transparent 4.5px)`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TavaHeroSlider;
