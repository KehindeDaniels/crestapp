"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BedDouble,
  Bath,
  Building2,
  Calendar,
  Car,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Navigation,
  Ruler,
  Share2,
  Shield,
  Tag,
  Tv,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePropertyDetail, MessageOwnerButton } from "@/features/properties";
import { SaveButton } from "@/features/saved-properties";
import { OfferCta } from "@/features/offers";
import { useSessionStore } from "@/features/auth";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { PhotoGalleryModal } from "./photo-gallery-modal";
import { MobileGalleryOverlay } from "./mobile-gallery-overlay";

/**
 * "Seller Verification" checklist and "Property Features" (beyond
 * bed/bath, which are real) have no confirmed backend support — shown
 * disabled/"Coming Soon" as a whole section rather than mixing real and
 * fabricated rows, per docs/design/search-and-listing-detail-plan.md §4.
 * The Figma mobile pull (node 72:6834) shows these with real green
 * checkmarks/counts, but that's mockup data — kept muted/disabled here to
 * stay honest to what the backend actually returns.
 */
const COMING_SOON_VERIFICATION = [
  "Property Verified",
  "Landlord Identity Verified",
  "Documents Reviewed",
];
const COMING_SOON_FEATURES: { label: string; icon: LucideIcon }[] = [
  { label: "Family TV room", icon: Tv },
  { label: "Electricity", icon: Zap },
  { label: "Security", icon: Shield },
  { label: "Covered Parking", icon: Car },
];

