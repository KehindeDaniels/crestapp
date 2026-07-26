"use client";

import { useState } from "react";
import Link from "next/link";
import { BedDouble, Loader2, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useShortletSearch, type ShortletSearchParams } from "@/features/shortlets";

/**
 * Guest shortlet search — `POST /api/shortlets/search`. Check-in date and
 * nights are required (the backend needs them to compute availability); city,
 * guests, and price range are optional filters. Search only fires after the
 * user submits, so the query is null until then. See
 * docs/design/shortlet-implementation-plan.md.
 */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ShortletSearchContent() {
  const [checkIn, setCheckIn] = useState(todayIso());
  const [nights, setNights] = useState(2);
  const [city, setCity] = useState("");
  const [guests, setGuests] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [params, setParams] = useState<ShortletSearchParams | null>(null);

  const { data, isFetching, isError } = useShortletSearch(params);

  function handleSearch() {
    if (!checkIn || nights < 1) return;
    setParams({
      check_in_date: checkIn,
      nights,
      city: city.trim() || undefined,
      guests: guests ? Number(guests) : undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-10">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold sm:text-2xl">Find a shortlet</h1>
          <p className="text-sm text-muted-foreground">
            Book a place for a few nights — stays end automatically, no checkout needed.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/shortlets/bookings">My bookings</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/shortlets/manage">Host</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="check-in" className="text-xs font-medium text-muted-foreground">
              Check-in date
            </label>
            <Input
              id="check-in"
              type="date"
              min={todayIso()}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="nights" className="text-xs font-medium text-muted-foreground">
              Nights
            </label>
            <Input
              id="nights"
              type="number"
              min={1}
              value={nights}
              onChange={(e) => setNights(Math.max(1, Number(e.target.value)))}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="city" className="text-xs font-medium text-muted-foreground">
              City (optional)
            </label>
            <Input id="city" placeholder="e.g. Lagos" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-3 border-t pt-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="guests" className="text-xs font-medium text-muted-foreground">
                Guests
              </label>
              <Input
                id="guests"
                type="number"
                min={1}
                placeholder="Any"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="min-price" className="text-xs font-medium text-muted-foreground">
                Min price / night
              </label>
              <Input
                id="min-price"
                type="number"
                min={0}
                placeholder="Any"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="max-price" className="text-xs font-medium text-muted-foreground">
                Max price / night
              </label>
              <Input
                id="max-price"
                type="number"
                min={0}
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button type="button" onClick={handleSearch} className="flex-1 sm:flex-none">
            <Search className="size-4" />
            Search
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal className="size-4" />
            {showFilters ? "Hide filters" : "More filters"}
          </Button>
        </div>
      </div>

      {isFetching && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <p className="p-6 text-center text-sm text-destructive">
          Couldn&apos;t search shortlets right now. Try again.
        </p>
      )}

      {data && !isFetching && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {data.count} {data.count === 1 ? "place" : "places"} available for {data.nights}{" "}
            {data.nights === 1 ? "night" : "nights"} from {data.checkInDate}
          </p>

          {data.listings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border bg-muted/30 px-6 py-16 text-center">
              <p className="text-base font-semibold">No places free for those dates</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try different dates, a nearby city, or a wider price range.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.listings.map((listing) => (
                <Link
                  key={listing.listingId}
                  href={`/shortlets/view?id=${listing.listingId}&check_in=${data.checkInDate}&nights=${data.nights}`}
                  className="flex flex-col gap-2 rounded-2xl border p-4 transition-colors hover:bg-accent"
                >
                  <div className="aspect-video w-full rounded-xl bg-muted" />
                  <p className="text-sm font-semibold">{listing.title}</p>
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
      )}

      {!data && !isFetching && !isError && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-muted/30 px-6 py-16 text-center">
          <Search className="size-10 text-muted-foreground/40" />
          <p className="text-base font-semibold">Search to see available shortlets</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Pick your check-in date and how many nights you&apos;re staying to get started.
          </p>
        </div>
      )}
    </div>
  );
}
