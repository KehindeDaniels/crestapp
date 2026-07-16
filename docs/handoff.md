# Handoff — Crest App Frontend (Phase 0 + 1 + 2 + 4 (Home) complete, Phase 5 (Search + Listing Detail) done)

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

### Phase 2.5e — KYC resubmission gate, Figma file switch, Admin Panel discovery
1. **KYC is now gated by real status.** The next `422` after the fix above was `"You already have a pending KYC submission"` — and the Postman collection confirms this is by design: `POST /api/admin/kyc/{id}/request-resubmission` exists as a distinct admin action, meaning resubmission is admin-mediated, not user-triggered. Added `src/app/(onboarding)/kyc/layout.tsx`, which calls `useMyKycStatus()` and blocks the entire `/kyc/*` wizard (status screen + "Back to Home") whenever status is `pending`/`under_review`/`approved`; only `null`/`rejected` allow entry. The `rejected`-allows-resubmission assumption is a reasonable default, **not confirmed** — flagged in `docs/design-vs-backend-gaps.md`. Also added a defense-in-depth fallback in `kyc/processing/page.tsx` in case this error surfaces despite the gate.
2. **Figma links updated to a new file.** `docs/figma-links.md` now points to `Crest-App` (key `MSrs3Woe4rF8yM8PVYRYSa`), replacing the old working file, whose slug was literally `Crest-App--Copy-` — we'd been working off a copy. Node IDs for already-built screens are identical between the two files, so nothing built so far is invalidated, but treat the new file as canonical going forward. It also includes **6 new screens** not previously provided: 5 listing-type variants (apartment/land × sale/rent, plus Airbnb) and a "History" screen — relevant to Phase 4/5-6, worth inspecting before those phases start.
3. **Major discovery, not yet acted on**: this Postman export also added a full **"Admin Panel" section** (~80 endpoints: user management, property moderation, a real admin dashboard, disputes, payments, fraud reports, admin auth) that resolves most of what `docs/frontend-blueprint.md` §17 previously flagged as missing for Phase 7. Every endpoint in it has an empty Postman example though — routes likely exist, behavior is completely unverified. Don't build against it without live-testing each one first, same discipline as everything else this session. Full detail in `docs/design-vs-backend-gaps.md`.

**Verified:** `pnpm typecheck`, `pnpm build`, `pnpm lint` all clean (note: hit the same stale `.next/dev/types` issue as the original `proxy.ts` gotcha when adding the new nested layout — `rm -rf .next/types` resolved it; if a new layout/page ever causes a phantom typecheck error referencing `.next/dev/types/validator.ts`, this is why).

### Phase 2.6 — Auth UI polish (pixel-perfect pass, in progress)
The auth screens (login + 5-step register wizard) were functionally correct but generically styled since Phase 1 — a deliberate "functionality first, then one polish pass" tradeoff. This pass rebuilds them **pixel-perfect** against real Figma data (file `aDI3HOS6NVQWnLdIx5Zvif`), starting with Login/Welcome since it's the shared-infrastructure screen every other auth screen will consume. Full blueprint: `docs/design/account-creation-pixel-perfect-plan.md`. Visual-fidelity decisions (flattened assets, inferred breakpoints, token splits): `docs/design-fidelity-notes.md`.

