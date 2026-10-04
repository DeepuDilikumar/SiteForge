import type { Metadata } from "next";
import { CheckoutSuccess } from "@/components/CheckoutSuccess";
import { requireUser } from "@/lib/auth";
import { safeNext } from "@/lib/next-path";

export const metadata: Metadata = { title: "You're on Pro" };

export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const query = await searchParams;
  await requireUser("/dashboard");
  const next = safeNext(typeof query.next === "string" ? query.next : null);
  const separator = next.includes("?") ? "&" : "?";
  return <CheckoutSuccess next={`${next}${separator}upgraded=1`} />;
}
