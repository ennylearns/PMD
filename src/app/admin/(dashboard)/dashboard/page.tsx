import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AlertTriangle, TrendingUp, Clock, Package } from "lucide-react";
import { getDashboardMetrics } from "@/lib/services/analytics";

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default async function AdminDashboardOverview() {
  const LOW_STOCK_THRESHOLD = 5;

  const lowStockVariants = await prisma.variant.findMany({
    where: {
      inventory: {
        stock: {
          lte: LOW_STOCK_THRESHOLD,
        },
      },
    },
    include: {
      product: {
        select: { name: true, id: true },
      },
      inventory: true,
    },
    orderBy: {
      inventory: {
        stock: "asc",
      },
    },
  });

  const metrics = await getDashboardMetrics();

  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-surface-container-highest pb-6">
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background uppercase">
          Command Center
        </h1>
        <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-2">
          System Overview & Analytics
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "ALL-TIME REVENUE", value: formatNaira(metrics.totalRevenueAllTime), icon: "₦" },
          { label: "MTD REVENUE", value: formatNaira(metrics.totalRevenueThisMonth), icon: "₦" },
          { label: "ALL-TIME ORDERS", value: metrics.totalOrdersAllTime.toString(), icon: "📦" },
          { label: "MTD ORDERS", value: metrics.totalOrdersThisMonth.toString(), icon: "📦" },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-surface-container-highest p-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-surface-container-lowest flex items-center justify-center opacity-50 group-hover:bg-error/10 transition-colors">
              <span className="text-2xl grayscale">{stat.icon}</span>
            </div>
            <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mb-2">
              {stat.label}
            </p>
            <p className="font-headline-lg text-2xl text-on-surface">
              {stat.value}
            </p>
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-error group-hover:w-full transition-all duration-500"></div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Low Stock Alerts */}
        <div className="bg-surface border border-error/30 flex flex-col">
          <div className="p-4 border-b border-error/30 bg-error/5 flex items-center gap-3">
            <AlertTriangle size={18} className="text-error" />
            <h2 className="font-accent-label text-sm uppercase tracking-widest text-error">
              Low Stock Alerts
            </h2>
            <span className="ml-auto bg-error text-background text-[10px] font-bold px-2 py-0.5 rounded-full">
              {lowStockVariants.length}
            </span>
          </div>
          
          <div className="p-4 flex-1 max-h-[400px] overflow-y-auto">
            {lowStockVariants.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-on-surface-variant py-12 opacity-50">
                <p className="font-accent-label text-xs uppercase tracking-widest">Inventory Levels Healthy</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {lowStockVariants.map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between p-3 border border-surface-container-highest bg-surface-container-lowest hover:border-error/50 transition-colors group">
                    <div className="flex flex-col">
                      <span className="font-body-sm text-sm text-on-surface">{variant.product.name}</span>
                      <span className="font-accent-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">
                        {variant.color} • {variant.size} • SKU: {variant.sku}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="font-accent-label text-[9px] uppercase tracking-widest text-error">Stock</span>
                        <span className="font-mono font-bold text-error">{variant.inventory?.stock || 0}</span>
                      </div>
                      <Link 
                        href={`/admin/products/${variant.product.id}`}
                        className="p-2 bg-surface-container-highest text-on-surface hover:bg-error hover:text-background transition-colors"
                        title="Update Stock"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top-Selling Products */}
        <div className="bg-surface border border-surface-container-highest flex flex-col">
          <div className="p-4 border-b border-surface-container-highest bg-surface-container-lowest flex items-center gap-3">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-accent-label text-sm uppercase tracking-widest text-primary">
              Top-Selling Products
            </h2>
          </div>
          
          <div className="p-4 flex-1">
            {metrics.topProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-on-surface-variant py-8 opacity-50">
                <p className="font-accent-label text-xs uppercase tracking-widest">No Sales Data</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {metrics.topProducts.map((product, idx) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-surface-container-highest bg-surface-container-lowest hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-on-surface-variant text-lg">#{idx + 1}</span>
                      <span className="font-body-sm text-sm text-on-surface">{product.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-accent-label text-[9px] uppercase tracking-widest text-on-surface-variant">Units Sold</span>
                      <span className="font-mono font-bold text-primary">{product.totalSold}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-surface border border-surface-container-highest flex flex-col lg:col-span-2">
          <div className="p-4 border-b border-surface-container-highest bg-surface-container-lowest flex items-center gap-3">
            <Clock size={18} className="text-secondary" />
            <h2 className="font-accent-label text-sm uppercase tracking-widest text-secondary">
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="ml-auto text-xs font-accent-label uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container-highest bg-surface-container-lowest/50">
                  <th className="p-4 font-accent-label text-xs tracking-widest uppercase text-on-surface-variant">Order ID</th>
                  <th className="p-4 font-accent-label text-xs tracking-widest uppercase text-on-surface-variant">Date</th>
                  <th className="p-4 font-accent-label text-xs tracking-widest uppercase text-on-surface-variant">Customer</th>
                  <th className="p-4 font-accent-label text-xs tracking-widest uppercase text-on-surface-variant">Amount</th>
                  <th className="p-4 font-accent-label text-xs tracking-widest uppercase text-on-surface-variant text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant font-accent-label text-xs uppercase tracking-widest opacity-50">
                      No Recent Orders
                    </td>
                  </tr>
                ) : (
                  metrics.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-surface-container-highest/50 hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4 font-mono text-xs text-on-surface">
                        <Link href={`/admin/orders/${order.id}`} className="hover:text-primary transition-colors">
                          {order.id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="p-4 font-mono text-xs text-on-surface-variant">
                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(order.createdAt))}
                      </td>
                      <td className="p-4 font-body-sm text-sm text-on-surface truncate max-w-[150px]">
                        {order.user?.email || order.guestEmail || "Guest"}
                      </td>
                      <td className="p-4 font-mono text-sm text-on-surface">
                        {formatNaira(order.totalAmount)}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex px-2 py-1 text-[10px] font-bold tracking-widest uppercase border ${
                          order.status === 'PAID' ? 'bg-success/10 border-success/30 text-success' :
                          order.status === 'PENDING' ? 'bg-warning/10 border-warning/30 text-warning' :
                          order.status === 'SHIPPED' ? 'bg-info/10 border-info/30 text-info' :
                          order.status === 'DELIVERED' ? 'bg-primary/10 border-primary/30 text-primary' :
                          'bg-error/10 border-error/30 text-error'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
