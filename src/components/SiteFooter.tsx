import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-surface-2 text-sm text-text-2">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <span>SiteForge · websites for local businesses</span>
        <nav aria-label="Footer" className="flex flex-wrap gap-6">
          <Link href="/pricing" className="hover:text-text">Pricing</Link>
          <Link href="/login" className="hover:text-text">Sign in</Link>
          <Link href="/signup" className="hover:text-text">Create account</Link>
        </nav>
      </div>
    </footer>
  );
}
