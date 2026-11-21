"use client";

import React, { useState, useEffect } from "react";
import { SERUM_CARD, ADHD_CARD, LABS_CARD } from "@/lib/heroMedia";

const slides = [
  {
    id: 1,
    video: "/assets/home/hero/4b21f433-0611-b15d-e2d6-71b9a2097cba.mov",
    product: SERUM_CARD,
    title: "Look sharp\non Tava",
    badgeTitle: "Tava Labs",
    badgeSub: "PDRN Brightening Serum",
  },
  {
    id: 2,
    video: "/assets/home/hero/5f0f1809-5fe9-e9cd-ad9b-5efb16ec611d.mov",
    product: ADHD_CARD,
    title: "Focus better\non Tava",
    badgeTitle: "ADHD",
    badgeSub: "After clinician review",
  },
  {
    id: 3,
    video: "/assets/home/hero/18241b3c-f2f5-468c-8df0-14c2b7bfb624.mov",
    product: LABS_CARD,
    title: "Know your data\non Tava",
    badgeTitle: "Lab Biomarkers",
    badgeSub: "Performance insights",
  },
];

const TavaHeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: "#f8f7f5",
        display: "flex",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "28px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          height: "420px",
          background: "#08251D",
        }}
      >
        {/* Video Background: every slide stays mounted and preloaded, only the active one is visible */}
        {slides.map((s, i) => (
          <video
            key={s.id}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: i === current ? 1 : 0,
              transition: "opacity 0.6s ease-in-out",
            }}
          >
            <source src={s.video} />
          </video>
        ))}

        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "white",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "34px",
                fontWeight: 700,
                lineHeight: 1.05,
                textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                maxWidth: "58%",
                whiteSpace: "pre-line",
              }}
            >
              {slide.title}
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(12px)",
                borderRadius: "16px",
                padding: "10px 14px",
                width: "fit-content",
                color: "#1a1a1a",
                marginTop: "14px",
              }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>
                {slide.badgeTitle}
              </h3>
              <p style={{ fontSize: "11px", color: "#555", margin: "2px 0 0 0" }}>
                {slide.badgeSub}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "7px",
                background: "rgba(255,255,255,0.7)",
                padding: "7px 12px",
                borderRadius: "20px",
              }}
            >
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: i === current ? "#d4af37" : "#ccc",
                    transition: "background 0.3s",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            <button
              style={{
                background: "#1a1a1a",
                color: "white",
                border: "none",
                borderRadius: "30px",
                padding: "12px 18px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start now →
            </button>
          </div>
        </div>

        {/* Product card on the right */}
        <div
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "140px",
            height: "180px",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            zIndex: 3,
            backgroundImage: `url(${slide.product})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "background-image 0.6s ease-in-out",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.4) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TavaHeroSlider;
