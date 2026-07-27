"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { PROPERTY_TYPES, type PropertyPurpose } from "@/config/constants";
import { FilterDropdown } from "./filter-dropdown";
import { PropertyFeatureFilter } from "./property-feature-filter";
import { PRICE_RANGE_BUCKETS, PROPERTY_PURPOSE_TABS } from "../config";

export interface SearchFilters {
  purpose: PropertyPurpose;
  search: string;
  propertyType: string;
  priceRangeIndex: string;
}

/**
 * Shared between Home (local state) and Search Property (URL-synced
 * state) — same `filters`/`onChange` contract either way. Only Home
 * actually uses this component (Search Property builds its own inline
 * filter row, matching a different Figma layout).
 *
 * Mobile layout confirmed against a real Figma mobile pull (node
 * 570:1225, not inferred from a screenshot): no shared bordered card
 * wrapping everything — tabs and the search input are independent
 * elements with their own backgrounds. Tabs are a segmented control (gray
 * track, white rounded-[6px] active pill with a subtle shadow — not a
 * fully-rounded pill), search input is rounded-full. The Property Type/
 * Price Range/Property Feature/more-filters row is hidden entirely on
 * mobile. Desktop keeps the original bordered-card + underline-tabs +
 * full filter row.
 */
export function SearchPanel({
  filters,
  onChange,
}: {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:gap-0 sm:rounded-2xl sm:border sm:bg-background sm:p-4">
      {/* Mobile: segmented control, no active-pill full-rounding */}
      <div className="flex h-14.25 items-center gap-2 rounded-xl bg-[rgba(229,231,235,0.5)] p-1.5 sm:hidden">
        {PROPERTY_PURPOSE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange({ ...filters, purpose: tab.value })}
            className={cn(
              "flex-1 rounded-md py-2.5 text-sm font-medium transition-colors",
              filters.purpose === tab.value
                ? "bg-white text-[#061d52] font-semibold shadow-[0px_8px_8px_rgba(0,0,0,0.12)]"
                : "text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
        {/* Shortlet is a different search (needs dates → separate endpoint),
            so this tab NAVIGATES to /shortlets rather than toggling `purpose`. */}
        <Link
          href="/shortlets"
          className="flex flex-1 items-center justify-center rounded-md py-2.5 text-sm font-medium text-foreground transition-colors"
        >
          Shortlet
        </Link>
      </div>

      {/* Desktop: underline tabs */}
      <div className="mb-4 hidden gap-8 border-b pb-3.5 sm:flex">
        {PROPERTY_PURPOSE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange({ ...filters, purpose: tab.value })}
            className={cn(
              "pb-1 text-sm font-medium transition-colors",
              filters.purpose === tab.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
        {/* Navigates to the dedicated shortlet search (date-based) — see above. */}
        <Link href="/shortlets" className="pb-1 text-sm font-medium text-muted-foreground transition-colors">
          Shortlet
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground sm:left-3.5" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by location, price or type"
          className="h-12 rounded-full border-transparent bg-[#f9fafb] pl-10 text-xs placeholder:text-black/45 sm:rounded-lg sm:bg-muted sm:pl-9.5 sm:text-sm sm:placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-3 hidden gap-3 sm:flex">
        <FilterDropdown
          label="Property Type"
          value={filters.propertyType}
          onChange={(v) => onChange({ ...filters, propertyType: v })}
          options={PROPERTY_TYPES.map((t) => ({
            value: t,
            label: t.charAt(0).toUpperCase() + t.slice(1),
          }))}
        />

        <FilterDropdown
          label="Price Range"
          value={filters.priceRangeIndex}
          onChange={(v) => onChange({ ...filters, priceRangeIndex: v })}
          options={PRICE_RANGE_BUCKETS.map((bucket, i) => ({
            value: String(i),
            label: bucket.label,
          }))}
        />

        <PropertyFeatureFilter />

        <button
          type="button"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted"
          aria-label="More filters"
        >
          <SlidersHorizontal className="size-4.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
