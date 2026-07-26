"use client";

import Link from "next/link";
import { BedDouble, Loader2, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useMyShortlets } from "@/features/shortlets";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-green-100 text-green-800",
};

/**
 * Owner's own shortlet listings — `GET /api/shortlets`. Note: there's no
 * confirmed owner-facing bookings endpoint (plan Gap 1), so this manages
 * listings only; incoming-bookings visibility for owners is deferred until
 * that endpoint exists.
 */
export function ManageShortletsContent() {
  const { data: listings, isPending, isError } = useMyShortlets();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-10">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold sm:text-2xl">My shortlets</h1>
          <p className="text-sm text-muted-foreground">Listings you host for short stays</p>
        </div>
        <Button asChild size="sm">
          <Link href="/shortlets/manage/new">
            <Plus className="size-4" />
            Add shortlet
          </Link>
        </Button>
      </div>

      {isPending && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <p className="p-6 text-center text-sm text-destructive">Couldn&apos;t load your shortlets.</p>
      )}

      {!isPending && !isError && listings?.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-muted/30 px-6 py-16 text-center">
          <p className="text-base font-semibold">No shortlets yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create a listing, add at least one room, then activate it to start taking bookings.
          </p>
          <Button asChild className="mt-2">
            <Link href="/shortlets/manage/new">Add your first shortlet</Link>
          </Button>
        </div>
      )}

      {listings && listings.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link
              key={listing.listingId}
              href={`/shortlets/manage/view?id=${listing.listingId}`}
              className="flex flex-col gap-2 rounded-2xl border p-4 transition-colors hover:bg-accent"
            >
              <div className="aspect-video w-full rounded-xl bg-muted" />
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{listing.title}</p>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                    STATUS_STYLES[listing.status] ?? "bg-muted text-muted-foreground",
                  )}
                >
                  {listing.status}
                </span>
              </div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                {listing.city}
              </p>
              <div className="flex items-center justify-between pt-1">
                <p className="text-sm font-bold">
                  {listing.pricePerNightFormatted}
                  <span className="text-xs font-normal text-muted-foreground"> / night</span>
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BedDouble className="size-3.5" />
                  {listing.roomCount} {listing.roomCount === 1 ? "room" : "rooms"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
