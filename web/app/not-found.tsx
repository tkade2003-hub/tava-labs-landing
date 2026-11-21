import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="mx-auto flex max-w-7xl flex-col items-start px-5 py-24 sm:px-8">
        <p className="text-sm font-semibold tracking-wide text-gold">
          Tava Labs
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold text-forest-deep sm:text-6xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md leading-relaxed text-ink/75">
          That page is not here. It may have moved, or the address may be
          incomplete.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button render={<Link href="/" />} size="lg">
            Back to the homepage
          </Button>
          <Button render={<Link href="/glow-brightening-serum" />} variant="outline" size="lg">
            Shop the PDRN Brightening Serum
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
