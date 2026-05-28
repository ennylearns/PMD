import { prisma } from "@/lib/prisma";

export async function getDashboardMetrics() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [allTimeStats, monthStats, topProductsRaw, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      _count: true,
      where: { 
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: startOfMonth }
      },
    }),
    prisma.$queryRaw<{ id: string; name: string; totalSold: bigint }[]>`
      SELECT p.id, p.name, SUM(oi.quantity) as "totalSold"
      FROM "Product" p
      JOIN "Variant" v ON p.id = v."productId"
      JOIN "OrderItem" oi ON v.id = oi."variantId"
      JOIN "Order" o ON oi."orderId" = o.id
      WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
      GROUP BY p.id, p.name
      ORDER BY "totalSold" DESC
      LIMIT 5
    `,
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { email: true } } }
    })
  ]);

  const topProducts = topProductsRaw.map(p => ({
    id: p.id,
    name: p.name,
    totalSold: Number(p.totalSold)
  }));

  return {
    totalRevenueAllTime: allTimeStats._sum.totalAmount || 0,
    totalOrdersAllTime: allTimeStats._count || 0,
    totalRevenueThisMonth: monthStats._sum.totalAmount || 0,
    totalOrdersThisMonth: monthStats._count || 0,
    topProducts,
    recentOrders
  };
}
