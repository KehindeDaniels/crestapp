# Plan: Home Page — Component/API Dependency Map

> Analysis only, per explicit instruction — no implementation until this is agreed. Sources: Figma `aDI3HOS6NVQWnLdIx5Zvif`, node `1411:2864` (`Home-Buy`/`Home-Rent`/`Home-Airbnb` — pulled via `get_design_context`, confirmed pixel-identical across all three except the listing-card type badge label), `docs/design/screenshots/home/Home-{Buy,Rent,Airbnb}.png`, and `Crest App Laravel API Collection.postman_collection (1).json`.

## 1. Component inventory

| # | Component | Notes |
|---|---|---|
| 1 | Sidebar — logo | Static, already have the asset |
| 2 | Sidebar — nav list | Home / Search Property / List Property / Messages / History / Saved Property / Profile — 7 static links |
| 3 | Sidebar — Log out | Static action, already have `authApi`/session clear logic from Phase 1 |
| 4 | Topbar — favorites (heart) icon | No badge/count shown in the design itself |
| 5 | Topbar — notifications (bell) icon + unread dot | Red dot = has-unread indicator |
| 6 | Topbar — user card (avatar, name, "Verified" badge) | |
| 7 | Greeting — "Welcome back {name}" + "Find verified homes near you" | Name is dynamic, tagline is static copy |
| 8 | Search panel — Buy/Rent/Airbnb tabs | Filters the listing feed below |
| 9 | Search panel — search input ("location, price or type") | Free-text |
| 10 | Search panel — Property Type dropdown | |
| 11 | Search panel — Price Range dropdown | |
| 12 | Search panel — Property Feature dropdown | |
| 13 | Search panel — filter icon button | Opens a fuller filter UI (no separate screen provided) |
| 14 | "Recent Listing" header + "See all" link | |
| 15 | Listing card (×N, horizontally clipped — 4th card cut off in every screenshot) | Owner avatar/name/"Verified" badge/"Property owner" label, image, type badge + status dot, price, bed/bath/sqm, address, per-card heart/favorite button |
| 16 | "Complete your KYC" banner | **Already built** — this is our existing `KycReminderCard` |
| 17 | "List your Properties on Crest" banner | Static marketing CTA + illustration, links to the property-creation flow |

## 2. Component → API mapping

| Component | Endpoint | Method | Auth | Confirmed response shape? |
|---|---|---|---|---|
| User card (name, avatar) | `GET /api/profile` | GET | Bearer (explicit) | ✅ **Confirmed live** — see §2a |
| "Verified" badge (user card, i.e. the person) | Reuse existing `useMyKycStatus()` (`POST /api/kyc/find-single`) | POST | Bearer | Partial — already integrated in Phase 2.5, known caveats (see `docs/design-vs-backend-gaps.md`) |
| Greeting name | Same `GET /api/profile` call as user card (`profile.first_name`) | — | — | ✅ Confirmed |
| Notifications bell + unread dot | `GET /api/notifications` | GET | Bearer (explicit) | ✅ **Confirmed live** — see §2c |
| Favorites (heart) icon, per-card heart, "Saved Property" nav | **No endpoint exists** | — | — | ❌ Confirmed absent — grepped the entire collection, zero matches for favorite/wishlist/saved/bookmark; also confirmed no `is_favorited`-style field on the real property object |
| Buy/Rent/Airbnb tabs + search + 3 filter dropdowns | `POST /api/properties/search` | POST | **Confirmed: requires Bearer** (unauthenticated request errors, see §5 bug) | ✅ **Confirmed live with real data** — see §2b |
| "Recent Listing" feed | Same `POST /api/properties/search`, no filters (or a small `per_page`) | POST | Bearer | Same as above |
| "Verified" badge (on each listing card, i.e. the property) | Same response's `property.verification_status === "verified"` — **not** the owner's personal KYC status | — | — | ✅ Confirmed — correction from my original guess, see §2b |
| "Complete your KYC" banner | Already wired — `KycReminderCard` / `useMyKycStatus()` | — | — | Reuse as-is |
| "List your Properties" banner | No data call — static copy + a link to the property-creation flow (not yet built) | — | — | N/A |
| Sidebar nav (Search/List/Messages/History/Saved/Profile) | No data calls from Home itself — just route links | — | — | N/A |

