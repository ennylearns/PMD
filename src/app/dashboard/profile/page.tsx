"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setIsSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        await update({ name });
        setMessage("Profile updated successfully");
        setIsEditing(false);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update profile");
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <header className="flex justify-between items-end border-b border-surface-container-highest pb-4">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">
          PROFILE
        </h2>
      </header>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 border font-body-sm text-body-sm ${
          message.includes("success")
            ? "border-on-surface/20 bg-surface-container text-on-surface"
            : "border-error/30 bg-error-container/20 text-error"
        }`}>
          {message}
        </div>
      )}

      <div className="bg-surface-container border border-surface-container-highest p-8 flex flex-col gap-8">
        {/* Avatar / Initials */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-surface-container-highest border border-outline-variant flex items-center justify-center">
            <span className="font-headline-lg text-headline-lg-mobile text-on-surface-variant">
              {(session?.user?.name || "?")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="font-accent-label text-accent-label text-on-background">
              {session?.user?.name || "—"}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {session?.user?.email || "—"}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-surface-container-highest" />

        {/* Name Field */}
        <div className="flex flex-col gap-2">
          <label className="font-accent-label text-accent-label text-on-surface-variant">
            FULL NAME
          </label>
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-md bg-surface-container-low border border-surface-container-highest text-on-surface px-4 py-3 font-body-md text-body-sm outline-none focus:border-error transition-colors duration-200"
            />
          ) : (
            <p className="font-body-md text-body-sm text-on-surface py-3">
              {session?.user?.name || "—"}
            </p>
          )}
        </div>

        {/* Email Field (read-only) */}
        <div className="flex flex-col gap-2">
          <label className="font-accent-label text-accent-label text-on-surface-variant">
            EMAIL
          </label>
          <p className="font-body-md text-body-sm text-on-surface py-3">
            {session?.user?.email || "—"}
          </p>
          <p className="font-body-sm text-[12px] text-on-surface-variant/50">
            Email cannot be changed
          </p>
        </div>

        {/* Role Badge */}
        <div className="flex flex-col gap-2">
          <label className="font-accent-label text-accent-label text-on-surface-variant">
            ROLE
          </label>
          <div className="inline-flex w-max items-center gap-2 px-3 py-1.5 border border-surface-container-highest bg-surface-container-low">
            <span className="w-1.5 h-1.5 rounded-full bg-error" />
            <span className="font-accent-label text-[10px] tracking-widest text-on-surface-variant">
              CUSTOMER
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-on-surface text-surface px-6 py-3 font-button-text text-button-text tracking-wider hover:bg-error hover:text-primary-container transition-all duration-200 disabled:opacity-50"
              >
                {isSaving ? "SAVING..." : "SAVE CHANGES"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(session?.user?.name || "");
                }}
                className="bg-surface-container border border-surface-container-highest text-on-surface px-6 py-3 font-button-text text-button-text hover:bg-surface-container-high transition-colors duration-200"
              >
                CANCEL
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-surface-container border border-surface-container-highest text-on-surface px-6 py-3 font-button-text text-button-text hover:bg-surface-container-high transition-colors duration-200"
            >
              EDIT PROFILE
            </button>
          )}
        </div>
      </div>
    </>
  );
}
