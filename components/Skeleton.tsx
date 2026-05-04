export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#1e2740] bg-[#0f1420] p-5 space-y-3">
      <div className="skeleton h-10 w-10 rounded-lg" />
      <div className="skeleton h-4 w-2/3 rounded" />
      <div className="skeleton h-3 w-1/3 rounded" />
      <div className="skeleton h-3 w-full rounded" />
    </div>
  );
}

export function SkeletonBug() {
  return (
    <div className="rounded-xl border border-[#1e2740] bg-[#0f1420] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-16 w-full rounded-lg" />
    </div>
  );
}