**Done so far:**
1. **Assets** downloaded permanently to `public/images/auth/{shared,login}/` (logo lockup + background, both flattened to single images per user-approved decisions; house illustration, hide icon, Google icon, divider line) — no code references the expiring Figma CDN.
2. **DM Sans** added (`src/app/layout.tsx`, weight 700 only) alongside the existing Inter, exposed as `--font-heading`.
3. **New design tokens** in `globals.css`: `--auth-heading` (scoped, doesn't touch `--foreground`), `--input-background`, `--input-placeholder`, `--button-border`; `--input` corrected from a placeholder gray to the confirmed `rgba(102,102,102,0.16)` (global change, not auth-scoped).
4. **`size="xl"`** (54px) added to `button.tsx` and a new `cva`-based `input.tsx` (previously a plain function, no variants).
5. **New `src/components/ui/password-input.tsx`** — real show/hide toggle, a functional addition riding along with the visual pass (previous password fields had none). Real Figma icon for the "hidden" state, `lucide-react` fallback for "shown" (no matching asset was designed).
6. **New `src/features/auth/components/auth-marketing-panel.tsx`** — the navy left panel: flattened background image, house illustration, 3-slide auto-rotating headline/subheading carousel (local `useState`/`setInterval`, no new dependency), 3-dot indicator. Slide 1 copy confirmed via Figma; slides 2/3 subheadings are placeholders pending a real design pull — flagged in `docs/design-fidelity-notes.md`.
7. **`(auth)/layout.tsx`** restructured from a centered card to the real split-screen shell (marketing panel + 379px form column + shared logo lockup) — applies to every guest-only auth route including `forgot-password`/`reset-password`, which haven't been pixel-verified individually yet.
8. **`login-form.tsx`** rebuilt against the confirmed Figma spec: heading/subtext copy and colors, `size="xl"` fields, real password toggle, forgot-password link repositioned below the button (matches Figma's grouping, not the old next-to-label placement), pixel-matched divider using the real exported line SVG, disabled Google button styled to spec.

**Verified:** `pnpm typecheck`, `pnpm build`, `pnpm lint` all clean (lint has 4 pre-existing-pattern `<img>`-vs-`next/image` warnings on the new files, not errors — acceptable for static local assets, not fixed). **Not yet done:** a live visual side-by-side against the Figma screenshot — no browser/screenshot tool is available in this environment to self-verify pixel fidelity; needs a manual check at `/login` in a real browser before calling this screen done.

**Not yet started (see the plan doc's rollout order):** `VerifyCodeForm` restyle, Create Account, Phone Number, Create Password (+ `PasswordInput` integration), new "After Creating" confirmation screen (replaces the current silent toast+redirect in `register/password/page.tsx`), then a `forgot-password`/`reset-password` follow-on pass. Also explicitly out of scope for this pass: a "Complete Profile / Select Role" post-login step — a real functional gap discovered via Postman (`POST /api/auth/register` returns no access token, so any profile/role step must happen after login, not immediately after registration) but no Figma design exists for it yet.

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

### Phase 2.7 — Onboarding flow adjustment: role picker relocated, new post-login `/welcome` screen
A user-provided screenshot (`docs/design/screenshots/after account creation.png`) surfaced a screen not previously known about: shown once, after the user's *first successful login following registration* (not immediately after registration, since `POST /api/auth/register` returns no access token). It combines a "Congratulations" banner, a "What describes you best?" role picker, an "Onboarding Process" tracker (Account Creation done, KYC pending), and a "Continue" button.

Investigated against the Postman collection before implementing (per explicit request) — found the role picker's options (`Buyer/Renter/Property Owner/Short-Let`) don't cleanly map onto the backend's real `role` enum (`landlord/tenant/seller/buyer/lawyer/surveyor/admin`), and more importantly **there's no self-service endpoint for a user to set their own role after login** (`PUT /api/profile` excludes `role`; the only role-update endpoint is admin-only). Full writeup: `docs/design-vs-backend-gaps.md` (Phase 3 section).

Per product decision, the fix was to **relocate role selection into the registration wizard** rather than build UI against a nonexistent endpoint:
1. **New step `/register/role`** (`src/app/(auth)/register/role/page.tsx`), inserted between phone verification and Create Password. Single-select (backend `role` is a scalar enum, not an array) rendered as checkbox-style squares matching the Figma visual. Options: Buyer→`buyer`, Renter→`tenant`, Property Owner→`landlord`. **"Short-Let" was dropped** — no backend equivalent exists.
2. **Wizard order is now 6 steps**, not 5: `/register → verify-email → phone → verify-phone → role → password`. `useRegisterWizardStore` gained a `role: UserRole | null` field + `setRole`. `register/password/page.tsx`'s guard now also checks `wizard.role`, and its submit sends the real selected role instead of the old hardcoded `"tenant"` placeholder.
3. **`auth-marketing-panel.tsx`** updated: `/register/role` added to `SLIDE_INDEX_BY_PATH` (slide 0, same as its neighbors) and to `WIZARD_STEPS` (now 6 dots instead of 5, tracking the real step count — see Phase 2.6's dots-reflect-process-count change).
4. **New `/welcome` screen** (`src/app/(onboarding)/welcome/page.tsx`, under the existing `AuthGuard`-wrapped `(onboarding)` layout, added to `proxy.ts`'s `PROTECTED_PREFIXES`) — the post-login screen itself, minus the role picker (moved to registration, see above). Shows the congrats banner, an onboarding tracker reusing `useMyKycStatus()` (Account Creation always shown done; KYC Verification shows "Go now" → `/kyc` or "Completed"), and "Continue" → `/home`.
5. **"First login after registration" detection**: no backend flag exists for this (`GET /api/user`'s example response is empty — undocumented, and no `onboarding_completed`-style field appears anywhere in the collection). Used a same-tab `sessionStorage` flag (`crest:just-registered`) instead: set in `register/password/page.tsx` right before its redirect to `/login`, consumed by `login-form.tsx`'s next successful login to redirect to `/welcome` instead of the normal target. **Known limitation, accepted**: this doesn't survive closing the tab or logging in from a different device — those users land on `/home` directly and never see `/welcome`, but `KycReminderCard` on Home already provides a fallback nudge toward KYC regardless.
6. The pre-login "After Creating" confirmation screen (Figma node `1398-9807`, shown immediately after register submit, before login) is a **separate, still-unbuilt** screen — not touched by this work, still tracked in `docs/design/account-creation-pixel-perfect-plan.md` §7. `register/password/page.tsx` still does its original silent toast + redirect to `/login`.

`/welcome` was built from the screenshot directly, not a Figma node pull (no node ID was available for it) — colors/spacing approximated using existing design tokens (`--primary`, `--success`), not exact hex values read off the image. `/register/role` similarly has no dedicated Figma frame (the checkbox UI only ever existed inside the post-login screen's design) — styled to match its still-unbuilt sibling steps (`/register`, `/register/phone`) rather than fabricating pixel-perfect values with no design backing.

**Verified:** `pnpm typecheck`, `pnpm build` (19 routes now: `/register/role` and `/welcome` both present, `ƒ Proxy (Middleware)` present), `pnpm lint` — all clean. **Not yet done:** no live browser walkthrough of the full register→role→password→login→welcome→kyc chain (same caveat as every phase before it — see "Immediate next step" below, already tracked as outstanding).

### Phase 3 (KYC) — selfie step: file picker replaced with live camera capture
Ahead of the KYC pixel-perfect pass, changed the selfie step's mechanism per explicit request: new screenshots (`docs/design/screenshots/kyc/Take a Selfie.png`, `Scanning.png`) confirmed Figma shows a real in-app camera viewfinder, not a file picker. New `SelfieCapture` component (`src/features/kyc/components/selfie-capture.tsx`, exported from `src/features/kyc/index.ts`) replaces `FileUploadField` on `kyc/selfie/page.tsx`: live `getUserMedia` video preview (front camera, CSS-mirrored preview only — the captured frame itself is unmirrored) → Capture → frozen preview with Retake/Use Photo → uploads via the same pre-existing `useUploadFile()` mutation (no API/backend changes). Falls back to the original `FileUploadField` only for unsupported browsers or a denied/failed `getUserMedia` call, per explicit scope. Full reasoning and tradeoffs: `docs/design-vs-backend-gaps.md` (Phase 3 — KYC selfie section). The Figma "Scanning" state's corner-bracket/scan-line/progress animation is not built — deliberately deferred to the KYC pixel-perfect pass.

**Verified:** `pnpm typecheck`, `pnpm lint`, `pnpm build` (20 routes, unchanged route list — this only touched a component, no new routes) all clean. **Not yet done:** no live browser test of camera permission grant/deny/unsupported paths (would need real device/browser testing, not something verifiable via `curl` or a build check).

### Phase 3 (KYC) — processing-page gate bug, found via the first fully-working live submit
The camera-capture change above led to the first-ever live end-to-end test of `kyc/submit` — it actually succeeded (`201`, real `kyc_id: 7` created). But the UI got stuck on "Hold still, we are processing" forever, and a second `kyc/submit` call then 400'd.

Root cause: `(onboarding)/kyc/layout.tsx`'s "block re-entry once submitted" gate was wrapping `/kyc/processing` too — the one page that's *supposed* to show right after a successful submission. Once the submission succeeded and the gate's status query refetched (picking up the new real `"pending"` status), it swapped the processing page's success UI out for its own "Verification in progress" screen mid-render, killing the mutation's UI state. Navigating back then remounted the processing page fresh, re-firing the submit and hitting the real "already pending" rejection.

**Fix**: restructured `src/app/(onboarding)/kyc/` — moved the gated screens (intro, upload ID, selfie) into a new `(wizard)` route group with the gate's `layout.tsx`; `/kyc/processing` now sits outside it, ungated. URLs unchanged (route groups don't affect paths) — confirmed via `pnpm build`'s route list. Also hardened `parseDocumentUrl()` (`src/features/kyc/api.ts`) to validate the uploaded document URL actually looks like a URL, not just that it's truthy — the same live test showed `"96"`/`"97"`/`"98"` (looks like bare `document_id`s) echoed back where real URLs were expected, previously would have passed through silently. And `useSubmitKyc()` now invalidates `["kyc","mine"]` on success so `KycReminderCard` doesn't show stale "not verified" for up to 60s. Full writeup: `docs/design-vs-backend-gaps.md` (Phase 3 — KYC processing gate bug).

**Verified:** `pnpm typecheck` (after clearing the stale `.next/types` cache — same gotcha as every prior route-structure change this session), `pnpm lint`, `pnpm build` — all clean, route list unchanged. **Still open**: whether `/api/documents/upload`'s raw `download_url` is really a bare number or a full URL wasn't independently confirmed — the hardened validation will now throw loudly and surface this clearly the next time it's tested live, rather than silently corrupting a submission.

### Phase 3 (KYC) — submission state moved to the store, not just a routing fix
The routing fix above (moving gated screens into `kyc/(wizard)/`) turned out to be necessary but not sufficient — a follow-up live test hit the exact same "request completed, no UI" symptom via a genuine `400`, not the duplicate-submission case the routing fix addressed. Root cause was architectural, not a single bug: `kyc/processing/page.tsx` relied on `useSubmitKyc()`'s local, component-scoped `isPending`/`isSuccess`/`isError` — if the component unmounts for *any* reason while the request is in flight (confirmed one other trigger: `AuthGuard` in `(onboarding)/layout.tsx` renders `null` whenever `useAuth()`'s `isLoading`/`isAuthenticated` flips, even transiently, e.g. during a background `/api/user` refetch), the request still completes on the network but nothing is left mounted to render the outcome.

Rather than chase down every possible unmount trigger individually, moved the submission outcome into `useKycWizardStore` (`submissionStatus`, `submissionError` — see the store's updated doc comment for the full reasoning). The mutation's `onSuccess`/`onError` write directly into the store, which lives outside the React tree, so the outcome survives regardless of which component instance (if any) is still mounted when the response arrives. `kyc/processing/page.tsx` renders purely from `wizard.submissionStatus` now — a fresh remount just reads whatever's already there instead of starting a stuck spinner. Full writeup: `docs/design-vs-backend-gaps.md` (Phase 3, "Follow-up" under the KYC processing gate bug section).

**Verified:** `pnpm typecheck`, `pnpm lint`, `pnpm build` — all clean, route list unchanged.

### Phase 3 (KYC) — pixel-perfect pass across all 4 screens
Closed visual gaps against user-provided screenshots (`docs/design/screenshots/kyc/`) on top of the already-working functionality (camera capture, upload flow, submission state) — no behavior changes in this pass. Full per-screen breakdown: `docs/design-fidelity-notes.md`.

- **Intro** (`kyc/(wizard)/page.tsx`): real padlock illustration (`public/images/kyc/padlock-fingerprint.svg`, user-provided), `Camera` icon (was `ScanFace`), icon badges behind each row, shield icon on the disclaimer line.
- **Upload ID** (`kyc/(wizard)/id/page.tsx`): fixed tab style (outline-only active tab, not a segmented pill), added a read-only "ID Type" confirmation row, added Front/Back status rows in the left column (new `onFileSelected` prop on `FileUploadField`), circular icon badge on the drop zone, `bg-muted` panel instead of a bordered box, `Continue` scoped to the left column.
- **Selfie** (`kyc/(wizard)/selfie/page.tsx`): one change — panel style aligned with the ID upload screen (`bg-muted`, no border).
- **Processing/Scanning** (`kyc/processing/page.tsx`): built the previously-deferred "Scanning" state — corner-bracket viewfinder around the real captured selfie, an animated scan line (`@keyframes scan` in `globals.css`), and a progress bar. **The progress bar is simulated, not real** — `kyc/submit` has no byte-level progress to report; flagged clearly in code comments so it's not mistaken for a real measurement later.

Caught and fixed one real bug mid-implementation: the first draft of the corner-bracket component tried to share one conditional class string across all four corners and got the border-radius wrong on the two bottom corners (rounding the wrong side, plus a redundant inline-style override that didn't fully fix it). Rewritten as four explicit elements — worth knowing if this file gets touched again, since the shared-conditional approach looks reasonable at a glance but was actually broken.

**Verified:** `pnpm typecheck`, `pnpm lint`, `pnpm build` — all clean, route list unchanged. **Not verified:** no visual check against the running app — no browser/screenshot tool is available in this environment (same limitation noted every design pass this session). Worth a manual look at all 4 screens before considering this done.

### Phase 3 — Landing page (`/`) and Home (`/home`) placeholders, no Figma for either
`src/app/page.tsx` (was a bare "Phase 0 scaffolding" placeholder) is now a minimal hero — logo, headline, house illustration (reusing existing auth assets), `Get Started`/`Sign In` CTAs into the real `/register`/`/login` flow. Purely presentational, no functional changes.

`src/app/(client)/home/page.tsx` stays a deliberately minimal placeholder (greeting + `KycReminderCard`) — a reference screenshot exists for the real target design (`docs/design/screenshots/home/`, full sidebar/search/listing-feed) but was intentionally **not** followed: building fake listing/search UI with no real data behind it would misrepresent progress at standup and create throwaway work once Phase 3's real property features land. Full reasoning: `docs/design-fidelity-notes.md`.

**Verified:** `pnpm typecheck`, `pnpm lint`, `pnpm build` — all clean, route list unchanged.

## Phase 4 — Home page: real properties/profile/notifications data, no more placeholder
Real, production-backed rebuild of `/home` — not a mockup, per explicit instruction. Full component/API dependency analysis happened **before** any code: `docs/design/home-page-data-plan.md` (component inventory, API mapping, confirmed live response shapes from real `curl` tests against seeded data, parallel-loading strategy). Gaps found there are logged in `docs/design-vs-backend-gaps.md`'s Phase 4 section — read that before touching this code again.

**Three new feature folders**, all following the same `types/api/hooks/index` shape as `auth`/`kyc`, plus a new `models.ts` in two of them:
- `src/features/properties/` — `types.ts` (raw `ApiProperty` shape, confirmed live), `models.ts` (`PropertyCardModel` + `toPropertyCardModel()`), `config.ts` (`PROPERTY_PURPOSE_TABS`, `PRICE_RANGE_BUCKETS`), `api.ts`, `hooks.ts` (`usePropertySearch`), `components/` (`PropertyCard`, `FilterDropdown`, `PropertyFeatureFilter`).
- `src/features/profile/` — `types.ts`, `models.ts` (`ProfileViewModel` + `toProfileViewModel()`), `api.ts`, `hooks.ts` (`useProfile`).
- `src/features/notifications/` — `types.ts`, `api.ts`, `hooks.ts` (`useHasUnreadNotifications` — a boolean for the bell's dot, not a full inbox; no inbox screen exists yet).

**View-model / mapping-layer architecture** (explicit instruction, new pattern for this codebase): components never bind directly to raw API responses. `toPropertyCardModel()`/`toProfileViewModel()` are the only code that touches the messy raw shape (string prices, relative media paths needing the API origin prefixed, nested `owner.profile.*`, `0`/`1` instead of booleans) — everything downstream renders the clean model. A backend shape change only requires updating the mapper. Deliberately not retrofitted onto `auth`/`kyc` (those hooks return raw-ish parsed data directly, unchanged) — worth applying to future list-rendering features though.

**New `src/components/app-shell/`** — the real sidebar + topbar shell `(client)/layout.tsx` has been deferring since Phase 0 ("real AppShell lands with the property features"). `NAV_ITEMS` (`nav-config.ts`) and the topbar's icon list are both data-driven arrays, not hardcoded JSX — this matters because most sidebar destinations (Search Property, List Property, Messages, History, Profile) don't have pages built yet and render disabled/non-clickable rather than as dead links; extending the enabled set later is additive.

**Three design elements explicitly hidden or stubbed, all confirmed to have zero backend support** (grepped the whole Postman collection, checked real live data):
- **Airbnb tab** — hidden entirely, no `purpose` value exists for it.
- **Favorites** (topbar heart, per-card heart, "Saved Property" nav) — hidden entirely, no endpoint exists anywhere.
- **"Property Feature" filter** — kept visible but disabled/"Coming Soon" (different treatment from the two above, per explicit instruction — it's a prominent part of the search bar's visual layout).

**Real bug found during verification, isolated to one route**: `POST /api/properties/search` returns a raw `500` with a full Laravel debug stack trace (leaking server file paths) when unauthenticated, instead of a clean `401`. Retested `GET /api/profile` and `GET /api/notifications` — both fail correctly. Not systemic; almost certainly this one route isn't wired through `auth:sanctum` like the rest of the API. Not yet added to `docs/bug-report-csrf-and-otp-leak.md` — offered, awaiting confirmation.

**A real bug caught during self-review before shipping**: `PRICE_RANGE_BUCKETS[Number(filters.priceRangeIndex)]` — `Number("")` evaluates to `0` in JS, so the unselected/default filter state was silently selecting the *first* bucket (`max_price: 500,000`) instead of applying no price filter at all, which would have hidden most of the real seeded listings (up to ₦100M) on initial page load. Fixed with an explicit `=== ""` guard before the `Number()` cast (`src/app/(client)/home/home-content.tsx`).

**Corrects an earlier architectural assumption in this doc**: the old "Immediate next step" note below (now superseded) assumed `properties/search` was public and RSC-fetchable. **Confirmed live it requires Bearer auth** (unauthenticated requests error, see the bug above) — Home fetches it entirely client-side via TanStack Query, matching the existing hard rule (RSC only for genuinely public endpoints).

**Verified:** `pnpm typecheck`, `pnpm lint`, `pnpm build` — all clean, route list unchanged (still 20 routes, Home was already a route, no new pages added this phase — App Shell/features are all internal restructuring plus the Home page's own content).

**Not yet done:** no live browser test of the actual rendered Home page (no browser tool available in this environment, same limitation as every design pass this session) — worth a manual check, particularly the listing feed against real seeded properties and the price-range filter behavior given the bug just fixed above.

## Phase 5 — Search Property + Listing Detail
Two new pages, both reusing Phase 4's `properties` feature almost entirely rather than introducing new endpoints. Full analysis: `docs/design/search-and-listing-detail-plan.md`. Gap/decision detail: `docs/design-vs-backend-gaps.md` (Phase 5).

- **`src/app/(client)/search/`** — `page.tsx` (Suspense-wrapped, `useSearchParams` requires it) + `search-content.tsx`. Filter/page state lives entirely in the URL (`?purpose=&q=&type=&price=&page=`), not component state — the one real behavioral difference from Home's `SearchPanel` usage, so a shared search URL reproduces the same results. 3-column grid via new `PropertySearchResultCard`, real pagination via new `Pagination` component, both driven by `usePropertySearch()` (extended this phase to return `{properties, pagination}` instead of just the array — Home's usage updated accordingly).
- **`src/app/(client)/properties/[id]/`** — `page.tsx` (async params, Next 16) + `listing-detail-content.tsx` + `photo-gallery-modal.tsx`. New `usePropertyDetail(id)` hook and `PropertyDetailModel`/`toPropertyDetailModel()` (extends `PropertyCardModel`, same view-model pattern as Phase 4). No dedicated single-property endpoint exists — reuses `properties/search` with an `id` filter, per the already-documented schema.
- **New `src/components/ui/dialog.tsx`** — shadcn-style wrapper around `radix-ui`'s `Dialog`, needed for both the gallery modal and the new message-compose UI.
- **New `src/features/messaging/`** — `useSendMessage()` only (`POST /api/communication/messages/send`). Wired into a new shared `MessageOwnerButton` component (compose dialog, used on both the search grid cards and Listing Detail) — real send, no inbox to view replies in yet, per explicit decision.
- **`SearchPanel` and `ListingFeed` relocated** from `(client)/home/` to `src/features/properties/components/` — both now shared between Home and Search Property.
- **"Make Offer" is a static, disabled button** — `POST /api/contracts/quick-create` turned out to immediately create *and auto-accept* a binding contract with a payment link in one call, not a negotiable offer. Not wired this phase; a separate Figma link (node `1478-4228`) exists for a future dedicated flow.
- **"Seller Verification" and "Property Features" (beyond bed/bath) render disabled/"Coming Soon"** — no confirmed backend support for either.
- Nav: "Search Property" flipped to `enabled: true` in `src/components/app-shell/nav-config.ts`; `PropertyCard` (Home's card) and `PropertySearchResultCard` (Search's grid card) both now link to `/properties/[id]`.

**Two real bugs caught in self-review before shipping** (full detail in the gaps doc): `PropertySearchResultCard` initially sent a property's own ID as the message recipient instead of the owner's actual user ID (fixed by adding `ownerId` to the base `PropertyCardModel`); and Search Property's bottom "Recent Listing" section was reading its loading/error state from the wrong query (the main filtered/paginated one, not its own separate unfiltered one).

**Verified:** `pnpm typecheck`, `pnpm lint`, `pnpm build` — all clean, 21 routes (added `/search` and `/properties/[id]`).

**Not yet done:** no live browser test (no browser tool in this environment, same limitation every phase this session) — worth checking the URL-synced filter state (especially browser back/forward behavior) and the gallery modal's category tabs against real multi-image listings.

## Immediate next step
Search Property + Listing Detail (Phase 5, above) are done — the "public property surface" item this section used to point to. Remaining disabled sidebar nav items, roughly in order of how directly they continue what's already built:
1. **List Property** (`/properties/new`) — create-listing flow. Backend request schemas for `POST /api/properties/rental`/`sale` are fully documented (title/description/property_type/price/currency/location/bedrooms/bathrooms/square_meters), plus a separate `POST /api/properties/{id}/media` upload step — neither has a documented example *response* yet, worth a live test before building, same discipline as every prior phase.
2. **Messages** (`/messages`) — a minimal inbox/thread UI. `useSendMessage()` already exists and is live-wired from `MessageOwnerButton`; this phase would add the missing "view what was sent/received" half (`GET /api/communication/messages/search`, conversations, unread count — all real endpoints per the Postman collection, none tested live yet).
3. **Profile** (`/profile`) — view/edit page. `useProfile()`/`ProfileViewModel` already exist and are confirmed live (built for Home's greeting) — this is mostly a form around `PUT /api/profile`, which already has its full request schema documented.
4. **"Make Offer"** dedicated flow — currently a static, disabled button on Listing Detail. A Figma link exists for this (node `1478-4228`, not yet pulled) — needs its own plan given `POST /api/contracts/quick-create` immediately creates and auto-accepts a binding contract + payment link, not a negotiable offer.

**Still outstanding from earlier phases, not yet done:**
1. A full live browser walkthrough of register → verify → login → KYC → `/home` → search → listing detail (none of it has been end-to-end browser-verified yet — only individual pieces via `curl`, and no browser tool is available in this environment).
2. `curl` `POST /api/kyc/find-single` with a real non-admin Bearer token to resolve the two open Phase 2.5 risks (real `kyc` field shape, self-lookup authorization) — update `parseKycStatus()` and `docs/design-vs-backend-gaps.md` with whatever is found.
