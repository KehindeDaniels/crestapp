import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Heart } from "lucide-react";
import { MessageOwnerButton } from "./message-owner-button";
import type { PropertyCardModel } from "../models";

/**
 * Search Property's grid card — distinct from `PropertyCard` (Home's
 * horizontal-scroll style): beds/baths/address sit below the image
 * alongside a real "Message Owner" button, rather than everything overlaid
 * on the image. Confirmed against the Figma screenshot, not a variant of
 * the same component — different enough to warrant its own file.
 */
export function PropertySearchResultCard({ property }: { property: PropertyCardModel }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center gap-3">
        <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
          {property.ownerAvatarUrl && (
            <Image src={property.ownerAvatarUrl} alt="" fill className="object-cover" />
          )}
        </div>
        <div>
          <p className="flex items-center gap-1 text-sm font-semibold">
            {property.ownerName}
            {property.isVerified && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-success">
                <BadgeCheck className="size-3.5" />
                Verified
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">Property owner</p>
        </div>
      </div>

      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative aspect-337/217 overflow-hidden rounded-2xl bg-muted">
          {property.imageUrl && (
            <Image
              src={property.imageUrl}
              alt={property.title}
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover"
            />
          )}

          <button
            type="button"
            aria-label="Save"
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-white"
          >
            <Heart className="size-4" />
          </button>

          {property.isActive && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium">
              {property.typeBadgeLabel}
              <span className="size-2 rounded-full bg-success" />
            </span>
          )}
        </div>
      </Link>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold">{property.priceFormatted}</p>
          <p className="text-xs text-muted-foreground">
            {property.bedrooms} bd • {property.bathrooms} ba • {property.squareMeters} sqm
          </p>
          <p className="truncate text-xs text-muted-foreground">{property.address}</p>
        </div>
        <MessageOwnerButton
          ownerId={property.ownerId}
          propertyId={property.id}
          ownerName={property.ownerName}
          label="Message Owner"
        />
      </div>
    </div>
  );
}
