"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ReactNode } from "react";

const NAV_ITEMS = [
  { label: "ORDER HISTORY", href: "/dashboard", icon: "receipt_long" },
  { label: "PROFILE", href: "/dashboard/profile", icon: "person" },
  { label: "ADDRESSES", href: "/dashboard/addresses", icon: "location_on" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* NavBar */}
      <nav className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-surface-container-highest w-full flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4">
        <div className="flex items-center gap-gutter">
          <Link
            href="/"
            className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-black text-error italic tracking-tighter"
          >
            PMD
          </Link>
          <div className="hidden md:flex gap-gutter ml-8">
            <Link href="/shop" className="font-accent-label text-accent-label text-on-surface-variant hover:text-error transition-all duration-150">
              Shop
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-error font-bold border-b-2 border-error pb-1 transition-all duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </Link>
          <Link href="/cart" className="text-on-background hover:text-error transition-all duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-[1600px] mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-gutter md:gap-16 min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="lg:col-span-3 flex flex-col gap-8">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-2">
              ACCOUNT
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Manage your orders and preferences.
            </p>
          </div>

          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between p-4 font-accent-label text-accent-label transition-colors duration-200 group relative overflow-hidden ${
                    isActive
                      ? "bg-surface-container border border-surface-container-highest text-error"
                      : "bg-surface-container-low border border-surface-container-highest text-on-surface-variant hover:text-on-surface hover:border-outline"
                  }`}
                >
                  <span className={`relative z-10 ${isActive ? "font-bold" : ""}`}>
                    {item.label}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`relative z-10 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity duration-200`}
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>

                  {/* Active state overlay */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-error/10 z-0" />
                      <div className="absolute inset-y-0 left-0 w-1 bg-error z-10" />
                    </>
                  )}
                </Link>
              );
            })}

            {/* Log Out */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center justify-between p-4 bg-surface-container-low border border-surface-container-highest text-on-surface-variant hover:text-on-surface hover:border-outline font-accent-label text-accent-label transition-colors duration-200 group mt-8 text-left"
            >
              <span>LOG OUT</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <section className="lg:col-span-9 flex flex-col gap-8">
          {children}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-surface-container-highest w-full px-margin-mobile md:px-margin-desktop py-section-gap grid grid-cols-1 md:grid-cols-4 gap-gutter mt-section-gap">
        <div className="col-span-1 flex flex-col gap-4">
          <Link
            href="/"
            className="text-headline-lg-mobile font-black text-on-surface font-headline-lg-mobile italic tracking-tighter hover:text-error transition-colors duration-200"
          >
            PMD
          </Link>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-auto uppercase tracking-widest text-[10px]">
            © 2024 PMD. ALL RIGHTS RESERVED.
          </p>
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          <h4 className="font-accent-label text-accent-label text-on-surface mb-2 border-b border-surface-container-highest pb-2 inline-block w-max">SHOP</h4>
          <nav className="flex flex-col gap-2">
            <Link href="/shop" className="font-body-sm text-body-sm text-on-surface-variant hover:text-error transition-colors duration-200">Shop All</Link>
          </nav>
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          <h4 className="font-accent-label text-accent-label text-on-surface mb-2 border-b border-surface-container-highest pb-2 inline-block w-max">SUPPORT</h4>
          <nav className="flex flex-col gap-2">
            <Link href="/contact" className="font-body-sm text-body-sm text-on-surface-variant hover:text-error transition-colors duration-200">Contact Us</Link>
          </nav>
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          <h4 className="font-accent-label text-accent-label text-on-surface mb-2 border-b border-surface-container-highest pb-2 inline-block w-max">SOCIAL</h4>
          <nav className="flex flex-col gap-2">
            <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-error transition-colors duration-200">Instagram</a>
            <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-error transition-colors duration-200">X</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
