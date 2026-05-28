"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountAmount: number;
  minPurchase: number | null;
  startDate: string;
  endDate: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Failed to delete coupon");
      }
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      alert("Failed to delete coupon");
    }
  }

  const formatAmount = (amount: number, type: string) => {
    if (type === "PERCENTAGE") return `${amount}%`;
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
            Coupons
          </h1>
          <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-2">
            Manage Discounts and Promos
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/coupons/new"
            className="flex items-center gap-2 bg-on-background text-background px-4 py-2 text-xs font-accent-label uppercase tracking-widest hover:bg-on-background/90 transition-colors"
          >
            <Plus size={16} />
            Add Coupon
          </Link>
        </div>
      </header>

      <div className="bg-surface border border-surface-container-highest overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-container-highest bg-surface-container-lowest">
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Code</th>
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Discount</th>
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Usage</th>
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Status</th>
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-on-surface-variant font-body-sm">
                  Loading coupons...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-on-surface-variant font-body-sm">
                  No coupons found.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-surface-container-highest/50 hover:bg-surface-container transition-colors">
                  <td className="p-4 font-mono text-sm text-on-surface font-bold">
                    {coupon.code}
                  </td>
                  <td className="p-4 font-body-sm text-sm text-on-surface">
                    {formatAmount(coupon.discountAmount, coupon.discountType)}
                  </td>
                  <td className="p-4 font-mono text-xs text-on-surface-variant">
                    {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="p-4 font-body-sm text-sm">
                    {coupon.isActive ? (
                      <span className="flex items-center gap-1 text-primary">
                        <CheckCircle2 size={14} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-error">
                        <XCircle size={14} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/coupons/${coupon.id}`}
                        className="text-on-surface-variant hover:text-on-surface transition-colors"
                        title="Edit Coupon"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-on-surface-variant hover:text-error transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
