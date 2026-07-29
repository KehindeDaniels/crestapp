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
  const primaryMedia =
    property.media.find((m) => m.is_primary === 1) ?? property.media[0];

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
    ownerId: property.owner.user_id,
    ownerName: property.owner.profile.full_name || "Property owner",
    ownerAvatarUrl: property.owner.profile.profile_picture_url,
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

  const sortedMedia = [...property.media].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const allImages: PropertyDetailImage[] = sortedMedia.map((m) => ({
    url: toAbsoluteMediaUrl(m.media_url),
    caption: m.caption,
  }));

  const byCategory = new Map<string, PropertyDetailImage[]>();
  for (const media of sortedMedia) {
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
    isRecentlyAdded:
      Date.now() - new Date(property.created_at).getTime() < RECENTLY_ADDED_WINDOW_MS,
  };
}
