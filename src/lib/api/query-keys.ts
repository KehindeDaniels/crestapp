/**
 * Central TanStack Query keys. One place to keep cache keys consistent and to
 * reason about invalidation (e.g. accepting a contract invalidates contracts + transactions).
 */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  profile: {
    detail: ["profile"] as const,
    credibility: ["profile", "credibility"] as const,
  },
  kyc: {
    mine: ["kyc", "mine"] as const,
  },
  properties: {
    all: ["properties"] as const,
    search: (params: unknown) => ["properties", "search", params] as const,
    detail: (id: number) => ["properties", "detail", id] as const,
    mine: (params: unknown) => ["properties", "mine", params] as const,
    statistics: ["properties", "statistics"] as const,
  },
  contracts: {
    all: ["contracts"] as const,
    list: (params: unknown) => ["contracts", "list", params] as const,
    detail: (id: number) => ["contracts", "detail", id] as const,
    statistics: ["contracts", "statistics"] as const,
    /** One-time creation payload (payment_link/fee_breakdown) — distinct from `detail`, which is the real re-fetchable `GET /api/contracts/{id}`. Never both keyed the same — see offers/hooks.ts. */
    paymentSession: (id: number) => ["contracts", "payment-session", id] as const,
    forProperty: (propertyId: number) => ["contracts", "for-property", propertyId] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (params: unknown) => ["transactions", "list", params] as const,
    detail: (id: number) => ["transactions", "detail", id] as const,
  },
  messaging: {
    conversations: ["messaging", "conversations"] as const,
    conversation: (userId: number) =>
      ["messaging", "conversation", userId] as const,
    unreadCount: ["messaging", "unread-count"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    preferences: ["notifications", "preferences"] as const,
  },
  support: {
    tickets: ["support", "tickets"] as const,
    ticket: (id: number) => ["support", "ticket", id] as const,
  },
  shortlets: {
    all: ["shortlets"] as const,
    /** Owner's own listings (`GET /api/shortlets`). */
    mine: ["shortlets", "mine"] as const,
    /** Guest search results (`POST /api/shortlets/search`). */
    search: (params: unknown) => ["shortlets", "search", params] as const,
    /** Public listing detail (`GET /api/shortlets/browse/{id}`). */
    detail: (listingId: number) => ["shortlets", "detail", listingId] as const,
    /** Which rooms are free for a date range (`GET .../browse/{id}/availability`). */
    availability: (listingId: number, params: unknown) =>
      ["shortlets", "availability", listingId, params] as const,
    /** Per-night owner calendar for one room (`GET .../rooms/{id}/calendar`). */
    calendar: (listingId: number, roomId: number, params: unknown) =>
      ["shortlets", "calendar", listingId, roomId, params] as const,
    /** Guest's own bookings (`GET /api/shortlets/bookings/mine`). */
    myBookings: ["shortlets", "bookings", "mine"] as const,
    /**
     * One-time payment session for a booking (payment_url) — distinct from any
     * re-fetchable booking-status query, exactly like `contracts.paymentSession`
     * vs `contracts.detail`. Never share a key between a cache-only snapshot and
     * a live-polled query (see offers/hooks.ts for why).
     */
    paymentSession: (bookingId: number) =>
      ["shortlets", "booking-payment-session", bookingId] as const,
  },
} as const;
