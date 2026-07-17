"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
  usePropertySearch,
  PropertySearchResultCard,
  ListingFeed,
  Pagination,
  FilterDropdown,
  PropertyFeatureFilter,
  PRICE_RANGE_BUCKETS,
  PROPERTY_PURPOSE_TABS,
} from "@/features/properties";
import { PROPERTY_TYPES, type PropertyPurpose, type PropertyType } from "@/config/constants";

const PER_PAGE = 9;

/**
 * Filter/page state lives entirely in the URL (not component state) so a
 * shared search URL reproduces the same results — the one real behavior
 * difference from Home's local-state SearchPanel usage, per
 * docs/design/search-and-listing-detail-plan.md.
 */
export function SearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const purpose = (searchParams.get("purpose") as PropertyPurpose) || "sale";
  const search = searchParams.get("q") ?? "";
  const propertyType = searchParams.get("type") ?? "";
  const priceRangeIndex = searchParams.get("price") ?? "";
  const page = Number(searchParams.get("page")) || 1;

  const [searchInput, setSearchInput] = useState(search);
  // Deferred via setTimeout(0) rather than called synchronously in the
  // effect body — re-syncing local state when the URL changes externally
  // (e.g. "Reset Filter", browser back/forward) is a genuine response to a
  // dependency changing, but react-hooks/set-state-in-effect still flags any
  // direct setState call in an effect body regardless of intent.
  useEffect(() => {
    const id = setTimeout(() => setSearchInput(search), 0);
    return () => clearTimeout(id);
  }, [search]);

  const updateParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") params.delete(key);
        else params.set(key, String(value));
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  // Debounced search text -> URL, reset to page 1 on a real filter change.
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchInput !== search) updateParams({ q: searchInput, page: undefined });
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const bucket =
    priceRangeIndex === "" ? undefined : PRICE_RANGE_BUCKETS[Number(priceRangeIndex)];

  const { data, isPending, isError } = usePropertySearch({
    purpose,
    search: search || undefined,
    property_type: (propertyType || undefined) as PropertyType | undefined,
    min_price: bucket?.minPrice,
    max_price: bucket?.maxPrice,
    per_page: PER_PAGE,
    page,
  });

  const {
    data: recentData,
    isPending: isRecentPending,
    isError: isRecentError,
  } = usePropertySearch({ per_page: 10 });

  const resultCount = data?.pagination.total ?? 0;

  const propertyTypeOptions = useMemo(
    () =>
      PROPERTY_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) })),
    [],
  );
  const priceOptions = useMemo(
    () => PRICE_RANGE_BUCKETS.map((b, i) => ({ value: String(i), label: b.label })),
    [],
  );

  return (
    <div className="max-w-6xl space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Find your perfect property
          </h1>
          <p className="text-sm text-muted-foreground">
            Search, rent, buy or list properties easily
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by location, price or type"
              className="h-11 w-full bg-muted pl-9.5 sm:w-72"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.replace(pathname)}
          >
            Reset Filter
          </Button>
        </div>
      </div>

      <div className="flex gap-8 border-b pb-3.5">
        {PROPERTY_PURPOSE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => updateParams({ purpose: tab.value, page: undefined })}
            className={cn(
              "pb-1 text-sm font-medium transition-colors",
              purpose === tab.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
          <FilterDropdown
            label="Property Type"
            value={propertyType}
            onChange={(v) => updateParams({ type: v, page: undefined })}
            options={propertyTypeOptions}
          />
          <FilterDropdown
            label="Price Range"
            value={priceRangeIndex}
            onChange={(v) => updateParams({ price: v, page: undefined })}
            options={priceOptions}
          />
          <PropertyFeatureFilter />
        </div>
        <Button asChild className="shrink-0">
          <Link href="/properties/new">+ Upload New Article</Link>
        </Button>
      </div>

      <div className="rounded-2xl bg-muted p-5">
        <h2 className="mb-4 text-base font-semibold">
          Lists by search ({resultCount} results)
        </h2>

        {isPending && (
          <p className="text-sm text-muted-foreground">Loading properties…</p>
        )}
        {isError && (
          <p className="text-sm text-destructive">
            Couldn&apos;t load properties right now.
          </p>
        )}
        {data && data.properties.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No properties match these filters.
          </p>
        )}

        {data && data.properties.length > 0 && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.properties.map((property) => (
              <PropertySearchResultCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {data && (
          <div className="mt-8">
            <Pagination
              currentPage={data.pagination.current_page}
              lastPage={data.pagination.last_page}
              onPageChange={(p) => updateParams({ page: p })}
            />
          </div>
        )}
      </div>

      <ListingFeed
        properties={recentData?.properties}
        isLoading={isRecentPending}
        isError={isRecentError}
        showSeeAll={false}
      />
    </div>
  );
}
