import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// We'll import the route handlers as we implement them
import { GET, POST } from "@/app/api/cart/route";
import {
  PUT,
  DELETE,
} from "@/app/api/cart/[itemId]/route";

// --- Mock cart-owner at the system boundary ---
const mockGetCartOwner = vi.fn();
vi.mock("@/lib/cart-owner", () => ({
  getCartOwner: (...args: unknown[]) => mockGetCartOwner(...args),
}));

// --- Mock next/headers cookies for guest ID (still needed by setGuestIdCookie) ---
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
};
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const mockPrisma = prisma as unknown as {
  cartItem: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
  };
  variant: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  variantInventory: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

// --- Helpers ---

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

function routeParams(itemId: string) {
  return { params: Promise.resolve({ itemId }) };
}

// --- Fixtures ---

const MOCK_VARIANT = {
  id: "var-1",
  productId: "prod-1",
  color: "Black",
  size: "M",
  sku: "OCT-BLK-M",
  inventory: { stock: 40 },
  product: {
    id: "prod-1",
    name: "Obsidian Core Tee",
    slug: "obsidian-core-tee",
    price: 15000,
    images: ["/products/tshirt-black.png"],
  },
};

const MOCK_CART_ITEM = {
  id: "cart-item-1",
  guestId: "guest-123",
  userId: null,
  variantId: "var-1",
  quantity: 2,
  variant: MOCK_VARIANT,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const GUEST_ID = "guest-123";
const USER_ID = "user-authenticated-1";

// --- Tests ---

describe("Cart API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: guest cart owner
    mockGetCartOwner.mockResolvedValue({
      userId: null,
      guestId: GUEST_ID,
      isNew: false,
    });
  });

  // --- POST /api/cart ---

  describe("POST /api/cart", () => {
    it("adds a new item to cart", async () => {
      // Variant exists with stock
      mockPrisma.variant.findUnique.mockResolvedValue(MOCK_VARIANT);
      // No existing cart item for this guest+variant
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);
      // Create returns the cart item
      mockPrisma.cartItem.create.mockResolvedValue(MOCK_CART_ITEM);

      const request = createRequest("http://localhost:3000/api/cart", {
        method: "POST",
        body: { variantId: "var-1", quantity: 2 },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(201);
      expect(data.variantId).toBe("var-1");
      expect(data.quantity).toBe(2);
    });

    it("increments quantity if same variant already in cart", async () => {
      mockPrisma.variant.findUnique.mockResolvedValue(MOCK_VARIANT);
      // Existing item with quantity 2
      mockPrisma.cartItem.findFirst.mockResolvedValue(MOCK_CART_ITEM);
      // Update returns merged item
      mockPrisma.cartItem.update.mockResolvedValue({
        ...MOCK_CART_ITEM,
        quantity: 3,
      });

      const request = createRequest("http://localhost:3000/api/cart", {
        method: "POST",
        body: { variantId: "var-1", quantity: 1 },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.quantity).toBe(3);
    });

    it("rejects missing required fields", async () => {
      const request = createRequest("http://localhost:3000/api/cart", {
        method: "POST",
        body: {},
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("rejects non-existent variant", async () => {
      mockPrisma.variant.findUnique.mockResolvedValue(null);

      const request = createRequest("http://localhost:3000/api/cart", {
        method: "POST",
        body: { variantId: "fake-variant", quantity: 1 },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });

    it("rejects when quantity exceeds stock", async () => {
      const lowStockVariant = {
        ...MOCK_VARIANT,
        inventory: { stock: 2 },
      };
      mockPrisma.variant.findUnique.mockResolvedValue(lowStockVariant);
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);

      const request = createRequest("http://localhost:3000/api/cart", {
        method: "POST",
        body: { variantId: "var-1", quantity: 5 },
      });

      const response = await POST(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toContain("stock");
    });

    it("uses userId when user is authenticated", async () => {
      mockGetCartOwner.mockResolvedValue({
        userId: USER_ID,
        guestId: null,
        isNew: false,
      });
      mockPrisma.variant.findUnique.mockResolvedValue(MOCK_VARIANT);
      mockPrisma.cartItem.findFirst.mockResolvedValue(null);
      mockPrisma.cartItem.create.mockResolvedValue({
        ...MOCK_CART_ITEM,
        userId: USER_ID,
        guestId: null,
      });

      const request = createRequest("http://localhost:3000/api/cart", {
        method: "POST",
        body: { variantId: "var-1", quantity: 1 },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      // Verify the create was called with userId, not guestId
      expect(mockPrisma.cartItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: USER_ID }),
        })
      );
    });
  });

  // --- GET /api/cart ---

  describe("GET /api/cart", () => {
    it("returns all cart items for guest", async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([MOCK_CART_ITEM]);

      const request = createRequest("http://localhost:3000/api/cart");
      const response = await GET(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].variantId).toBe("var-1");
    });

    it("returns empty array when no items", async () => {
      mockPrisma.cartItem.findMany.mockResolvedValue([]);

      const request = createRequest("http://localhost:3000/api/cart");
      const response = await GET(request);
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.items).toEqual([]);
    });

    it("queries by userId when user is authenticated", async () => {
      mockGetCartOwner.mockResolvedValue({
        userId: USER_ID,
        guestId: null,
        isNew: false,
      });
      mockPrisma.cartItem.findMany.mockResolvedValue([]);

      const request = createRequest("http://localhost:3000/api/cart");
      await GET(request);

      expect(mockPrisma.cartItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_ID },
        })
      );
    });
  });

  // --- PUT /api/cart/[itemId] ---

  describe("PUT /api/cart/[itemId]", () => {
    it("updates item quantity", async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue(MOCK_CART_ITEM);
      mockPrisma.variant.findUnique.mockResolvedValue(MOCK_VARIANT);
      mockPrisma.cartItem.update.mockResolvedValue({
        ...MOCK_CART_ITEM,
        quantity: 5,
      });

      const request = createRequest(
        "http://localhost:3000/api/cart/cart-item-1",
        {
          method: "PUT",
          body: { quantity: 5 },
        }
      );

      const response = await PUT(request, routeParams("cart-item-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.quantity).toBe(5);
    });

    it("rejects quantity exceeding stock", async () => {
      const lowStockVariant = {
        ...MOCK_VARIANT,
        inventory: { stock: 3 },
      };
      mockPrisma.cartItem.findUnique.mockResolvedValue(MOCK_CART_ITEM);
      mockPrisma.variant.findUnique.mockResolvedValue(lowStockVariant);

      const request = createRequest(
        "http://localhost:3000/api/cart/cart-item-1",
        {
          method: "PUT",
          body: { quantity: 10 },
        }
      );

      const response = await PUT(request, routeParams("cart-item-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(400);
      expect(data.error).toContain("stock");
    });

    it("returns 404 for non-existent cart item", async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue(null);

      const request = createRequest(
        "http://localhost:3000/api/cart/fake-id",
        {
          method: "PUT",
          body: { quantity: 1 },
        }
      );

      const response = await PUT(request, routeParams("fake-id"));
      const data = await parseResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });

  // --- DELETE /api/cart/[itemId] ---

  describe("DELETE /api/cart/[itemId]", () => {
    it("removes a cart item", async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue(MOCK_CART_ITEM);
      mockPrisma.cartItem.delete.mockResolvedValue(MOCK_CART_ITEM);

      const request = createRequest(
        "http://localhost:3000/api/cart/cart-item-1",
        { method: "DELETE" }
      );

      const response = await DELETE(request, routeParams("cart-item-1"));
      const data = await parseResponse(response);

      expect(response.status).toBe(200);
      expect(data.message).toContain("removed");
    });

    it("returns 404 for non-existent cart item", async () => {
      mockPrisma.cartItem.findUnique.mockResolvedValue(null);

      const request = createRequest(
        "http://localhost:3000/api/cart/fake-id",
        { method: "DELETE" }
      );

      const response = await DELETE(request, routeParams("fake-id"));
      const data = await parseResponse(response);

      expect(response.status).toBe(404);
      expect(data.error).toContain("not found");
    });
  });
});
