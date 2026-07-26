"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import { isApiError } from "@/lib/api/errors";
import { useRoomCalendar, useUpdateAvailability } from "@/features/shortlets";

/**
 * Owner room calendar — `GET .../rooms/{id}/calendar` per-night, and
 * `PUT .../availability` to open/block a date range with an optional price
 * override. Booked/held nights are shown but not editable here (the backend
 * protects them); attempting to overwrite them surfaces the real error. See
 * docs/design/shortlet-implementation-plan.md.
 */
const NIGHT_STYLES: Record<string, string> = {
  available: "bg-green-100 text-green-800 border-green-200",
  blocked: "bg-muted text-muted-foreground border-border",
  held: "bg-amber-100 text-amber-800 border-amber-200",
  booked: "bg-blue-100 text-blue-800 border-blue-200",
};

function monthBounds(year: number, month: number): { from: string; to: string } {
  const first = new Date(Date.UTC(year, month, 1));
  const last = new Date(Date.UTC(year, month + 1, 0));
  return { from: first.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10) };
}

export function RoomCalendarContent() {
  const searchParams = useSearchParams();
  const listingId = Number(searchParams.get("listing")) || 0;
  const roomId = Number(searchParams.get("room")) || 0;
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth());
  const { from, to } = monthBounds(year, month);

  const { data, isPending, isError } = useRoomCalendar(listingId, roomId, from, to);
  const updateAvailability = useUpdateAvailability(listingId, roomId);

  const [rangeFrom, setRangeFrom] = useState(from);
  const [rangeTo, setRangeTo] = useState(from);
  const [status, setStatus] = useState<"available" | "blocked">("blocked");
  const [priceOverride, setPriceOverride] = useState("");

  const nightsByDate = new Map((data?.nights ?? []).map((n) => [n.date, n]));

  function shiftMonth(delta: number) {
    const next = new Date(Date.UTC(year, month + delta, 1));
    setYear(next.getUTCFullYear());
    setMonth(next.getUTCMonth());
  }

  function handleApply() {
    if (!rangeFrom || !rangeTo) return;
    updateAvailability.mutate({
      from: rangeFrom,
      to: rangeTo,
      status,
      price_override: status === "available" && priceOverride ? Number(priceOverride) : null,
    });
  }

  // Leading blanks so day 1 lands on the right weekday column.
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-10">
      <Link
        href={`/shortlets/manage/view?id=${listingId}`}
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to listing
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Room calendar</h1>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => shiftMonth(-1)}>
            Prev
          </Button>
          <span className="min-w-32 text-center text-sm font-medium">{monthLabel}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => shiftMonth(1)}>
            Next
          </Button>
        </div>
      </div>

      {isPending && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <p className="p-6 text-center text-sm text-destructive">Couldn&apos;t load the calendar.</p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-7 gap-1.5">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const night = nightsByDate.get(date);
              const nightStatus = night?.status ?? "available";
              return (
                <div
                  key={date}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-lg border text-xs",
                    NIGHT_STYLES[nightStatus] ?? "bg-background",
                  )}
                  title={`${date} — ${nightStatus}`}
                >
                  <span className="font-medium">{day}</span>
                  {night?.price_override != null && <span className="text-[9px]">₦</span>}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            {(["available", "blocked", "held", "booked"] as const).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className={cn("size-3 rounded border", NIGHT_STYLES[s])} />
                <span className="capitalize">{s}</span>
              </span>
            ))}
          </div>

          <div className="space-y-4 rounded-2xl border p-4">
            <h2 className="text-base font-semibold">Update availability</h2>
            <p className="text-xs text-muted-foreground">
              Open or block a date range. Booked and on-hold nights are protected by the system.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="range-from">From</Label>
                <Input id="range-from" type="date" value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="range-to">To</Label>
                <Input id="range-to" type="date" value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="range-status">Action</Label>
                <Select
                  id="range-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "available" | "blocked")}
                >
                  <option value="blocked">Block</option>
                  <option value="available">Open</option>
                </Select>
              </div>
              {status === "available" && (
                <div className="space-y-1.5">
                  <Label htmlFor="range-price">Special price (optional)</Label>
                  <Input
                    id="range-price"
                    type="number"
                    min={0}
                    placeholder="Default rate"
                    value={priceOverride}
                    onChange={(e) => setPriceOverride(e.target.value)}
                  />
                </div>
              )}
            </div>

            {updateAvailability.isError && (
              <p className="text-sm text-destructive">
                {isApiError(updateAvailability.error)
                  ? updateAvailability.error.message
                  : "Couldn't update those dates — try again."}
              </p>
            )}
            {updateAvailability.isSuccess && (
              <p className="text-sm text-success">
                Updated {updateAvailability.data.data.updated} night(s)
                {updateAvailability.data.data.skipped > 0 &&
                  `, skipped ${updateAvailability.data.data.skipped} protected`}
                .
              </p>
            )}

            <Button type="button" onClick={handleApply} disabled={updateAvailability.isPending}>
              {updateAvailability.isPending ? "Updating…" : "Apply"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
