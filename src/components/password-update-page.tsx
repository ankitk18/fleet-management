"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function PasswordUpdatePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated. Redirecting to sign in...");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white sm:px-10 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <div className="w-full rounded-4xl border border-white/10 bg-white/6 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-10">
          <p className="text-xs uppercase tracking-[0.38em] text-white/55">
            FleetOps Pro
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            Set a new password
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Choose a new password to complete your account recovery.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
                New password
              </span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                minLength={6}
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-white/8 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/30 focus:bg-white/12"
                placeholder="Enter a new password"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
                Confirm password
              </span>
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                minLength={6}
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-white/8 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/30 focus:bg-white/12"
                placeholder="Repeat the new password"
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-white/65">
            <Link
              href="/login"
              className="font-semibold text-white hover:text-white/80"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
