import { formatCurrency } from "@/lib/utils/format";
import type { ID } from "@/types/api";
import type {
  ApiBooking,
  ApiCalendarNight,
  ApiShortletListing,
  PayBookingResponse,
  ShortletAvailabilityResponse,
  ShortletQuoteResponse,
} from "./types";

/** Money in these responses is sometimes a string ("40000.00"), sometimes a number. Always coerce through here. */
function num(value: string | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value);
}

/** One card in the guest search grid / owner listing list. */
export interface ShortletCardModel {
  listingId: ID;
  title: string;
  city: string;
  currency: string;
  pricePerNight: number;
  pricePerNightFormatted: string;
  status: string;
  roomCount: number;
}

export function toShortletCardModel(listing: ApiShortletListing): ShortletCardModel {
  const currency = listing.currency || "NGN";
  return {
    listingId: listing.listing_id,
    title: listing.property.title,
    city: listing.property.city,
    currency,
    pricePerNight: num(listing.base_nightly_rate),
    pricePerNightFormatted: formatCurrency(num(listing.base_nightly_rate), currency),
    status: listing.status,
    roomCount: listing.rooms?.length ?? 0,
  };
}

export interface ShortletRoomModel {
  roomId: ID;
  name: string;
  status: string;
  capacity: number | null;
  beds: number | null;
  nightlyRateFormatted: string | null;
}

/** Full listing detail for the guest browse page. */
export interface ShortletDetailModel extends ShortletCardModel {
  checkInTime: string | null;
  cleaningFee: number;
  cleaningFeeFormatted: string;
  /** Service fee as basis points (500 = 5%) — display as a percent. */
  serviceFeePercent: number | null;
  instantBook: boolean;
  minNights: number | null;
  maxNights: number | null;
  cancellationPolicy: string | null;
  rooms: ShortletRoomModel[];
}

export function toShortletDetailModel(listing: ApiShortletListing): ShortletDetailModel {
  const card = toShortletCardModel(listing);
  const currency = card.currency;
  return {
    ...card,
    checkInTime: listing.check_in_time ?? null,
    cleaningFee: num(listing.cleaning_fee),
    cleaningFeeFormatted: formatCurrency(num(listing.cleaning_fee), currency),
    serviceFeePercent: listing.service_fee_bps != null ? listing.service_fee_bps / 100 : null,
    instantBook: listing.instant_book ?? false,
    minNights: listing.min_nights ?? null,
    maxNights: listing.max_nights ?? null,
    cancellationPolicy: listing.cancellation_policy ?? null,
    rooms: (listing.rooms ?? []).map((room) => ({
      roomId: room.room_id,
      name: room.name,
      status: room.status,
      capacity: room.capacity ?? null,
      beds: room.beds ?? null,
      nightlyRateFormatted:
        room.nightly_rate != null ? formatCurrency(num(room.nightly_rate), currency) : null,
    })),
  };
}

/** A room's bookability for a specific date range (guest detail page). */
export interface AvailabilityRoomModel {
  roomId: ID;
  name: string;
  capacity: number | null;
  nightlyRate: number;
  nightlyRateFormatted: string;
  available: boolean;
}

export function toAvailabilityRooms(
  response: ShortletAvailabilityResponse["data"],
  currency: string,
): AvailabilityRoomModel[] {
  return response.rooms.map((room) => ({
    roomId: room.room_id,
    name: room.name,
    capacity: room.capacity ?? null,
    nightlyRate: room.effective_nightly_rate,
    nightlyRateFormatted: formatCurrency(room.effective_nightly_rate, currency),
    available: room.available,
  }));
}

/** Priced quote before booking — every line is real, frozen server-side. */
export interface QuoteModel {
  listingId: ID;
  currency: string;
  nights: number;
  checkInDate: string;
  checkInAt: string;
  endsAt: string;
  subtotalFormatted: string;
  cleaningFeeFormatted: string;
  serviceFeeFormatted: string;
  totalFormatted: string;
  rooms: { roomId: ID; name: string; nights: number; lineTotalFormatted: string }[];
}

export function toQuoteModel(data: ShortletQuoteResponse["data"]): QuoteModel {
  const currency = data.currency || "NGN";
  return {
    listingId: data.listing_id,
    currency,
    nights: data.nights,
    checkInDate: data.check_in_date,
    checkInAt: data.check_in_at,
    endsAt: data.ends_at,
    subtotalFormatted: formatCurrency(num(data.subtotal), currency),
    cleaningFeeFormatted: formatCurrency(num(data.cleaning_fee), currency),
    serviceFeeFormatted: formatCurrency(num(data.service_fee), currency),
    totalFormatted: formatCurrency(num(data.total_amount), currency),
    rooms: data.rooms.map((room) => ({
      roomId: room.room_id,
      name: room.name,
      nights: room.nights,
      lineTotalFormatted: formatCurrency(num(room.line_total), currency),
    })),
  };
}

/** A booking (from create, or a row of /bookings/mine). */
export interface BookingModel {
  bookingId: ID;
  status: string;
  currency: string;
  nights: number;
  totalFormatted: string;
  checkInAt: string;
  endsAt: string;
  expiresAt: string | null;
  listingId: ID | null;
  listingTitle: string | null;
  city: string | null;
}

export function toBookingModel(booking: ApiBooking): BookingModel {
  const currency = booking.currency || "NGN";
  return {
    bookingId: booking.booking_id,
    status: booking.status,
    currency,
    nights: booking.nights,
    totalFormatted: formatCurrency(num(booking.total_amount), currency),
    checkInAt: booking.check_in_at,
    endsAt: booking.ends_at,
    expiresAt: booking.expires_at ?? null,
    listingId: booking.listing?.listing_id ?? booking.listing_id ?? null,
    listingTitle: booking.listing?.property.title ?? null,
    city: booking.listing?.property.city ?? null,
  };
}

/** One-time payment session for a booking — cached, never re-fetched (see hooks.ts). */
export interface BookingPaymentSession {
  paymentUrl: string;
  gateway: string;
  expiresAt: string;
}

export function toBookingPaymentSession(data: PayBookingResponse["data"]): BookingPaymentSession {
  return {
    paymentUrl: data.payment_url,
    gateway: data.gateway,
    expiresAt: data.expires_at,
  };
}

/** One night in the owner's room calendar. */
export interface CalendarNightModel {
  date: string;
  status: string;
  priceOverrideFormatted: string | null;
}

export function toCalendarNight(night: ApiCalendarNight, currency: string): CalendarNightModel {
  return {
    date: night.date,
    status: night.status,
    priceOverrideFormatted:
      night.price_override != null ? formatCurrency(num(night.price_override), currency) : null,
  };
}
