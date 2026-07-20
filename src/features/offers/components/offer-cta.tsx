"use client";

import Link from "next/link";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import type { ID } from "@/types/api";
import { useExistingOfferForProperty } from "../hooks";
import { MakeOfferDialog } from "./make-offer-dialog";

/** `GET /api/contracts` confirmed `status` enum. */
const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Offer Sent",
  accepted: "Offer Accepted",
  in_progress: "In Progress",
  completed: "Completed",
};

/** Statuses that shouldn't block a fresh offer — the buyer walked away or it expired. */
const RESTARTABLE_STATUSES = new Set(["cancelled", "expired"]);

/**
 * Checks for an existing contract on this property before deciding what CTA
 * to show — `quick-create` has no duplicate-offer check of its own, so
 * without this a repeat "Make Offer" click would create a second real,
 * binding contract. See docs/design-vs-backend-gaps.md, Phase 11.
 */
export function OfferCta({
  propertyId,
  propertyPrice,
  currency,
  propertyTitle,
  variant,
  size,
  className,
}: {
  propertyId: ID;
  propertyPrice: number;
  currency: string;
  propertyTitle: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
}) {
  const { data: existingOffer, isPending } = useExistingOfferForProperty(propertyId);

  if (isPending) {
    return (
      <Button type="button" variant={variant} size={size} className={className} disabled>
        Make Offer
      </Button>
    );
  }

  if (existingOffer && !RESTARTABLE_STATUSES.has(existingOffer.status)) {
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <Link href={`/offers/${existingOffer.contractId}`}>
          View Offer · {STATUS_LABELS[existingOffer.status] ?? existingOffer.status}
        </Link>
      </Button>
    );
  }

  return (
    <MakeOfferDialog
      propertyId={propertyId}
      propertyPrice={propertyPrice}
      currency={currency}
      propertyTitle={propertyTitle}
      variant={variant}
      size={size}
      className={className}
    />
  );
}
