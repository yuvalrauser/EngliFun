import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 bg-gradient-to-b from-primary/5 to-background">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/owl.png"
        alt="EngliFun Owl"
        width={160}
        height={160}
        className="drop-shadow-lg"
      />
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary">EngliFun</h1>
        <p className="mt-3 text-xl text-muted-foreground">
          למד אנגלית בכיף — בעברית!
        </p>
      </div>
      <div className="flex gap-4 mt-2">
        <Link
          href="/register"
          className="rounded-2xl bg-primary px-8 py-3.5 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          הרשמה חינם
        </Link>
        <Link
          href="/login"
          className="rounded-2xl border-2 border-border px-8 py-3.5 text-lg font-semibold transition-all hover:bg-muted active:scale-[0.98]"
        >
          התחברות
        </Link>
      </div>
    </main>
  );
}
