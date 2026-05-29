"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type VariantInput = {
  color: string;
  size: string;
  sku: string;
  stock: number;
};

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantInput[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    fetchCategories();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slug) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  }, [name, slug]);

  const addVariant = () => {
    setVariants([
      ...variants,
      { color: "", size: "", sku: "", stock: 0 },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantInput, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        description,
        slug,
        price: Number(price),
        categoryId,
        isFeatured,
        images,
        variants: variants.length > 0 ? variants : undefined,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/products");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create product");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

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
            Add Product
          </h1>
          <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-2">
            Create a new product listing
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
                placeholder="e.g. Obsidian Core Tee"
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
                placeholder="e.g. obsidian-core-tee"
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
                placeholder="0.00"
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
              placeholder="Detailed product description..."
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
          <h2 className="font-accent-label text-sm uppercase tracking-widest text-on-surface border-b border-surface-container-highest pb-4">
            Product Images
          </h2>
          <ImageUploader value={images} onChange={setImages} />
        </div>

        <div className="bg-surface border border-surface-container-highest p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-surface-container-highest pb-4">
            <h2 className="font-accent-label text-sm uppercase tracking-widest text-on-surface">
              Variants (Optional)
            </h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 text-xs font-accent-label uppercase tracking-widest text-on-surface hover:text-on-surface-variant transition-colors"
            >
              <Plus size={14} /> Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-sm font-body-sm text-on-surface-variant text-center py-4 border border-dashed border-surface-container-highest">
              No variants added. Product will be created as a standalone item.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {variants.map((variant, index) => (
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
                      placeholder="e.g. Black"
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
                      placeholder="e.g. M"
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
                      placeholder="e.g. TEE-BLK-M"
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
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end justify-end md:col-span-1 h-full pb-2">
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-on-surface-variant hover:text-error transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-on-background text-background px-8 py-3 text-xs font-accent-label uppercase tracking-widest hover:bg-on-background/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
