import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { AuthForm } from "@/components/AuthForm";
import { getSessionUser } from "@/lib/auth";
import { safeNext } from "@/lib/next-path";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const destination = safeNext(typeof next === "string" ? next : null);
  if (await getSessionUser()) redirect(destination);
  return (
    <AuthCard title="Sign in" subtitle="Continue to SiteForge">
      <AuthForm mode="login" next={destination} />
    </AuthCard>
  );
}
