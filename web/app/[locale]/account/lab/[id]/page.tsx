"use client";

import LabDetailClient from "@/components/LabDetailClient";

// Client page mirroring the English route module shape. The locale is
// read from the route params inside LabDetailClient, within its
// Suspense boundary.
export default function Page() {
  return <LabDetailClient />;
}
