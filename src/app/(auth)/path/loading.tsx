export default function PathLoading() {
  return (
    <main className="px-4 py-6 md:px-8 animate-pulse">
      <div className="mx-auto max-w-lg">
        <div className="h-8 w-48 bg-muted rounded-xl mx-auto mb-2" />
        <div className="h-4 w-64 bg-muted rounded-xl mx-auto mb-8" />
        <div className="rounded-3xl bg-muted h-28 mb-4" />
        <div className="flex flex-col items-center gap-6 py-4">
          {[80, 64, 64, 64, 64].map((size, i) => (
            <div
              key={i}
              className="rounded-full bg-muted"
              style={{ width: size, height: size }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
