"use client";

import { useEffect, useState } from "react";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { ORDER_STATUS_CONFIG } from "@/components/order-status-badge";

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: { name: string | null; email: string | null } | null;
  guestEmail: string | null;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const url = filter === "ALL" ? "/api/orders" : `/api/orders?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) => (order.id === id ? { ...order, status } : order))
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-surface-container-highest pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background uppercase">
            Order Management
          </h1>
          <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-2">
            Monitor and Process Customer Orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-accent-label text-xs uppercase tracking-widest text-on-surface-variant">
            Filter:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-surface-container border border-surface-container-highest text-on-surface text-sm p-2 uppercase focus:outline-none focus:border-on-surface transition-colors"
          >
            <option value="ALL">All Orders</option>
            {Object.keys(ORDER_STATUS_CONFIG).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="bg-surface border border-surface-container-highest overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-container-highest bg-surface-container-lowest">
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Order ID</th>
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Customer</th>
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Date</th>
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Total</th>
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Status</th>
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-on-surface-variant font-body-sm">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-on-surface-variant font-body-sm">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-surface-container-highest/50 hover:bg-surface-container transition-colors">
                  <td className="p-4 font-mono text-xs text-on-surface">
                    {order.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="p-4 font-body-sm text-sm text-on-surface">
                    {order.user?.name || order.user?.email || order.guestEmail || "Guest"}
                  </td>
                  <td className="p-4 font-body-sm text-sm text-on-surface-variant">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-headline-lg text-sm text-on-surface">
                    {formatNaira(order.totalAmount)}
                  </td>
                  <td className="p-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="bg-transparent border border-surface-container-highest text-on-surface text-xs p-1 uppercase focus:outline-none focus:border-on-surface cursor-pointer"
                    >
                      {Object.keys(ORDER_STATUS_CONFIG).map((status) => (
                        <option key={status} value={status}>
                          Set {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
