# Handoff — Crest App Frontend (Phase 0 + 1 + 2 complete → Phase 3 next)

> Written for a fresh agent (e.g. Codex) picking up this repo with no prior conversation context. Read this, then `docs/frontend-blueprint.md` (architecture) and `docs/design-vs-backend-gaps.md` (Figma-vs-API mismatches) before writing code.

## Repo state
- Branch: `feat/frontend-foundations`.
- Phase 0 (foundations) is committed and pushed. **Phases 1 (auth) and 2 (KYC) are implemented and verified but not yet committed** — check `git status` before assuming anything beyond Phase 0 is on `origin`.
- No test infra is set up **by explicit user instruction** — do not add Vitest/Playwright/MSW unless asked. Keep implementation straightforward, no over-engineering.
- **The Postman collection file was replaced mid-project.** The old `Crest-App-Laravel-API-Collection-postman_collection.json` was deleted; the current one is `Crest App Laravel API Collection.postman_collection (1).json` (note the spaces and `(1)` in the filename — the backend dev pushed an update after fixing an SMS bug). Always check which file currently exists before grepping.

## ⚠️ Two separate surfaces — don't conflate them
The Figma file has **3 top-level pages**: "Mobile & Web App" (client-facing — renters/buyers/agents/landlords; this is what Phases 0–6 build), "Dashboard" (a **separate admin/owner persona** for Crest staff; deferred to Phase 7, not started, not yet inspected screen-by-screen), and "Logo Branding" (not yet inspected — likely resolves the design-token `TODO`s in `globals.css`).

The route group `src/app/(client)/` is the **authed client-app shell** — NOT the admin Dashboard, which will live under nested `/admin/*` routes in Phase 7.

## Read first
1. `docs/frontend-blueprint.md` — full architecture doc (19 sections + checklist).
2. `docs/design-vs-backend-gaps.md` — **running log of every Figma-vs-API mismatch found, organized by phase.** Update this at the end of every phase — that's an explicit standing instruction from the user, not optional.
3. `Crest App Laravel API Collection.postman_collection (1).json` (repo root, see filename note above) — the backend API contract. Treat it as authoritative over any assumption, but see the next point.
4. **The backend is not actually frozen — it's being actively patched.** Originally described as "complete," but a live bug (see below) was found and the backend dev has already pushed at least one fix + a new Postman export. Don't assume the collection is 100% accurate; verify anything suspicious with a live `curl` against `https://api.crestapp.ng` before building against it.
5. `docs/bug-report-csrf-and-otp-leak.md` — two live backend bugs found and reported (see below). Check whether these are marked fixed before assuming any real (non-`curl`) browser flow works end-to-end.
6. `docs/figma-links.md` — Figma frame links per flow. File key: `GQO1uIkdHaiFCXHdsD5KuE`. **Figma MCP rate limit was hit on the Starter plan mid-Phase-1** — if you have Figma access, check quota before relying on it; prefer text/metadata already captured in this repo's history (blueprint, gaps doc) over re-fetching.

## 🔴 Known live backend bugs — check status before trusting live testing
Full detail and exact repro `curl` commands in `docs/bug-report-csrf-and-otp-leak.md`. Summary:
1. **CSRF blocks every browser request.** Someone added the frontend's origin(s) to Laravel Sanctum's `SANCTUM_STATEFUL_DOMAINS`, which flips matching-`Origin` requests into cookie/session+CSRF mode — incompatible with this app's stateless Bearer-token architecture. Confirmed via a single-variable `curl` test (identical request, only difference is an `Origin: http://localhost:3000` header → `200` becomes `419`). **As of Phase 2, status unknown — re-verify before assuming any full browser flow (register, login, KYC submit) actually works end-to-end.** `curl` without an `Origin` header will misleadingly "work" even if this bug is still present — it doesn't reproduce the bug.
2. **OTP code leaked in the API response.** `POST /api/auth/verification/send` was returning the actual OTP code directly in the JSON body (`{"message": "...", "code": "286793"}`), completely defeating verification. Reported, fix status unknown — re-verify.

