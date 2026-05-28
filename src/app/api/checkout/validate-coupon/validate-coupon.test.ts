import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    coupon: {
      findUnique: vi.fn(),
    },
  },
}));

describe("POST /api/checkout/validate-coupon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates and calculates discount successfully", async () => {
    const payload = {
      code: "SUMMER20",
      subtotal: 10000,
    };

    (prisma.coupon.findUnique as any).mockResolvedValue({
      id: "1",
      code: "SUMMER20",
      discountType: "PERCENTAGE",
      discountAmount: 20,
      isActive: true,
      minPurchase: null,
      usageLimit: null,
      usageCount: 0,
      startDate: new Date(Date.now() - 100000),
      endDate: null,
    });

    const req = new NextRequest("http://localhost/api/checkout/validate-coupon", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.valid).toBe(true);
    expect(data.discountAmount).toBe(2000); // 20% of 10000
  });

  it("returns error if coupon is invalid", async () => {
    const payload = {
      code: "EXPIRED",
      subtotal: 10000,
    };

    (prisma.coupon.findUnique as any).mockResolvedValue({
      id: "2",
      code: "EXPIRED",
      discountType: "FIXED",
      discountAmount: 1000,
      isActive: false, // Inactive!
    });

    const req = new NextRequest("http://localhost/api/checkout/validate-coupon", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400); // Bad Request for invalid coupon
    expect(data.error).toBe("Coupon is inactive");
  });

  it("returns error if coupon not found", async () => {
    const payload = {
      code: "NOTFOUND",
      subtotal: 10000,
    };

    (prisma.coupon.findUnique as any).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/checkout/validate-coupon", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("Coupon not found");
  });
});
