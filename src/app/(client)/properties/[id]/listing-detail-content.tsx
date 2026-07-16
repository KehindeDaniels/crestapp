"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Loader2, MapPin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePropertyDetail, MessageOwnerButton } from "@/features/properties";
import { formatDate } from "@/lib/utils/format";
import { PhotoGalleryModal } from "./photo-gallery-modal";

/**
 * "Seller Verification" checklist and "Property Features" (beyond
 * bed/bath, which are real) have no confirmed backend support — shown
 * disabled/"Coming Soon" as a whole section rather than mixing real and
 * fabricated rows, per docs/design/search-and-listing-detail-plan.md §4.
 */
const COMING_SOON_VERIFICATION = [
  "Property Verified",
  "Landlord Identity Verified",
  "Documents Reviewed",
];
const COMING_SOON_FEATURES = [
  "Family TV room",
  "Electricity",
  "Security",
  "Covered Parking",
];

export function ListingDetailContent({ propertyId }: { propertyId: number }) {
  const { data: property, isPending, isError } = usePropertyDetail(propertyId);
  const [galleryOpen, setGalleryOpen] = useState(false);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="mx-auto max-w-md space-y-3 p-10 text-center">
        <p className="text-sm text-destructive">
          Couldn&apos;t load this property — it may not exist.
        </p>
        <Link href="/search" className="text-sm font-medium text-primary">
          Back to search results
        </Link>
      </div>
    );
  }

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <Link
          href="/search"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to search results
        </Link>
        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.share) {
              navigator.share({ title: property.title, url: window.location.href });
            } else if (typeof navigator !== "undefined") {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
        >
          <Share2 className="size-4" />
          Share
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="relative block aspect-video w-full overflow-hidden rounded-2xl bg-muted"
          >
            {property.imageUrl && (
              <Image
                src={property.imageUrl}
                alt={property.title}
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover"
              />
            )}
            {property.allImages.length > 0 && (
              <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                1/{property.allImages.length}
              </span>
            )}
          </button>

          {property.imagesByCategory.length > 0 && (
            <div className="scrollbar-thin-custom flex gap-3 overflow-x-auto">
              {property.imagesByCategory.map((cat) => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => setGalleryOpen(true)}
                  className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  {cat.images[0] && (
                    <Image src={cat.images[0].url} alt="" fill className="object-cover" />
                  )}
                  <span className="absolute inset-0 flex items-end bg-black/30 p-2 text-xs font-medium text-white">
                    {cat.category} ({cat.images.length})
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3 rounded-2xl border p-5">
            <div className="flex items-center gap-2 text-xs font-medium">
              {property.isActive && (
                <>
                  <span className="size-2 rounded-full bg-success" />
                  {property.typeBadgeLabel}
                </>
              )}
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold">{property.title}</h1>
                <p className="text-sm text-muted-foreground">{property.address}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {property.bedrooms} bd • {property.bathrooms} ba • {property.squareMeters} sqm
                </p>
              </div>
              <p className="shrink-0 text-2xl font-bold">{property.priceFormatted}</p>
            </div>
            <p className="border-t pt-3 text-sm text-muted-foreground">
              {property.description}
            </p>
          </div>

          <div className="rounded-2xl border p-5">
            <h2 className="mb-4 text-base font-semibold">Property Details</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow label="Listing Number" value={`#${property.id}`} />
              <DetailRow label="Floor Size" value={`${property.squareMeters} sqm`} />
              <DetailRow label="Listing Date" value={formatDate(property.createdAt)} />
              <DetailRow
                label="Property Type"
                value={
                  property.propertyType.charAt(0).toUpperCase() +
                  property.propertyType.slice(1)
                }
              />
              <DetailRow label="Location" value={property.address} />
            </dl>
          </div>

          <div className="rounded-2xl border p-5">
            <h2 className="mb-3 text-base font-semibold">Property Features</h2>
            <dl className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bedroom</span>
                <span className="font-medium">{property.bedrooms}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bathrooms</span>
                <span className="font-medium">{property.bathrooms}</span>
              </div>
              {COMING_SOON_FEATURES.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center justify-between text-sm text-muted-foreground/50"
                  title="Coming soon"
                >
                  <span>{feature}</span>
                  <span>—</span>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border p-5">
            <div className="flex items-center gap-3">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
                {property.ownerAvatarUrl && (
                  <Image src={property.ownerAvatarUrl} alt="" fill className="object-cover" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{property.ownerName}</p>
                <p className="text-xs text-muted-foreground">Property owner</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Seller Verification</p>
              <ul className="space-y-1.5">
                {COMING_SOON_VERIFICATION.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-muted-foreground/50"
                    title="Coming soon"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              {/* Static per explicit decision — POST /api/contracts/quick-create
                  immediately creates AND auto-accepts a binding contract with a
                  payment link, not a negotiable offer. Not wired yet. */}
              <Button type="button" variant="outline" disabled>
                Make Offer
              </Button>
              <MessageOwnerButton
                ownerId={property.ownerId}
                propertyId={property.id}
                ownerName={property.ownerName}
                label="Message Landlord"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border p-5">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="size-4" />
              {property.address}
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                View Map
              </a>
            </Button>
            <Button asChild className="w-full">
              <a
                href={`${mapsHref}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Directions
              </a>
            </Button>
          </div>
        </div>
      </div>

      <PhotoGalleryModal
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        categories={property.imagesByCategory}
        allImages={property.allImages}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
