"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function AdminCouponForm({ params }: { params?: { id: string } }) {
  const isEditing = !!params?.id;
  const router = useRouter();
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountAmount: 0,
    minPurchase: 0,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: "",
    usageLimit: 0,
    isActive: true,
  });

  useEffect(() => {
    if (isEditing) {
      fetch(`/api/coupons/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load coupon");
          return res.json();
        })
        .then((data) => {
          setFormData({
            code: data.code,
            description: data.description || "",
            discountType: data.discountType,
            discountAmount: data.discountAmount,
            minPurchase: data.minPurchase || 0,
            startDate: new Date(data.startDate).toISOString().slice(0, 16),
            endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : "",
            usageLimit: data.usageLimit || 0,
            isActive: data.isActive,
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load coupon.");
          setLoading(false);
        });
    }
  }, [isEditing, params?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...formData,
      minPurchase: formData.minPurchase || null,
      usageLimit: formData.usageLimit || null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      startDate: new Date(formData.startDate).toISOString(),
    };

    try {
      const url = isEditing ? `/api/coupons/${params.id}` : "/api/coupons";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save coupon");
      }

      router.push("/admin/coupons");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <header className="border-b border-surface-container-highest pb-6 flex items-center gap-4">
        <Link href="/admin/coupons" className="text-on-surface-variant hover:text-on-surface transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background uppercase">
            {isEditing ? "Edit Coupon" : "New Coupon"}
          </h1>
        </div>
      </header>

      {error && (
        <div className="bg-error/10 text-error p-4 border border-error/20 font-body-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-surface-container-lowest border border-surface-container-highest p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-accent-label text-xs tracking-widest uppercase text-on-surface-variant">
              Coupon Code *
            </label>
            <input
              required
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. SUMMER20"
              className="bg-surface border border-surface-container-highest p-3 text-on-surface focus:outline-none focus:border-on-surface font-mono"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-accent-label text-xs tracking-widest uppercase text-on-surface-variant">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              className="bg-surface border border-surface-container-highest p-3 text-on-surface focus:outline-none focus:border-on-surface"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-accent-label text-xs tracking-widest uppercase text-on-surface-variant">
              Discount Type *
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "PERCENTAGE" | "FIXED" })}
              className="bg-surface border border-surface-container-highest p-3 text-on-surface focus:outline-none focus:border-on-surface"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount (₦)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-accent-label text-xs tracking-widest uppercase text-on-surface-variant">
              Discount Amount *
            </label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={formData.discountAmount}
              onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
              className="bg-surface border border-surface-container-highest p-3 text-on-surface focus:outline-none focus:border-on-surface"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-accent-label text-xs tracking-widest uppercase text-on-surface-variant">
              Minimum Purchase (₦)
            </label>
            <input
              type="number"
              min="0"
              value={formData.minPurchase || ""}
              onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
              className="bg-surface border border-surface-container-highest p-3 text-on-surface focus:outline-none focus:border-on-surface"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-accent-label text-xs tracking-widest uppercase text-on-surface-variant">
              Usage Limit
            </label>
            <input
              type="number"
              min="0"
              placeholder="Leave empty for unlimited"
              value={formData.usageLimit || ""}
              onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
              className="bg-surface border border-surface-container-highest p-3 text-on-surface focus:outline-none focus:border-on-surface"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-accent-label text-xs tracking-widest uppercase text-on-surface-variant">
              Start Date *
            </label>
            <input
              required
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="bg-surface border border-surface-container-highest p-3 text-on-surface focus:outline-none focus:border-on-surface"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-accent-label text-xs tracking-widest uppercase text-on-surface-variant">
              End Date
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="bg-surface border border-surface-container-highest p-3 text-on-surface focus:outline-none focus:border-on-surface"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 py-4 border-t border-surface-container-highest">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="isActive" className="font-body-sm text-on-surface">
            Coupon is Active
          </label>
        </div>

        <div className="flex justify-end gap-4 border-t border-surface-container-highest pt-6">
          <Link
            href="/admin/coupons"
            className="px-6 py-3 border border-surface-container-highest text-on-surface font-accent-label tracking-widest uppercase hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-on-background text-background px-6 py-3 font-accent-label tracking-widest uppercase disabled:opacity-50 hover:bg-on-background/90 transition-colors"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Coupon"}
          </button>
        </div>
      </form>
    </div>
  );
}
