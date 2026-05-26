"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
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
        setIsLoading(false);
      } else {
        // We must check if the logged in user is actually an admin!
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        
        if (session?.user?.role === "ADMIN") {
          router.push("/admin/dashboard");
          router.refresh();
        } else {
          // Force sign out if a customer logs in here
          await fetch("/api/auth/signout", { method: "POST" });
          setError("Access denied: Not an administrator");
          setIsLoading(false);
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-margin-mobile md:px-margin-desktop bg-[#0a0a0a] relative overflow-hidden">
      {/* Background styling for tactical look */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-error/20 via-background to-background"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="mb-12 text-center border-b border-surface-container-highest pb-8">
          <Link href="/" className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-black text-error italic tracking-tighter">
            PMD
          </Link>
          <div className="mt-4 inline-block border border-error/50 bg-error/10 px-3 py-1 font-accent-label text-[10px] tracking-widest text-error">
            SECURE ADMIN PORTAL
          </div>
          <h1 className="font-headline-lg text-headline-lg-mobile mt-8 text-on-background uppercase">
            System Access
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-error bg-error/10 text-error font-accent-label text-xs tracking-wider uppercase flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-surface p-8 border border-surface-container-highest shadow-2xl">
          <div className="flex flex-col gap-2">
            <label htmlFor="admin-email" className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-lowest border border-surface-container-highest text-on-surface px-4 py-3 font-body-sm outline-none focus:border-error focus:ring-1 focus:ring-error/50 transition-all duration-200 placeholder:text-on-surface-variant/30"
              placeholder="admin@pmd.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="admin-password" className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase">
              Authentication Key
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-lowest border border-surface-container-highest text-on-surface px-4 py-3 font-body-sm outline-none focus:border-error focus:ring-1 focus:ring-error/50 transition-all duration-200 placeholder:text-on-surface-variant/30"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-error text-on-error py-4 font-button-text text-button-text tracking-widest uppercase hover:bg-error/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4 group border border-error"
          >
            {isLoading ? "VERIFYING..." : "AUTHORIZE ACCESS"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant/40">
            UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED
          </p>
        </div>
      </div>
    </main>
  );
}
