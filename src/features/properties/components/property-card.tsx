import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Heart } from "lucide-react";
import type { PropertyCardModel } from "../models";

/**
 * Renders a `PropertyCardModel` (the view model) — never touches the raw
 * API shape.
 *
 * Mobile layout confirmed against a real Figma mobile pull (node
 * 570:1225, not inferred from a screenshot — an earlier pass got this
 * wrong from screenshot-only inference): the owner row drops the
 * "Property owner" subtitle (name + Verified pill only), and the image
 * keeps the same gradient-overlay price/meta treatment as desktop — it is
 * NOT moved to a plain block below the image — just at smaller text
 * sizes, with a smaller "For sale" badge and the heart icon repositioned
 * to sit inline with the price (bottom-right, no white circle
 * background), not top-right.
 *
 * The heart is presentational only — favorites has no backend endpoint
 * (see docs/design/home-page-data-plan.md §7) — but the mobile design
 * shows it, so it's rendered non-functional rather than omitted.
 */
export function PropertyCard({ property }: { property: PropertyCardModel }) {
  return (
    <Link href={`/properties/${property.id}`} className="block w-80 shrink-0 sm:w-84.25">
      <div className="mb-2 flex items-center gap-2 sm:mb-3 sm:gap-3">
        <div className="bg-muted relative size-7.5 shrink-0 overflow-hidden rounded-full sm:size-10.5">
          {property.ownerAvatarUrl && (
            <Image
              src={property.ownerAvatarUrl}
              alt=""
              fill
              className="object-cover"
            />
          )}
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold sm:gap-1 sm:text-sm">
            {property.ownerName}
            {property.isVerified && (
              <span className="bg-muted text-muted-foreground sm:text-success flex items-center gap-0.5 rounded-full px-1 py-0.5 text-[10px] font-medium sm:bg-transparent sm:px-0 sm:py-0 sm:text-xs">
                <BadgeCheck className="size-3.5" />
                Verified
              </span>
            )}
          </p>
          {/* Desktop only — mobile's compact card drops this subtitle. */}
          <p className="text-muted-foreground hidden text-xs sm:block">
            Property owner
          </p>
        </div>
      </div>

      <div className="bg-muted relative aspect-337/217 overflow-hidden rounded-lg sm:rounded-2xl">
        {property.imageUrl && (
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            sizes="(min-width: 640px) 337px, 50vw"
            className="object-cover"
          />
        )}

        {property.isActive && (
          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-medium sm:top-3 sm:left-3 sm:gap-1.5 sm:px-2.5 sm:text-xs">
            {property.typeBadgeLabel}
            <span className="bg-success size-1.5 rounded-full sm:size-2" />
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/75 to-transparent p-2 pt-8 text-white sm:p-3">
          <div className="min-w-0">
            <p className="text-sm font-bold sm:text-xl">
              {property.priceFormatted}
            </p>
            <p className="text-[10px] sm:text-xs">
              {property.bedrooms} bd • {property.bathrooms} ba •{" "}
              {property.squareMeters} sqm
            </p>
            <p className="truncate text-[10px] sm:text-xs">
              {property.address}
            </p>
          </div>
          <Heart className="size-4.5 shrink-0 sm:hidden" />
        </div>
      </div>
    </Link>
  );
}
