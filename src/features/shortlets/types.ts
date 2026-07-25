import type { ID } from "@/types/api";

/**
 * Shortlet API shapes — field names taken verbatim from the real saved
 * examples in the 2026-07-22 Postman collection. Every endpoint here has a
 * full example (rare for this backend). Two cross-cutting quirks handled by
 * the model layer (models.ts), not the components:
 *
 *  1. Money is inconsistently typed — some responses give decimal STRINGS
 *     ("40000.00"), others plain NUMBERS (quote's `subtotal: 80000`). Typed
 *     as `string | number` here; `models.ts` coerces with `Number()`.
 *  2. Nested `rooms`/`property` objects are TRIMMED differently per endpoint
 *     (create returns the fullest room shape; list/browse/search return only
 *     status/room_id/name). Optional fields below reflect "not always
 *     present in the example," not "nullable in the domain."
 *
 * See docs/design/shortlet-implementation-plan.md for the full reference.
 */

type Money = string | number;

export const SHORTLET_LISTING_STATUSES = ["draft", "active"] as const;
export type ShortletListingStatus = (typeof SHORTLET_LISTING_STATUSES)[number];

export const SHORTLET_BOOKING_STATUSES = [
  "pending_payment",
  "confirmed",
  "completed",
  "expired",
  "cancelled",
] as const;
export type ShortletBookingStatus = (typeof SHORTLET_BOOKING_STATUSES)[number];

export const SHORTLET_NIGHT_STATUSES = ["available", "blocked", "held", "booked"] as const;
export type ShortletNightStatus = (typeof SHORTLET_NIGHT_STATUSES)[number];

export const CANCELLATION_POLICIES = ["flexible", "moderate", "strict"] as const;
export type CancellationPolicy = (typeof CANCELLATION_POLICIES)[number];

export interface ApiShortletRoom {
  room_id: ID;
  name: string;
  status: string;
  /** Present in the create example; trimmed out of list/browse/search examples. */
  capacity?: number;
  beds?: number;
  nightly_rate?: Money | null;
  sort_order?: number;
  listing_id?: ID;
}

export interface ApiShortletPropertySummary {
  property_id?: ID;
  title: string;
  purpose: string;
  city: string;
  /** Present on some examples (create/list), absent on others (browse/search). */
  state?: string;
  status?: string;
  price?: Money;
}

export interface ApiShortletListing {
  listing_id: ID;
  status: string;
  base_nightly_rate: Money;
  currency: string;
  property: ApiShortletPropertySummary;
  rooms: ApiShortletRoom[];
  /** Present on the fuller examples (create/browse), trimmed from list/search. */
  check_in_time?: string;
  cleaning_fee?: Money;
  service_fee_bps?: number;
  instant_book?: boolean;
  min_nights?: number;
  max_nights?: number;
  cancellation_policy?: string;
  owner_id?: ID;
  property_id?: ID;
}

export interface ShortletListResponse {
  success: boolean;
  data: ApiShortletListing[];
}

export interface ShortletDetailResponse {
  success: boolean;
  data: ApiShortletListing;
}

/** `POST /api/shortlets` request body. */
export interface CreateShortletPayload {
  title: string;
  description: string;
  property_type: string;
  location_address: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  square_meters: number;
  year_built?: number;
  base_nightly_rate: number;
  currency: string;
  min_nights: number;
  max_nights: number;
  check_in_time: string;
  instant_book: boolean;
  cleaning_fee: number;
  service_fee_bps: number;
  cancellation_policy: string;
  rooms: {
    name: string;
    room_type: string;
    capacity: number;
    beds: number;
    nightly_rate: number;
    sort_order: number;
  }[];
}

/** `PUT /api/shortlets/{id}` request body (activate / update). */
export interface UpdateShortletPayload {
  status?: string;
  base_nightly_rate?: number;
  currency?: string;
  min_nights?: number;
  max_nights?: number;
  check_in_time?: string;
  instant_book?: boolean;
  cleaning_fee?: number;
  service_fee_bps?: number;
  cancellation_policy?: string;
  title?: string;
  description?: string;
}

