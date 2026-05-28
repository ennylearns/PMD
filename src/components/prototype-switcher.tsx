"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Variant {
  id: string;
  name: string;
}

interface PrototypeSwitcherProps {
  variants: Variant[];
}

export function PrototypeSwitcher({ variants }: PrototypeSwitcherProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentId = searchParams.get("variant") ?? variants[0]?.id;
  
  const currentIndex = variants.findIndex((v) => v.id === currentId);
  const safeIndex = currentIndex !== -1 ? currentIndex : 0;
  
  const currentVariant = variants[safeIndex];

  const handleNext = () => {
    const nextIndex = (safeIndex + 1) % variants.length;
    const newParams = new URLSearchParams(searchParams);
    newParams.set("variant", variants[nextIndex].id);
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  const handlePrev = () => {
    const prevIndex = (safeIndex - 1 + variants.length) % variants.length;
    const newParams = new URLSearchParams(searchParams);
    newParams.set("variant", variants[prevIndex].id);
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [safeIndex, variants, searchParams, pathname, router]);

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 bg-white text-black px-4 py-2 rounded-full shadow-2xl border border-gray-200 font-mono text-sm">
      <button 
        onClick={handlePrev}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Previous variant"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="font-semibold min-w-[200px] text-center">
        {currentVariant?.id} — {currentVariant?.name}
      </div>
      
      <button 
        onClick={handleNext}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Next variant"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
