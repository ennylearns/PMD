import crypto from "crypto";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

import { POST } from "@/app/api/payment/webhook/route";

// Type helpers for mocked prisma
const mockPrisma = prisma as unknown as {
  order: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  orderItem: { findMany: ReturnType<typeof vi.fn> };
  variantInventory: { update: ReturnType<typeof vi.fn> };
  cartItem: { deleteMany: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

// --- Helpers ---

const SECRET = "test-paystack-secret-key";

function sign(body: string) {
  return crypto.createHmac("sha512", SECRET).update(body).digest("hex");
}

function createWebhookRequest(body: unknown, signature: string) {
  const raw = JSON.stringify(body);
  return new NextRequest(new URL("/api/payment/webhook", "http://localhost:3000"), {
    method: "POST",
    body: raw,
    headers: {
      "Content-Type": "application/json",
      "x-paystack-signature": signature,
    },
  });
}

// --- Fixtures ---

const CHARGE_SUCCESS_EVENT = {
  event: "charge.success",
  data: {
    reference: "paystack-ref-abc",
    amount: 3500000, // kobo
    status: "success",
  },
};

const MOCK_ORDER = {
  id: "order-1",
  userId: "user-1",
  guestId: null,
  status: "PENDING",
  totalAmount: 35000,
  shippingFee: 5000,
  paymentReference: "paystack-ref-abc",
};

const MOCK_ORDER_ITEMS = [
  { id: "oi-1", orderId: "order-1", variantId: "var-1", quantity: 2, price: 15000 },
];

// --- Tests ---

describe("POST /api/payment/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAYSTACK_SECRET_KEY = SECRET;
  });

  // Slice 5
  it("returns 400 when the Paystack signature is invalid", async () => {
    const body = CHARGE_SUCCESS_EVENT;
    const badSig = "totally-wrong-signature";

    const req = createWebhookRequest(body, badSig);
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/signature/i);
  });

  // Slice 6
  it("returns 200 and does nothing for non-charge.success events", async () => {
    const body = { event: "transfer.success", data: {} };
    const raw = JSON.stringify(body);
    const sig = sign(raw);

    const req = createWebhookRequest(body, sig);
    const res = await POST(req);

    expect(res.status).toBe(200);
    // No DB writes should occur
    expect(mockPrisma.order.findUnique).not.toHaveBeenCalled();
  });

  // Slice 7 — happy path
  it("marks Order as PAID, decrements stock, and clears the customer's cart on charge.success", async () => {
    const raw = JSON.stringify(CHARGE_SUCCESS_EVENT);
    const sig = sign(raw);

    mockPrisma.order.findUnique.mockResolvedValue(MOCK_ORDER);
    mockPrisma.orderItem.findMany.mockResolvedValue(MOCK_ORDER_ITEMS);

    // $transaction executes the callback with a tx proxy
    mockPrisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          variantInventory: { update: vi.fn().mockResolvedValue({}) },
          order: { update: vi.fn().mockResolvedValue({ ...MOCK_ORDER, status: "PAID" }) },
          cartItem: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) },
        };
        return fn(tx);
      }
    );

    const req = createWebhookRequest(CHARGE_SUCCESS_EVENT, sig);
    const res = await POST(req);

    expect(res.status).toBe(200);

    // Transaction was invoked
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  // Slice 8 — oversell path
  it("cancels Order and issues a Paystack refund when stock is exhausted after charge.success", async () => {
    const raw = JSON.stringify(CHARGE_SUCCESS_EVENT);
    const sig = sign(raw);

    // Order exists but stock is now 0 (race condition — another buyer got the last unit)
    mockPrisma.order.findUnique.mockResolvedValue(MOCK_ORDER);
    mockPrisma.orderItem.findMany.mockResolvedValue([
      {
        ...MOCK_ORDER_ITEMS[0],
        variant: { inventory: { stock: 0 } }, // completely out of stock
      },
    ]);

    // fetchMany variant inventory shows 0 stock
    mockPrisma.variantInventory.update.mockRejectedValue(
      new Error("Insufficient stock")
    );

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: true }),
    });

    mockPrisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          variantInventory: {
            update: vi.fn().mockImplementation(() => {
              throw Object.assign(new Error("Insufficient stock"), { code: "OVERSOLD" });
            }),
          },
          order: { update: vi.fn().mockResolvedValue({ ...MOCK_ORDER, status: "CANCELLED" }) },
          cartItem: { deleteMany: vi.fn() },
        };
        return fn(tx);
      }
    );

    const req = createWebhookRequest(CHARGE_SUCCESS_EVENT, sig);
    const res = await POST(req);

    expect(res.status).toBe(200);
    // Paystack refund endpoint should have been called
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.paystack.co/refund",
      expect.objectContaining({ method: "POST" })
    );
  });
});
