import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UiShowcase } from "@/components/UiShowcase";

export const metadata: Metadata = { title: "UI primitives", robots: { index: false } };

/** Hidden page listing every primitive in every state. Not linked anywhere; off in production. */
export default function DevUiPage() {
  if (process.env.NODE_ENV === "production" && process.env.SITEFORGE_DEV_UI !== "1") notFound();
  return <UiShowcase />;
}
