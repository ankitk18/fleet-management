import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
        <p className="mb-4 text-xs uppercase tracking-[0.38em] text-white/60">
          FleetOps Pro
        </p>
        <h1 className="max-w-2xl text-5xl font-semibold tracking-tight sm:text-6xl">
          Secure fleet access for modern operations teams.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
          Use the login and signup screens to authenticate with Supabase and
          enter the fleet management dashboard.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Open Dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Create Account
          </Link>
        </div>
      </main>
    </div>
  );
}
