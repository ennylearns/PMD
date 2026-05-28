"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ReactNode } from "react";

const ADMIN_NAV_ITEMS = [
  { label: "OVERVIEW", href: "/admin/dashboard", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/>
      <rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/>
      <rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  )},
  { label: "ORDERS", href: "/admin/orders", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" x2="21" y1="6" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  )},
  { label: "PRODUCTS", href: "/admin/products", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15"/>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <path d="M12 22V12"/>
    </svg>
  )},
  { label: "DELIVERY FEES", href: "/admin/delivery-fees", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="16" x="4" y="4" rx="2"/>
      <path d="M4 14h16"/>
      <path d="M4 10h16"/>
      <path d="M10 4v16"/>
    </svg>
  )},
  { label: "COUPONS", href: "/admin/coupons", icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" x2="5" y1="5" y2="19"/>
      <circle cx="6.5" cy="6.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  )},
];

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col md:flex-row relative overflow-hidden">
      {/* Background Tactical Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface-container-lowest border-r border-surface-container-highest flex flex-col relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        {/* Admin Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-surface-container-highest">
          <Link href="/admin/dashboard" className="flex items-center gap-2 group">
            <span className="font-headline-lg font-black text-error italic tracking-tighter text-2xl group-hover:scale-105 transition-transform">PMD</span>
            <span className="font-accent-label text-[10px] tracking-widest text-on-surface-variant border border-on-surface-variant/30 px-2 py-0.5 ml-2 uppercase">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 font-accent-label text-[11px] tracking-widest transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? "text-on-surface bg-error/10 border border-error/20"
                    : "text-on-surface-variant hover:text-on-surface border border-transparent hover:border-surface-container-highest hover:bg-surface-container"
                }`}
              >
                <div className={`relative z-10 transition-colors ${isActive ? "text-error" : "group-hover:text-error"}`}>
                  {item.icon}
                </div>
                <span className="relative z-10">{item.label}</span>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-error z-20 shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-surface-container-highest">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-4 px-4 py-3 font-accent-label text-[11px] tracking-widest text-on-surface-variant hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            TERMINATE SESSION
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-surface-container-lowest/80 backdrop-blur-md border-b border-surface-container-highest flex items-center justify-between px-8 sticky top-0 z-30">
          <h2 className="font-accent-label text-sm tracking-widest text-on-surface uppercase flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.8)]"></span>
            System Active
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="font-accent-label text-[10px] tracking-widest text-on-surface-variant">OPERATOR</span>
              <span className="font-body-sm text-sm text-on-surface">ADMINISTRATOR</span>
            </div>
            <div className="w-10 h-10 border border-error/50 bg-error/10 flex items-center justify-center text-error font-bold">
              OP
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
