"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/client-api";

export function PlanActions({ isPro }: { isPro: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  if (!isPro) {
    return (
      <>
        <ButtonLink href="/pricing?next=/account">Upgrade to Pro</ButtonLink>
        <ButtonLink href="/pricing" variant="text">Compare plans</ButtonLink>
      </>
    );
  }

  return (
    <>
      <Button variant="outlined" onClick={() => setConfirming(true)}>
        Cancel Pro
      </Button>
      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Cancel Pro?"
        description="Live links will show the SiteForge badge, and new sites go back to one a month. Your sites and pipeline stay."
        actions={
          <>
            <Button variant="text" onClick={() => setConfirming(false)}>
              Keep Pro
            </Button>
            <Button
              loading={pending}
              onClick={async () => {
                setPending(true);
                const result = await api("/api/billing/downgrade", { method: "POST" });
                setPending(false);
                setConfirming(false);
                toast(result.ok ? "You're on the free plan" : result.error.message);
                router.refresh();
              }}
            >
              Cancel Pro
            </Button>
          </>
        }
      />
    </>
  );
}
