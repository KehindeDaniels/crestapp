import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { useSessionStore } from "@/features/auth";
import type { ID } from "@/types/api";
import { shortletsApi } from "./api";
import {
  toBookingModel,
  toBookingPaymentSession,
  toShortletCardModel,
  toShortletDetailModel,
  type BookingPaymentSession,
} from "./models";
import type {
  CreateBookingPayload,
  CreateShortletPayload,
  QuoteShortletPayload,
  ShortletSearchParams,
  UpdateAvailabilityPayload,
  UpdateShortletPayload,
} from "./types";

// --- Owner: listings ---

/** `GET /api/shortlets` — the owner's own listings. */
export function useMyShortlets() {
  const userId = useSessionStore((s) => s.user?.user_id);
  return useQuery({
    queryKey: queryKeys.shortlets.mine,
    queryFn: async () => (await shortletsApi.listMine()).data.map(toShortletCardModel),
    enabled: Boolean(userId),
  });
}

export function useCreateShortlet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShortletPayload) => shortletsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shortlets.mine });
    },
  });
}

export function useUpdateShortlet(listingId: ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateShortletPayload) => shortletsApi.update(listingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shortlets.mine });
      queryClient.invalidateQueries({ queryKey: queryKeys.shortlets.detail(listingId) });
    },
  });
}

// --- Owner: room calendar ---

export function useRoomCalendar(listingId: ID, roomId: ID | null, from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.shortlets.calendar(listingId, roomId ?? 0, { from, to }),
    queryFn: async () => (await shortletsApi.calendar(listingId, roomId!, from, to)).data,
    enabled: roomId != null && Boolean(from) && Boolean(to),
  });
}

export function useUpdateAvailability(listingId: ID, roomId: ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAvailabilityPayload) =>
      shortletsApi.updateAvailability(listingId, roomId, payload),
    onSuccess: () => {
      // Broad invalidate — the exact calendar cache key includes a date range we don't have here.
      queryClient.invalidateQueries({ queryKey: queryKeys.shortlets.all });
    },
  });
}

// --- Guest: browse / search ---

/** `POST /api/shortlets/search` — only fires once a check-in date + nights are set. */
export function useShortletSearch(params: ShortletSearchParams | null) {
  return useQuery({
    queryKey: queryKeys.shortlets.search(params),
    queryFn: async () => {
      const response = await shortletsApi.search(params!);
      return {
        listings: response.data.listings.map(toShortletCardModel),
        count: response.data.count,
        nights: response.data.nights,
        checkInDate: response.data.check_in_date,
      };
    },
    enabled: params != null,
  });
}

export function useShortletDetail(listingId: ID | null) {
  return useQuery({
    queryKey: queryKeys.shortlets.detail(listingId ?? 0),
    queryFn: async () => toShortletDetailModel((await shortletsApi.browse(listingId!)).data),
    enabled: listingId != null,
  });
}

/** `GET .../browse/{id}/availability` — which rooms are free for a date range. Returns the raw data; caller maps with `toAvailabilityRooms` (needs the listing's currency). */
export function useShortletAvailability(
  listingId: ID | null,
  checkInDate: string | null,
  nights: number | null,
) {
  return useQuery({
    queryKey: queryKeys.shortlets.availability(listingId ?? 0, { checkInDate, nights }),
    queryFn: async () =>
      (await shortletsApi.browseAvailability(listingId!, checkInDate!, nights!)).data,
    enabled: listingId != null && Boolean(checkInDate) && nights != null && nights > 0,
  });
}

export function useShortletQuote() {
  return useMutation({
    mutationFn: (payload: QuoteShortletPayload) => shortletsApi.quote(payload),
  });
}

// --- Guest: bookings ---

/**
 * Creates the booking hold, then seeds the payment-session cache the moment
 * payment is generated. Same one-time-link pattern as Offers: the
 * `payment_url` isn't guaranteed re-fetchable, so the booking flow keeps it
 * in a cache-only key distinct from any re-fetchable booking-status query.
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => shortletsApi.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shortlets.myBookings });
    },
  });
}

export function usePayBooking(bookingId: ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gateway: string) => shortletsApi.payBooking(bookingId, { gateway }),
    onSuccess: (response) => {
      queryClient.setQueryData(
        queryKeys.shortlets.paymentSession(bookingId),
        toBookingPaymentSession(response.data),
      );
    },
  });
}

/** Reads the cached one-time payment session for a booking — never fetches on its own. */
export function useBookingPaymentSession(bookingId: ID) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.shortlets.paymentSession(bookingId),
    queryFn: () =>
      queryClient.getQueryData<BookingPaymentSession>(
        queryKeys.shortlets.paymentSession(bookingId),
      ),
    enabled: false,
    initialData: () =>
      queryClient.getQueryData<BookingPaymentSession>(
        queryKeys.shortlets.paymentSession(bookingId),
      ),
    staleTime: Infinity,
  });
}

const BOOKINGS_POLL_MS = 15_000;

/**
 * `GET /api/shortlets/bookings/mine`. Polls (same "fake real-time" pattern as
 * the rest of the app) so a booking flips from `pending_payment` to
 * `confirmed` on its own after the Flutterwave webhook fires — there's no
 * confirmed single-booking GET endpoint to poll instead (plan §3, Gap 3).
 */
export function useMyBookings() {
  const userId = useSessionStore((s) => s.user?.user_id);
  return useQuery({
    queryKey: queryKeys.shortlets.myBookings,
    queryFn: async () => (await shortletsApi.myBookings()).data.map(toBookingModel),
    enabled: Boolean(userId),
    refetchInterval: BOOKINGS_POLL_MS,
  });
}

export function useCancelBooking(bookingId: ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => shortletsApi.cancelBooking(bookingId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shortlets.myBookings });
    },
  });
}
