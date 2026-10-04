import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { proPrice } from "@/lib/billing/provider";
import { safeNext } from "@/lib/next-path";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Pricing" };

const FREE = ["1 new site per month", "Watermarked preview", "3 copy regenerations per site", "Edit text, hours and phone"];
const PRO = [
  "Unlimited sites",
  "Live shareable links",
  "No SiteForge watermark",
  "Download the code",
  "WhatsApp and email message drafts",
  "Unlimited copy regenerations",
];

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from Plan & billing in your account. You keep Pro until the end of the period you paid for, then move to the free plan. Your sites and pipeline stay.",
  },
  {
    q: "Who owns the sites I build?",
    a: "You do, and you can hand them to the business. Download the code and host it anywhere, or keep the live link running on SiteForge while you're on Pro.",
  },
  {
    q: "Where does the business data come from?",
    a: "From public business listings: name, address, phone, rating, reviews and hours. The copy only uses those facts, and review quotes are real excerpts.",
  },
  {
    q: "Do I need to know code?",
    a: "No. You pick a template, edit the text in a panel, and share a link. The code download is there if you or a developer want it.",
  },
];

export default async function PricingPage({ searchParams }: PageProps<"/pricing">) {
  const query = await searchParams;
  const viewer = await getViewer();
  const price = proPrice();
  const from = typeof query.from === "string" ? query.from : "";
  const next = safeNext(typeof query.next === "string" ? query.next : null);
  const checkout = `/checkout?${new URLSearchParams({ ...(from ? { from } : {}), next })}`;
  const upgradeHref = viewer ? checkout : `/signup?next=${encodeURIComponent(checkout)}`;
  const isPro = viewer?.plan === "pro";

  return (
    <>
      <AppHeader viewer={viewer} signInNext="/pricing" />
      <main className="px-4 pt-16 pb-24 sm:px-6">
        <div className="mx-auto max-w-[960px] text-center">
          <h1 className="text-3xl font-medium tracking-tight text-text sm:text-display">Simple pricing</h1>
          <p className="mx-auto mt-4 max-w-[560px] text-lg text-text-2">
            Try it free with one site a month. Upgrade when you&apos;re ready to send links to owners.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-[960px] gap-6 md:grid-cols-2">
          <section aria-labelledby="free-title" className="flex flex-col rounded-xl border border-border p-8">
            <h2 id="free-title" className="text-xl font-normal text-text">Free</h2>
            <p className="mt-4 text-3xl font-medium text-text">
              {new Intl.NumberFormat("en", { style: "currency", currency: price.currency, maximumFractionDigits: 0 }).format(0)}
            </p>
            <p className="text-sm text-text-2">Free forever</p>
            <ul className="mt-8 flex flex-1 flex-col gap-3">
              {FREE.map((item) => (
                <li key={item} className="flex gap-3 text-base text-text">
                  <Icon name="check" className="mt-[2px] text-text-2" />
                  {item}
                </li>
              ))}
            </ul>
            <ButtonLink href={viewer ? "/dashboard" : "/signup"} variant="outlined" size="lg" className="mt-8">
              {viewer ? (isPro ? "Go to dashboard" : "Your current plan") : "Start free"}
            </ButtonLink>
          </section>

          <section aria-labelledby="pro-title" className="relative flex flex-col rounded-xl border-2 border-ink bg-bg p-8 shadow-2">
            <span className="absolute -top-3 left-8 rounded-full bg-ink px-3 text-sm leading-6 font-medium text-on-ink">For working operators</span>
            <h2 id="pro-title" className="text-xl font-normal text-text">Pro</h2>
            <p className="mt-4 text-3xl font-medium text-text">{price.formatted}</p>
            <p className="text-sm text-text-2">per month, cancel anytime</p>
            <ul className="mt-8 flex flex-1 flex-col gap-3">
              {PRO.map((item) => (
                <li key={item} className="flex gap-3 text-base text-text">
                  <Icon name="check" className="mt-[2px] text-accent" />
                  {item}
                </li>
              ))}
            </ul>
            {isPro ? (
              <ButtonLink href={next} size="lg" className="mt-8">
                You&apos;re on Pro
              </ButtonLink>
            ) : (
              <ButtonLink href={upgradeHref} size="lg" className="mt-8">
                Upgrade to Pro
              </ButtonLink>
            )}
          </section>
        </div>

        <section aria-labelledby="faq-title" className="mx-auto mt-24 max-w-[720px]">
          <h2 id="faq-title" className="text-center text-2xl font-normal text-text">Questions</h2>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {FAQ.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-base text-text [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Icon name="expand_more" className="text-text-2 transition-transform duration-200 ease-standard group-open:rotate-180" />
                </summary>
                <p className="pb-6 text-base text-text-2">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
