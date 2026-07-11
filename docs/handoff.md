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
  processing/page.tsx   # guards: redirects to /kyc/selfie if selfie missing; calls kyc.submit() once on mount (ref-guarded against double-fire); shows spinner -> success card -> "Continue" resets wizard and pushes to /dashboard
```
Every KYC gap (missing document-number field, cosmetic country field, undocumented upload/submit response shapes, no live camera, no confirmed KYC-status-check endpoint) is detailed in `docs/design-vs-backend-gaps.md` — don't re-derive, read that file.

Installed shadcn primitives (Phase 1 + 2 combined): `button`, `input`, `label`, `card`, `input-otp`, `form`. No new primitives needed for KYC (used `lucide-react` icons directly).

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
- `pnpm typecheck` — clean (after fixing the `Json` type gotcha above).
- `pnpm build` — clean, 13 routes total (9 from Phase 1 + 4 new KYC routes), correct static/dynamic split, `ƒ Proxy (Middleware)` present.
- `pnpm lint` — clean, 0 warnings.
- **Not done this session**: no live browser test of the KYC submit flow, because of the known CSRF bug (see above) — `curl` without an `Origin` header would give a false-positive "it works" result, so it wasn't used to claim success here.

## Immediate next step
**Phase 3 — Public property surface (RSC)** per the blueprint roadmap: property search with filters (URL state) and listing detail, rendered via Server Components hitting `publicFetch` (unauthenticated `/api/properties/search`) — this is the first real test of the RSC/public-vs-authed hard line described in architectural decision #2. Figma: Home, Search Property, Listing for sale. **Before starting**, check whether the CSRF/OTP bugs are fixed — if so, do a real end-to-end browser test of the full register → verify → KYC flow first, since none of it has been live-verified yet.
