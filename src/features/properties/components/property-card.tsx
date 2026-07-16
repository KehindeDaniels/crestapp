import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { PropertyCardModel } from "../models";

/** Renders a `PropertyCardModel` (the view model) — never touches the raw API shape. */
export function PropertyCard({ property }: { property: PropertyCardModel }) {
  return (
    <Link href={`/properties/${property.id}`} className="block w-84.25 shrink-0">
      <div className="mb-3 flex items-center gap-3">
        <div className="relative size-10.5 shrink-0 overflow-hidden rounded-full bg-muted">
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

      <div className="relative aspect-337/217 overflow-hidden rounded-2xl bg-muted">
        {property.imageUrl && (
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            sizes="337px"
            className="object-cover"
          />
        )}

        {property.isActive && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium">
            {property.typeBadgeLabel}
            <span className="size-2 rounded-full bg-success" />
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-white">
          <p className="text-xl font-bold">{property.priceFormatted}</p>
          <p className="text-xs">
            {property.bedrooms} bd • {property.bathrooms} ba • {property.squareMeters} sqm
          </p>
          <p className="truncate text-xs">{property.address}</p>
        </div>
      </div>
    </Link>
  );
}