Because of (1), **Phase 2 (KYC) has not been live-tested through a real browser** — it's built and typechecks/builds/lints clean, but the actual `kyc/submit` + file-upload round trip has not been confirmed against the live API from an actual page load.

## Three confirmed architectural decisions (non-negotiable, already reflected in the blueprint)
1. **Auth token is client-stored**, browser calls Laravel directly — no BFF/proxy server tier. Token comes back as a raw string in the JSON body (Sanctum-style `access_token`, NOT a `Set-Cookie` header). Manually persisted into a JS-readable cookie (`src/lib/auth/token.ts`) purely as storage — not a real httpOnly session cookie.
2. **Hybrid rendering with a hard line**: Server Components may ONLY fetch public/unauthenticated Laravel endpoints. Anything requiring `Authorization` must be fetched client-side via TanStack Query. Never fetch authed data in an RSC.
3. **shadcn/ui** (Radix + Tailwind v4, `new-york` style, `slate` base) for the component system, owned in-repo.

## ⚠️ Next 16 gotcha hit during Phase 1 — read this before touching `proxy.ts`
**`proxy.ts` must live inside `src/`, at `src/proxy.ts` — NOT at the project root**, because `src/app` is the app directory (Next 16 docs: proxy must sit "at the same level as `app`"). It was initially placed at the repo root; it silently failed (no compile log entry, no redirects, plain 404s, no error thrown). Fixed by moving to `src/proxy.ts` — confirmed via `ƒ Proxy (Middleware)` appearing in the build output, and live `curl` redirect tests in both directions. If you ever restructure `src/`, re-verify this.

## ⚠️ TypeScript gotcha hit during Phase 2 — `Json` type in `apiClient`
`src/lib/api/client.ts`'s request body type was originally `type Json = Record<string, unknown> | unknown[]`. Hand-declared `interface` payloads (like `KycSubmitPayload`) don't structurally satisfy an index-signature type the way `z.infer`'d type aliases do — this threw a real typecheck error the moment a feature used a plain `interface` for its payload instead of a Zod-inferred type. Fixed by changing it to `type Json = object` (any non-primitive value; the runtime `isPlainJsonBody` guard already filters out `FormData`/`Blob`/etc., so no behavior changed, just the type). If you add a new feature's `api.ts` and hit `"Index signature for type 'string' is missing"`, this is already fixed — you shouldn't hit it again, but now you know why if you do elsewhere.

## What's implemented

### Phase 0 — Foundations
```
src/
  app/
    layout.tsx / page.tsx / loading.tsx / error.tsx / global-error.tsx / not-found.tsx
    (auth)/layout.tsx       # guest-only centered card shell
    (onboarding)/layout.tsx # wrapped in <AuthGuard> — KYC wizard lives here (Phase 2, below)
    (client)/layout.tsx     # wrapped in <AuthGuard> — real AppShell (sidebar/topbar) still TODO
  config/constants.ts / env.ts
  lib/api/{client,errors,query-keys}.ts, lib/query/{query-client,providers}.tsx, lib/utils/*
  types/api.ts
proxy.ts (actually src/proxy.ts — see gotcha above)
next.config.ts, .env.example / .env.local
```
Design tokens live directly in `src/app/globals.css` (no separate token files). Confidently derived: primary navy `#061D52`, font Inter, foreground `#111827`, muted text `#666`, surface `#f9f9f9`, radius `0.75rem`. Several values are marked `TODO` (inferred, not observed) — secondary/accent tint, exact success green, destructive/border colors, all dark-mode values.

### Phase 1 — Auth
```
src/features/auth/       # types, schema, api, store (session), wizard-store (register), hooks, use-auth, components/verify-code-form.tsx, index.ts
src/components/guards/   # auth-guard, role-gate, kyc-guard, verified-gate, index.ts
src/app/(auth)/
  login/, forgot-password/, reset-password/
  register/, register/verify-email/, register/phone/, register/verify-phone/, register/password/
```
5-step register wizard: personal info → verify email (OTP) → phone → verify phone (OTP) → create password (submits `POST /api/auth/register`, which has **no `access_token`** in its response — redirects to `/login`, does not auto-authenticate).

