import { describe, expect, it, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Mock auth to simulate admin session for protected routes
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// Mock email
vi.mock("@/lib/email", () => ({
  sendOrderNotification: vi.fn(),
}));

const mockPrisma = prisma as unknown as {
  order: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

describe("Orders API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /api/orders returns all orders", async () => {
    const mockOrders = [
      { id: "order-1", status: "PENDING", totalAmount: 10000, createdAt: new Date() },
      { id: "order-2", status: "PAID", totalAmount: 15000, createdAt: new Date() },
    ];
    mockPrisma.order.findMany.mockResolvedValue(mockOrders);

    const { GET } = await import("./route");
    const request = new NextRequest("http://localhost/api/orders");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.orders).toHaveLength(2);
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
  });

  it("GET /api/orders filters by status if provided", async () => {
    const mockOrders = [
      { id: "order-2", status: "PAID", totalAmount: 15000, createdAt: new Date() },
    ];
    mockPrisma.order.findMany.mockResolvedValue(mockOrders);

    const { GET } = await import("./route");
    const request = new NextRequest("http://localhost/api/orders?status=PAID");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.orders).toHaveLength(1);
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
      where: { status: "PAID" },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
  });

  it("PATCH /api/orders/[id]/status updates an order status and sends notification for SHIPPED", async () => {
    mockPrisma.order.update.mockResolvedValue({
      id: "order-1",
      status: "SHIPPED",
      guestEmail: "test@example.com",
    });

    // Mock findUnique which will be used to fetch the populated order for email
    mockPrisma.order.findUnique.mockResolvedValue({
      id: "order-1",
      status: "SHIPPED",
      guestEmail: "test@example.com",
      items: [],
    });

    const { PATCH } = await import("./[id]/status/route");
    const request = new NextRequest("http://localhost/api/orders/order-1/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "SHIPPED" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "order-1" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order.status).toBe("SHIPPED");
    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { status: "SHIPPED" },
    });

    // Verify email dispatch
    const { sendOrderNotification } = await import("@/lib/email");
    expect(sendOrderNotification).toHaveBeenCalledWith(
      expect.objectContaining({ id: "order-1", status: "SHIPPED" }),
      "test@example.com",
      "SHIPPED"
    );
  });

  it("PATCH /api/orders/[id]/status rejects invalid status", async () => {
    const { PATCH } = await import("./[id]/status/route");
    const request = new NextRequest("http://localhost/api/orders/order-1/status", {
      method: "PATCH",
      body: JSON.stringify({ status: "INVALID_STATUS" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "order-1" }) });
    expect(response.status).toBe(400);
  });
});

