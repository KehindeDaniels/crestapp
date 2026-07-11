import { apiClient } from "@/lib/api/client";
import type { FileUploadResponse, KycSubmitPayload, KycSubmitResponse } from "./types";

/**
 * Extracts the uploaded file's URL from an undocumented response shape (the
 * Postman collection has no example for POST /api/platform/files/upload).
 * Throws loudly instead of guessing wrong silently — update this in one place
 * once the real shape is confirmed.
 */
function parseUploadUrl(response: FileUploadResponse): string {
  const url =
    response.url ?? response.file_url ?? response.path ??
    response.data?.url ?? response.data?.file_url ?? response.data?.path;

  if (!url) {
    throw new Error(
      "Unexpected upload response shape from /api/platform/files/upload — " +
        "expected one of url/file_url/path (optionally nested under `data`). " +
        "Got: " + JSON.stringify(response),
    );
  }
  return url;
}

export const kycApi = {
  /** Uploads a single file and returns its resolved URL. `purpose` mirrors the Postman example's "property_document" convention. */
  async uploadFile(file: File, purpose: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", purpose);
    const response = await apiClient<FileUploadResponse>("/api/platform/files/upload", {
      method: "POST",
      body: formData,
    });
    return parseUploadUrl(response);
  },

  submit: (payload: KycSubmitPayload) =>
    apiClient<KycSubmitResponse>("/api/kyc/submit", {
      method: "POST",
      body: payload,
    }),
};
