import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ConfirmUpgrade } from "@/components/ConfirmUpgrade";
import { Icon } from "@/components/ui/Icon";
import { requireUser } from "@/lib/auth";
import { getBillingProvider, proPrice } from "@/lib/billing/provider";
import { safeNext } from "@/lib/next-path";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const query = await searchParams;
  const next = safeNext(typeof query.next === "string" ? query.next : null);
  const from = typeof query.from === "string" ? query.from : "";
  const self = `/checkout?${new URLSearchParams({ ...(from ? { from } : {}), next })}`;
  await requireUser(self);
  const viewer = await getViewer();
  if (viewer?.plan === "pro") redirect(next);
  const price = proPrice();
  const billing = getBillingProvider();

  return (
    <>
      <AppHeader viewer={viewer} />
      <main className="px-4 pt-12 pb-24 sm:px-6">
        <div className="mx-auto max-w-[480px]">
          <h1 className="text-2xl font-normal text-text">Upgrade to Pro</h1>
          <div className="mt-8 rounded-xl border border-border">
            <div className="flex items-start justify-between gap-4 p-6">
              <div>
                <p className="text-base text-text">SiteForge Pro</p>
                <p className="mt-1 text-sm text-text-2">Monthly · renews each month · cancel anytime</p>
              </div>
              <p className="text-base text-text">{price.formatted}</p>
            </div>
            <div className="flex items-center justify-between border-t border-border p-6">
              <p className="text-base font-medium text-text">Due today</p>
              <p className="text-xl text-text">{price.formatted}</p>
            </div>
          </div>
          {billing.testMode ? (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning">
              <Icon name="info" size={18} className="mt-[1px]" />
              Test mode — no real charge. Confirming switches your account to Pro straight away.
            </p>
          ) : null}
          <p className="mt-6 text-sm text-text-2">Signed in as {viewer?.email}</p>
          <ConfirmUpgrade next={next} />
        </div>
      </main>
    </>
  );
}
