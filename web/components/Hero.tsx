import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HERO_MORNING, HERO_ON_SET } from "../lib/heroImages";
import TaliaFigure from "./TaliaFigure";
import { Button } from "@/components/ui/button";

/*
  Hero built 2026-11-23 from the reference Vashon supplied: a tinted
  rounded panel with the copy at left and a founder photograph filling the
  right, a forest ribbon with a line set along its curve sweeping across
  the photo boundary, and a three card row under the panel whose wide card
  carries the single Add to routine action. Recorded in the design system
  MASTER.md section 8 the same day.
  Refreshed the same day at Vashon direction: every photograph and every
  line of copy in the hero is new to the page. The on set and morning
  mirror photographs were generated for this hero; the wide card keeps
  the real bottle mockup.
  Panel figure changed the same day at Vashon direction: the pitch
  photograph gave way to a treated photograph of Talia (her supplied
  photo, wall removed, hem feathered) with a gold trend line behind her
  plotting the measured acne lesion points of the 16 week participant
  program and a frosted stat card at her side. The forest ribbon was
  retired from the panel; the trend line and the card carry the graphic
  movement now. Recorded in MASTER.md section 8.
*/

const heroCss = `
.hr{position:relative;background:#FAFAF9;overflow:hidden}
.hr-wrap{position:relative;max-width:1280px;margin:0 auto;padding:36px 24px 64px}
.hr-panel{position:relative;border-radius:28px;overflow:hidden;background:#F6EEDF;display:grid;grid-template-columns:1fr 1.05fr;min-height:620px;box-shadow:0 24px 48px rgba(8,37,29,.10)}
.hr-copy{position:relative;z-index:2;align-self:center;padding:64px 20px 64px 64px;min-width:0}
.hr-pill{display:inline-flex;align-items:center;border:1px solid rgba(18,16,12,.30);border-radius:999px;padding:8px 16px;font-family:var(--font-kanit),Arial,sans-serif;font-size:12.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#12100C;animation:hr-rise .8s cubic-bezier(0.22,1,0.36,1) both}
.hr-title{font-family:'Futura extra font','Futura',sans-serif;font-style:italic;font-weight:900;font-size:clamp(40px,5vw,72px);line-height:1.02;letter-spacing:-.01em;color:#12100C;margin:26px 0 0;width:100%;text-wrap:balance}
.hr-title .hr-line{display:block;animation:hr-rise .85s cubic-bezier(0.22,1,0.36,1) both}
.hr-title .hr-line-2{animation-delay:.09s;color:#B78B45}
.hr-sub{font-size:19px;line-height:1.55;color:#4C463C;max-width:470px;margin:24px 0 0;animation:hr-rise .85s cubic-bezier(0.22,1,0.36,1) .18s both}
.hr-fig{position:relative;height:100%;min-height:620px;animation:hr-fade 1.1s cubic-bezier(0.22,1,0.36,1) .15s both}
.hr-fig-line{position:absolute;inset:0;z-index:1;pointer-events:none}
.hr-fig-line svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.hr-fig-path{fill:none;stroke:#B78B45;stroke-width:3;vector-effect:non-scaling-stroke}
.hr-dot{position:absolute;width:13px;height:13px;border-radius:50%;background:#B78B45;border:2.5px solid #FFFDF8;box-shadow:0 1px 5px rgba(8,37,29,.25);transform:translate(-50%,-50%)}
.hr-dot-a{left:3.5%;top:20%}
.hr-dot-b{left:93%;top:74%}
.hr-tag{position:absolute;font-family:var(--font-kanit),Arial,sans-serif;color:#5C4A22;line-height:1.2;text-align:center;white-space:nowrap}
.hr-tag b{display:block;font-size:13.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
.hr-tag span{font-size:13px;font-weight:500}
.hr-tag-a{left:3.5%;top:20%;transform:translate(-42%,-155%)}
.hr-tag-b{left:93%;top:74%;transform:translate(-52%,125%)}
.hr-fig-img{position:absolute;top:-14px;bottom:-14px;left:8%;right:8%;z-index:2}
.hr-fig-tags{position:absolute;inset:0;z-index:3;pointer-events:none}
.hr-stat-pos{position:absolute;z-index:4;left:20px;bottom:22px;width:256px}
.hr-stat{background:rgba(255,255,255,.66);backdrop-filter:blur(14px) saturate(1.1);-webkit-backdrop-filter:blur(14px) saturate(1.1);border:1px solid rgba(255,255,255,.7);border-radius:20px;padding:16px 18px 14px;box-shadow:0 18px 36px rgba(8,37,29,.16);animation:hr-rise .85s cubic-bezier(0.22,1,0.36,1) .45s both}
.hr-stat-top{display:flex;align-items:center;justify-content:space-between}
.hr-stat-label{font-family:var(--font-kanit),Arial,sans-serif;font-size:12.5px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#4C463C}
.hr-stat-icon{width:34px;height:34px;border-radius:50%;background:#F3E8D2;display:grid;place-items:center;box-shadow:0 2px 6px rgba(8,37,29,.14)}
.hr-stat-big{font-family:'Futura font',sans-serif;font-weight:700;font-size:33px;line-height:1.05;color:#08251D;margin:10px 0 0}
.hr-stat-cap{font-size:15.5px;font-weight:600;color:#12100C;margin:3px 0 0}
.hr-stat-note{font-size:11.5px;line-height:1.45;color:#6B6353;margin:7px 0 0}
.hr-cards{margin-top:22px;display:grid;grid-template-columns:1fr 1fr 1.55fr;gap:22px}
.hr-card{position:relative;display:block;border-radius:24px;overflow:hidden;text-decoration:none;animation:hr-rise .85s cubic-bezier(0.22,1,0.36,1) both}
.hr-card-2{animation-delay:.1s}
.hr-card-3{animation-delay:.2s}
.hr-card:focus-visible{outline:2px solid #B78B45;outline-offset:3px}
.hr-card-photo{aspect-ratio:3/3.4;background:#E7E2D9}
.hr-card-photo img{transition:transform .7s cubic-bezier(0.22,1,0.36,1)}
.hr-card:hover .hr-card-photo img{transform:scale(1.035)}
.hr-shade{position:absolute;inset:0;background:linear-gradient(to top in oklch,rgba(8,37,29,.80) 0%,rgba(8,37,29,.28) 30%,rgba(8,37,29,0) 52%);pointer-events:none}
.hr-card-pill{position:absolute;top:16px;left:16px;z-index:2;background:rgba(255,255,255,.88);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-radius:999px;padding:8px 14px;font-family:var(--font-kanit),Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#12100C}
.hr-arrow{position:absolute;top:16px;right:16px;z-index:2;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.92);display:grid;place-items:center;color:#12100C;transition:background .25s cubic-bezier(0.22,1,0.36,1)}
.hr-card:hover .hr-arrow{background:#D8C19A}
.hr-caption{position:absolute;left:20px;bottom:18px;z-index:2;color:#fff;font-family:'Futura font',sans-serif;font-weight:700;font-size:21px;line-height:1.2;max-width:86%}
.hr-wide{background:#F3E8D2;border:1px solid rgb(18 16 12 / 0.08);min-height:100%}
.hr-wide-bottle{position:absolute;top:0;right:0;bottom:0;width:52%;-webkit-mask-image:linear-gradient(to right,transparent,black 22%);mask-image:linear-gradient(to right,transparent,black 22%)}
.hr-wide-bottle img{mix-blend-mode:multiply;object-position:50% 50%;transform:scale(1.3)}
.hr-wide-head{position:absolute;left:24px;bottom:84px;z-index:2;font-family:'Futura font',sans-serif;font-weight:700;font-size:28px;line-height:1.15;color:#12100C;max-width:250px}
.hr-wide-action{position:absolute;left:24px;bottom:20px;z-index:2;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.hr-price{font-size:15px;color:#4C463C}
@keyframes hr-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes hr-fade{from{opacity:0}to{opacity:1}}
@media (max-width:900px){
.hr-wrap{padding:24px 18px 48px}
.hr-panel{grid-template-columns:1fr;min-height:0}
.hr-copy{padding:40px 24px 38px}
.hr-pill{letter-spacing:.12em;padding:8px 14px}
.hr-sub{font-size:18px}
.hr-fig{height:440px;min-height:0}
.hr-fig-img{left:6%;right:6%}
.hr-stat-pos{left:12px;bottom:12px;width:214px}
.hr-stat{padding:13px 15px 12px;border-radius:17px}
.hr-stat-big{font-size:27px}
.hr-stat-cap{font-size:14px}
.hr-stat-note{font-size:10.5px}
.hr-tag b{font-size:11px}
.hr-tag span{font-size:11px}
.hr-tag-a{transform:translate(-4%,-155%)}
.hr-tag-b{transform:translate(-92%,125%)}
.hr-cards{grid-template-columns:1fr;gap:18px;margin-top:18px}
.hr-card-photo{aspect-ratio:4/3}
.hr-wide{min-height:410px}
.hr-wide-bottle img{transform:none}
.hr-wide-head{font-size:26px;max-width:230px;bottom:164px}
}
@media (max-width:640px){
.hr-fig-img{top:4px;bottom:auto;height:336px;left:4%;right:4%}
}
@media (prefers-reduced-motion: reduce){
.hr-pill,.hr-title .hr-line,.hr-sub,.hr-card,.hr-fig,.hr-stat{animation:none}
.hr-card-photo img{transition:none}
}
`;

