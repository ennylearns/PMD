import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { GET, POST } from "@/app/api/categories/route";
import {
  GET as GET_BY_ID,
  PUT,
  DELETE,
} from "@/app/api/categories/[id]/route";

// Type the mocked prisma for intellisense
const mockPrisma = prisma as unknown as {
  category: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

// Helper: parse JSON from NextResponse
async function parseResponse(response: Response) {
  return response.json();
}

// Helper: create a NextRequest with JSON body
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

// Helper: create route params (Next.js 15 async params)
function routeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("Categories API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- GET /api/categories ---

  describe("GET /api/categories", () => {
    it("returns all categories sorted by name", async () => {
      const mockCategories = [
        { id: "cat-1", name: "Joggers", slug: "joggers", _count: { products: 2 } },
        { id: "cat-2", name: "New Drops", slug: "new-drops", _count: { products: 1 } },
        { id: "cat-3", name: "T-Shirts", slug: "t-shirts", _count: { products: 3 } },
      ];
      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const response = await GET();
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data).toHaveLength(3);
      expect(data[0].name).toBe("Joggers");
      expect(data[2].name).toBe("T-Shirts");
    });

    it("returns empty array when no categories exist", async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  // --- POST /api/categories ---

  describe("POST /api/categories", () => {
    it("creates a category with valid data", async () => {
      const newCategory = {
        id: "cat-new",
        name: "Hoodies",
        slug: "hoodies",
        description: "Premium heavyweight hoodies",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.category.create.mockResolvedValue(newCategory);

      const request = createRequest("http://localhost:3000/api/categories", {
        method: "POST",
        body: { name: "Hoodies", slug: "hoodies", description: "Premium heavyweight hoodies" },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.name).toBe("Hoodies");
      expect(data.slug).toBe("hoodies");
    });

    it("rejects category creation without name", async () => {
      const request = createRequest("http://localhost:3000/api/categories", {
        method: "POST",
        body: { slug: "hoodies" },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toContain("required");
    });

    it("rejects category creation without slug", async () => {
      const request = createRequest("http://localhost:3000/api/categories", {
        method: "POST",
        body: { name: "Hoodies" },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toContain("required");
    });

    it("returns 409 when category slug already exists", async () => {
      const prismaError = new Error("Unique constraint failed");
      (prismaError as unknown as { code: string }).code = "P2002";
      mockPrisma.category.create.mockRejectedValue(prismaError);

      const request = createRequest("http://localhost:3000/api/categories", {
        method: "POST",
        body: { name: "T-Shirts", slug: "t-shirts" },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(409);
      expect(data.error).toContain("already exists");
    });
  });

  // --- GET /api/categories/:id ---

  describe("GET /api/categories/:id", () => {
    it("returns a single category with its products", async () => {
      const mockCategory = {
        id: "cat-1",
        name: "T-Shirts",
        slug: "t-shirts",
        products: [
          { id: "prod-1", name: "Obsidian Core Tee", variants: [] },
        ],
      };
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      const request = createRequest("http://localhost:3000/api/categories/cat-1");
      const response = await GET_BY_ID(request, routeParams("cat-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.name).toBe("T-Shirts");
      expect(data.products).toHaveLength(1);
    });

    it("returns 404 for non-existent category", async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      const request = createRequest("http://localhost:3000/api/categories/fake-id");
      const response = await GET_BY_ID(request, routeParams("fake-id"));
      const data = await parseResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });

  // --- PUT /api/categories/:id ---

  describe("PUT /api/categories/:id", () => {
    it("updates a category name", async () => {
      const updatedCategory = {
        id: "cat-1",
        name: "Updated T-Shirts",
        slug: "t-shirts",
        description: null,
      };
      mockPrisma.category.update.mockResolvedValue(updatedCategory);

      const request = createRequest("http://localhost:3000/api/categories/cat-1", {
        method: "PUT",
        body: { name: "Updated T-Shirts" },
      });

      const response = await PUT(request, routeParams("cat-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.name).toBe("Updated T-Shirts");
    });

    it("returns 404 when updating non-existent category", async () => {
      const prismaError = new Error("Record not found");
      (prismaError as unknown as { code: string }).code = "P2025";
      mockPrisma.category.update.mockRejectedValue(prismaError);

      const request = createRequest("http://localhost:3000/api/categories/fake-id", {
        method: "PUT",
        body: { name: "Nope" },
      });

      const response = await PUT(request, routeParams("fake-id"));
      const data = await parseResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });

  // --- DELETE /api/categories/:id ---

  describe("DELETE /api/categories/:id", () => {
    it("deletes a category successfully", async () => {
      mockPrisma.category.delete.mockResolvedValue({ id: "cat-1" });

      const request = createRequest("http://localhost:3000/api/categories/cat-1", {
        method: "DELETE",
      });

      const response = await DELETE(request, routeParams("cat-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.message).toContain("deleted");
    });

    it("returns 404 when deleting non-existent category", async () => {
      const prismaError = new Error("Record not found");
      (prismaError as unknown as { code: string }).code = "P2025";
      mockPrisma.category.delete.mockRejectedValue(prismaError);

      const request = createRequest("http://localhost:3000/api/categories/fake-id", {
        method: "DELETE",
      });

      const response = await DELETE(request, routeParams("fake-id"));
      const data = await parseResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });
});
