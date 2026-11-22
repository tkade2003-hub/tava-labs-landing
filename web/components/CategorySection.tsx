"use client";

import React, { useRef, useState } from "react";

/*
 * CategorySection: a reusable category landing section, generalized from
 * Vashon supplied TrtSection.jsx and trt-section.css on 2026-11-21.
 * One component renders any product category (skincare, peptides, mental
 * health, biomarkers, and any future category) from a CategoryConfig:
 * hero, product cards, disclaimers, and a three step protocol block.
 * Colors ride on CSS variables so a category can carry its own theme;
 * the defaults are the Tava Labs Forest Luxe tokens.
 */

export interface CategoryCta {
  label: string;
  href: string;
}

export interface CategoryProduct {
  title: string;
  subtitle: string;
  price?: string;
  unit?: string;
  image?: string;
  imageAlt?: string;
  badges?: string[];
  highlightBadge?: string;
  description: string;
  href?: string;
  linkLabel?: string;
  seal?: { top: string; bottom: string };
}

export interface CategoryStep {
  number: string;
  title: string;
  lead: string;
  body: string;
}

export interface CategoryTheme {
  pageBg?: string;
  heroBg?: string;
  heroRgb?: string;
  cardBg?: string;
  protocolBg?: string;
  accent?: string;
  accentDeep?: string;
  accentInk?: string;
  ink?: string;
  muted?: string;
}

export interface CategoryConfig {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  heroTitleLead: string;
  heroTitleAccent: string;
  heroCopy: string;
  heroImage?: string;
  heroAnim?: string;
  heroBackdrop?: string;
  heroFinePrint?: string;
  stamp?: string;
  primaryCta: CategoryCta;
  secondaryCta?: CategoryCta;
  optionsEyebrow: string;
  optionsTitleLead: string;
  optionsTitleAccent: string;
  optionsCopy: string;
  products: CategoryProduct[];
  disclaimerLead: string;
  disclaimerMore?: string[];
  protocolEyebrow: string;
  protocolTitleLead: string;
  protocolTitleAccent: string;
  protocolCopy: string;
  protocolCta?: CategoryCta;
  protocolArt?: { main: string; mainAlt: string; overlay?: string };
  steps: CategoryStep[];
  legalLines: string[];
  theme?: CategoryTheme;
}

