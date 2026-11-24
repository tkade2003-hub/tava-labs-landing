"use client";

import { useEffect, useRef } from "react";

/* The 16 week participant research story, ported from the approved
   Research Series 001 design into the site system: Forest Luxe tokens,
   Cormorant section headings, Kanit labels, Futura Extra Black italic
   for the page headline. Every number comes from the report. Outcomes
   were measured at baseline and week 16 only, and the charts on this
   page show those two points and nothing between them. */

const RESULTS = [
  { title: "Total acne lesions", baseLabel: "16.8", weekLabel: "6.2", change: "63 percent lower", gold: false, baseW: 100, weekW: 37, note: "Dermatologist counted lesions" },
  { title: "Skin hydration", baseLabel: "29.4 AU", weekLabel: "47.1 AU", change: "60 percent higher", gold: true, baseW: 62, weekW: 100, note: "Corneometer measurement in AU" },
  { title: "Erythema and redness index", baseLabel: "258", weekLabel: "181", change: "30 percent lower", gold: false, baseW: 100, weekW: 70, note: "Chromameter index" },
  { title: "Melanin and pigmentation index", baseLabel: "212", weekLabel: "158", change: "25 percent lower", gold: false, baseW: 100, weekW: 75, note: "Chromameter index" },
  { title: "Clinical texture score", baseLabel: "2.7 of 4", weekLabel: "1.3 of 4", change: "52 percent lower", gold: false, baseW: 68, weekW: 33, note: "Graded on a 0 to 4 scale" },
];

const CONCERNS: Array<[string, number]> = [
  ["Post inflammatory hyperpigmentation", 46],
  ["Uneven texture and roughness", 41],
  ["Inflammatory acne", 38],
  ["Facial redness and sensitivity", 33],
  ["Under eye dark circles", 29],
  ["Dryness and compromised barrier", 27],
  ["Fine lines and early photoaging", 24],
];

const SIDE_EFFECTS: Array<[string, number]> = [
  ["Mild dryness or peeling", 22],
  ["Temporary acne flare", 14],
  ["Mild gastrointestinal discomfort", 7],
];

const ADHERENCE = [
  { label: "Overall adherence", val: 86, gold: false },
  { label: "Supplement adherence", val: 91, gold: true },
  { label: "Topical adherence", val: 83, gold: false },
];

const RING_CIRC = 2 * Math.PI * 62;

const VISITS: Array<[string, string]> = [
  ["Baseline", "Screening, measurements, and photography"],
  ["Week 4", "Follow up assessment"],
  ["Week 8", "Follow up assessment"],
  ["Week 12", "Follow up assessment"],
  ["Week 16", "Final measurements and photography"],
];

const SUPPLEMENTS: Array<[string, string]> = [
  ["Vitamin C", "300 mg"],
  ["Zinc", "20 mg"],
  ["Niacinamide", "150 mg"],
  ["Astaxanthin", "6 mg"],
  ["Curcumin phytosome", "200 mg"],
  ["Lactobacillus probiotic blend", "10 billion CFU"],
];

const METHODS = [
  "Dermatologist counted acne lesions",
  "Corneometer hydration",
  "Chromameter redness and melanin indices",
  "Texture grading on a 0 to 4 scale",
  "Standardized photography",
];

