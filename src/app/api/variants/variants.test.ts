import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "@/app/api/variants/route";
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
} from "@/app/api/variants/[id]/route";

const mockPrisma = prisma as unknown as {
  variant: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
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
const MOCK_VARIANT = {
  id: "var-1",
  productId: "prod-1",
  color: "Black",
  size: "M",
  sku: "OCT-BLK-M",
  inventory: { id: "inv-1", stock: 40 },
  product: { name: "Obsidian Core Tee", slug: "obsidian-core-tee" },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Variants API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- GET /api/variants ---

  describe("GET /api/variants", () => {
    it("returns all variants with inventory info", async () => {
      mockPrisma.variant.findMany.mockResolvedValue([
        MOCK_VARIANT,
        { ...MOCK_VARIANT, id: "var-2", size: "L", sku: "OCT-BLK-L" },
      ]);

      const request = createRequest("http://localhost:3000/api/variants");
      const response = await GET(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].inventory).toBeDefined();
      expect(data[0].product).toBeDefined();
    });

    it("filters variants by productId", async () => {
      mockPrisma.variant.findMany.mockResolvedValue([MOCK_VARIANT]);

      const request = createRequest(
        "http://localhost:3000/api/variants?productId=prod-1"
      );
      await GET(request);

      expect(mockPrisma.variant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productId: "prod-1" },
        })
      );
    });

    it("returns all variants when no productId filter", async () => {
      mockPrisma.variant.findMany.mockResolvedValue([]);

      const request = createRequest("http://localhost:3000/api/variants");
      await GET(request);

      expect(mockPrisma.variant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });
  });

  // --- POST /api/variants ---

  describe("POST /api/variants", () => {
    it("creates a variant with inventory", async () => {
      mockPrisma.variant.create.mockResolvedValue(MOCK_VARIANT);

      const request = createRequest("http://localhost:3000/api/variants", {
        method: "POST",
        body: {
          productId: "prod-1",
          color: "Black",
          size: "M",
          sku: "OCT-BLK-M",
          stock: 40,
        },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.color).toBe("Black");
      expect(data.size).toBe("M");
      expect(data.inventory.stock).toBe(40);
    });

    it("rejects variant creation without required fields", async () => {
      const request = createRequest("http://localhost:3000/api/variants", {
        method: "POST",
        body: { productId: "prod-1", color: "Black" },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toContain("required");
    });

    it("rejects variant without productId", async () => {
      const request = createRequest("http://localhost:3000/api/variants", {
        method: "POST",
        body: { color: "Black", size: "M", sku: "TEST-SKU" },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("returns 409 for duplicate SKU", async () => {
      const prismaError = new Error("Unique constraint failed");
      (prismaError as unknown as { code: string }).code = "P2002";
      mockPrisma.variant.create.mockRejectedValue(prismaError);

      const request = createRequest("http://localhost:3000/api/variants", {
        method: "POST",
        body: {
          productId: "prod-1",
          color: "Black",
          size: "M",
          sku: "OCT-BLK-M",
        },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(409);
      expect(data.error).toContain("already exists");
    });
  });

  // --- GET /api/variants/:id ---

  describe("GET /api/variants/:id", () => {
    it("returns a single variant with product info", async () => {
      const variantWithPrice = {
        ...MOCK_VARIANT,
        product: {
          name: "Obsidian Core Tee",
          slug: "obsidian-core-tee",
          price: 15000,
        },
      };
      mockPrisma.variant.findUnique.mockResolvedValue(variantWithPrice);

      const request = createRequest(
        "http://localhost:3000/api/variants/var-1"
      );
      const response = await GET_BY_ID(request, routeParams("var-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.sku).toBe("OCT-BLK-M");
      expect(data.product.price).toBe(15000);
    });

    it("returns 404 for non-existent variant", async () => {
      mockPrisma.variant.findUnique.mockResolvedValue(null);

      const request = createRequest(
        "http://localhost:3000/api/variants/fake-id"
      );
      const response = await GET_BY_ID(request, routeParams("fake-id"));
      const data = await parseResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });

  // --- PUT /api/variants/:id ---

  describe("PUT /api/variants/:id", () => {
    it("updates variant stock via inventory upsert", async () => {
      const updatedVariant = {
        ...MOCK_VARIANT,
        inventory: { id: "inv-1", stock: 100 },
      };
      mockPrisma.variant.update.mockResolvedValue(updatedVariant);

      const request = createRequest(
        "http://localhost:3000/api/variants/var-1",
        {
          method: "PUT",
          body: { stock: 100 },
        }
      );

      const response = await PUT(request, routeParams("var-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.inventory.stock).toBe(100);
      // Verify the update call includes inventory upsert
      expect(mockPrisma.variant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            inventory: {
              upsert: {
                create: { stock: 100 },
                update: { stock: 100 },
              },
            },
          }),
        })
      );
    });

    it("updates variant color", async () => {
      const updatedVariant = { ...MOCK_VARIANT, color: "White" };
      mockPrisma.variant.update.mockResolvedValue(updatedVariant);

      const request = createRequest(
        "http://localhost:3000/api/variants/var-1",
        {
          method: "PUT",
          body: { color: "White" },
        }
      );

      const response = await PUT(request, routeParams("var-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.color).toBe("White");
    });

    it("returns 404 when updating non-existent variant", async () => {
      const prismaError = new Error("Record not found");
      (prismaError as unknown as { code: string }).code = "P2025";
      mockPrisma.variant.update.mockRejectedValue(prismaError);

      const request = createRequest(
        "http://localhost:3000/api/variants/fake-id",
        {
          method: "PUT",
          body: { stock: 50 },
        }
      );

      const response = await PUT(request, routeParams("fake-id"));
      const data = await parseResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });

  // --- DELETE /api/variants/:id ---

  describe("DELETE /api/variants/:id", () => {
    it("deletes a variant successfully", async () => {
      mockPrisma.variant.delete.mockResolvedValue({ id: "var-1" });

      const request = createRequest(
        "http://localhost:3000/api/variants/var-1",
        { method: "DELETE" }
      );

      const response = await DELETE(request, routeParams("var-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.message).toContain("deleted");
    });

    it("returns 404 when deleting non-existent variant", async () => {
      const prismaError = new Error("Record not found");
      (prismaError as unknown as { code: string }).code = "P2025";
      mockPrisma.variant.delete.mockRejectedValue(prismaError);

      const request = createRequest(
        "http://localhost:3000/api/variants/fake-id",
        { method: "DELETE" }
      );

      const response = await DELETE(request, routeParams("fake-id"));
      const data = await parseResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });
});
