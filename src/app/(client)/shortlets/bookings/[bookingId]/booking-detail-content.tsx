"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, Clock, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { isApiError } from "@/lib/api/errors";
import {
  useMyBookings,
  usePayBooking,
  useBookingPaymentSession,
  useCancelBooking,
  type BookingModel,
} from "@/features/shortlets";

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

/**
 * Booking detail + pay. There's no confirmed single-booking GET endpoint, so
 * this reads from the polled `/bookings/mine` list and finds the row by id
 * (plan §3, Gap 3) — the polling means it flips from pending_payment to
 * confirmed on its own after the Flutterwave webhook fires. Payment reuses
 * the Offers redirect pattern: open the real payment_url in a new tab, keep
 * this page (and its polling) alive.
 */
export function BookingDetailContent({ bookingId }: { bookingId: number }) {
  const { data: bookings, isPending } = useMyBookings();
  const booking = bookings?.find((b) => b.bookingId === bookingId);

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-md space-y-3 p-10 text-center">
        <p className="text-sm font-medium">Booking not found</p>
        <Link href="/shortlets/bookings" className="text-sm font-medium text-primary">
          Back to my bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-10">
      <Link
        href="/shortlets/bookings"
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ChevronLeft className="size-4" />
        My bookings
      </Link>

      <div className="space-y-4 rounded-2xl border p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{booking.listingTitle ?? "Shortlet booking"}</h1>
            {booking.city && <p className="text-sm text-muted-foreground">{booking.city}</p>}
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
              STATUS_STYLES[booking.status] ?? "bg-muted text-muted-foreground",
            )}
          >
            {STATUS_LABELS[booking.status] ?? booking.status}
          </span>
        </div>

        <div className="space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-in</span>
            <span className="font-medium">
              {formatDate(booking.checkInAt, { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stay ends</span>
            <span className="font-medium">
              {formatDate(booking.endsAt, { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nights</span>
            <span className="font-medium">{booking.nights}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total</span>
            <span>{booking.totalFormatted}</span>
          </div>
        </div>

        <BookingStatusPanel booking={booking} />
      </div>
    </div>
  );
}

function BookingStatusPanel({ booking }: { booking: BookingModel }) {
  if (booking.status === "confirmed") {
    return (
      <div className="flex items-start gap-2 rounded-xl bg-success/8 p-3 text-sm">
        <CheckCircle2 className="size-4 shrink-0 text-success" />
        <span>
          You&apos;re booked. Your stay ends automatically — there&apos;s no checkout needed.
        </span>
      </div>
    );
  }

  if (booking.status === "cancelled") {
    return (
      <div className="flex items-start gap-2 rounded-xl bg-destructive/8 p-3 text-sm text-destructive">
        <XCircle className="size-4 shrink-0" />
        This booking was cancelled.
      </div>
    );
  }

  if (booking.status === "expired") {
    return (
      <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
        The payment window ended and the hold was released. Search again to rebook.
      </div>
    );
  }

  if (booking.status === "completed") {
    return (
      <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">Stay finished.</div>
    );
  }

  // pending_payment
  return <PendingPaymentPanel booking={booking} />;
}

function PendingPaymentPanel({ booking }: { booking: BookingModel }) {
  const pay = usePayBooking(booking.bookingId);
  const { data: session } = useBookingPaymentSession(booking.bookingId);
  const cancel = useCancelBooking(booking.bookingId);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");

  function handlePay() {
    if (session?.paymentUrl) {
      window.open(session.paymentUrl, "_blank", "noopener,noreferrer");
      return;
    }
    pay.mutate("flutterwave", {
      onSuccess: (response) => {
        window.open(response.data.payment_url, "_blank", "noopener,noreferrer");
      },
    });
  }

  return (
    <div className="space-y-3">
      {booking.expiresAt && (
        <p className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          <Clock className="size-3.5" />
          Complete payment by{" "}
          {formatDate(booking.expiresAt, { dateStyle: "medium", timeStyle: "short" })} to keep this
          booking.
        </p>
      )}

      {pay.isError && (
        <p className="text-sm text-destructive">
          {isApiError(pay.error) ? pay.error.message : "Couldn't start payment — try again."}
        </p>
      )}

      <Button type="button" className="w-full" onClick={handlePay} disabled={pay.isPending}>
        {pay.isPending
          ? "Preparing payment…"
          : session?.paymentUrl
            ? "Reopen payment page"
            : "Pay with Flutterwave"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Opens in a new tab — this page stays open and updates automatically once payment clears.
      </p>

      <button
        type="button"
        onClick={() => setCancelOpen(true)}
        className="mx-auto block text-xs font-medium text-muted-foreground underline"
      >
        Cancel this booking
      </button>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>The held dates will be released for others to book.</DialogDescription>
          </DialogHeader>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            rows={3}
            className="w-full rounded-lg border bg-muted p-3 text-sm outline-none focus-visible:border-ring"
          />
          {cancel.isError && (
            <p className="text-sm text-destructive">Couldn&apos;t cancel — try again.</p>
          )}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="destructive"
              disabled={cancel.isPending}
              onClick={() =>
                cancel.mutate(reason.trim() || "Guest cancelled", {
                  onSuccess: () => setCancelOpen(false),
                })
              }
            >
              {cancel.isPending ? "Cancelling…" : "Yes, cancel booking"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setCancelOpen(false)}>
              Keep booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
