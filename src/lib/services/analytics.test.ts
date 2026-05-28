import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { getDashboardMetrics } from "./analytics";

const mockPrisma = prisma as unknown as {
  order: {
    aggregate: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  $queryRaw: ReturnType<typeof vi.fn>;
};

describe("Analytics Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDashboardMetrics", () => {
    it("returns total revenue and total orders for all-time and this month", async () => {
      mockPrisma.order.aggregate
        .mockResolvedValueOnce({ _sum: { totalAmount: 150000 }, _count: 15 }) // All time
        .mockResolvedValueOnce({ _sum: { totalAmount: 50000 }, _count: 5 }); // This month

      mockPrisma.$queryRaw.mockResolvedValue([]);
      mockPrisma.order.findMany.mockResolvedValue([]);

      const metrics = await getDashboardMetrics();

      expect(metrics.totalRevenueAllTime).toBe(150000);
      expect(metrics.totalOrdersAllTime).toBe(15);
      expect(metrics.totalRevenueThisMonth).toBe(50000);
      expect(metrics.totalOrdersThisMonth).toBe(5);

      expect(mockPrisma.order.aggregate).toHaveBeenCalledTimes(2);
      expect(mockPrisma.order.aggregate).toHaveBeenNthCalledWith(1, expect.objectContaining({
        where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } }
      }));
    });

    it("returns top-selling products by total volume sold all-time", async () => {
      mockPrisma.order.aggregate.mockResolvedValue({ _sum: {}, _count: 0 });
      mockPrisma.order.findMany.mockResolvedValue([]);
      
      // Prisma $queryRaw returns BigInt for sums in postgres sometimes, so we mock it accordingly
      mockPrisma.$queryRaw.mockResolvedValueOnce([
        { id: "p1", name: "Product 1", totalSold: 15n },
        { id: "p2", name: "Product 2", totalSold: 10n }
      ]);

      const metrics = await getDashboardMetrics();

      expect(metrics.topProducts).toHaveLength(2);
      expect(metrics.topProducts[0].name).toBe("Product 1");
      expect(metrics.topProducts[0].totalSold).toBe(15);
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it("returns recent orders", async () => {
      mockPrisma.order.aggregate.mockResolvedValue({ _sum: {}, _count: 0 });
      mockPrisma.$queryRaw.mockResolvedValue([]);
      
      const mockOrders = [
        { id: "o1", totalAmount: 1000 },
        { id: "o2", totalAmount: 2000 }
      ];
      mockPrisma.order.findMany.mockResolvedValue(mockOrders);

      const metrics = await getDashboardMetrics();

      expect(metrics.recentOrders).toHaveLength(2);
      expect(metrics.recentOrders[0].id).toBe("o1");
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: "desc" }, take: 5 })
      );
    });
  });
});
