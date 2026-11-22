"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import { supabase } from "@/lib/supabase";
import { callLabs } from "@/lib/labs";

// Full page lab results for one order. The labs edge function returns
// our order row plus the live provider order; once the lab reports,
// the provider order carries every marker result and this page renders
// all of them, full width, with values, ranges, and flags.
interface MarkerResult {
  name: string;
  value: string;
  unit: string;
  range: string;
  flag: string;
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

function flagStyle(flag: string): string {
  const f = flag.toLowerCase();
  if (f === "" ) return "bg-linen text-forest-deep";
  if (f.includes("normal") || f.includes("in range") || f === "ok") return "bg-linen text-forest-deep";
  if (f.includes("high") || f.includes("low") || f.includes("abnormal") || f.includes("out"))
    return "bg-[#F6E3DC] text-[#B14E32]";
  return "bg-linen text-forest-deep";
}

function LabResultInner() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [results, setResults] = useState<MarkerResult[]>([]);
  const [providerStatus, setProviderStatus] = useState("");

  useEffect(() => {
    supabase()
      .auth.getSession()
      .then(({ data }) => {
        if (!data.session) window.location.href = "/login";
      });
    if (!id) return;
    callLabs("order_detail", { id }).then((res) => {
      if (res.error || !res.order) {
        setState("missing");
        return;
      }
      const row = res.order as Record<string, unknown>;
      setOrder(row);
      setResults(extractResults(res.provider));
      const prov = (res.provider ?? {}) as Record<string, unknown>;
      setProviderStatus(pick(prov, ["status", "state"]));
      setState("ready");
    });
  }, [id]);

  const status = providerStatus || String(order?.status ?? "");
  const resulted = results.length > 0;

  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-[72rem] px-5 pt-10 pb-16 sm:px-8 lg:pt-14">
        <Link
          href="/account"
          className="text-sm font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
        >
          Back to your account
        </Link>

        {state === "loading" ? (
          <p className="mt-6 text-[15px] text-muted-foreground">Loading your results…</p>
        ) : state === "missing" || !order ? (
          <div className="mt-6 rounded-2xl border border-linestone bg-white p-6 sm:p-7">
            <h1 className="font-display text-[1.625rem] font-semibold text-forest-deep">
              That lab order was not found
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              It may belong to a different email. Sign in with the email you ordered under and try
              again.
            </p>
          </div>
        ) : (
          <>
            <p className="tava-label mt-6">Lab results</p>
            <h1 className="mt-1.5 font-display text-[2rem] leading-tight font-semibold text-forest-deep">
              {String(order.panel_name ?? "Your panel")}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Ordered{" "}
              {new Date(String(order.created_at)).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {status ? ` · Status: ${status.replace(/_/g, " ")}` : ""}
            </p>

            {resulted ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-linestone bg-white shadow-[0_10px_28px_rgba(8,37,29,0.07)]">
                <div className="hidden grid-cols-[1.4fr_0.8fr_1fr_auto] gap-4 border-b border-linestone bg-linen px-6 py-3 text-[12px] font-semibold tracking-wide text-forest-deep uppercase sm:grid">
                  <span>Marker</span>
                  <span>Result</span>
                  <span>Healthy range</span>
                  <span>Status</span>
                </div>
                <ul className="divide-y divide-linestone">
                  {results.map((r, i) => (
                    <li
                      key={`${r.name}-${i}`}
                      className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-[1.4fr_0.8fr_1fr_auto] sm:items-center sm:gap-4"
                    >
                      <span className="text-[15px] font-semibold text-forest-deep">{r.name}</span>
                      <span className="text-[15px] text-foreground">
                        {r.value}
                        {r.unit ? <span className="text-muted-foreground"> {r.unit}</span> : null}
                      </span>
                      <span className="text-sm text-muted-foreground">{r.range || "—"}</span>
                      <span
                        className={`inline-block w-fit rounded-full px-3 py-1 text-[12px] font-semibold ${flagStyle(r.flag)}`}
                      >
                        {r.flag || "Reported"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-linestone bg-white p-6 sm:p-7">
                <h2 className="font-display text-[1.375rem] font-semibold text-forest-deep">
                  Results are not in yet
                </h2>
                <p className="mt-2 max-w-[42rem] text-[15px] leading-relaxed text-muted-foreground">
                  Your results land on this page as soon as the lab reports them, with every
                  marker, its value, and its healthy range. Most panels report within days of
                  your draw.
                </p>
              </div>
            )}

            <p className="mt-6 max-w-[42rem] text-sm leading-relaxed text-muted-foreground">
              Lab results are information about your own health and are not a diagnosis. Talk to
              your doctor about any result that concerns you, and call 911 in an emergency.
            </p>
          </>
        )}
      </section>
    </SiteShell>
  );
}

export default function LabResultPage() {
  return (
    <Suspense
      fallback={
        <SiteShell>
          <section className="mx-auto w-full max-w-[72rem] px-5 pt-10 pb-16 sm:px-8 lg:pt-14">
            <p className="text-[15px] text-muted-foreground">Loading your results…</p>
          </section>
        </SiteShell>
      }
    >
      <LabResultInner />
    </Suspense>
  );
}
