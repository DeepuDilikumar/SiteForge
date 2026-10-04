import type { ReactNode } from "react";
import { LogoLink } from "@/components/ui/Logo";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-surface px-4 py-12 sm:bg-bg">
      <div className="w-full max-w-[448px] rounded-lg bg-bg px-6 py-12 sm:border sm:border-border sm:px-12">
        <div className="text-center">
          <LogoLink />
          <h1 className="mt-6 text-xl font-normal text-text">{title}</h1>
          <p className="mt-2 text-base text-text-2">{subtitle}</p>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
