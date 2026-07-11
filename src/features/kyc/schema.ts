import { z } from "zod";
import { KYC_DOCUMENT_TYPES } from "./types";

/**
 * `document_number` has no corresponding field in the provided Figma KYC
 * screens, but POST /api/kyc/submit requires it. Added here as a real form
 * field (not a default) since — unlike `role` in registration — this is data
 * only the user can provide, not something safe to default.
 */
export const idDocumentSchema = z.object({
  document_type: z.enum(KYC_DOCUMENT_TYPES),
  document_number: z.string().trim().min(1, { error: "Document number is required" }),
  front_file: z.instanceof(File, { error: "Upload the front of your ID" }),
  back_file: z.instanceof(File, { error: "Upload the back of your ID" }),
});
export type IdDocumentInput = z.infer<typeof idDocumentSchema>;

export const selfieSchema = z.object({
  selfie_file: z.instanceof(File, { error: "Take or upload a selfie" }),
});
export type SelfieInput = z.infer<typeof selfieSchema>;
