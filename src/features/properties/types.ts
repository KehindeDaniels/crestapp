import type {
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
  VerificationStatus,
} from "@/config/constants";
import type { ID } from "@/types/api";

/**
 * POST /api/properties/search request body. Confirmed via the Postman
 * collection's documented validation-rule comments (no live example was
 * ever exercised in the collection itself, but the schema is fully spelled
 * out). `purpose` deliberately excludes "airbnb" — no such value exists;
 * see docs/design-vs-backend-gaps.md (Phase 4).
 */
export interface PropertySearchParams {
  search?: string;
  property_type?: PropertyType;
  purpose?: PropertyPurpose;
  city?: string;
  state?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: PropertyStatus;
  featured?: boolean;
  sort_by?: "created_at" | "price" | "updated_at";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface ApiPropertyMedia {
  media_id: ID;
  media_type: string;
  /** Relative path (e.g. "/storage/property_media/...") — needs the API base URL prefixed. Confirmed live 2026-07-14. */
  media_url: string;
  thumbnail_url: string;
  caption: string | null;
  is_primary: 0 | 1;
  display_order: number;
}

export interface ApiPropertyOwner {
  user_id: ID;
  role: string;
  profile: {
    first_name: string;
    last_name: string;
    full_name: string;
    /** Already a full absolute URL, unlike media_url — confirmed live, do not prefix again. */
    profile_picture_url: string | null;
  };
}

/**
 * A single property object from `properties/search`'s response. Confirmed
 * live against real seeded data 2026-07-14 (see docs/design/home-page-data-plan.md
 * §2b) — price/square_meters are numeric STRINGS, not numbers, and featured
 * is 0/1, not boolean. Preserved as-is here (raw API shape); `toPropertyCardModel`
 * in models.ts is what normalizes these for display.
 */
export interface ApiProperty {
  property_id: ID;
  title: string;
  description: string;
  property_type: PropertyType;
  purpose: PropertyPurpose;
  price: string;
  currency: string;
  location_address: string;
  city: string;
  state: string;
  country: string;
  bedrooms: number;
  bathrooms: number;
  square_meters: string;
  status: PropertyStatus;
  verification_status: VerificationStatus;
  featured: 0 | 1;
  created_at: string;
  media: ApiPropertyMedia[];
  owner: ApiPropertyOwner;
}

export interface PropertySearchResponse {
  success: boolean;
  message: string;
  data: {
    properties: ApiProperty[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}
