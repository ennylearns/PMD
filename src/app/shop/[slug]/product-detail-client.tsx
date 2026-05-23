"use client";

import { useState } from "react";
import Link from "next/link";
import ImageGallery from "@/components/image-gallery";
import VariantSelector from "@/components/variant-selector";
import StockIndicator from "@/components/stock-indicator";
import ProductCard from "@/components/product-card";
import { useCart } from "@/lib/cart-context";

type Variant = {
  id: string;
  color: string;
  size: string;
  sku: string;
  inventory: { stock: number } | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  isFeatured: boolean;
  category: { id: string; name: string; slug: string };
  variants: Variant[];
};

type ProductDetailClientProps = {
  product: Product;
  relatedProducts: Product[];
};

export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const firstAvailable = product.variants.find(
    (v) => (v.inventory?.stock || 0) > 0
  );
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    firstAvailable || null
  );
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartFeedback, setCartFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const { addItem } = useCart();

  const stock = selectedVariant?.inventory?.stock || 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Breadcrumbs */}
      <nav className="pt-20 pb-4 px-(--spacing-margin-mobile) md:px-(--spacing-margin-desktop)">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-accent-label text-on-surface-variant/40 uppercase tracking-[0.15em]">
          <Link href="/" className="hover:text-on-surface transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-on-surface transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={`/shop?category=${product.category.slug}`}
            className="hover:text-on-surface transition-colors"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-on-surface">{product.name}</span>
        </div>
      </nav>

      {/* Product Content */}
      <section className="flex-1 px-(--spacing-margin-mobile) md:px-(--spacing-margin-desktop) pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Image Gallery */}
          <div>
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6 md:pt-4">
            {/* Category label */}
            <span className="text-[10px] font-accent-label text-on-surface-variant/50 uppercase tracking-[0.3em]">
              {product.category.name}
            </span>

            {/* Product name */}
            <h1
              id="product-name"
              className="font-display-xl text-3xl md:text-5xl text-on-background uppercase tracking-wider leading-tight"
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span
                id="product-price"
                className="font-headline-lg text-2xl md:text-3xl text-on-surface"
              >
                {formatPrice(product.price)}
              </span>
              {product.isFeatured && (
                <span className="px-3 py-1 text-[10px] font-accent-label uppercase tracking-[0.2em] bg-error/10 text-error border border-error/20">
                  Featured
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-surface-container-high" />

            {/* Description */}
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              {product.description}
            </p>

            {/* Variant Selector */}
            <VariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
            />

            {/* Stock Indicator */}
            {selectedVariant && <StockIndicator stock={stock} />}

            {/* Selected variant info */}
            {selectedVariant && (
              <div className="text-[10px] font-accent-label text-on-surface-variant/30 uppercase tracking-[0.15em]">
                SKU: {selectedVariant.sku}
              </div>
            )}

            {/* Cart Feedback */}
            {cartFeedback && (
              <div
                className={`px-4 py-3 text-xs font-accent-label uppercase tracking-[0.15em] ${
                  cartFeedback.type === "success"
                    ? "bg-green-900/30 text-green-400 border border-green-500/20"
                    : "bg-error-container/30 text-error border border-error/20"
                }`}
              >
                {cartFeedback.message}
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              id="add-to-cart-btn"
              disabled={!selectedVariant || stock <= 0 || addingToCart}
              onClick={async () => {
                if (!selectedVariant) return;
                setAddingToCart(true);
                setCartFeedback(null);
                const result = await addItem(selectedVariant.id, 1);
                setAddingToCart(false);
                if (result.ok) {
                  setCartFeedback({
                    type: "success",
                    message: "Added to cart",
                  });
                } else {
                  setCartFeedback({
                    type: "error",
                    message: result.error || "Failed to add",
                  });
                }
                setTimeout(() => setCartFeedback(null), 3000);
              }}
              className={`
                w-full py-4 text-sm font-button-text uppercase tracking-[0.25em] transition-all duration-200
                ${
                  selectedVariant && stock > 0 && !addingToCart
                    ? "bg-[#f5f5f5] text-[#131313] hover:bg-error hover:text-on-error cursor-pointer active:scale-[0.98]"
                    : "bg-surface-container-high text-on-surface/30 cursor-not-allowed"
                }
              `}
            >
              {addingToCart
                ? "Adding..."
                : !selectedVariant
                  ? "Select a variant"
                  : stock <= 0
                    ? "Out of Stock"
                    : "Add to Cart"}
            </button>

            {/* Details Accordion */}
            <div className="mt-4 flex flex-col gap-0">
              <details className="group ghost-border border-b-0" open>
                <summary className="flex items-center justify-between py-4 px-4 cursor-pointer text-xs font-accent-label uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface transition-colors">
                  Product Details
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-sm font-body-md text-on-surface-variant/70 leading-relaxed">
                  <ul className="flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-error rounded-full" />
                      Heavyweight premium cotton
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-error rounded-full" />
                      Oversized streetwear fit
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-error rounded-full" />
                      Pre-shrunk for consistent sizing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-error rounded-full" />
                      Machine washable
                    </li>
                  </ul>
                </div>
              </details>
              <details className="group ghost-border">
                <summary className="flex items-center justify-between py-4 px-4 cursor-pointer text-xs font-accent-label uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface transition-colors">
                  Delivery & Returns
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-sm font-body-md text-on-surface-variant/70 leading-relaxed">
                  <ul className="flex flex-col gap-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-error rounded-full" />
                      Processing: 1-3 business days
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-error rounded-full" />
                      PMD-managed delivery
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-error rounded-full" />
                      Delivery Fee calculated at checkout
                    </li>
                  </ul>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="px-(--spacing-margin-mobile) md:px-(--spacing-margin-desktop) pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-headline-lg text-lg md:text-xl text-on-surface uppercase tracking-wider">
                You May Also Like
              </h2>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="text-xs font-accent-label text-on-surface-variant/50 uppercase tracking-[0.2em] hover:text-error transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
