import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Avatar } from "@/components/AccountMenu";
import { PlanActions } from "@/components/PlanActions";
import { requireUser } from "@/lib/auth";
import { proPrice } from "@/lib/billing/provider";
import { FREE_SITES_PER_MONTH } from "@/lib/entitlements";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  await requireUser("/account");
  const viewer = await getViewer();
  if (!viewer) notFound();
  const price = proPrice();
  const isPro = viewer.plan === "pro";
  return (
    <>
      <AppHeader viewer={viewer} />
      <main className="px-4 pt-12 pb-24 sm:px-6">
        <div className="mx-auto max-w-[720px]">
          <div className="flex flex-col items-center text-center">
            <Avatar name={viewer.name} size={64} />
            <h1 className="mt-4 text-2xl font-normal text-text">{viewer.name}</h1>
            <p className="mt-1 text-base text-text-2">{viewer.email}</p>
          </div>

          <section id="plan" aria-labelledby="plan-title" className="mt-12 scroll-mt-24 rounded-xl border border-border">
            <div className="p-6">
              <h2 id="plan-title" className="text-xl font-normal text-text">Plan &amp; billing</h2>
              <p className="mt-2 text-base text-text-2">
                {isPro
                  ? `You're on Pro at ${price.formatted} a month: unlimited sites, live links, code download and message drafts.`
                  : `You're on the free plan. ${viewer.sitesThisMonth} of ${FREE_SITES_PER_MONTH} free site used this month; the count resets on the 1st (UTC).`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border px-6 py-4">
              <PlanActions isPro={isPro} />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
