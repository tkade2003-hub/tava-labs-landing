"use client";

import { useState } from "react";
import { FUNNEL_INTAKE_URL } from "@/lib/supabase";

// Direct checkout, identical flow to index.html: a buy button opens this
// form; submitting POSTs the funnel payload to funnel-intake, which
// creates the order + a Stripe Checkout Session server-side (pricing is
// server-owned), and the browser redirects to the returned Stripe URL.
const PRODUCT = { productId: "cbbc7de1-994e-45be-94d8-ac4be3b8cc18", sku: "VASHO-PBS-8FB6" };
const PRICES = { one_time: 49, subscribe: 39 } as const;
const PLAN_LINES = {
  one_time: "Glow Brightening Serum — $49 · One-time purchase",
  subscribe: "Glow Brightening Serum — $39/month · Subscribe & Save 20%",
} as const;

export type BuyType = keyof typeof PRICES;

export function CheckoutModal({
  buyType,
  initialEmail,
  onClose,
}: {
  buyType: BuyType;
  initialEmail: string;
  onClose: () => void;
}) {
  const [fields, setFields] = useState({
    email: initialEmail,
    first: "",
    last: "",
    addr1: "",
    addr2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitLabel, setSubmitLabel] = useState("Continue to Payment");

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = (s: string) => s.trim();
    const shippingAddress = {
      firstName: v(fields.first),
      lastName: v(fields.last),
      address1: v(fields.addr1),
      address2: v(fields.addr2) || undefined,
      city: v(fields.city),
      stateCode: v(fields.state).toUpperCase(),
      zip: v(fields.zip),
      countryCode: (v(fields.country) || "US").toUpperCase(),
      phone: v(fields.phone) || undefined,
    };
    const email = v(fields.email);
    const missing: string[] = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) missing.push("a valid email");
    if (!shippingAddress.firstName) missing.push("first name");
    if (!shippingAddress.lastName) missing.push("last name");
    if (!shippingAddress.address1) missing.push("street address");
    if (!shippingAddress.city) missing.push("city");
    if (!shippingAddress.stateCode) missing.push("state");
    if (!shippingAddress.zip) missing.push("ZIP code");
    if (missing.length) {
      setError(`Almost there — add your ${missing.join(", ")}.`);
      return;
    }
    setError("");
    setBusy(true);
    setSubmitLabel("Creating your checkout…");

    const payload = {
      email,
      source: "quiz-funnel",
      answers: {
        goal: "radiance",
        skinType: "not_sure",
        concern: "dullness",
        sensitivity: "sometimes",
        routine: "few_products",
        amTime: "08:00",
        pmTime: "21:00",
      },
      plan: {
        rampSchedule: "standard",
        summary:
          "Direct checkout from the Tava Labs website (no quiz taken). Default routine plan — the buyer can personalize everything in the app.",
      },
      order: {
        productId: PRODUCT.productId,
        sku: PRODUCT.sku,
        quantity: 1,
        purchaseType: buyType,
        price: PRICES[buyType],
      },
      shippingAddress,
    };

    try {
      const res = await fetch(FUNNEL_INTAKE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.checkoutUrl) {
        setSubmitLabel("Taking you to secure checkout…");
        window.location.href = data.checkoutUrl;
        return;
      }
      throw new Error("no checkout url");
    } catch {
      setError("Checkout couldn't start — please check your details and try again. Nothing was charged.");
      setBusy(false);
      setSubmitLabel("Continue to Payment");
    }
  }

  return (
    <div
      className="co-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="co-modal" role="dialog" aria-modal="true" aria-labelledby="coTitle">
        <button className="co-close" type="button" aria-label="Close checkout" onClick={onClose}>
          &times;
        </button>
        <h3 id="coTitle">Checkout</h3>
        <p className="co-plan">{PLAN_LINES[buyType]}</p>
        <form onSubmit={submit} noValidate>
          <label>
            Email
            <input type="email" autoComplete="email" placeholder="you@example.com" required value={fields.email} onChange={set("email")} />
          </label>
          <div className="co-row">
            <label>
              First name
              <input type="text" autoComplete="given-name" required value={fields.first} onChange={set("first")} />
            </label>
            <label>
              Last name
              <input type="text" autoComplete="family-name" required value={fields.last} onChange={set("last")} />
            </label>
          </div>
          <label>
            Street address
            <input type="text" autoComplete="address-line1" required value={fields.addr1} onChange={set("addr1")} />
          </label>
          <label>
            Address line 2 (optional)
            <input type="text" autoComplete="address-line2" value={fields.addr2} onChange={set("addr2")} />
          </label>
          <div className="co-row">
            <label>
              City
              <input type="text" autoComplete="address-level2" required value={fields.city} onChange={set("city")} />
            </label>
            <label>
              State
              <input type="text" autoComplete="address-level1" maxLength={2} placeholder="CA" required value={fields.state} onChange={set("state")} />
            </label>
            <label>
              ZIP
              <input type="text" autoComplete="postal-code" required value={fields.zip} onChange={set("zip")} />
            </label>
          </div>
          <div className="co-row">
            <label>
              Country
              <input type="text" autoComplete="country" maxLength={2} required value={fields.country} onChange={set("country")} />
            </label>
            <label>
              Phone (optional)
              <input type="tel" autoComplete="tel" value={fields.phone} onChange={set("phone")} />
            </label>
          </div>
          {error ? (
            <p className="co-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="co-submit" type="submit" disabled={busy}>
            {submitLabel}
          </button>
          <p className="co-note">
            Secure checkout by Stripe — you&apos;ll confirm payment on Stripe&apos;s page. Nothing is
            charged yet.
          </p>
        </form>
      </div>
    </div>
  );
}
