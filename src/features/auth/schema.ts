import { z } from "zod";
import { USER_ROLES } from "@/config/constants";

/** Shared primitives, mirroring backend validation rules from the Postman collection. */
const emailField = z.email({ error: "Enter a valid email address" });
const phoneField = z
  .string()
  .min(8, { error: "Enter a valid phone number" })
  .regex(/^\+?[0-9\s-]{8,20}$/, { error: "Enter a valid phone number" });
const otpField = z
  .string()
  .length(6, { error: "Enter the 6-digit code" })
  .regex(/^\d{6}$/, { error: "Code must be 6 digits" });

export const passwordSchema = z
  .string()
  .min(6, { error: "At least 6 characters" })
  .regex(/[A-Z]/, { error: "At least 1 uppercase letter" })
  .regex(/[0-9]/, { error: "At least 1 number" })
  .regex(/[^a-zA-Z0-9]/, { error: "At least 1 symbol" });

// ---- Login ----------------------------------------------------------------
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, { error: "Password is required" }),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---- Registration wizard (per-step schemas) --------------------------------
export const registerPersonalInfoSchema = z.object({
  first_name: z.string().trim().min(1, { error: "First name is required" }),
  last_name: z.string().trim().min(1, { error: "Last name is required" }),
  email: emailField,
});
export type RegisterPersonalInfoInput = z.infer<
  typeof registerPersonalInfoSchema
>;

export const otpSchema = z.object({ code: otpField });
export type OtpInput = z.infer<typeof otpSchema>;

export const registerPhoneSchema = z.object({ phone_number: phoneField });
export type RegisterPhoneInput = z.infer<typeof registerPhoneSchema>;

export const registerPasswordSchema = z
  .object({
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    error: "Passwords do not match",
    path: ["password_confirmation"],
  });
export type RegisterPasswordInput = z.infer<typeof registerPasswordSchema>;

/**
 * Full payload sent to POST /api/auth/register. `role` has no corresponding
 * screen in the provided Figma flow — defaulted to "tenant".
 * TODO(product): confirm how/where the user picks their role (tenant, landlord,
 * seller, buyer, lawyer, surveyor) — no role-selection screen exists in the
 * Account Creation frames handed over so far.
 */
export const registerPayloadSchema = registerPersonalInfoSchema
  .extend(registerPhoneSchema.shape)
  .extend({
    password: passwordSchema,
    password_confirmation: z.string(),
    role: z.enum(USER_ROLES),
  });
export type RegisterPayload = z.infer<typeof registerPayloadSchema>;

// ---- Password reset ---------------------------------------------------------
export const forgotPasswordSchema = z.object({ email: emailField });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: emailField,
    code: otpField,
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    error: "Passwords do not match",
    path: ["password_confirmation"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
