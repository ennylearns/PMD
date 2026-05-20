"use client";

import { useState, useEffect, useCallback } from "react";

type Address = {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string | null;
  isDefault: boolean;
};

// Nigerian states for the dropdown
const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const EMPTY_FORM = { street: "", city: "", state: "", isDefault: false };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
      }
    } catch {
      console.error("Failed to fetch addresses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  function startEdit(address: Address) {
    setEditingId(address.id);
    setForm({
      street: address.street,
      city: address.city,
      state: address.state,
      isDefault: address.isDefault,
    });
    setShowForm(true);
    setError("");
  }

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.street || !form.city || !form.state) {
      setError("Street, city, and state are required");
      return;
    }

    setIsSaving(true);

    try {
      const url = editingId
        ? `/api/addresses/${editingId}`
        : "/api/addresses";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await fetchAddresses();
        cancelForm();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save address");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch {
      console.error("Failed to delete address");
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch {
      console.error("Failed to set default address");
    }
  }

  return (
    <>
      <header className="flex justify-between items-end border-b border-surface-container-highest pb-4">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">
          ADDRESSES
        </h2>
        <button
          onClick={startAdd}
          className="bg-on-surface text-surface px-4 py-2 font-button-text text-button-text tracking-wider hover:bg-error hover:text-primary-container transition-all duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          ADD ADDRESS
        </button>
      </header>

      {/* Error Message */}
      {error && (
        <div className="p-4 border border-error/30 bg-error-container/20 text-error font-body-sm text-body-sm">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-surface-container border border-surface-container-highest p-6 relative">
          <div className="absolute inset-y-0 left-0 w-1 bg-error" />
          <h3 className="font-accent-label text-accent-label text-error mb-6">
            {editingId ? "EDIT ADDRESS" : "NEW ADDRESS"}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-accent-label text-accent-label text-on-surface-variant">STREET</label>
              <input
                type="text"
                required
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="w-full bg-surface-container-low border border-surface-container-highest text-on-surface px-4 py-3 font-body-md text-body-sm outline-none focus:border-error transition-colors duration-200"
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-accent-label text-accent-label text-on-surface-variant">CITY</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container-highest text-on-surface px-4 py-3 font-body-md text-body-sm outline-none focus:border-error transition-colors duration-200"
                  placeholder="City"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-accent-label text-accent-label text-on-surface-variant">STATE</label>
                <select
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full bg-surface-container-low border border-surface-container-highest text-on-surface px-4 py-3 font-body-md text-body-sm outline-none focus:border-error transition-colors duration-200 appearance-none"
                >
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Country (read-only per grill session decision) */}
            <div className="flex flex-col gap-2">
              <label className="font-accent-label text-accent-label text-on-surface-variant">COUNTRY</label>
              <div className="w-full bg-surface-container-low/50 border border-surface-container-highest text-on-surface-variant px-4 py-3 font-body-md text-body-sm">
                Nigeria 🇳🇬
              </div>
            </div>

            <label className="flex items-center gap-3 mt-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="w-4 h-4 accent-error"
              />
              <span className="font-accent-label text-accent-label text-on-surface-variant group-hover:text-on-surface transition-colors">
                SET AS DEFAULT ADDRESS
              </span>
            </label>

            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-on-surface text-surface px-6 py-3 font-button-text text-button-text tracking-wider hover:bg-error hover:text-primary-container transition-all duration-200 disabled:opacity-50"
              >
                {isSaving ? "SAVING..." : editingId ? "UPDATE" : "SAVE ADDRESS"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="bg-surface-container border border-surface-container-highest text-on-surface px-6 py-3 font-button-text text-button-text hover:bg-surface-container-high transition-colors duration-200"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-on-surface-variant/30 border-t-error rounded-full animate-spin" />
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="w-16 h-16 border border-surface-container-highest flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-on-surface-variant/40">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">No saved addresses</p>
          <button
            onClick={startAdd}
            className="bg-on-surface text-surface px-6 py-3 font-button-text text-button-text tracking-wider hover:bg-error hover:text-primary-container transition-all duration-200"
          >
            ADD YOUR FIRST ADDRESS
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border p-6 flex flex-col md:flex-row justify-between gap-4 group hover:border-outline transition-colors duration-200 relative overflow-hidden ${
                address.isDefault
                  ? "bg-surface-container border-surface-container-highest"
                  : "bg-surface-container-low border-surface-container-highest"
              }`}
            >
              {/* Default indicator */}
              {address.isDefault && (
                <div className="absolute inset-y-0 left-0 w-1 bg-error" />
              )}

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface-variant">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {address.isDefault && (
                    <span className="font-accent-label text-[10px] tracking-widest text-error bg-error/10 px-2 py-0.5 border border-error/20">
                      DEFAULT
                    </span>
                  )}
                </div>
                <p className="font-body-md text-body-sm text-on-surface">{address.street}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {address.city}, {address.state}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant/60">Nigeria</p>
              </div>

              <div className="flex items-center gap-3">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="font-accent-label text-[10px] tracking-widest text-on-surface-variant hover:text-error border-b border-transparent hover:border-error transition-all duration-200 pb-0.5"
                  >
                    SET DEFAULT
                  </button>
                )}
                <button
                  onClick={() => startEdit(address)}
                  className="bg-surface-container border border-surface-container-highest text-on-surface px-4 py-2 font-button-text text-button-text hover:bg-surface-container-high transition-colors duration-200"
                >
                  EDIT
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="bg-transparent border border-surface-container-highest text-on-surface-variant px-4 py-2 font-button-text text-button-text hover:text-error hover:border-error transition-colors duration-200"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
