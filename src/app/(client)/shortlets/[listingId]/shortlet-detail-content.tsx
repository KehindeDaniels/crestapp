"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BedDouble,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { isApiError } from "@/lib/api/errors";
import {
  useShortletDetail,
  useShortletAvailability,
  useShortletQuote,
  useCreateBooking,
  toAvailabilityRooms,
  toQuoteModel,
  type QuoteModel,
} from "@/features/shortlets";
import type { ID } from "@/types/api";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Guest listing detail — `GET /browse/{id}` + `GET /browse/{id}/availability`,
 * then `POST /quote` and `POST /bookings`. Multi-room booking is real
 * (`room_ids` is an array), so rooms are multi-selectable. After a booking is
 * created it routes to the booking page to pay. See
 * docs/design/shortlet-implementation-plan.md.
 */
export function ShortletDetailContent({ listingId }: { listingId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkIn, setCheckIn] = useState(searchParams.get("check_in") || todayIso());
  const [nights, setNights] = useState(Number(searchParams.get("nights")) || 2);
  const [selectedRooms, setSelectedRooms] = useState<ID[]>([]);
  const [quote, setQuote] = useState<QuoteModel | null>(null);

  const { data: listing, isPending, isError } = useShortletDetail(listingId);
  const { data: availabilityRaw, isFetching: availabilityLoading } = useShortletAvailability(
    listingId,
    checkIn,
    nights,
  );
  const getQuote = useShortletQuote();
  const createBooking = useCreateBooking();

  const availabilityRooms = availabilityRaw
    ? toAvailabilityRooms(availabilityRaw, listing?.currency ?? "NGN")
    : [];

  function toggleRoom(roomId: ID) {
    setQuote(null);
    setSelectedRooms((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId],
    );
  }

  function refreshDates(nextCheckIn: string, nextNights: number) {
    setCheckIn(nextCheckIn);
    setNights(nextNights);
    setSelectedRooms([]);
    setQuote(null);
  }

  function handleQuote() {
    if (selectedRooms.length === 0) return;
    getQuote.mutate(
      { listing_id: listingId, room_ids: selectedRooms, check_in_date: checkIn, nights },
      { onSuccess: (response) => setQuote(toQuoteModel(response.data)) },
    );
  }

  function handleBook() {
    createBooking.mutate(
      {
        listing_id: listingId,
        room_ids: selectedRooms,
        check_in_date: checkIn,
        nights,
        guests_count: 1,
      },
      {
        onSuccess: (response) => {
          router.push(`/shortlets/bookings/${response.data.booking_id}`);
        },
      },
    );
  }

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="mx-auto max-w-md space-y-3 p-10 text-center">
        <p className="text-sm text-destructive">Couldn&apos;t load this shortlet.</p>
        <Link href="/shortlets" className="text-sm font-medium text-primary">
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-10">
      <Link href="/shortlets" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ChevronLeft className="size-4" />
        Back to search
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
            {listing.imageUrl && (
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover"
              />
            )}
          </div>

          {listing.videoUrls.map((url) => (
            <video
              key={url}
              src={url}
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full rounded-2xl bg-black"
            />
          ))}

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {listing.city}
            </p>
            <p className="text-lg font-semibold">
              {listing.pricePerNightFormatted}
              <span className="text-sm font-normal text-muted-foreground"> / night</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-4 rounded-2xl border p-4 text-sm">
            {listing.checkInTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 text-muted-foreground" />
                Check-in {listing.checkInTime.slice(0, 5)}
              </span>
            )}
            {listing.instantBook && (
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-success" />
                Instant book
              </span>
            )}
            {listing.cancellationPolicy && (
              <span className="flex items-center gap-1.5 capitalize">
                <CheckCircle2 className="size-4 text-muted-foreground" />
                {listing.cancellationPolicy} cancellation
              </span>
            )}
          </div>

          {listing.amenities.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-base font-semibold">Rooms</h2>
            {availabilityLoading && (
              <p className="text-sm text-muted-foreground">Checking availability…</p>
            )}
            <div className="space-y-2">
              {(availabilityRooms.length > 0 ? availabilityRooms : null)?.map((room) => {
                const selected = selectedRooms.includes(room.roomId);
                return (
                  <button
                    key={room.roomId}
                    type="button"
                    disabled={!room.available}
                    onClick={() => toggleRoom(room.roomId)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left",
                      !room.available && "cursor-not-allowed opacity-50",
                      selected && "border-primary bg-primary/5",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded border",
                          selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                        )}
                      >
                        {selected && <Check className="size-3.5" />}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{room.name}</span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          {room.capacity != null && (
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {room.capacity}
                            </span>
                          )}
                          {!room.available && <span className="text-destructive">Not available</span>}
                        </span>
                      </span>
                    </span>
                    <span className="text-sm font-semibold">
                      {room.nightlyRateFormatted}
                      <span className="text-xs font-normal text-muted-foreground"> / night</span>
                    </span>
                  </button>
                );
              })}
              {!availabilityLoading && availabilityRooms.length === 0 && (
                <p className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                  No rooms available for these dates — try changing the check-in date or nights.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Booking panel */}
        <div className="space-y-4">
          <div className="space-y-4 rounded-2xl border p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="detail-checkin" className="text-xs font-medium text-muted-foreground">
                  Check-in
                </label>
                <Input
                  id="detail-checkin"
                  type="date"
                  min={todayIso()}
                  value={checkIn}
                  onChange={(e) => refreshDates(e.target.value, nights)}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="detail-nights" className="text-xs font-medium text-muted-foreground">
                  Nights
                </label>
                <Input
                  id="detail-nights"
                  type="number"
                  min={1}
                  value={nights}
                  onChange={(e) => refreshDates(checkIn, Math.max(1, Number(e.target.value)))}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {selectedRooms.length === 0
                ? "Select at least one room to continue."
                : `${selectedRooms.length} room${selectedRooms.length === 1 ? "" : "s"} selected`}
            </p>

            {!quote ? (
              <Button
                type="button"
                className="w-full"
                disabled={selectedRooms.length === 0 || getQuote.isPending}
                onClick={handleQuote}
              >
                {getQuote.isPending ? "Getting quote…" : "Get quote"}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 rounded-xl bg-muted/50 p-3 text-sm">
                  {quote.rooms.map((room) => (
                    <div key={room.roomId} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {room.name} · {room.nights}n
                      </span>
                      <span>{room.lineTotalFormatted}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{quote.subtotalFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    {/* Label only — the `cleaning_fee` field; non-refundable, part of the total. */}
                    <span className="text-muted-foreground">Caution fee</span>
                    <span>{quote.cleaningFeeFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>{quote.serviceFeeFormatted}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total</span>
                    <span>{quote.totalFormatted}</span>
                  </div>
                </div>

                <p className="rounded-lg bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                  Your stay is {quote.nights} {quote.nights === 1 ? "night" : "nights"} —{" "}
                  {24 * quote.nights} hours. Stay ends automatically at{" "}
                  {formatDate(quote.endsAt, { dateStyle: "medium", timeStyle: "short" })}. No
                  checkout needed.
                </p>

                {createBooking.isError && (
                  <p className="text-sm text-destructive">
                    {isApiError(createBooking.error)
                      ? createBooking.error.message
                      : "Couldn't create this booking — try again."}
                  </p>
                )}

                <Button
                  type="button"
                  className="w-full"
                  disabled={createBooking.isPending}
                  onClick={handleBook}
                >
                  {createBooking.isPending ? "Booking…" : "Book now"}
                </Button>
              </div>
            )}

            {getQuote.isError && (
              <p className="text-sm text-destructive">
                {isApiError(getQuote.error) ? getQuote.error.message : "Couldn't get a quote — try again."}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-2xl border border-success bg-success/8 p-3 text-xs text-muted-foreground">
            <BedDouble className="size-4 shrink-0 text-success" />
            You only pay to hold the dates — the booking confirms automatically once payment clears.
          </div>
        </div>
      </div>
    </div>
  );
}