export default function Hero() {
  return (
    <section className="hr" aria-label="PDRN Brightening Serum">
      <style>{heroCss}</style>
      <div className="hr-wrap">
        <div className="hr-panel">
          <div className="hr-copy">
            <p className="hr-pill">For the person out front</p>
            <h1 className="hr-title">
              <span className="hr-line">Polished before</span>
              <span className="hr-line hr-line-2">the first call.</span>
            </h1>
            <p className="hr-sub">
              Two to four drops of PDRN Brightening Serum, morning and night,
              for skin that looks bright, hydrated, and smooth from the first
              call to the last.
            </p>
          </div>
          <TaliaFigure />
        </div>

        <div className="hr-cards">
          <Link
            href="/glow-brightening-serum"
            className="hr-card hr-card-photo"
            aria-label="PDRN Brightening Serum, the product page"
          >
            <Image
              src={HERO_ON_SET}
              alt="Founder seated on a studio set, facing the camera"
              fill
              sizes="(min-width: 900px) 28vw, 100vw"
              style={{ objectPosition: "50% 25%" }}
            />
            <span className="hr-shade" aria-hidden="true" />
            <span className="hr-card-pill">On set</span>
            <span className="hr-arrow" aria-hidden="true">
              <ArrowRight size={18} strokeWidth={2} />
            </span>
            <span className="hr-caption">Calm under the lights</span>
          </Link>

          <Link
            href="/glow-brightening-serum"
            className="hr-card hr-card-photo hr-card-2"
            aria-label="PDRN Brightening Serum, the product page"
          >
            <Image
              src={HERO_MORNING}
              alt="Founder applying serum at a bathroom mirror in morning light"
              fill
              sizes="(min-width: 900px) 28vw, 100vw"
              style={{ objectPosition: "50% 20%" }}
            />
            <span className="hr-shade" aria-hidden="true" />
            <span className="hr-card-pill">Morning ritual</span>
            <span className="hr-arrow" aria-hidden="true">
              <ArrowRight size={18} strokeWidth={2} />
            </span>
            <span className="hr-caption">At the mirror, first thing</span>
          </Link>

          <div className="hr-card hr-wide hr-card-3">
            <div className="hr-wide-bottle" aria-hidden="true">
              <Image
                src="/assets/products/pdrn-bright-serum/view-1-mockup.jpg"
                alt=""
                fill
                sizes="(min-width: 900px) 30vw, 50vw"
              />
            </div>
            <span className="hr-card-pill">Day and night</span>
            <p className="hr-wide-head">One bottle. Every day.</p>
            <div className="hr-wide-action">
              <Button
                render={<Link href="/glow-brightening-serum" />}
                size="lg"
              >
                Add to routine
              </Button>
              <span className="hr-price">$49 one time or $39 a month</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
