import Link from "next/link";

export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="var(--accent)" d="M12 2.5l2.3 6.9 7.2 2.6-7.2 2.6L12 21.5l-2.3-6.9L2.5 12l7.2-2.6z" />
      <circle cx="19.5" cy="4.5" r="1.6" fill="var(--accent)" />
    </svg>
  );
}

export function Wordmark({ size = "md" }: { size?: "md" | "lg" | "xl" }) {
  const text = size === "xl" ? "text-[56px] leading-none sm:text-[72px]" : size === "lg" ? "text-xl" : "text-lg";
  const mark = size === "xl" ? 48 : size === "lg" ? 28 : 24;
  return (
    <span className={`inline-flex items-center gap-2 font-medium tracking-tight text-text ${text}`}>
      <LogoMark size={mark} />
      SiteForge
    </span>
  );
}

export function LogoLink({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-4" aria-label="SiteForge home">
      <Wordmark />
    </Link>
  );
}
