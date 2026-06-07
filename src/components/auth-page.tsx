"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "signup" | "reset";

type AuthPageProps = {
  mode: Mode;
};

export function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const isReset = mode === "reset";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (isLogin) {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
      return;
    }

    if (isSignup) {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        setLoading(false);
        return;
      }

      setMessage(
        data.session
          ? "Account created. Redirecting to the dashboard..."
          : "Check your inbox to confirm your account before signing in.",
      );

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setLoading(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/update-password`,
      },
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setMessage("Password reset link sent. Check your inbox to continue.");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative flex items-end overflow-hidden bg-slate-950 text-white">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(7, 18, 36, 0.2) 0%, rgba(7, 18, 36, 0.55) 45%, rgba(7, 18, 36, 0.88) 100%), url('https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1600&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_34%),linear-gradient(135deg,rgba(11,22,43,0.15),transparent_50%)]" />
          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-3 self-start rounded-full bg-white/95 px-3 py-2 text-slate-950 shadow-lg shadow-black/10 backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-none stroke-current stroke-[1.8]"
                >
                  <rect x="3" y="7" width="13" height="8" rx="2" />
                  <path d="M16 10h2.5l2.5 2.5V15h-5" />
                  <circle cx="7" cy="17" r="1.8" />
                  <circle cx="17" cy="17" r="1.8" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight">
                  FleetOps Pro
                </p>
                <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">
                  Operations console
                </p>
              </div>
            </div>

            <div className="max-w-xl pb-8 pt-16 sm:pb-14 lg:pb-20">
              <p className="mb-4 text-xs uppercase tracking-[0.38em] text-white/70">
                Fleet intelligence
              </p>
              <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Precision in Motion.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                Manage fleet access, track operational readiness, and keep
                authentication aligned with the same clean interface across sign
                in and sign up.
              </p>

              <div className="mt-10 grid max-w-md gap-3 sm:grid-cols-3">
                {[
                  ["Live", "System status"],
                  ["24/7", "Access control"],
                  ["SOC 2", "Ready posture"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-sm"
                  >
                    <div className="text-lg font-semibold text-white">
                      {value}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/65">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-white/80">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              All systems operational
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md rounded-4xl border border-slate-200/80 bg-white px-6 py-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:px-8 sm:py-10">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500">
                {isLogin
                  ? "Sign in"
                  : isSignup
                    ? "Create account"
                    : "Reset password"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {isLogin ? "Sign In" : isSignup ? "Sign Up" : "Forgot Password"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {isLogin
                  ? "Enter your credentials to access the fleet management dashboard."
                  : isSignup
                    ? "Create a FleetOps Pro account to get started with secure access."
                    : "Enter your email address and we will send a password reset link."}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isSignup ? (
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                    Full Name
                  </span>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    type="text"
                    placeholder="Alex Morgan"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    required={isSignup}
                  />
                </label>
              ) : null}

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                  Work Email
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder="name@company.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  required
                />
              </label>

              {isReset ? null : (
                <label className="block space-y-2">
                  <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                    <span>Password</span>
                    {isLogin ? (
                      <Link
                        href="/forgot-password"
                        className="normal-case tracking-normal text-blue-700 hover:text-blue-900"
                      >
                        Forgot password?
                      </Link>
                    ) : null}
                  </span>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    required
                    minLength={6}
                  />
                </label>
              )}

              {isLogin ? (
                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                  />
                  Keep me signed in for 30 days
                </label>
              ) : null}

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                    ? "Sign In"
                    : isSignup
                      ? "Create Account"
                      : "Send Reset Link"}
              </button>
            </form>

            <div className="my-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
              <span>
                {isLogin
                  ? "Don’t have an account?"
                  : isSignup
                    ? "Already have an account?"
                    : "Remembered your password?"}
              </span>{" "}
              <Link
                href={isLogin ? "/signup" : "/login"}
                className="font-semibold text-blue-700 hover:text-blue-900"
              >
                {isLogin ? "Request Access" : "Sign In"}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
