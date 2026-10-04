import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { AuthForm } from "@/components/AuthForm";
import { getSessionUser } from "@/lib/auth";
import { safeNext } from "@/lib/next-path";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;
  const destination = safeNext(typeof next === "string" ? next : null);
  if (await getSessionUser()) redirect(destination);
  return (
    <AuthCard title="Create your account" subtitle="Free to start. The free plan includes one new site a month.">
      <AuthForm mode="signup" next={destination} />
    </AuthCard>
  );
}
