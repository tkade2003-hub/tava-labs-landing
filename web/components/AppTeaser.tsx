"use client";

import {
  type CSSProperties,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";
import { EN_DICT } from "@/lib/i18n/dictionaries";

type Teaser = Dict["appTeaser"];

/* Aperture reveal app teaser, adapted from the Animata aperture reveal
   pattern at Vashon direction on 2026-11-23. One scroll progress value
   drives three CSS variables on the stage:
     --e  0 to 1  the opening widens from the app icon to the full screen
     --f  0 to 1  the iPhone frame settles around the screen
     --q  0 to 1  the caption is read in, word by word
   The opening is measured in JS from the app icon element, exactly like
   the source pattern. Reduced motion renders the finished state in
   reading order with no scroll sequence. */

const EXPAND_END = 0.55;
const FRAME_START = 0.34;
const FRAME_END = 0.58;
const CAPTION_START = 0.6;
const CAPTION_END = 0.92;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", callback);
    return () => mq.removeEventListener("change", callback);
  }
  const legacyMq = mq as MediaQueryList & {
    addListener: (listener: () => void) => void;
    removeListener: (listener: () => void) => void;
  };
  legacyMq.addListener(callback);
  return () => legacyMq.removeListener(callback);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

const css = `
.at-stage{
  --e:0; --q:0; --f:0;
  --aperture-top:50%; --aperture-right:50%; --aperture-bottom:50%; --aperture-left:50%;
  --aperture-radius:0px;
  position:sticky; top:0; height:100svh; overflow:hidden; container-type:size;
}
.at-media{
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  clip-path: inset(
    calc(var(--aperture-top) * (1 - var(--e)))
    calc(var(--aperture-right) * (1 - var(--e)))
    calc(var(--aperture-bottom) * (1 - var(--e)))
    calc(var(--aperture-left) * (1 - var(--e)))
    round calc(var(--aperture-radius) * (1 - var(--e)))
  );
  will-change:clip-path;
}
.at-headline{
  position:absolute; inset:0; z-index:3; display:flex; align-items:center; justify-content:center;
  gap:clamp(14px, 3cqw, 30px); pointer-events:none; margin:0;
  font-family:var(--font-display), Georgia, serif; font-weight:600;
  font-size:clamp(2.5rem, 8.5cqw, 4.75rem); line-height:1.05; letter-spacing:-0.01em; color:#08251D;
}
.at-lead,.at-trail{ opacity:calc(1 - var(--e) * 1.6); will-change:transform,opacity; white-space:nowrap; }
.at-lead{ transform:translateX(calc(var(--e) * -42cqw)); }
.at-trail{ transform:translateX(calc(var(--e) * 42cqw)); }
@container (width < 640px){
  .at-headline{ flex-direction:column; gap:18px; }
  .at-lead{ transform:translateY(calc(var(--e) * -44cqh)); }
  .at-trail{ transform:translateY(calc(var(--e) * 44cqh)); }
  .at-hint{ display:none; }
}
.at-icon{
  position:relative; display:inline-flex; flex:none;
  width:clamp(80px, 22vw, 108px); aspect-ratio:1; border-radius:26%; overflow:hidden;
  box-shadow:0 14px 30px rgba(0,0,0,0.20);
  opacity:clamp(0, 1 - var(--e) * 3.2, 1);
  transform:scale(calc(1 + var(--e) * 0.05));
  will-change:transform,opacity;
}
.at-icon img{ width:100%; height:100%; display:block; }
.at-phone{
  position:relative; flex:none;
  width:min(264px, 74vw, 34svh); aspect-ratio:1179 / 2556;
}
.at-screen{
  position:absolute; inset:10px; border-radius:42px; overflow:hidden;
  background:#FAFAF9; display:flex; flex-direction:column;
}
.at-frame{
  position:absolute; inset:0; border-radius:52px; pointer-events:none;
  border:10px solid #101010;
  box-shadow:0 24px 48px rgba(8,37,29,0.22), 0 4px 14px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.08);
  opacity:var(--f);
  transform:translateY(calc((1 - var(--f)) * 14px)) scale(calc(0.965 + 0.035 * var(--f)));
  will-change:transform,opacity;
}
.at-island{
  position:absolute; top:9px; left:50%; transform:translateX(-50%);
  width:74px; height:21px; border-radius:999px; background:#101010;
}
.at-btn{ position:absolute; background:#101010; border-radius:2px; }
.at-caption{
  position:absolute; z-index:3; left:50%; transform:translateX(-50%);
  bottom:max(4.5svh, 26px); width:min(600px, 88vw); text-align:center;
  font-size:clamp(1.05rem, 2.4cqw, 1.3rem); line-height:1.55; color:#12100C;
  opacity:clamp(0, var(--q) * 12, 1); margin:0;
}
.at-word{
  --w:clamp(0, (var(--q) * (var(--n) + 4) - var(--i)) / 4, 1);
  opacity:calc(0.16 + 0.84 * var(--w));
}
.at-hint{
  position:absolute; z-index:3; left:50%; top:calc(50% + 86px); transform:translateX(-50%);
  display:flex; flex-direction:column; align-items:center; gap:8px;
  font-family:var(--font-kanit), Arial, sans-serif; font-size:11px; font-weight:600;
  letter-spacing:0.22em; text-transform:uppercase; color:#6F695C;
  opacity:calc(0.75 - var(--e) * 4);
}
.at-hint::after{
  content:""; width:1px; height:28px; background:currentColor;
  animation:at-hint 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
@keyframes at-hint{
  0%{ transform:scaleY(0); transform-origin:top; }
  50%{ transform:scaleY(1); transform-origin:top; }
  51%{ transform-origin:bottom; }
  100%{ transform:scaleY(0); transform-origin:bottom; }
}
@media (prefers-reduced-motion: reduce){
  .at-hint::after{ animation:none; }
}
/* Reduced motion: the finished state, in reading order. */
.at-root[data-static] .at-stage{ --e:1; --q:1; --f:1; position:relative; height:auto; overflow:visible; container-type:inline-size; display:flex; flex-direction:column; align-items:center; padding:16px 0 8px; }
.at-root[data-static] .at-media{ position:relative; inset:auto; clip-path:none; padding:20px 0 10px; }
.at-root[data-static] .at-headline{ position:relative; inset:auto; padding:8px 16px 0; }
.at-root[data-static] .at-caption{ position:relative; inset:auto; transform:none; margin:14px auto 6px; }
.at-root[data-static] .at-hint{ display:none; }
.at-root[data-static] :is(.at-lead,.at-trail,.at-caption,.at-word,.at-frame,.at-icon){ opacity:1; }
.at-root[data-static] :is(.at-lead,.at-trail,.at-frame,.at-icon){ transform:none; }
`;



