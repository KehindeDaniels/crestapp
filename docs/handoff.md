# Handoff — Crest App Frontend (Phase 0 + Phase 1 complete → Phase 2 next)

> Written for a fresh agent (e.g. Codex) picking up this repo with no prior conversation context. Read this, then `docs/frontend-blueprint.md` (the architecture source of truth) before writing code.

## Repo state
- Branch: `feat/frontend-foundations`.
- Phase 0 (foundations) is committed and pushed. **Phase 1 (auth) is implemented and verified but not yet committed** — check `git status` before assuming it's on `origin`.
- No test infra is set up **by explicit user instruction** — do not add Vitest/Playwright/MSW unless asked. Keep implementation straightforward, no over-engineering.

## ⚠️ Two separate surfaces — don't conflate them
The Figma file has **3 top-level pages**: "Mobile & Web App" (client-facing — renters/buyers/agents/landlords register and transact here; this is what Phases 0–1 built and what Phases 2–6 build), "Dashboard" (a **separate admin/owner persona** for Crest staff — analytics, property review/approval, KYC verification queue, transactions, documents, user directory; deferred to Phase 7, not started), and "Logo Branding" (not yet inspected — likely resolves the design-token `TODO`s in `globals.css`, currently marked as inferences).

The route group `src/app/(client)/` (renamed from `(dashboard)` this session specifically to avoid this confusion) is the **authed client-app shell** — NOT the admin Dashboard. The actual admin Dashboard will live under nested `/admin/*` routes, gated by `RoleGate role="admin"`, in Phase 7.

## Read first
1. `docs/frontend-blueprint.md` — the full architecture doc (19 sections + checklist). Source of truth for stack, folder structure, auth model, rendering strategy, conventions.
2. `Crest-App-Laravel-API-Collection-postman_collection.json` (repo root) — the backend API contract. Treat it as authoritative over any assumption.
3. `docs/figma-links.md` — Figma frame links per flow. File key: `GQO1uIkdHaiFCXHdsD5KuE`. No dedicated design-system/brand page exists — tokens were derived by inspecting actual screens (see `src/app/globals.css` header comment).
4. **Figma MCP rate limit**: the Starter plan's Figma MCP tool-call budget was exhausted mid-Phase-1. If you have Figma tool access, expect it may still be limited — check before relying on it, and prefer the text/metadata already captured in this repo's history over re-fetching screenshots.

## Three confirmed architectural decisions (non-negotiable, already reflected in the blueprint)
1. **Auth token is client-stored**, browser calls Laravel directly — no BFF/proxy server tier. Token comes back as a raw string in the JSON body (Sanctum-style `access_token`, NOT a `Set-Cookie` header). Manually persisted into a JS-readable cookie (`src/lib/auth/token.ts`) purely as storage — not a real httpOnly session cookie.
2. **Hybrid rendering with a hard line**: Server Components may ONLY fetch public/unauthenticated Laravel endpoints. Anything requiring `Authorization` must be fetched client-side via TanStack Query. Never fetch authed data in an RSC.
3. **shadcn/ui** (Radix + Tailwind v4, `new-york` style, `slate` base) for the component system, owned in-repo.

## ⚠️ Critical Next 16 gotcha hit during Phase 1 — read this before touching `proxy.ts`
**`proxy.ts` (the Next 16 rename of `middleware.ts`) must live inside `src/`, at `src/proxy.ts` — NOT at the project root**, because `src/app` is the app directory. The Next 16 docs say proxy must sit "at the same level as `app` or `pages`." Phase 0 initially placed it at the repo root; it silently failed (no compile log entry, no redirects, plain 404s — no error thrown). Confirmed fixed by moving to `src/proxy.ts`: the production build now shows `ƒ Proxy (Middleware)` in the route table, and redirects were verified live (`curl` against a running dev server) in both directions:
- No cookie + hit `/dashboard` → `307` to `/login?next=%2Fdashboard`
- Cookie present + hit `/login` → `307` to `/dashboard`

If you ever restructure the `src/` layout, re-verify this.

## What's implemented

