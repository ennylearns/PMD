"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart-context";
import { ReactNode } from "react";

/**
 * Root provider tree.
 * SessionProvider wraps CartProvider so the cart can react to session changes.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  );
}
