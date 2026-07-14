import { apiClient } from "@/lib/api/client";
import { KYC_STATUSES, type KycStatus } from "@/config/constants";
import { env } from "@/config/env";
import { getToken } from "@/lib/auth/token";
import type { ID } from "@/types/api";
import type {
  FileUploadResponse,
  KycFindSingleResponse,
  KycSubmitPayload,
  KycSubmitResponse,
} from "./types";

/**
 * Extracts the uploaded file's URL from an undocumented response shape (the
 * Postman collection has no example for POST /api/platform/files/upload).
 * Throws loudly instead of guessing wrong silently — update this in one place
 * once the real shape is confirmed.
 */
function parseUploadUrl(response: FileUploadResponse): string {
  const url =
    response.url ??
    response.file_url ??
    response.path ??
    response.data?.url ??
    response.data?.file_url ??
    response.data?.path;

  if (!url) {
    throw new Error(
      "Unexpected upload response shape from /api/platform/files/upload — " +
        "expected one of url/file_url/path (optionally nested under `data`). " +
        "Got: " +
        JSON.stringify(response),
    );
  }
  return url;
}

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
  /** Uploads a single file and returns its resolved URL. `purpose` mirrors the Postman example's "property_document" convention. */
  async uploadFile(file: File, purpose: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", purpose);
    try {
      const response = await apiClient<FileUploadResponse>(
        "/api/platform/files/upload",
        { method: "POST", body: formData },
      );
      return parseUploadUrl(response);
    } catch (err) {
      // If the normal client path failed, attempt a raw fetch to capture the
      // server's actual response body for debugging (useful when the server
      // returns non-JSON or an unexpected shape). This runs only in the
      // browser and is intended as a narrow diagnostic aid.
      try {
        const base = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
        const url = `${base}/api/platform/files/upload`;
        const token = getToken();
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const rawRes = await fetch(url, {
          method: "POST",
          body: formData,
          headers,
        });
        const text = await rawRes.text();
        // Surface a clearer error message including status and body.
        throw new Error(
          `Upload failed (status ${rawRes.status}). Server response: ${text}`,
        );
      } catch (inner) {
        // If the diagnostic fetch also fails, rethrow the original error.
        throw err;
      }
    }
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
