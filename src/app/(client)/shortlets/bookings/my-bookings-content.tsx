"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { useMyBookings, type BookingModel } from "@/features/shortlets";

const TABS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
] as const;

type Tab = (typeof TABS)[number]["value"];

const STATUS_STYLES: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending payment",
  confirmed: "Confirmed",
  completed: "Completed",
  expired: "Expired",
  cancelled: "Cancelled",
};

/** Client-side bucketing — the backend `/bookings/mine` list has no tab/status filter param, so we split the one fetched list here (same simplification as History's tabs). */
function bucketOf(booking: BookingModel): Tab {
  if (booking.status === "cancelled" || booking.status === "expired") return "cancelled";
  if (booking.status === "completed") return "past";
  return "upcoming";
}

export function MyBookingsContent() {
  const { data: bookings, isPending, isError } = useMyBookings();
  const [tab, setTab] = useState<Tab>("upcoming");

  const visible = useMemo(
    () => (bookings ?? []).filter((b) => bucketOf(b) === tab),
    [bookings, tab],
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-10">
      <Link href="/shortlets" className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ChevronLeft className="size-4" />
        Back to search
      </Link>

      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">My bookings</h1>
        <p className="text-sm text-muted-foreground">Your shortlet stays and their status</p>
      </div>

      <div className="flex gap-4 border-b">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "border-b-2 pb-2 text-sm font-medium",
              tab === t.value
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isPending && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <p className="p-6 text-center text-sm text-destructive">Couldn&apos;t load your bookings.</p>
      )}

      {!isPending && !isError && visible.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-muted/30 px-6 py-16 text-center">
          <p className="text-base font-semibold">Nothing here yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When you book a shortlet, it&apos;ll show up here.
          </p>
          <Link href="/shortlets" className="mt-2 text-sm font-medium text-primary">
            Find a shortlet
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {visible.map((booking) => (
          <Link
            key={booking.bookingId}
            href={`/shortlets/bookings/view?id=${booking.bookingId}`}
            className="flex items-center justify-between gap-4 rounded-2xl border p-4 transition-colors hover:bg-accent"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {booking.listingTitle ?? "Shortlet booking"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(booking.checkInAt, { dateStyle: "medium" })} · {booking.nights}{" "}
                {booking.nights === 1 ? "night" : "nights"} · {booking.totalFormatted}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  STATUS_STYLES[booking.status] ?? "bg-muted text-muted-foreground",
                )}
              >
                {STATUS_LABELS[booking.status] ?? booking.status}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
