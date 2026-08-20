"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Scale,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { login } from "@/app/login/actions";

export default function LoginPage() {
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const error = searchParams.get("error");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);

    const formData = new FormData(event.currentTarget);

    await login(formData);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left branding panel */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 lg:flex">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-blue-800">
                <Scale size={23} />
              </div>

              <div>
                <p className="font-bold text-white">Legal Aid</p>
                <p className="text-xs text-blue-200">
                  Access to Justice
                </p>
              </div>
            </Link>

            <div className="max-w-lg">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-blue-100">
                <ShieldCheck size={16} />
                Secure client portal
              </div>

              <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Access your legal assistance account.
              </h1>

              <p className="mt-6 text-lg leading-8 text-blue-100">
                Sign in to manage your cases, submit supporting documents,
                communicate with the legal team, and track the progress of
                your legal matter.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Track your registered cases",
                  "View case status and updates",
                  "Submit required documents securely",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-blue-100"
                  >
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-white/10">
                      <ShieldCheck size={14} />
                    </div>

                    {item}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-blue-200">
              Your information is handled securely.
            </p>
          </div>
        </section>

        {/* Login panel */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 text-white">
                  <Scale size={21} />
                </div>

                <div>
                  <p className="font-bold text-gray-900">Legal Aid</p>
                  <p className="text-xs text-gray-500">
                    Access to Justice
                  </p>
                </div>
              </Link>
            </div>

            {/* Back */}
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <LockKeyhole size={23} />
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Sign in to access your Legal Aid client portal.
                </p>
              </div>

              {/* Error */}
              {error === "invalid" && (
                <div
                  role="alert"
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <p className="text-sm font-semibold text-red-800">
                    Unable to sign in
                  </p>

                  <p className="mt-1 text-sm leading-5 text-red-700">
                    The email address or password you entered is incorrect.
                    Please check your details and try again.
                  </p>
                </div>
              )}

              <form
                action={login}
                onSubmit={handleSubmit}
                className="mt-6 space-y-5"
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Password
                    </label>
                  </div>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-12 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                    </>
                  )}
                </button>
              </form>

              {/* Register */}
              <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span>Don't have a client account?</span>

                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Create account
                    <UserPlus size={15} />
                  </Link>
                </div>
              </div>

              {/* Security */}
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <p className="text-xs leading-5 text-gray-500">
                  Your login credentials are transmitted securely. Never
                  share your password with anyone.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">
              © {new Date().getFullYear()} Legal Aid. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}