"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ID } from "@/types/api";
import { useSavedPropertiesStore } from "../store";

/**
 * Shared heart-toggle logic for every "save this property" spot in the app
 * (Home feed, Search grid, Listing Detail header, mobile gallery). Each
 * call site keeps its own wrapper styling (white circle, inline, etc.) via
 * `className`/`iconClassName` — only the toggle behavior and filled/unfilled
 * icon state live here, so it isn't duplicated per component.
 */
export function SaveButton({
  propertyId,
  className,
  iconClassName,
}: {
  propertyId: ID;
  className?: string;
  iconClassName?: string;
}) {
  const isSaved = useSavedPropertiesStore((s) => s.isSaved(propertyId));
  const toggle = useSavedPropertiesStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(propertyId);
      }}
      aria-label={isSaved ? "Remove from saved properties" : "Save property"}
      aria-pressed={isSaved}
      className={className}
    >
      <Heart
        className={cn(iconClassName, isSaved && "fill-destructive text-destructive")}
      />
    </button>
  );
}
