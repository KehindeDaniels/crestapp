"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/features/profile";
import { usePropertySearch, PRICE_RANGE_BUCKETS } from "@/features/properties";
import { KycReminderCard } from "@/features/kyc";
import type { PropertyType } from "@/config/constants";
import { SearchPanel, type SearchFilters } from "./search-panel";
import { ListingFeed } from "./listing-feed";
import { ListPropertiesBanner } from "./list-properties-banner";

const DEFAULT_FILTERS: SearchFilters = {
  purpose: "sale",
  search: "",
  propertyType: "",
  priceRangeIndex: "",
};

export function HomeContent() {
  const { data: profile } = useProfile();
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(filters.search), 400);
    return () => clearTimeout(id);
  }, [filters.search]);

  // Number("") === 0, which would silently select the first bucket instead
  // of "no filter" — guard explicitly rather than relying on `bucket?.` alone.
  const bucket =
    filters.priceRangeIndex === ""
      ? undefined
      : PRICE_RANGE_BUCKETS[Number(filters.priceRangeIndex)];

  const { data: properties, isPending, isError } = usePropertySearch({
    purpose: filters.purpose,
    search: debouncedSearch || undefined,
    property_type: (filters.propertyType || undefined) as PropertyType | undefined,
    min_price: bucket?.minPrice,
    max_price: bucket?.maxPrice,
    per_page: 10,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{profile ? `, ${profile.firstName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Find verified homes near you
        </p>
      </div>

      <SearchPanel filters={filters} onChange={setFilters} />

      <ListingFeed properties={properties} isLoading={isPending} isError={isError} />

      <KycReminderCard />

      <ListPropertiesBanner />
    </div>
  );
}