export function ListingDetailContent({ propertyId }: { propertyId: number }) {
  const { data: property, isPending, isError } = usePropertyDetail(propertyId);
  const currentUserId = useSessionStore((s) => s.user?.user_id);
  const [desktopGalleryOpen, setDesktopGalleryOpen] = useState(false);
  const [mobileGalleryOpen, setMobileGalleryOpen] = useState(false);

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
  const isOwner = currentUserId != null && property.ownerId === currentUserId;

  // Videos aren't images — rendered as players, separate from the photo gallery.
  // Shared block dropped into both the mobile and desktop layouts below.
  const videoSection = property.videoUrls.length > 0 && (
    <div className="space-y-2">
      {property.videoUrls.map((url) => (
        <video
          key={url}
          src={url}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full rounded-xl bg-black"
        />
      ))}
    </div>
  );

  const amenitiesSection = property.amenities.length > 0 && (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Amenities</p>
      <div className="flex flex-wrap gap-2">
        {property.amenities.map((a) => (
          <span
            key={a}
            className="rounded-full border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground"
          >
            {a}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl space-y-5 p-4 pb-0 sm:space-y-6 sm:p-6 sm:pb-6 lg:p-10">
      {/* ---------- Mobile (sm:hidden) — matches Figma node 72:6834 ---------- */}
      <div className="-mx-4 sm:hidden">
        <div className="relative aspect-[412/266] w-full overflow-hidden bg-muted">
          <button
            type="button"
            onClick={() => setMobileGalleryOpen(true)}
            aria-label="View photos"
            className="absolute inset-0"
          >
            {property.imageUrl && (
              <Image
                src={property.imageUrl}
                alt={property.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
            )}
          </button>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80" />

          <div className="absolute inset-x-4 top-4 flex items-center justify-between">
            <Link
              href="/search"
              aria-label="Back to search results"
              className="flex size-8 items-center justify-center rounded-full bg-white/30"
            >
              <X className="size-4 text-white" />
            </Link>
            <div className="flex items-center gap-3">
              <SaveButton propertyId={property.id} iconClassName="size-5.5 text-white" />
              <span className="flex size-8 items-center justify-center rounded-full bg-white">
                <Share2 className="size-4" />
              </span>
            </div>
          </div>

          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
            {property.isRecentlyAdded ? (
              <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-white">
                Recently added
              </span>
            ) : (
              <span />
            )}
            {property.allImages.length > 0 && (
              <span className="rounded-full bg-white/40 px-2.5 py-1 text-xs font-medium text-white">
                1/{property.allImages.length}
              </span>
            )}
          </div>
        </div>

        {property.imagesByCategory.length > 0 && (
          <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pt-3">
            {property.imagesByCategory.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setMobileGalleryOpen(true)}
                className="relative h-17.5 w-25.25 shrink-0 overflow-hidden rounded-xl bg-muted"
              >
                {cat.images[0] && (
                  <Image src={cat.images[0].url} alt="" fill className="object-cover" />
                )}
                <span className="absolute inset-0 flex items-end bg-black/30 p-1.5 text-[10px] font-medium text-white">
                  {cat.category} ({cat.images.length})
                </span>
              </button>
            ))}
          </div>
        )}

        {videoSection && <div className="px-4 pt-3">{videoSection}</div>}
        {amenitiesSection && <div className="px-4 pt-3">{amenitiesSection}</div>}

        <div className="space-y-3 px-4 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
                {property.ownerAvatarUrl && (
                  <Image src={property.ownerAvatarUrl} alt="" fill className="object-cover" />
                )}
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-base font-semibold">
                  {property.ownerName}
                  {property.isVerified && (
                    <span className="flex items-center gap-0.5 rounded-full bg-muted px-1 py-1 text-[10px] font-medium text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-success" />
                      Verified
                    </span>
                  )}
                </p>
              </div>
            </div>
            {property.isActive && (
              <span className="flex shrink-0 items-center gap-1.5 text-xs">
                {property.typeBadgeLabel}
                <span className="size-2 rounded-full bg-success" />
              </span>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-2xl font-black">{property.priceFormatted}</p>
            <p className="text-xs">
              {property.bedrooms} bd • {property.bathrooms} ba • {property.squareMeters} sqm
            </p>
            <p className="text-xs text-muted-foreground">{property.address}</p>
          </div>

          <p className="text-xs text-muted-foreground">{property.description}</p>
        </div>

        <div className="space-y-3 px-4 pt-6">
          <h2 className="text-sm font-semibold">Property Details</h2>
          <div className="rounded-xl bg-muted px-3">
            <IconDetailRow icon={Tag} label="Listing Number" value={`#${property.id}`} />
            <IconDetailRow
              icon={Building2}
              label="Property Type"
              value={
                property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)
              }
            />
            <IconDetailRow
              icon={Calendar}
              label="Listing Date"
              value={formatDate(property.createdAt)}
            />
            <IconDetailRow icon={MapPin} label="Location" value={property.address} />
            <IconDetailRow
              icon={Ruler}
              label="Floor Size"
              value={`${property.squareMeters} sqm`}
            />
          </div>
        </div>

        <div className="space-y-3 px-4 pt-6">
          <h2 className="text-sm font-semibold">Property Features</h2>
          <div className="rounded-xl bg-muted px-3">
            <IconDetailRow icon={BedDouble} label="Bedroom" value={String(property.bedrooms)} />
            <IconDetailRow icon={Bath} label="Bathrooms" value={String(property.bathrooms)} />
            {COMING_SOON_FEATURES.map((feature) => (
              <IconDetailRow
                key={feature.label}
                icon={feature.icon}
                label={feature.label}
                value="—"
                muted
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 px-4 pt-6">
          <Button asChild variant="outline" size="xl" className="w-full">
            <a href={mapsHref} target="_blank" rel="noopener noreferrer">
              View Map
            </a>
          </Button>
          <Button asChild variant="outline" size="xl" className="w-full">
            <a href={`${mapsHref}&travelmode=driving`} target="_blank" rel="noopener noreferrer">
              <Navigation className="size-4" />
              Directions
            </a>
          </Button>
        </div>

        <div className="mx-4 mt-6 space-y-3 rounded-xl bg-[rgba(229,231,235,0.51)] p-4">
          <p className="text-center text-lg font-medium">Seller Verification</p>
          <div className="flex items-center gap-3 border-t pt-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
              {property.ownerAvatarUrl && (
                <Image src={property.ownerAvatarUrl} alt="" fill className="object-cover" />
              )}
            </div>
            <p className="flex items-center gap-1.5 text-base font-semibold">
              {property.ownerName}
              {property.isVerified && (
                <span className="flex items-center gap-0.5 rounded-full bg-white px-1 py-1 text-[10px] font-medium text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-success" />
                  Verified
                </span>
              )}
            </p>
          </div>
          <ul className="divide-y divide-black/[0.08] border-t border-black/[0.08]">
            {COMING_SOON_VERIFICATION.map((item) => (
              <li
                key={item}
                title="Coming soon"
                className="flex items-center justify-between py-3 text-xs text-muted-foreground/50"
              >
                {item}
                <CheckCircle2 className="size-4" />
              </li>
            ))}
          </ul>
        </div>

        <div className="h-24" />
      </div>

      {/* Sticky mobile CTA bar — hidden entirely for the property's own owner */}
      {!isOwner && (
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t bg-background px-4 py-3 sm:hidden">
        <OfferCta
          propertyId={property.id}
          propertyPrice={property.price}
          currency={property.currency}
          propertyTitle={property.title}
          variant="outline"
          size="xl"
          className="flex-1"
        />
        <MessageOwnerButton
          ownerId={property.ownerId}
          propertyId={property.id}
          ownerName={property.ownerName}
          label="Message Landlord"
          variant="default"
          size="xl"
          className="flex-1"
        />
      </div>
      )}

      {/* ---------- Desktop (hidden sm:block) — unchanged ---------- */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          <Link
            href="/search"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to search results
          </Link>
          <div className="flex items-center gap-4">
            <SaveButton
              propertyId={property.id}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
              iconClassName="size-4"
            />
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
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <button
              type="button"
              onClick={() => setDesktopGalleryOpen(true)}
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
                    onClick={() => setDesktopGalleryOpen(true)}
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

            {videoSection}
            {amenitiesSection}

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
                    key={feature.label}
                    className="flex items-center justify-between text-sm text-muted-foreground/50"
                    title="Coming soon"
                  >
                    <span>{feature.label}</span>
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
                {!isOwner && (
                  <>
                    <OfferCta
                      propertyId={property.id}
                      propertyPrice={property.price}
                      currency={property.currency}
                      propertyTitle={property.title}
                      variant="outline"
                    />
                    <MessageOwnerButton
                      ownerId={property.ownerId}
                      propertyId={property.id}
                      ownerName={property.ownerName}
                      label="Message Landlord"
                    />
                  </>
                )}
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
      </div>

      <PhotoGalleryModal
        open={desktopGalleryOpen}
        onOpenChange={setDesktopGalleryOpen}
        categories={property.imagesByCategory}
        allImages={property.allImages}
      />
      <MobileGalleryOverlay
        open={mobileGalleryOpen}
        onOpenChange={setMobileGalleryOpen}
        categories={property.imagesByCategory}
        allImages={property.allImages}
        propertyId={property.id}
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

function IconDetailRow({
  icon: Icon,
  label,
  value,
  muted = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div
      title={muted ? "Coming soon" : undefined}
      className={cn(
        "flex h-12 items-center justify-between border-b border-black/[0.06] text-foreground last:border-b-0",
        muted && "text-muted-foreground/50",
      )}
    >
      <span className="flex items-center gap-2 text-xs">
        <Icon className="size-4 shrink-0" />
        {label}
      </span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}
