"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

// --- Types ---

type CartVariant = {
  id: string;
  color: string;
  size: string;
  sku: string;
  inventory: { stock: number } | null;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  };
};

export type CartItem = {
  id: string;
  guestId: string;
  variantId: string;
  quantity: number;
  variant: CartVariant;
};

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  cartTotal: number;
  isLoading: boolean;
  addItem: (variantId: string, quantity: number) => Promise<{ ok: boolean; error?: string }>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- Provider ---

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { status } = useSession();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce(
    (sum, item) => sum + item.variant.product.price * item.quantity,
    0
  );

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh cart on mount and when session status changes
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshCart();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshCart, status]);

  const addItem = async (
    variantId: string,
    quantity: number
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        return { ok: false, error: data.error };
      }

      await refreshCart();
      return { ok: true };
    } catch (err) {
      console.error("Failed to add to cart:", err);
      return { ok: false, error: "Something went wrong" };
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      if (res.ok) {
        await refreshCart();
      }
    } catch (err) {
      console.error("Failed to update cart item:", err);
    }
  };

  const removeItem = async (itemId: string) => {
    // Optimistic removal
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    try {
      await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      await refreshCart();
    } catch (err) {
      console.error("Failed to remove cart item:", err);
      await refreshCart(); // Re-fetch to restore state on error
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        cartTotal,
        isLoading,
        addItem,
        updateItem,
        removeItem,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// --- Hook ---

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
