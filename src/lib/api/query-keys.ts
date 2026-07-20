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
} as const;
