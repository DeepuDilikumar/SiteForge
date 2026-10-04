"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

const MESSAGES: Record<string, string> = {
  upgraded: "You're on Pro.",
  built: "Site built",
};

/** One-off confirmations passed in the URL (e.g. after checkout). Shown once, then removed from the address bar. */
export function QueryToasts() {
  const params = useSearchParams();
  const toast = useToast();
  useEffect(() => {
    const key = Object.keys(MESSAGES).find((name) => params.get(name) === "1");
    if (!key) return;
    toast(MESSAGES[key]);
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    window.history.replaceState(window.history.state, "", url);
  }, [params, toast]);
  return null;
}
