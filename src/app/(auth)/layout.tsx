import { AuthProvider } from "@/components/providers/auth-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side profile fetch so the header XP/streak pills are correct on the
  // first paint, instead of flashing 0/0 until AuthProvider's effect runs.
  let initialProfile: Profile | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      initialProfile = (data as Profile) ?? null;
    }
  } catch (e) {
    console.error("AuthLayout profile prefetch failed:", e);
  }

  return (
    <AuthProvider initialProfile={initialProfile}>
      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
          <BottomNav />
        </div>
      </div>
    </AuthProvider>
  );
}
