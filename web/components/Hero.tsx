import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/*
  Hero rebuilt 2026-11-23 from the reference Vashon supplied: a tinted
  rounded panel with the copy at left and a founder photograph filling the
  right, a forest ribbon with approved lines set along its curve sweeping
  across the photo boundary, and a three card row under the panel whose
  wide card carries the single Add to routine action. Recorded in the
  design system MASTER.md section 8 the same day.
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
.hr-photo{position:relative;min-height:100%}
.hr-photo img{object-position:65% 50%}
.hr-ribbon{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;animation:hr-fade 1.1s cubic-bezier(0.22,1,0.36,1) .3s both}
.hr-ribbon-band{fill:none;stroke:#123B2C;stroke-width:64}
.hr-ribbon-text{font-family:var(--font-kanit),Arial,sans-serif;font-size:20px;font-weight:600;letter-spacing:1.5px;fill:#D8C19A}
.hr-ribbon-m{position:absolute;left:0;right:0;top:0;width:100%;height:100%;z-index:3;pointer-events:none;display:none}
.hr-ribbon-m .hr-ribbon-band{stroke-width:56}
.hr-ribbon-m .hr-ribbon-text{font-size:27px;letter-spacing:1px}
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
.hr-photo{height:340px;min-height:340px}
.hr-photo img{object-position:68% 30%}
.hr-ribbon{display:none}
.hr-ribbon-m{display:block}
.hr-cards{grid-template-columns:1fr;gap:18px;margin-top:18px}
.hr-card-photo{aspect-ratio:4/3}
.hr-wide{min-height:410px}
.hr-wide-bottle img{transform:none}
.hr-wide-head{font-size:26px;max-width:230px;bottom:164px}
}
@media (prefers-reduced-motion: reduce){
.hr-pill,.hr-title .hr-line,.hr-sub,.hr-card,.hr-ribbon{animation:none}
.hr-card-photo img{transition:none}
}
`;

const RIBBON_TEXT =
  "Build your business. Do not neglect yourself. Your next meeting starts with you.";

export default function Hero() {
  return (
    <section className="hr" aria-label="PDRN Brightening Serum">
      <style>{heroCss}</style>
      <div className="hr-wrap">
        <div className="hr-panel">
          <div className="hr-copy">
            <p className="hr-pill">Skincare for the ambitious</p>
            <h1 className="hr-title">
              <span className="hr-line">Your next meeting</span>
              <span className="hr-line hr-line-2">starts with you.</span>
            </h1>
            <p className="hr-sub">
              One daily complexion step before the meetings, pitches, and
              camera work. Two to four drops of PDRN Brightening Serum,
              morning and night.
            </p>
          </div>
          <div className="hr-photo">
            <Image
              src="/assets/home/IMG_3365.jpeg"
              alt="Founder presenting his plan at a whiteboard"
              fill
              priority
              sizes="(min-width: 900px) 55vw, 100vw"
            />
            <svg
              className="hr-ribbon-m"
              viewBox="0 0 800 340"
              preserveAspectRatio="xMinYMid slice"
              aria-hidden="true"
            >
              <defs>
                <path
                  id="hr-ribbon-path-m"
                  d="M -10 70 C 90 150, 200 225, 320 285 C 380 312, 430 330, 470 338"
                />
              </defs>
              <use href="#hr-ribbon-path-m" className="hr-ribbon-band" />
              <text className="hr-ribbon-text">
                <textPath
                  href="#hr-ribbon-path-m"
                  startOffset="40%"
                  textAnchor="middle"
                >
                  Built for the builders.
                </textPath>
              </text>
            </svg>
          </div>
          <svg
            className="hr-ribbon"
            viewBox="0 0 1240 640"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <path
                id="hr-ribbon-path"
                d="M 520 -40 C 590 130, 680 270, 830 365 C 980 455, 1140 490, 1290 465"
              />
            </defs>
            <use href="#hr-ribbon-path" className="hr-ribbon-band" />
            <text className="hr-ribbon-text">
              <textPath
                href="#hr-ribbon-path"
                startOffset="50%"
                textAnchor="middle"
              >
                {RIBBON_TEXT}
              </textPath>
            </text>
          </svg>
        </div>

        <div className="hr-cards">
          <Link
            href="/glow-brightening-serum"
            className="hr-card hr-card-photo"
            aria-label="PDRN Brightening Serum, the product page"
          >
            <Image
              src="/assets/home/IMG_3363.jpeg"
              alt="Founders recording a video in a bright studio"
              fill
              sizes="(min-width: 900px) 28vw, 100vw"
              style={{ objectPosition: "82% 50%" }}
            />
            <span className="hr-shade" aria-hidden="true" />
            <span className="hr-card-pill">On camera</span>
            <span className="hr-arrow" aria-hidden="true">
              <ArrowRight size={18} strokeWidth={2} />
            </span>
            <span className="hr-caption">Composed on camera</span>
          </Link>

          <Link
            href="/glow-brightening-serum"
            className="hr-card hr-card-photo hr-card-2"
            aria-label="PDRN Brightening Serum, the product page"
          >
            <Image
              src="/assets/products/pdrn-bright-serum/serum-champagne-hero.webp"
              alt="Tava Labs PDRN Brightening Serum bottle"
              fill
              sizes="(min-width: 900px) 28vw, 100vw"
              style={{ objectPosition: "50% 50%" }}
            />
            <span className="hr-shade" aria-hidden="true" />
            <span className="hr-card-pill">The serum</span>
            <span className="hr-arrow" aria-hidden="true">
              <ArrowRight size={18} strokeWidth={2} />
            </span>
            <span className="hr-caption">PDRN Brightening Serum</span>
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
            <span className="hr-card-pill">The daily step</span>
            <p className="hr-wide-head">One serum. Morning and night.</p>
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
