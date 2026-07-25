# Plan: Shortlet — Implementation Blueprint

> Analysis only until agreed, same discipline as `docs/design/search-and-listing-detail-plan.md`. Sources: `Shortlet_Frontend_UI_UX_BRD.md` (product-level requirements), `latest-Crest App Laravel API Collection.postman_collection .json` (the 15 endpoints new since the collection we've built everything else against — every one of them has a full real saved example, unusually well-documented for this backend). No code written yet for this feature.

## 0. What's new, in one paragraph

A third property `purpose` (`sale`, `rent`, now **`shortlet`**) with its own booking system: an owner creates a listing with one or more bookable **rooms**, a guest searches by city/dates/guests, gets a **quote**, creates a **booking** (a time-limited hold), pays via Flutterwave, and the booking auto-confirms — no checkout step, the stay just ends when the nights are up. A shortlet listing is still a real `property` record under the hood (`property_id` is returned from creation), so it can reuse the existing property-photo-upload endpoint. Alongside this, a genuinely separate, general-purpose endpoint appeared: `PUT /api/profile/role`, a self-service role switch — filed under User Profile, not Shortlets, and relevant beyond this feature (see the role-consolidation discussion this doc doesn't repeat).

## 1. Confirmed backend reference

All 15 endpoints below have a full real saved example (request **and** response) in the Postman collection — cite this table instead of re-deriving shapes from scratch.

| # | Method | Path | Purpose | Key confirmed response fields |
|---|---|---|---|---|
| 1 | `PUT` | `/api/profile/role` | Switch role | Request only: `{role: "landlord"}`. **No saved response** — shape unconfirmed. |
| 2 | `POST` | `/api/shortlets` | Create listing (+ rooms) | `listing_id`, `property_id`, `status: "draft"`, `rooms[]` (each with `room_id`), embedded `property.purpose: "shortlet"` |
| 3 | `GET` | `/api/shortlets` | List my shortlets (owner) | Array of `{listing_id, base_nightly_rate, status, property{title,city,status}, rooms[]}` |
| 4 | `PUT` | `/api/shortlets/{listing_id}` | Activate / update listing | Same shape as create; `status: "active"` after activation |
| 5 | `PUT` | `/api/shortlets/{listing_id}/rooms/{room_id}/availability` | Block/open a date range, optional price override | `{updated: n, skipped: n}` |
| 6 | `GET` | `/api/shortlets/{listing_id}/rooms/{room_id}/calendar?from&to` | Per-night status for a room | `nights[]`: each `{date, status: available\|blocked\|held\|booked, price_override}` |
| 7 | `POST` | `/api/shortlets/search` | Guest search | `{listings[], count, nights, ends_at_hint}` — filters: `check_in_date`, `nights`, `city`, `state`, `guests`, `min_price`, `max_price` |
| 8 | `GET` | `/api/shortlets/browse/{listing_id}` | Listing detail (public) | Full listing incl. `rooms[]`, `cleaning_fee`, `service_fee_bps`, `instant_book` |
| 9 | `GET` | `/api/shortlets/browse/{listing_id}/availability?check_in_date&nights` | Which rooms are free for these dates | `rooms[]`: each `{room_id, effective_nightly_rate, available: bool}` |
| 10 | `POST` | `/api/shortlets/quote` | Price a stay before booking | `{subtotal, cleaning_fee, service_fee, total_amount, check_in_at, ends_at, rooms[].nightly_breakdown[]}` — body takes `room_ids` as an **array** |
| 11 | `POST` | `/api/shortlets/bookings` | Create booking (a hold) | `booking_id`, `booking_uuid`, `status: "pending_payment"`, `expires_at`, `total_amount`, `fees`, `subtotal` |
| 12 | `POST` | `/api/shortlets/bookings/{booking_id}/pay` | Get payment link | `payment_url` (real `checkout.flutterwave.com` shape, same as Offers), `gateway: "flutterwave"`, `gateway_reference`, `transaction_id` |
| 13 | `GET` | `/api/shortlets/bookings/mine` | Guest's own bookings | Array of `{booking_id, status, total_amount, check_in_at, ends_at, listing{listing_id, property{title,city}}}` |
| 14 | `POST` | `/api/shortlets/bookings/{booking_id}/cancel` | Cancel a booking | `{status: "cancelled", cancelled_at, cancellation_reason}` |
| 15 | `GET` | `/api/admin/shortlets/bookings` | **Admin-only** list of all bookings | Paginated, includes `owner{}` and `guest{}` per row |

**Confirmed statuses** (all observed directly, not inferred): `draft`, `active` (listing); `pending_payment`, `confirmed`, `cancelled` (booking); `available`, `blocked`, `held`, `booked` (per-night calendar).

## 2. Gaps vs. the BRD — resolve before/while building, don't silently assume

1. **No owner-facing bookings endpoint.** BRD §4 plans an "Owner bookings" screen. The only booking-list endpoints are the guest's own (`/bookings/mine`) and the admin-only one (`/admin/shortlets/bookings`). **Cannot build this screen for real yet.** Either wait for a real `GET /api/shortlets/bookings/owner`-style endpoint, or explicitly ask the backend to add one — don't fake it by calling the admin endpoint from a non-admin account (it will 403, or worse, silently expose admin-only data if it doesn't).
2. **Role naming is a product relabeling, not a new role enum.** BRD calls them "Shortlet owner"/"Shortlet user"; the actual `Switch Role` example switches to `"landlord"`, and `Register User`'s role enum is unchanged (`landlord/tenant/seller/buyer/lawyer/surveyor` — no shortlet-specific value). **Confirm explicitly which existing role(s) the backend checks before allowing `POST /api/shortlets`** (landlord only? seller too? any authenticated user?) before building the switch-role UI copy/logic around an assumed mapping.
3. **Only Flutterwave is real.** BRD §4 says "Flutterwave/Paystack"; `Pay Booking`'s only confirmed example uses `gateway: "flutterwave"`. Same pattern as Make an Offer — build a single real "Pay" action, not a gateway picker, unless a second gateway shows up in a future confirmed example.

## 3. Architecture — mirror `src/features/offers/`, don't invent a new pattern

This feature is structurally very close to Offers (create something → get a payment link → redirect → poll for status), so reuse that pattern directly rather than redesigning it:

- **New `src/features/shortlets/`**: `types.ts` (verbatim field names from §1's table), `api.ts`, `models.ts` (view-model mappers — components never touch raw response shapes, same rule as every other feature this session), `hooks.ts`, `index.ts`.
- **Query keys**: add a `shortlets` namespace to `src/lib/api/query-keys.ts` — `list(params)`, `detail(listingId)`, `myBookings(params)`, `calendar(listingId, roomId, params)` — following the existing `properties`/`contracts` factory-function convention.
- **Payment flow**: reuse the exact `useOffer`/`useContractDetail` split already built for Offers — one cache-only hook for the one-time `payment_url` (seeded right after `Create Booking` + `Pay Booking` succeed, since the URL isn't guaranteed re-fetchable), one real polling hook for booking status via... **there is no confirmed single-booking `GET` endpoint in this list** (only the list ones). Flag this as a 4th gap if a "get one booking" endpoint doesn't turn up — without it, status tracking after payment has to re-poll `/bookings/mine` and find the row by `booking_id`, which is workable but worth confirming isn't just an oversight in what was captured.
- **Photo upload**: reuse `propertiesApi.uploadMedia(propertyId, formData)` as-is — a shortlet listing's `property_id` from the create response is a normal property ID.

## 4. Screens to build

### Guest

| Screen | Route (suggested) | Backing endpoint(s) | Status |
|---|---|---|---|
| Search | `/shortlets` | `POST /shortlets/search` | ✅ buildable now |
| Listing detail + availability | `/shortlets/[listingId]` | `GET /shortlets/browse/{id}`, `GET /shortlets/browse/{id}/availability` | ✅ buildable now |
| Quote / review | same page, a step/panel | `POST /shortlets/quote` | ✅ buildable now |
| Booking + pay | `/shortlets/bookings/[bookingId]` | `POST /shortlets/bookings`, `POST /shortlets/bookings/{id}/pay` | ✅ buildable now — reuse Offers' pay-redirect pattern |
| My bookings | `/shortlets/bookings` (mine) | `GET /shortlets/bookings/mine` | ✅ buildable now |
| Cancel | dialog on booking detail | `POST /shortlets/bookings/{id}/cancel` | ✅ buildable now |

### Owner

| Screen | Route (suggested) | Backing endpoint(s) | Status |
|---|---|---|---|
| Owner's listings | `/shortlets/manage` | `GET /shortlets` | ✅ buildable now |
| Create / edit listing + rooms | `/shortlets/manage/new`, `/shortlets/manage/[listingId]/edit` | `POST /shortlets`, `PUT /shortlets/{id}`, existing property media upload | ✅ buildable now |
| Room calendar (block/open/price override) | `/shortlets/manage/[listingId]/rooms/[roomId]` | `GET .../calendar`, `PUT .../availability` | ✅ buildable now |
| Owner bookings | `/shortlets/manage/bookings` | **none confirmed** | ❌ blocked — Gap 1 |

### Shared

| Screen | Notes |
|---|---|
| Role switch | In Profile, next to the existing Edit/Payment-Method/Notifications dialogs already built — same dialog pattern, new endpoint. Needs Gap 2 resolved for correct copy/logic. |
| Empty states | No listings / no search results / no bookings — same "build the honest empty state" convention as every other feature. |
| Errors | Hold expired, room taken, payment failed — `ApiError.message`/`code` surfacing, same as the KYC-not-verified / INVALID_TRANSACTION_STATE handling already built for Offers. |

## 5. Recommended rollout order

1. **Role switch** (Profile) — small, standalone, unblocks manual testing of everything else (a tester needs to actually be "owner" to test listing creation).
2. **Guest search → detail → quote** — no payment risk, pure read/compute, good way to shake out the `shortlets` feature module's plumbing first.
3. **Owner create/edit listing + rooms + calendar** — needed before there's anything real to search for/book against in manual testing.
4. **Guest booking → pay → status** — reuses the Offers pattern; do this once Offers' pattern is fresh/proven (it already is).
5. **My bookings + cancel** (guest) — straightforward once booking detail exists.
6. **Owner bookings** — deferred until Gap 1 is resolved.

## 6. Open questions to raise with backend (send these before/alongside starting, don't block on them)

1. Does `POST /api/shortlets` require role `landlord` specifically, `seller` too, or any authenticated account? (Gap 2)
2. Is there (or can there be) an owner-facing bookings-list endpoint, e.g. `GET /api/shortlets/bookings/owner` or `?owner_id=me` on the admin one? (Gap 1)
3. Is there a single-booking `GET /api/shortlets/bookings/{id}`? Not seen in the 15 new endpoints — needed for clean post-payment status polling (§3).
4. Confirm `Switch Role`'s response shape (currently zero saved examples) — does it return the updated user object, just a message, or something else?

## 7. Verification checklist (once built)

- `pnpm typecheck`, `pnpm lint`, `pnpm build` clean, same as every phase this session.
- Confirm the reused property-media-upload flow actually works end-to-end for a shortlet's `property_id` (not assumed just because the field is named the same).
- Confirm the pay-redirect-and-poll flow correctly detects a `confirmed` booking after a real Flutterwave test payment (same "not yet live-tested end-to-end" caveat already logged for Offers, Phase 11).
- Document actual findings in `docs/design-vs-backend-gaps.md` as a new Phase, same as every other feature — this plan is the blueprint, that file is the record of what actually happened once built.