const RESEARCH_CSS = `
.rs-wrap{width:min(1200px,100% - 36px);margin-inline:auto}
.rs-label{font-family:var(--font-kanit),Arial,sans-serif;text-transform:uppercase;letter-spacing:.16em;font-size:.72rem;font-weight:600;color:#B78B45}
.rs-label-light{color:#D8C19A}
.rs-hero{background:#08251D;color:#fff;position:relative;overflow:hidden;padding:56px 0 0}
.rs-hero-bg{position:absolute;inset:0;pointer-events:none}
.rs-orb{position:absolute;border-radius:50%;border:1px solid rgba(216,193,154,.28);will-change:transform}
.rs-orb1{width:520px;height:520px;right:-120px;top:-140px;background:radial-gradient(circle at 35% 35%, rgba(183,139,69,.28), transparent 62%)}
.rs-orb2{width:340px;height:340px;left:-90px;top:260px;background:rgba(18,59,44,.9)}
.rs-orb3{width:110px;height:110px;right:18%;top:110px;background:#B78B45;opacity:.9}
.rs-ring-deco{position:absolute;border:1px solid rgba(216,193,154,.35);border-radius:50%;width:720px;height:720px;left:38%;top:-260px;will-change:transform}
.rs-grain{position:absolute;inset:0;opacity:.5;background-image:radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px);background-size:22px 22px}
.rs-hero-grid{position:relative;display:grid;gap:36px;padding-bottom:44px}
.rs-pill{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(216,193,154,.55);color:#D8C19A;border-radius:999px;padding:8px 14px;font-family:var(--font-kanit),Arial,sans-serif;text-transform:uppercase;letter-spacing:.14em;font-size:.68rem;font-weight:600;width:fit-content}
.rs-pill i{width:7px;height:7px;border-radius:50%;background:#B78B45;display:block}
.rs-h1{font-family:'Futura extra font','Futura',sans-serif;font-style:italic;font-weight:900;font-size:clamp(2.6rem,6.5vw,4.6rem);line-height:1.04;letter-spacing:-.02em;width:100%;max-width:13ch;margin:22px 0 0;text-wrap:balance}
.rs-h1 em{font-style:italic;color:#D8C19A}
.rs-hero-sub{font-size:1.08rem;line-height:1.6;color:rgba(255,255,255,.86);max-width:58ch;margin:18px 0 0}
.rs-hero-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.rs-chip{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:9px 14px;font-size:.86rem;color:#fff}
.rs-hero-visual{position:relative;will-change:transform}
.rs-visual-card{background:#0E3527;border:1px solid rgba(216,193,154,.25);border-radius:28px;padding:26px 22px 22px;position:relative;overflow:hidden}
.rs-visual-card h3{font-family:var(--font-display),serif;font-size:1.9rem;line-height:1.15;font-weight:600;color:#fff;margin:8px 0 0}
.rs-slope{width:100%;height:auto;margin-top:10px}
.rs-slope-note{color:rgba(255,255,255,.75);font-size:.9rem;margin:4px 0 0;line-height:1.55}
.rs-badge-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}
.rs-float-badge{background:#FAFAF9;color:#12100C;border-radius:18px;padding:12px 14px;box-shadow:0 18px 36px rgba(0,0,0,.28);flex:1 1 160px}
.rs-float-badge b{font-size:1.35rem;line-height:1;display:block}
.rs-float-badge span{font-size:.78rem;color:#6F695C;line-height:1.35;display:block;margin-top:3px}
.rs-stats{background:#fff;color:#12100C;border-radius:24px 24px 0 0;padding:8px;position:relative;z-index:2}
.rs-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.rs-stat{background:#FAFAF9;border:1px solid rgb(18 16 12 / 0.14);border-radius:18px;padding:20px 16px}
.rs-stat .rs-num{font-size:clamp(2.2rem,6vw,3.4rem);font-weight:800;letter-spacing:-.04em;line-height:1;color:#123B2C}
.rs-stat .rs-num small{font-size:.45em;color:#B78B45;font-weight:700}
.rs-stat p{margin:6px 0 0;color:#6F695C;font-size:.9rem}
.rs-section{padding:72px 0;position:relative;overflow:hidden}
.rs-sec-head{max-width:720px;margin-bottom:32px}
.rs-sec-head h2{font-family:var(--font-display),serif;font-weight:600;font-size:clamp(2rem,5vw,3.2rem);line-height:1.08;color:#123B2C;margin:10px 0 0}
.rs-sec-head p{color:#4C463C;margin:12px 0 0;font-size:1.02rem;line-height:1.6}
.rs-bg-word{position:absolute;font-family:var(--font-display),serif;font-size:clamp(5rem,16vw,11rem);color:rgba(18,59,44,.055);font-weight:700;white-space:nowrap;pointer-events:none;line-height:1;will-change:transform}
.rs-results-grid{display:grid;gap:18px}
.rs-result-card{background:#fff;border:1px solid rgb(18 16 12 / 0.14);border-radius:24px;padding:22px;position:relative}
.rs-result-top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
.rs-result-top h3{font-size:1.12rem;font-weight:700;color:#12100C;max-width:22ch;margin:0;line-height:1.3}
.rs-change{background:#123B2C;color:#fff;border-radius:999px;padding:8px 12px;font-family:var(--font-kanit),Arial,sans-serif;font-weight:700;font-size:.82rem;white-space:nowrap;text-align:center;line-height:1.2}
.rs-change-gold{background:#B78B45}
.rs-bars{margin-top:20px;display:grid;gap:14px}
.rs-bar-row{display:grid;grid-template-columns:86px 1fr 64px;align-items:center;gap:10px;font-size:.84rem}
.rs-bar-row .rs-bl{color:#6F695C;font-weight:600}
.rs-bar-track{height:14px;background:#ECE7DC;border-radius:999px;overflow:hidden}
.rs-bar-fill{height:100%;width:0;border-radius:999px;background:#8A9B90;transition:width 1.2s cubic-bezier(.22,1,.36,1)}
.rs-bar-fill-week{background:#B78B45}
.rs-bar-val{font-weight:800;text-align:right}
.rs-slope-foot{margin-top:14px;padding-top:12px;border-top:1px solid rgb(18 16 12 / 0.14);color:#6F695C;font-size:.84rem;display:flex;justify-content:space-between;gap:12px}
.rs-part-grid{display:grid;gap:18px}
.rs-panel{background:#fff;border:1px solid rgb(18 16 12 / 0.14);border-radius:24px;padding:22px}
.rs-panel h3{font-family:var(--font-display),serif;font-size:1.65rem;font-weight:600;color:#123B2C;margin:0;line-height:1.15}
.rs-age-num{font-size:4.2rem;font-weight:800;line-height:1;color:#123B2C}
.rs-muted{color:#6F695C}
.rs-donut-wrap{display:grid;grid-template-columns:170px 1fr;gap:18px;align-items:center}
.rs-donut{width:170px;height:170px;transform:rotate(-90deg)}
.rs-donut circle{fill:none;stroke-width:22}
.rs-donut-seg{transition:stroke-dasharray 1.3s cubic-bezier(.22,1,.36,1)}
.rs-legend{display:grid;gap:10px;font-size:.94rem}
.rs-legend b{white-space:nowrap}
.rs-legend div{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid rgb(18 16 12 / 0.14);padding-bottom:8px}
.rs-dot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:8px;vertical-align:middle}
.rs-timeline{display:grid;gap:0;margin-top:8px}
.rs-tstep{display:grid;grid-template-columns:22px 1fr;gap:14px;position:relative;padding-bottom:22px}
.rs-tstep::before{content:"";position:absolute;left:10px;top:22px;bottom:0;width:2px;background:#E2DCCF}
.rs-tstep:last-child::before{display:none}
.rs-tstep:last-child{padding-bottom:0}
.rs-tdot{width:22px;height:22px;border-radius:50%;background:#B78B45;border:4px solid #EFE6D3;z-index:1;margin-top:2px}
.rs-tstep b{display:block}
.rs-tstep span{color:#6F695C;font-size:.9rem}
.rs-hbars{display:grid;gap:13px;margin-top:16px}
.rs-hbar{display:grid;gap:6px}
.rs-hbar-head{display:flex;justify-content:space-between;gap:12px;font-size:.92rem}
.rs-hbar-head b{font-weight:700}
.rs-hbar-track{height:10px;background:#ECE7DC;border-radius:999px;overflow:hidden}
.rs-hbar-fill{height:100%;width:0;background:#123B2C;border-radius:999px;transition:width 1.1s cubic-bezier(.22,1,.36,1)}
.rs-hbar-fill-gold{background:#B78B45}
.rs-program{background:#08251D;color:#fff}
.rs-program .rs-sec-head h2{color:#fff}
.rs-program .rs-sec-head p{color:rgba(255,255,255,.78)}
.rs-routine-grid{display:grid;gap:18px}
.rs-routine{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:22px}
.rs-routine h3{font-family:var(--font-display),serif;font-size:1.8rem;font-weight:600;color:#D8C19A;margin:8px 0 0;line-height:1.15}
.rs-routine ol{margin:16px 0 0;padding:0;list-style:none;counter-reset:rsstep;display:grid;gap:12px}
.rs-routine li{counter-increment:rsstep;display:grid;grid-template-columns:34px 1fr;gap:12px;align-items:start;color:rgba(255,255,255,.9);font-size:.96rem;line-height:1.55}
.rs-routine li::before{content:counter(rsstep);width:34px;height:34px;border-radius:50%;background:#B78B45;color:#fff;display:grid;place-items:center;font-family:var(--font-kanit),Arial,sans-serif;font-weight:700;font-size:.9rem}
.rs-routine .rs-note{margin-top:16px;color:rgba(255,255,255,.72);font-size:.88rem;line-height:1.55;border-top:1px solid rgba(255,255,255,.12);padding-top:12px}
.rs-supp{background:#FAFAF9;color:#12100C;border-radius:24px;padding:22px;margin-top:18px}
.rs-supp h3{font-family:var(--font-display),serif;font-size:1.8rem;font-weight:600;color:#123B2C;margin:8px 0 0;line-height:1.15}
.rs-supp-grid{display:grid;gap:0;margin-top:14px}
.rs-supp-row{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid rgb(18 16 12 / 0.14);font-size:.96rem}
.rs-supp-row:last-child{border-bottom:0}
.rs-supp-row b{color:#123B2C}
.rs-life-grid{display:grid;gap:18px;margin-top:18px}
.rs-life{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:22px}
.rs-life h4{margin:0 0 10px;font-size:1.05rem;font-weight:700;color:#fff}
.rs-life p,.rs-life li{color:rgba(255,255,255,.84);font-size:.95rem;line-height:1.55}
.rs-life ul{margin:0;padding-left:18px;display:grid;gap:6px}
.rs-rings{display:grid;gap:18px}
.rs-ring-card{background:#fff;border:1px solid rgb(18 16 12 / 0.14);border-radius:24px;padding:24px;text-align:center}
.rs-ring-visual{position:relative;width:150px;margin:0 auto}
.rs-ring-svg{width:150px;height:150px;transform:rotate(-90deg);display:block}
.rs-ring-svg circle{fill:none;stroke-width:13}
.rs-ring-bg{stroke:#ECE7DC}
.rs-ring-fg{stroke:#123B2C;stroke-linecap:round;transition:stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)}
.rs-ring-gold .rs-ring-fg{stroke:#B78B45}
.rs-ring-num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#123B2C}
.rs-ring-num .rs-ring-val{font-size:1.9rem;font-weight:800;line-height:1}
.rs-ring-num small{font-size:.66rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#B78B45;margin-top:3px}
.rs-ring-card p{margin:4px 0 0;color:#6F695C}
.rs-ring-card h3{font-size:1rem;font-weight:700;margin:0}
.rs-safety{background:#F3F0E9}
.rs-withdraw{display:grid;gap:10px;margin-top:16px}
.rs-withdraw div{background:#fff;border:1px solid rgb(18 16 12 / 0.14);border-radius:16px;padding:14px 16px;display:flex;justify-content:space-between;gap:12px}
.rs-alert{background:#123B2C;color:#fff;border-radius:24px;padding:24px;margin-top:18px}
.rs-alert h3{font-family:var(--font-display),serif;font-size:1.7rem;font-weight:600;color:#D8C19A;margin:0;line-height:1.2}
.rs-alert p{color:rgba(255,255,255,.88);margin:8px 0 0;line-height:1.6}
.rs-doc-grid{display:grid;gap:14px}
.rs-doc-card{border:1px solid rgb(18 16 12 / 0.14);border-radius:22px;padding:20px;background:#fff;min-height:150px;position:relative;overflow:hidden}
.rs-doc-card::after{content:"";position:absolute;right:-28px;top:-28px;width:92px;height:92px;border-radius:50%;background:#EFE6D3}
.rs-doc-initial{font-family:var(--font-display),serif;font-size:2.6rem;font-weight:600;color:#123B2C;line-height:1;position:relative;z-index:1}
.rs-doc-card h3{margin:10px 0 0;font-size:1rem;font-weight:700;position:relative;z-index:1}
.rs-doc-card p{color:#6F695C;font-size:.9rem;position:relative;z-index:1;margin:4px 0 0;line-height:1.5}
.rs-methods{display:grid;gap:10px;margin-top:18px}
.rs-methods div{background:#fff;border:1px solid rgb(18 16 12 / 0.14);border-radius:16px;padding:14px 16px;font-size:.95rem}
.rs-facts-panel{background:#08251D;color:#fff;border-radius:28px;padding:28px 24px}
.rs-facts{display:grid;gap:10px;margin-top:18px;font-size:.94rem}
.rs-facts div{border-top:1px solid rgba(255,255,255,.12);padding-top:10px;display:flex;justify-content:space-between;gap:16px}
.rs-facts b{color:#fff;text-align:right}
.rs-facts span{color:rgba(255,255,255,.65)}
.rs-source{font-size:.84rem;color:rgba(255,255,255,.55);margin-top:22px;max-width:62ch;line-height:1.6}
.rs-reveal{opacity:0;transform:translateY(22px);transition:opacity .8s ease,transform .8s cubic-bezier(.22,1,.36,1)}
.rs-reveal.rs-in{opacity:1;transform:none}
@media(max-width:759px){.rs-orb3{width:58px;height:58px;right:10px;top:auto;bottom:38%;opacity:.5}.rs-orb1{width:300px;height:300px}.rs-donut-wrap{grid-template-columns:1fr;justify-items:start}}
@media(min-width:760px){
  .rs-stats-grid{grid-template-columns:repeat(4,1fr)}
  .rs-results-grid{grid-template-columns:1fr 1fr}
  .rs-result-first{grid-column:span 2}
  .rs-part-grid{grid-template-columns:1fr 1fr}
  .rs-routine-grid,.rs-life-grid{grid-template-columns:1fr 1fr}
  .rs-rings{grid-template-columns:repeat(3,1fr)}
  .rs-doc-grid{grid-template-columns:repeat(4,1fr)}
  .rs-hero-grid{grid-template-columns:1.05fr .95fr;align-items:center}
  .rs-supp-grid{grid-template-columns:1fr 1fr;column-gap:32px}
}
@media(prefers-reduced-motion:reduce){
  .rs-reveal{opacity:1;transform:none}
}
`;

