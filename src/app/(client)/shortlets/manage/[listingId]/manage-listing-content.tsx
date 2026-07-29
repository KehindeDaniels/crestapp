"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { isApiError } from "@/lib/api/errors";
import { useMyShortlets, useShortletDetail, useUpdateShortlet } from "@/features/shortlets";

/**
 * Owner's single-listing management.
 *
 * Core data (status, rooms, activate) comes from the owner's own listing list
 * (`GET /api/shortlets`), which — crucially — includes *drafts*. The public
 * `browse` endpoint is active-only and 404s a draft, so it can't be the source
 * here; it's used only to enrich the extra stats (cleaning/service/nights) once
 * a listing is active.
 *
 * Activation sends `{status: "active"}` only (the `PUT` accepts partial updates
 * — every field on `UpdateShortletPayload` is optional — so this avoids
 * re-sending, and possibly clobbering, fields we'd have to reconstruct). Each
 * room links to its calendar. See docs/design/shortlet-implementation-plan.md.
 */
export function ManageListingContent({ listingId }: { listingId: number }) {
  const { data: listings, isPending, isError } = useMyShortlets();
  const listing = listings?.find((l) => String(l.listingId) === String(listingId));
  // `browse` is active-only — only fetch the richer detail when the listing is live.
  const { data: detail } = useShortletDetail(listing?.status === "active" ? listingId : null);
  const updateShortlet = useUpdateShortlet(listingId);

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
        <p className="text-sm text-destructive">Couldn&apos;t load this listing.</p>
        <Link href="/shortlets/manage" className="text-sm font-medium text-primary">
          Back to my shortlets
        </Link>
      </div>
    );
  }

  const isActive = listing.status === "active";
  const isPaused = listing.status === "paused";
  // draft + pending both mean "not live yet, waiting on admin approval".
  const isAwaitingApproval = !isActive && !isPaused;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-10">
      <Link
        href="/shortlets/manage"
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ChevronLeft className="size-4" />
        My shortlets
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{listing.title}</h1>
          <p className="text-sm text-muted-foreground">{listing.city}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
            isActive && "bg-green-100 text-green-800",
            isPaused && "bg-amber-100 text-amber-800",
            isAwaitingApproval && "bg-muted text-muted-foreground",
          )}
        >
          {listing.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-2xl border p-4 text-sm sm:grid-cols-4">
        <Stat label="Per night" value={listing.pricePerNightFormatted} />
        <Stat label="Cleaning" value={detail?.cleaningFeeFormatted ?? "—"} />
        <Stat
          label="Service fee"
          value={detail?.serviceFeePercent != null ? `${detail.serviceFeePercent}%` : "—"}
        />
        <Stat
          label="Nights"
          value={
            detail?.minNights != null && detail?.maxNights != null
              ? `${detail.minNights}–${detail.maxNights}`
              : "—"
          }
        />
      </div>

      {isAwaitingApproval && (
        <div className="space-y-1 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium">Pending admin approval</p>
          <p className="text-sm text-muted-foreground">
            Your listing goes live automatically once an admin approves your ownership documents —
            you don&apos;t need to activate it yourself. You&apos;ll see it flip to{" "}
            <span className="font-medium">Active</span> here.
          </p>
        </div>
      )}

      {isActive && (
        <div className="flex items-center gap-2 rounded-2xl border border-success bg-success/8 p-3 text-sm">
          <CheckCircle2 className="size-4 text-success" />
          This listing is live and bookable.
        </div>
      )}

      {isPaused && (
        <div className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-medium">This listing is paused</p>
          <p className="text-sm text-muted-foreground">
            It&apos;s hidden from guests. Resume it to make it bookable again.
          </p>
          {updateShortlet.isError && (
            <p className="text-sm text-destructive">
              {isApiError(updateShortlet.error)
                ? updateShortlet.error.message
                : "Couldn't resume — try again."}
            </p>
          )}
          <Button
            type="button"
            disabled={updateShortlet.isPending}
            onClick={() => updateShortlet.mutate({ status: "active" })}
          >
            {updateShortlet.isPending ? "Resuming…" : "Resume listing"}
          </Button>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Rooms & calendars</h2>
        <div className="space-y-2">
          {listing.rooms.map((room) => (
            <Link
              key={room.roomId}
              href={`/shortlets/manage/${listingId}/rooms/${room.roomId}`}
              className="flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-3">
                <CalendarDays className="size-4 text-muted-foreground" />
                <span>
                  <span className="block text-sm font-medium">{room.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{room.status}</span>
                </span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
