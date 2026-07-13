import type { KycStatus, UserStatus } from "@/config/constants";
import type { ID } from "@/types/api";

/**
 * KYC document type. Only "national_id" is confirmed by the Postman collection
 * example — "drivers_license"/"international_passport" are inferred from the
 * Figma ID-type tabs (National ID card / Driver License / International
 * Passport) but NOT confirmed against a documented backend enum. Verify with
 * the backend before relying on these two.
 */
export const KYC_DOCUMENT_TYPES = [
  "national_id",
  "drivers_license",
  "international_passport",
] as const;
export type KycDocumentType = (typeof KYC_DOCUMENT_TYPES)[number];

/** POST /api/kyc/submit payload — confirmed against the Postman example. */
export interface KycSubmitPayload {
  document_type: KycDocumentType;
  document_number: string;
  document_front_url: string;
  document_back_url: string;
  selfie_url: string;
}

/** No example response is documented for /api/kyc/submit — only `message` is assumed safe. */
export interface KycSubmitResponse {
  message: string;
}

/**
 * POST /api/platform/files/upload response — UNDOCUMENTED in the Postman
 * collection (empty `response: []`). Shape is a best-effort guess covering
 * common Laravel upload-response conventions; `parseUploadUrl` in api.ts
 * throws loudly if none of these fields are present, rather than silently
 * returning an invalid URL.
 */
export interface FileUploadResponse {
  url?: string;
  file_url?: string;
  path?: string;
  data?: {
    url?: string;
    file_url?: string;
    path?: string;
  };
}

/**
 * POST /api/kyc/find-single response (self-lookup: requester_id === user_id).
 * CONFIRMED via the Postman collection's own documented example (even with
 * include_kyc: "true" set): the response only ever contains `user` + `profile`
 * — there is NO `kyc` field anywhere in the one example given. This is very
 * likely a backend gap, not something fixable client-side. We defensively
 * probe a few plausible shapes for a future/undocumented `kyc` field and
 * treat anything we can't confidently parse as "unknown" (see parseKycStatus
 * in api.ts). See docs/design-vs-backend-gaps.md (Phase 2.5).
 */
export interface KycFindSingleResponse {
  user?: { user_id: ID; status?: UserStatus };
  profile?: { profile_id: ID; user_id: ID };
  kyc?: { kyc_status?: KycStatus; status?: KycStatus } | null;
  data?: { kyc?: { kyc_status?: KycStatus; status?: KycStatus } | null };
  kyc_status?: KycStatus;
}
