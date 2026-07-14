"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import {
  FilterDropdown,
  PropertyFeatureFilter,
  PRICE_RANGE_BUCKETS,
  PROPERTY_PURPOSE_TABS,
} from "@/features/properties";
import { PROPERTY_TYPES, type PropertyPurpose } from "@/config/constants";

export interface SearchFilters {
  purpose: PropertyPurpose;
  search: string;
  propertyType: string;
  priceRangeIndex: string;
}

export function SearchPanel({
  filters,
  onChange,
}: {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}) {
  return (
    <div className="rounded-2xl bg-muted p-4.5">
      <div className="mb-4.5 flex gap-8 border-b pb-4.5">
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
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-[2]">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by location, price or type"
            className="h-12 border-transparent bg-background pl-9.5"
          />
        </div>

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
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-background"
          aria-label="More filters"
        >
          <SlidersHorizontal className="size-4.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
