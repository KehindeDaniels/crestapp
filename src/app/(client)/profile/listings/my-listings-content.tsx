"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyProperties, PropertySearchResultCard, Pagination } from "@/features/properties";

/**
 * `POST /api/properties/my-properties` — real endpoint, no saved response
 * example (assumed to mirror `search`'s `{properties, pagination}` shape,
 * same as every other property-list endpoint). See
 * docs/design-vs-backend-gaps.md, Phase 12.
 */
export function MyListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");

  const { data, isPending, isError } = useMyProperties({ per_page: 12, page });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-10">
      <Link href="/profile" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ChevronLeft className="size-4" />
        Back to Profile
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold sm:text-2xl">My Listing</h1>
          <p className="text-sm text-muted-foreground">Properties you&apos;ve listed on Crest</p>
        </div>
        <Button asChild size="sm">
          <Link href="/properties/new">
            <PlusSquare className="size-4" />
            List a property
          </Link>
        </Button>
      </div>

      {isPending && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <p className="p-6 text-center text-sm text-destructive">
          Couldn&apos;t load your listings right now.
        </p>
      )}

      {!isPending && !isError && data?.properties.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-muted/30 px-6 py-16 text-center">
          <p className="text-base font-semibold">You haven&apos;t listed any properties yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            List your first property to start receiving offers from buyers and tenants.
          </p>
          <Button asChild className="mt-2">
            <Link href="/properties/new">List a property</Link>
          </Button>
        </div>
      )}

      {data && data.properties.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.properties.map((property) => (
            <PropertySearchResultCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {data && data.pagination.last_page > 1 && (
        <Pagination
          currentPage={data.pagination.current_page}
          lastPage={data.pagination.last_page}
          onPageChange={(p) => router.push(`/profile/listings?page=${p}`)}
        />
      )}
    </div>
  );
}
