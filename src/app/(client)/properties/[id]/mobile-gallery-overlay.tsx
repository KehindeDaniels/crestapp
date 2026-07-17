"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Heart, LayoutGrid, List as ListIcon, Share2, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import type { PropertyDetailCategory, PropertyDetailImage } from "@/features/properties";

const ALL_LABEL = "All";

/**
 * Mobile-only full-screen photo browser — matches two real Figma mobile
 * pulls (node 72:7044 "list" and node 72:7174 "grid"), a genuinely
 * different pattern from the desktop `PhotoGalleryModal`'s single-image +
 * thumbnail-strip viewer. Toggled between a 3-column grid and a
 * single-column scrolling list via the header icon; category tabs filter
 * which images show in either mode. Heart/Share are presentational only —
 * same "visible but non-functional" treatment used for favorites
 * elsewhere (no backend endpoint, see docs/design/home-page-data-plan.md §7).
 */
export function MobileGalleryOverlay({
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
  const [mode, setMode] = useState<"grid" | "list">("grid");

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="inset-0 top-0 left-0 h-full max-h-none w-full max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 p-0"
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close gallery"
              className="flex size-9 items-center justify-center rounded-full border"
            >
              <X className="size-4.5" />
            </button>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMode((m) => (m === "grid" ? "list" : "grid"))}
                aria-label={mode === "grid" ? "Switch to list view" : "Switch to grid view"}
              >
                {mode === "grid" ? (
                  <ListIcon className="size-6 text-foreground" />
                ) : (
                  <LayoutGrid className="size-6 text-foreground" />
                )}
              </button>
              <Heart className="size-6 text-foreground" />
              <Share2 className="size-5 text-foreground" />
            </div>
          </div>

          <div className="scrollbar-none flex gap-2 overflow-x-auto border-b px-4 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveCategory(tab.label)}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-2 text-xs whitespace-nowrap",
                  activeCategory === tab.label
                    ? "font-bold text-foreground"
                    : "font-normal text-foreground",
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {images.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No photos in this category.</p>
          )}

          {mode === "grid" ? (
            <div className="grid grid-cols-3 gap-1">
              {images.map((img, i) => (
                <div key={img.url + i} className="relative aspect-[134/116]">
                  <Image
                    src={img.url}
                    alt={img.caption ?? ""}
                    fill
                    sizes="34vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {images.map((img, i) => (
                <div key={img.url + i} className="relative aspect-[411/245] w-full">
                  <Image
                    src={img.url}
                    alt={img.caption ?? ""}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
