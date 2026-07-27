# Crest App — Frontend Handover

> **Read this first.** This document is the single source of truth for the Crest
> web application frontend: what it is, what was built, how the user journeys
> flow, where things can break, how to run/redeploy it, and the formal handover
> checklist. It is written to be understandable by a non-original developer.
>
> Companion docs (in `docs/`) go deeper on specific areas and are referenced
> throughout:
> - `docs/design-vs-backend-gaps.md` — the authoritative, phase-by-phase record
>   of every place the design/BRD and the real backend disagree, and what was
>   done about it. **If a feature behaves unexpectedly, check here first.**
> - `docs/design/shortlet-implementation-plan.md` — the Shortlet (BRD) blueprint.
> - `docs/deployment.md` — static-export deploy notes (an alternative path, not
>   the one currently live — see §11).

---

## 1. Project Information

| Field | Value |
|---|---|
| **Project name** | Crest App (frontend / web client) |
| **Live URL (this app)** | https://app.crestapp.ng |
| **Related URLs** | `https://crestapp.ng` (WordPress marketing site — separate), `https://admin.crestapp.ng` (admin SPA — separate, not this codebase), `https://api.crestapp.ng` (Laravel REST API backend — separate team) |
| **Technology stack** | Next.js 16.2.10 (App Router, **SSR**), React 19.2.4, TypeScript 5, Tailwind CSS v4, TanStack Query v5 (server state), Zustand v5 (client state), radix-ui, react-hook-form + zod, lucide-react. Package manager: **npm** (Node 22.x). |
| **Handover date** | 2026-07-26 |
| **Repository** | https://github.com/KehindeDaniels/crestapp |
| **Deployed branch** | `feat/frontend-foundations` |
| **Hosting** | Hostinger **"Deploy Web App"** (Node runtime), auto-deploying from GitHub |

---

## 2. What this application is (in one paragraph)

Crest is a Nigerian proptech platform. This repository is **only the customer-
facing web frontend** — a client-rendered Next.js app that talks to a separate
Laravel REST API at `api.crestapp.ng` for all data. It has **no database and no
server-side business logic of its own**; every screen fetches/writes through the
API using a bearer token. Users can create an account (with KYC), search and
list properties (buy/rent), make binding purchase offers with escrow-backed
payment, message owners, track transaction history, save properties, manage
their profile, and — the newest capability — **book and host short-stay
rentals ("Shortlets")**, which is the feature the most recent BRD
(`Shortlet_Frontend_UI_UX_BRD.md`) specified.

---

## 3. Architecture at a glance

```
Browser ──▶ app.crestapp.ng  (this Next.js SSR app, on Hostinger Deploy Web App / Node 22)
                   │  bearer-token fetches (TanStack Query)
                   ▼
            api.crestapp.ng  (Laravel REST API — separate team, owns the database)
```

- **All data is fetched at runtime, client-side**, via TanStack Query. Pages are
  almost entirely `"use client"`. There is no server-rendered data-fetching that
  matters — the SSR server mostly ships the app shell.
- **State**: server data → TanStack Query (cached, deduped, some polled to fake
  real-time since the backend has **no websockets**). Client/session data →
  Zustand (`useSessionStore`) + a JS-readable auth cookie.
- **The one hard rule of the codebase**: components never touch raw API shapes.
  Every feature has a `models.ts` "mapper" layer (`toXModel(...)`) that is the
  ONLY place raw responses are read. If a backend shape changes, you fix it in
  that one mapper, not across components.
- **Feature-first structure**: `src/features/<name>/{types,api,models,hooks,index}.ts`
  (e.g. `src/features/shortlets/`, `src/features/offers/`, `src/features/properties/`).
  Routes live in `src/app/(client)/…` and `src/app/(auth)/…`.

---

## 4. User roles

The backend role enum is fixed: **`landlord`, `tenant`, `seller`, `buyer`,
`lawyer`, `surveyor`, `admin`** (plus a staff `support_agent`). The four
consumer roles are the only self-selectable ones.