function TabIcon({ children, label, active }: { children: ReactNode; label: string; active?: boolean }) {
  return (
    <span
      className="flex flex-col items-center gap-[3px]"
      style={{ color: active ? "#123B2C" : "#A89F92" }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
      <span className="text-[9px] font-semibold">{label}</span>
    </span>
  );
}

function StepRow({ done, title, detail, last }: { done?: boolean; title: string; detail: string; last?: boolean }) {
  return (
    <div
      className={`flex items-start gap-[10px] py-[9px] ${last ? "" : "border-b border-linestone"}`}
    >
      <span
        className={`mt-[1px] flex size-[18px] flex-none items-center justify-center rounded-full ${
          done ? "bg-forest text-white" : "border-2 border-linestone"
        }`}
      >
        {done ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : null}
      </span>
      <span>
        <span className="block text-[12px] leading-tight font-semibold text-ink">{title}</span>
        <span className="mt-[2px] block text-[10.5px] leading-snug text-[#6F695C]">{detail}</span>
      </span>
    </div>
  );
}

function PhoneScreen({ t }: { t: Teaser }) {
  const ph = t.phone;
  return (
    <div className="at-phone" aria-hidden="true">
      <div className="at-screen">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-[15px]">
          <span className="text-[11px] font-semibold text-ink">9:41</span>
          <span className="flex items-center gap-[5px]">
            <span className="flex items-end gap-[2px]">
              <span className="block w-[3px] rounded-sm bg-ink" style={{ height: 4 }} />
              <span className="block w-[3px] rounded-sm bg-ink" style={{ height: 6 }} />
              <span className="block w-[3px] rounded-sm bg-ink" style={{ height: 8 }} />
              <span className="block w-[3px] rounded-sm bg-ink" style={{ height: 10 }} />
            </span>
            <span className="ml-[3px] block h-[11px] w-[22px] rounded-[3.5px] border border-ink/50 p-[1.5px]">
              <span className="block h-full w-[70%] rounded-[1.5px] bg-ink" />
            </span>
          </span>
        </div>

        {/* App header */}
        <div className="mt-[14px] flex items-center gap-[10px] px-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/icon-t-period.svg"
            alt=""
            width={32}
            height={32}
            className="rounded-[9px]"
          />
          <span className="font-display text-[26px] leading-none font-semibold text-forest-deep">
            {ph.today}
          </span>
        </div>
        <p className="mt-[12px] px-5 font-display text-[19px] leading-tight font-semibold text-forest-deep">
          {ph.goodMorning}
        </p>
        <p className="mt-[3px] px-5 text-[11px] leading-snug text-[#6F695C]">
          {ph.dayLine}
        </p>

        {/* Progress, counting what is left */}
        <div className="mt-[12px] px-5">
          <div className="h-2 overflow-hidden rounded-full bg-linen">
            <div className="h-full rounded-full bg-gold" style={{ width: "40%" }} />
          </div>
          <p className="mt-[6px] text-[11px] text-[#6F695C]">
            {ph.stepsToGo}
          </p>
        </div>

        {/* Morning routine */}
        <div className="mx-4 mt-[14px] rounded-[20px] border border-linestone bg-white px-4 pt-[13px] pb-[7px]">
          <p
            className="text-[9px] font-semibold tracking-[0.18em] text-gold uppercase"
            style={{ fontFamily: "var(--font-kanit), Arial, sans-serif" }}
          >
            {ph.morningRoutine}
          </p>
          <div className="mt-[5px] flex flex-wrap items-center gap-2">
            <span className="font-display text-[17px] leading-none font-semibold text-forest-deep">
              {ph.amDrops}
            </span>
            <span className="rounded-full bg-linen px-2 py-[3px] text-[9.5px] font-semibold text-forest">
              PDRN Brightening Serum
            </span>
          </div>
          <div className="mt-[4px]">
            <StepRow done title={ph.steps[0].title} detail={ph.steps[0].detail} />
            <StepRow done title={ph.steps[1].title} detail={ph.steps[1].detail} />
            <StepRow title={ph.steps[2].title} detail={ph.steps[2].detail} last />
          </div>
        </div>

        {/* Lab results teaser, clinical palette */}
        <div className="mx-4 mt-[12px] rounded-[20px] px-4 py-[13px]" style={{ background: "#17100D" }}>
          <p
            className="text-[9px] font-semibold tracking-[0.18em] uppercase"
            style={{ fontFamily: "var(--font-kanit), Arial, sans-serif", color: "#D8C19A" }}
          >
            {ph.clinicalReview}
          </p>
          <p className="mt-[5px] font-display text-[17px] leading-none font-semibold" style={{ color: "#FAFAF9" }}>
            {ph.resultsIn}
          </p>
          <div className="mt-[10px] flex h-[6px] overflow-hidden rounded-full">
            <span style={{ width: "55%", background: "#25C7FF" }} />
            <span style={{ width: "28%", background: "#F5A640" }} />
            <span style={{ width: "17%", background: "#F59EB5" }} />
          </div>
          <div className="mt-[8px] flex gap-[12px] text-[10px]" style={{ color: "rgba(250,250,249,0.82)" }}>
            <span className="flex items-center gap-[5px]">
              <span className="size-[6px] rounded-full" style={{ background: "#25C7FF" }} />{ph.optimal}
            </span>
            <span className="flex items-center gap-[5px]">
              <span className="size-[6px] rounded-full" style={{ background: "#F5A640" }} />{ph.inRange}
            </span>
            <span className="flex items-center gap-[5px]">
              <span className="size-[6px] rounded-full" style={{ background: "#F59EB5" }} />{ph.toReview}
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Tab bar */}
        <div className="relative border-t border-linestone bg-white px-3 pt-[9px] pb-[24px]">
          <div className="flex items-start justify-between">
            <TabIcon label={ph.tabs.today} active>
              <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
            </TabIcon>
            <TabIcon label={ph.tabs.shop}>
              <path d="M6 7h15l-1.5 9h-12z" />
              <path d="M6 7 5 3H2" />
              <circle cx="9" cy="20" r="1.6" />
              <circle cx="17" cy="20" r="1.6" />
            </TabIcon>
            <TabIcon label={ph.tabs.lab}>
              <path d="M9 3h6" />
              <path d="M10 3v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3" />
              <path d="M7.5 15h9" />
            </TabIcon>
            <TabIcon label={ph.tabs.orders}>
              <path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
              <path d="m3 8 2.5-5h13L21 8H3z" />
              <path d="M10 12h4" />
            </TabIcon>
            <TabIcon label={ph.tabs.profile}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.5-3.6 4.5-5 8-5s6.5 1.4 8 5" />
            </TabIcon>
          </div>
          <span className="absolute bottom-[6px] left-1/2 h-[4px] w-[104px] -translate-x-1/2 rounded-full bg-ink/85" />
        </div>
      </div>

      {/* iPhone frame, settling over the screen */}
      <div className="at-frame">
        <span className="at-island" />
        <span className="at-btn" style={{ left: -13, top: 96, width: 3, height: 30 }} />
        <span className="at-btn" style={{ left: -13, top: 134, width: 3, height: 52 }} />
        <span className="at-btn" style={{ left: -13, top: 194, width: 3, height: 52 }} />
        <span className="at-btn" style={{ right: -13, top: 150, width: 3, height: 76 }} />
      </div>
    </div>
  );
}