export interface MutateShortletResponse {
  success: boolean;
  message: string;
  data: ApiShortletListing;
}

/** `POST /api/shortlets/search` request body. */
export interface ShortletSearchParams {
  check_in_date: string;
  nights: number;
  city?: string;
  state?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
}

export interface ShortletSearchResponse {
  success: boolean;
  data: {
    listings: ApiShortletListing[];
    count: number;
    nights: number;
    check_in_date: string;
    ends_at_hint: string;
  };
}

export interface ApiAvailabilityRoom {
  room_id: ID;
  name: string;
  capacity?: number;
  effective_nightly_rate: number;
  available: boolean;
}

export interface ShortletAvailabilityResponse {
  success: boolean;
  data: {
    listing_id: ID;
    check_in_date: string;
    nights: number;
    dates: string[];
    rooms: ApiAvailabilityRoom[];
  };
}

/** `GET .../rooms/{id}/calendar` — per-night owner view. */
export interface ApiCalendarNight {
  date: string;
  status: ShortletNightStatus | string;
  price_override: Money | null;
}

export interface ShortletCalendarResponse {
  success: boolean;
  data: {
    room_id: ID;
    from: string;
    to: string;
    nights: ApiCalendarNight[];
  };
}

/** `PUT .../rooms/{id}/availability` request body. */
export interface UpdateAvailabilityPayload {
  from: string;
  to: string;
  status: "available" | "blocked";
  price_override: number | null;
}

export interface UpdateAvailabilityResponse {
  success: boolean;
  message: string;
  data: { updated: number; skipped: number };
}

/** `POST /api/shortlets/quote` request body. */
export interface QuoteShortletPayload {
  listing_id: ID;
  room_ids: ID[];
  check_in_date: string;
  nights: number;
}

export interface ApiQuoteRoom {
  room_id: ID;
  name: string;
  nights: number;
  line_total: Money;
  nightly_breakdown: { date: string; rate: Money }[];
}

export interface ShortletQuoteResponse {
  success: boolean;
  data: {
    listing_id: ID;
    check_in_date: string;
    nights: number;
    currency: string;
    rooms: ApiQuoteRoom[];
    subtotal: Money;
    cleaning_fee: Money;
    service_fee: Money;
    total_amount: Money;
    check_in_at: string;
    ends_at: string;
  };
}

/** `POST /api/shortlets/bookings` request body. */
export interface CreateBookingPayload {
  listing_id: ID;
  room_ids: ID[];
  check_in_date: string;
  nights: number;
  guests_count: number;
}

export interface ApiBooking {
  booking_id: ID;
  booking_uuid?: string;
  listing_id?: ID;
  status: string;
  currency: string;
  nights: number;
  guests_count?: number;
  subtotal?: Money;
  fees?: Money;
  total_amount: Money;
  check_in_at: string;
  ends_at: string;
  expires_at?: string;
  owner_id?: ID;
  guest_id?: ID;
  rooms?: { room_id: ID; nights: number; line_total: Money }[];
  /** Present only on the `/bookings/mine` list rows. */
  listing?: {
    listing_id: ID;
    property: { title: string; city: string };
  };
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  data: ApiBooking;
}

export interface MyBookingsResponse {
  success: boolean;
  data: ApiBooking[];
}

/** `POST /api/shortlets/bookings/{id}/pay` request body. */
export interface PayBookingPayload {
  gateway: string;
}

export interface PayBookingResponse {
  success: boolean;
  message: string;
  data: {
    payment_url: string;
    gateway: string;
    gateway_reference: string;
    transaction_id: ID;
    expires_at: string;
    payment: { payment_id: ID; amount: Money; currency: string; status: string };
    booking: { booking_id: ID; total_amount: Money; status: string };
  };
}

/** `POST /api/shortlets/bookings/{id}/cancel` request body. */
export interface CancelBookingPayload {
  reason: string;
}

export interface CancelBookingResponse {
  success: boolean;
  message: string;
  data: {
    booking_id: ID;
    status: string;
    cancelled_at: string;
    cancellation_reason: string;
  };
}
