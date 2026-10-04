"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { SearchResult } from "@/app/api/search/route";
import { SignupDialog } from "@/components/SignupDialog";
import { SuggestionChips } from "@/components/SuggestionChips";
import { WebsiteBadge } from "@/components/WebsiteBadge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Result } from "@/lib/result";

type Filter = "none" | "social" | "all";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "none", label: "No website" },
  { id: "social", label: "Social page only" },
  { id: "all", label: "All" },
];

function matches(result: SearchResult, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "social") return result.websiteStatus === "social_only";
  return result.websiteStatus === "none";
}

function countLine(count: number, filter: Filter) {
  const noun = count === 1 ? "business" : "businesses";
  if (filter === "none") return `${count} ${noun} without a website`;
  if (filter === "social") return `${count} ${noun} with only a social page`;
  return `${count} ${noun}`;
}

/** Neighbourhood and city, skipping door numbers and cross-street lines. */
function shortAddress(address: string) {
  const parts = address.split(",").map((part) => part.trim());
  const useful = parts.filter((part) => !/^\d+$|^TC\s|\d+(st|nd|rd|th) Cross/i.test(part));
  return (useful.length >= 2 ? useful : parts).slice(0, 2).join(", ");
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; results: SearchResult[] };

export function SearchResults({
  what,
  where,
  initialFilter,
  signedIn,
}: {
  what: string;
  where: string;
  initialFilter: Filter;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [pendingBuild, setPendingBuild] = useState<SearchResult | null>(null);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const response = await fetch(`/api/search?${new URLSearchParams({ what, where })}`);
      const body = (await response.json()) as Result<SearchResult[]>;
      if (body.ok) setState({ status: "ready", results: body.data });
      else setState({ status: "error", message: body.error.message });
    } catch {
      setState({ status: "error", message: "We couldn't reach the server. Check your connection." });
    }
  }, [what, where]);

  useEffect(() => {
    if (!what || !where) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount and when the query changes
    void load();
  }, [load, what, where]);

  const changeFilter = (next: Filter) => {
    setFilter(next);
    const params = new URLSearchParams({ what, where });
    if (next !== "none") params.set("filter", next);
    router.replace(`/search?${params}`, { scroll: false });
  };

  const build = (result: SearchResult) => {
    if (signedIn) router.push(`/build/${result.id}`);
    else setPendingBuild(result);
  };

  if (!what || !where) {
    return (
      <div className="mx-auto max-w-[720px] pt-12 text-center">
        <h1 className="text-xl font-normal text-text">Search for a type of business and a city</h1>
        <p className="mt-2 text-base text-text-2">For example, bakeries in Trivandrum.</p>
        <SuggestionChips className="mt-6" />
      </div>
    );
  }

  const visible = state.status === "ready" ? state.results.filter((result) => matches(result, filter)) : [];

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="flex flex-wrap gap-2 pt-4" role="group" aria-label="Filter by website status">
        {FILTERS.map((item) => (
          <Chip key={item.id} selected={filter === item.id} onClick={() => changeFilter(item.id)}>
            {item.label}
          </Chip>
        ))}
      </div>

      {state.status === "loading" ? (
        <div aria-busy="true" aria-label="Loading results">
          <Skeleton className="mt-6 h-5 w-56" />
          <ul className="mt-4">
            {Array.from({ length: 6 }, (_, index) => (
              <li key={index} className="flex items-center gap-4 border-b border-border py-6">
                <div className="flex-1">
                  <Skeleton className="h-6 w-64 max-w-full" />
                  <Skeleton className="mt-2 h-4 w-48" />
                  <Skeleton className="mt-2 h-4 w-72 max-w-full" />
                </div>
                <Skeleton className="h-10 w-28 rounded-full" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {state.status === "error" ? (
        <div role="alert" className="mt-8 flex flex-col items-start gap-4 rounded-lg border border-border p-6 sm:flex-row sm:items-center">
          <Icon name="error" className="text-danger" />
          <div className="flex-1">
            <p className="text-base text-text">We couldn&apos;t load results for {what} in {where}.</p>
            <p className="mt-1 text-sm text-text-2">{state.message}</p>
          </div>
          <Button variant="tonal" icon="refresh" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : null}

      {state.status === "ready" ? (
        <>
          <p className="mt-6 text-sm text-text-2" aria-live="polite">
            {state.results.length === 0 ? "No results" : countLine(visible.length, filter)}
          </p>
          {state.results.length === 0 ? (
            <EmptyResults what={what} where={where} />
          ) : visible.length === 0 ? (
            <div className="mt-8 rounded-lg border border-border p-6">
              <p className="text-base text-text">Every business in this search has a website or social page.</p>
              <p className="mt-1 text-sm text-text-2">Try a nearby area or a different type of business.</p>
              <Button variant="tonal" className="mt-4" onClick={() => changeFilter("all")}>
                Show all {state.results.length}
              </Button>
            </div>
          ) : (
            <ul className="mt-2">
              {visible.map((result) => (
                <ResultRow key={result.id} result={result} onBuild={() => build(result)} />
              ))}
            </ul>
          )}
        </>
      ) : null}

      <SignupDialog business={pendingBuild} onClose={() => setPendingBuild(null)} />
    </div>
  );
}

function ResultRow({ result, onBuild }: { result: SearchResult; onBuild: () => void }) {
  return (
    <li className="flex flex-col gap-4 border-b border-border py-6 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-lg font-normal text-text">{result.name}</h2>
          <WebsiteBadge status={result.websiteStatus} />
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-text-2">
          {result.rating ? (
            <span className="inline-flex items-center gap-1 text-text">
              {result.rating.toFixed(1)}
              <Icon name="star" size={16} filled className="text-[#f9ab00]" />
              <span className="text-text-2">({result.reviewCount})</span>
            </span>
          ) : (
            <span>No ratings yet</span>
          )}
          <span aria-hidden="true">·</span>
          <span>{result.category}</span>
        </p>
        <p className="mt-1 truncate text-sm text-text-2">{shortAddress(result.address)}</p>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={result.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${result.name} on Maps`}
          title="View on Maps"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-2 transition-colors duration-200 ease-standard hover:bg-surface-2 hover:text-text"
        >
          <Icon name="map" />
        </a>
        {result.websiteStatus === "has_site" && result.websiteUri ? (
          <a
            href={result.websiteUri}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${result.name}'s website`}
            title="Open their website"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-2 transition-colors duration-200 ease-standard hover:bg-surface-2 hover:text-text"
          >
            <Icon name="language" />
          </a>
        ) : null}
        <Button onClick={onBuild} className="flex-1 sm:flex-none" variant={result.websiteStatus === "has_site" ? "tonal" : "primary"}>
          Build site
        </Button>
      </div>
    </li>
  );
}

function EmptyResults({ what, where }: { what: string; where: string }) {
  return (
    <div className="mt-8">
      <p className="text-lg text-text">
        No businesses found for <em className="not-italic font-medium">{what}</em> in <em className="not-italic font-medium">{where}</em>.
      </p>
      <p className="mt-2 text-base text-text-2">Check the spelling, or try a nearby city.</p>
      <SuggestionChips className="mt-6" align="start" />
      <ButtonLink href="/" variant="text" className="mt-4" icon="arrow_back">
        Back to search
      </ButtonLink>
    </div>
  );
}
