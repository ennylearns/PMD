import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "@/app/api/products/route";
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
} from "@/app/api/products/[id]/route";

const mockPrisma = prisma as unknown as {
  product: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
};

async function parseResponse(response: Response) {
  return response.json();
}

function createRequest(
  url: string,
  options?: { method?: string; body?: Record<string, unknown> }
) {
  const init: RequestInit = { method: options?.method || "GET" };
  if (options?.body) {
    init.body = JSON.stringify(options.body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

function routeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

// Fixtures
const MOCK_CATEGORY = { id: "cat-1", name: "T-Shirts", slug: "t-shirts" };

const MOCK_PRODUCT = {
  id: "prod-1",
  name: "Obsidian Core Tee",
  slug: "obsidian-core-tee",
  description: "The foundation of every PMD fit.",
  price: 15000,
  images: ["/products/tshirt-black.png"],
  isFeatured: true,
  categoryId: "cat-1",
  category: MOCK_CATEGORY,
  variants: [
    {
      id: "var-1",
      color: "Black",
      size: "M",
      sku: "OCT-BLK-M",
      inventory: { stock: 40 },
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Products API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- GET /api/products ---

  describe("GET /api/products", () => {
    it("returns paginated product list", async () => {
      mockPrisma.product.findMany.mockResolvedValue([MOCK_PRODUCT]);
      mockPrisma.product.count.mockResolvedValue(1);

      const request = createRequest("http://localhost:3000/api/products");
      const response = await GET(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.products).toHaveLength(1);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 12,
        total: 1,
        totalPages: 1,
      });
    });

    it("filters products by category slug", async () => {
      mockPrisma.product.findMany.mockResolvedValue([MOCK_PRODUCT]);
      mockPrisma.product.count.mockResolvedValue(1);

      const request = createRequest(
        "http://localhost:3000/api/products?category=t-shirts"
      );
      const response = await GET(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.products).toHaveLength(1);
      // Verify the findMany was called with category filter
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { slug: "t-shirts" },
          }),
        })
      );
    });

    it("filters products by featured flag", async () => {
      mockPrisma.product.findMany.mockResolvedValue([MOCK_PRODUCT]);
      mockPrisma.product.count.mockResolvedValue(1);

      const request = createRequest(
        "http://localhost:3000/api/products?featured=true"
      );
      await GET(request);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isFeatured: true,
          }),
        })
      );
    });

    it("searches products by name", async () => {
      mockPrisma.product.findMany.mockResolvedValue([MOCK_PRODUCT]);
      mockPrisma.product.count.mockResolvedValue(1);

      const request = createRequest(
        "http://localhost:3000/api/products?search=obsidian"
      );
      await GET(request);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: { contains: "obsidian", mode: "insensitive" },
              }),
            ]),
          }),
        })
      );
    });

    it("respects page and limit params", async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(25);

      const request = createRequest(
        "http://localhost:3000/api/products?page=2&limit=5"
      );
      const response = await GET(request);
      const data = await parseResponse(response);

      expect(data.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 25,
        totalPages: 5,
      });
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
    });

    it("returns empty results when no products match", async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      const request = createRequest(
        "http://localhost:3000/api/products?category=nonexistent"
      );
      const response = await GET(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.products).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });
  });

  // --- POST /api/products ---

  describe("POST /api/products", () => {
    it("creates a product with valid data", async () => {
      mockPrisma.product.create.mockResolvedValue(MOCK_PRODUCT);

      const request = createRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: {
          name: "Obsidian Core Tee",
          description: "The foundation of every PMD fit.",
          slug: "obsidian-core-tee",
          price: "15000",
          categoryId: "cat-1",
          images: ["/products/tshirt-black.png"],
          isFeatured: true,
        },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.name).toBe("Obsidian Core Tee");
      expect(data.category.name).toBe("T-Shirts");
    });

    it("creates a product with inline variants", async () => {
      const productWithVariants = {
        ...MOCK_PRODUCT,
        variants: [
          { id: "v1", color: "Black", size: "S", sku: "OCT-BLK-S", inventory: { stock: 25 } },
          { id: "v2", color: "Black", size: "M", sku: "OCT-BLK-M", inventory: { stock: 40 } },
        ],
      };
      mockPrisma.product.create.mockResolvedValue(productWithVariants);

      const request = createRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: {
          name: "Obsidian Core Tee",
          description: "The foundation of every PMD fit.",
          slug: "obsidian-core-tee",
          price: "15000",
          categoryId: "cat-1",
          variants: [
            { color: "Black", size: "S", sku: "OCT-BLK-S", stock: 25 },
            { color: "Black", size: "M", sku: "OCT-BLK-M", stock: 40 },
          ],
        },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.variants).toHaveLength(2);
    });

    it("rejects product creation without required fields", async () => {
      const request = createRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: { name: "Incomplete Product" },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toContain("required");
    });

    it("returns 409 for duplicate product slug", async () => {
      const prismaError = new Error("Unique constraint failed");
      (prismaError as unknown as { code: string }).code = "P2002";
      mockPrisma.product.create.mockRejectedValue(prismaError);

      const request = createRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: {
          name: "Obsidian Core Tee",
          description: "Duplicate",
          slug: "obsidian-core-tee",
          price: "15000",
          categoryId: "cat-1",
        },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(409);
      expect(data.error).toContain("already exists");
    });
  });

  // --- GET /api/products/:id ---

  describe("GET /api/products/:id", () => {
    it("retrieves a product by slug", async () => {
      mockPrisma.product.findFirst.mockResolvedValue(MOCK_PRODUCT);

      const request = createRequest(
        "http://localhost:3000/api/products/obsidian-core-tee"
      );
      const response = await GET_BY_ID(
        request,
        routeParams("obsidian-core-tee")
      );
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.slug).toBe("obsidian-core-tee");
      expect(data.variants).toHaveLength(1);
    });

    it("retrieves a product by id", async () => {
      mockPrisma.product.findFirst.mockResolvedValue(MOCK_PRODUCT);

      const request = createRequest(
        "http://localhost:3000/api/products/prod-1"
      );
      const response = await GET_BY_ID(request, routeParams("prod-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.id).toBe("prod-1");
    });

    it("returns 404 for non-existent product", async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      const request = createRequest(
        "http://localhost:3000/api/products/ghost-product"
      );
      const response = await GET_BY_ID(
        request,
        routeParams("ghost-product")
      );
      const data = await parseResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });

  // --- PUT /api/products/:id ---

  describe("PUT /api/products/:id", () => {
    it("updates product name and price", async () => {
      const updatedProduct = {
        ...MOCK_PRODUCT,
        name: "Obsidian Core Tee V2",
        price: 18000,
      };
      mockPrisma.product.update.mockResolvedValue(updatedProduct);

      const request = createRequest(
        "http://localhost:3000/api/products/prod-1",
        {
          method: "PUT",
          body: { name: "Obsidian Core Tee V2", price: "18000" },
        }
      );

      const response = await PUT(request, routeParams("prod-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.name).toBe("Obsidian Core Tee V2");
      expect(data.price).toBe(18000);
    });

    it("toggles featured status", async () => {
      const updatedProduct = { ...MOCK_PRODUCT, isFeatured: false };
      mockPrisma.product.update.mockResolvedValue(updatedProduct);

      const request = createRequest(
        "http://localhost:3000/api/products/prod-1",
        {
          method: "PUT",
          body: { isFeatured: false },
        }
      );

      const response = await PUT(request, routeParams("prod-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.isFeatured).toBe(false);
    });

    it("returns 404 when updating non-existent product", async () => {
      const prismaError = new Error("Record not found");
      (prismaError as unknown as { code: string }).code = "P2025";
      mockPrisma.product.update.mockRejectedValue(prismaError);

      const request = createRequest(
        "http://localhost:3000/api/products/fake-id",
        {
          method: "PUT",
          body: { name: "Nope" },
        }
      );

      const response = await PUT(request, routeParams("fake-id"));
      const data = await parseResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });

  // --- DELETE /api/products/:id ---

  describe("DELETE /api/products/:id", () => {
    it("deletes a product successfully", async () => {
      mockPrisma.product.delete.mockResolvedValue({ id: "prod-1" });

      const request = createRequest(
        "http://localhost:3000/api/products/prod-1",
        { method: "DELETE" }
      );

      const response = await DELETE(request, routeParams("prod-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.message).toContain("deleted");
    });

    it("returns 404 when deleting non-existent product", async () => {
      const prismaError = new Error("Record not found");
      (prismaError as unknown as { code: string }).code = "P2025";
      mockPrisma.product.delete.mockRejectedValue(prismaError);

      const request = createRequest(
        "http://localhost:3000/api/products/fake-id",
        { method: "DELETE" }
      );

      const response = await DELETE(request, routeParams("fake-id"));
      const data = await parseResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });
});