### Phase 2 — KYC (this session)
```
src/features/kyc/
  types.ts          # KYC_DOCUMENT_TYPES (only "national_id" confirmed, other 2 inferred), KycSubmitPayload, FileUploadResponse (undocumented shape)
  schema.ts          # idDocumentSchema (doc type/number/front/back File), selfieSchema
  api.ts              # kycApi.uploadFile() with parseUploadUrl() defensive multi-field parser (throws loudly if no known field matches), kycApi.submit()
  hooks.ts             # useUploadFile, useSubmitKyc
  wizard-store.ts       # useKycWizardStore (Zustand, in-memory) — accumulates doc info + uploaded URLs across steps
  components/file-upload-field.tsx  # shared upload-on-select field (click-to-browse, not real drag-and-drop); supports optional `capture="user"` for the selfie step (opens native mobile camera app — NOT a live getUserMedia preview)
  index.ts

src/app/(onboarding)/kyc/
  page.tsx           # intro screen ("Let's verify your account") -> /kyc/id
  id/page.tsx         # doc type tabs, cosmetic country field (not wired — see gaps doc), document number input (added, not in Figma), front/back upload -> /kyc/selfie
  selfie/page.tsx      # selfie upload (guards: redirects to /kyc/id if front upload missing) -> /kyc/processing
  processing/page.tsx   # guards: redirects to /kyc/selfie if selfie missing; calls kyc.submit() once on mount (ref-guarded against double-fire); shows spinner -> success card -> "Continue" resets wizard and pushes to /home
```
Every KYC gap (missing document-number field, cosmetic country field, undocumented upload/submit response shapes, no live camera) is detailed in `docs/design-vs-backend-gaps.md` — don't re-derive, read that file.

Installed shadcn primitives (Phase 1 + 2 combined): `button`, `input`, `label`, `card`, `input-otp`, `form`. No new primitives needed for KYC (used `lucide-react` icons directly).

