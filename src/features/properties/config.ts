import type { PropertyPurpose, PropertyType } from "@/config/constants";

/**
 * Home's search-panel tabs. Deliberately excludes "airbnb" — no matching
 * `purpose` value exists on the backend at all (see
 * docs/design-vs-backend-gaps.md, Phase 4). Data-driven on purpose so
 * re-adding it later (once the backend supports it) is a one-line addition,
 * not a restructure of the tab-rendering component.
 */
export const PROPERTY_PURPOSE_TABS: { value: PropertyPurpose; label: string }[] = [
  { value: "sale", label: "Buy" },
  { value: "rent", label: "Rent" },
];

/**
 * Client-defined preset buckets for the "Price Range" filter — the backend
 * only accepts raw min_price/max_price numbers, no presets exist server-side
 * (see docs/design/home-page-data-plan.md §7a). Values are a starting
 * proposal calibrated against real seeded data (₦200 to ₦100M+), adjust
 * freely — this is presentation logic, not a backend contract.
 */
export interface PriceRangeBucket {
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * List Property wizard's purpose selector — "Sale"/"Rent" (seller-facing
 * wording, distinct from Home's "Buy"/"Rent" buyer-facing tabs above).
 * Excludes "lease": the value exists on the read-side `PropertyPurpose`
 * enum, but there's no `/api/properties/lease` creation endpoint (confirmed
 * against the Postman collection) — see docs/design-vs-backend-gaps.md.
 */
export const LIST_PROPERTY_PURPOSES: { value: PropertyPurpose; label: string }[] = [
  { value: "sale", label: "Sale" },
  { value: "rent", label: "Rent" },
];

/**
 * List Property wizard's property-type options — scoped to the two types
 * with a real Figma design. "house"/"commercial"/"industrial" are real
 * backend enum values with no design yet; see docs/design-vs-backend-gaps.md.
 */
export const LIST_PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "land", label: "Land" },
];

export const PRICE_RANGE_BUCKETS: PriceRangeBucket[] = [
  { label: "Under ₦500k", maxPrice: 500_000 },
  { label: "₦500k – ₦1M", minPrice: 500_000, maxPrice: 1_000_000 },
  { label: "₦1M – ₦5M", minPrice: 1_000_000, maxPrice: 5_000_000 },
  { label: "₦5M – ₦20M", minPrice: 5_000_000, maxPrice: 20_000_000 },
  { label: "₦20M – ₦100M", minPrice: 20_000_000, maxPrice: 100_000_000 },
  { label: "₦100M+", minPrice: 100_000_000 },
];
