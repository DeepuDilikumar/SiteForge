"use client";

import { useRouter } from "next/navigation";
import { Chip } from "@/components/ui/Chip";
import { searchHref } from "@/components/ui/SearchBox";

export const SUGGESTIONS = [
  { what: "Bakeries", where: "Trivandrum" },
  { what: "Plumbers", where: "Kochi" },
  { what: "Salons", where: "Bangalore" },
  { what: "Dentists", where: "Austin" },
];

export function SuggestionChips({ className = "", align = "center" }: { className?: string; align?: "center" | "start" }) {
  const router = useRouter();
  return (
    <div className={`flex flex-wrap gap-2 ${align === "center" ? "justify-center" : ""} ${className}`}>
      {SUGGESTIONS.map((suggestion) => (
        <Chip key={suggestion.what} icon="search" onClick={() => router.push(searchHref(suggestion.what, suggestion.where))}>
          {suggestion.what} in {suggestion.where}
        </Chip>
      ))}
    </div>
  );
}
