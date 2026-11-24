"use client";

import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Button } from "@/components/ui/button";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

// Direct checkout for The Routine: the serum with the moisturizer included
// as a bundled add on in a single one time order.
const MOISTURIZER = {
  productId: "00bc6534-cd37-4015-a266-bedc75d69936",
  sku: "VASHO-PM-E5B5",
} as const;

export function RoutineCheckout({
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
          productName="PDRN Brightening Serum"
          bundleAddOn={{
            productId: MOISTURIZER.productId,
            sku: MOISTURIZER.sku,
            name: "Peptide Moisturizer",
            blurb:
              dict?.pairing.addonMoisturizerBlurb ??
              "The second step of the routine. It hydrates skin and targets the look of fine lines and wrinkles. 1.7 fl oz (50 ml).",
            price: 27.99,
          }}
        />
      ) : null}
    </>
  );
}

export default RoutineCheckout;