| What the user is | Role value | Can do |
|---|---|---|
| Buyer | `buyer` | Browse, make offers on **sale** properties |
| Renter | `tenant` | Find/rent long-term properties |
| Landlord / Host | `landlord` | **List rentals AND shortlets** |
| Seller | `seller` | List **sale** properties |
| Lawyer / Surveyor / Admin | staff | Not self-service; provisioned via the separate admin system |

- **Role gating that actually exists in the UI**: only `landlord`/`seller` see a
  working "List Property" flow; everyone else sees a blocking message.
- **Self-service role switch** (new): Profile → "Switch account role" →
  `PUT /api/profile/role`. This updates the session + role cookie live, no
  re-login. **Important, unconfirmed**: the exact role the backend requires to
  *create a shortlet* was never confirmed (see `shortlet-implementation-plan.md`,
  Gap 2). The "Shortlet owner" / "Shortlet user" names in the BRD are a **product
  relabeling of existing roles** (owner ≈ landlord, guest ≈ tenant/buyer), NOT
  new role values.

---

## 5. The Shortlet feature (BRD) — full detail

This is the feature the BRD (`Shortlet_Frontend_UI_UX_BRD.md`) specified. It is a
"book a place for a few nights" product (like Airbnb): an owner lists a place
with bookable rooms; a guest searches by dates, gets a quote, books (a hold),
pays, and the booking auto-confirms. **The stay ends by itself — there is no
checkout button** (a core BRD rule).

### 5.1 Confirmed backend endpoints used (all have real saved examples)

| Action | Endpoint |
|---|---|
| Switch role | `PUT /api/profile/role` |
| Create listing (+ rooms) | `POST /api/shortlets` |
| List my shortlets (owner) | `GET /api/shortlets` |
| Activate / update listing | `PUT /api/shortlets/{id}` |
| Room calendar (per-night) | `GET /api/shortlets/{id}/rooms/{roomId}/calendar?from&to` |
| Block/open dates | `PUT /api/shortlets/{id}/rooms/{roomId}/availability` |
| Search | `POST /api/shortlets/search` |
| Listing detail (public) | `GET /api/shortlets/browse/{id}` |
| Which rooms free for dates | `GET /api/shortlets/browse/{id}/availability?check_in_date&nights` |
| Price quote | `POST /api/shortlets/quote` |
| Create booking (hold) | `POST /api/shortlets/bookings` |
| Pay booking | `POST /api/shortlets/bookings/{id}/pay` |
| My bookings (guest) | `GET /api/shortlets/bookings/mine` |
| Cancel booking | `POST /api/shortlets/bookings/{id}/cancel` |

### 5.2 Live routes (SSR — dynamic URLs)

