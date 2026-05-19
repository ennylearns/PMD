import Image from "next/image";
import Link from "next/link";

type Variant = {
  id: string;
  color: string;
  size: string;
  inventory: { stock: number } | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: { name: string; slug: string };
  variants: Variant[];
};

export default function ProductCard({ product }: { product: Product }) {
  const totalStock = product.variants.reduce(
    (sum, v) => sum + (v.inventory?.stock || 0),
    0
  );
  const uniqueColors = [...new Set(product.variants.map((v) => v.color))];
  const isLowStock = totalStock > 0 && totalStock <= 10;
  const isOutOfStock = totalStock === 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  const colorHexMap: Record<string, string> = {
    Black: "#0a0a0a",
    White: "#f5f5f5",
    Grey: "#6b6b6b",
    "Dark Grey": "#3a3a3a",
    Charcoal: "#2d2d2d",
    Maroon: "#5a1a1a",
    Red: "#8b1a1a",
  };

  return (
    <Link
      href={`/shop/${product.slug}`}
      id={`product-card-${product.slug}`}
      className="group relative flex flex-col bg-surface-container-low ghost-border overflow-hidden transition-all duration-300 hover:border-[#ffb4ab]/40 hover:shadow-[0_0_20px_rgba(255,180,171,0.08)]"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-container-lowest">
        {product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-container-high">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Stock badge */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-surface-container-high/90 text-on-surface text-xs font-accent-label tracking-wider uppercase backdrop-blur-sm">
            Sold Out
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-error/90 text-on-error text-xs font-accent-label tracking-wider uppercase backdrop-blur-sm">
            Low Stock
          </div>
        )}

        {/* Quick view CTA */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span className="block w-full text-center py-2.5 bg-[#f5f5f5] text-[#131313] text-xs font-button-text uppercase tracking-widest">
            View Product
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4">
        <span className="text-[10px] font-accent-label text-on-surface-variant/60 uppercase tracking-[0.2em]">
          {product.category.name}
        </span>
        <h3 className="font-headline-lg text-sm text-on-surface leading-tight tracking-wide uppercase group-hover:text-error transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="font-headline-lg text-base text-on-surface">
            {formatPrice(product.price)}
          </span>
          {uniqueColors.length > 1 && (
            <div className="flex items-center gap-1.5">
              {uniqueColors.slice(0, 4).map((color) => (
                <span
                  key={color}
                  className="w-3 h-3 rounded-full border border-surface-container-high"
                  style={{ backgroundColor: colorHexMap[color] || "#555" }}
                  title={color}
                />
              ))}
              {uniqueColors.length > 4 && (
                <span className="text-[10px] text-on-surface-variant/50">
                  +{uniqueColors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
