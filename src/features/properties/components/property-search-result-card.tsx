import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Heart } from "lucide-react";
import { MessageOwnerButton } from "./message-owner-button";
import type { PropertyCardModel } from "../models";

/**
 * Search Property's grid card — distinct from `PropertyCard` (Home's
 * horizontal-scroll style): beds/baths/address sit below the image
 * alongside a real "Message Owner" button, rather than everything overlaid
 * on the image.
 *
 * Mobile layout confirmed against a real Figma mobile pull (node
 * 72:6691): drops the "Property owner" subtitle, moves the save heart to
 * overlay the image's bottom-right corner instead of top-right, and moves
 * the "For sale" badge off the image entirely into its own right-aligned
 * row above the price. Desktop keeps both overlaid on the image, unchanged.
 */
export function PropertySearchResultCard({ property }: { property: PropertyCardModel }) {
  return (
    <div className="flex flex-col gap-2 border-b pb-4 sm:border-0 sm:pb-0">
      <div className="mb-1 flex items-center gap-3">
        <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted sm:size-9">
          {property.ownerAvatarUrl && (
            <Image src={property.ownerAvatarUrl} alt="" fill className="object-cover" />
          )}
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-base font-semibold sm:gap-1 sm:text-sm">
            {property.ownerName}
            {property.isVerified && (
              <span className="flex items-center gap-0.5 rounded-full bg-muted px-1 py-1 text-[10px] font-medium text-muted-foreground sm:bg-transparent sm:px-0 sm:py-0 sm:text-xs sm:text-success">
                <BadgeCheck className="size-3.5" />
                Verified
              </span>
            )}
          </p>
          {/* Desktop only — mobile drops this subtitle per the Figma pull. */}
          <p className="hidden text-xs text-muted-foreground sm:block">Property owner</p>
        </div>
      </div>

      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative aspect-337/217 overflow-hidden rounded-xl bg-muted sm:rounded-2xl">
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
            className="absolute right-3 bottom-3 flex size-8.75 items-center justify-center rounded-full bg-white sm:top-3 sm:bottom-auto sm:size-8"
          >
            <Heart className="size-4" />
          </button>

          {/* Desktop only — mobile moves this off the image into its own row below. */}
          {property.isActive && (
            <span className="absolute bottom-3 left-3 hidden items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium sm:flex">
              {property.typeBadgeLabel}
              <span className="size-2 rounded-full bg-success" />
            </span>
          )}
        </div>
      </Link>

      {property.isActive && (
        <div className="flex items-center justify-end gap-1.5 text-xs sm:hidden">
          {property.typeBadgeLabel}
          <span className="size-2.5 rounded-full bg-success" />
        </div>
      )}

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-bold sm:text-lg">{property.priceFormatted}</p>
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
          size="xl"
          className="hidden shrink-0 sm:inline-flex sm:h-9 sm:px-4 sm:text-sm sm:font-medium"
        />
        <MessageOwnerButton
          ownerId={property.ownerId}
          propertyId={property.id}
          ownerName={property.ownerName}
          label="Message Owner"
          size="xl"
          className="inline-flex shrink-0 sm:hidden"
        />
      </div>
    </div>
  );
}
