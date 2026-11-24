"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import { supabase } from "@/lib/supabase";
import { callLabs } from "@/lib/labs";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { fmt, isLocale, localizeHref, type Locale } from "@/lib/i18n/config";

// Full page lab results for one order, in the dark clinical style:
// a review header, the balance ring with its triage, and the marker
// drilldown. The labs edge function returns our order row plus the
// live provider order; once the lab reports, the provider order
// carries every marker result and this page renders all of them.
interface MarkerResult {
  name: string;
  value: string;
  unit: string;
  range: string;
  flag: string;
}

type MarkerStatus = "optimal" | "inRange" | "attention" | "unknown";

const STATUS_COLOR: Record<MarkerStatus, string> = {
  optimal: "#25c7ff",
  inRange: "#f5a640",
  attention: "#f59eb5",
  unknown: "rgba(255,255,255,0.35)",
};

// Status comes only from fields the lab itself reports: its flag
// first, then the printed range. Optimal means the lab flagged the
// marker normal; needs attention means it flagged it or the value
// falls outside the range.
function markerStatus(r: MarkerResult): MarkerStatus {
  const f = r.flag.toLowerCase();
  if (
    f.includes("high") ||
    f.includes("low") ||
    f.includes("abnormal") ||
    f.includes("critical") ||
    f.includes("flag") ||
    f.includes("out of")
  )
    return "attention";
  if (
    f.includes("optimal") ||
    f.includes("normal") ||
    f.includes("in range") ||
    f.includes("negative")
  )
    return "optimal";
  const numeric = parseFloat(r.value.replace(/[^0-9.\-]/g, ""));
  const bounds = r.range
    .replace(/to/gi, "-")
    .split("-")
    .map((s) => parseFloat(s.trim()));
  if (!Number.isNaN(numeric) && bounds.length === 2 && !bounds.some(Number.isNaN) && bounds[1] > bounds[0]) {
    return numeric >= bounds[0] && numeric <= bounds[1] ? "inRange" : "attention";
  }
  return r.value === "" ? "unknown" : "inRange";
}

function pick(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
  }
  return "";
}

function extractResults(provider: unknown): MarkerResult[] {
  if (!provider || typeof provider !== "object") return [];
  const root = provider as Record<string, unknown>;
  const arrays: unknown[] = [root.results, root.marker_results, root.lab_results, root.markers];
  const arr = arrays.find((a) => Array.isArray(a) && a.length > 0) as
    | Array<Record<string, unknown>>
    | undefined;
  if (!arr) return [];
  return arr
    .map((item) => {
      const marker = (item.marker ?? {}) as Record<string, unknown>;
      const name = pick(item, ["name", "marker_name", "test_name"]) || pick(marker, ["name"]);
      const value = pick(item, ["value", "result", "result_value", "numeric_value"]);
      if (!name && !value) return null;
      let range = pick(item, ["reference_range", "range", "normal_range"]);
      if (!range) {
        const low = pick(item, ["reference_low", "low"]);
        const high = pick(item, ["reference_high", "high"]);
        if (low || high) range = `${low} to ${high}`;
      }
      return {
        name: name || "Marker",
        value,
        unit: pick(item, ["unit", "units"]),
        range,
        flag: pick(item, ["flag", "status", "interpretation"]),
      } as MarkerResult;
    })
    .filter((r): r is MarkerResult => r !== null);
}

