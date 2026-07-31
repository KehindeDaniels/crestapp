"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PROPERTY_AMENITIES } from "@/config/constants";

/**
 * Multi-select amenity chips — matches the mobile app's amenities step. Values
 * are the canonical `PROPERTY_AMENITIES` labels, sent/stored as-is in the
 * backend's `amenities` string array.
 */
export function AmenitiesPicker({
  selected,
  onChange,
  options = [...PROPERTY_AMENITIES],
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  options?: string[];
}) {
  function toggle(amenity: string) {
    onChange(
      selected.includes(amenity)
        ? selected.filter((a) => a !== amenity)
        : [...selected, amenity],
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((amenity) => {
        const on = selected.includes(amenity);
        return (
          <button
            key={amenity}
            type="button"
            onClick={() => toggle(amenity)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
              on
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {on && <Check className="size-3.5" />}
            {amenity}
          </button>
        );
      })}
    </div>
  );
}
