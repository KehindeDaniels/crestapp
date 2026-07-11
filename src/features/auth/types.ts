import type { UserRole, UserStatus } from "@/config/constants";
import type { ID } from "@/types/api";

/** User shape returned by /api/auth/login, /api/auth/register, /api/user. */
export interface AuthUser {
  user_id: ID;
  email: string;
  phone_number: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_login_at: string | null;
  failed_login_attempts: number;
  account_locked_until: string | null;
}

/** POST /api/auth/login response. */
export interface LoginResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  message: string;
  user: AuthUser;
}

/**
 * POST /api/auth/register response.
 * NOTE: unlike login, register does NOT return an access_token — the user must
 * log in separately afterward. Confirmed against the Postman collection example.
 */
export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export type VerificationType = "email" | "phone";
