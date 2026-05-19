"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, CartItem } from "@/lib/cart-context";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

// --- Cart Item Row ---

function CartItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const { variant } = item;
  const product = variant.product;
  const stock = variant.inventory?.stock ?? 0;
  const subtotal = product.price * item.quantity;

  return (
    <div className="group flex gap-4 md:gap-6 py-6 border-b border-surface-container-high/50 last:border-b-0">
      {/* Product Image */}
      <Link
        href={`/shop/${product.slug}`}
        className="shrink-0 w-24 h-28 md:w-32 md:h-36 bg-surface-container relative overflow-hidden"
      >
        {product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 96px, 128px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/20">
            <ShoppingBag className="w-8 h-8" />
          </div>
        )}
      </Link>

      {/* Item Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <Link
            href={`/shop/${product.slug}`}
            className="block font-headline-lg text-sm md:text-base text-on-surface uppercase tracking-wider hover:text-error transition-colors truncate"
          >
            {product.name}
          </Link>

          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-accent-label text-on-surface-variant/50 uppercase tracking-[0.2em]">
            <span>{variant.color}</span>
            <span className="text-surface-container-highest">|</span>
            <span>Size {variant.size}</span>
          </div>

          <div className="mt-2 font-headline-lg text-sm text-on-surface">
            {formatPrice(product.price)}
          </div>
        </div>

        {/* Bottom row: qty controls + subtotal */}
        <div className="mt-3 flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center ghost-border">
            <button
              id={`qty-dec-${item.id}`}
              onClick={() => {
                if (item.quantity > 1) onUpdate(item.id, item.quantity - 1);
              }}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>

            <span className="w-10 h-8 flex items-center justify-center text-xs font-accent-label text-on-surface border-l border-r border-[#333333]">
              {item.quantity}
            </span>

            <button
              id={`qty-inc-${item.id}`}
              onClick={() => {
                if (item.quantity < stock) onUpdate(item.id, item.quantity + 1);
              }}
              disabled={item.quantity >= stock}
              className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Subtotal + Remove */}
          <div className="flex items-center gap-4">
            <span className="font-headline-lg text-sm text-on-surface">
              {formatPrice(subtotal)}
            </span>
            <button
              id={`remove-${item.id}`}
              onClick={() => onRemove(item.id)}
              className="w-8 h-8 flex items-center justify-center text-on-surface-variant/40 hover:text-error transition-colors cursor-pointer"
              aria-label={`Remove ${product.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Empty Cart ---

function EmptyCart() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-32 px-4 text-center">
      <div className="w-20 h-20 flex items-center justify-center bg-surface-container rounded-full mb-6">
        <ShoppingBag className="w-8 h-8 text-on-surface-variant/30" />
      </div>
      <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface uppercase tracking-wider mb-2">
        Your Cart is Empty
      </h2>
      <p className="font-body-md text-on-surface-variant/60 mb-8 max-w-sm">
        Looks like you haven&apos;t added anything yet. Browse our collection and find something you love.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 px-8 py-3 bg-[#f5f5f5] text-[#131313] text-sm font-button-text uppercase tracking-[0.25em] hover:bg-error hover:text-on-error transition-all duration-200 active:scale-[0.98]"
      >
        <ArrowLeft className="w-4 h-4" />
        Start Shopping
      </Link>
    </div>
  );
}

// --- Loading Skeleton ---

function CartSkeleton() {
  return (
    <div className="flex-1 py-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-6 py-6 border-b border-surface-container-high/50 animate-pulse">
          <div className="w-24 h-28 md:w-32 md:h-36 bg-surface-container" />
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="h-4 w-48 bg-surface-container rounded mb-2" />
              <div className="h-3 w-24 bg-surface-container rounded mb-2" />
              <div className="h-4 w-20 bg-surface-container rounded" />
            </div>
            <div className="flex justify-between mt-3">
              <div className="h-8 w-28 bg-surface-container rounded" />
              <div className="h-8 w-20 bg-surface-container rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Cart Page ---

export default function CartPage() {
  const { items, itemCount, cartTotal, isLoading, updateItem, removeItem } =
    useCart();

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <div className="pt-20 pb-6 px-(--spacing-margin-mobile) md:px-(--spacing-margin-desktop)">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-accent-label text-on-surface-variant/40 uppercase tracking-[0.15em] mb-6">
            <Link
              href="/"
              className="hover:text-on-surface transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/shop"
              className="hover:text-on-surface transition-colors"
            >
              Shop
            </Link>
            <span>/</span>
            <span className="text-on-surface">Cart</span>
          </nav>

          <h1 className="font-display-xl text-3xl md:text-5xl text-on-background uppercase tracking-wider">
            Your Cart
          </h1>
          {!isLoading && itemCount > 0 && (
            <p className="mt-2 text-xs font-accent-label text-on-surface-variant/40 uppercase tracking-[0.2em]">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <section className="flex-1 px-(--spacing-margin-mobile) md:px-(--spacing-margin-desktop) pb-20">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <CartSkeleton />
          ) : items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Cart Items */}
              <div className="md:col-span-2">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              {/* Order Summary */}
              <div className="md:col-span-1">
                <div className="sticky top-24 ghost-border bg-surface-container-low/30 p-6">
                  <h2 className="font-headline-lg text-sm text-on-surface uppercase tracking-wider mb-6">
                    Order Summary
                  </h2>

                  <div className="flex flex-col gap-3 pb-4 border-b border-surface-container-high/50">
                    <div className="flex justify-between text-sm font-body-md text-on-surface-variant">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="text-on-surface">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-body-md text-on-surface-variant">
                      <span>Shipping</span>
                      <span className="text-on-surface-variant/50 text-xs font-accent-label uppercase tracking-wider">
                        Calculated at checkout
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 mb-6">
                    <span className="font-headline-lg text-base text-on-surface uppercase tracking-wider">
                      Total
                    </span>
                    <span className="font-headline-lg text-xl text-on-surface">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href="/checkout"
                    id="checkout-btn"
                    className="block w-full py-4 bg-[#f5f5f5] text-[#131313] text-sm font-button-text uppercase tracking-[0.25em] text-center hover:bg-error hover:text-on-error transition-all duration-200 active:scale-[0.98]"
                  >
                    Proceed to Checkout
                  </Link>

                  {/* Continue Shopping */}
                  <Link
                    href="/shop"
                    id="continue-shopping-btn"
                    className="block w-full mt-3 py-3 ghost-border text-center text-xs font-accent-label text-on-surface-variant/60 uppercase tracking-[0.2em] hover:text-on-surface hover:border-on-surface-variant/40 transition-all duration-200"
                  >
                    ← Continue Shopping
                  </Link>

                  {/* Trust badges */}
                  <div className="mt-6 flex flex-col gap-2 text-[10px] font-accent-label text-on-surface-variant/30 uppercase tracking-[0.15em]">
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-error/50 rounded-full" />
                      Secure checkout
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-error/50 rounded-full" />
                      GIG Logistics delivery
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-error/50 rounded-full" />
                      Paystack protected payment
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
