# Crest App — Web Frontend

The customer-facing web app for **Crest**, a Nigerian proptech platform. Users
register (with KYC), search and list properties for sale or rent, make
escrow-backed offers, message owners, track transactions, save properties, and
book or host short-stay rentals ("Shortlets").

| | |
|---|---|
| **Live** | https://app.crestapp.ng |
| **Backend API** | https://api.crestapp.ng (Laravel, separate team, owns the database) |
| **Marketing site** | https://crestapp.ng (WordPress, separate, not in this repo) |
| **Admin dashboard** | https://admin.crestapp.ng (separate app, not in this repo) |
| **Repo** | https://github.com/KehindeDaniels/crestapp |
| **Status** | Feature-complete against the current API and live in production. Typecheck, lint and `npm run build` pass. |

> **Start here, then read [`HANDOVER.md`](HANDOVER.md).** This README tells you how
> to run the app, how the code is organised and where to pick up. `HANDOVER.md`
> covers product behaviour, user journeys, hosting setup and the full history of
> every backend gap. [`docs/design-vs-backend-gaps.md`](docs/design-vs-backend-gaps.md)
> is the main reference when a feature "behaves strangely".

---

## Contents

1. [Quick start](#1-quick-start)
2. [Environment variables](#2-environment-variables)
3. [Scripts](#3-scripts)
4. [Tech stack](#4-tech-stack)
5. [Read this before writing code: Next.js 16](#5-read-this-before-writing-code-nextjs-16)
6. [Architecture](#6-architecture)
7. [Project structure](#7-project-structure)
8. [Route map](#8-route-map)
9. [Conventions and how to add things](#9-conventions-and-how-to-add-things)
10. [The backend API](#10-the-backend-api)
11. [Branches and deployment](#11-branches-and-deployment)
12. [What changed since HANDOVER.md was written](#12-what-changed-since-handovermd-was-written)
13. [Where to continue: open work](#13-where-to-continue-open-work)
14. [Troubleshooting](#14-troubleshooting)
15. [Documentation index](#15-documentation-index)
16. [Repo housekeeping](#16-repo-housekeeping)

---

## 1. Quick start

Requirements: **Node 22.x** and **npm** (pinned to `npm@11.11.0` via
`packageManager`). **Do not use pnpm, yarn or bun.** See
[§11](#11-branches-and-deployment) for why.

```bash
git clone git@github.com:KehindeDaniels/crestapp.git
cd crestapp
npm install                 # .npmrc sets legacy-peer-deps=true
cp .env.example .env.local  # then edit if needed (see §2)
npm run dev                 # http://localhost:3000
```

`/` redirects to `/home` when you're signed in and to `/login` when you're not.
The app has no landing page of its own.

**Test accounts:** there are no seeded users. Register a real account against
the API. The OTP sending service isn't live, so the API returns the
verification code in its response and the register screens auto-fill it (shown
as "Test mode"). If the email code doesn't auto-fill, read it from the network
response in DevTools.

---

## 2. Environment variables

Defined and validated in [`src/config/env.ts`](src/config/env.ts) with zod. The
app **throws at import or build time** if a required variable is missing or
malformed.

| Variable | Required | Example | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | `https://api.crestapp.ng` | Laravel base URL, no trailing slash. For a local backend use `http://127.0.0.1:8000`. |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public URL of this app. Prod: `https://app.crestapp.ng`. |
| `NEXT_PUBLIC_SENTRY_DSN` | No | — | Supported by the schema but not wired up yet. |

- All variables are `NEXT_PUBLIC_*`, so they're **inlined at build time**.
  Changing one requires a rebuild and redeploy.
- `.env.local` is git-ignored. In production the values are set in
  **Hostinger → Deploy Web App → Environment variables**, not in the repo.
- If an image host changes (e.g. the API serves media from a new domain), add it
  to `images.remotePatterns` in [`next.config.ts`](next.config.ts). Otherwise
  `next/image` will refuse to load it.

---

## 3. Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) on :3000 |
| `npm run build` | Production SSR build into `.next/` |
| `npm run start` | Serve the production build on :3000 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (`eslint-config-next` + prettier) |
| `npm run format` / `format:check` | Prettier, with `prettier-plugin-tailwindcss` sorting classes |

There's **no automated test suite**. Before merging, run `typecheck`, `lint`
and `build`, then click through the affected flow against the real API. Manual
test notes and UAT scripts are in `docs/test.md`, `docs/api-test.md` and
`docs/uat/`.

---

## 4. Tech stack

| Concern | Choice |
|---|---|
| Framework | **Next.js 16.2.10** (App Router, SSR, Turbopack), **React 19.2** |
| Language | TypeScript 5 (strict) |
| Styling | **Tailwind CSS v4** (CSS-first config in `src/app/globals.css`), `tw-animate-css`, `class-variance-authority`, `tailwind-merge` via `cn()` |
| UI primitives | `radix-ui` + shadcn-style components in `src/components/ui` (`components.json`), icons from `lucide-react` |
| Server state | **TanStack Query v5** (devtools in dev) |
| Client state | **Zustand v5** (session, multi-step wizards, saved properties) |
| Forms | `react-hook-form` + `zod` v4 (`@hookform/resolvers`) |
| Misc | `date-fns`, `sonner` (toasts), `input-otp` |

---

## 5. Read this before writing code: Next.js 16

This project runs **Next.js 16**, which differs from what most tutorials (and
AI assistants) assume. [`AGENTS.md`](AGENTS.md) says the same thing: **check
the bundled docs in `node_modules/next/dist/docs/` before using a Next API.**

What you'll run into here:

- **`middleware.ts` is now `proxy.ts`.** See [`src/proxy.ts`](src/proxy.ts)
  (exported function `proxy`, Node runtime).
- **Request APIs are async:** `await cookies()`, `await params`, etc. (see
  [`src/app/page.tsx`](src/app/page.tsx)).
- **Runtime config is gone.** Only statically referenced `NEXT_PUBLIC_*` vars
  reach the client, which is why `env.ts` names every variable explicitly.

---

## 6. Architecture

```
Browser ──▶ app.crestapp.ng   (this Next.js app, Hostinger "Deploy Web App", Node 22)
                │  fetch + Bearer token, via TanStack Query (client-side)
                ▼
          api.crestapp.ng      (Laravel REST API, separate team, owns all data)
                │
                └─▶ Flutterwave (payment links are generated by the backend;
                                 the frontend only redirects to them)
```

**This app has no database, no API routes and no server-side business
logic.** Almost every page is `"use client"`. The server only ships the shell
and does the auth redirects. All data is fetched in the browser.

### Request flow

[`src/lib/api/client.ts`](src/lib/api/client.ts) is the only HTTP layer:

- `apiClient<T>(path, opts)` is used for authenticated browser calls. It adds
  `Authorization: Bearer <token>`, JSON-encodes plain-object bodies, passes
  `FormData` through untouched (for uploads) and times out after 20s.
- `publicFetch<T>(path, opts)` is for unauthenticated calls and is safe in
  Server Components.
- Non-2xx responses become an `ApiError` ([`errors.ts`](src/lib/api/errors.ts)).
  A **401 clears the session automatically**, and the guards then redirect to
  login.

### Auth and session

- The token and role are stored in **JS-readable cookies** (`crest_token`,
  `crest_role`, `crest_status`; names in
  [`src/config/constants.ts`](src/config/constants.ts)). All cookie access lives
  in [`src/lib/auth/token.ts`](src/lib/auth/token.ts). This was a deliberate
  trade-off (the token is exposed to XSS) because the API uses bearer tokens,
  not httpOnly session cookies.
- Session state on the client lives in Zustand (`src/features/auth/store.ts`).
- **Two layers of protection:**
  1. [`src/proxy.ts`](src/proxy.ts) runs cheap, optimistic redirects based on
     whether the cookie exists. It's a UX convenience only, not security.
  2. Client guards in [`src/components/guards`](src/components/guards):
     `AuthGuard` wraps the `(client)` and `(onboarding)` route groups.
     `RoleGate`, `VerifiedGate` and `KycGuard` gate individual screens.
- The Laravel API does the real authorisation. If the UI lets a user try
  something they aren't allowed to do, the API's error is shown verbatim.

### State

- **Server data** goes through TanStack Query. All cache keys are defined in
  [`src/lib/api/query-keys.ts`](src/lib/api/query-keys.ts), so invalidation
  lives in one place.
- **"Live" data is polled.** The backend has no websockets. Messages,
  notifications, offer status and booking status poll at 5–15s intervals, so a
  short lag is expected.
- **Client data** lives in Zustand stores: the session, the register, KYC and
  list-property wizards (KYC persists to `sessionStorage`), and saved
  properties (persisted to `localStorage`).

---

## 7. Project structure

```
src/
├── app/                        # Routes only. Keep logic in features/
│   ├── (auth)/                 # Guest-only: login, register wizard, forgot/reset password
│   ├── (onboarding)/           # Authed, minimal chrome: /welcome, /kyc wizard
│   ├── (client)/               # Authed app with AppShell (sidebar + topbar)
│   ├── page.tsx                # "/" → redirect to /home or /login (force-dynamic)
│   ├── layout.tsx, globals.css # Root layout, Tailwind v4 theme tokens
│   └── error.tsx, global-error.tsx, not-found.tsx, loading.tsx
├── components/
│   ├── app-shell/              # Sidebar, topbar, mobile nav. Nav items: nav-config.ts
│   ├── guards/                 # AuthGuard, RoleGate, VerifiedGate, KycGuard
│   └── ui/                     # Shared primitives (button, dialog, select, dropzones, amenities-picker…)
├── config/
│   ├── env.ts                  # Validated env vars
│   └── constants.ts            # Backend enums mirrored here (roles, statuses, amenities, cookie names)
├── features/                   # One folder per domain (see §9)
│   ├── auth/  kyc/  properties/  offers/  transactions/
│   ├── messaging/  notifications/  profile/  saved-properties/  shortlets/
├── lib/
│   ├── api/                    # client.ts, errors.ts, query-keys.ts
│   ├── auth/token.ts           # Cookie session read/write
│   ├── query/                  # QueryClient + provider
│   └── utils/                  # cn, format (money/dates), media-url
├── types/api.ts                # Shared API envelope types
└── proxy.ts                    # Next 16 "middleware"
```

---

## 8. Route map

| Area | Routes | Feature folder |
|---|---|---|
| Auth | `/login`, `/register` → `/register/verify-email` → `/register/phone` → `/register/verify-phone` → `/register/password` → `/register/role`, `/forgot-password`, `/reset-password` | `auth` |
| Onboarding / KYC | `/welcome`, `/kyc` → `/kyc/id` → `/kyc/selfie` → `/kyc/processing` | `kyc` |
| Home | `/home` (Buy / Rent / Shortlet tabs, recent listings, KYC reminder) | `properties`, `kyc`, `notifications` |
| Search & detail | `/search`, `/properties/[id]` | `properties` |
| List a property | `/properties/new` → `details` → `media` → `review` → `documents` (landlord/seller only) | `properties` |
| Offers | `/offers/[contractId]` (summary, escrow, status stepper, Flutterwave pay) | `offers` |
| Messages | `/messages?with={userId}` | `messaging` |
| History | `/history` (transactions, detail modal, receipt) | `transactions` |
| Saved | `/saved` (stored in localStorage) | `saved-properties` |
| Profile | `/profile`, `/profile/listings` | `profile` |
| Shortlets (guest) | `/shortlets` → `/shortlets/[listingId]` → `/shortlets/bookings/[bookingId]`, `/shortlets/bookings` | `shortlets` |
| Shortlets (host) | `/shortlets/manage` → `/manage/new` → `/manage/[listingId]` → `/manage/[listingId]/rooms/[roomId]` (calendar) | `shortlets` |

Sidebar entries are configured in
[`src/components/app-shell/nav-config.ts`](src/components/app-shell/nav-config.ts).
Set `enabled: false` to show an item that isn't ready as disabled instead of
linking to a 404.

---

## 9. Conventions and how to add things

### The one hard rule: components never read raw API shapes

Each feature has a **`models.ts` mapper layer** (`toXModel(raw)`). It is the
**only** place that reads backend response shapes. Components and hooks work
with the mapped models. When the backend renames or moves a field, change the
one mapper. The backend has changed shapes several times, and this rule is why
those changes were cheap.

### Feature module layout

```
src/features/<name>/
├── types.ts      # Raw request/response types, copied from the Postman examples
├── api.ts        # Thin functions calling apiClient() — one per endpoint
├── models.ts     # Raw → UI model mappers (the only place raw shapes are read)
├── hooks.ts      # useQuery/useMutation wrappers, using queryKeys + invalidation
├── schema.ts     # zod form schemas (if the feature has forms)
├── wizard-store.ts / store.ts   # Zustand, only if needed
├── components/   # Feature-specific components
└── index.ts      # Public surface. Import from "@/features/<name>"
```

### Recipe: wire up a new endpoint

1. Find the request in the newest Postman collection
   (`final-Crest App Laravel API Collection.postman_collection (4).json`).
   **Use a saved example response, not a guess.**
2. Add the raw types to `types.ts` and a function to `api.ts` using
   `apiClient`.
3. Map the response in `models.ts`.
4. Add a key to `src/lib/api/query-keys.ts`, then a hook in `hooks.ts`.
   Mutations should invalidate every key they affect.
5. Use the hook in a page under `src/app/...`. Add a nav entry if needed.
6. If the design shows something the API can't support, **render it disabled
   or derived, never with fake data**, and record the gap in
   `docs/design-vs-backend-gaps.md`.

### Other conventions

- **Path alias:** `@/` maps to `src/`.
- **Mirror backend enums** in `src/config/constants.ts`. Don't scatter string
  literals. Amenity labels must match the backend exactly (case-sensitive).
- **Media URLs** from the API can be relative or point at older hosts. Always
  pass them through `src/lib/utils/media-url.ts`.
- **Money and dates:** use the helpers in `src/lib/utils/format.ts`.
- **Payment links** open in a new tab and the original page keeps polling. The
  tab is opened synchronously on click so popup blockers don't stop it.
- **Comments explain *why*.** The codebase records the reason behind a
  workaround, including the backend quirk and the Postman evidence, next to the
  code. Read those comments before "simplifying" something that looks odd.

---

## 10. The backend API

- **Source of truth:** the Postman collections in the repo root. The newest is
  **`final-Crest App Laravel API Collection.postman_collection (4).json`**
  (2026-07-27). The older `(2)` and `latest-` files are kept for history only.
- The backend is owned by a **separate team**. Missing endpoints, CORS and OTP
  delivery are backend tasks.
- **CORS:** the API must allow `https://app.crestapp.ng`, plus
  `http://localhost:3000` if you develop locally against prod. If login fails
  with a CORS error in the console, the fix is on the backend.
- Known backend quirks, and how the frontend handles each one, are recorded
  phase by phase in [`docs/design-vs-backend-gaps.md`](docs/design-vs-backend-gaps.md).

---

## 11. Branches and deployment

| Branch | Purpose |
|---|---|
| `feat/frontend-foundations` | **Production.** Hostinger auto-deploys every push to this branch. It's also the GitHub default branch. |
| `master` | Mirrors `feat/frontend-foundations` (fast-forwarded for handover). If you make it the main branch, **repoint Hostinger at it as well**, or pushes to master won't deploy. |
| `deploy/static-export` | An alternative **static-export** build (one extra commit: `output: "export"`, `?id=` query-param URLs instead of dynamic segments, and no `proxy.ts`). **Not live.** It's kept as a fallback for pure static hosting and is about 30 commits behind. |

### Hosting (Hostinger "Deploy Web App")

- Node app hosting for `app.crestapp.ng`: Node 22.x, framework auto-detected as
  Next.js, root `./`, default build settings. SSL and CDN are handled by
  Hostinger.
- **To deploy:** push to the deployed branch, or click **Redeploy** in the
  Hostinger dashboard.
- **To roll back:** Hostinger → Deployments → pick an earlier commit →
  Redeploy, or `git revert` and push.
- **After any deploy,** smoke-test a real login. It confirms the env vars and
  backend CORS in one step.

> ### ⚠️ Keep npm. Never reintroduce pnpm.
> Hostinger hard-wired pnpm when the app was first created, and pnpm 10's
> build-script gate then failed every build (`ERR_PNPM_IGNORED_BUILDS` on
> `sharp`). The fix was to make the repo npm-only (`package-lock.json`,
> `packageManager: npm@…`, `.npmrc`) and re-point the app so Hostinger
> re-detected npm. **In the build log, `added N packages` means npm (good).
> `resolved… reused…` means pnpm is back**: re-create or re-point the app.
> Full story: `HANDOVER.md` §11.

---

## 12. What changed since HANDOVER.md was written

`HANDOVER.md` is dated 2026-07-26/27. Work continued until **2026-08-23**. The
changes below aren't fully reflected there:

- **Shortlet roles are live:** `shortlet_owner` (host) and `shortlet_user`
  (guest) appear in registration and the Profile role switch, and hosting is
  gated on `shortlet_owner`. Home and Search now have a **Shortlet tab** that
  routes to the dated shortlet search. This closes HANDOVER §5.7 concerns 1–2
  and §15 item 11.
- **Shortlet hosting:** listings can be **edited on the web**. Creation includes
  **document verification and media uploads**. Status handling was improved.
  The detail page has an **image gallery and lightbox**.
- **"Cleaning fee" was renamed "Caution fee"** throughout the shortlet UI. Read
  "cleaning fee" in HANDOVER §5 as "caution fee".
- **Amenities:** a shared picker (`components/ui/amenities-picker.tsx`) on both
  property and shortlet create/edit. The labels match the mobile app and the
  backend exactly (`PROPERTY_AMENITIES`).
- **Video upload and playback** for properties and shortlets.
- **KYC hardening:** wizard state persists to `sessionStorage` (survives a
  refresh), clearer errors when camera access is denied or the camera is
  missing, improved ID-upload layout and guidance, and a fix for horizontal
  overflow on mobile.
- **Payments:** the payment link opens without being popup-blocked.
- **Errors:** detailed error display for diagnostics (`app/error.tsx`).
- **Root route:** the old landing page was replaced by a dynamic redirect to
  `/home` or `/login`.
- **Transactions:** status display simplified and the "expected payouts" panel
  removed.

---

## 13. Where to continue: open work

Items are listed roughly by value. More detail is in `HANDOVER.md` §15 and
`docs/design-vs-backend-gaps.md`.

**Verify first (no code needed):**
1. Run **one real Flutterwave payment** through both an **offer** and a
   **shortlet booking**. Confirm the `pending → confirmed` transition, which
   depends on the backend webhook. Neither flow has been tested end to end
   with real money.
2. Confirm the backend CORS allow-list includes `https://app.crestapp.ng`.
3. Confirm with the backend which role is allowed to create a shortlet. The UI
   assumes `shortlet_owner`; if creation returns a 403, this is the cause.

**Blocked on the backend (frontend changes are small once the endpoint exists):**
4. **Owner bookings view.** There's no endpoint for hosts to see bookings on
   their own listings.
5. **Single booking GET.** The booking detail page currently finds its booking
   by scanning the polled `/shortlets/bookings/mine` list.
6. **Favourites endpoint.** Saved properties are localStorage-only and don't
   sync across devices.
7. **OTP delivery.** Codes are returned in API responses as a test-mode
   workaround. Once real SMS/email sending is live, **remove the auto-fill**.
   Leaking the code in the response is a security issue (see
   `docs/bug-report-csrf-and-otp-leak.md`).
8. **Websockets.** Messages, notifications and statuses use polling until then.
9. Fields the design needs but the API doesn't provide: seller-verification
   checklist, extra property features, notification digest tiers, fee
   timelines, editable email, legal and help pages. These are currently shown
   disabled.

**Frontend polish:**
10. **Messages:** self and other bubble alignment isn't fully finished
    (deferred by the client).
11. **Pixel fidelity:** only the auth flow was checked against Figma. Other
    screens were built from exported screenshots in `docs/design/screenshots/`.
12. **`KycGuard` has no call sites yet.** Wire it in when a flow should require
    approved KYC.
13. `src/proxy.ts` → `PROTECTED_PREFIXES` lists some routes that don't exist
    (`/contracts`, `/support`, `/notifications`, `/admin`, `/properties/mine`)
    and misses newer ones (`/search`, `/shortlets`, `/history`, `/saved`,
    `/offers`). `AuthGuard` still protects them, so this is cosmetic, but tidy
    the list for a faster server-side redirect.
14. Sentry: `NEXT_PUBLIC_SENTRY_DSN` is accepted but nothing reports errors to
    it yet.

**Product decision pending:**
15. **Role consolidation** ("everyone can do more"). Options A and B are written
    up in HANDOVER §5.7. Both are mostly backend work. The frontend needs a
    sale/rent toggle in the listing wizard and a smaller role picker.
16. **Admin dashboard** is a separate app and wasn't built here.

---

## 14. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Build or dev crashes with `Invalid environment variables` | `NEXT_PUBLIC_API_URL` is missing or invalid. Create `.env.local` from `.env.example`. |
| Every API call fails with a CORS error | The backend's `config/cors.php` doesn't allow your origin. Ask the backend team. |
| Logged out unexpectedly | Any 401 clears the session (token expired or revoked). Log in again. |
| Images don't render | Their host is missing from `images.remotePatterns` in `next.config.ts`, or the URL isn't going through `media-url.ts`. |
| OTP field doesn't auto-fill | Read the code from the send-OTP response in DevTools (test mode). |
| Shortlet "Add" returns 403 | The account doesn't have the role the backend requires. Switch role in Profile and confirm the required role with the backend. |
| Pending transaction can't be opened | Expected. The backend returns 422 `INVALID_TRANSACTION_STATE`, so the row shows "Pending". |
| Booking doesn't show on its detail page yet | Polling lag (15s). The page scans `/bookings/mine`. |
| Hostinger build fails with `ERR_PNPM_IGNORED_BUILDS` | Hostinger went back to pnpm. See the box in [§11](#11-branches-and-deployment). |
| App/API won't load on MTN (Nigeria) or another carrier | An IPv6 (AAAA) DNS problem, fixed on 2026-08-03 by moving DNS to Cloudflare. If it comes back, see `docs/mtn-ipv6-dns-fix.md`. |

---

## 15. Documentation index

| File | What it is |
|---|---|
| [`HANDOVER.md`](HANDOVER.md) | Formal handover: product, roles, journeys, hosting, integrations, sign-off |
| [`docs/design-vs-backend-gaps.md`](docs/design-vs-backend-gaps.md) | **Main debugging reference.** Every design-vs-API mismatch and the decision taken |
| [`docs/design/shortlet-implementation-plan.md`](docs/design/shortlet-implementation-plan.md) | Shortlet blueprint and endpoint reference |
| `docs/design/*-plan.md` | Per-area implementation plans (account creation, home, search/detail) |
| `docs/design/screenshots/` | Exported design screens per area (the visual spec) |
| [`docs/frontend-blueprint.md`](docs/frontend-blueprint.md) | Original architecture blueprint |
| `docs/api.md`, `docs/api-test.md` | API notes and manual API test log |
| `docs/figma-links.md`, `docs/design-fidelity-notes.md` | Figma pointers and fidelity notes |
| `docs/bug-report-csrf-and-otp-leak.md` | Backend bug report (CSRF on API routes, OTP leaked in responses) |
| `docs/handoff.md`, `docs/test.md`, `docs/uat/` | Earlier handoff notes, test notes, UAT scripts |
| `docs/mtn-ipv6-dns-fix.md` | MTN/IPv6 DNS outage writeup and the Cloudflare fix (resolved) |
| `*.postman_collection*.json` (root) | Backend API collections. Use `final-… (4).json` |

---

## 16. Repo housekeeping

A few files in the repo root are leftovers from development. They're harmless,
but they could be cleaned up or moved into `docs/`:

- `Handler.php`: a saved Laravel error response (CSRF token mismatch), kept as
  evidence for the bug report. It isn't code.
- `.scratch-home-design.txt`: scratch notes from the Home build.
- The two older Postman collections (`… (2).json`, `latest-….json`).
- `.codesight/`: config for a code-scanning tool.
