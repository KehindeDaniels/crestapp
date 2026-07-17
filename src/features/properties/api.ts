import { apiClient } from "@/lib/api/client";
import type { ID } from "@/types/api";
import type {
  PropertySearchParams,
  PropertySearchResponse,
  PropertyDetailResponse,
  CreatePropertyPayload,
  CreatePropertyResponse,
  UploadMediaResponse,
} from "./types";

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

  /**
   * Same endpoint as `search`, but confirmed live to return a genuinely
   * different response shape when `id` is passed — `data` is the property
   * object directly, not `{ properties: [...] }`. Kept as its own typed
   * method rather than overloading `search`'s return type.
   */
  get: (id: number) =>
    apiClient<PropertyDetailResponse>("/api/properties/search", {
      method: "POST",
      body: { id, per_page: 1 },
    }),

  createRental: (payload: CreatePropertyPayload) =>
    apiClient<CreatePropertyResponse>("/api/properties/rental", {
      method: "POST",
      body: payload,
    }),

  createSale: (payload: CreatePropertyPayload) =>
    apiClient<CreatePropertyResponse>("/api/properties/sale", {
      method: "POST",
      body: payload,
    }),

  /** Multipart — `apiClient` skips JSON serialization for `FormData` and lets the browser set the boundary. */
  uploadMedia: (propertyId: ID, formData: FormData) =>
    apiClient<UploadMediaResponse>(`/api/properties/${propertyId}/media`, {
      method: "POST",
      body: formData,
    }),
};
