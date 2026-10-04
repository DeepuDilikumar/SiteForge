import { Skeleton } from "@/components/ui/Skeleton";

export default function BuildLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="h-16 border-b border-border" />
      <div className="mx-auto max-w-[1120px] px-4 pt-8">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-4 h-40 w-full rounded-xl" />
        <Skeleton className="mt-12 h-7 w-48" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