> These are the URLs on the **deployed `feat/frontend-foundations` branch**.
> (An alternative "static export" branch used `?id=` query-param URLs instead —
> see §11 — but that is **not** what's live.)

**Guest:** `/shortlets` (search) → `/shortlets/[listingId]` (detail + quote +
book) → `/shortlets/bookings/[bookingId]` (pay + status + cancel);
`/shortlets/bookings` (my bookings list).

**Owner:** `/shortlets/manage` (my listings) → `/shortlets/manage/new` (create)
→ `/shortlets/manage/[listingId]` (activate + room list) →
`/shortlets/manage/[listingId]/rooms/[roomId]` (calendar).

Reachable from the **"Shortlets"** nav item; owner + bookings via buttons on the
search page.

### 5.3 Owner (Host) journey — step by step

1. **Become a host.** Profile → *Switch account role* → **Landlord / Host**.
2. **Add a shortlet.** Shortlets → *Host* → *Add shortlet*. Enter title,
   address/city, base nightly rate, cleaning fee, min/max nights, check-in time,
   cancellation policy, and **at least one room** (name, type, capacity, beds,
   nightly rate). Saved as a **draft**.
3. **Activate.** On the manage page, *Activate listing* (requires ≥1 active
   room). Status flips `draft → active`; the listing becomes searchable/bookable.
4. **Manage the calendar.** Open a room → calendar (month view). Colours:
   **green = available, grey = blocked, amber = held (awaiting payment),
   blue = booked**. Select a date range → **Block** or **Open**, optionally set a
   special price. Booked/held nights are protected by the backend.

### 5.4 Guest journey — step by step

1. **Search.** Shortlets → enter **check-in date + nights** (required), plus
   optional city/guests/price. Results show only places free for those nights.
2. **View + quote.** Open a listing → see rooms + which are available → select
   room(s) (**multi-room booking is supported**) → *Get quote*. The quote breaks
   down: nightly line(s) + cleaning fee + service fee = **total**, plus the
   stay's start and **auto-end** time.
3. **Book.** *Book now* → creates a **hold** (`pending_payment`) with an
   **expiry timer** ("complete payment by …").
4. **Pay.** On the booking page → *Pay with Flutterwave* → opens the real
   Flutterwave checkout **in a new tab** (this page stays open and polls).
5. **Confirmed.** After payment clears (backend webhook), the booking flips to
   **confirmed** on its own (the page polls `/bookings/mine` every 15s). Shows
   the stay window. **No checkout** — the stay ends automatically at its end
   time.
6. **My bookings.** `/shortlets/bookings` — Upcoming / Past / Cancelled tabs.
   Cancel is available while `pending_payment`.

### 5.5 Booking statuses (shown in the UI)

`pending_payment` (Pay to confirm + timer) · `confirmed` (You're booked + stay
window) · `completed` (Stay finished) · `expired` (payment window ended, hold
released) · `cancelled`.

### 5.6 Shortlet gaps / where it can glitch (IMPORTANT)

- **Owner cannot see bookings on their own listings.** There is **no
  owner-facing bookings endpoint** — only the guest's own (`/bookings/mine`) and
  an admin-only one. So owner management covers listings + calendars only. *If a
  host asks "where are my bookings?" — that screen does not exist yet; the
  endpoint must be built backend-side first.*
- **Only Flutterwave.** The pay endpoint only ever returns a Flutterwave link.
  Other gateways are not wired.
- **No single-booking GET endpoint.** The booking detail page finds its booking
  by scanning the polled `/bookings/mine` list. *If a booking doesn't appear on
  its detail page, it's because it isn't in that list yet (timing/polling).*
- **Role for creating a shortlet is unconfirmed.** If *Add shortlet* returns a
  **403**, that's the backend gating creation on a role the account doesn't have
  — the exact error is shown verbatim. Resolve by confirming the required role
  with the backend team.
- **Not live-tested end-to-end through a real payment.** The pay redirect and the
  `pending_payment → confirmed` transition were built against confirmed response
  shapes but never run through a real Flutterwave transaction. **Verify with one
  real test booking.**

### 5.7 Stakeholder (lead) concerns raised — and the honest explanation

During the build the project lead raised three specific concerns about the
Shortlet revision. They are all valid product questions; here is exactly why the
app is the way it is, and what it would take to change each — so the next
developer isn't blindsided.

**Concern 1 — "I thought 'Shortlet owner' would be a role option on the
registration screen."**
- **Why it isn't:** There is **no shortlet-specific role in the backend.** The
  role enum is fixed (`landlord/tenant/seller/buyer/lawyer/surveyor`) and did
  **not** gain a shortlet value in the update. Per the BRD's own wording
  ("switch role … same pattern as landlord/tenant today"), a **"Shortlet owner"
  is a product relabeling of the existing `landlord` role**, not a new account
  type. The registration picker maps 1:1 to real backend roles; adding a
  "Shortlet owner" option would either send an invalid role (registration fails)
  or silently map to `landlord` (a confusing duplicate).
- **The honest fix (small, frontend-only):** relabel the existing "Landlord"
  option to something like **"Landlord / Host — rentals & short-stays."** The one
  blocker is confirming **which role the backend actually requires to create a
  shortlet** (Gap 2 in §5.6). Once confirmed (e.g. "landlord"), it's a
  ~10-minute copy change. Until then, the safe path is the **self-service role
  switch in Profile** (already built), which lets any user become a host without
  guessing at signup.

**Concern 2 — "Home should be 'Buy, Rent, Shortlet' — isn't that the whole idea
of the revision?"**
- **Why it's a separate nav item instead of a third Home tab:** Buy and Rent are
  the **same query** — both hit `POST /api/properties/search` with plain filters
  (location, price, type), no dates. **Shortlet search is a fundamentally
  different query** — it hits a **different endpoint** (`POST /api/shortlets/search`)
  and **requires a check-in date and number of nights** (the whole point is "what
  is free for *these specific nights*"). You cannot search shortlets from the
  Buy/Rent box, which has no date inputs. That's why Shortlets got its own page
  (with date pickers) rather than being crammed into a search box that doesn't
  fit it. **This was a deliberate separation, not an oversight.**
- **The fix that satisfies the intent (small, frontend-only, ~30 min, no backend
  dependency):** add a **"Shortlet" tab** to Home/Search that, when selected,
  swaps the normal search row for the date + nights inputs (or routes straight to
  `/shortlets`). Discoverability of the revision is met without breaking the two
  different search shapes. This was discussed and agreed as a good idea; it was
  **not yet implemented** and is a clean, low-risk next task.

**Concern 3 — the meeting outcome: "consolidate roles so everyone can do more"
(e.g. Seller can sell *or* rent, Buyer can buy; or everyone can do everything).**
- **What we learned:** the hardest prerequisite — a **self-service role-switch
  endpoint** — **turned out to already exist** (`PUT /api/profile/role`, wired
  into Profile). So the flexibility the meeting wanted is largely a
  configuration/decision problem now, not a from-scratch build.
- **Option A — two roles (Seller = sell *or* rent, Buyer = buy):** *Backend*
  carries the real work — relax the property-creation role gate so one role can
  list both purposes, adjust the contract owner↔type pairing, and migrate
  existing `landlord`/`tenant` accounts. *Frontend* is light — shrink the role
  picker to two options and add an explicit **"For Sale / For Rent" toggle** to
  the listing wizard (which today infers purpose from role).
- **Option B — everyone can do everything:** *Backend* work is bigger (remove
  role-based authorization from property + contract creation and redefine what
  `role` means). *Frontend* is actually the **lightest** — delete the role step
  from registration and the `canList` gate, and add the same sale/rent toggle.
- **Bottom line:** **backend carries the heavier lift in both**, scaling with how
  far you consolidate (B > A). Recommendation on record: prefer **Option A** —
  it delivers the flexibility with a narrower, safer backend change. **Neither is
  implemented** — this is pending a product decision, and the frontend changes are
  small once that decision is made.

> Net: all three concerns are understood, none are bugs, and each has a clear,
> mostly-small path to resolution — two are frontend-only and unblocked; the role
> consolidation is primarily a backend + product-decision item.

---

## 6. The other features (what else the app does)

Each is a real, built feature. Full gap details are in
`docs/design-vs-backend-gaps.md` (phase numbers cited).

| Feature | What it does | Key glitch/limitation |
|---|---|---|
| **Auth** (Phase 1) | Login + 5-step register wizard (personal info → verify email OTP → phone → verify phone OTP → password), then role pick. Register returns **no token** → redirects to login. | **OTP sending service is not live** — the backend returns the code in the send response so testers can verify. The register screens **auto-fill** that code (with a visible "Test mode" note). Confirmed working for phone; **email OTP auto-fill was reported inconsistent by the client and is unresolved** — if email code doesn't auto-fill, read it from the API response / DevTools. |
| **KYC** (Phase 2) | ID upload + selfie capture + processing gate. | Document upload uses the Legal Documents endpoint (`document_type: certificate` is a flagged best-fit). KYC self-status lookup shape is unconfirmed. |
| **Home** (Phase 4) | Greeting, Buy/Rent property search, recent listings, KYC reminder, notifications bell (polling). | "Airbnb" tab dropped (no backend `purpose` for it at the time — note: `shortlet` purpose now exists but Home still shows Buy/Rent; a "Shortlet" tab on Home was discussed but not added). |
| **Search + Listing Detail** (Phase 5) | Property grid with filters/pagination; detail page with photo gallery, map deep-link, Make Offer / Message Owner. | Property detail is fetched via `search?id=` (no dedicated GET). "Seller Verification" checklist + extra "Property Features" are **disabled/Coming Soon** (no backend fields). |
| **List Property** (Phase 6) | 4-step wizard: intro → details → media upload → review → documents. Gated to `landlord`/`seller`. | Property "Features" UI is present but disabled (no backend field). |
| **Messages** (Phase 7 / 7.5) | Conversation list + thread, URL-driven (`?with={userId}`), polling (15s/5s) to fake real-time. | Corrected a real shape mismatch (`other_user`, `read_status`). **Message bubble alignment (self-on-right) was not perfectly finished** — the client said "we'll fix it later." No websockets → polling only. |
| **Saved Property** (Phase 8) | Heart/bookmark any property; `/saved` page. | **Client-only (localStorage)** — there is **no backend favorites endpoint**. Saves do not sync across devices. |
| **Notifications** (Phase 9) | Bell dropdown popover, mark-as-read, polling. Preferences in Profile. | Simplified vs design: preferences are 3 booleans (push/email/sms); **no "Daily" digest tier or separate chat toggle** (no backend fields). Rows mark-read on click but don't navigate (no reference field). |
| **History / Transactions** (Phase 10 / 11.8) | Transaction table (All/Completed/In-Progress/Cancelled tabs + search + pagination), detail modal, receipt (Share as PDF via print). | **Pending-payment transactions cannot be opened** — the backend returns **422 `INVALID_TRANSACTION_STATE`** for them by design, so those rows show "Pending" instead of "View" (deliberate). The design's 4-step timeline + fee breakdown have **no backing data** → replaced with an honest derived checklist. "In-Progress" tab buckets 6 real statuses client-side. |
| **Make an Offer** (Phase 11) | `/offers/[contractId]` transaction-overview page: order summary, escrow banner, transaction-status stepper (polled), pay via Flutterwave, cancel. | **"Make Offer" is NOT a negotiation** — `quick-create` immediately creates AND accepts a binding contract at list price + a payment link. **Real fees are 2.5% platform / 5% legal** (the Figma's 5%/10%/"free" is wrong). Only Flutterwave. Payment link is one-time (cached; a "regenerate link" fallback exists). |
| **Profile** (Phase 12) | Header + Edit (name/phone), Payment Method (bank account), Notifications prefs, Change password, **Switch role**, My Listing, links to Favourites/History/KYC. | **Email is read-only** (no update field). "Uploaded document" + Legal links (Help/Terms/About) are **disabled** (no backend). Payment Method saves via `PUT /api/profile` (bank_name/account_number/account_name). |

---

## 7. Cross-cutting things that can glitch (read before debugging)

1. **CORS.** The app calls `api.crestapp.ng` from `app.crestapp.ng`. The Laravel
   API's `config/cors.php` **must list `https://app.crestapp.ng`** as an allowed
   origin. **Symptom if missing: login and all API calls fail with a CORS error
   in the browser console.** This is a **backend** change.
2. **Environment variables.** `NEXT_PUBLIC_API_URL` is **required** — the app
   throws at build if it's missing. These are baked in at **build time**, so a
   change requires a rebuild/redeploy (see §10).
3. **No real-time backend.** "Live" updates (unread counts, messages, booking
   status, offer status) are **polling**, not websockets. A few seconds of lag is
   expected by design.
4. **Payments are external + not fully tested.** Both Make-Offer and Shortlet pay
   flows redirect to Flutterwave and rely on a backend webhook to confirm. The
   `pending → confirmed` transition has not been verified with a real payment.
5. **Auth token in a JS-readable cookie** (accepted XSS trade-off, isolated to
   `src/lib/auth/token.ts`). Secure flag only over HTTPS (fine in production).

---

## 8. Application

| Field | Value |
|---|---|
| **Source code** | This repository. |
| **Repository** | https://github.com/KehindeDaniels/crestapp — branch `feat/frontend-foundations`. |
| **Environment variables (`.env`)** | Not committed (`.env.local` is git-ignored). Required at build time: `NEXT_PUBLIC_API_URL=https://api.crestapp.ng`, `NEXT_PUBLIC_APP_URL=https://app.crestapp.ng`. Optional: `NEXT_PUBLIC_SENTRY_DSN`. **On Hostinger these are set in the Deploy Web App → Environment variables panel**, not in the repo. See `.env.example`. |
| **Install/build** | `npm install` → `npm run build` (SSR build → `.next`) → `npm run start` (serves on port 3000). Package manager is **npm** (pinned via `packageManager` in `package.json`); do **not** use pnpm (see §11 note). Verify locally: `npm run typecheck`, `npm run lint`, `npm run build`. |

---

## 9. Database

**This frontend has no database.** It is a stateless client of the Laravel REST
API. All persistent data (users, properties, contracts, transactions, shortlets,
bookings, messages, KYC, etc.) lives in the **backend's database, owned and
managed by the backend team** at `api.crestapp.ng`.

| Field | Value |
|---|---|
| **Database name** | N/A for the frontend. Owned by the backend team. |
| **Database backup (SQL)** | N/A for the frontend. Request from the backend team. |
| **Database configuration** | N/A for the frontend — no DB connection exists in this codebase. The only "config" is `NEXT_PUBLIC_API_URL` pointing at the API. |
| **Client-side storage** | The only local persistence is browser `localStorage` for **Saved Properties** (favorites) via Zustand `persist`, and cookies for the auth token/role. No server database. |

---

## 10. Application Access

| Field | Value |
|---|---|
| **App URL** | https://app.crestapp.ng |
| **Admin URL** | **Not part of this codebase.** The admin dashboard is a **separate app** at `https://admin.crestapp.ng`. It was not built in this project (the Admin Dashboard is a documented future phase — see `docs/frontend-blueprint.md` §17). |
| **Admin credentials** | N/A here — owned by the admin/backend team. |
| **User roles** | See §4. Consumer users self-register and pick a role; staff roles are provisioned via the separate admin system. |
| **Test accounts** | Use real accounts against the live API. Because the OTP-sending service isn't live, the verification code is returned by the API and auto-filled during registration (see §6, Auth). |

---

## 11. Hosting Configuration

| Field | Value |
|---|---|
| **Where it runs** | Hostinger **"Deploy Web App"** (a Node app host, distinct from Hostinger's shared/static hosting), on the **Business** plan, for the subdomain **`app.crestapp.ng`**. Connected to GitHub with **auto-deployment** on push to `feat/frontend-foundations`. |
| **Deployment directory/path** | Managed by Hostinger's Deploy Web App (it clones the repo, runs the build, and serves it). Root directory: `./`. Not a manual `public_html` upload. |
| **Runtime version** | **Node 22.x**. Framework auto-detected as **Next.js**. |
| **Package manager** | **npm** — this is critical (see the box below). |
| **Required server extensions/services** | None to configure on the frontend host — Hostinger's Deploy Web App provides Node. Native dep `sharp` (image optimization) is built during `npm install`. |
| **Cron jobs** | **None** for the frontend. (Any cron/scheduled jobs belong to the backend.) |
| **SSL / CDN** | Hostinger provides SSL (Let's Encrypt) + CDN (`Server: hcdn`) automatically for the subdomain. |

> ### ⚠️ The package-manager gotcha (the single biggest deployment lesson)
> The app originally used **pnpm**, and Hostinger's Deploy Web App **hard-wired
> pnpm into the deploy config when the app was first created**. pnpm 10's
> build-script security gate then blocked `sharp`/`unrs-resolver` and failed
> every build with `ERR_PNPM_IGNORED_BUILDS` — and **no repo change could
> override Hostinger's baked-in pnpm choice** (there is no package-manager
> selector in the current Hostinger UI; the `⋮` menu only has "Change
> repository" / "Disconnect GitHub").
>
> **The fix that worked:** switch the whole project to **npm** (remove
> `pnpm-lock.yaml` + `pnpm-workspace.yaml`, add `package-lock.json`, add
> `"packageManager": "npm@11.11.0"` to `package.json`, add `.npmrc` with
> `legacy-peer-deps=true`), **then force Hostinger to re-detect the package
> manager** by re-creating / re-pointing the Deploy Web App at the (now
> npm-only) repo. After re-detection, Hostinger runs `npm install` (which has no
> build-script gate) and the build succeeds.
>
> **Do not reintroduce pnpm** for this deployment target. Keep npm.

---

## 12. Third-Party Integrations

| Integration | Configuration |
|---|---|
| **Backend REST API** | `https://api.crestapp.ng` (Laravel). The only external dependency the frontend has. Configured via `NEXT_PUBLIC_API_URL`. Auth is a bearer token in a cookie. |
| **Payment gateway** | **Flutterwave** — but the frontend does **not** integrate Flutterwave directly. The backend generates a Flutterwave `payment_url` (for offers via `/api/contracts/...` and shortlets via `/api/shortlets/bookings/{id}/pay`); the frontend simply **redirects the user to that URL** (new tab) and polls the backend for status. No Flutterwave keys or SDK live in the frontend. |
| **SMTP / email** | Handled entirely by the **backend**. The OTP email/SMS **sending service was not live** during this work (the backend returns codes in the API response for testing). No email config in the frontend. |
| **Maps** | None. Location shows as text; "Directions"/"View Map" deep-link to Google Maps with the address string. No maps API key/integration. |
| **Analytics / Sentry** | `NEXT_PUBLIC_SENTRY_DSN` is supported (optional) but not required/configured. |

---

## 13. Deployment / Redeployment guide

**Normal redeploy (auto):** push to `feat/frontend-foundations` → Hostinger's
Deploy Web App auto-builds and redeploys. Or use the **Redeploy** button in the
Hostinger dashboard.

**Manual/first-time setup or if the build ever regresses:**
1. Ensure the repo is **npm-only** (no `pnpm-lock.yaml`/`pnpm-workspace.yaml`;
   `package-lock.json` present; `packageManager: npm@…` in `package.json`).
2. In Hostinger → Deploy Web App → **Environment variables**: set
   `NEXT_PUBLIC_API_URL=https://api.crestapp.ng` and
   `NEXT_PUBLIC_APP_URL=https://app.crestapp.ng`.
3. Confirm **Node 22.x**, framework **Next.js**, build settings **Default**.
4. Redeploy. **Watch the build log's first lines**: npm's `added N packages`
   means the package manager is correct; pnpm's `resolved… reused…` means
   Hostinger reverted to pnpm — re-create/re-point the app to force npm
   re-detection (see §11 box).
5. After it's live, **smoke-test a real login** (verifies env vars + backend
   CORS).

**Local dev:** `npm install` → `npm run dev` (http://localhost:3000). Set
`NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_APP_URL` in a local `.env.local`.

---

## 14. Backup & restore

- **Frontend**: the "backup" is the Git repository itself — every deploy is a
  commit on `feat/frontend-foundations`. To roll back, redeploy an earlier
  commit (Hostinger Deployments list → pick a commit → Redeploy), or
  `git revert`/checkout and push. There is nothing else stateful to back up.
- **Database / user data**: N/A for the frontend — request backups from the
  **backend team** (they own the database).
- **The WordPress marketing site at `crestapp.ng`** is a separate live site; it
  was intentionally left untouched (the app was deployed to the `app.` subdomain
  to avoid disturbing it). If it ever needs changing, back it up via its own
  Hostinger site → Files → Backups.

---

## 15. Known issues & limitations (consolidated)

**Backend gaps (need backend work to fully resolve):**
1. **No owner-bookings endpoint** for shortlets — hosts can't see who booked.
2. **Role required to create a shortlet is unconfirmed** — may 403.
3. **No single-booking GET** — booking detail scans the polled list.
4. **No favorites endpoint** — Saved Property is localStorage-only.
5. **No websockets** — everything "live" is polling.
6. **OTP send service not live** — codes returned in API responses; email
   auto-fill inconsistent.
7. **CORS** must allow `https://app.crestapp.ng` (verify on backend).
8. **Only Flutterwave** for payments.
9. Various design elements with **no backing data** shown honestly as
   disabled/derived rather than faked (seller-verification checklist, property
   features, notification digest tiers, offer/transaction fee timelines).

**Frontend polish still open:**
10. **Messages** self/other bubble alignment not perfectly finished (client
    deferred).
11. **Home** has no "Shortlet" search tab yet (Shortlets is a separate nav item);
    adding one was discussed, not done.
12. **Payment flows not verified end-to-end** with a real Flutterwave payment
    (both offers and shortlets).

**Product/scope:**
13. **Admin dashboard is not built** (separate app / future phase).
14. Several screens built from exported screenshots rather than live Figma pulls;
    pixel-fidelity verified only for the auth flow.

> For the precise, phase-by-phase record of every gap and the reasoning behind
> each decision, **`docs/design-vs-backend-gaps.md` is authoritative.**

---

## 16. Documentation index (what's in `docs/`)

- **`docs/design-vs-backend-gaps.md`** — phase-by-phase design-vs-backend gaps &
  decisions (Phases 1–13). **Primary debugging reference.**
- **`docs/design/shortlet-implementation-plan.md`** — Shortlet (BRD) blueprint,
  endpoint reference, gaps, rollout order.
- **`docs/deployment.md`** — an alternative **static-export** deploy path (for
  pure static hosting like the admin SPA). **Not the live path** — the live app
  is SSR on Deploy Web App — but kept for reference/fallback.
- **`docs/frontend-blueprint.md`** — original overall architecture blueprint.
- **`docs/handoff.md`**, `docs/figma-links.md`, `docs/design-fidelity-notes.md`,
  `docs/api.md` — supporting notes.
- **`Shortlet_Frontend_UI_UX_BRD.md`** (repo root) — the Shortlet BRD itself.

---

## 17. Deliverables

| Deliverable | Location / status |
|---|---|
| **Source code** | This repo, branch `feat/frontend-foundations` (deployed & live). |
| **Database backup** | N/A for frontend — from backend team. |
| **Documentation** | This `HANDOVER.md` + the `docs/` folder + the BRD. |
| **Live application** | https://app.crestapp.ng (verified serving the Next.js SSR app). |
| **Deployment** | Configured on Hostinger Deploy Web App, auto-deploy from GitHub, npm/Node 22, SSL + CDN active. |

---

## 18. Sign-off

| | |
|---|---|
| **Application** | Crest App — frontend web client |
| **Live URL** | https://app.crestapp.ng |
| **Repository / branch** | github.com/KehindeDaniels/crestapp · `feat/frontend-foundations` |
| **Handover date** | 2026-07-26 |
| **Prepared by** | _______________________ |
| **Received by** | _______________________ |
| **Date of handover** | 2026-07-26 |
| **Signature (handover)** | _______________________ |
| **Signature (receipt)** | _______________________ |

---

### Final note to whoever picks this up

The frontend is complete and live. The **highest-value next actions** are all
verification/backend items, not frontend rework: **(1)** confirm the backend CORS
allow-list includes `app.crestapp.ng`, **(2)** run **one real Flutterwave test
payment** through both an offer and a shortlet booking to confirm the
`pending → confirmed` transition, and **(3)** get the backend to add the missing
endpoints (owner-bookings, single-booking GET) and confirm the shortlet-creation
role. Everything the frontend can honestly do against today's API, it does — and
where the API can't back a design element, that element is shown disabled or
derived rather than faked, with every such decision recorded in
`docs/design-vs-backend-gaps.md`.
