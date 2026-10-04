import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <div className="h-16 border-b border-border" />
      <div className="mx-auto max-w-[960px] px-4 pt-8">
        <Skeleton className="mx-auto h-16 max-w-[720px] rounded-full" />
        <Skeleton className="mt-12 h-7 w-32" />
        <Skeleton className="mt-4 h-11 w-96 max-w-full rounded-full" />
        <div className="mt-4 rounded-xl border border-border">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
              <Skeleton className="h-16 w-28" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="mt-2 h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
