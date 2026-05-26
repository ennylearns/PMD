"use client";

import { useCallback, useEffect, useState } from "react";
import { formatNaira } from "@/lib/delivery";

type DeliveryCity = {
  id: string;
  name: string;
  overrideFee: number | null;
};

type DeliveryState = {
  id: string;
  name: string;
  defaultFee: number;
  cities: DeliveryCity[];
};

export default function AdminDeliveryFeesPage() {
  const [states, setStates] = useState<DeliveryState[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStateId, setExpandedStateId] = useState<string | null>(null);
  const [editingStateId, setEditingStateId] = useState<string | null>(null);
  const [editingCityId, setEditingCityId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchStates = useCallback(async () => {
    try {
      const res = await fetch("/api/delivery-fees");
      const data = await res.json();
      setStates(data.states ?? []);
    } catch {
      setFeedback({ type: "error", message: "Failed to load delivery data" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  function toggleExpand(stateId: string) {
    setExpandedStateId((current) => (current === stateId ? null : stateId));
    setEditingCityId(null);
  }

  function startEditState(state: DeliveryState) {
    setEditingStateId(state.id);
    setEditValue(String(state.defaultFee));
    setEditingCityId(null);
  }

  function startEditCity(city: DeliveryCity) {
    setEditingCityId(city.id);
    setEditValue(city.overrideFee != null ? String(city.overrideFee) : "");
    setEditingStateId(null);
  }

  function cancelEdit() {
    setEditingStateId(null);
    setEditingCityId(null);
    setEditValue("");
  }

  async function saveStateFee(stateId: string) {
    const fee = Number(editValue);
    if (isNaN(fee) || fee < 0) {
      setFeedback({ type: "error", message: "Fee must be a non-negative number" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/delivery-fees/states/${stateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultFee: fee }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      setStates((current) =>
        current.map((s) => (s.id === stateId ? { ...s, defaultFee: fee } : s))
      );
      setFeedback({ type: "success", message: "State fee updated" });
      cancelEdit();
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Update failed" });
    } finally {
      setSaving(false);
    }
  }

  async function saveCityFee(cityId: string) {
    const overrideFee = editValue.trim() === "" ? null : Number(editValue);
    if (overrideFee !== null && (isNaN(overrideFee) || overrideFee < 0)) {
      setFeedback({ type: "error", message: "Fee must be a non-negative number or empty to clear" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/delivery-fees/cities/${cityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrideFee }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      setStates((current) =>
        current.map((s) => ({
          ...s,
          cities: s.cities.map((c) =>
            c.id === cityId ? { ...c, overrideFee } : c
          ),
        }))
      );
      setFeedback({ type: "success", message: overrideFee === null ? "Override cleared" : "City fee updated" });
      cancelEdit();
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Update failed" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <header className="border-b border-surface-container-highest pb-6">
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background uppercase">
            Delivery Logistics
          </h1>
          <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-2">
            Configure State & City Delivery Fees
          </p>
        </header>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-on-surface-variant font-accent-label text-xs uppercase tracking-[0.2em]">
            <div className="w-5 h-5 border-2 border-on-surface-variant/30 border-t-error rounded-full animate-spin" />
            Loading delivery data
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="border-b border-surface-container-highest pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background uppercase">
            Delivery Logistics
          </h1>
          <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase mt-2">
            Configure State & City Delivery Fees
          </p>
        </div>
        <div className="flex items-center gap-6 font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-error/80"></span>
            {states.length} states
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-on-surface-variant/50"></span>
            {states.reduce((sum, s) => sum + s.cities.length, 0)} cities
          </span>
        </div>
      </header>

      {/* Feedback toast */}
      {feedback && (
        <div
          className={`border p-4 font-accent-label text-xs tracking-widest uppercase transition-all duration-300 ${
            feedback.type === "success"
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : "border-error/40 bg-error-container/20 text-error"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* State table */}
      <div className="border border-surface-container-highest bg-surface-container-lowest overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container border-b border-surface-container-highest">
          <div className="col-span-1 font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase">
            #
          </div>
          <div className="col-span-5 font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase">
            State
          </div>
          <div className="col-span-3 font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase">
            Default Fee
          </div>
          <div className="col-span-2 font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase text-center">
            Cities
          </div>
          <div className="col-span-1 font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase text-right">
            Edit
          </div>
        </div>

        {/* State Rows */}
        {states.map((state, index) => {
          const isExpanded = expandedStateId === state.id;
          const isEditing = editingStateId === state.id;

          return (
            <div key={state.id}>
              {/* State Row */}
              <div
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-surface-container-highest transition-colors duration-200 ${
                  isExpanded ? "bg-error/5" : "hover:bg-surface-container/50"
                }`}
              >
                <div className="col-span-1 font-accent-label text-[10px] tracking-widest text-on-surface-variant">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="col-span-5">
                  <button
                    type="button"
                    onClick={() => toggleExpand(state.id)}
                    className="flex items-center gap-3 group w-full text-left"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`text-on-surface-variant/50 transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span className="font-body-md text-sm text-on-surface group-hover:text-error transition-colors">
                      {state.name}
                    </span>
                  </button>
                </div>

                <div className="col-span-3">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-on-surface-variant text-sm">₦</span>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveStateFee(state.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="w-24 bg-surface border border-error/40 px-3 py-1.5 text-on-surface font-body-md text-sm outline-none focus:border-error transition-colors"
                        autoFocus
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => saveStateFee(state.id)}
                        disabled={saving}
                        className="px-3 py-1.5 bg-error/20 border border-error/40 text-error font-accent-label text-[10px] tracking-widest uppercase hover:bg-error/30 transition-colors disabled:opacity-50"
                      >
                        {saving ? "..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-1.5 border border-surface-container-highest text-on-surface-variant font-accent-label text-[10px] tracking-widest uppercase hover:border-on-surface-variant transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span className="font-body-md text-sm text-on-surface tabular-nums">
                      {formatNaira(state.defaultFee)}
                    </span>
                  )}
                </div>

                <div className="col-span-2 text-center">
                  <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 border border-surface-container-highest bg-surface-container font-accent-label text-[10px] tracking-widest text-on-surface-variant">
                    {state.cities.length}
                  </span>
                </div>

                <div className="col-span-1 text-right">
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => startEditState(state)}
                      className="p-2 text-on-surface-variant hover:text-error transition-colors"
                      title="Edit default fee"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Cities */}
              {isExpanded && state.cities.length > 0 && (
                <div className="border-b border-surface-container-highest">
                  {state.cities.map((city) => {
                    const isEditingCity = editingCityId === city.id;
                    const effectiveFee = city.overrideFee ?? state.defaultFee;

                    return (
                      <div
                        key={city.id}
                        className="grid grid-cols-12 gap-4 px-6 py-3 items-center bg-surface-container/30 border-b border-surface-container-highest/50 last:border-b-0"
                      >
                        <div className="col-span-1"></div>

                        <div className="col-span-5 pl-9">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/30"></span>
                            <span className="font-body-md text-sm text-on-surface-variant">
                              {city.name}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-3">
                          {isEditingCity ? (
                            <div className="flex items-center gap-2">
                              <span className="text-on-surface-variant text-sm">₦</span>
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveCityFee(city.id);
                                  if (e.key === "Escape") cancelEdit();
                                }}
                                placeholder={String(state.defaultFee)}
                                className="w-24 bg-surface border border-error/40 px-3 py-1.5 text-on-surface font-body-md text-sm outline-none focus:border-error transition-colors placeholder:text-on-surface-variant/30"
                                autoFocus
                                min="0"
                              />
                              <button
                                type="button"
                                onClick={() => saveCityFee(city.id)}
                                disabled={saving}
                                className="px-3 py-1.5 bg-error/20 border border-error/40 text-error font-accent-label text-[10px] tracking-widest uppercase hover:bg-error/30 transition-colors disabled:opacity-50"
                              >
                                {saving ? "..." : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-3 py-1.5 border border-surface-container-highest text-on-surface-variant font-accent-label text-[10px] tracking-widest uppercase hover:border-on-surface-variant transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-body-md text-sm text-on-surface tabular-nums">
                                {formatNaira(effectiveFee)}
                              </span>
                              {city.overrideFee != null && (
                                <span className="font-accent-label text-[9px] tracking-widest text-error uppercase px-1.5 py-0.5 border border-error/30 bg-error/10">
                                  Override
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="col-span-2"></div>

                        <div className="col-span-1 text-right">
                          {!isEditingCity && (
                            <button
                              type="button"
                              onClick={() => startEditCity(city)}
                              className="p-2 text-on-surface-variant hover:text-error transition-colors"
                              title="Edit city override"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty city state */}
              {isExpanded && state.cities.length === 0 && (
                <div className="px-6 py-6 bg-surface-container/30 border-b border-surface-container-highest text-center">
                  <p className="font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                    No cities configured for this state
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 font-accent-label text-[10px] tracking-widest text-on-surface-variant uppercase">
        <span className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-on-surface-variant/30"></span>
          Default: State base fee applied to all cities
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block px-1.5 py-0.5 border border-error/30 bg-error/10 text-error text-[9px]">Override</span>
          City-specific fee replaces state default
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-on-surface-variant/10"></span>
          Empty override field clears the override
        </span>
      </div>
    </div>
  );
}
