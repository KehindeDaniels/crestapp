import { env } from "@/config/env";
import { formatCurrency } from "@/lib/utils/format";
import type { ID } from "@/types/api";
import type { PropertyPurpose } from "@/config/constants";
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
  ownerName: string;
  ownerAvatarUrl: string | null;
}

const TYPE_BADGE_LABELS: Record<PropertyPurpose, string> = {
  sale: "For sale",
  rent: "Rent",
  lease: "Lease",
};

/** Relative paths (media_url) need the API's own origin prefixed; already-absolute URLs (owner avatars) must not be touched. */
function toAbsoluteMediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const origin = new URL(env.NEXT_PUBLIC_API_URL).origin;
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function toPropertyCardModel(property: ApiProperty): PropertyCardModel {
  const primaryMedia =
    property.media.find((m) => m.is_primary === 1) ?? property.media[0];

  return {
    id: property.property_id,
    title: property.title,
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
    ownerName: property.owner.profile.full_name || "Property owner",
    ownerAvatarUrl: property.owner.profile.profile_picture_url,
  };
}
