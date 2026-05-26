import { CheckCircle, Clock, Package, Truck } from "lucide-react";
import React from "react";

export const ORDER_STATUS_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; color: string; step: number }
> = {
  PENDING: {
    icon: <Clock className="w-5 h-5" />,
    label: "Awaiting payment confirmation",
    color: "text-yellow-400",
    step: 0,
  },
  PAID: {
    icon: <CheckCircle className="w-5 h-5" />,
    label: "Payment confirmed",
    color: "text-emerald-400",
    step: 1,
  },
  PROCESSING: {
    icon: <Package className="w-5 h-5" />,
    label: "Order is being processed",
    color: "text-blue-400",
    step: 2,
  },
  SHIPPED: {
    icon: <Truck className="w-5 h-5" />,
    label: "Order shipped",
    color: "text-purple-400",
    step: 3,
  },
  DELIVERED: {
    icon: <CheckCircle className="w-5 h-5" />,
    label: "Delivered",
    color: "text-emerald-400",
    step: 4,
  },
  CANCELLED: {
    icon: <Clock className="w-5 h-5" />,
    label: "Order cancelled",
    color: "text-error",
    step: -1,
  },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const { icon, label, color } = ORDER_STATUS_CONFIG[status] ?? ORDER_STATUS_CONFIG.PENDING;

  return (
    <div className={`flex items-center gap-2 font-accent-label text-xs uppercase tracking-[0.18em] ${color}`}>
      {icon}
      {label}
    </div>
  );
}
