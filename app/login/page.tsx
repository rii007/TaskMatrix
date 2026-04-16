import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-xl sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.25),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_36%)]" />
          <div className="relative max-w-2xl">
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              TaskMatrix access
            </div>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">Sign in to TaskMatrix.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">Use your account to continue to the dashboard.</p>

            <p className="mt-8 text-sm text-slate-400">
              Need an account? <Link href="/register" className="font-medium text-cyan-300 hover:text-cyan-200">Create one here</Link>.
            </p>
          </div>
        </section>

        <div className="flex justify-center lg:justify-end">
          <AuthForm mode="login" />
        </div>
      </div>
    </main>
  );
}