### 2a. `GET /api/profile` — confirmed real response

```json
{
  "success": true,
  "data": {
    "user": { "email": "...", "phone_number": "...", "role": "tenant", "status": "active", "created_at": "...", "last_login_at": "..." },
    "profile": {
      "profile_id": 34, "user_id": 34,
      "first_name": "John", "last_name": "Doe",
      "date_of_birth": null, "profile_picture_url": null, "bio": null,
      "address": null, "city": null, "state": null, "country": "Nigeria",
      "created_at": "...", "updated_at": "..."
    },
    "bank_account": null,
    "trust_score": null,
    "ratings_summary": { "total_ratings": 0, "average_rating": 0 }
  }
}
```
Confirms the update payload's inferred fields exactly. Greeting/user-card use `data.profile.first_name` and `data.profile.profile_picture_url` (which is `null` on this test account — the avatar needs a real fallback, not an assumption that it's always populated). Bonus fields (`bank_account`, `trust_score`, `ratings_summary`) aren't needed for Home but are relevant for the real Profile screen later.

### 2b. `POST /api/properties/search` — confirmed real response (with seeded data)

```json
{
  "success": true,
  "message": "Properties retrieved successfully",
  "data": {
    "properties": [
      {
        "property_id": 26,
        "title": "Residential Land in Ipaja",
        "property_type": "land",
        "purpose": "sale",
        "price": "100000000.00",
        "currency": "NGN",
        "location_address": "113, Agbaje street ,ipaja",
        "city": "Ipaja", "state": "Lagos", "country": "Nigeria",
        "bedrooms": 0, "bathrooms": 0, "square_meters": "600.00",
        "status": "active",
        "verification_status": "verified",
        "featured": 0,
        "created_at": "2026-07-14T01:23:28.000000Z",
        "media": [
          { "media_id": 49, "media_type": "image", "media_url": "/storage/property_media/property_26_....jpg", "thumbnail_url": "...", "caption": "Other", "is_primary": 0, "display_order": 0 }
        ],
        "owner": {
          "user_id": 37, "role": "seller",
          "profile": { "first_name": "Joel", "last_name": "Taiwo", "full_name": "Joel Taiwo", "profile_picture_url": "https://api.crestapp.ng/api/download/...(full URL)" }
        }
      }
    ],
    "pagination": { "current_page": 1, "per_page": 5, "total": 5, "last_page": 1 }
  }
}
```
Real findings that **correct assumptions in the original plan**:
- **Owner info is nested directly in each property** (`owner.profile.first_name/last_name/full_name/profile_picture_url`) — no N+1 lookup needed, good news.
- **The card's "Verified" badge is the property's `verification_status`, not the owner's personal KYC status.** I'd originally assumed these were the same concept — they're not. A property can presumably be unverified even if its owner is a fully KYC'd user, and vice versa. Only `"verified"` has been observed live; the full enum isn't confirmed (guessing `pending`/`rejected`/`unverified` exist too, matching the KYC status pattern, but not seen).
- **`media_url`/`thumbnail_url` are relative paths** (`/storage/property_media/...`), needing `https://api.crestapp.ng` prefixed to become usable `<Image src>` values. **`owner.profile.profile_picture_url` is already a full absolute URL** — inconsistent between the two fields on the same response, worth handling as two different parsing rules, not one shared helper.
- **`price` and `square_meters` are strings**, not numbers (`"100000000.00"`) — needs `Number()` before `formatCurrency()`/display math.
- **`featured` is `0`/`1`**, not a real boolean.
- All 5 real sample properties have `purpose: "sale"` — no `"rent"` or airbnb-equivalent example was seen, but the schema still only allows `rent|sale|lease` regardless.
- The green status dot next to the type badge most likely maps to `status === "active"` (all 5 samples are `"active"`; other schema values — `draft, pending_approval, rented, sold, inactive, suspended` — presumably render differently or get filtered out of a "Recent Listing" feed entirely, but that's unconfirmed since no non-active example exists yet).

### 2c. `GET /api/notifications` — confirmed real response

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "notification_id": 55,
        "notification_type": "kyc_approved",
        "title": "🎉 KYC Verification Approved!",
        "message": "...",
        "is_read": 0,
        "read_at": null,
        "priority": "high",
        "channel": "in_app",
        "status": "sent",
        "created_at": "2026-07-14T10:34:13.000000Z"
      }
    ],
    "last_page": 1, "per_page": 20, "total": 2, "from": 1, "to": 2,
    "first_page_url": null, "last_page_url": null, "next_page_url": null, "prev_page_url": null, "links": []
  }
}
```
- **`is_read` (`0`/`1`) and `read_at` (nullable timestamp) both exist** — the unread dot can be driven by "does the fetched page contain any `is_read === 0` item," resolving the original gap.
- **Caveat**: this is a standard Laravel paginator (`data.data` is the array, pagination metadata sits alongside it) — a **different shape** than `properties/search`'s custom `{ properties: [...], pagination: {...} }` wrapper. Don't reuse one parsing helper for both.
- **Caveat on "unread" accuracy**: checking the current page for any `is_read === 0` is only exact if unread notifications are guaranteed to sort to page 1 (likely true if sorted newest-first, which this sample appears to be, but not explicitly confirmed) or if the notification volume is low enough that everything fits on one page. Not a real global unread *count* — good enough for a boolean "show the dot," not for a numeric badge if the design ever wants one.

## 3. Data flow / dependencies

```
useCurrentUser()  ──┐
  (/api/user,        │  already built, Phase 1
   session/auth only) │
                       ├──▶  needed to know user_id, gates everything else
