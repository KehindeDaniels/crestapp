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

/**
 * POST /api/kyc/submit payload. `requester_id` is NOT in the Postman
 * collection's documented example at all — confirmed live via a 422
 * ("The requester id field is required"). Mirrors the same field on
 * kyc/find-single, where it means "the authenticated user's own user_id"
 * for self-submission. See docs/design-vs-backend-gaps.md (Phase 2.5).
 */
export interface KycSubmitPayload {
  requester_id: ID;
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
 * Legal document classification required by POST /api/documents/upload.
 * NONE of these map cleanly to "government ID photo" or "selfie" — the
 * backend dev redirected KYC uploads here after confirming
 * /api/platform/files/upload doesn't work (returns 200 with an empty body).
 * "certificate" is used as the least-bad fit. Confirmed enum via the Postman
 * field description: required|in:agreement,contract,disclosure,certificate,report
 */
export const LEGAL_DOCUMENT_TYPES = [
  "agreement",
  "contract",
  "disclosure",
  "certificate",
  "report",
] as const;
export type LegalDocumentType = (typeof LEGAL_DOCUMENT_TYPES)[number];

/**
 * POST /api/documents/upload response — CONFIRMED via a real Postman example
 * (201 Created, real JSON body — unlike the old files/upload endpoint, which
 * returned nothing). Note: this response has NO url field at all, only
 * document_id/document_uuid. The separate GET /api/documents/{id} response
 * does have a `download_url` field, but it was `null` in the one example
 * available. Marked optional/nullable here — `parseDocumentUrl` in api.ts
 * throws loudly if it's missing, since kyc/submit needs a real URL.
 * See docs/design-vs-backend-gaps.md (Phase 2.5).
 */
export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data: {
    document_id: number;
    document_uuid: string;
    document_type: string;
    title: string;
    status: string;
    uploaded_at: string | null;
    file_size: string;
    download_url?: string | null;
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
