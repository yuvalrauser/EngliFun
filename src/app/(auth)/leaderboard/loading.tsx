export default function LeaderboardLoading() {
  return (
    <main className="px-4 py-6 md:px-8 animate-pulse">
      <div className="mx-auto max-w-lg">
        <div className="h-8 w-40 bg-muted rounded-xl mx-auto mb-6" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted h-16" />
          ))}
        </div>
      </div>
    </main>
  );
}
