"use client";

import { useState } from "react";
import Image from "next/image";

type ImageGalleryProps = {
  images: string[];
  productName: string;
};

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-surface-container-lowest ghost-border flex items-center justify-center">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-surface-container-high"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-container-lowest ghost-border group">
        <Image
          src={images[activeIndex]}
          alt={`${productName} - Image ${activeIndex + 1}`}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        <div className="absolute inset-0 distress-overlay mix-blend-overlay pointer-events-none" />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, index) => (
            <button
              key={index}
              id={`gallery-thumb-${index}`}
              onClick={() => setActiveIndex(index)}
              className={`
                relative w-16 h-20 overflow-hidden ghost-border transition-all duration-200
                ${activeIndex === index ? "border-error" : "opacity-50 hover:opacity-80"}
              `}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
