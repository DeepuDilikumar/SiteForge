import { ButtonLink } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Wordmark size="lg" />
      <h1 className="mt-8 text-2xl font-normal text-text">This page doesn&apos;t exist</h1>
      <p className="mt-2 max-w-[420px] text-base text-text-2">
        The link may be old, or the item may have been removed. Start again from search or your dashboard.
      </p>
      <div className="mt-8 flex gap-2">
        <ButtonLink href="/" variant="outlined">Search</ButtonLink>
        <ButtonLink href="/dashboard">Dashboard</ButtonLink>
      </div>
    </main>
  );
}
