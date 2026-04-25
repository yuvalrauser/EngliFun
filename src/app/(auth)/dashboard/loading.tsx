export default function DashboardLoading() {
  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-lg space-y-5 animate-pulse">
        {/* Greeting skeleton */}
        <div className="rounded-3xl bg-muted h-28" />
        {/* CTA skeleton */}
        <div className="rounded-3xl bg-muted h-24" />
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-muted h-24" />
          <div className="rounded-2xl bg-muted h-24" />
          <div className="rounded-2xl bg-muted h-24" />
        </div>
        {/* Level skeleton */}
        <div className="rounded-2xl bg-muted h-20" />
        {/* Progress skeleton */}
        <div className="rounded-2xl bg-muted h-16" />
      </div>
    </main>
  );
}
