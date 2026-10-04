"use client";

import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Logo";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Wordmark size="lg" />
      <h1 className="mt-8 text-2xl font-normal text-text">Something went wrong on our side</h1>
      <p className="mt-2 max-w-[420px] text-base text-text-2">The page didn&apos;t load. Try again; if it keeps happening, reload the page.</p>
      <Button className="mt-8" icon="refresh" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
