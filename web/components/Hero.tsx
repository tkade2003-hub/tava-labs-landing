import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HERO_BOTTLE } from "../lib/heroImages";
import { Button } from "@/components/ui/button";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";

/*
  Hero rebuilt 2026-11-25 at Vashon direction from the editorial design
  audit reel he sent: the panel, the Talia figure with its trend line and
  stat card, the eyebrow pill, and the three card row are retired. What
  remains is a monumental upright headline set edge to edge on the paper
  ground, the real bottle as a true alpha cutout floating dead center
  over the headline with a soft studio shadow under it, quiet spec
  labels pinned to the corners of a Swiss grid, and one frosted glass
  dock at the bottom center holding the two real prices and the single
  Add to routine action. The only motion is the slow float of the
  bottle, and reduced motion turns it off. Recorded in the design
  system MASTER.md section 8 the same day.
*/

const heroCss = `
.he{position:relative;background:#FAFAF9;overflow:hidden}
.he-stage{position:relative;max-width:1440px;margin:0 auto;min-height:clamp(660px,calc(100svh - 84px),880px);padding:0 24px}
.he-head{position:relative;z-index:1;text-align:center;padding-top:clamp(52px,9vh,104px)}
.he-title{font-family:'Futura extra font','Futura',sans-serif;font-weight:900;font-style:normal;font-size:clamp(40px,8vw,116px);line-height:1.0;letter-spacing:-.015em;color:#12100C;margin:0;text-wrap:balance}
.he-title .he-line{display:block}
.he-title .he-line-2{color:#B78B45}
.he-bottle{position:absolute;left:50%;top:51%;transform:translate(-50%,-50%);z-index:2}
.he-float{display:block;animation:he-float 8s ease-in-out infinite}
.he-bottle img{display:block;height:clamp(340px,52vh,540px);width:auto}
.he-shadow{position:absolute;left:50%;bottom:-30px;transform:translateX(-50%);width:72%;height:46px;background:radial-gradient(ellipse at center,rgba(8,37,29,.30) 0%,rgba(8,37,29,0) 68%);filter:blur(9px);animation:he-shadow 8s ease-in-out infinite}
@keyframes he-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes he-shadow{0%,100%{transform:translateX(-50%) scaleX(1);opacity:.85}50%{transform:translateX(-50%) scaleX(.9);opacity:.6}}
.he-corner{position:absolute;z-index:1;font-family:var(--font-kanit),Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#6F695C}
.he-corner-tl{top:30px;left:30px}
.he-corner-tr{top:30px;right:30px;text-align:right}
.he-corner-bl{bottom:36px;left:30px}
.he-corner-br{bottom:36px;right:30px;text-align:right}
.he-dock{position:absolute;left:50%;bottom:30px;transform:translateX(-50%);z-index:3;display:flex;align-items:center;gap:22px;background:rgba(255,255,255,.7);backdrop-filter:blur(18px) saturate(1.25);-webkit-backdrop-filter:blur(18px) saturate(1.25);border:1px solid rgba(255,255,255,.85);outline:1px solid rgb(18 16 12 / 0.06);border-radius:999px;padding:10px 10px 10px 26px;box-shadow:0 24px 48px rgba(8,37,29,.16),0 4px 14px rgba(0,0,0,.08)}
.he-price{font-size:15px;font-weight:600;color:#12100C;white-space:nowrap}
@media (max-width:900px){
.he-corner-bl,.he-corner-br{display:none}
.he-bottle{top:49%}
}
@media (max-width:640px){
.he-stage{padding:0 18px}
.he-corner{font-size:10.5px;letter-spacing:.1em}
.he-corner-tl{top:20px;left:18px}
.he-corner-tr{top:20px;right:18px}
.he-bottle img{height:330px}
.he-dock{flex-direction:column;gap:9px;padding:14px 22px 12px;bottom:20px;border-radius:28px;max-width:calc(100vw - 32px)}
.he-price{font-size:14px}
}
@media (prefers-reduced-motion: reduce){
.he-float,.he-shadow{animation:none}
}
`;

export default function Hero({
  dict,
  locale = "en",
}: {
  dict: Dict;
  locale?: Locale;
}) {
  const t = dict.hero;
  const lh = (href: string) => localizeHref(href, locale);
  return (
    <section className="he" aria-label={t.ariaLabel}>
      <style>{heroCss}</style>
      <div className="he-stage">
        <span className="he-corner he-corner-tl">{t.ariaLabel}</span>
        <span className="he-corner he-corner-tr">1 fl oz (30 ml)</span>
        <span className="he-corner he-corner-bl">{t.pill}</span>
        <span className="he-corner he-corner-br">{dict.chrome.tagline}</span>

        <div className="he-head">
          <h1 className="he-title">
            <span className="he-line">{t.line1}</span>
            <span className="he-line he-line-2">{t.line2}</span>
          </h1>
        </div>

        <div className="he-bottle">
          <span className="he-float">
            <Image
              src={HERO_BOTTLE}
              alt={t.ariaLabel}
              width={395}
              height={1200}
              priority
            />
          </span>
          <span className="he-shadow" aria-hidden="true" />
        </div>

        <div className="he-dock">
          <span className="he-price">{t.priceLine}</span>
          <Button
            render={<Link href={lh("/glow-brightening-serum")} />}
            size="lg"
            className="accent-btn"
          >
            {dict.chrome.addToRoutine}
          </Button>
        </div>
      </div>
    </section>
  );
}
