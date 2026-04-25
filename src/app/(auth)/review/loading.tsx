export default function ReviewLoading() {
  return (
    <main className="px-4 py-6 md:px-8 animate-pulse">
      <div className="mx-auto max-w-lg">
        <div className="h-8 w-48 bg-muted rounded-xl mx-auto mb-6" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted h-20" />
          ))}
        </div>
      </div>
    </main>
  );
}
