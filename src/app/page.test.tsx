import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { prisma } from "@/lib/prisma";
import Home, { FeaturedProducts } from "./page";

// Mock Next.js navigation hooks and client components to prevent errors during server-side render
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/components/header", () => ({ Header: () => <header>Mock Header</header> }));
vi.mock("@/components/footer", () => ({ Footer: () => <footer>Mock Footer</footer> }));

const mockPrisma = prisma as unknown as {
  product: {
    findMany: ReturnType<typeof vi.fn>;
  };
};

describe("Landing Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and renders featured products from the database", async () => {
    // Arrange: Mock the DB returning real product data
    const fakeProducts = [
      { id: "p1", name: "DB Featured Tee", description: "Test Desc 1", price: 25000, isFeatured: true },
      { id: "p2", name: "DB Featured Hoodie", description: "Test Desc 2", price: 45000, isFeatured: true },
    ];
    mockPrisma.product.findMany.mockResolvedValue(fakeProducts);

    // Act: Render the async Server Component
    const element = await FeaturedProducts();
    const html = renderToStaticMarkup(element);

    // Assert: It should query for featured products
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isFeatured: true }),
        take: 4,
      })
    );

    // Assert: The rendered HTML should contain our fake product data instead of hardcoded data
    expect(html).toContain("DB Featured Tee");
    expect(html).toContain("₦25,000"); // Assuming formatNaira is used
    expect(html).toContain("DB Featured Hoodie");
    expect(html).toContain("₦45,000");
    
    // Assert: It should NOT contain the old hardcoded data
    expect(html).not.toContain("Chaos Heavyweight Tee");
  });

  it("falls back to newest products if fewer than 4 featured products exist", async () => {
    // Arrange: Only 1 featured product, so we should fetch 3 fallback products
    const featuredProducts = [
      { id: "p1", name: "Featured 1", description: "...", price: 10000, isFeatured: true },
    ];
    const fallbackProducts = [
      { id: "p2", name: "Fallback 1", description: "...", price: 20000, isFeatured: false },
      { id: "p3", name: "Fallback 2", description: "...", price: 30000, isFeatured: false },
      { id: "p4", name: "Fallback 3", description: "...", price: 40000, isFeatured: false },
    ];
    
    // First call returns featured, second call returns fallback
    mockPrisma.product.findMany
      .mockResolvedValueOnce(featuredProducts)
      .mockResolvedValueOnce(fallbackProducts);

    // Act
    const element = await FeaturedProducts();
    const html = renderToStaticMarkup(element);

    // Assert: Should have called findMany twice
    expect(mockPrisma.product.findMany).toHaveBeenCalledTimes(2);
    
    // Assert: Second call should be for non-featured products ordered by newest
    expect(mockPrisma.product.findMany).toHaveBeenNthCalledWith(2, expect.objectContaining({
      where: expect.objectContaining({ isFeatured: false }),
      take: 3,
      orderBy: { createdAt: "desc" }
    }));

    // Assert: Output should contain both the featured and fallback products
    expect(html).toContain("Featured 1");
    expect(html).toContain("Fallback 1");
    expect(html).toContain("Fallback 3");
  });
});
