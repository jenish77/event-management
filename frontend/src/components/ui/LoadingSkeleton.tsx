export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3.5 bg-slate-200 rounded w-1/2"></div>
        <div className="h-3.5 bg-slate-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function EventListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}
