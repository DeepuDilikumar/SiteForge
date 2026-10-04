"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";

const REDIRECT_MS = 2000;

export function CheckoutSuccess({ next }: { next: string }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => router.replace(next), REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [next, router]);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Icon name="check_circle" filled size={48} className="text-success" />
      <h1 className="mt-6 text-2xl font-normal text-text">You&apos;re on Pro</h1>
      <p className="mt-2 text-base text-text-2">Taking you back to where you were…</p>
      <Link href={next} className="mt-6 rounded-full px-4 py-2 text-sm font-medium text-accent hover:bg-accent-soft">
        Continue now
      </Link>
    </main>
  );
}
