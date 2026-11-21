"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// The footer newsletter signup. Submits to the HubSpot form that feeds
// the Tava Labs list (portal 247896333).
const HUBSPOT_SUBMIT_URL =
  "https://api.hsforms.com/submissions/v3/integration/submit/247896333/3fcc4d03-a5dd-47b9-803d-9984f57782f4";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  if (done) {
    return (
      <p className="text-sm text-gold-soft">
        You&rsquo;re in &mdash; welcome to the glow list.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim();
    if (!value || sending) return;
    setSending(true);
    setError(false);
    try {
      const response = await fetch(HUBSPOT_SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: [
            { objectTypeId: "0-1", name: "email", value },
          ],
          context: {
            pageUri: "https://www.tavalabs.app/",
            pageName: "Tava Labs",
          },
        }),
      });
      if (response.status === 200) {
        setDone(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <form
        className="flex max-w-md gap-2"
        onSubmit={handleSubmit}
      >
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          aria-label="Your email"
          className="border-white/25 bg-white/10 text-[#fafaf9] placeholder:text-[#fafaf9]/50 focus-visible:ring-gold"
        />
        <Button
          type="submit"
          disabled={sending}
          className="bg-gold text-white hover:bg-gold/85"
        >
          {sending ? "Sending..." : "Subscribe"}
        </Button>
      </form>
      {error && (
        <p className="mt-3 text-sm text-red-300" role="alert">
          Something went wrong, please try again.
        </p>
      )}
    </div>
  );
}
