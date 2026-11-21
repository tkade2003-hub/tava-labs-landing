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
.th-inner { position: absolute; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; gap: 64px; max-width: 1280px; margin: 0 auto; padding: 48px; box-sizing: border-box; }
.th-copy { position: relative; color: white; flex: 1 1 auto; max-width: 620px; }
.th-title { font-family: "Futura extra font", "Futura font", sans-serif; font-style: italic; font-size: 76px; font-weight: 900; line-height: 1.05; letter-spacing: -0.01em; text-shadow: 0 2px 18px rgba(8,37,29,0.45); max-width: 100%; white-space: pre-line; margin: 0; }
.th-sub { font-size: 20px; font-weight: 600; line-height: 1.55; color: rgba(255,255,255,0.88); text-shadow: 0 1px 10px rgba(8,37,29,0.5); max-width: 90%; margin: 18px 0 0 0; }
.th-start { text-decoration: none; display: inline-block; margin-top: 30px; background: #08251D; color: #D8C19A; border: none; border-radius: 8px; padding: 13px 48px; font-family: var(--font-kanit), sans-serif; font-size: 1.05rem; font-style: italic; font-weight: 700; text-transform: uppercase; cursor: pointer; transition: background 0.25s ease, color 0.25s ease; }
.th-start:hover { background: #08251D; color: #FAFAF9; }
.th-start:focus-visible, .th-dot:focus-visible { outline: 2px solid #B78B45; outline-offset: 2px; }
.th-card { position: relative; flex: 0 0 auto; width: 264px; height: 330px; border-radius: 22px; overflow: hidden; border: 1px solid rgba(216,193,154,0.55); box-shadow: 0 24px 48px rgba(8,37,29,0.45), 0 4px 14px rgba(0,0,0,0.25); background: #08251D; }
.th-card-img { position: absolute; inset: 0; background-size: cover; background-position: center; transition: opacity 0.9s ease-in-out; }
.th-card-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(8,37,29,0) 42%, rgba(8,37,29,0.58) 100%); }
.th-card-inner { position: relative; height: 100%; padding: 14px; display: flex; flex-direction: column; justify-content: flex-end; color: white; box-sizing: border-box; }
.th-badge { background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-radius: 16px; padding: 10px 14px; width: fit-content; max-width: 100%; color: #1a1a1a; box-sizing: border-box; }
.th-badge-title { font-size: 14px; font-weight: 700; margin: 0; }
.th-badge-sub { font-size: 11px; color: #555; margin: 2px 0 0 0; }
.th-dots { display: flex; gap: 2px; background: rgba(255,255,255,0.72); padding: 4px 8px; border-radius: 999px; width: fit-content; margin-top: 10px; }
.th-dot { width: 24px; height: 20px; border-radius: 999px; border: none; padding: 0; cursor: pointer; background-color: transparent; background-repeat: no-repeat; background-position: center; }
@media (max-width: 900px) {
  .th-inner { padding: 36px 32px; gap: 40px; }
  .th-title { font-size: 60px; }
  .th-card { width: 232px; height: 292px; }
}
@media (max-width: 640px) {
  .th-inner { flex-direction: column; align-items: center; justify-content: center; padding: 28px 20px; gap: 30px; }
  .th-copy { flex: none; max-width: none; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .th-title { font-size: 42px; text-align: center; }
  .th-sub { font-size: 18px; max-width: 92%; margin-top: 10px; }
  .th-start { margin-top: 20px; padding: 13px 28px; }
  .th-card { width: 190px; height: 240px; border-radius: 18px; }
  .th-card-inner { padding: 10px; align-items: center; }
  .th-badge { padding: 8px 10px; border-radius: 13px; }
  .th-badge-title { font-size: 13px; }
  .th-badge-sub { font-size: 10.5px; }
  .th-dots { margin-top: 8px; }
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

          {/* One grouped composition over the video: title, subtitle, and the
              Add to routine button together on the left, the product image
              card beside them on the right */}
          <div className="th-inner">
          <motion.div
            className="th-copy"
            key={slide.id}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="th-title">{slide.title}</h1>
            <p className="th-sub">{slide.subtitle}</p>
            <a className="th-start" href="/glow-brightening-serum">Add to routine</a>
          </motion.div>

          {/* The only card in the hero: the product image card,
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TavaHeroSlider;
