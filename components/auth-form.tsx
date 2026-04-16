"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { AuthUser, DEMO_SESSION_COOKIE, DEMO_SESSION_STORAGE_KEY, useAuthStore } from "@/store/auth-store";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

type DemoAccount = {
  uid: string;
  name: string;
  email: string;
  password: string;
};

const DEMO_ACCOUNTS_STORAGE_KEY = "taskmatrix_demo_accounts";

function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Authentication failed. Please try again.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "Too many sign-up attempts. Please wait a moment and try again.";
  }

  if (message.includes("already registered") || message.includes("user already registered")) {
    return "That email is already registered. Try logging in instead.";
  }

  return error.message;
}

function isRetryableSignupError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return message.includes("rate limit") || message.includes("too many requests") || message.includes("429");
}

function isInvalidLoginError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.toLowerCase().includes("invalid login credentials");
}

function createDemoSession(user: AuthUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(user));
  document.cookie = `${DEMO_SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}`;
}

function readDemoAccounts() {
  if (typeof window === "undefined") {
    return [] as DemoAccount[];
  }

  const raw = window.localStorage.getItem(DEMO_ACCOUNTS_STORAGE_KEY);

  if (!raw) {
    return [] as DemoAccount[];
  }

  try {
    return JSON.parse(raw) as DemoAccount[];
  } catch {
    return [] as DemoAccount[];
  }
}

function saveDemoAccount(account: DemoAccount) {
  if (typeof window === "undefined") {
    return;
  }

  const accounts = readDemoAccounts().filter((item) => item.email.toLowerCase() !== account.email.toLowerCase());
  accounts.push(account);
  window.localStorage.setItem(DEMO_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function findDemoAccount(email: string, password: string) {
  return readDemoAccounts().find((account) => account.email.toLowerCase() === email.toLowerCase() && account.password === password) ?? null;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const setHydrated = useAuthStore((state) => state.setHydrated);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === "register";
  const title = useMemo(() => (isRegister ? "Create your account" : "Welcome back"), [isRegister]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    const normalizedEmail = email.trim().replace(/^['\"]|['\"]$/g, "");

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getBrowserSupabaseClient();

      if (!supabase) {
        setError("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable auth.");
        return;
      }

      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        });

        if (signUpError) {
          if (!isRetryableSignupError(signUpError)) {
            throw signUpError;
          }

          const demoUser: AuthUser = {
            uid: `demo-${Date.now()}`,
            name: fullName.trim() || normalizedEmail.split("@")[0] || "Member",
            email: normalizedEmail
          };

          saveDemoAccount({ ...demoUser, password });
          createDemoSession(demoUser);
          setUser(demoUser);
          setHydrated(true);
          router.push("/dashboard");
          router.refresh();
          return;
        }

        const signedUpUser = data.user;
        const session = data.session;

        if (signedUpUser && session) {
          setUser({
            uid: signedUpUser.id,
            name: (signedUpUser.user_metadata?.full_name as string | undefined)?.trim() || fullName.trim() || normalizedEmail.split("@")[0] || "Member",
            email: signedUpUser.email ?? normalizedEmail
          });
          setHydrated(true);
          router.push("/dashboard");
          router.refresh();
          return;
        }

        clearUser();
        setFeedback("Account created. If email confirmation is enabled in Supabase, verify your inbox before logging in.");
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (signInError) {
        if (isInvalidLoginError(signInError)) {
          const demoAccount = findDemoAccount(normalizedEmail, password);

          if (demoAccount) {
            const demoUser: AuthUser = {
              uid: demoAccount.uid,
              name: demoAccount.name,
              email: demoAccount.email
            };

            createDemoSession(demoUser);
            setUser(demoUser);
            setHydrated(true);
            router.push("/dashboard");
            router.refresh();
            return;
          }
        }

        throw signInError;
      }

      const signedInUser = data.user;

      if (!signedInUser) {
        throw new Error("Login succeeded but no user session was returned.");
      }

      setUser({
        uid: signedInUser.id,
        name: (signedInUser.user_metadata?.full_name as string | undefined)?.trim() || signedInUser.email?.split("@")[0] || "Member",
        email: signedInUser.email ?? normalizedEmail
      });
      setHydrated(true);
      router.push("/dashboard");
      router.refresh();
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-glow backdrop-blur-xl sm:p-8">
      <div className="mb-8 space-y-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">{isRegister ? "Create an account to continue." : "Enter your details to continue."}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isRegister ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Name</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              type="text"
              placeholder="Ada Lovelace"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:bg-white/8"
              required
              autoComplete="name"
            />
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="name@company.com"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:bg-white/8"
            required
            autoComplete="email"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:bg-white/8"
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </label>

        {isRegister ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Confirm password</span>
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              placeholder="Repeat your password"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:bg-white/8"
              required
              autoComplete="new-password"
            />
          </label>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {feedback ? (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {feedback}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Working..." : isRegister ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        {isRegister ? "Already have an account?" : "Need an account?"}{" "}
        <Link href={isRegister ? "/login" : "/register"} className="font-medium text-cyan-300 hover:text-cyan-200">
          {isRegister ? "Log in" : "Register"}
        </Link>
      </p>
    </div>
  );
}