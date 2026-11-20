import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-black">
      <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
        Tava Labs
      </p>
      <h1 className="mt-4 text-4xl font-bold">Page not found</h1>
      <p className="mt-4 max-w-md text-base text-neutral-600">
        The page you are looking for is not here. It may have moved, or the
        address may be incomplete.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
        >
          Back to the homepage
        </Link>
        <Link
          href="/glow-brightening-serum"
          className="rounded-full border border-black px-6 py-3 text-sm font-semibold text-black"
        >
          Shop the PDRN Brightening Serum
        </Link>
      </div>
    </main>
  );
}
