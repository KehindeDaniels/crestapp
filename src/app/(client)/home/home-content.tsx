"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/features/profile";
import {
  usePropertySearch,
  PRICE_RANGE_BUCKETS,
  SearchPanel,
  ListingFeed,
  type SearchFilters,
} from "@/features/properties";
import { KycReminderCard } from "@/features/kyc";
import type { PropertyType } from "@/config/constants";
import { ListPropertiesBanner } from "./list-properties-banner";
import { MobileHomeHeader } from "./mobile-header";

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

  const { data, isPending, isError } = usePropertySearch({
    purpose: filters.purpose,
    search: debouncedSearch || undefined,
    property_type: (filters.propertyType || undefined) as PropertyType | undefined,
    min_price: bucket?.minPrice,
    max_price: bucket?.maxPrice,
    per_page: 10,
  });

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-10">
      <MobileHomeHeader />

      {/* Desktop only — mobile uses MobileHomeHeader instead (real Figma pull, different layout, not just a restyle). */}
      <div className="hidden sm:block">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{profile ? `, ${profile.firstName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Find verified homes near you
        </p>
      </div>

      <SearchPanel filters={filters} onChange={setFilters} />

      <ListingFeed
        properties={data?.properties}
        isLoading={isPending}
        isError={isError}
      />

      <KycReminderCard />

      <ListPropertiesBanner />
    </div>
  );
}
