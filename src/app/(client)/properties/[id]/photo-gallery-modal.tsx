"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import type { PropertyDetailCategory, PropertyDetailImage } from "@/features/properties";

const ALL_LABEL = "All";

export function PhotoGalleryModal({
  open,
  onOpenChange,
  categories,
  allImages,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: PropertyDetailCategory[];
  allImages: PropertyDetailImage[];
}) {
  const [activeCategory, setActiveCategory] = useState(ALL_LABEL);
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = useMemo(
    () => [
      { label: ALL_LABEL, count: allImages.length },
      ...categories.map((c) => ({ label: c.category, count: c.images.length })),
    ],
    [categories, allImages.length],
  );

  const images =
    activeCategory === ALL_LABEL
      ? allImages
      : (categories.find((c) => c.category === activeCategory)?.images ?? []);

  const current = images[activeIndex] ?? images[0];

  function selectCategory(label: string) {
    setActiveCategory(label);
    setActiveIndex(0);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Property Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-6 border-b pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => selectCategory(tab.label)}
              className={cn(
                "text-sm font-medium",
                activeCategory === tab.label
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {current && (
          <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
            <Image
              src={current.url}
              alt={current.caption ?? ""}
              fill
              sizes="800px"
              className="object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() =>
                    setActiveIndex((i) => (i - 1 + images.length) % images.length)
                  }
                  className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
                  className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}
          </div>
        )}

        {images.length > 1 && (
          <div className="scrollbar-thin-custom flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-lg",
                  i === activeIndex && "ring-2 ring-primary",
                )}
              >
                <Image src={img.url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
