"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/client-api";

export function ConfirmUpgrade({ next }: { next: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="mt-6">
      {error ? (
        <p role="alert" className="mb-4 rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="lg"
          loading={pending}
          onClick={async () => {
            setPending(true);
            setError(null);
            const result = await api("/api/billing/upgrade", { method: "POST" });
            if (!result.ok) {
              setPending(false);
              setError(result.error.message);
              return;
            }
            router.push(`/checkout/success?${new URLSearchParams({ next })}`);
          }}
        >
          Confirm upgrade
        </Button>
        <Link href={next} className="rounded-full px-4 py-2 text-sm font-medium text-accent hover:bg-accent-soft">
          Cancel
        </Link>
      </div>
    </div>
  );
}
