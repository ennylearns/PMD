"use client";

import { useState } from "react";

type Variant = {
  id: string;
  color: string;
  size: string;
  sku: string;
  inventory: { stock: number } | null;
};

type VariantSelectorProps = {
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelect: (variant: Variant) => void;
};

const colorHexMap: Record<string, string> = {
  Black: "#0a0a0a",
  White: "#f5f5f5",
  Grey: "#6b6b6b",
  "Dark Grey": "#3a3a3a",
  Charcoal: "#2d2d2d",
  Maroon: "#5a1a1a",
  Red: "#8b1a1a",
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function VariantSelector({
  variants,
  selectedVariant,
  onSelect,
}: VariantSelectorProps) {
  const uniqueColors = [...new Set(variants.map((v) => v.color))];
  const [selectedColor, setSelectedColor] = useState<string>(
    selectedVariant?.color || uniqueColors[0] || ""
  );

  const sizesForColor = variants
    .filter((v) => v.color === selectedColor)
    .sort(
      (a, b) =>
        SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
    );

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Auto-select first available size in this color
    const firstAvailable = variants.find(
      (v) => v.color === color && (v.inventory?.stock || 0) > 0
    );
    if (firstAvailable) {
      onSelect(firstAvailable);
    }
  };

  const handleSizeSelect = (variant: Variant) => {
    if ((variant.inventory?.stock || 0) > 0) {
      onSelect(variant);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Color Selector */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-accent-label text-on-surface-variant/60 uppercase tracking-[0.2em]">
            Color
          </span>
          <span className="text-xs font-body-md text-on-surface">
            {selectedColor}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {uniqueColors.map((color) => {
            const isActive = selectedColor === color;
            const hasStock = variants.some(
              (v) => v.color === color && (v.inventory?.stock || 0) > 0
            );
            return (
              <button
                key={color}
                id={`color-swatch-${color.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => handleColorSelect(color)}
                disabled={!hasStock}
                title={color}
                className={`
                  relative w-10 h-10 rounded-full transition-all duration-200
                  ${isActive ? "ring-2 ring-error ring-offset-2 ring-offset-surface" : ""}
                  ${!hasStock ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:scale-110"}
                `}
                style={{ backgroundColor: colorHexMap[color] || "#555" }}
              >
                {!hasStock && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="block w-[130%] h-[1px] bg-on-surface/60 rotate-45 absolute" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selector */}
      <div>
        <span className="block text-xs font-accent-label text-on-surface-variant/60 uppercase tracking-[0.2em] mb-3">
          Size
        </span>
        <div className="flex flex-wrap gap-2">
          {sizesForColor.map((variant) => {
            const stock = variant.inventory?.stock || 0;
            const isAvailable = stock > 0;
            const isSelected = selectedVariant?.id === variant.id;

            return (
              <button
                key={variant.id}
                id={`size-btn-${variant.size.toLowerCase()}`}
                onClick={() => handleSizeSelect(variant)}
                disabled={!isAvailable}
                className={`
                  relative min-w-[52px] h-12 px-4 text-sm font-button-text uppercase tracking-wider
                  transition-all duration-200 ghost-border
                  ${
                    isSelected
                      ? "bg-[#f5f5f5] text-[#131313] border-[#f5f5f5]"
                      : isAvailable
                        ? "bg-transparent text-on-surface hover:border-on-surface-variant"
                        : "bg-transparent text-on-surface/20 border-surface-container-high cursor-not-allowed line-through"
                  }
                `}
              >
                {variant.size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
