import { Skeleton } from "@/components/ui/Skeleton";

export default function SiteLoading() {
  return (
    <div className="flex h-dvh flex-col" aria-busy="true" aria-label="Loading site">
      <div className="flex h-16 items-center gap-4 border-b border-border px-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="ml-auto h-10 w-36 rounded-full" />
      </div>
      <div className="flex-1 bg-surface p-4">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    </div>
  );
}