const categoryCss = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
.cat-section{font-family:'DM Sans',sans-serif;color:#f5f2e8;background:var(--cat-page-bg,#F3F0E9);overflow:hidden}
.cat-section *{box-sizing:border-box}
.cat-hero{min-height:710px;position:relative;isolation:isolate;overflow:hidden;border-radius:24px 24px 0 0;background:var(--cat-hero-bg,#08251D);color:#f8f6ed;display:flex;align-items:center;padding:clamp(34px,7vw,110px)}
.cat-hero__image{position:absolute;inset:0;z-index:-2;background-size:cover;background-position:center 42%;transform:scale(1.01)}
.cat-hero__video{position:absolute;left:50%;top:-4%;transform:translateX(-50%);height:150%;aspect-ratio:1/1;z-index:-1;pointer-events:none}
.cat-hero__shade{position:absolute;inset:0;z-index:0;pointer-events:none}
.cat-hero__video img{width:100%;height:100%;object-fit:contain;display:block}
.cat-hero__content{max-width:670px;position:relative;z-index:1}
.cat-eyebrow{font-size:12px;letter-spacing:.18em;font-weight:700;margin:0 0 22px;opacity:.85}
.cat-hero h1,.cat-section-head h2,.cat-protocol__intro h2{font-family:Manrope,sans-serif;font-size:clamp(48px,6.4vw,92px);font-weight:500;letter-spacing:-.065em;line-height:.98;margin:0}
.cat-hero h1 em,.cat-section-head h2 em,.cat-protocol__intro h2 em{font-style:normal;color:var(--cat-accent,#D8C19A)}
.cat-hero__copy{font-size:18px;line-height:1.5;max-width:440px;margin:26px 0 24px;color:#f4f4e9d9}
.cat-hero__actions{display:flex;gap:12px;flex-wrap:wrap}
.cat-cta{min-height:50px;padding:0 25px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;gap:18px;font-weight:600;font-size:15px;text-decoration:none;transition:transform .2s ease,background .2s ease,color .2s ease;border:1px solid transparent}
.cat-cta:hover{transform:translateY(-2px)}.cat-cta span{font-size:18px}
.cat-cta--primary{background:var(--cat-hero-bg,#08251D);color:var(--cat-accent,#D8C19A);border-color:#ffffff38}
.cat-cta--primary:hover{background:var(--cat-card-bg,#123B2C)}
.cat-cta--outline{background:transparent;color:#fff;border-color:#ffffff80}.cat-cta--outline:hover{background:#ffffff15}
.cat-hero__fine{font-size:12px;opacity:.68;margin-top:17px}
.cat-hero__stamp{position:absolute;right:clamp(24px,5vw,70px);bottom:45px;border:1px solid #fff7;border-radius:50%;width:112px;height:112px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:10px;line-height:1.5;letter-spacing:.1em;transform:rotate(12deg);background:#ffffff14;white-space:pre-line}
.cat-options{background:var(--cat-page-bg,#F3F0E9);color:var(--cat-ink,#22302B);padding:90px clamp(20px,7vw,110px) 40px}
.cat-section-head{max-width:820px;margin:0 auto 48px;text-align:center}.cat-section-head .cat-eyebrow{color:var(--cat-muted,#6F695C)}.cat-section-head h2{font-size:clamp(38px,5vw,66px);color:var(--cat-ink,#22302B)}.cat-section-head h2 em{color:var(--cat-accent-deep,#B78B45)}.cat-section-head>p:last-child{font-size:17px;line-height:1.5;color:#50616b;margin:20px auto 0;max-width:520px}
.cat-carousel{position:relative;max-width:1180px;margin:0 auto}
.cat-carousel__track{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px 2px 20px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.cat-carousel__track::-webkit-scrollbar{display:none}
.cat-carousel .cat-card{flex:0 0 clamp(260px,30%,338px);scroll-snap-align:start}
.cat-carousel__nav{position:absolute;top:-62px;right:0;display:flex;gap:8px}
.cat-carousel__btn{width:44px;height:44px;border-radius:50%;border:1px solid #12100c26;background:#fff;color:var(--cat-ink,#22302B);font-size:19px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s ease}
.cat-carousel__btn:hover{background:var(--cat-accent,#D8C19A)}
.cat-carousel__btn:disabled{opacity:.35;cursor:default}
.cat-carousel__dots{display:flex;gap:7px;justify-content:center;margin-top:2px}
.cat-carousel__dot{width:8px;height:8px;border-radius:50%;border:0;padding:0;background:#12100c2e;cursor:pointer;transition:all .2s ease}
.cat-carousel__dot--active{background:var(--cat-accent-deep,#B78B45);width:22px;border-radius:99px}
.cat-card{background:var(--cat-card-bg,#123B2C);color:#f4f1e9;border-radius:27px;min-height:560px;display:flex;flex-direction:column;overflow:hidden;position:relative;transition:transform .25s ease,box-shadow .25s ease}.cat-card:hover{transform:translateY(-5px);box-shadow:0 16px 32px rgba(8,37,29,.18)}
.cat-card__top{padding:25px 25px 0}.cat-badges{min-height:26px;display:flex;gap:7px;flex-wrap:wrap}.cat-badge{background:#ffffff20;color:#f3f0e8;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:600}.cat-badge--gold{background:var(--cat-accent,#D8C19A);color:var(--cat-accent-ink,#08251D)}
.cat-card__rule{height:1px;background:#ffffff30;margin:17px 0}.cat-card h3{font-family:Manrope,sans-serif;font-size:29px;letter-spacing:-.04em;line-height:1.1;margin:0;font-weight:500}.cat-card__subtitle{font-size:13px;color:#f3f0e8a8;margin:8px 0 0;min-height:32px}.cat-price{display:flex;align-items:baseline;gap:4px;margin:9px 0 0;color:var(--cat-accent,#D8C19A)}.cat-price strong{font-size:30px;letter-spacing:-.04em}.cat-price span{font-size:13px;color:#f3f0e8a8}.cat-price sup{font-size:8px;margin-left:3px}
.cat-card__image-wrap{position:relative;height:235px;display:flex;align-items:center;justify-content:center;padding:5px 20px 0}.cat-card__image-wrap img{width:100%;height:100%;object-fit:cover;border-radius:14px}.cat-seal{position:absolute;left:25px;bottom:25px;width:64px;height:64px;border:1px solid #f3f0e8aa;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:15px;line-height:1;color:#f3f0e8b8;transform:rotate(-12deg);background:#00000026}.cat-seal b{font-size:8px;letter-spacing:.04em;margin-top:3px}
.cat-card__bottom{margin-top:auto;padding:0 25px 24px}.cat-card__bottom p{color:#f4f1e9a8;font-size:12px;line-height:1.45;min-height:35px}.cat-card__link{display:flex;justify-content:space-between;align-items:center;text-decoration:none;color:var(--cat-accent,#D8C19A);border-top:1px solid #ffffff32;padding-top:14px;font-size:13px;font-weight:600}
.cat-disclaimers{max-width:820px;margin:36px auto 0;text-align:center;font-size:12px;line-height:1.6;color:var(--cat-muted,#6F695C)}.cat-disclaimers p{margin:0}.cat-disclaimers__toggle{margin-top:9px;background:none;border:0;color:var(--cat-ink,#22302B);text-decoration:underline;cursor:pointer;font:inherit}.cat-disclaimers__more{margin-top:14px;text-align:left;border-top:1px solid #12100c24;padding-top:16px}.cat-disclaimers__more p+p{margin-top:12px}
.cat-disclaimers--standalone{padding:0 clamp(20px,7vw,110px) 50px;margin-top:0}.cat-disclaimers--standalone .cat-disclaimers{margin-top:0}
.cat-protocol{background:var(--cat-protocol-bg,#123B2C);color:#f6f2e9;position:relative;padding:90px clamp(20px,7vw,110px) 36px;isolation:isolate;overflow:hidden}
.cat-protocol__backdrop{position:absolute;inset:0;background:linear-gradient(180deg in oklch,var(--cat-protocol-bg,#123B2C) 0%,var(--cat-hero-bg,#08251D) 100%);z-index:-2}
.cat-protocol__intro{max-width:1000px;margin:0 auto;text-align:center;position:relative;z-index:1}.cat-protocol__intro .cat-eyebrow{opacity:.65}.cat-protocol__intro h2{font-size:clamp(40px,5.5vw,72px)}.cat-protocol__intro>p:not(.cat-eyebrow){font-size:18px;color:#f6f2e9a8;margin:22px 0 25px}
.cat-protocol__art{position:relative;max-width:1150px;height:500px;margin:45px auto 0;display:flex;align-items:center;justify-content:center}.cat-protocol__main{position:absolute;max-width:75%;max-height:500px;width:auto;object-fit:contain;filter:drop-shadow(0 18px 24px rgba(8,37,29,.3))}.cat-protocol__rows{position:absolute;width:100%;height:100%;object-fit:contain;opacity:.45;mix-blend-mode:screen;pointer-events:none}
.cat-step-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:35px;max-width:1120px;margin:45px auto 0;border-top:1px solid #ffffff35;padding-top:28px}.cat-step__number{font-size:11px;letter-spacing:.15em;color:var(--cat-accent,#D8C19A)}.cat-step h3{font-family:Manrope,sans-serif;font-size:clamp(30px,3vw,42px);letter-spacing:-.05em;font-weight:500;margin:12px 0 10px;line-height:1.05}.cat-step h3 span{font-size:18px;letter-spacing:-.01em;display:block;margin-top:5px;color:var(--cat-accent,#D8C19A)}.cat-step p{font-size:14px;line-height:1.6;color:#f6f2e9b5;max-width:310px;margin:0}
.cat-protocol__legal{max-width:840px;text-align:center;margin:48px auto 0;font-size:11px;line-height:1.55;color:#f6f2e9a8}.cat-protocol__legal p{margin:0 0 10px}.cat-protocol__legal small{display:block;font-size:10px;margin-top:14px}
[id^="programs-"],[id^="protocol-"]{scroll-margin-top:24px}
@media(max-width:850px){.cat-hero{min-height:640px;padding:50px 28px;align-items:flex-start}.cat-hero__stamp{width:85px;height:85px;font-size:8px;right:20px;bottom:24px}.cat-hero__video{height:118%;top:auto;bottom:-12%}.cat-carousel .cat-card{flex-basis:76%}.cat-carousel__nav{display:none}.cat-card{min-height:500px}.cat-card__image-wrap{height:225px}.cat-options{padding-top:65px;padding-bottom:34px}.cat-section-head{margin-bottom:34px}.cat-protocol{padding-top:65px}.cat-protocol__art{height:370px;margin-top:30px}.cat-protocol__main{max-width:90%;max-height:370px}.cat-step-grid{grid-template-columns:1fr;gap:22px;margin-top:30px}.cat-step{display:grid;grid-template-columns:42px 1fr;column-gap:12px;align-items:start}.cat-step__number{padding-top:8px}.cat-step h3{margin:0;font-size:32px}.cat-step h3 span{font-size:17px}.cat-step p{grid-column:2;margin-top:8px;max-width:500px}.cat-protocol__legal{margin-top:35px}}
@media(max-width:480px){.cat-hero h1{font-size:51px}.cat-hero__copy{font-size:16px}.cat-hero__actions{align-items:stretch;flex-direction:column;max-width:260px}.cat-hero__actions .cat-cta{width:100%}.cat-hero__stamp{display:none}.cat-section-head h2{font-size:40px}.cat-protocol__intro h2{font-size:39px}.cat-protocol__art{height:290px}.cat-protocol__main{max-height:290px}.cat-protocol__rows{opacity:.3}}
`;

function CTA({
  cta,
  variant = "primary",
}: {
  cta: CategoryCta;
  variant?: "primary" | "outline";
}) {
  return (
    <a className={`cat-cta cat-cta--${variant}`} href={cta.href}>
      {cta.label}
      <span aria-hidden="true">→</span>
    </a>
  );
}

function Hero({ config }: { config: CategoryConfig }) {
  const rgb = config.theme?.heroRgb ?? "8, 37, 29";
  const heroImageStyle: React.CSSProperties = config.heroBackdrop
    ? {
        backgroundImage: `linear-gradient(90deg in oklch, rgba(${rgb},.88) 0%, rgba(${rgb},.42) 54%, rgba(${rgb},.06) 100%), ${config.heroBackdrop}`,
      }
    : config.heroImage
      ? {
          backgroundImage: `linear-gradient(90deg in oklch, rgba(${rgb},.88) 0%, rgba(${rgb},.42) 54%, rgba(${rgb},.06) 100%), url('${config.heroImage}')`,
        }
      : {
          backgroundImage: `linear-gradient(120deg in oklch, rgba(${rgb},1) 0%, rgba(${rgb},.72) 100%)`,
        };
  return (
    <header className="cat-hero">
      <div className="cat-hero__image" style={heroImageStyle} aria-hidden="true" />
      {config.heroAnim && (
        <div className="cat-hero__video" aria-hidden="true">
          <img src={config.heroAnim} alt="" loading="lazy" />
        </div>
      )}
      {config.heroAnim && (
        <div
          className="cat-hero__shade"
          style={{
            backgroundImage: `linear-gradient(90deg in oklch, rgba(${rgb},.88) 0%, rgba(${rgb},.42) 54%, rgba(${rgb},.06) 100%)`,
          }}
          aria-hidden="true"
        />
      )}
      <div className="cat-hero__content">
        <p className="cat-eyebrow">{config.eyebrow}</p>
        <h1>
          {config.heroTitleLead}
          <br />
          <em>{config.heroTitleAccent}</em>
        </h1>
        <p className="cat-hero__copy">{config.heroCopy}</p>
        <div className="cat-hero__actions">
          <CTA cta={config.primaryCta} />
          {config.secondaryCta && <CTA cta={config.secondaryCta} variant="outline" />}
        </div>
        {config.heroFinePrint && <p className="cat-hero__fine">{config.heroFinePrint}</p>}
      </div>
      {config.stamp && !config.heroAnim && (
        <div className="cat-hero__stamp">{config.stamp}</div>
      )}
    </header>
  );
}

function ProductCard({ item }: { item: CategoryProduct }) {
  return (
    <article className="cat-card">
      <div className="cat-card__top">
        <div className="cat-badges">
          {(item.badges ?? []).map((badge) => (
            <span
              className={`cat-badge ${badge === item.highlightBadge ? "cat-badge--gold" : ""}`}
              key={badge}
            >
              {badge}
            </span>
          ))}
        </div>
        <div className="cat-card__rule" />
        <h3>{item.title}</h3>
        <p className="cat-card__subtitle">{item.subtitle}</p>
        {item.price && (
          <p className="cat-price">
            <strong>{item.price}</strong>
            {item.unit && (
              <span>
                {item.unit}
                <sup>§</sup>
              </span>
            )}
          </p>
        )}
      </div>
      {item.image && (
        <div className="cat-card__image-wrap">
          <img src={item.image} alt={item.imageAlt ?? item.title} loading="lazy" />
          {item.seal && (
            <div className="cat-seal">
              {item.seal.top}
              <b>{item.seal.bottom}</b>
            </div>
          )}
        </div>
      )}
      <div className="cat-card__bottom">
        <p>{item.description}</p>
        {item.href && (
          <a href={item.href} className="cat-card__link">
            {item.linkLabel ?? "Explore"} <span>→</span>
          </a>
        )}
      </div>
    </article>
  );
}

function Disclaimers({ config }: { config: CategoryConfig }) {
  const [open, setOpen] = useState(false);
  const more = config.disclaimerMore ?? [];
  return (
    <div className="cat-disclaimers">
      <p>
        <strong>{config.disclaimerLead}</strong>
      </p>
      {more.length > 0 && (
        <>
          <button
            type="button"
            className="cat-disclaimers__toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? "Show less −" : "Read more +"}
          </button>
          {open && (
            <div className="cat-disclaimers__more">
              {more.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProductsSection({ config }: { config: CategoryConfig }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = config.products.length;

  const stepSize = () => {
    const el = trackRef.current;
    if (!el) return 356;
    const card = el.querySelector<HTMLElement>(".cat-card");
    return card ? card.offsetWidth + 18 : 356;
  };
  const scrollToIndex = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(count - 1, i));
    el.scrollTo({ left: clamped * stepSize(), behavior: "smooth" });
  };
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / stepSize()));
  };

  return (
    <section className="cat-options" id={`programs-${config.slug}`}>
      <div className="cat-section-head">
        <p className="cat-eyebrow">{config.optionsEyebrow}</p>
        <h2>
          {config.optionsTitleLead}
          <br />
          <em>{config.optionsTitleAccent}</em>
        </h2>
        <p>{config.optionsCopy}</p>
      </div>
      <div className="cat-carousel">
        <div className="cat-carousel__nav">
          <button
            type="button"
            className="cat-carousel__btn"
            aria-label="Previous products"
            onClick={() => scrollToIndex(active - 1)}
            disabled={active <= 0}
          >
            ←
          </button>
          <button
            type="button"
            className="cat-carousel__btn"
            aria-label="Next products"
            onClick={() => scrollToIndex(active + 1)}
            disabled={active >= count - 1}
          >
            →
          </button>
        </div>
        <div className="cat-carousel__track" ref={trackRef} onScroll={onScroll}>
          {config.products.map((item) => (
            <ProductCard key={item.title} item={item} />
          ))}
        </div>
        <div className="cat-carousel__dots">
          {config.products.map((item, i) => (
            <button
              key={item.title}
              type="button"
              className={`cat-carousel__dot ${i === active ? "cat-carousel__dot--active" : ""}`}
              aria-label={`Go to ${item.title}`}
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>
      </div>
      <Disclaimers config={config} />
    </section>
  );
}

function Protocol({ config }: { config: CategoryConfig }) {
  return (
    <section className="cat-protocol" id={`protocol-${config.slug}`}>
      <div className="cat-protocol__backdrop" />
      <div className="cat-protocol__intro">
        <p className="cat-eyebrow">{config.protocolEyebrow}</p>
        <h2>
          {config.protocolTitleLead}
          <br />
          <em>{config.protocolTitleAccent}</em>
        </h2>
        <p>{config.protocolCopy}</p>
        {config.protocolCta && <CTA cta={config.protocolCta} />}
      </div>
      {config.protocolArt && (
        <div className="cat-protocol__art">
          <img
            className="cat-protocol__main"
            src={config.protocolArt.main}
            alt={config.protocolArt.mainAlt}
            loading="lazy"
          />
          {config.protocolArt.overlay && (
            <img
              className="cat-protocol__rows"
              src={config.protocolArt.overlay}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
          )}
        </div>
      )}
      <div className="cat-step-grid">
        {config.steps.map((step) => (
          <article className="cat-step" key={step.number}>
            <span className="cat-step__number">{step.number}</span>
            <h3>
              {step.title}
              <span> {step.lead}</span>
            </h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
      <div className="cat-protocol__legal">
        {config.legalLines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </section>
  );
}

export default function CategorySection({ config }: { config: CategoryConfig }) {
  const t = config.theme ?? {};
  const vars = {
    "--cat-page-bg": t.pageBg ?? "#F3F0E9",
    "--cat-hero-bg": t.heroBg ?? "#08251D",
    "--cat-card-bg": t.cardBg ?? "#123B2C",
    "--cat-protocol-bg": t.protocolBg ?? "#123B2C",
    "--cat-accent": t.accent ?? "#D8C19A",
    "--cat-accent-deep": t.accentDeep ?? "#B78B45",
    "--cat-accent-ink": t.accentInk ?? "#08251D",
    "--cat-ink": t.ink ?? "#22302B",
    "--cat-muted": t.muted ?? "#6F695C",
  } as React.CSSProperties;
  return (
    <section className="cat-section" style={vars}>
      <style>{categoryCss}</style>
      <Hero config={config} />
      {config.products.length > 0 ? (
        <ProductsSection config={config} />
      ) : (
        <div className="cat-disclaimers--standalone">
          <Disclaimers config={config} />
        </div>
      )}
      <Protocol config={config} />
    </section>
  );
}
