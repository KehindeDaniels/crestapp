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
        <h2 className="text-sm font-semibold text-black sm:text-lg sm:text-foreground">
          {title}
        </h2>
        {showSeeAll && (
          <Link
            href="/search"
            className="text-xs font-normal text-muted-foreground sm:text-sm sm:font-medium sm:text-primary"
          >
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
        <div className="scrollbar-thin-custom grid grid-cols-2 gap-3 sm:flex sm:gap-6 sm:overflow-x-auto sm:pb-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
