import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <AuthForm mode="register" />
        </div>

        <section className="order-1 relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-xl sm:p-10 lg:order-2 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.18),transparent_36%)]" />
          <div className="relative max-w-2xl">
            <div className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
              New workspace user
            </div>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">Create your account.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">Register once, then jump into the dashboard.</p>

            <p className="mt-8 text-sm text-slate-400">
              Already have access? <Link href="/login" className="font-medium text-cyan-300 hover:text-cyan-200">Return to login</Link>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}