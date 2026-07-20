"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePropertyDetail } from "@/features/properties";
import { useOffer } from "@/features/offers";
import { formatDate } from "@/lib/utils/format";

/**
 * Built from real screenshots (docs/design/screenshots/make-an-offer/) plus
 * the confirmed live `POST /api/contracts/quick-create` response — the
 * richest, most fully-confirmed response captured this session (includes a
 * real Flutterwave `payment_link` and a real `fee_breakdown`). See
 * docs/design-vs-backend-gaps.md, Phase 11 for what the design shows that
 * this build deliberately does NOT fabricate: a multi-gateway picker (only
 * Flutterwave is real), the exact "Legal Review in Progress" 4-step modal
 * (no granular backing data — status tracking happens in History instead,
 * which already handles this honestly), and the "Your Document" legal
 * review card (no confirmed document data for this offer flow).
 *
 * `useOffer` only ever reads from cache (seeded by `useCreateOffer` right
 * after creation) since `payment_link` has no confirmed way to be re-fetched
 * — a direct visit/reload after that cache is gone shows the expired state
 * below rather than a broken page.
 */
export function OfferContent({ contractId }: { contractId: number }) {
  const { data: offer } = useOffer(contractId);
  const { data: property } = usePropertyDetail(offer?.propertyId ?? 0);

  if (!offer) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-10 text-center">
        <p className="text-sm font-medium">This offer session is no longer available</p>
        <p className="text-sm text-muted-foreground">
          If you already completed payment, you can track its status in your History.
        </p>
        <Link href="/history" className="text-sm font-medium text-primary">
          Go to History
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-10">
      <Link
        href={`/properties/${offer.propertyId}`}
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ChevronLeft className="size-4" />
        Back
      </Link>

      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">Transaction Overview</h1>
        <p className="text-sm text-muted-foreground">
          Review your offer and complete the payment to secure this property
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
            {property?.imageUrl && (
              <Image src={property.imageUrl} alt="" fill className="object-cover" />
            )}
          </div>

          <div className="rounded-2xl border p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Order Summary</h2>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property Price</span>
                <span className="font-medium">{offer.propertyAmountFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Platform Fee ({offer.platformFeePercentage}%)
                </span>
                <span className="font-medium">{offer.platformFeeFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Legal Fee ({offer.legalFeePercentage}%)</span>
                <span className="font-medium">{offer.legalFeeFormatted}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total Payment</span>
                <span>{offer.totalAmountFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2 rounded-2xl bg-primary p-5 text-primary-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5" />
              <p className="font-semibold">Protected Payment (Escrow)</p>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Your money will be securely held with us and ONLY released to the owner after the
              agreement is finalized.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border p-5 text-sm">
            <p className="font-medium">{offer.propertyTitle}</p>
            <p className="text-muted-foreground">{offer.propertyAddress}</p>
            <p className="text-muted-foreground">Owner: {offer.ownerName}</p>
          </div>

          <Button
            type="button"
            size="xl"
            className="w-full"
            onClick={() => {
              window.location.href = offer.paymentLink;
            }}
          >
            Pay with {offer.paymentGateway === "flutterwave" ? "Flutterwave" : offer.paymentGateway}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Payment link expires {formatDate(offer.paymentExpiresAt)}. Track this transaction
            anytime in your{" "}
            <Link href={`/history?transaction=${offer.transactionId}`} className="font-medium text-primary">
              History
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
