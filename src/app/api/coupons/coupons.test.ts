import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    coupon: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { role: "ADMIN" } }),
}));

describe("Coupons API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/coupons", () => {
    it("creates a valid coupon", async () => {
      const payload = {
        code: "SUMMER20",
        discountType: "PERCENTAGE",
        discountAmount: 20,
        startDate: new Date().toISOString(),
      };

      (prisma.coupon.findUnique as any).mockResolvedValue(null);
      (prisma.coupon.create as any).mockResolvedValue({ id: "1", ...payload });

      const req = new NextRequest("http://localhost/api/coupons", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(prisma.coupon.create).toHaveBeenCalled();
      expect(data.code).toBe("SUMMER20");
    });

    it("rejects duplicate coupon code", async () => {
      const payload = {
        code: "SUMMER20",
        discountType: "PERCENTAGE",
        discountAmount: 20,
        startDate: new Date().toISOString(),
      };

      (prisma.coupon.findUnique as any).mockResolvedValue({ id: "1", code: "SUMMER20" });

      const req = new NextRequest("http://localhost/api/coupons", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error).toBe("Coupon code already exists");
    });
  });

  describe("PUT /api/coupons/[id]", () => {
    it("updates an existing coupon", async () => {
      const payload = {
        code: "SUMMER20",
        discountType: "PERCENTAGE",
        discountAmount: 30, // Changed
        startDate: new Date().toISOString(),
      };

      (prisma.coupon.update as any).mockResolvedValue({ id: "1", ...payload });

      const { PUT } = await import("./[id]/route");
      const req = new NextRequest("http://localhost/api/coupons/1", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const res = await PUT(req, { params: { id: "1" } } as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(prisma.coupon.update).toHaveBeenCalled();
      expect(data.discountAmount).toBe(30);
    });
  });

  describe("DELETE /api/coupons/[id]", () => {
    it("deletes an existing coupon", async () => {
      (prisma.coupon.delete as any).mockResolvedValue({ id: "1" });

      const { DELETE } = await import("./[id]/route");
      const req = new NextRequest("http://localhost/api/coupons/1", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: { id: "1" } } as any);

      expect(res.status).toBe(200);
      expect(prisma.coupon.delete).toHaveBeenCalled();
    });
  });
});
