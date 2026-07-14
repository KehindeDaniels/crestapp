import { apiClient } from "@/lib/api/client";
import { KYC_STATUSES, type KycStatus } from "@/config/constants";
import type { ID } from "@/types/api";
import type {
  DocumentUploadResponse,
  KycFindSingleResponse,
  KycSubmitPayload,
  KycSubmitResponse,
} from "./types";

/**
 * Extracts the uploaded document's download URL. CONFIRMED risk: the Upload
 * Document Postman example has no download_url at all, and the separate Get
 * Document example shows it as `null`. Throws loudly if missing — kyc/submit
 * requires real URLs, so silently passing an empty value would corrupt a KYC
 * submission. See docs/design-vs-backend-gaps.md (Phase 2.5).
 */
function parseDocumentUrl(response: DocumentUploadResponse): string {
  const url = response.data?.download_url;
  if (!url) {
    throw new Error(
      "POST /api/documents/upload did not return a usable download_url " +
        "(confirmed absent/null in the one documented Postman example). " +
        `document_id=${response.data?.document_id}, document_uuid=${response.data?.document_uuid} — ` +
        "may need a follow-up call (e.g. GET /api/documents/{id}) or a backend " +
        "fix to actually populate this field.",
    );
  }
  return url;
}

/** Humanized title per upload purpose — shown to whoever reviews these documents later. */
const PURPOSE_TITLES: Record<string, string> = {
  kyc_document_front: "KYC Document - Front",
  kyc_document_back: "KYC Document - Back",
  kyc_selfie: "KYC Selfie",
};

/**
 * Extracts a KYC status from the (undocumented, likely absent) `kyc` field of
 * a find-single response. Unlike `parseUploadUrl` above, this NEVER throws —
 * this is a read on a non-critical reminder banner, not a write. Any
 * unparseable/missing shape safely falls back to `null`, which callers treat
 * as "not approved yet" (show the reminder). Showing an unnecessary reminder
 * is much lower-risk than hiding a genuinely needed one.
 *
 * Returns `null`, NOT `undefined` — TanStack Query forbids a queryFn from
 * resolving with `undefined` (throws "Query data cannot be undefined",
 * confirmed live via console error on ["kyc","mine"]). `null` is valid data.
 */
export function parseKycStatus(
  response: KycFindSingleResponse,
): KycStatus | null {
  const status =
    response.kyc?.kyc_status ??
    response.kyc?.status ??
    response.data?.kyc?.kyc_status ??
    response.data?.kyc?.status ??
    response.kyc_status;

  return (KYC_STATUSES as readonly string[]).includes(status ?? "")
    ? (status as KycStatus)
    : null;
}

export const kycApi = {
  /**
   * Uploads a file via the Legal Documents system and returns its download
   * URL. Switched from POST /api/platform/files/upload (confirmed dead by
   * the backend dev: returns 200 with a completely empty body, Content-Type
   * text/html — see docs/design-vs-backend-gaps.md, Phase 2.5) to
   * POST /api/documents/upload on the project owner's direction.
   *
   * `document_type: "certificate"` is a deliberate, flagged inference — the
   * required enum (agreement/contract/disclosure/certificate/report) has no
   * value that cleanly means "government ID" or "selfie". Confirm with the
   * backend/product owner if a better fit exists before this ships.
   */
  async uploadFile(file: File, purpose: string): Promise<string> {
    const formData = new FormData();
    formData.append("document_file", file);
    formData.append("title", PURPOSE_TITLES[purpose] ?? purpose);
    formData.append("document_type", "certificate");
    formData.append(
      "description",
      "Identity verification document uploaded during KYC.",
    );
    const response = await apiClient<DocumentUploadResponse>(
      "/api/documents/upload",
      { method: "POST", body: formData },
    );
    return parseDocumentUrl(response);
  },

  submit: (payload: KycSubmitPayload) =>
    apiClient<KycSubmitResponse>("/api/kyc/submit", {
      method: "POST",
      body: payload,
    }),

  /**
   * Self-lookup (requester_id === user_id). NOT CONFIRMED whether a non-admin
   * user is actually authorized to call this about themselves — the Postman
   * collection files it under "KYC Management" with no explicit access-level
   * note. May 403 in practice. See docs/design-vs-backend-gaps.md (Phase 2.5).
   *
   * `include_kyc` is sent as a real boolean, NOT the string "true" shown in
   * the Postman example — Laravel's `boolean` validation rule rejects that
   * literal string (confirmed live: 422 "must be true or false").
   */
  findSingle: (params: { requester_id: ID; user_id: ID }) =>
    apiClient<KycFindSingleResponse>("/api/kyc/find-single", {
      method: "POST",
      body: {
        requester_id: params.requester_id,
        user_id: params.user_id,
        include_kyc: true,
      },
    }),
};
