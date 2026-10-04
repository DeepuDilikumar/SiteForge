import Link from "next/link";
import { BrowserFrame } from "@/components/BrowserFrame";
import { ScaledFrame } from "@/components/ScaledFrame";
import { SiteFooter } from "@/components/SiteFooter";
import { SuggestionChips } from "@/components/SuggestionChips";
import { AccountMenu } from "@/components/AccountMenu";
import { DemoChip } from "@/components/AppHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getTheme } from "@/lib/theme-server";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Wordmark } from "@/components/ui/Logo";
import { SearchBox } from "@/components/ui/SearchBox";
import { proPrice } from "@/lib/billing/provider";
import { demoBusiness } from "@/lib/demo";
import { slugify } from "@/lib/util/text";
import { getViewer } from "@/lib/viewer";

const STEPS = [
  {
    title: "Find",
    body: "Search a business type and a city. See who has no website, or only a social page, with their rating and reviews.",
    icon: "travel_explore" as const,
  },
  {
    title: "Build",
    body: "Pick a template and SiteForge writes the site from the business's real details and reviews. About a minute.",
    icon: "palette" as const,
  },
  {
    title: "Send",
    body: "Get a live link and send it to the owner on WhatsApp or email with a short, honest message.",
    icon: "send" as const,
  },
];

export default async function LandingPage() {
  const viewer = await getViewer();
  const demo = demoBusiness();
  const price = proPrice();
  const theme = await getTheme();

  return (
    <>
      <header className="flex h-16 items-center justify-end gap-3 px-4 sm:px-6">
        <DemoChip />
        <ThemeToggle initial={theme} />
        {viewer ? (
          <>
            <Link href="/dashboard" className="rounded-full px-2 text-sm font-medium text-text-2 hover:text-text">
              Dashboard
            </Link>
            <AccountMenu name={viewer.name} email={viewer.email} plan={viewer.plan} />
          </>
        ) : (
          <>
            <Link href="/login" className="rounded-full px-2 text-sm font-medium text-text-2 hover:text-text">
              Sign in
            </Link>
            <ButtonLink href="/signup">Get started</ButtonLink>
          </>
        )}
      </header>

      <main>
        <section className="flex min-h-[calc(100dvh-64px)] flex-col items-center px-4 pt-[12vh] pb-24 sm:pt-[18vh]">
          <h1 className="sr-only">SiteForge</h1>
          <Wordmark size="xl" />
          <div className="mt-8 w-full max-w-[640px] sm:mt-12">
            <SearchBox size="hero" />
          </div>
          <p className="mt-8 max-w-[600px] text-center text-lg font-[600] tracking-tight text-text sm:text-xl">
            Find businesses without websites. Build them one in a minute. Send the link.
          </p>
          <SuggestionChips className="mt-6 max-w-[760px]" />
        </section>

        <section aria-labelledby="proof-title" className="px-2 sm:px-4">
          <div className="mx-auto max-w-[1408px] rounded-[32px] bg-surface px-4 py-16 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-[1120px]">
              <h2 id="proof-title" className="mx-auto max-w-[800px] text-center text-2xl font-medium tracking-tight text-text sm:text-3xl lg:text-display">
                From a map listing to a real website
              </h2>
              <p className="mx-auto mt-6 max-w-[560px] text-center text-base text-text-2 sm:text-lg">
                A real search result, and the site SiteForge builds from its name, rating, reviews and hours.
              </p>
              <div className="mt-12 grid items-center gap-8 lg:mt-16 lg:grid-cols-[320px_auto_1fr]">
                <article aria-label="Before: map listing" className="rounded-xl border border-border bg-bg p-6">
                  <p className="text-sm text-text-2">Before</p>
                  <h3 className="mt-4 text-lg font-medium text-text">{demo.name}</h3>
                  <p className="mt-1 text-sm text-text-2">{demo.category} · {demo.city}</p>
                  <p className="mt-2 flex items-center gap-1 text-sm text-text">
                    {demo.rating?.toFixed(1)}
                    <Icon name="star" size={16} filled className="text-[#f9ab00]" />
                    <span className="text-text-2">({demo.reviewCount})</span>
                  </p>
                  <p className="mt-2 text-sm text-text-2">{demo.address}</p>
                  <div className="mt-4">
                    <Badge tone="strong">No website</Badge>
                  </div>
                </article>
                <Icon name="arrow_forward" size={32} className="mx-auto rotate-90 text-text-2 lg:rotate-0" />
                <div>
                  <p className="mb-4 text-sm text-text-2">After</p>
                  <BrowserFrame url={`siteforge.app/s/${slugify(`${demo.name} ${demo.city}`)}`}>
                    <ScaledFrame src="/api/demo-site?template=legacy" title={`Generated website for ${demo.name}`} viewportWidth={1280} aspect={0.62} />
                  </BrowserFrame>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="how-title" className="px-4 py-24 sm:px-6 lg:py-32">
          <div className="mx-auto max-w-[1120px]">
            <h2 id="how-title" className="text-center text-2xl font-medium tracking-tight text-text sm:text-3xl lg:text-display">
              How it works
            </h2>
            <ol className="mt-12 grid gap-12 md:mt-16 md:grid-cols-3 md:gap-8">
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <span className="block text-3xl font-medium text-accent lg:text-display" aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-medium text-text">{step.title}</h3>
                  <p className="mt-2 text-base text-text-2">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="pricing-title" className="px-2 pb-16 sm:px-4">
          <div className="mx-auto flex max-w-[1408px] flex-col items-center rounded-[32px] bg-surface px-6 py-16 text-center sm:py-24">
            <h2 id="pricing-title" className="max-w-[800px] text-2xl font-medium tracking-tight text-text sm:text-3xl lg:text-display">
              Start free. Upgrade when you start sending.
            </h2>
            <p className="mt-6 max-w-[620px] text-base text-text-2 sm:text-lg">
              The free plan builds one site a month with a watermarked preview. Pro is {price.formatted} a month for unlimited
              sites, live links, code download and message drafts.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href={viewer ? "/dashboard" : "/signup"} size="lg">{viewer ? "Go to dashboard" : "Get started"}</ButtonLink>
              <ButtonLink href="/pricing" variant="outlined" size="lg">Compare plans</ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