export default function AppTeaser({
  dict = EN_DICT,
  locale = "en",
}: {
  dict?: Dict;
  locale?: Locale;
}) {
  const t = dict.appTeaser;
  const CAPTION_WORDS = t.caption.split(" ");
  const isStatic = usePrefersReducedMotion();
  const headlineId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const openingRef = useRef<HTMLSpanElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  /* Scroll linked motion runs on a spring, never a raw linear scrub. */
  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    mass: 0.5,
    restDelta: 0.0005,
  });
  const expand = useTransform(smooth, (p) => easeInOutCubic(clamp01(p / EXPAND_END)));
  const frame = useTransform(smooth, (p) =>
    easeOutCubic(clamp01((p - FRAME_START) / (FRAME_END - FRAME_START))),
  );
  const read = useTransform(smooth, (p) =>
    clamp01((p - CAPTION_START) / (CAPTION_END - CAPTION_START)),
  );

  /* Measure the opening from the app icon, like the source pattern. */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const opening = openingRef.current;
    if (isStatic || !stage || !opening) return;
    let active = true;
    const measure = () => {
      if (!active) return;
      const s = stage.getBoundingClientRect();
      const w = opening.getBoundingClientRect();
      const scale = stage.offsetWidth ? s.width / stage.offsetWidth : 1;
      const local = (value: number) => `${value / scale}px`;
      stage.style.setProperty("--aperture-top", local(w.top - s.top));
      stage.style.setProperty("--aperture-right", local(s.right - w.right));
      stage.style.setProperty("--aperture-bottom", local(s.bottom - w.bottom));
      stage.style.setProperty("--aperture-left", local(w.left - s.left));
      stage.style.setProperty("--aperture-radius", local(w.height * 0.26));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    for (const sibling of opening.parentElement?.children ?? []) observer.observe(sibling);
    document.fonts?.ready.then(measure);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [isStatic]);

  const stageStyle = isStatic
    ? undefined
    : ({ "--e": expand, "--f": frame, "--q": read } as MotionStyle);

  return (
    <section
      className="at-root border-t border-linestone bg-paper"
      data-static={isStatic || undefined}
      aria-labelledby={headlineId}
    >
      <style>{css}</style>

      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 lg:pt-20">
        <p className="tava-label">{t.label}</p>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/75">
          {t.lead}
        </p>
      </div>

      <div
        ref={trackRef}
        className="relative"
        style={isStatic ? undefined : { height: "320svh" }}
      >
        <motion.div ref={stageRef} className="at-stage" style={stageStyle}>
          <div className="at-media">
            <PhoneScreen t={t} />
          </div>

          <h2 id={headlineId} className="at-headline">
            <span className="at-lead">{t.headlineLead}</span>
            <span ref={openingRef} className="at-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/icon-t-period.svg" alt="" width={216} height={216} />
            </span>
            <span className="at-trail">{t.headlineTrail}</span>
          </h2>

          <p className="at-hint" aria-hidden="true">
            {t.scroll}
          </p>

          <p className="at-caption">
            {CAPTION_WORDS.map((word, i) => (
              <span
                key={i}
                className="at-word"
                style={{ "--i": i, "--n": CAPTION_WORDS.length } as CSSProperties}
              >
                {word}
                {i < CAPTION_WORDS.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-24">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {t.features.map((f) => (
            <div key={f.title} className="border-t-2 border-forest pt-5">
              <h3 className="font-display text-2xl leading-snug font-semibold text-forest-deep">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Button render={<Link href={localizeHref("/glow-brightening-serum", locale)} />} size="lg" className="px-6">
            {dict.chrome.addToRoutine}
          </Button>
        </div>
      </div>
    </section>
  );
}
