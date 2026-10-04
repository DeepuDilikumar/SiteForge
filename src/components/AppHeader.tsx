import Link from "next/link";
import { AccountMenu } from "@/components/AccountMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoLink } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { SearchBox } from "@/components/ui/SearchBox";
import { getTheme } from "@/lib/theme-server";
import { isDemoData, type Viewer } from "@/lib/viewer";

type AppHeaderProps = {
  viewer: Viewer | null;
  search?: { what: string; where: string } | false;
  signInNext?: string;
};

export function DemoChip() {
  if (!isDemoData()) return null;
  return (
    <span
      title="No API keys are set, so search results and copy come from built-in sample data."
      className="hidden h-6 items-center rounded-full border border-border px-2 text-sm text-text-2 md:inline-flex"
    >
      Demo data
    </span>
  );
}

export function UsageLabel({ viewer }: { viewer: Viewer }) {
  if (viewer.plan === "pro") {
    return <span className="text-sm text-text-2">Pro</span>;
  }
  return (
    <Link href="/pricing" className="rounded-full text-sm text-text-2 hover:text-text">
      Free · {viewer.remainingFree} of 1 free site left
    </Link>
  );
}

export async function AppHeader({ viewer, search, signInNext }: AppHeaderProps) {
  const theme = await getTheme();
  return (
    <header className="border-b border-border bg-bg">
      <div className="mx-auto flex min-h-16 max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <LogoLink href={viewer ? "/dashboard" : "/"} />
        {search ? (
          <div className="order-last w-full sm:order-none sm:w-auto sm:max-w-[620px] sm:flex-1">
            <SearchBox size="compact" defaultWhat={search.what} defaultWhere={search.where} />
          </div>
        ) : null}
        <div className="ml-auto flex items-center gap-3">
          <DemoChip />
          <ThemeToggle initial={theme} />
          {viewer ? (
            <>
              <span className="hidden sm:inline">
                <UsageLabel viewer={viewer} />
              </span>
              <AccountMenu name={viewer.name} email={viewer.email} plan={viewer.plan} />
            </>
          ) : (
            <>
              <Link
                href={signInNext ? `/login?next=${encodeURIComponent(signInNext)}` : "/login"}
                className="rounded-full px-2 text-sm font-medium text-text-2 hover:text-text"
              >
                Sign in
              </Link>
              <ButtonLink href="/signup" size="md" className="hidden sm:inline-flex">
                Get started
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
