"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";

type SearchBoxProps = {
  size?: "hero" | "compact";
  defaultWhat?: string;
  defaultWhere?: string;
  autoFocus?: boolean;
  onSearch?: (what: string, where: string) => void;
};

export function searchHref(what: string, where: string) {
  return `/search?${new URLSearchParams({ what: what.trim(), where: where.trim() }).toString()}`;
}

/**
 * The signature search pill: "What" and "Where" inside one rounded field.
 * Flat with a border at rest; lifts with a soft shadow on hover and focus.
 * On narrow screens the two fields stack inside one rounded container.
 */
export function SearchBox({ size = "hero", defaultWhat = "", defaultWhere = "", autoFocus, onSearch }: SearchBoxProps) {
  const router = useRouter();
  const [what, setWhat] = useState(defaultWhat);
  const [where, setWhere] = useState(defaultWhere);
  const [missing, setMissing] = useState<"what" | "where" | null>(null);
  const hero = size === "hero";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!what.trim()) return setMissing("what");
    if (!where.trim()) return setMissing("where");
    setMissing(null);
    if (onSearch) onSearch(what.trim(), where.trim());
    else router.push(searchHref(what, where));
  };

  const fieldClass = `min-w-0 flex-1 bg-transparent text-text placeholder:text-text-2 outline-none ${hero ? "text-base" : "text-base"}`;

  return (
    <form role="search" onSubmit={submit} className="w-full" noValidate>
      <div
        className={`group flex w-full flex-col border border-border bg-bg transition-[box-shadow,border-color] duration-200 ease-standard hover:border-transparent hover:shadow-search focus-within:border-transparent focus-within:shadow-search sm:flex-row sm:items-center ${
          hero ? "rounded-[28px] p-1 sm:h-16 sm:rounded-full" : "rounded-[24px] sm:h-12 sm:rounded-full"
        }`}
      >
        <label className={`flex items-center gap-3 ${hero ? "h-14 pl-5 sm:h-full" : "h-12 pl-4 sm:h-full"} pr-4 sm:flex-[1.2]`}>
          <Icon name="search" className="text-text-2" />
          <span className="sr-only">What</span>
          <input
            name="what"
            value={what}
            onChange={(event) => setWhat(event.target.value)}
            placeholder="plumbers, bakeries, salons…"
            autoComplete="off"
            autoFocus={autoFocus}
            aria-invalid={missing === "what" || undefined}
            className={fieldClass}
          />
        </label>
        <span aria-hidden="true" className="mx-4 h-px bg-border sm:mx-0 sm:h-6 sm:w-px" />
        <div className={`flex items-center gap-3 ${hero ? "h-14 pl-5 sm:h-full sm:pl-4" : "h-12 pl-4 sm:h-full sm:pl-4"} pr-2 sm:flex-1`}>
          <label className="flex min-w-0 flex-1 items-center gap-3">
            <Icon name="location_on" className="text-text-2" />
            <span className="sr-only">Where</span>
            <input
              name="where"
              value={where}
              onChange={(event) => setWhere(event.target.value)}
              placeholder="Trivandrum, Austin…"
              autoComplete="off"
              aria-invalid={missing === "where" || undefined}
              className={fieldClass}
            />
          </label>
          <button
            type="submit"
            aria-label="Search"
            title="Search"
            className={`inline-flex flex-none items-center justify-center rounded-full bg-ink text-on-ink transition-[background-color,transform,opacity] duration-200 ease-standard hover:bg-ink-hover active:scale-[0.94] ${
              what.trim() && where.trim() ? "opacity-100" : "opacity-60"
            } ${hero ? "h-12 w-12" : "h-9 w-9"}`}
          >
            <Icon name="arrow_upward" size={hero ? 24 : 20} />
          </button>
        </div>
      </div>
      {missing ? (
        <p role="alert" className="mt-2 px-5 text-sm text-danger">
          {missing === "what" ? "Add a type of business, like bakeries or plumbers." : "Add a city or area."}
        </p>
      ) : null}
    </form>
  );
}
