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
