export default function ProfileLoading() {
  return (
    <main className="px-4 py-6 md:px-8 animate-pulse">
      <div className="mx-auto max-w-lg space-y-5">
        <div className="rounded-3xl bg-muted h-40" />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-muted h-24" />
          <div className="rounded-2xl bg-muted h-24" />
          <div className="rounded-2xl bg-muted h-24" />
          <div className="rounded-2xl bg-muted h-24" />
        </div>
        <div className="rounded-2xl bg-muted h-20" />
      </div>
    </main>
  );
}
