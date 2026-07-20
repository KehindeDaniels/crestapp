import type { UserRole, UserStatus } from "@/config/constants";
import type { ID } from "@/types/api";

/**
 * Shape inferred from `PUT /api/profile`'s own documented request fields
 * (`bank_name`/`account_number`/`account_name`) — the GET side's
 * `bank_account` was seen live as a real key but never explored further
 * (previously left `unknown`). Field names kept identical to the PUT
 * payload since Laravel resources conventionally echo back what they
 * accept; not independently confirmed on the GET side.
 */
export interface BankAccount {
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
}

/**
 * GET /api/profile response. Confirmed live 2026-07-14 against a real
 * account (see docs/design/home-page-data-plan.md §2a) — matches the
 * PUT /api/profile update payload's inferred fields exactly.
 */
export interface ProfileResponse {
  success: boolean;
  data: {
    user: {
      email: string;
      phone_number: string;
      role: UserRole;
      status: UserStatus;
      created_at: string;
      last_login_at: string | null;
    };
    profile: {
      profile_id: ID;
      user_id: ID;
      first_name: string;
      last_name: string;
      date_of_birth: string | null;
      profile_picture_url: string | null;
      bio: string | null;
      address: string | null;
      city: string | null;
      state: string | null;
      country: string | null;
      created_at: string;
      updated_at: string;
    };
    bank_account: BankAccount | null;
    trust_score: number | null;
    ratings_summary: { total_ratings: number; average_rating: number };
  };
}

/**
 * `PUT /api/profile` request body — confirmed real field names via the
 * Postman collection's own validation-rule comments (`sometimes|string|...`
 * for each). No saved example response for this endpoint at all (unlike the
 * GET side), so `UpdateProfileResponse` below is typed loosely.
 *
 * `phone_number` is a small inconsistency in that same source: it's absent
 * from the validation-rule comment list but present as a real key in the
 * example request JSON right above those comments. Included here since the
 * literal example body is stronger evidence than a comment that may just be
 * stale — worth confirming with the backend if updating phone silently
 * no-ops.
 */
export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  profile_picture_url?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
}

/** `POST /api/auth/password/change` — confirmed real request/response. */
export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ChangePasswordResponse {
  message: string;
}
