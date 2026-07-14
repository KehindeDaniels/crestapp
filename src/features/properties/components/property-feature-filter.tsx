import { ChevronDown } from "lucide-react";

/**
 * Kept visually present per explicit decision (docs/design/home-page-data-plan.md
 * §7) — the search schema has no amenities/features field at all, so this is
 * disabled and sends nothing to the backend, not a functional filter.
 * Same prop-shape family as FilterDropdown so swapping in real options later
 * doesn't touch the search bar's layout.
 */
export function PropertyFeatureFilter() {
  return (
    <div
      className="relative flex h-12 flex-1 cursor-not-allowed items-center rounded-lg border bg-transparent px-3.5 pr-9 text-sm text-muted-foreground/60"
      title="Coming soon"
    >
      Property Feature
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground/60" />
    </div>
  );
}
