import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product-card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shop | PMD — Pressure Makes Diamonds",
  description:
    "Browse the full PMD collection. Premium streetwear tees, joggers, and new drops. Engineered for the unforgiving.",
};

type ShopPageProps = {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const activeCategorySlug = params.category || null;
  const searchQuery = params.search || null;
  const page = parseInt(params.page || "1");
  const limit = 12;

  // Fetch categories
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  // Build product query
  const where: Record<string, unknown> = {};
  if (activeCategorySlug) {
    where.category = { slug: activeCategorySlug };
  }
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: { include: { inventory: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col">
        {/* Header Hero */}
        <section className="relative pt-24 pb-12 px-(--spacing-margin-mobile) md:px-(--spacing-margin-desktop)">
          <div className="absolute inset-0 distress-overlay mix-blend-overlay pointer-events-none opacity-30" />
          <div className="relative max-w-7xl mx-auto">
            <h1 className="font-display-xl text-4xl md:text-6xl text-on-background uppercase tracking-wider">
            {activeCategorySlug
              ? categories.find((c) => c.slug === activeCategorySlug)?.name || "Shop"
              : "Shop All"}
          </h1>
          <p className="font-body-md text-on-surface-variant/60 mt-3 max-w-lg">
            {activeCategorySlug
              ? categories.find((c) => c.slug === activeCategorySlug)?.description
              : "The full PMD collection. Every piece built under pressure."}
          </p>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="flex-1 px-(--spacing-margin-mobile) md:px-(--spacing-margin-desktop) pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Category Filter Bar */}
          <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
            <Link
              href="/shop"
              id="filter-all"
              className={`
                shrink-0 px-5 py-2.5 text-xs font-accent-label uppercase tracking-[0.2em] transition-all duration-200 ghost-border
                ${!activeCategorySlug
                  ? "bg-[#f5f5f5] text-[#131313] border-[#f5f5f5]"
                  : "text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant"
                }
              `}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                id={`filter-${cat.slug}`}
                className={`
                  shrink-0 px-5 py-2.5 text-xs font-accent-label uppercase tracking-[0.2em] transition-all duration-200 ghost-border
                  ${activeCategorySlug === cat.slug
                    ? "bg-[#f5f5f5] text-[#131313] border-[#f5f5f5]"
                    : "text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant"
                  }
                `}
              >
                {cat.name}
                <span className="ml-2 text-[10px] opacity-50">
                  {cat._count.products}
                </span>
              </Link>
            ))}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-accent-label text-on-surface-variant/40 uppercase tracking-[0.15em]">
              {total} product{total !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Product Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-16 h-16 mb-6 text-surface-container-high">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <h3 className="font-headline-lg text-lg text-on-surface uppercase tracking-wider mb-2">
                No Products Found
              </h3>
              <p className="font-body-md text-on-surface-variant/50 text-sm">
                Try adjusting your filters or check back for new drops.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {page > 1 && (
                <Link
                  href={`/shop?${new URLSearchParams({
                    ...(activeCategorySlug ? { category: activeCategorySlug } : {}),
                    page: String(page - 1),
                  })}`}
                  className="px-4 py-2 text-xs font-accent-label uppercase tracking-wider ghost-border text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant transition-all"
                >
                  ← Prev
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/shop?${new URLSearchParams({
                    ...(activeCategorySlug ? { category: activeCategorySlug } : {}),
                    page: String(p),
                  })}`}
                  className={`
                    w-10 h-10 flex items-center justify-center text-xs font-accent-label ghost-border transition-all
                    ${p === page
                      ? "bg-[#f5f5f5] text-[#131313] border-[#f5f5f5]"
                      : "text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant"
                    }
                  `}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={`/shop?${new URLSearchParams({
                    ...(activeCategorySlug ? { category: activeCategorySlug } : {}),
                    page: String(page + 1),
                  })}`}
                  className="px-4 py-2 text-xs font-accent-label uppercase tracking-wider ghost-border text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant transition-all"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