export default function ResearchStory() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setFinal = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const target = parseFloat(el.getAttribute("data-count") || "0");
        const dec = parseInt(el.getAttribute("data-dec") || "0", 10);
        el.textContent = target.toFixed(dec);
      });
      scope.querySelectorAll<HTMLElement>(".rs-bar-fill, .rs-hbar-fill").forEach((f) => {
        f.style.width = (f.getAttribute("data-w") || "0") + "%";
      });
      scope.querySelectorAll<SVGCircleElement>(".rs-ring-fg").forEach((r) => {
        r.style.strokeDashoffset = r.getAttribute("data-offset") || "0";
      });
      scope.querySelectorAll<SVGCircleElement>(".rs-donut-seg").forEach((s) => {
        s.style.strokeDasharray = s.getAttribute("data-dash") || "";
      });
    };

    const animateCount = (el: HTMLElement) => {
      const target = parseFloat(el.getAttribute("data-count") || "0");
      const dec = parseInt(el.getAttribute("data-dec") || "0", 10);
      if (reduced) {
        el.textContent = target.toFixed(dec);
        return;
      }
      const dur = 1400;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * e).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec);
      };
      requestAnimationFrame(step);
    };

    const animateScope = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>("[data-count]").forEach(animateCount);
      scope.querySelectorAll<HTMLElement>(".rs-bar-fill, .rs-hbar-fill").forEach((f) => {
        f.style.width = (f.getAttribute("data-w") || "0") + "%";
      });
      scope.querySelectorAll<SVGCircleElement>(".rs-ring-fg").forEach((r) => {
        r.style.strokeDashoffset = r.getAttribute("data-offset") || "0";
      });
      scope.querySelectorAll<SVGCircleElement>(".rs-donut-seg").forEach((s) => {
        s.style.strokeDasharray = s.getAttribute("data-dash") || "";
      });
    };

    const reveals = root.querySelectorAll<HTMLElement>(".rs-reveal");
    let io: IntersectionObserver | null = null;
    if (reduced || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => {
        el.classList.add("rs-in");
        animateScope(el);
      });
      setFinal(root);
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const el = en.target as HTMLElement;
            el.classList.add("rs-in");
            animateScope(el);
            io?.unobserve(el);
          });
        },
        { threshold: 0.22 }
      );
      reveals.forEach((el) => io?.observe(el));
    }

    let raf = 0;
    let onScroll: (() => void) | null = null;
    if (!reduced) {
      const layers = root.querySelectorAll<HTMLElement>("[data-speed]");
      const update = () => {
        const vh = window.innerHeight;
        layers.forEach((el) => {
          const parent = el.parentElement;
          if (!parent) return;
          const r = parent.getBoundingClientRect();
          const center = r.top + r.height / 2 - vh / 2;
          const speed = parseFloat(el.getAttribute("data-speed") || "0");
          const y = -center * speed * 0.35;
          el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
        });
        raf = 0;
      };
      onScroll = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      update();
    }

    return () => {
      io?.disconnect();
      if (onScroll) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef}>
      <style>{RESEARCH_CSS}</style>

      {/* Hero */}
      <section className="rs-hero">
        <div className="rs-hero-bg" aria-hidden="true">
          <div className="rs-orb rs-orb1" data-speed="0.18" />
          <div className="rs-orb rs-orb2" data-speed="-0.12" />
          <div className="rs-orb rs-orb3" data-speed="0.32" />
          <div className="rs-ring-deco" data-speed="0.08" />
          <div className="rs-grain" data-speed="0.04" />
        </div>
        <div className="rs-wrap rs-hero-grid">
          <div>
            <div className="rs-pill">
              <i aria-hidden="true" /> Research Series 001 · Participant outcomes
            </div>
            <h1 className="rs-h1">
              A 16 week look at measured <em>skin changes.</em>
            </h1>
            <p className="rs-hero-sub">
              A prospective, open label participant program combining a
              personalized skincare routine, supplements, and lifestyle
              guidance. Every number on this page comes from the report,
              measured at baseline and at week 16.
            </p>
            <div className="rs-hero-meta">
              <span className="rs-chip">Prospective and open label</span>
              <span className="rs-chip">Single arm</span>
              <span className="rs-chip">Medically supervised</span>
              <span className="rs-chip">In person clinical research site</span>
            </div>
          </div>
          <div className="rs-hero-visual" data-speed="-0.06">
            <div className="rs-visual-card">
              <p className="rs-label rs-label-light">Headline result</p>
              <h3>Total acne lesions fell from 16.8 to 6.2</h3>
              <svg
                className="rs-slope"
                viewBox="0 0 520 190"
                role="img"
                aria-label="Slope chart showing total acne lesions from 16.8 at baseline to 6.2 at week 16"
              >
                <line x1="52" y1="34" x2="468" y2="142" stroke="#D8C19A" strokeWidth="3" strokeLinecap="round" />
                <circle cx="52" cy="34" r="10" fill="#B78B45" />
                <circle cx="468" cy="142" r="10" fill="#FAFAF9" />
                <text x="52" y="18" fill="#fff" fontSize="14" fontWeight="700">Baseline 16.8</text>
                <text x="360" y="172" fill="#fff" fontSize="14" fontWeight="700">Week 16 · 6.2</text>
              </svg>
              <p className="rs-slope-note">
                A straight line between the two measured points only. The
                report did not publish outcome values for weeks 4, 8, or 12.
              </p>
            </div>
            <div className="rs-badge-row">
              <div className="rs-float-badge">
                <b>60 percent higher</b>
                <span>Skin hydration, 29.4 AU to 47.1 AU</span>
              </div>
              <div className="rs-float-badge">
                <b>52 percent lower</b>
                <span>Clinical texture score, 2.7 of 4 to 1.3 of 4</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rs-wrap">
          <div className="rs-stats">
            <div className="rs-stats-grid">
              <div className="rs-stat rs-reveal">
                <div className="rs-num"><span data-count="16">16</span></div>
                <p>Weeks in the program</p>
              </div>
              <div className="rs-stat rs-reveal">
                <div className="rs-num"><span data-count="92">92</span></div>
                <p>Adults enrolled</p>
              </div>
              <div className="rs-stat rs-reveal">
                <div className="rs-num"><span data-count="84">84</span></div>
                <p>People completed all visits</p>
              </div>
              <div className="rs-stat rs-reveal">
                <div className="rs-num"><span data-count="91">91</span><small> percent</small></div>
                <p>Completion rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="rs-section">
        <div className="rs-bg-word" data-speed="0.10" style={{ right: "-10px", top: "18px" }} aria-hidden="true">Results</div>
        <div className="rs-wrap">
          <div className="rs-sec-head rs-reveal">
            <p className="rs-label">Average change · Baseline to week 16</p>
            <h2>What changed, in plain numbers.</h2>
            <p>
              Results for the 84 participants who completed all visits. Each
              card compares the two time points the study actually measured.
            </p>
          </div>
          <div className="rs-results-grid">
            {RESULTS.map((r, i) => (
              <article key={r.title} className={`rs-result-card rs-reveal${i === 0 ? " rs-result-first" : ""}`}>
                <div className="rs-result-top">
                  <h3>{r.title}</h3>
                  <div className={`rs-change${r.gold ? " rs-change-gold" : ""}`}>{r.change}</div>
                </div>
                <div className="rs-bars">
                  <div className="rs-bar-row">
                    <span className="rs-bl">Baseline</span>
                    <div className="rs-bar-track"><div className="rs-bar-fill" data-w={r.baseW} /></div>
                    <span className="rs-bar-val">{r.baseLabel}</span>
                  </div>
                  <div className="rs-bar-row">
                    <span className="rs-bl">Week 16</span>
                    <div className="rs-bar-track"><div className="rs-bar-fill rs-bar-fill-week" data-w={r.weekW} /></div>
                    <span className="rs-bar-val">{r.weekLabel}</span>
                  </div>
                </div>
                <div className="rs-slope-foot">
                  <span>{r.note}</span>
                  <span>Baseline to week 16</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Participants */}
      <section className="rs-section" style={{ background: "#fff" }}>
        <div className="rs-bg-word" data-speed="-0.08" style={{ left: "-8px", top: "10px" }} aria-hidden="true">People</div>
        <div className="rs-wrap">
          <div className="rs-sec-head rs-reveal">
            <p className="rs-label">Who participated</p>
            <h2>The people behind the averages.</h2>
            <p>Five visits across the program, from baseline through week 16.</p>
          </div>
          <div className="rs-part-grid">
            <div className="rs-panel rs-reveal">
              <p className="rs-label">Average age</p>
              <div className="rs-age-num"><span data-count="32.7" data-dec="1">32.7</span></div>
              <p className="rs-muted" style={{ margin: "6px 0 0" }}>Years old · Range 20 to 48</p>
              <div style={{ marginTop: "22px" }}>
                <h3>Visit timeline</h3>
                <div className="rs-timeline">
                  {VISITS.map(([name, desc]) => (
                    <div key={name} className="rs-tstep">
                      <div className="rs-tdot" />
                      <div>
                        <b>{name}</b>
                        <span>{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gap: "18px" }}>
              <div className="rs-panel rs-reveal">
                <h3>Gender split</h3>
                <div className="rs-donut-wrap" style={{ marginTop: "14px" }}>
                  <svg
                    className="rs-donut"
                    viewBox="0 0 120 120"
                    role="img"
                    aria-label="Gender split donut chart, 74 percent female, 24 percent male, 2 percent non binary"
                  >
                    <circle cx="60" cy="60" r="48" stroke="#ECE7DC" />
                    <circle className="rs-donut-seg" cx="60" cy="60" r="48" stroke="#123B2C" strokeDasharray="0 302" data-dash="223 79" />
                    <circle className="rs-donut-seg" cx="60" cy="60" r="48" stroke="#B78B45" strokeDasharray="0 302" data-dash="72 230" strokeDashoffset="-223" />
                    <circle className="rs-donut-seg" cx="60" cy="60" r="48" stroke="#D8C19A" strokeDasharray="0 302" data-dash="6 296" strokeDashoffset="-295" />
                  </svg>
                  <div className="rs-legend">
                    <div><span><span className="rs-dot" style={{ background: "#123B2C" }} />Female</span><b>74 percent</b></div>
                    <div><span><span className="rs-dot" style={{ background: "#B78B45" }} />Male</span><b>24 percent</b></div>
                    <div><span><span className="rs-dot" style={{ background: "#D8C19A" }} />Non binary</span><b>2 percent</b></div>
                  </div>
                </div>
                <p className="rs-muted" style={{ fontSize: ".88rem", margin: "10px 0 0" }}>
                  Donut animates to the reported split when it scrolls into view.
                </p>
              </div>
              <div className="rs-panel rs-reveal">
                <h3>Baseline skin concerns</h3>
                <div className="rs-hbars">
                  {CONCERNS.map(([name, val]) => (
                    <div key={name} className="rs-hbar">
                      <div className="rs-hbar-head"><b>{name}</b><span>{val} percent</span></div>
                      <div className="rs-hbar-track"><div className="rs-hbar-fill" data-w={val} /></div>
                    </div>
                  ))}
                </div>
                <p className="rs-muted" style={{ fontSize: ".86rem", marginTop: "12px" }}>
                  Participants could report more than one concern, so these
                  shares do not add to 100 percent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program */}
      <section className="rs-section rs-program">
        <div className="rs-bg-word" data-speed="0.12" style={{ right: 0, top: "16px", color: "rgba(255,255,255,.06)" }} aria-hidden="true">Program</div>
        <div className="rs-wrap">
          <div className="rs-sec-head rs-reveal">
            <p className="rs-label rs-label-light">Program and protocol</p>
            <h2>The 16 week program, step by step.</h2>
            <p>
              Participants received in person screening, product dispensing,
              application coaching, and follow up assessments at a clinical
              research site.
            </p>
          </div>
          <div className="rs-routine-grid">
            <div className="rs-routine rs-reveal">
              <p className="rs-label rs-label-light">Morning routine</p>
              <h3>Start the day</h3>
              <ol>
                <li><span>Gentle cleanser</span></li>
                <li><span>Vitamin C serum, 15 percent</span></li>
                <li><span>Ceramide moisturizer</span></li>
                <li><span>Mineral sunscreen, SPF 50</span></li>
              </ol>
            </div>
            <div className="rs-routine rs-reveal">
              <p className="rs-label rs-label-light">Evening routine</p>
              <h3>Close the day</h3>
              <ol>
                <li><span>Gentle cleanser</span></li>
                <li><span>Niacinamide 5 percent plus zinc serum</span></li>
                <li><span>Peptide barrier cream</span></li>
                <li><span>Retinol 0.3 percent, introduced in week 2 and titrated under clinician guidance</span></li>
              </ol>
              <p className="rs-note">
                Retinol was used 3 to 5 nights weekly after the initial two
                week ramp up period. As needed, 2 percent salicylic acid was
                used for active lesions.
              </p>
            </div>
          </div>

          <div className="rs-supp rs-reveal">
            <p className="rs-label">Supplement routine</p>
            <h3>Tava Skin Complex</h3>
            <p className="rs-muted" style={{ margin: "6px 0 0" }}>
              Two capsules daily with breakfast. Amounts shown per two capsule serving.
            </p>
            <div className="rs-supp-grid">
              {SUPPLEMENTS.map(([name, amt]) => (
                <div key={name} className="rs-supp-row"><span>{name}</span><b>{amt}</b></div>
              ))}
            </div>
            <p className="rs-muted" style={{ fontSize: ".9rem", marginTop: "12px" }}>
              Optional addition, Omega 3, one softgel daily.
            </p>
          </div>

          <div className="rs-life-grid">
            <div className="rs-life rs-reveal">
              <h4>Nutrition guidance</h4>
              <ul>
                <li>At least 2.5 L of water daily</li>
                <li>Vegetables, berries, and omega 3 rich foods</li>
                <li>Limit added sugar and high glycemic foods</li>
                <li>Optional two week low dairy, low sugar reset</li>
                <li>Baseline counseling with a registered dietitian</li>
              </ul>
            </div>
            <div className="rs-life rs-reveal">
              <h4>Lifestyle goals</h4>
              <ul>
                <li>7 to 9 hours of sleep</li>
                <li>At least 150 minutes of moderate activity per week</li>
                <li>Five minute daily breathing exercise</li>
                <li>Sleep logged weekly</li>
                <li>Hydration and sunscreen habits reviewed at visits</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Adherence */}
      <section className="rs-section">
        <div className="rs-wrap">
          <div className="rs-sec-head rs-reveal">
            <p className="rs-label">Program tracking</p>
            <h2>How closely people stayed on plan.</h2>
            <p>Adherence across the full 16 weeks, as recorded in the report.</p>
          </div>
          <div className="rs-rings">
            {ADHERENCE.map((a) => (
              <div key={a.label} className={`rs-ring-card rs-reveal${a.gold ? " rs-ring-gold" : ""}`}>
                <div className="rs-ring-visual">
                  <svg className="rs-ring-svg" viewBox="0 0 150 150" role="img" aria-label={`${a.label}, ${a.val} percent`}>
                    <circle className="rs-ring-bg" cx="75" cy="75" r="62" />
                    <circle
                      className="rs-ring-fg"
                      cx="75"
                      cy="75"
                      r="62"
                      strokeDasharray={RING_CIRC}
                      strokeDashoffset={RING_CIRC}
                      data-offset={RING_CIRC * (1 - a.val / 100)}
                    />
                  </svg>
                  <div className="rs-ring-num">
                    <span className="rs-ring-val" data-count={a.val}>{a.val}</span>
                    <small>percent</small>
                  </div>
                </div>
                <h3 style={{ marginTop: "14px" }}>{a.label}</h3>
                <p>Across the 16 week program</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="rs-section rs-safety">
        <div className="rs-bg-word" data-speed="-0.07" style={{ left: 0, top: "8px" }} aria-hidden="true">Safety</div>
        <div className="rs-wrap">
          <div className="rs-sec-head rs-reveal">
            <p className="rs-label">Reported side effects</p>
            <h2>What participants reported.</h2>
            <p>Shares of participants reporting each effect during the program.</p>
          </div>
          <div className="rs-part-grid">
            <div className="rs-panel rs-reveal">
              <h3>Side effects</h3>
              <div className="rs-hbars">
                {SIDE_EFFECTS.map(([name, val], i) => (
                  <div key={name} className="rs-hbar">
                    <div className="rs-hbar-head"><b>{name}</b><span>{val} percent</span></div>
                    <div className="rs-hbar-track"><div className={`rs-hbar-fill${i % 2 === 1 ? " rs-hbar-fill-gold" : ""}`} data-w={val} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="rs-panel rs-reveal">
                <h3>Withdrawals</h3>
                <p className="rs-muted" style={{ margin: "6px 0 0" }}>8 participants withdrew from the 92 enrolled.</p>
                <div className="rs-withdraw">
                  <div><span>Scheduling conflicts</span><b>5 people</b></div>
                  <div><span>Mild side effects</span><b>2 people</b></div>
                  <div><span>Lost to follow up</span><b>1 person</b></div>
                </div>
              </div>
              <div className="rs-alert rs-reveal">
                <h3>No serious adverse events reported.</h3>
                <p>
                  That line is stated in the report alongside the mild effects
                  listed on this page. It is included here exactly as reported.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methods and photo documentation */}
      <section className="rs-section" style={{ background: "#fff" }}>
        <div className="rs-wrap">
          <div className="rs-sec-head rs-reveal">
            <p className="rs-label">Visual documentation</p>
            <h2>Participant photo comparisons.</h2>
            <p>
              Side by side photographs from the four month program. The left
              image in each pair showed baseline and the right image showed
              week 16. No participant photographs are reproduced on this page.
            </p>
          </div>
          <div className="rs-doc-grid">
            {[
              ["A", "Side profile view"],
              ["B", "Frontal view"],
              ["C", "Frontal view with glasses"],
              ["D", "Close up cheek view"],
            ].map(([initial, view]) => (
              <div key={initial} className="rs-doc-card rs-reveal">
                <div className="rs-doc-initial">{initial}</div>
                <h3>Participant {initial}</h3>
                <p>{view}<br />Baseline and week 16</p>
              </div>
            ))}
          </div>
          <div className="rs-panel rs-reveal" style={{ marginTop: "18px" }}>
            <h3>Photography protocol</h3>
            <p style={{ color: "#4C463C", margin: "8px 0 0", lineHeight: 1.6 }}>
              Standardized capture at baseline and follow up using a fixed
              camera setup, consistent visible and cross polarized lighting,
              frontal, 45 degree, and profile angles, and a color calibrated
              background.
            </p>
          </div>
          <div className="rs-sec-head rs-reveal" style={{ marginTop: "36px", marginBottom: 0 }}>
            <p className="rs-label">How measures were taken</p>
            <h2 style={{ fontSize: "2rem" }}>Clinical measurements</h2>
          </div>
          <div className="rs-methods">
            {METHODS.map((m) => (
              <div key={m}>{m}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Study design at a glance */}
      <section className="rs-section" style={{ paddingTop: 0 }}>
        <div className="rs-wrap">
          <div className="rs-facts-panel rs-reveal">
            <p className="rs-label rs-label-light">Study design</p>
            <h2 style={{ fontFamily: "var(--font-display), serif", fontWeight: 600, fontSize: "2rem", margin: "10px 0 0", lineHeight: 1.15 }}>
              The design at a glance.
            </h2>
            <div className="rs-facts">
              <div><span>Design</span><b>Prospective, open label, single arm</b></div>
              <div><span>Setting</span><b>In person, medically supervised</b></div>
              <div><span>Assessments</span><b>Baseline plus weeks 4, 8, 12, 16</b></div>
              <div><span>Completed</span><b>84 of 92 enrolled · 91 percent</b></div>
            </div>
            <p className="rs-source">
              Source, Tava Labs Participant Outcomes, Research Series 001, 16
              week participant program. This page presents the report numbers
              only, with baseline and week 16 as the two measured outcome
              points.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
