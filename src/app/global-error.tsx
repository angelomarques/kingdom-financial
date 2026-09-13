"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 px-4 py-16 text-zinc-50">
        <main className="mx-auto grid max-w-lg gap-4">
          <h1 className="text-2xl font-medium">Kingdom Financial crashed</h1>
          <p className="text-sm text-zinc-400">
            {error.message || "The app shell failed before the page could render."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="w-fit rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-950"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
