"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
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
.th-stage { position: sticky; top: 0; height: 100vh; height: 100svh; display: flex; align-items: center; justify-content: center; background: #f8f7f5; padding: 12px; box-sizing: border-box; }
.th-wrap { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8f7f5; display: flex; justify-content: center; padding: 20px; }
.th-frame { width: 100%; max-width: 420px; border-radius: 28px; overflow: hidden; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.08); height: 420px; background: #08251D; }
.th-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.6s ease-in-out; }
.th-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%); }
.th-copy { position: absolute; top: 24px; left: 20px; z-index: 2; color: white; }
.th-title { font-size: 34px; font-weight: 700; line-height: 1.05; text-shadow: 0 2px 12px rgba(0,0,0,0.5); max-width: 58%; white-space: pre-line; }
.th-sub { font-size: 15px; line-height: 1.4; color: rgba(255,255,255,0.92); text-shadow: 0 1px 8px rgba(0,0,0,0.5); max-width: 58%; margin: 10px 0 0 0; }
.th-start { position: absolute; right: 20px; bottom: 20px; z-index: 2; background: #1a1a1a; color: white; border: none; border-radius: 30px; padding: 12px 18px; font-size: 14px; font-weight: 600; cursor: pointer; }
.th-card { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); width: 216px; height: 260px; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.25); z-index: 3; background-size: cover; background-position: center; transition: background-image 0.6s ease-in-out; }
.th-card-shade { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%); }
.th-card-inner { position: relative; height: 100%; padding: 14px; display: flex; flex-direction: column; justify-content: flex-end; color: white; box-sizing: border-box; }
.th-badge { background: rgba(255,255,255,0.88); backdrop-filter: blur(12px); border-radius: 16px; padding: 10px 14px; width: fit-content; max-width: 100%; color: #1a1a1a; box-sizing: border-box; }
.th-badge-title { font-size: 14px; font-weight: 600; margin: 0; }
.th-badge-sub { font-size: 11px; color: #555; margin: 2px 0 0 0; }
.th-dots { display: flex; gap: 7px; background: rgba(255,255,255,0.7); padding: 7px 12px; border-radius: 20px; width: fit-content; margin-top: 10px; }
.th-dot { width: 7px; height: 7px; border-radius: 50%; transition: background 0.3s; border: none; padding: 0; cursor: pointer; }
@media (max-width: 480px) {
  .th-wrap { padding: 12px; }
  .th-frame { height: 440px; border-radius: 24px; }
  .th-copy { top: 18px; left: 16px; right: 16px; }
  .th-title { font-size: 27px; max-width: 60%; }
  .th-sub { font-size: 13.5px; max-width: 56%; margin-top: 8px; }
  .th-card { width: 164px; height: 208px; right: 12px; border-radius: 18px; }
  .th-card-inner { padding: 10px; }
  .th-badge { padding: 8px 10px; border-radius: 13px; }
  .th-badge-title { font-size: 13px; }
  .th-badge-sub { font-size: 10.5px; }
  .th-dots { padding: 6px 10px; margin-top: 8px; }
  .th-start { right: 14px; bottom: 14px; padding: 11px 16px; font-size: 13.5px; }
}
`;

const TavaHeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

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

  return (
    <div className="th-scroll" ref={targetRef}>
      <style>{heroCss}</style>
      <div className="th-stage">
        <motion.div className="th-frame" style={{ scale: heroScale }}>
        {/* Video Background: every slide stays mounted and preloaded, only the active one is visible */}
        {slides.map((s, i) => (
          <video
            key={s.id}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="th-video"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <source src={s.video} />
          </video>
        ))}

        {/* Overlay */}
        <div className="th-overlay" />

        {/* Hero title and subtitle, over the video */}
        <div className="th-copy">
          <div className="th-title">{slide.title}</div>
          <p className="th-sub">{slide.subtitle}</p>
        </div>

        {/* Start now, bottom corner of the frame */}
        <button className="th-start">Start now →</button>

        {/* Product card on the right: the product image is the card background with an overlay,
            and the badge chip and dots chip sit on the card */}
        <div
          className="th-card"
          style={{ backgroundImage: `url(${slide.product})` }}
        >
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
                    onClick={() => setCurrent(i)}
                    className="th-dot"
                    style={{ background: i === current ? "#d4af37" : "#a89f92" }}
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
