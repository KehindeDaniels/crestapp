# Plan: Search Property + Listing Detail — Component/API Dependency Map

> Analysis only, same discipline as `docs/design/home-page-data-plan.md` — no implementation until this is agreed. Sources: Figma `aDI3HOS6NVQWnLdIx5Zvif` nodes `1417-5224`, `1432-1491`, `1432-2263`, `1432-3874`, `1438-5668`, `1451-1555`, screenshots in `docs/design/screenshots/search/`, and the Postman collection.

## Scope correction
The 6 links/screenshots provided cover **two distinct screens**, not one:
1. **Search Property** — results grid (Buy/Rent/Airbnb tabs, filters, pagination), screenshots `Search Property.png`/`-1`/`-2`.
2. **Listing Detail** — single property view + a "Property Details" photo-gallery modal (categorized by room), screenshots `-3`/`-4`/`-5`.

## 1. Search Property — mostly a direct extension of Home
Nearly everything needed already exists from Phase 4:
- `usePropertySearch()`, `PropertyCardModel`/`toPropertyCardModel()`, `FilterDropdown`, `PropertyFeatureFilter`, `PRICE_RANGE_BUCKETS`, `PROPERTY_PURPOSE_TABS` — all directly reusable, no new endpoint.
- **New here, not on Home**: real pagination (Figma shows numbered pages: `1 2 3 4 5 6 7 … 18`, prev/next arrows) driven by `properties/search`'s existing `page`/`per_page` params and `pagination.last_page` in the response — `usePropertySearch` already returns view models only, not the pagination metadata, so it needs a small extension (return `{properties, pagination}` instead of just the array) — the one real code change needed in existing hooks.
- **New**: URL-synced filter/page state (so a shared search URL reproduces the same results) — Home's filter state is local `useState`; this page should read/write query params instead.
- Card grid is a real 3-column grid here (`Lists by search (274 results)`), not Home's horizontal-scroll row — same `PropertyCard`, different container.
- "Upload New Article" button (top right) → same "List Property" destination as Home's banner, already a disabled nav item.
- "Reset Filter" button — new, just clears local/URL filter state back to defaults.

**Gap, consistent with Home**: still only Buy/Rent tabs render — Airbnb has no backend `purpose` value, same as Home (§7 of the Home plan). "Property Feature" filter stays the same disabled/"Coming Soon" treatment.

## 2. Listing Detail — new screen, new data needs

| Component | Endpoint | Confirmed? |
|---|---|---|
| Property data (title, price, address, beds/baths/sqm, description, images) | `POST /api/properties/search` with `{id: propertyId}` — the schema already documents `id` as a valid filter (`nullable\|integer\|exists:properties,property_id`) | ✅ Reuses the exact endpoint/shape already confirmed live for Home — no new endpoint. `toPropertyCardModel` needs extending with a `description` field (present in the raw `ApiProperty` shape already, just not mapped yet) |
| Photo gallery, categorized by room (Kitchen/Living Room/Bedroom/Others) | Same response's `media[]` array | ✅ **Confirmed live** — the real `media` objects we already pulled for Home have a `caption` field with literal values `"Living Room"`, `"Bedroom"`, `"Kitchen"`, `"Other"` (seen directly in the property_id 25 example). The gallery's category tabs group by `caption`, no new field needed |
| "Seller Verification" checklist (Property Verified / Landlord Identity Verified / Documents Reviewed) | `GET /api/properties/{id}/verification/status` | ❌ Endpoint exists but **zero documented example response** — can't confirm these 3 checklist items map to real fields, or if there even are 3 distinct booleans vs. some other status shape |
| "Property Features" (Bedroom, Bathrooms, Family TV room, Electricity, Security, Covered Parking — each with a count) | None | ❌ Same gap as Home's "Property Feature" filter — bedrooms/bathrooms map to real fields, but Family TV room/Electricity/Security/Covered Parking have **no backend field at all** in the confirmed property schema |
| "Listing Number" (`L67885`) in Property Details grid | None | ❌ No such field in the confirmed property object (`property_id` is a plain integer, not this format) — appears to be **design-only**. Also appears twice in the Figma grid itself (once under "Listing Number", once under what should probably be "Floor Size" or similar) — likely a placeholder/copy-paste artifact in the mockup, not something to replicate literally |
| "Make Offer" button | `POST /api/contracts/quick-create`, body `{property_id}` | ✅ **Confirmed live with a full example response** — but behaves very differently than the label suggests: it doesn't create a negotiable offer for the seller to review. It **immediately creates and auto-accepts a contract** (`status: "accepted"`) and generates a payment link in the same call. This needs explicit sign-off before wiring — a "Make Offer" button that actually commits to a binding, payable contract on click is a real product decision, not just a UI label |
| "Message Landlord"/"Message Owner" button | `POST /api/communication/messages/send`, body `{recipient_id, content, message_type: "text", reference_id: propertyId, reference_type: "property"}` | ✅ Real endpoint, `reference_type: "property"` explicitly documented — but no example response, and no messaging inbox/thread UI exists yet to send the user to afterward |
| "Save" (heart icon, top right + per-card) | None | ❌ Same confirmed-absent favorites gap as Home |
| Map + "View Map"/"Directions" | None dedicated | Can be built without a custom endpoint — `location_address`/`city`/`state` are already real fields; "Directions" can just deep-link to Google/Apple Maps with the address as a query string. No live map rendering (no maps API key/integration exists in this project) |

## 3. Recommended approach
1. **Search Property first** — small, mostly-mechanical extension of what's already built (pagination + URL state + grid layout). Low risk, high continuity.
2. **Listing Detail second** — the property/media portion is fully buildable now (same confirmed endpoint). The seller-verification checklist, property-features-with-counts, and "Listing Number" are all gaps needing your call (mirror Home's pattern: hide, or show disabled/"Coming Soon"). "Make Offer" and "Message Owner" are real, working endpoints — but "Make Offer"'s actual behavior (instant binding contract + payment link, not a negotiable offer) needs explicit sign-off given how consequential that click is.

## 4. Decisions needed before implementation
1. **"Make Offer" button** — given it immediately creates an accepted contract + payment link (not a negotiable offer): build it as-is with a confirmation step first (e.g. a "You're about to commit to purchase at ₦X — continue?" dialog), or hold off entirely until there's a real payment/checkout flow to send the user to afterward?
2. **"Message Owner"/"Message Landlord"** — build the send-message call even though no inbox/thread UI exists yet to view the conversation afterward, or hold until a minimal Messages screen exists?
3. **Seller Verification checklist & Property Features counts** — same hide vs. disabled/"Coming Soon" choice as Home's Property Feature filter, given neither has confirmed backend support.
4. **"Listing Number"** — drop it from the detail page (no backend equivalent), or keep it as a cosmetic/fabricated value?

Nothing built yet — waiting on your read of the gaps above and the decisions in §4.