function BalanceRing({
  total,
  analyzedPct,
  segments,
  biomarkersLabel,
  analyzedLabel,
}: {
  total: number;
  analyzedPct: number;
  segments: { fraction: number; color: string }[];
  biomarkersLabel: string;
  analyzedLabel: string;
}) {
  const R = 84;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="relative h-[218px] w-[218px]" style={{ filter: "drop-shadow(0 0 22px rgba(37,199,255,0.25))" }}>
      <svg viewBox="0 0 218 218" className="h-full w-full -rotate-90">
        <circle cx="109" cy="109" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="15" />
        {segments.map((seg, i) => {
          const gap = segments.length > 1 ? 0.012 * C : 0;
          const len = Math.max(2, seg.fraction * C - gap);
          const offset = -(acc * C) - gap / 2;
          acc += seg.fraction;
          return (
            <circle
              key={i}
              cx="109"
              cy="109"
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth="15"
              strokeLinecap="round"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[44px] leading-none font-extrabold text-white">{total}</span>
        <span className="mt-1.5 text-[11px] font-semibold tracking-[0.18em] text-white/65">
          {biomarkersLabel}
        </span>
        <span className="mt-1 text-xs font-medium text-white/65">{analyzedLabel}</span>
      </div>
    </div>
  );
}

function LabResultInner({ locale: localeProp }: { locale?: Locale }) {
  const routeParams = useParams();
  const rawLocale = localeProp ?? String(routeParams?.locale ?? "en");
  const locale: Locale =
    isLocale(rawLocale) && rawLocale !== "en" ? rawLocale : "en";
  const dict = getDictionary(locale);
  const t = dict.lab.detail;
  const lh = (href: string) => localizeHref(href, locale);
  const dateLocale = locale === "en" ? "en-US" : locale;
  const STATUS_LABEL: Record<MarkerStatus, string> = {
    optimal: t.statusLabels.optimal,
    inRange: t.statusLabels.inRange,
    attention: t.statusLabels.attention,
    unknown: "",
  };
  const params = useParams();
  const id = String(params?.id ?? "");
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [results, setResults] = useState<MarkerResult[]>([]);
  const [providerStatus, setProviderStatus] = useState("");
  const [filter, setFilter] = useState<MarkerStatus | null>(null);

  useEffect(() => {
    supabase()
      .auth.getSession()
      .then(({ data }) => {
        if (!data.session) window.location.href = lh("/login");
      });
    if (!id) return;
    callLabs("order_detail", { id }).then((res) => {
      if (res.error || !res.order) {
        setState("missing");
        return;
      }
      const row = res.order as Record<string, unknown>;
      setOrder(row);
      setResults(
        extractResults(res.provider).map((r) =>
          r.name === "Marker" ? { ...r, name: t.markerFallback } : r,
        ),
      );
      const prov = (res.provider ?? {}) as Record<string, unknown>;
      setProviderStatus(pick(prov, ["status", "state"]));
      setState("ready");
    });
  }, [id]);

  const status = providerStatus || String(order?.status ?? "");
  const resulted = results.length > 0;
  const panelName = String(order?.panel_name ?? t.yourPanel);
  const counts: Record<MarkerStatus, number> = { optimal: 0, inRange: 0, attention: 0, unknown: 0 };
  for (const r of results) counts[markerStatus(r)] += 1;
  const analyzedPct = resulted
    ? Math.round((results.filter((r) => r.value !== "").length / results.length) * 100)
    : 0;
  const segments = (["optimal", "inRange", "attention", "unknown"] as MarkerStatus[])
    .filter((s) => counts[s] > 0)
    .map((s) => ({ fraction: counts[s] / results.length, color: STATUS_COLOR[s] }));
  const visible = filter ? results.filter((r) => markerStatus(r) === filter) : results;
  const updatedLabel = order
    ? fmt(t.updatedPrefix, {
        date: new Date(String(order.created_at)).toLocaleDateString(dateLocale, {
          month: "short",
          day: "numeric",
        }),
      })
    : t.updatedRecently;

  const headline =
    state === "loading"
      ? t.headlines.loading
      : !resulted
        ? t.headlines.pending
        : counts.attention === 0
          ? t.headlines.allIn
          : t.headlines.in;
  const subline =
    state === "loading"
      ? t.sublines.loading
      : !resulted
        ? t.sublines.pending
        : counts.attention === 0
          ? t.sublines.allIn
          : counts.attention === 1
            ? t.sublines.oneAttention
            : fmt(t.sublines.manyAttention, { n: counts.attention });

  const tile = "rounded-[28px] border border-white/[0.07] bg-white/[0.055] p-5 sm:p-6";

  const triage: { status: MarkerStatus; name: string; subtitle: string; icon: string }[] = [
    { status: "optimal", name: t.statusNames.optimal, subtitle: t.triageSubs.optimal, icon: "↗" },
    { status: "inRange", name: t.statusNames.inRange, subtitle: t.triageSubs.inRange, icon: "✓" },
    {
      status: "attention",
      name: t.statusNames.attention,
      subtitle: t.triageSubs.attention,
      icon: "!",
    },
  ];

  return (
    <SiteShell locale={locale}>
      <section className="mx-auto w-full max-w-[72rem] px-5 pt-10 pb-16 sm:px-8 lg:pt-14">
        <Link
          href={lh("/account")}
          className="text-sm font-semibold text-[#17100D] underline decoration-gold-soft decoration-2 underline-offset-4"
        >
          {t.backToAccount}
        </Link>

        {state === "missing" || (!order && state === "ready") ? (
          <div className="mt-6 rounded-2xl border border-linestone bg-white p-6 sm:p-7">
            <h1 className="font-display text-[1.625rem] font-semibold text-[#2A1710]">
              {t.notFoundTitle}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {t.notFoundBody}
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-[32px] bg-[#17100D] p-4 shadow-[0_18px_44px_rgba(23,16,13,0.35)] sm:p-6">
            <div className="flex flex-col gap-4">
              {/* Clinical review header */}
              <div className={tile}>
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#291C17] text-[23px] font-extrabold text-white">
                    t.
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-champagne">
                      {t.clinicalReview}
                    </p>
                    <h1 className="mt-1 text-xl font-bold text-white">{headline}</h1>
                    <p className="mt-1 text-sm leading-relaxed text-white/70">{subline}</p>
                    {order ? (
                      <p className="mt-2 text-[13px] font-medium text-white/50">
                        {panelName} · {t.orderedPrefix}{" "}
                        {new Date(String(order.created_at)).toLocaleDateString(dateLocale, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {status ? ` · ${t.statusPrefix} ${status.replace(/_/g, " ")}` : ""}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {state === "ready" && !resulted ? (
                <div className={tile}>
                  <h2 className="text-lg font-bold text-white">{t.notInYetTitle}</h2>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-white/70">
                    {t.notInYetBody}
                  </p>
                </div>
              ) : null}

              {resulted ? (
                <>
                  {/* Balance ring */}
                  <div className={tile}>
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-white/60 uppercase">
                      {panelName}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white">{t.markerBalance}</h2>
                    <div className="mt-5 flex justify-center">
                      <BalanceRing total={results.length} analyzedPct={analyzedPct} segments={segments} biomarkersLabel={t.biomarkers} analyzedLabel={fmt(t.analyzedSuffix, { pct: analyzedPct })} />
                    </div>
                    <div className="mt-5 flex flex-col gap-2.5">
                      {(
                        [
                          ["optimal", t.statusNames.optimal],
                          ["inRange", t.statusNames.inRange],
                          ["attention", t.statusNames.attention],
                        ] as [MarkerStatus, string][]
                      ).map(([s, name]) => (
                        <div key={s} className="flex items-center gap-2.5">
                          <span
                            className="h-[11px] w-[11px] rounded-full"
                            style={{ background: STATUS_COLOR[s] }}
                          />
                          <span className="text-[15px] text-white/85">{name}</span>
                          <span
                            className="ml-auto text-base font-bold"
                            style={{ color: STATUS_COLOR[s] }}
                          >
                            {counts[s]}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5">
                      <div className="flex h-[9px] gap-[3px]">
                        {segments.map((seg, i) => (
                          <span
                            key={i}
                            className="rounded-full"
                            style={{ background: seg.color, width: `${seg.fraction * 100}%` }}
                          />
                        ))}
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-white/55">
                        <span>{fmt(t.basePrefix, { name: panelName })}</span>
                        <span>{updatedLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status triage */}
                  <div>
                    <div className="flex items-baseline justify-between px-1">
                      <h2 className="text-xl font-bold text-white">{t.triageTitle}</h2>
                      <span className="text-[13px] text-white/50">{t.tapToFilter}</span>
                    </div>
                    <div className="mt-3 flex flex-col gap-2.5">
                      {triage
                        .filter((t) => counts[t.status] > 0)
                        .map((t) => (
                          <button
                            key={t.status}
                            type="button"
                            onClick={() => setFilter(filter === t.status ? null : t.status)}
                            className={`flex w-full items-center gap-3.5 rounded-[20px] border border-white/[0.07] p-4 text-left transition ${
                              filter === t.status ? "bg-white/10" : "bg-white/[0.055]"
                            }`}
                          >
                            <span
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold"
                              style={{
                                color: STATUS_COLOR[t.status],
                                background: `${STATUS_COLOR[t.status]}29`,
                              }}
                            >
                              {t.icon}
                            </span>
                            <span>
                              <span className="block text-[17px] font-semibold text-white">
                                {t.name}
                              </span>
                              <span className="block text-[13px] text-white/55">{t.subtitle}</span>
                            </span>
                            <span
                              className="ml-auto text-[30px] leading-none font-extrabold"
                              style={{ color: STATUS_COLOR[t.status] }}
                            >
                              {counts[t.status]}
                            </span>
                            <span className="text-[13px] font-bold text-white/40">›</span>
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Marker drilldown */}
                  <div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      <button
                        type="button"
                        onClick={() => setFilter(null)}
                        className={`shrink-0 rounded-full px-3.5 py-2 text-[13.5px] font-semibold ${
                          filter === null ? "bg-champagne text-[#2A1710]" : "bg-white/[0.07] text-white/80"
                        }`}
                      >
                        {fmt(t.allFilter, { n: results.length })}
                      </button>
                      {triage
                        .filter((t) => counts[t.status] > 0)
                        .map((t) => (
                          <button
                            key={t.status}
                            type="button"
                            onClick={() => setFilter(t.status)}
                            className={`shrink-0 rounded-full px-3.5 py-2 text-[13.5px] font-semibold ${
                              filter === t.status
                                ? "bg-champagne text-[#2A1710]"
                                : "bg-white/[0.07] text-white/80"
                            }`}
                          >
                            {t.name} ({counts[t.status]})
                          </button>
                        ))}
                    </div>
                    <div className="mt-3 flex flex-col gap-2.5">
                      {visible.map((r, i) => {
                        const s = markerStatus(r);
                        return (
                          <div
                            key={`${r.name}-${i}`}
                            className="flex items-center gap-3 rounded-[20px] border border-white/[0.07] bg-white/[0.055] p-4"
                          >
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ background: STATUS_COLOR[s] }}
                            />
                            <span className="min-w-0">
                              <span className="block text-base font-semibold break-words text-white">
                                {r.name}
                              </span>
                              {r.range ? (
                                <span className="block text-xs text-white/50">{fmt(t.rangePrefix, { range: r.range })}</span>
                              ) : null}
                            </span>
                            <span className="ml-auto text-right">
                              <span className="block text-base font-bold whitespace-nowrap text-white">
                                {r.value}
                                {r.unit ? ` ${r.unit}` : ""}
                              </span>
                              {STATUS_LABEL[s] ? (
                                <span
                                  className="block text-[11px] font-bold tracking-[0.08em]"
                                  style={{ color: STATUS_COLOR[s] }}
                                >
                                  {STATUS_LABEL[s]}
                                </span>
                              ) : null}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}

              <p className="px-1 text-[13px] leading-relaxed text-white/50">
                {t.disclaimer}
              </p>
            </div>
          </div>
        )}
      </section>
    </SiteShell>
  );
}

export default function LabDetailClient({ locale }: { locale?: Locale }) {
  const dict = getDictionary(locale ?? "en");
  return (
    <Suspense
      fallback={
        <SiteShell locale={locale ?? "en"}>
          <section className="mx-auto w-full max-w-[72rem] px-5 pt-10 pb-16 sm:px-8 lg:pt-14">
            <p className="text-[15px] text-muted-foreground">{dict.lab.detail.loadingResults}</p>
          </section>
        </SiteShell>
      }
    >
      <LabResultInner locale={locale} />
    </Suspense>
  );
}
