export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-skeleton rounded-sm bg-surface-2 ${className}`} />;
}
