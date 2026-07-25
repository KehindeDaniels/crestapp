import { apiClient } from "@/lib/api/client";
import type { ID } from "@/types/api";
import type {
  CancelBookingPayload,
  CancelBookingResponse,
  CreateBookingPayload,
  CreateBookingResponse,
  CreateShortletPayload,
  MutateShortletResponse,
  MyBookingsResponse,
  PayBookingPayload,
  PayBookingResponse,
  QuoteShortletPayload,
  ShortletAvailabilityResponse,
  ShortletCalendarResponse,
  ShortletDetailResponse,
  ShortletListResponse,
  ShortletQuoteResponse,
  ShortletSearchParams,
  ShortletSearchResponse,
  UpdateAvailabilityPayload,
  UpdateAvailabilityResponse,
  UpdateShortletPayload,
} from "./types";

function toQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const shortletsApi = {
  // --- Owner: listings ---
  listMine: () => apiClient<ShortletListResponse>("/api/shortlets"),

  create: (payload: CreateShortletPayload) =>
    apiClient<MutateShortletResponse>("/api/shortlets", { method: "POST", body: payload }),

  update: (listingId: ID, payload: UpdateShortletPayload) =>
    apiClient<MutateShortletResponse>(`/api/shortlets/${listingId}`, {
      method: "PUT",
      body: payload,
    }),

  // --- Owner: room calendar ---
  calendar: (listingId: ID, roomId: ID, from: string, to: string) =>
    apiClient<ShortletCalendarResponse>(
      `/api/shortlets/${listingId}/rooms/${roomId}/calendar${toQuery({ from, to })}`,
    ),

  updateAvailability: (listingId: ID, roomId: ID, payload: UpdateAvailabilityPayload) =>
    apiClient<UpdateAvailabilityResponse>(
      `/api/shortlets/${listingId}/rooms/${roomId}/availability`,
      { method: "PUT", body: payload },
    ),

  // --- Guest: browse / search ---
  search: (params: ShortletSearchParams) =>
    apiClient<ShortletSearchResponse>("/api/shortlets/search", { method: "POST", body: params }),

  browse: (listingId: ID) =>
    apiClient<ShortletDetailResponse>(`/api/shortlets/browse/${listingId}`),

  browseAvailability: (listingId: ID, checkInDate: string, nights: number) =>
    apiClient<ShortletAvailabilityResponse>(
      `/api/shortlets/browse/${listingId}/availability${toQuery({ check_in_date: checkInDate, nights })}`,
    ),

  quote: (payload: QuoteShortletPayload) =>
    apiClient<ShortletQuoteResponse>("/api/shortlets/quote", { method: "POST", body: payload }),

  // --- Guest: bookings ---
  createBooking: (payload: CreateBookingPayload) =>
    apiClient<CreateBookingResponse>("/api/shortlets/bookings", { method: "POST", body: payload }),

  payBooking: (bookingId: ID, payload: PayBookingPayload) =>
    apiClient<PayBookingResponse>(`/api/shortlets/bookings/${bookingId}/pay`, {
      method: "POST",
      body: payload,
    }),

  myBookings: () => apiClient<MyBookingsResponse>("/api/shortlets/bookings/mine"),

  cancelBooking: (bookingId: ID, payload: CancelBookingPayload) =>
    apiClient<CancelBookingResponse>(`/api/shortlets/bookings/${bookingId}/cancel`, {
      method: "POST",
      body: payload,
    }),
};