useProfile()  ────────┤  NEW — /api/profile (name, avatar)
useMyKycStatus() ──────┤  already built, Phase 2.5 — "Verified" badge + KYC banner
useNotifications() ────┤  NEW — /api/notifications (bell + unread dot)
usePropertySearch(     │
  filters) ────────────┘  NEW — /api/properties/search, independent of the above
```

**Key finding: nothing on this page has a real sequential dependency.** `user_id` is already available synchronously from the session store the instant the page mounts (Phase 1's `useSessionStore`/`useAuth`) — none of the four data calls above need to *wait* on another one's response before firing. They all just need `user_id` to exist, which it already does by the time `(client)/layout.tsx`'s `AuthGuard` has let the page render at all.

## 4. Parallel vs. sequential

**Everything fetches in parallel, fired independently the moment the page mounts:**
- `useProfile()` — user card + greeting name
- `useMyKycStatus()` — Verified badge + KYC banner (already built)
- `useNotifications()` — bell unread state
- `usePropertySearch(filters)` — the listing feed

There is no case on this page where one section's data determines *what request* another section makes (e.g., nothing here is "fetch A, then use a field from A's response to fetch B"). Each section renders its own independent loading/error/success state — a slow notifications call should never block the listing feed from showing, and vice versa. This is a textbook case for firing all four as sibling `useQuery` calls (TanStack Query dedupes/caches independently) rather than any kind of waterfall or `Promise.all`-style coupling.

**One real interaction dependency, not a data one:** changing the Buy/Rent/Airbnb tab or any filter dropdown re-triggers `usePropertySearch` with new params — that's a normal "filters changed → refetch" pattern (query key includes the filter object), not a cross-component data dependency.

## 5. Missing backend endpoints / data — confirmed gaps

Re-verified live against the real API (2026-07-14) with a real Bearer token and real seeded data. Items 3-5 and 8 from the original pass are now **resolved** (moved to §2a/§2b/§2c above). Remaining real gaps:

1. **Airbnb has no backend representation at all — still confirmed, now double-checked against real data too.** `properties/search`'s `purpose` filter is `nullable|in:rent,sale,lease` — no `airbnb`/`short_let` value exists in the schema, and all 5 real seeded properties returned are `purpose: "sale"` (none `"rent"`, nothing airbnb-shaped). Grepped the entire Postman collection for "airbnb"/"shortlet"/"short_stay" — zero matches anywhere. Building the Airbnb tab against the real API is currently **impossible**, not just undocumented.
2. **No favorites/wishlist/saved-property endpoint or field exists — still confirmed.** Neither the collection nor the real property object (§2b) has anything resembling `is_favorited`/a save action. The topbar heart, per-card heart, and "Saved Property" nav item all have nothing to bind to.
3. **No preset "Price Range" values are defined anywhere.** The search schema only has raw `min_price`/`max_price` numeric fields — the Figma dropdown implies a curated list of ranges (e.g. "₦0–500k", "₦500k–1M"), which would need to be a **client-side, made-up set of buckets**, not something the backend defines. Worth explicit sign-off since it's presentation logic wearing a "backend filter" costume.
4. **No "Property Feature" field exists in the search schema at all** — no amenities/features filter of any kind. The third filter dropdown in the design has nothing to bind to.
5. **Full `verification_status` enum unconfirmed.** Only `"verified"` has been observed live (all 5 sample properties). Presumably a `pending`/`rejected`/similar exists too (matching the KYC status pattern), but no unverified example exists to confirm against.

### New bug found while verifying this plan — worth its own report

**`POST /api/properties/search` returns a raw `500` with a full Laravel debug stack trace when unauthenticated, instead of a clean `401`.**
```
HTTP 500
Symfony\Component\Routing\Exception\RouteNotFoundException: Route [login] not defined.
  in .../vendor/laravel/framework/.../UrlGenerator.php:477
