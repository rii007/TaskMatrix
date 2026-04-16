"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { AuthUser, DEMO_SESSION_COOKIE, DEMO_SESSION_STORAGE_KEY, useAuthStore } from "@/store/auth-store";

function toProfile(user: Awaited<ReturnType<ReturnType<typeof getBrowserSupabaseClient>["auth"]["getUser"]>>["data"]["user"]): AuthUser | null {
  if (!user) {
    return null;
  }

  return {
    uid: user.id,
    name: (user.user_metadata?.full_name as string | undefined)?.trim() || user.email?.split("@")[0] || "Member",
    email: user.email ?? ""
  };
}

function readDemoUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const hasCookie = document.cookie.split("; ").some((cookie) => cookie.startsWith(`${DEMO_SESSION_COOKIE}=`));

  if (!hasCookie) {
    return null;
  }

  const rawUser = window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const setHydrated = useAuthStore((state) => state.setHydrated);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function syncUser() {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        const demoUser = readDemoUser();

        if (demoUser) {
          setUser(demoUser);
        } else {
          clearUser();
        }

        setHydrated(true);
        return;
      }

      const { data } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      const profile = toProfile(data.user);

      if (profile) {
        setUser(profile);
      } else {
        const demoUser = readDemoUser();

        if (demoUser) {
          setUser(demoUser);
        } else {
          clearUser();
        }
      }

      setHydrated(true);
    }

    syncUser();

    return () => {
      isActive = false;
    };
  }, [clearUser, setHydrated, setUser]);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
          document.cookie = `${DEMO_SESSION_COOKIE}=; path=/; max-age=0`;
        }
        clearUser();
        router.push("/login");
        router.refresh();
        return;
      }

      await supabase.auth.signOut();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
        document.cookie = `${DEMO_SESSION_COOKIE}=; path=/; max-age=0`;
      }
      clearUser();
      router.push("/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-300">User details are loaded from Zustand after login.</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSigningOut ? "Signing out..." : "Log out"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Name</p>
              <p className="mt-1 text-sm text-white">{user?.name ?? "Loading..."}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Email</p>
              <p className="mt-1 break-all text-sm text-white">{user?.email ?? "Loading..."}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">UID</p>
              <p className="mt-1 break-all text-sm text-white">{user?.uid ?? "Loading..."}</p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">Status</h2>
          <p className="mt-2 text-sm text-slate-300">
            {hydrated ? "Session synced and dashboard is protected." : "Syncing your session..."}
          </p>
        </section>
      </div>
    </main>
  );
}