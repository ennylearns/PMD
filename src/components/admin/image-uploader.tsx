"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { X, Image as ImageIcon, Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";

type ImageUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
};

export function ImageUploader({ value = [], onChange, maxImages = 5 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    
    // Check limit
    if (value.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setError(null);

    const newUrls: string[] = [];

    try {
      // Upload files sequentially or in parallel
      for (const file of files) {
        // Simple client-side validation
        if (!file.type.startsWith("image/")) {
          throw new Error(`File ${file.name} is not an image.`);
        }
        
        // 5MB limit check (optional but good practice)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 5MB limit.`);
        }

        const newBlob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        
        newUrls.push(newBlob.url);
      }

      onChange([...value, ...newUrls]);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {error && (
        <div className="bg-error/10 border border-error text-error p-3 text-sm font-body-sm">
          {error}
        </div>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {value.map((url, index) => (
            <div key={url} className="relative aspect-square border border-surface-container-highest group overflow-hidden bg-surface-container">
              <Image
                src={url}
                alt={`Product Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-on-primary text-[10px] font-accent-label uppercase tracking-widest px-2 py-1">
                  Primary
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-background/80 text-error p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                title="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          
          {/* Add more box if not at limit */}
          {value.length < maxImages && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="aspect-square border border-dashed border-surface-container-highest flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="animate-spin" size={24} /> : <ImageIcon size={24} />}
              <span className="text-[10px] font-accent-label uppercase tracking-widest">Add More</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State / Upload Button */}
      {value.length === 0 && (
        <div 
          className="border-2 border-dashed border-surface-container-highest p-8 md:p-12 flex flex-col items-center justify-center gap-4 text-center cursor-pointer hover:bg-surface-container transition-colors"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="animate-spin text-on-surface-variant" size={48} />
          ) : (
            <UploadCloud className="text-on-surface-variant" size={48} />
          )}
          <div className="flex flex-col gap-1">
            <h3 className="font-accent-label text-sm uppercase tracking-widest text-on-surface">
              {isUploading ? "Uploading..." : "Click to Upload Images"}
            </h3>
            <p className="font-body-sm text-sm text-on-surface-variant">
              Please upload 1 picture per color. Max {maxImages} images. First image is primary.
            </p>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp, image/gif"
        multiple
        className="hidden"
      />
    </div>
  );
}
