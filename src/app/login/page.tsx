"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-margin-mobile md:px-margin-desktop py-24">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link href="/" className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-black text-error italic tracking-tighter">
            PMD
          </Link>
          <h1 className="font-headline-lg text-headline-lg-mobile mt-8 text-on-background">
            SIGN IN
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
            Access your orders, addresses, and profile.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border border-error/30 bg-error-container/20 text-error font-body-sm text-body-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="login-email"
              className="font-accent-label text-accent-label text-on-surface-variant"
            >
              EMAIL
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container-highest text-on-surface px-4 py-3 font-body-md text-body-sm outline-none focus:border-error transition-colors duration-200 placeholder:text-on-surface-variant/40"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="login-password"
              className="font-accent-label text-accent-label text-on-surface-variant"
            >
              PASSWORD
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container-highest text-on-surface px-4 py-3 font-body-md text-body-sm outline-none focus:border-error transition-colors duration-200 placeholder:text-on-surface-variant/40"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-on-surface text-surface py-4 font-button-text text-button-text tracking-wider hover:bg-error hover:text-primary-container transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between px-6 mt-4 group"
          >
            <span>{isLoading ? "SIGNING IN..." : "SIGN IN"}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:translate-x-1 transition-transform duration-200"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-error hover:text-on-surface border-b border-error/40 hover:border-on-surface transition-colors duration-200"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Decorative Bottom Border */}
        <div className="mt-16 border-t border-surface-container-highest pt-8 text-center">
          <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant/50">
            PRESSURE MAKES DIAMONDS
          </p>
        </div>
      </div>
    </main>
  );
}
