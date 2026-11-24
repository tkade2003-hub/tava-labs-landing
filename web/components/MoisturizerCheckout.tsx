"use client";

import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Button } from "@/components/ui/button";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

// Direct checkout for the Peptide Moisturizer: the Add to routine accent
// button opens CheckoutModal configured for the moisturizer only
// (one_time, $27.99). Pricing is still server owned in funnel-intake;
// these values only identify the product and mirror the server price.
//
// Props mirror MoisturizerCta (locale, dict, className) so MoisturizerBody
// can swap to this component with a one line import change; the label can
// also be passed directly via the label prop.
const MOISTURIZER = {
  productId: "00bc6534-cd37-4015-a266-bedc75d69936",
  sku: "VASHO-PM-E5B5",
  prices: { one_time: 27.99 },
} as const;

export function MoisturizerCheckout({
  label,
  dict,
  className = "px-7",
}: {
  label?: string;
  locale?: Locale;
  dict?: Dict;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const text = label ?? dict?.chrome.addToRoutine ?? "Add to routine";
  return (
    <>
      <Button size="lg" className={`accent-btn ${className}`} onClick={() => setOpen(true)}>
        {text}
      </Button>
      {open ? (
        <CheckoutModal
          buyType="one_time"
          initialEmail=""
          onClose={() => setOpen(false)}
          dict={dict}
          productId={MOISTURIZER.productId}
          sku={MOISTURIZER.sku}
          prices={MOISTURIZER.prices}
        />
      ) : null}
    </>
  );
}

export default MoisturizerCheckout;
