import { apiClient } from "@/lib/api/client";
import type { PropertySearchParams, PropertySearchResponse } from "./types";

export const propertiesApi = {
  /**
   * Confirmed live to require Bearer auth (unauthenticated requests error
   * with a raw 500, not a clean 401 — see docs/design-vs-backend-gaps.md,
   * Phase 4). Client-fetched via TanStack Query, never RSC.
   */
  search: (params: PropertySearchParams) =>
    apiClient<PropertySearchResponse>("/api/properties/search", {
      method: "POST",
      body: params,
    }),
};