### Phase 0 — Foundations
```
src/
  app/
    layout.tsx / page.tsx / loading.tsx / error.tsx / global-error.tsx / not-found.tsx
    (auth)/layout.tsx       # guest-only centered card shell
    (onboarding)/layout.tsx # wrapped in <AuthGuard> — KYC wizard lands here in Phase 2
    (client)/layout.tsx     # wrapped in <AuthGuard> — real AppShell (sidebar/topbar) still TODO. This is the CLIENT app shell, not the admin Dashboard (see warning above).
  config/
    constants.ts   # USER_ROLES, *_STATUSES, PROPERTY_* enums mirrored from Postman; cookie names
    env.ts         # Zod-validated NEXT_PUBLIC_* env, fails fast on import
  lib/
    api/client.ts       # apiClient (attaches bearer token) + publicFetch (RSC-safe, no token)
    api/errors.ts       # ApiError class + toApiError() decoding both Laravel error shapes
    api/query-keys.ts   # centralized TanStack Query key factory — extend per feature
    query/query-client.ts / providers.tsx  # QueryClient + sonner Toaster + devtools
    utils/{cn,format,index}.ts
  types/api.ts     # ID, Paginated<T>, ApiEnvelope<T>, FieldErrors
proxy.ts (now src/proxy.ts — see gotcha above)
next.config.ts     # images.remotePatterns for api.crestapp.ng + local Laravel
.env.example / .env.local
```
Design tokens live directly in `src/app/globals.css` (no separate token files). Confidently derived: primary navy `#061D52`, font Inter, foreground `#111827`, muted text `#666`, surface `#f9f9f9`, radius `0.75rem`. Several values are marked `TODO` in the CSS comments (inferred, not observed) — review before shipping: secondary/accent tint, exact success green, destructive/border colors, all dark-mode values.

### Phase 1 — Auth (this session)
```
src/features/auth/
  types.ts          # AuthUser, LoginResponse, RegisterResponse — NOTE: register response has NO access_token, only login does
  schema.ts         # Zod schemas per step, mirroring backend validation (password: 6+ chars, 1 upper, 1 number, 1 symbol)
  api.ts             # authApi: login, register, logout, me, sendVerification, verifyCode, requestPasswordReset, confirmPasswordReset
  store.ts            # useSessionStore (Zustand) — user snapshot + status, wraps persistSession/clearSession
  wizard-store.ts      # useRegisterWizardStore (Zustand, in-memory/non-persisted) — scratch state across the 5-step register wizard
  hooks.ts             # TanStack Query mutations/query wrapping api.ts
  use-auth.ts           # useAuth() — hydrates session from /api/user using the cookie token; apiClient already clears session on 401
  components/verify-code-form.tsx  # shared OTP UI reused by verify-email and verify-phone steps
  index.ts              # barrel export

src/components/guards/
  auth-guard.tsx    # wraps (client) and (onboarding) layouts; redirects to /login?next=... if unauthenticated
  role-gate.tsx      # RoleGate({allow, children}) — reads role from useSessionStore
  kyc-guard.tsx        # KycGuard({kycStatus, children}) — status is CALLER-SUPPLIED; real KYC query is Phase 2 work
  verified-gate.tsx     # VerifiedGate({verificationStatus, children}) — status is CALLER-SUPPLIED; wired to real data in Phase 4

src/app/(auth)/
  login/{page.tsx,login-form.tsx}                  # server page reads async `next` searchParam, renders client form
  forgot-password/page.tsx                          # email -> POST /api/auth/password/reset -> redirects to /reset-password?email=
  reset-password/{page.tsx,reset-password-form.tsx}  # email(prefilled)+code+password+confirm -> POST /api/auth/password/reset/confirm
  register/page.tsx                                  # STEP 1: first_name/last_name/email -> sends email OTP -> /register/verify-email
  register/verify-email/page.tsx                      # STEP 2: OTP -> /register/phone
  register/phone/page.tsx                              # STEP 3: phone_number -> sends phone OTP -> /register/verify-phone
  register/verify-phone/page.tsx                        # STEP 4: OTP -> /register/password
  register/password/{page.tsx,password-strength.tsx}     # STEP 5: password+confirm w/ strength meter -> POST /api/auth/register -> redirect to /login (register has no token!)
```

Installed shadcn primitives: `button`, `input`, `label`, `card`, `input-otp`, `form` (RHF integration).

