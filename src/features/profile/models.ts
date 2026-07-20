import type { ID } from "@/types/api";
import type { BankAccount, ProfileResponse } from "./types";

/** View model for the topbar user card + Home greeting — components never touch `ProfileResponse` directly. */
export interface ProfileViewModel {
  firstName: string;
  displayName: string;
  avatarUrl: string | null;
}

export function toProfileViewModel(response: ProfileResponse): ProfileViewModel {
  const { first_name, last_name, profile_picture_url } = response.data.profile;
  const displayName = [first_name, last_name].filter(Boolean).join(" ").trim();

  return {
    firstName: first_name || "there",
    displayName: displayName || response.data.user.email,
    avatarUrl: profile_picture_url,
  };
}

/** Richer view model for the `/profile` page itself — separate from `ProfileViewModel` above so that small shared shape doesn't balloon for every consumer. */
export interface FullProfileModel {
  userId: ID;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  bankAccount: BankAccount | null;
}

export function toFullProfileModel(response: ProfileResponse): FullProfileModel {
  const { user, profile } = response.data;
  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();

  return {
    userId: profile.user_id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    displayName: displayName || user.email,
    email: user.email,
    phoneNumber: user.phone_number,
    avatarUrl: profile.profile_picture_url,
    bankAccount: response.data.bank_account,
  };
}