### Phase 2.5 — Post-Phase-2 bugfixes (live testing after the backend's CSRF/OTP fix)
Once the backend fix landed, live testing surfaced three real issues, all now fixed:
1. **Register→login race, fixed.** `register/password/page.tsx`'s guard `useEffect` was reactive to `wizard.phoneVerified`; its own `onSuccess` called `wizard.reset()` (flips that field back to `false`) in the same render pass as `router.push("/login")`, re-triggering the guard and racing `router.replace("/register")` against the intended navigation. Fixed by making the guard mount-only (`useEffect(..., [])`), mirroring the identical pre-existing pattern in `kyc/processing/page.tsx`. Scoped to this one file — the other 4 wizard steps never call `reset()`, so their reactive guards are untouched and correct.
2. **`/dashboard` → `/home` rename, and it's load-bearing, not cosmetic.** `src/app/(client)/` had only a `layout.tsx` — `/dashboard` didn't exist, so every redirect to it (`proxy.ts`, login's default `nextPath`, KYC completion) 404'd. Renamed to `/home` everywhere (`src/proxy.ts` ×2, `login/page.tsx`, `kyc/processing/page.tsx`, plus 3 doc references) — backed by the actual Figma frame named "Home" (`docs/figma-links.md`, node `1411-2864`). **"Dashboard" is now reserved exclusively for the separate admin persona (`/admin/*`, Phase 7)** — this was an explicit prior architectural decision, and the rename closes a gap where the literal path still said `/dashboard` even after the route group itself was renamed to `(client)`.
3. **KYC made skippable with a persistent reminder.** New `useMyKycStatus()` hook (`src/features/kyc/hooks.ts`, using the previously-unused `queryKeys.kyc.mine`) calls a new `kycApi.findSingle()` (`POST /api/kyc/find-single`, self-lookup), parsed defensively via `parseKycStatus()` — which, unlike `parseUploadUrl()`, never throws; an unparseable/missing shape safely falls back to "not approved" (show the reminder), since that's lower-risk than hiding a real one. New `KycReminderCard` (`src/features/kyc/components/`) renders on the new `src/app/(client)/home/page.tsx` placeholder, styled to match `KycGuard`'s existing fallback CTA. `KycGuard` itself was left prop-driven (zero real call sites yet) — only its doc comment updated to point at the new hook.

**Two open risks, not yet resolved — verify live before trusting this fully:**
- The Postman collection's only `find-single` example (even with `include_kyc: "true"`) contains `user` + `profile` and **no `kyc` field at all** — unconfirmed whether the backend actually returns KYC status this way.
- Unconfirmed whether a **non-admin user is even authorized** to call `find-single` about themselves — may 403 in practice. Needs a live `curl` test with a real non-admin Bearer token.

`src/app/(client)/home/page.tsx` is a **tightly-scoped placeholder** (welcome heading + reminder card only) — not the real Home screen (property feed/search, Figma node `1411-2864`), which is genuine Phase 3 scope.

### Phase 2.5b — `useAuth` race condition (found via live testing on `/kyc`, fixed)
After deploying the above, the user reported: clicking into KYC (or typing `/kyc` directly) auto-redirected back to `/home`. Root cause, confirmed via DevTools Network tab evidence (`GET /api/user` → `200`, ruling out an actual auth failure) plus code tracing:

`useAuth()`'s `isLoading` was computed as `hasToken && !isFetched && isFetching`. On the very first render of a fresh page load, there's a real gap where `isFetching` is still `false` — TanStack Query's internal effect hasn't started the fetch yet — so `isLoading` momentarily evaluates to `false` while `isAuthenticated` is also still `false` (session status starts at `"idle"`). `AuthGuard`'s redirect effect can win that race and fire `router.replace('/login?next=%2Fkyc')` **before `/api/user` is even called**. That's a client-side transition, which re-hits `proxy.ts` for `/login` — which correctly sees the still-valid real cookie and bounces guest-only routes back to `/home` (its own correct, unrelated logic). Two individually-"correct" redirects compound into a confusing loop. Happens identically via link-click or typed URL because both are fresh page loads, and the race exists on every fresh mount.

**First fix (partial):** `src/features/auth/use-auth.ts` — swapped to TanStack Query's `isPending` (true continuously from mount until the query actually settles) instead of `!isFetched && isFetching`. This closed the gap on the *first* render, but left a **second, distinct race** open: `isPending` flips to `false` the instant `/api/user`'s data arrives, but the Zustand store's `status` field (which `isAuthenticated` actually reads) only updates inside a `useEffect` that runs **after** that render commits — so there's one render where the query has resolved but the store hasn't caught up, and `AuthGuard` can still fire a false redirect in that window.

**Second fix (the one that actually closed it, found via GitHub Copilot):** `isLoading: hasToken && (status === "idle" || isPending)` — keeps loading `true` until the Zustand store itself has left its initial `"idle"` state, not just until the query settles. This covers both gaps. Confirmed via `git diff` against the already-committed first fix. Worth knowing for later: this works around a slightly fragile pattern (auth state duplicated across the query result and a Zustand mirror, synced via effect, so inherently one render behind) rather than eliminating it — not urgent to refactor now, but if this file needs touching again, deriving `isAuthenticated` directly from the query instead of a separately-synced store would remove this whole class of race permanently.

**Also fixed in the same debugging chain** (three separate real bugs, each unmasked only after fixing the one blocking it):
1. `POST /api/kyc/find-single` — `419` CSRF error → backend fixed.
2. Then `422 { "errors": { "include_kyc": ["...must be true or false"] } }` — Laravel's `boolean` rule rejects the literal string `"true"` shown in the Postman example. Fixed: `kycApi.findSingle()` now sends `include_kyc: true` (real boolean), not the string.
3. Then `"Query data cannot be undefined"` (TanStack Query forbids a queryFn resolving with `undefined`) — `parseKycStatus()`'s safe-fallback returned `undefined`. Fixed: returns `null` instead (valid data; only `undefined` is banned). This also finally confirmed, after two blockers were removed, that the response genuinely has no usable `kyc` field.

**Verified:** `pnpm typecheck`, `pnpm build`, `pnpm lint` all clean after every fix in this chain. The user reported Copilot's second fix "worked once" in manual testing — promising, but not yet confirmed via the same rigorous Network-tab method used earlier in this debugging session. Re-verify with that method before fully trusting it, and specifically retest the same flow more than once (a fix that works "once" needs to be confirmed as reliably reproducible, not just non-failing on a single attempt).

### Phase 2.5c — File upload endpoint switched: `/api/platform/files/upload` → `/api/documents/upload`
Live-tested via `curl -i`: `POST /api/platform/files/upload` returns `200 OK` with a **completely empty body** (`Content-Length: 0`, `Content-Type: text/html` — not JSON). Confirmed by the backend dev as broken. Checking the Postman collection programmatically showed **every** endpoint in the "File Storage" section has an empty `"response": []` — none were ever actually exercised by whoever built the collection.

Per the project owner's direction, KYC uploads now go through the Legal Documents system instead: `POST /api/documents/upload` (fields: `document_file`, `title`, `document_type`, `description` — all required except `title`/`description` per validation, different shape entirely from the old `file`/`purpose` fields). This endpoint **does** have a real, confirmed Postman example (`201 Created`, real JSON body).

**Two things deliberately flagged as inferences, not silently guessed:**
1. **`document_type: "certificate"`** — the required enum (`agreement/contract/disclosure/certificate/report`) has no value that means "government ID" or "selfie". Used for all three KYC uploads (front/back/selfie) as the least-bad fit. Confirm with backend/product before shipping.
2. **The response has no URL field in the documented example.** `data: { document_id, document_uuid, document_type, title, status, uploaded_at, file_size }` — no `url`. The separate `GET /api/documents/{id}` response does have `download_url`, but it's `null` in the one example available. **UPDATE — resolved via live testing**: all three KYC uploads (front/back/selfie) returned real, working `download_url`s in practice (visible directly in the `kyc/submit` request payload: `https://api.crestapp.ng/api/download/...`). The stale Postman example was misleading; `parseDocumentUrl()`'s throw-loudly path never fired. No longer an open risk.

Also fixed in passing: the KYC ID page previously passed `purpose="kyc_document"` for **both** front and back uploads (no distinction) — now `kyc_document_front`/`kyc_document_back`, so the derived `title` sent to the backend is actually meaningful.

**Verified:** `pnpm typecheck`, `pnpm build`, `pnpm lint` all clean.

### Phase 2.5d — `kyc/submit` also needs an undocumented `requester_id` field
Once uploads were confirmed working, the actual `POST /api/kyc/submit` call still failed: `422 { "errors": { "requester_id": ["The requester id field is required."] } }`. The Postman collection's example payload for this endpoint has no `requester_id` at all — same undocumented-field pattern as everywhere else with this backend. Mirrors `kyc/find-single`'s `requester_id`, which means "the authenticated user's own `user_id`" for self-submission.

**Fix:** added `requester_id: ID` to `KycSubmitPayload` (`src/features/kyc/types.ts`). `src/app/(onboarding)/kyc/processing/page.tsx` now reads `user_id` from `useSessionStore` and includes it in both the initial submit call and the "Try again" retry button. The submit effect's dependency array changed from mount-only (`[]`) to `[userId]`, since session hydration can resolve after this page mounts — this is a genuine dependency, not the same class of race fixed in Phase 2.5b (no `reset()`-triggered re-fire risk here, since `hasSubmitted` still guards against a second real submission).

**Verified:** `pnpm typecheck`, `pnpm build`, `pnpm lint` all clean. **Not yet confirmed** whether this was the *last* undocumented required field — worth watching for another `422` on the next full live test before assuming the KYC submission flow is fully working end-to-end.

## Verified Next.js 16.2.10 / React 19.2.4 facts (checked against `node_modules/next/dist/docs`, re-verify if the installed version changes)
- `middleware.ts` → **`proxy.ts`**, exported function name `proxy`, Node runtime only. **Must live in `src/` if `app` is in `src/`.**
- `cookies()`, `headers()`, `params`, `searchParams` are **async** — always `await`.
- Turbopack is the default dev/build compiler.
- `next lint` is removed — ESLint CLI directly (`pnpm lint`).
- `serverRuntimeConfig`/`publicRuntimeConfig` removed — env vars only.
- React Compiler is off, but `eslint-plugin-react-hooks`'s compiler-compat rule still runs — prefer `useWatch({ control, name })` over `form.watch()` from react-hook-form.

## Backend coverage facts (from the Postman collection — don't re-derive, but see "backend is not frozen" warning above)
- Full **client-user-facing API is complete** on paper: auth, profile, KYC, properties, contracts (quick-create is canonical — `Depreciated/Transaction Management` is superseded), payments, messaging + blocking, support/fraud, legal docs + e-signatures, notifications, platform config, file storage.
- **Admin dashboard partially covered**: KYC approval, verification queue, contract admin module exist. Missing: general user management, admin property moderation, admin support desk, single dashboard-overview endpoint. User directory achievable via `find-users-admin` (KYC-scoped, not a general directory).
- **No token refresh endpoint** — 7-day token expires; plan re-login. `apiClient` clears the session cookie on any `401`.
- No single `GET /properties/{id}` — fetch via `search` with an `id` filter.
- Messaging is REST-only (no websocket) — real-time chat means polling.
- Several endpoints (`verification/send` for phone, `kyc/submit`, `platform/files/upload`, `platform/configuration/countries`) have **zero documented example responses** in the collection — see `docs/design-vs-backend-gaps.md` for how each was handled.

## Verification performed this session

**Phase 1+2 (original):**
- `pnpm typecheck` — clean (after fixing the `Json` type gotcha above).
- `pnpm build` — clean, 13 routes total (9 from Phase 1 + 4 new KYC routes), correct static/dynamic split, `ƒ Proxy (Middleware)` present.
- `pnpm lint` — clean, 0 warnings.
- **Not done then**: no live browser test of the KYC submit flow, because of the known CSRF bug (see above) — `curl` without an `Origin` header would give a false-positive "it works" result, so it wasn't used to claim success.

**Phase 2.5 (this session, after the backend's CSRF/OTP fix landed):**
- `pnpm typecheck`, `pnpm build` (17 routes now, `/home` present, no `/dashboard`, `ƒ Proxy (Middleware)` present), `pnpm lint` — all clean.
- `grep -rn "/dashboard" src docs` — zero live references remain; the only 2 remaining matches in `docs/` are historical descriptions of the bug itself (correct, not missed occurrences).
- **Live proxy redirect test, actually run against a running dev server**: `/home` with no cookie → `307` to `/login?next=%2Fhome`; `/login` with a cookie present → `307` to `/home`. Both confirmed.
- **⚠️ Gotcha re-encountered**: the first test attempt gave a false negative (plain `200`, no redirect at all) because the dev server running at the time was started *before* the `proxy.ts` edit — proxy/middleware changes are not hot-reloaded the way page files are; a full server restart was required. This bit us in Phase 1 too (see the `proxy.ts`-must-live-in-`src/` gotcha above) — **whenever `proxy.ts` changes, always restart the dev server before testing, don't trust an already-running instance.**
- **Not done this session**: `find-single` was not live-curl-tested with a real Bearer token (would require creating/using a real account — a live side-effect not taken without asking). This is the single most important remaining verification — see Phase 2.5 open risks above.

## Immediate next step
**Phase 3 — Public property surface (RSC)** per the blueprint roadmap: property search with filters (URL state) and listing detail, rendered via Server Components hitting `publicFetch` (unauthenticated `/api/properties/search`) — this is the first real test of the RSC/public-vs-authed hard line described in architectural decision #2. Figma: Home, Search Property, Listing for sale.

**Before starting, two things worth doing:**
1. A full live browser walkthrough of register → verify → login → KYC → `/home` (none of it has been end-to-end browser-verified yet — only individual pieces via `curl`).
2. `curl` `POST /api/kyc/find-single` with a real non-admin Bearer token to resolve the two open Phase 2.5 risks (real `kyc` field shape, self-lookup authorization) — update `parseKycStatus()` and `docs/design-vs-backend-gaps.md` with whatever is found.
