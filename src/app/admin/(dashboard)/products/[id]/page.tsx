"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Variant = {
  id?: string;
  color: string;
  size: string;
  sku: string;
  stock: number;
  inventory?: { stock: number };
  _isDeleted?: boolean;
  _isNew?: boolean;
};

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch(`/api/products/${id}`),
        ]);

        if (catRes.ok) {
          setCategories(await catRes.json());
        }

        if (prodRes.ok) {
          const product = await prodRes.json();
          setName(product.name);
          setDescription(product.description);
          setSlug(product.slug);
          setPrice(product.price.toString());
          setCategoryId(product.categoryId);
          setIsFeatured(product.isFeatured);
          
          if (product.variants) {
            setVariants(
              product.variants.map((v: any) => ({
                id: v.id,
                color: v.color,
                size: v.size,
                sku: v.sku,
                stock: v.inventory?.stock || 0,
              }))
            );
          }
        } else {
          setError("Failed to load product details.");
        }
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const addVariant = () => {
    setVariants([
      ...variants,
      { color: "", size: "", sku: "", stock: 0, _isNew: true },
    ]);
  };

  const removeVariant = (index: number) => {
    const newVariants = [...variants];
    const variant = newVariants[index];
    if (variant._isNew) {
      newVariants.splice(index, 1);
    } else {
      variant._isDeleted = true;
    }
    setVariants(newVariants);
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // 1. Update Product Details
      const prodRes = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          slug,
          price: Number(price),
          categoryId,
          isFeatured,
        }),
      });

      if (!prodRes.ok) {
        throw new Error("Failed to update product details");
      }

      // 2. Handle Variants
      const variantPromises = variants.map(async (variant) => {
        if (variant._isDeleted && variant.id) {
          // Delete variant
          return fetch(`/api/variants/${variant.id}`, { method: "DELETE" });
        } else if (variant._isNew && !variant._isDeleted) {
          // Create variant
          return fetch("/api/variants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: id,
              color: variant.color,
              size: variant.size,
              sku: variant.sku,
              stock: variant.stock,
            }),
          });
        } else if (variant.id && !variant._isDeleted) {
          // Update variant
          return fetch(`/api/variants/${variant.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              color: variant.color,
              size: variant.size,
              sku: variant.sku,
              stock: variant.stock,
            }),
          });
        }
      });

      await Promise.all(variantPromises);
      router.push("/admin/products");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while saving.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-on-surface-variant font-body-sm">
        Loading product details...
      </div>
    );
  }

  const activeVariants = variants.filter(v => !v._isDeleted);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full pb-12">
      <header className="border-b border-surface-container-highest pb-6 flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 border border-surface-container-highest hover:bg-surface-container transition-colors text-on-surface"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background uppercase">
            Edit Product
          </h1>
          <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-2">
            Manage product listing and variants
          </p>
        </div>
      </header>

      {error && (
        <div className="bg-error/10 border border-error text-error p-4 text-sm font-body-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="bg-surface border border-surface-container-highest p-6 md:p-8 flex flex-col gap-6">
          <h2 className="font-accent-label text-sm uppercase tracking-widest text-on-surface border-b border-surface-container-highest pb-4">
            General Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-accent-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-surface-container border border-surface-container-highest text-on-surface p-3 text-sm focus:outline-none focus:border-on-surface transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-accent-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-surface-container border border-surface-container-highest text-on-surface p-3 text-sm focus:outline-none focus:border-on-surface transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-accent-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                Price (NGN) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-surface-container border border-surface-container-highest text-on-surface p-3 text-sm focus:outline-none focus:border-on-surface transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-accent-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="bg-surface-container border border-surface-container-highest text-on-surface p-3 text-sm uppercase focus:outline-none focus:border-on-surface transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-accent-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-surface-container border border-surface-container-highest text-on-surface p-3 text-sm focus:outline-none focus:border-on-surface transition-colors resize-y"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 bg-surface-container border-surface-container-highest text-on-background focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="isFeatured"
              className="font-accent-label text-xs uppercase tracking-widest text-on-surface cursor-pointer"
            >
              Featured Product
            </label>
          </div>
        </div>

        <div className="bg-surface border border-surface-container-highest p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-surface-container-highest pb-4">
            <h2 className="font-accent-label text-sm uppercase tracking-widest text-on-surface">
              Variants
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 text-xs font-accent-label uppercase tracking-widest text-on-surface hover:text-on-surface-variant transition-colors"
            >
              <Plus size={14} /> Add Variant
            </button>
          </div>

          {activeVariants.length === 0 ? (
            <p className="text-sm font-body-sm text-on-surface-variant text-center py-4 border border-dashed border-surface-container-highest">
              No variants configured. Add variants for different colors, sizes, or SKUs.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {variants.map((variant, index) => {
                if (variant._isDeleted) return null;
                return (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start bg-surface-container-lowest p-4 border border-surface-container-highest">
                    <div className="flex flex-col gap-1 md:col-span-1">
                      <label className="font-accent-label text-[9px] uppercase tracking-widest text-on-surface-variant">
                        Color
                      </label>
                      <input
                        type="text"
                        required
                        value={variant.color}
                        onChange={(e) => updateVariant(index, "color", e.target.value)}
                        className="bg-surface-container border border-surface-container-highest text-on-surface p-2 text-sm focus:outline-none focus:border-on-surface transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-1">
                      <label className="font-accent-label text-[9px] uppercase tracking-widest text-on-surface-variant">
                        Size
                      </label>
                      <input
                        type="text"
                        required
                        value={variant.size}
                        onChange={(e) => updateVariant(index, "size", e.target.value)}
                        className="bg-surface-container border border-surface-container-highest text-on-surface p-2 text-sm focus:outline-none focus:border-on-surface transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-1">
                      <label className="font-accent-label text-[9px] uppercase tracking-widest text-on-surface-variant">
                        SKU
                      </label>
                      <input
                        type="text"
                        required
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, "sku", e.target.value)}
                        className="bg-surface-container border border-surface-container-highest text-on-surface p-2 text-sm focus:outline-none focus:border-on-surface transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-1">
                      <label className="font-accent-label text-[9px] uppercase tracking-widest text-on-surface-variant">
                        Stock
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, "stock", Number(e.target.value))}
                        className="bg-surface-container border border-surface-container-highest text-on-surface p-2 text-sm focus:outline-none focus:border-on-surface transition-colors"
                      />
                    </div>
                    <div className="flex items-end justify-end md:col-span-1 h-full pb-2">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-on-surface-variant hover:text-error transition-colors"
                        title="Remove Variant"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-on-background text-background px-8 py-3 text-xs font-accent-label uppercase tracking-widest hover:bg-on-background/90 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
