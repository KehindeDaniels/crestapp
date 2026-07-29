import { apiClient } from "@/lib/api/client";
import type { ID } from "@/types/api";
import type {
  PropertySearchParams,
  PropertySearchResponse,
  PropertyDetailResponse,
  CreatePropertyPayload,
  CreatePropertyResponse,
  UploadMediaResponse,
  UploadDocumentResponse,
  UploadVerificationDocumentResponse,
  SubmitVerificationResponse,
  MyPropertiesParams,
  MyPropertiesResponse,
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

  /** Multipart — see `UploadDocumentResponse` for the confirmed real shape. */
  uploadDocument: (formData: FormData) =>
    apiClient<UploadDocumentResponse>("/api/documents/upload", {
      method: "POST",
      body: formData,
    }),

  /**
   * Multipart — uploads an *ownership* document to the property-verification
   * track (what the admin approval reads). Distinct from `uploadDocument`,
   * which posts to the general legal-documents endpoint the admin doesn't gate
   * on. See docs/design-vs-backend-gaps.md.
   */
  uploadVerificationDocument: (propertyId: ID, formData: FormData) =>
    apiClient<UploadVerificationDocumentResponse>(
      `/api/properties/${propertyId}/verification/documents`,
      { method: "POST", body: formData },
    ),

  /** Submits the property for admin/professional verification (→ `pending`). */
  submitForVerification: (propertyId: ID) =>
    apiClient<SubmitVerificationResponse>(`/api/properties/${propertyId}/verification/submit`, {
      method: "POST",
    }),

  /** Powers Profile's "My listing" — the currently logged-in user's own properties. */
  mine: (params: MyPropertiesParams) =>
    apiClient<MyPropertiesResponse>("/api/properties/my-properties", {
      method: "POST",
      body: params,
    }),
};
