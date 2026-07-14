import type { UserRole, UserStatus } from "@/config/constants";
import type { ID } from "@/types/api";

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
    bank_account: unknown | null;
    trust_score: number | null;
    ratings_summary: { total_ratings: number; average_rating: number };
  };
}
