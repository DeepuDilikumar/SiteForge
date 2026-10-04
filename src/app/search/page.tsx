import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { SearchResults } from "@/components/SearchResults";
import { getViewer } from "@/lib/viewer";

type Props = PageProps<"/search">;

function param(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { what, where } = await searchParams;
  const w = param(what);
  const p = param(where);
  return { title: w && p ? `${w} in ${p}` : "Search" };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const what = param(params.what);
  const where = param(params.where);
  const filter = param(params.filter);
  const viewer = await getViewer();
  const here = `/search?${new URLSearchParams({ what, where }).toString()}`;
  return (
    <>
      <AppHeader viewer={viewer} search={{ what, where }} signInNext={here} />
      <main className="px-4 pb-24 sm:px-6">
        <SearchResults
          key={`${what}|${where}`}
          what={what}
          where={where}
          initialFilter={filter === "social" || filter === "all" ? filter : "none"}
          signedIn={Boolean(viewer)}
        />
      </main>
    </>
  );
}
