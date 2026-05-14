"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/userStore";
import type { Profile } from "@/types/database";

interface AuthProviderProps {
  children: React.ReactNode;
  initialProfile?: Profile | null;
}

export function AuthProvider({ children, initialProfile = null }: AuthProviderProps) {
  const router = useRouter();
  const { setProfile, setLoading } = useUserStore();
  const hydratedRef = useRef(false);

  // Hydrate Zustand once with the server-fetched profile so the header pills
  // render real XP/streak on the first paint.
  if (!hydratedRef.current) {
    hydratedRef.current = true;
    useUserStore.setState({ profile: initialProfile, isLoading: false });
  }

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) setProfile(profile as Profile);
      setLoading(false);
    }

    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_OUT") {
          setProfile(null);
          router.push("/login");
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();
            setProfile(profile as Profile | null);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setProfile, setLoading, router]);

  return <>{children}</>;
}
