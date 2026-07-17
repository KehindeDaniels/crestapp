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
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h2 className="sm:text-foreground text-sm font-semibold text-black sm:text-lg">
          {title}
        </h2>
        {showSeeAll && (
          <Link
            href="/search"
            className="text-muted-foreground sm:text-primary text-xs font-normal sm:text-sm sm:font-medium"
          >
            See all
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="flex h-54.25 items-center justify-center">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      )}

      {isError && (
        <p className="text-destructive text-sm">
          Couldn&apos;t load listings right now.
        </p>
      )}

      {properties && properties.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No properties match these filters yet.
        </p>
      )}

      {properties && properties.length > 0 && (
        <div className="scrollbar-thin-custom flex gap-4 overflow-x-auto pb-3 sm:gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
