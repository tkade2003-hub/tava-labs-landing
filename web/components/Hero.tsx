import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const heroCss = `
.hn{position:relative;background:#FAFAF9;overflow:hidden}
.hn-glow{position:absolute;top:-220px;right:-140px;width:720px;height:720px;border-radius:50%;background:radial-gradient(circle,rgba(216,193,154,.68) 0%,rgba(216,193,154,0) 62%);pointer-events:none;animation:hn-breathe 9s ease-in-out infinite alternate}
.hn-inner{position:relative;max-width:1280px;margin:0 auto;padding:72px 24px 56px;display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center}
.hn-eyebrow{animation:hn-rise .8s cubic-bezier(0.22,1,0.36,1) both}
.hn-title{font-family:'Futura extra font','Futura',sans-serif;font-style:italic;font-weight:900;font-size:clamp(46px,6.6vw,100px);line-height:.98;letter-spacing:-.01em;color:#12100C;margin:22px 0 0;text-wrap:balance}
.hn-title .hn-line{display:block;animation:hn-rise .85s cubic-bezier(0.22,1,0.36,1) both}
.hn-title .hn-line-2{animation-delay:.09s;color:#B78B45}
.hn-sub{font-size:20px;line-height:1.55;color:#4C463C;max-width:520px;margin:26px 0 0;animation:hn-rise .85s cubic-bezier(0.22,1,0.36,1) .18s both}
.hn-cta{display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-top:34px;animation:hn-rise .85s cubic-bezier(0.22,1,0.36,1) .27s both}
.hn-price{font-size:16px;color:#6F695C}
.hn-facts{margin-top:48px;border-top:1px solid #E7E2D9;padding-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:20px 28px;max-width:560px;animation:hn-rise .85s cubic-bezier(0.22,1,0.36,1) .36s both}
.hn-fact-name{font-family:var(--font-kanit),sans-serif;font-weight:600;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#B78B45}
.hn-fact-desc{font-size:14px;line-height:1.45;color:#4C463C;margin-top:5px}
.hn-visual{position:relative;animation:hn-in 1.1s cubic-bezier(0.22,1,0.36,1) .12s both}
.hn-ring{position:absolute;top:-70px;right:-70px;width:380px;height:380px;border-radius:50%;border:1.5px solid rgba(183,139,69,.55);pointer-events:none}
.hn-panel{position:relative;border-radius:28px;overflow:hidden;aspect-ratio:4/4.4;box-shadow:0 24px 48px rgba(8,37,29,.22);background:#fff}
.hn-panel img{width:100%;height:100%;object-fit:cover;object-position:50% 42%;transform:scale(1.28);display:block}
.hn-chip{position:absolute;left:18px;bottom:18px;background:rgba(255,255,255,.88);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:16px;padding:10px 14px;box-shadow:0 10px 28px rgba(0,0,0,.14)}
.hn-chip-title{font-size:14px;font-weight:700;color:#12100C;line-height:1.25}
.hn-chip-sub{font-size:12px;color:#6F695C;margin-top:1px}
@keyframes hn-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes hn-in{from{opacity:0;transform:scale(1.045)}to{opacity:1;transform:scale(1)}}
@keyframes hn-breathe{from{opacity:.7}to{opacity:.95}}
@media (max-width:900px){
.hn-inner{grid-template-columns:1fr;gap:38px;padding:52px 18px 48px}
.hn-sub{font-size:18px}
.hn-facts{margin-top:38px}
.hn-panel{aspect-ratio:4/3.6}
.hn-ring{width:220px;height:220px;top:-40px;right:-40px}
}
@media (prefers-reduced-motion: reduce){
.hn-eyebrow,.hn-title .hn-line,.hn-sub,.hn-cta,.hn-facts,.hn-visual{animation:none}
.hn-glow{animation:none}
}
`;

const FACTS: Array<[string, string]> = [
  ["PDRN", "The headline active"],
  ["Acetyl Hexapeptide-8", "The firming peptide"],
  ["Sodium Hyaluronate", "Weightless hydration"],
  ["Panthenol", "Calm, comfortable skin"],
];

export default function Hero() {
  return (
    <section className="hn" aria-label="PDRN Brightening Serum">
      <style>{heroCss}</style>
      <div className="hn-glow" aria-hidden="true" />
      <div className="hn-inner">
        <div>
          <p className="tava-label hn-eyebrow">Skincare for the ambitious</p>
          <h1 className="hn-title">
            <span className="hn-line">Sharp is</span>
            <span className="hn-line hn-line-2">a routine.</span>
          </h1>
          <p className="hn-sub">
            PDRN Brightening Serum, in two to four drops twice a day. PDRN,
            peptides, and sodium hyaluronate help skin look brighter, firmer,
            and more even, so the face in the mirror matches the ambition
            behind it.
          </p>
          <div className="hn-cta">
            <Button render={<Link href="/glow-brightening-serum" />} size="lg">
              Add to routine
            </Button>
            <span className="hn-price">$49 one time or $39 a month</span>
          </div>
          <div className="hn-facts">
            {FACTS.map(([name, desc]) => (
              <div key={name}>
                <div className="hn-fact-name">{name}</div>
                <div className="hn-fact-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hn-visual">
          <div className="hn-ring" aria-hidden="true" />
          <div className="hn-panel">
            <img
              src="/assets/products/pdrn-bright-serum/view-1-mockup.jpg"
              alt="Tava Labs PDRN Brightening Serum bottle"
              width={2000}
              height={2000}
              fetchPriority="high"
            />
            <div className="hn-chip">
              <div className="hn-chip-title">PDRN Brightening Serum</div>
              <div className="hn-chip-sub">1 fl oz (30 mL)</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
