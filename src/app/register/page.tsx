"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Frontend-only email confirmation (prevents typos)
    if (email !== confirmEmail) {
      setError("Email addresses don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Auto sign-in after registration (register-and-go flow)
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed — redirect to login
        router.push("/login");
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
            CREATE ACCOUNT
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
            Join PMD. Fast checkout, order tracking, saved addresses.
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
              htmlFor="register-name"
              className="font-accent-label text-accent-label text-on-surface-variant"
            >
              FULL NAME
            </label>
            <input
              id="register-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container-highest text-on-surface px-4 py-3 font-body-md text-body-sm outline-none focus:border-error transition-colors duration-200 placeholder:text-on-surface-variant/40"
              placeholder="Your full name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="register-email"
              className="font-accent-label text-accent-label text-on-surface-variant"
            >
              EMAIL
            </label>
            <input
              id="register-email"
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
              htmlFor="register-confirm-email"
              className="font-accent-label text-accent-label text-on-surface-variant"
            >
              CONFIRM EMAIL
            </label>
            <input
              id="register-confirm-email"
              type="email"
              required
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container-highest text-on-surface px-4 py-3 font-body-md text-body-sm outline-none focus:border-error transition-colors duration-200 placeholder:text-on-surface-variant/40"
              placeholder="Confirm your email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="register-password"
              className="font-accent-label text-accent-label text-on-surface-variant"
            >
              PASSWORD
            </label>
            <input
              id="register-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container-highest text-on-surface px-4 py-3 font-body-md text-body-sm outline-none focus:border-error transition-colors duration-200 placeholder:text-on-surface-variant/40"
              placeholder="Min. 8 characters"
            />
            <p className="font-body-sm text-[12px] text-on-surface-variant/60">
              Must be at least 8 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-on-surface text-surface py-4 font-button-text text-button-text tracking-wider hover:bg-error hover:text-primary-container transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between px-6 mt-4 group"
          >
            <span>{isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</span>
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

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-error hover:text-on-surface border-b border-error/40 hover:border-on-surface transition-colors duration-200"
            >
              Sign in
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
