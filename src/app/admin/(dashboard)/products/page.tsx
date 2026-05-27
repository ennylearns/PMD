"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  isFeatured: boolean;
  category: Category;
  variants: Array<{
    id: string;
    inventory?: { stock: number };
  }>;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (categoryFilter) params.append("category", categoryFilter);
      
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
    }
  }

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalStock = (product: Product) => {
    return product.variants.reduce((total, variant) => {
      return total + (variant.inventory?.stock || 0);
    }, 0);
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-surface-container-highest pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background uppercase">
            Product Catalog
          </h1>
          <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-2">
            Manage Inventory and Collections
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-on-background text-background px-4 py-2 text-xs font-accent-label uppercase tracking-widest hover:bg-on-background/90 transition-colors"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-container-lowest p-4 border border-surface-container-highest">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-surface-container-highest text-sm text-on-surface focus:outline-none focus:border-on-surface transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="font-accent-label text-xs uppercase tracking-widest text-on-surface-variant">
            Category:
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface border border-surface-container-highest text-on-surface text-sm p-2 uppercase focus:outline-none focus:border-on-surface transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-surface border border-surface-container-highest overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-container-highest bg-surface-container-lowest">
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Product Name</th>
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Category</th>
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Price</th>
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant">Total Stock</th>
              <th className="p-4 font-accent-label text-xs tracking-[0.2em] uppercase text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-on-surface-variant font-body-sm">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-on-surface-variant font-body-sm">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-surface-container-highest/50 hover:bg-surface-container transition-colors">
                  <td className="p-4 font-body-sm text-sm text-on-surface">
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      {product.isFeatured && (
                        <span className="text-[10px] text-primary uppercase tracking-widest mt-1">Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-body-sm text-sm text-on-surface-variant">
                    {product.category?.name || "N/A"}
                  </td>
                  <td className="p-4 font-headline-lg text-sm text-on-surface">
                    {formatNaira(product.price)}
                  </td>
                  <td className="p-4 font-mono text-xs text-on-surface-variant">
                    {getTotalStock(product)} units
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-on-surface-variant hover:text-on-surface transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-on-surface-variant hover:text-error transition-colors"
                        title="Delete Product"
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
