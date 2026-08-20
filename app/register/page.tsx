"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Scale,
  ShieldCheck,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { register } from "@/app/register/actions";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const passwordRequirements = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Contains an uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Contains a number",
      valid: /\d/.test(password),
    },
  ];

  const passwordStrength =
    password.length === 0
      ? 0
      : password.length >= 8 &&
          /[A-Z]/.test(password) &&
          /\d/.test(password)
        ? 3
        : password.length >= 6
          ? 2
          : 1;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (passwordStrength < 3) {
      return;
    }

    setLoading(true);

    const formData = new FormData(event.currentTarget);

    await register(formData);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Branding panel */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 lg:flex">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-blue-800">
                <Scale size={23} />
              </div>

              <div>
                <p className="font-bold text-white">
                  Legal Aid
                </p>

                <p className="text-xs text-blue-200">
                  Access to Justice
                </p>
              </div>
            </Link>

            {/* Content */}
            <div className="max-w-lg">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-blue-100">
                <UserPlus size={16} />
                Create your client account
              </div>

              <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Get started with Legal Aid.
              </h1>

              <p className="mt-6 text-lg leading-8 text-blue-100">
                Create your account to register a legal matter, securely
                submit documents, and keep track of your case.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Register your legal matter online",
                  "Upload supporting documents securely",
                  "Track your case status",
                  "Receive updates from legal officers",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-blue-100"
                  >
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-white/10">
                      <Check size={14} />
                    </div>

                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-blue-200">
              <ShieldCheck size={15} />
              Your information is handled securely.
            </div>
          </div>
        </section>

        {/* Registration panel */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-3"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 text-white">
                  <Scale size={21} />
                </div>

                <div>
                  <p className="font-bold text-gray-900">
                    Legal Aid
                  </p>

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
              {/* Header */}
              <div>
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <UserPlus size={23} />
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Register as a client to request legal assistance and
                  track your cases.
                </p>
              </div>

              {/* Form */}
              <form
                action={register}
                onSubmit={handleSubmit}
                className="mt-6 space-y-5"
              >
                {/* Full name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

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
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Create a secure password"
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

                  {/* Password strength */}
                  {password.length > 0 && (
                    <div className="mt-3">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full ${
                              level <= passwordStrength
                                ? passwordStrength === 3
                                  ? "bg-green-500"
                                  : passwordStrength === 2
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        {passwordStrength === 3
                          ? "Strong password"
                          : passwordStrength === 2
                            ? "Password could be stronger"
                            : "Weak password"}
                      </p>
                    </div>
                  )}

                  {/* Requirements */}
                  <div className="mt-3 space-y-2">
                    {passwordRequirements.map((requirement) => (
                      <div
                        key={requirement.label}
                        className="flex items-center gap-2 text-xs"
                      >
                        {requirement.valid ? (
                          <CheckCircle2
                            size={14}
                            className="text-green-600"
                          />
                        ) : (
                          <X
                            size={14}
                            className="text-gray-400"
                          />
                        )}

                        <span
                          className={
                            requirement.valid
                              ? "text-green-700"
                              : "text-gray-500"
                          }
                        >
                          {requirement.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || passwordStrength < 3}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create client account
                      <ArrowLeft
                        size={17}
                        className="rotate-180"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Login */}
              <div className="mt-6 border-t border-gray-100 pt-6">
                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Privacy notice */}
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <p className="text-xs leading-5 text-gray-500">
                  By creating an account, you agree to provide accurate
                  information. Your information will be used to process
                  and manage your legal assistance request.
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