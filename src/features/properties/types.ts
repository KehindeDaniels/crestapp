import type {
  PropertyPurpose,
  PropertyStatus,
  PropertyType,
  VerificationStatus,
} from "@/config/constants";
import type { ApiEnvelope, ID } from "@/types/api";

/**
 * POST /api/properties/search request body. Confirmed via the Postman
 * collection's documented validation-rule comments (no live example was
 * ever exercised in the collection itself, but the schema is fully spelled
 * out). `purpose` deliberately excludes "airbnb" — no such value exists;
 * see docs/design-vs-backend-gaps.md (Phase 4).
 */
export interface PropertySearchParams {
  id?: number;
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

/**
 * Response shape when `properties/search` is called WITH an `id` filter —
 * confirmed live to be a genuinely different shape, not the list response
 * with a one-item array. `data` IS the property object directly (message
 * even says "Property details retrieved successfully" vs. "Properties
 * retrieved successfully" for the list case). Also includes a few fields
 * not seen on the list response (`latitude`, `longitude`, `year_built`,
 * `updated_at`) — not modeled here since nothing consumes them yet.
 */
export interface PropertyDetailResponse {
  success: boolean;
  message: string;
  data: ApiProperty;
}

/**
 * Body for `POST /api/properties/{rental,sale}` — confirmed against the
 * Postman collection's example requests for both endpoints (identical
 * shape, only the URL differs by purpose). `currency`/`country` are not
 * user-facing — hardcoded to "NGN"/"Nigeria" by the caller. Deliberately
 * excludes land size/plots, amenities, price-negotiable, and rent payment
 * terms — none of those fields exist anywhere in the collection or in the
 * live `ApiProperty` shape above. See docs/design-vs-backend-gaps.md.
 */
export interface CreatePropertyPayload {
  title: string;
  description: string;
  property_type: PropertyType;
  price: number;
  currency: string;
  location_address: string;
  city: string;
  state: string;
  country: string;
  bedrooms: number;
  bathrooms: number;
  square_meters: number;
}

/**
 * The create endpoints have no saved response example in the Postman
 * collection. `data` is typed as `ApiProperty` on the (reasonable, but
 * unconfirmed) assumption that it mirrors every other property endpoint's
 * envelope — the caller must still guard defensively against a missing
 * `property_id` rather than trust this blindly.
 */
export type CreatePropertyResponse = ApiEnvelope<ApiProperty>;

/**
 * Response for `POST /api/properties/{id}/media` — confirmed live via the
 * Postman collection's saved example response.
 */
export interface UploadMediaResponse {
  success: boolean;
  message: string;
  data: {
    uploaded_count: number;
    media: ApiPropertyMedia[];
  };
}

/**
 * Body for `POST /api/documents/upload` (multipart) — confirmed live via
 * the Postman collection's saved example response (Legal Documentation
 * section). `entity_type`/`entity_id` link the document to a property.
 * `document_type` is a generic enum (`agreement|contract|disclosure|
 * certificate|report`), not the specific legal-document categories the
 * List Property wizard's UI shows — see `DOCUMENT_SLOTS` in config.ts.
 */
export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  data: {
    document_id: ID;
    document_uuid: string;
    document_type: string;
    title: string;
    status: string;
    uploaded_at: string | null;
    file_size: string;
  };
}
