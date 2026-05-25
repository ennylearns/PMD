import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// --- Route import (will fail until route exists) ---
import { POST } from "@/app/api/payment/initialize/route";

// --- Mock cart-owner at system boundary ---
const mockGetCartOwner = vi.fn();
vi.mock("@/lib/cart-owner", () => ({
  getCartOwner: (...args: unknown[]) => mockGetCartOwner(...args),
}));

// --- Type helpers for mock prisma ---
const mockPrisma = prisma as unknown as {
  cartItem: { findMany: ReturnType<typeof vi.fn> };
  order: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

// --- Fixtures ---

const MOCK_VARIANT = {
  id: "var-1",
  color: "Black",
  size: "M",
  sku: "OCT-BLK-M",
  inventory: { stock: 10 },
  product: { id: "prod-1", price: 15000, name: "Obsidian Core Tee", images: [] },
};

const MOCK_CART_ITEMS = [
  {
    id: "ci-1",
    variantId: "var-1",
    quantity: 2,
    variant: MOCK_VARIANT,
  },
];

const CHECKOUT_PAYLOAD = {
  contact: { email: "ade@pmd.ng", name: "Ade PMD", phone: "08012345678" },
  address: { street: "12 Broad Street", city: "Yaba", state: "Lagos", country: "NG" },
  items: [{ cartItemId: "ci-1", variantId: "var-1", quantity: 2, unitPrice: 15000 }],
  subtotal: 30000,
  deliveryFee: 5000,
  total: 35000,
  saveAddress: false,
};

function createPostRequest(body: unknown) {
  return new NextRequest(new URL("/api/payment/initialize", "http://localhost:3000"), {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// --- Tests ---

describe("POST /api/payment/initialize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated user
    mockGetCartOwner.mockResolvedValue({ userId: "user-1", guestId: null, isNew: false });
    // Default: global fetch mock (Paystack)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        data: {
          authorization_url: "https://checkout.paystack.com/test-ref",
          reference: "paystack-ref-abc",
          access_code: "abc123",
        },
      }),
    });
  });

  it("returns 409 when a cart item has insufficient stock", async () => {
    // Cart has quantity 5 but only 2 in stock
    const lowStockCart = [
      {
        ...MOCK_CART_ITEMS[0],
        quantity: 5,
        variant: { ...MOCK_VARIANT, inventory: { stock: 2 } },
      },
    ];
    mockPrisma.cartItem.findMany.mockResolvedValue(lowStockCart);

    const req = createPostRequest(CHECKOUT_PAYLOAD);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toContain("stock");
  });

  it("creates a pending Order and returns the Paystack authorization URL", async () => {
    mockPrisma.cartItem.findMany.mockResolvedValue(MOCK_CART_ITEMS);

    const PENDING_ORDER = { id: "order-1", totalAmount: 35000, shippingFee: 5000 };

    // $transaction resolves with the order
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        order: { create: vi.fn().mockResolvedValue(PENDING_ORDER) },
        orderItem: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
      };
      return fn(tx);
    });

    mockPrisma.order.update.mockResolvedValue({
      ...PENDING_ORDER,
      paymentReference: "paystack-ref-abc",
    });

    const req = createPostRequest(CHECKOUT_PAYLOAD);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.authorizationUrl).toBe("https://checkout.paystack.com/test-ref");

    // Verify Paystack was called with correct amount in kobo
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paystack.co/transaction/initialize",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"amount":3500000'), // 35000 NGN × 100
      })
    );
  });
});
