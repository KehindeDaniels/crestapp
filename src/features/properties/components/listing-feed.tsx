import Link from "next/link";
import { Loader2 } from "lucide-react";
import { PropertyCard } from "./property-card";
import type { PropertyCardModel } from "../models";

export function ListingFeed({
  title = "Recent Listing",
  properties,
  isLoading,
  isError,
  showSeeAll = true,
}: {
  title?: string;
  properties: PropertyCardModel[] | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Search Property reuses this component for its own "Recent Listing" section at the bottom — no point linking to itself. */
  showSeeAll?: boolean;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {showSeeAll && (
          <Link href="/search" className="text-sm font-medium text-primary">
            See all
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="flex h-54.25 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Couldn&apos;t load listings right now.
        </p>
      )}

      {properties && properties.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No properties match these filters yet.
        </p>
      )}

      {properties && properties.length > 0 && (
        <div className="scrollbar-thin-custom flex gap-6 overflow-x-auto pb-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
