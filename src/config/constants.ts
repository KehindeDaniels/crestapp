/** Domain constants mirrored from the Laravel backend (Postman collection). */

export const USER_ROLES = [
  "landlord",
  "tenant",
  "seller",
  "buyer",
  "lawyer",
  "surveyor",
  // Shortlet-specific roles — added to the backend's register enum in the
  // 2026-07-27 ("final") Postman collection. A shortlet host is now its OWN
  // role (`shortlet_owner`), NOT lumped under `landlord`; a shortlet guest is
  // `shortlet_user`. See HANDOVER.md §5.7 and docs/design-vs-backend-gaps.md.
  "shortlet_owner",
  "shortlet_user",
  "admin",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["pending", "active", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const KYC_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "under_review",
] as const;
export type KycStatus = (typeof KYC_STATUSES)[number];

export const PROPERTY_TYPES = [
  "apartment",
  "house",
  "land",
  "commercial",
  "industrial",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_PURPOSES = ["rent", "sale", "lease"] as const;
export type PropertyPurpose = (typeof PROPERTY_PURPOSES)[number];

export const PROPERTY_STATUSES = [
  "draft",
  "pending_approval",
  "active",
  "rented",
  "sold",
  "inactive",
  "suspended",
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const VERIFICATION_STATUSES = [
  "unverified",
  "pending",
  "verified",
  "rejected",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/** Cookie names used for the client-stored session (see lib/auth). */
export const AUTH_COOKIE = "crest_token";
export const ROLE_COOKIE = "crest_role";
export const STATUS_COOKIE = "crest_status";
