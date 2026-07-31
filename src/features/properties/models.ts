import { formatCurrency } from "@/lib/utils/format";
import { toAbsoluteMediaUrl } from "@/lib/utils/media-url";
import type { ID } from "@/types/api";
import type { PropertyPurpose, PropertyType } from "@/config/constants";
import type { ApiProperty } from "./types";

/**
 * View model consumed by Home's listing card and any future property-card
 * usage — components bind to this, never to `ApiProperty` directly. Isolates
 * the UI from backend response quirks (string prices, relative media paths,
 * nested owner.profile.*, etc.) so a backend shape change only requires an
 * update here, not in every component that renders a card.
 */
export interface PropertyCardModel {
  id: ID;
  title: string;
  price: number;
  currency: string;
  priceFormatted: string;
  purpose: PropertyPurpose;
  /** "For sale" | "Rent" | "Lease" — the card's type badge label. */
  typeBadgeLabel: string;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  address: string;
  imageUrl: string | null;
  isActive: boolean;
  isVerified: boolean;
  ownerId: ID;
  ownerName: string;
  ownerAvatarUrl: string | null;
  /** Raw ISO timestamp — format at render time with `formatDate()`, not baked in here. */
  createdAt: string;
}

const TYPE_BADGE_LABELS: Record<PropertyPurpose, string> = {
  sale: "For sale",
  rent: "Rent",
  lease: "Lease",
};

export function toPropertyCardModel(property: ApiProperty): PropertyCardModel {
  // Be defensive: `media`/`owner`/`owner.profile` are typed as always-present,
  // but live responses can omit them (e.g. a property whose owner relation
  // wasn't loaded, or one with no photos). One malformed record must NOT throw
  // and take the whole feed/page down into the error boundary.
  // Filter to images for the card thumbnail — a video picked here would render
  // broken in an <img>. Media with no `media_type` predates the field → image.
  const images = (property.media ?? []).filter((m) => (m.media_type ?? "image") === "image");
  const primaryMedia = images.find((m) => m.is_primary === 1) ?? images[0];
  const profile = property.owner?.profile;

  return {
    id: property.property_id,
    title: property.title,
    price: Number(property.price),
    currency: property.currency,
    priceFormatted: formatCurrency(Number(property.price), property.currency),
    purpose: property.purpose,
    typeBadgeLabel: TYPE_BADGE_LABELS[property.purpose] ?? property.purpose,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareMeters: Number(property.square_meters),
    address: [property.location_address, property.city, property.state]
      .filter(Boolean)
      .join(", "),
    imageUrl: primaryMedia ? toAbsoluteMediaUrl(primaryMedia.media_url) : null,
    isActive: property.status === "active",
    isVerified: property.verification_status === "verified",
    ownerId: property.owner?.user_id ?? 0,
    ownerName: profile?.full_name || "Property owner",
    ownerAvatarUrl: profile?.profile_picture_url ?? null,
    createdAt: property.created_at,
  };
}

export interface PropertyDetailImage {
  url: string;
  caption: string | null;
}

export interface PropertyDetailCategory {
  /** Media `caption` value (e.g. "Living Room", "Kitchen") — confirmed live to group images this way, see docs/design-vs-backend-gaps.md. Falls back to "Other" when a media item has no caption. */
  category: string;
  images: PropertyDetailImage[];
}

/** Extends PropertyCardModel with the fields the Listing Detail page needs that the card doesn't. */
export interface PropertyDetailModel extends PropertyCardModel {
  description: string;
  propertyType: PropertyType;
  /** All images, in `display_order`, for the main gallery viewer. */
  allImages: PropertyDetailImage[];
  /** Same images grouped by category, for the "Property Details" modal's room tabs. */
  imagesByCategory: PropertyDetailCategory[];
  /** Uploaded videos (absolute .mp4 URLs) — no poster/thumbnail is returned for these. */
  videoUrls: string[];
  /**
   * Derived from the real `created_at` timestamp, not fabricated — computed
   * here (not at render time) since `Date.now()` is an impure call and this
   * mapper layer is the one place raw API data is allowed to be touched.
   */
  isRecentlyAdded: boolean;
}

const RECENTLY_ADDED_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function toPropertyDetailModel(property: ApiProperty): PropertyDetailModel {
  const card = toPropertyCardModel(property);

  const sortedMedia = [...(property.media ?? [])].sort(
    (a, b) => a.display_order - b.display_order,
  );
  // Videos must be split out of the image gallery — they'd render broken as <img>.
  const imageMedia = sortedMedia.filter((m) => (m.media_type ?? "image") === "image");
  const videoUrls = sortedMedia
    .filter((m) => m.media_type === "video")
    .map((m) => toAbsoluteMediaUrl(m.media_url));

  const allImages: PropertyDetailImage[] = imageMedia.map((m) => ({
    url: toAbsoluteMediaUrl(m.media_url),
    caption: m.caption,
  }));

  const byCategory = new Map<string, PropertyDetailImage[]>();
  for (const media of imageMedia) {
    const category = media.caption || "Other";
    const list = byCategory.get(category) ?? [];
    list.push({ url: toAbsoluteMediaUrl(media.media_url), caption: media.caption });
    byCategory.set(category, list);
  }

  return {
    ...card,
    description: property.description,
    propertyType: property.property_type,
    allImages,
    imagesByCategory: Array.from(byCategory, ([category, images]) => ({
      category,
      images,
    })),
    videoUrls,
    isRecentlyAdded:
      Date.now() - new Date(property.created_at).getTime() < RECENTLY_ADDED_WINDOW_MS,
  };
}