## Known gaps / decisions flagged during Phase 1 — review before shipping
1. **No role picker in the registration flow.** The Figma Account Creation frames (Welcome/Login → Create Account → Verify Email → Phone → Verify Phone → Create Password) never show a role-selection screen, but `POST /api/auth/register` requires `role` (tenant/landlord/seller/buyer/lawyer/surveyor). **Defaulted to `"tenant"`** in `src/app/(auth)/register/password/page.tsx` — marked `TODO(product)` in code. Needs a product/design decision: either a missing screen, post-registration onboarding step, or role inferred from an entry point (e.g. "List a property" vs "Find a home" CTA on the marketing site).
2. **Google login is UI-only, disabled.** `POST /api/auth/login/google` has no documented response shape in the Postman collection (empty example). The button renders (matches Figma) but is `disabled` with a `TODO(backend)` comment — do not wire it up without confirming the real request/response contract with the backend team first.
3. **Password strength thresholds are inferred**, not backend-specified. Figma shows exactly three labels (Weak/Fair/Strong) with no documented cutoffs. Current mapping (in `password-strength.tsx`): 4/4 requirements = Strong, 2–3 = Fair, 0–1 = Weak. Adjust if a real spec surfaces.
4. **Register wizard state is in-memory only** (no `sessionStorage`/`localStorage` persistence) — a hard refresh mid-wizard loses progress and bounces the user back to `/register`. Each step guards against being opened directly (redirects back if prerequisite data is missing). Acceptable trade-off per "don't over-engineer" instruction; revisit if user testing shows refresh-loss is a real problem.
5. **`(client)` layout has no real AppShell yet** — just `<AuthGuard>` + a bare div. Sidebar/topbar/KYC-status-banner is real UI work, likely Phase 3+ once there's something to navigate to.
6. **Admin Dashboard backend coverage, refined this session**: the "Users" table in the admin Figma page is servable via `POST /api/kyc/find-users-admin` (paginated, filterable by `user_status`/`kyc_status`) — it's not a flat gap, just KYC-scoped rather than a general-purpose user directory. Property Reviews and KYC Verification are both covered by existing endpoints. Still missing: user suspend/activate, a non-KYC-scoped user directory, an admin support desk, and any single dashboard-overview/stats-aggregation endpoint (the stat cards and charts would need client-side assembly from multiple `*/statistics` calls).
6. **`KycGuard`/`VerifiedGate` are intentionally "dumb"** — they take status as a prop from the caller rather than fetching it themselves, because the real KYC-status query (`features/kyc`) and property-verification data don't exist yet (Phase 2 / Phase 4). Don't be surprised these aren't self-sufficient — that's by design, not an oversight.

## Verified Next.js 16.2.10 / React 19.2.4 facts (checked against `node_modules/next/dist/docs`, re-verify if the installed version changes)
- `middleware.ts` → **`proxy.ts`**, exported function name `proxy`, Node runtime only. **Must live in `src/` if `app` is in `src/`** (see gotcha above — this bit us).
- `cookies()`, `headers()`, `params`, `searchParams` are **async** — always `await`. Used correctly in `login/page.tsx` and `reset-password/page.tsx` (server components awaiting `searchParams` before rendering client children).
- Turbopack is the default dev/build compiler.
- `next lint` is removed — ESLint CLI directly (`pnpm lint`).
- `serverRuntimeConfig`/`publicRuntimeConfig` removed — env vars only.
- React Compiler is off (not enabled in `next.config.ts`) — but `eslint-plugin-react-hooks`'s compiler-compat lint rule still runs and will warn on patterns like `form.watch()` from react-hook-form; prefer `useWatch({ control, name })` instead (fixed once in `register/password/page.tsx`).

## Backend coverage facts (from the Postman collection, verified directly — don't re-derive)
- Full **client-user-facing API is complete**: auth, profile, KYC (user side), properties, contracts (quick-create is canonical — the `Depreciated/Transaction Management` folder is superseded), payments, messaging + blocking, support/fraud, legal docs + e-signatures, notifications, platform config, file storage.
- **Owner/admin dashboard is partially covered**: KYC approval, verification queue, and a fairly complete contract admin module exist. **Missing**: general user management, admin property moderation, admin support desk, single dashboard-overview endpoint.
- **No token refresh endpoint** — 7-day token just expires; plan re-login, not silent refresh. `apiClient` already clears the session cookie on any `401`.
- No single `GET /properties/{id}` — fetch via `search` with an `id` filter.
- Messaging is REST-only (no websocket) — real-time chat means polling.
- Confirmed in this session: `POST /api/auth/register` response has **no `access_token`** (only `POST /api/auth/login` does) — the register page correctly redirects to `/login` after success rather than attempting to auto-authenticate.

## Verification performed this session (don't just trust the code — this was actually run)
- `pnpm typecheck` — clean.
- `pnpm build` — clean, all 9 auth routes compile with correct static/dynamic split (`/login`, `/reset-password` dynamic due to async `searchParams`; rest static).
- `pnpm lint` — clean (0 warnings after the `useWatch` fix).
- Live dev server smoke test via `curl`: `/login` and `/register` render expected copy ("Welcome to Crestapp", "Create Account"); `/dashboard` without a cookie redirects to `/login?next=%2Fdashboard`; `/login` with a cookie redirects to `/dashboard`.

## Immediate next step
**Phase 2 — KYC onboarding** (blueprint checklist item 8): URL-stepped wizard under `(onboarding)/kyc/*` mirroring the Figma KYC section (intro → upload ID front/back → selfie → processing → success), calling `POST /api/kyc/submit`. Build `features/kyc/` following the exact same pattern as `features/auth/` (types/schema/api/hooks). Once KYC status is fetchable, go back and wire `KycGuard` to a real `useKycStatus()` hook instead of taking a prop.