#0 .../Handler.php(570): route()
#1 .../Handler.php(471): Handler->unauthenticated()
... (full server file paths exposed in the response body)
```
**Confirmed isolated to this one route, not systemic** — retested the same no-auth request against `GET /api/profile` and `GET /api/notifications` and both correctly return a clean `401 {"message": "Unauthenticated."}`. Only `properties/search` breaks this way, which actually makes the root cause easy to name: this one route is almost certainly wired to a different auth guard/middleware than the rest of the API. The `web` guard's default unauthenticated-response behavior is "redirect to the named `login` route"; the `api`/`sanctum` guard's default is "return a JSON `401`" — and only this route is missing the `login` route it tries to redirect to, crashing instead. Likely fix on their end: this route isn't going through `auth:sanctum` the way every other protected route does (or is accidentally registered under `web` middleware instead of `api`).

Two real problems either way: (1) client code can't distinguish "not logged in" from "server error" by status code on this one route, and (2) `APP_DEBUG` appears to be `true` in production — the response leaks internal server file paths and a full stack trace to anyone who sends an unauthenticated request to it. Worth reporting to the backend dev alongside the existing CSRF/OTP bug report (`docs/bug-report-csrf-and-otp-leak.md`).

## 6. Recommended loading strategy

- **All client-side (TanStack Query), not RSC** — Home sits behind `AuthGuard`, and every data source above requires Bearer auth: `/api/profile`, `/api/notifications` explicitly, and `/api/properties/search` **now confirmed live** (unauthenticated request errors — see the bug in §5). This matches the existing hard architectural rule from `docs/frontend-blueprint.md` — no exception needed here.
- **Initial load**: fire `useProfile()`, `useMyKycStatus()`, `useNotifications()`, and `usePropertySearch({})` (default/unfiltered, `purpose` unset or defaulted to the active tab) as independent parallel queries the moment the page mounts. Each section owns its own skeleton/loading state — no page-level "wait for everything" spinner.
- **Filter/tab changes**: refetch only `usePropertySearch`, keyed by the filter object (`queryKeys.properties.search(params)` already exists as a stub in `query-keys.ts`) — the other three queries are untouched.
- **"Recent Listing" feed**: given the design shows a fixed-count horizontally-clipped row (4 cards, last one cut off) rather than an infinite grid, this reads as a **small, fixed `per_page` fetch** (e.g. 8-10) with a "See all" link handing off to the real `/search` results page (Phase 3's Search Property screen) for actual pagination — not infinite-scroll/pagination on Home itself.
- **Favorites/notifications-unread**: blocked entirely until the gaps in §5 are resolved — no reasonable client-side loading strategy to propose for endpoints that don't exist.

## 7. Decisions — locked in

1. **Airbnb tab: hidden entirely.** Only Buy/Rent render. Tab list is a small data-driven config (`{ value, label }[]`), not hardcoded JSX per tab — adding Airbnb back once the backend supports a matching `purpose` value is a one-line config addition, not a restructure.
2. **Favorites (topbar heart, per-card heart, "Saved Property" nav item): hidden entirely.** No endpoint exists, nothing rendered. Sidebar nav list and topbar icon list are both data-driven arrays, so re-adding "Saved Property" later is a one-line config change, not a redesign. **Superseded** (docs/design-vs-backend-gaps.md, Phase 8) — built for real anyway, client-only via `localStorage` (explicit decision, not a backend change). Every heart icon is now a live toggle and "Saved Property" is back in the nav.
3. **"Property Feature" dropdown: kept in the UI, disabled, marked "Coming Soon."** It's a visually significant part of the search bar and shouldn't be silently dropped. Built as `PropertyFeatureFilter`, structured with the same prop shape as the two real filter dropdowns (Property Type, Price Range) it sits next to — sends no value to the backend and doesn't affect the search request. Wiring real options later means filling in that one component, not touching the search bar's layout or the other filters.
4. **Price Range: client-defined preset buckets, proposed by me** (Nigerian property market, reviewable/adjustable) — see §7a.

### 7a. Proposed price buckets (NGN)
| Label | `min_price` | `max_price` |
|---|---|---|
| Under ₦500k | — | 500,000 |
| ₦500k – ₦1M | 500,000 | 1,000,000 |
| ₦1M – ₦5M | 1,000,000 | 5,000,000 |
| ₦5M – ₦20M | 5,000,000 | 20,000,000 |
| ₦20M – ₦100M | 20,000,000 | 100,000,000 |
| ₦100M+ | 100,000,000 | — |

Loosely calibrated against the real seeded data pulled live (₦200 test listing up to a ₦100M land listing) — wide enough to cover both rent-scale and sale-scale prices without a separate bucket set per `purpose`, which the design doesn't show anyway. Flag if any of these feel off — trivial to adjust, it's a static array.

### 7b. Extensibility principle for all three unsupported-backend features (Airbnb, Favorites, Property Feature)
Per explicit instruction: encapsulate each behind its own component/hook/config so that adding real backend support later is a contained change, not a UI redesign. Concretely:
- **Tabs and nav/icon lists are config-driven arrays**, not hardcoded per-item JSX — extending them is additive.
- **`PropertyFeatureFilter` is its own component** with the same shape as the real filter dropdowns — swapping its placeholder state for real options + an `onChange` doesn't touch anything else in the search bar.
- **Not** building a speculative `useFavoriteProperty()` hook or similar for an endpoint that doesn't exist and isn't even rendered right now — that would be premature abstraction for code with no current caller. The config-driven nav/icon lists are what make re-adding it later cheap; a hook with nothing to call yet isn't.

## 8. Still open — not blocking, your call whenever
1. **Want the 500-instead-of-401 bug (isolated to `properties/search`, §5) added to `docs/bug-report-csrf-and-otp-leak.md`** to send to the backend dev?
2. **`purpose: "rent"` and non-`"verified"` property examples** still don't exist in the seeded data — not blocking (the `sale`/`verified` shape is representative enough to build against), just noting the gap remains open per your last test round.

Nothing here has been built yet — waiting on your call on 1-4 (and 5, separately) before writing any component or hook code.
