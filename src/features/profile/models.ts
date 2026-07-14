import type { ProfileResponse } from "./types";

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
