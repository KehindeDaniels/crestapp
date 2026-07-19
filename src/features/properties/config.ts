import { Home, Building2, Hotel, type LucideIcon } from "lucide-react";
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
 * Step 1's purpose selector — 3 large cards, not a segmented tab control
 * (confirmed against the real Figma pull, node 1422:6881 in file
 * `1jtfoprMGUFfoo3CBzhjMV`). Icons are `lucide-react` stand-ins for the
 * Figma pull's emoji illustrations (emojione:house,
 * emojione:house-with-garden, noto:house) — every other icon in this
 * codebase is lucide, so matching that convention here rather than
 * downloading and committing 3 one-off emoji PNGs. Airbnb is real UI (shown,
 * matches design) but not selectable — no `/api/properties/airbnb` endpoint
 * exists at all. See docs/design-vs-backend-gaps.md.
 */
export const LIST_PROPERTY_PURPOSE_CARDS: {
  /** "airbnb" isn't a real `PropertyPurpose` value — the card is disabled, so it's never actually submitted. */
  value: PropertyPurpose | "airbnb";
  label: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
}[] = [
  {
    value: "sale",
    label: "Property for Sale",
    description: "New houses or land available for purchase",
    icon: Home,
    enabled: true,
  },
  {
    value: "rent",
    label: "Property for Rent",
    description: "Long-term residential rentals",
    icon: Building2,
    enabled: true,
  },
  {
    value: "airbnb",
    label: "Airbnb / Short Stay",
    description: "Furnished homes for short-term stays",
    icon: Hotel,
    enabled: false,
  },
];

/**
 * Step 1's "Property Features" checklist — shown per the design, but fully
 * disabled/non-interactive: no backend field exists for any of these (see
 * docs/design-vs-backend-gaps.md). Rendered so a review pass can see what
 * the design specifies vs. what's actually wired up, per explicit
 * instruction, rather than hidden outright.
 */
export const APARTMENT_FEATURES = [
  "Running Water",
  "Electricity",
  "Parking Space",
  "Security",
  "Swimming Pool",
  "Balcony",
  "POP Ceiling",
  "Kitchen cabinets",
  "Gym",
];

export const LAND_FEATURES = [
  "Fenced",
  "Electricity Nearby",
  "Government Allocation",
  "Road Access",
  "Gated Fenced",
];

/**
 * Step 3's "Verify your documents" checklist. `documentType` maps each
 * labeled slot to the closest value in `documents/upload`'s real, confirmed
 * `document_type` enum (`agreement|contract|disclosure|certificate|report`)
 * — the backend only has these 5 generic buckets, not distinct categories
 * for property paperwork, so this mapping is an inferred approximation, not
 * a confirmed 1:1 match. Each slot still uploads for real via
 * `useUploadDocument`, with its own honest `title` — only the coarse
 * category bucket is approximate. See docs/design-vs-backend-gaps.md.
 */
export const DOCUMENT_SLOTS: { key: string; label: string; documentType: string }[] = [
  { key: "c_of_o", label: "Certificate of Occupancy (C of O)", documentType: "certificate" },
  { key: "deed_of_assignment", label: "Deed of Assignment", documentType: "contract" },
  { key: "survey_plan", label: "Survey Plan", documentType: "report" },
  { key: "purchase_receipt", label: "Purchase Receipt", documentType: "disclosure" },
  { key: "authorization_letter", label: "Authorization Letter", documentType: "agreement" },
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
