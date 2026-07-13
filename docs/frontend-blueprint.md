# Crest App — Frontend Blueprint (Source of Truth)

> Living document. Next.js 16.2 · React 19.2 · Tailwind v4 · TypeScript 5. Backend is a complete, frozen Laravel API (bearer-token). Update this file as decisions evolve.

## 0. Product context (why the architecture is shaped this way)
Crest is a multi-role property transaction platform. Roles: `landlord, tenant, seller, buyer, lawyer, surveyor, admin`. Core journeys: account creation → **KYC** (ID + selfie) → browse/search verified properties → post/verify a property → **contract** (quick-create generates fees + Flutterwave payment link) → payment → messaging/support throughout. Two properties of the domain dominate the design:
- **Trust/verification gating**: users have `status` (pending/active) and KYC state; properties have `verification_status`. Many actions are gated behind these. The UI must model gates as first-class.
- **Money + legal documents**: contracts, fee breakdowns, e-signatures, payment links. Correctness and clear error states matter more than flashy UI.

## 1. Overall architecture & guiding principles
- **Feature-first, not layer-first.** Code is grouped by domain feature (`features/kyc`, `features/properties`, `features/contracts`), each owning its API calls, hooks, components, types, and schemas. Shared primitives live in `components/ui` and `lib/`.
- **Hybrid rendering with a hard public/private line.** Because the auth token is client-held, the rule is absolute: **Server Components may only fetch public endpoints**; anything requiring `Authorization` is fetched on the client with TanStack Query. This removes ambiguity about "where does this data load."
- **The API is the contract.** The Postman collection is the schema of record. Types are derived from it and validated at the client boundary with Zod; the frontend never invents fields.
- **Gates are explicit.** `AuthGuard`, `KycGuard`, `RoleGate`, `VerifiedGate` are named building blocks, not ad-hoc `if` checks scattered around.
- **Colocation + thin globals.** Server state lives in TanStack Query; only truly global, cross-feature client state (session snapshot, ephemeral wizard state, toasts) uses Zustand/Context. No Redux.
- **Own your components.** shadcn/ui is copied in, not imported as a black box, so the Figma design system is fully expressible.
- **Progressive hardening.** Ship the client-token model now; the API layer is abstracted so a future move to a BFF/httpOnly-cookie proxy touches one module, not every feature.

## 2. Technology stack & libraries (only where they earn their place)
| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router | Given. Hybrid RSC + client. |
| Language | TypeScript (strict) | Non-negotiable for a money/legal app. |
| Styling | Tailwind v4 + CSS variables | Given; design tokens as CSS vars. |
| Components | **shadcn/ui** (Radix) | Accessible, ownable, matches custom Figma. |
| Server state | **TanStack Query v5** | Caching, retries, pagination, mutations for the authed API surface. |
| Forms | **React Hook Form + Zod** (`@hookform/resolvers`) | Complex multi-step forms (KYC, listing, contract); shared schema for validation + types. |
| Global client state | **Zustand** | Session snapshot, multi-step wizard state, UI. Tiny, no boilerplate. |
| HTTP | Native `fetch` wrapped in a typed `apiClient` | No axios; keeps bundle lean, works in RSC + client. |
| Dates/money | `date-fns` + a small `formatCurrency` util (Intl) | NGN/USD formatting, contract dates. |
| Icons | `lucide-react` | Pairs with shadcn; Figma uses similar line icons. |
| Tables (admin) | `@tanstack/react-table` | Admin contract/KYC lists, pagination. |
| Toasts | `sonner` | Standard with shadcn. |
| Testing | Vitest + React Testing Library + Playwright + MSW | Unit/integration + E2E + API mocking. |
| Lint/format | ESLint 9 flat config + Prettier | `next lint` is removed in 16. |

> Deliberately **not** adding: axios, Redux, a component kit (MUI/Mantine), a GraphQL client, or a heavy i18n lib (single-locale for v1; structure allows adding later).

## 3. Folder & feature structure
```
src/
  app/                      # App Router (routing only; thin pages)
    (public)/               # RSC, no auth: marketing, search, listing detail
    (auth)/                 # login, register, password, verify (guest-only)
    (onboarding)/kyc/       # KYC wizard (authed, status=pending ok)
    (client)/               # authed client app shell: properties, contracts, messages, etc. (renter/buyer/agent/landlord — NOT the separate admin Dashboard, see §17 Phase 7)
    api/                    # Next route handlers ONLY where truly needed (e.g. og-image). Not a proxy.
    layout.tsx  globals.css  not-found.tsx  error.tsx
  features/
    auth/       { api.ts, hooks.ts, schema.ts, types.ts, components/, store.ts }
    kyc/
    properties/
    verification/
    contracts/
    payments/
    messaging/
    support/
    documents/
    notifications/
    profile/
  components/
    ui/                     # shadcn primitives (owned)
    layout/                 # AppShell, Sidebar, Topbar, Footer
    guards/                 # AuthGuard, KycGuard, RoleGate, VerifiedGate
    shared/                 # cross-feature composites (PropertyCard, FeeBreakdown, EmptyState)
  lib/
    api/                    # apiClient, endpoints, error normalization, query keys
    auth/                   # session store, token cookie helpers, useAuth
    query/                  # QueryClient factory, providers
    validation/             # shared zod helpers
    utils/                  # format, cn, etc.
  types/                    # global/shared types (ApiError, Paginated<T>, enums)
  config/                   # env.ts (validated), constants, roles, nav
  styles/                   # tokens.css (design variables)
proxy.ts                    # optimistic auth redirects (Next 16 name for middleware)
```
Feature module public surface is its `index.ts`; cross-feature imports go through it.

## 4. Routing strategy (App Router)
- **Route groups** encode access class without affecting URLs: `(public)`, `(auth)`, `(onboarding)`, `(client)`. (`(client)` is the authed renter/buyer/agent/landlord app shell — the separate admin Dashboard, a distinct Figma page/persona for Crest staff, lives under nested `/admin/*` routes inside it, see §17 Phase 7.)
- **Public (RSC, server-fetch allowed):** `/`, `/properties` (search), `/properties/[id]` (listing detail). These hit unauthenticated backend endpoints (`/api/properties/search`) and are SEO/OG-optimized. Use `generateMetadata` (async `params`).
- **Auth (guest-only):** `/login`, `/register` (5-step wizard: `/register/verify-email`, `/register/phone`, `/register/verify-phone`, `/register/password` — email/phone verification is wizard-internal, not a standalone `/verify` route), `/forgot-password`, `/reset-password`. `proxy.ts` bounces authenticated users to `/home`.
- **Onboarding:** `/kyc` multi-step (`/kyc/id`, `/kyc/selfie`, `/kyc/processing`) — **URL-driven steps** so refresh/back works; RHF + Zustand hold wizard state.
- **Client app (authed, `(client)` route group):** `/home`, `/properties/new`, `/properties/mine`, `/properties/[id]/manage`, `/contracts`, `/contracts/[id]`, `/messages`, `/messages/[userId]`, `/support`, `/notifications`, `/profile` — the renter/buyer/agent/landlord persona.
- **Admin Dashboard (authed, `/admin/*`, RoleGate=admin):** a distinct Figma page/persona for Crest staff — analytics, property review/approval, KYC verification queue, transactions, documents, user management. Nested inside `(client)` at the route level but gated separately; deferred to Phase 7 (see §17).
- **Async params everywhere** (`const { id } = await params`). Run `next typegen` and use `PageProps<'/properties/[id]'>`.
- **Loading/error UX:** per-segment `loading.tsx` (skeletons) and `error.tsx`. Use `not-found.tsx` for missing entities; `forbidden()`/`unauthorized()` (new in 16) for role/permission failures with `forbidden.tsx`/`unauthorized.tsx`.
- **Modals:** intercepting + parallel routes for quick-view (property preview, image lightbox) where valuable; every parallel slot needs `default.tsx` (Next 16 requirement).

## 5. API layer architecture
Three concentric rings, all typed:
1. **`lib/api/client.ts` — `apiClient`.** Thin `fetch` wrapper: injects `NEXT_PUBLIC_API_URL`, `Accept: application/json`, `Authorization: Bearer <token>` (from session store; omitted in RSC/public calls), JSON handling, timeout/abort, and **error normalization** into `ApiError` (maps 422 field errors and `{success:false,error_code}`). Two entry points: `apiClient` (client, attaches token) and `publicFetch` (server-safe, no token, supports `next: { revalidate, tags }`).
2. **Per-feature `api.ts`.** Pure functions mapping 1:1 to endpoints, e.g. `properties.search(params)`, `kyc.submit(dto)`, `contracts.quickCreate({property_id})`. Inputs typed by Zod-inferred DTOs; outputs parsed by response schemas (at least in dev/`safeParse` with logging).
3. **Per-feature `hooks.ts` — TanStack Query.** `useQuery`/`useMutation` wrappers with centralized **query keys** (`lib/api/query-keys.ts`) and cache-invalidation conventions (e.g. accepting a contract invalidates `['contracts']` + `['transactions']`). Pagination via `useInfiniteQuery` for search/messages.

- **Public data in RSC** calls the feature `api.ts` functions through `publicFetch` directly in the Server Component (no hook), passing results to client children as props / hydrated query cache where needed.
- **Deprecated endpoints** (`Depreciated/Transaction Management`) are excluded; contracts `quick-create` is the canonical purchase path.

## 6. Authentication & authorization architecture
- **Login/register** call Laravel directly; on success store `{ token, user }`. Token persisted in a **JS-readable cookie** `crest_token` (`Secure`, `SameSite=Lax`, 7-day max-age) plus an in-memory Zustand `sessionStore`; a minimal `crest_role`/`crest_status` cookie enables optimistic guards. (Trade-off acknowledged: client-readable = XSS-exposed; mitigated by strict CSP, output encoding, dependency hygiene. Abstraction allows later migration to httpOnly BFF.)
- **`proxy.ts` (optimistic only):** existence/shape check of `crest_token` cookie → redirect unauth users away from `(client)`/`(onboarding)`, and authed users away from `(auth)`. No network calls (per Next 16 guidance).
- **Authoritative checks on the client:** `useAuth()` hydrates from `/api/user`; `AuthGuard` in the dashboard layout redirects on 401. `apiClient` treats any `401` as session-expired → clear session → redirect `/login`.
- **Authorization primitives:**
  - `RoleGate role="admin"` — role-based UI + admin routes.
  - `KycGuard` — blocks transaction/contract actions until KYC `approved`; renders a "verify to continue" CTA otherwise.
  - `VerifiedGate` — property actions requiring `verification_status=verified` (e.g. activate/contract).
- **Never trust the client for security** — the Laravel API is the enforcement boundary; gates are UX, and every mutation surfaces server 403 (`error_code`) cleanly.

## 7. State management strategy
- **Server state → TanStack Query** (the default for anything from the API). One `QueryClient` (sane defaults: `staleTime` 30–60s for lists, retry off for 4xx). Provider in a client `Providers` component mounted in root layout.
- **Global client state → Zustand**, three small stores: `sessionStore` (token/user snapshot), `wizardStore` (KYC/listing multi-step scratch state), `uiStore` (modals, sidebar). Persisted slices use `zustand/middleware` where refresh-safety matters.
- **Local state → `useState`/`useReducer`** for component-scoped concerns.
- **URL state** (search filters, pagination, wizard step) lives in `searchParams` so views are shareable/refresh-safe; sync via `nuqs`-style helpers or a thin custom hook.
- **React Context** reserved for dependency-injection-style values (theme, feature flags), not high-frequency data.

## 8. Type organization
- **Domain types** (`User`, `Property`, `Contract`, `KycSubmission`, `Transaction`, enums for roles/statuses/property types) live in each feature's `types.ts`, re-exported via `index.ts`. Cross-cutting types (`ApiError`, `Paginated<T>`, `ID`) in `src/types/`.
- **Single source via Zod:** request/response schemas in `schema.ts`; TS types are `z.infer<...>`. This keeps runtime validation and compile-time types in lockstep — critical since the backend is external.
- **Enums as `as const` unions** matching backend literals exactly (e.g. `PropertyStatus = 'draft'|'pending_approval'|'active'|...`).
- Generate Next route types with `next typegen`; use `PageProps`/`LayoutProps`/`RouteContext`.

## 9. Validation strategy
- **Zod at every boundary.** Forms validate with RHF + `zodResolver`; API request DTOs are Zod-parsed before send; responses are `safeParse`d (throw/log in dev, tolerant in prod) so backend drift is caught fast.
- **Mirror backend rules** captured in the Postman collection (e.g. `deposit_percentage` 10–50, `offer_amount` ≥ 100000, phone/email formats, enum membership). Central `validation/` holds reusable refinements (NGN phone, password policy).
- **Server errors reconcile with forms:** the 422 `errors` map is applied back onto RHF field errors by a shared `applyServerErrors(form, apiError)` helper.

## 10. Error handling strategy
- **Normalized `ApiError`** `{ status, message, code?, fieldErrors? }` produced in `apiClient`. UI never sees raw fetch errors.
- **Layers:** field-level (RHF) → form-level (toast/inline for `error_code` like `USER_BLOCKED`) → query-level (TanStack `error` states with retry/empty components) → route-level (`error.tsx` per segment) → global (`app/error.tsx`, `global-error.tsx`).
- **401** → auto sign-out + redirect. **403** → `forbidden()`/inline permission message. **404** → `not-found`. **5xx** → friendly retry surface + Sentry capture.
- **No silent catches**; every catch either recovers visibly or reports.

## 11. UI / component architecture
- **Three tiers:** `components/ui` (shadcn primitives) → `components/shared` + feature `components/` (composites like `PropertyCard`, `FeeBreakdown`, `KycStepper`, `ContractStatusBadge`) → route/page compositions.
- **Server vs client components:** default to Server Components; add `'use client'` only for interactivity (forms, query hooks, stores). Keep client components at the leaves; pass server-fetched public data down as props.
- **Design tokens** from Figma expressed as CSS variables in `styles/tokens.css`, consumed by Tailwind v4 `@theme`. shadcn components read tokens so light/dark and brand changes are centralized.
- **Accessibility** via Radix (focus, ARIA), form labels, keyboard flows for the KYC/upload steps.
- **React Compiler** left off initially (opt-in in 16) — revisit once stable in our build.

## 12. Layout architecture
- **Root layout** (`app/layout.tsx`): `<html>` (+ `data-scroll-behavior="smooth"` if we want the old scroll reset), fonts via `next/font`, `Providers` (QueryClient, tooltip, toaster), base metadata.
- **Group layouts:** `(public)` = marketing header/footer; `(auth)` = centered card + brand panel (matches Figma auth screens); `(onboarding)` = minimal stepper chrome; `(client)` = `AppShell` (sidebar + topbar with notifications/messages, KYC banner when pending) — the renter/buyer/agent/landlord shell, distinct from the admin Dashboard.
- **Nested layouts** for sub-areas (e.g. `/messages` two-pane). Remember Next caveat: **do not put auth checks only in layouts** (they don't re-render on nav) — gate at page/component level too.
- Skeleton `loading.tsx` per major segment to keep transitions instant (Next 16 improved prefetching).

## 13. Environment configuration
- **Validated env** in `src/config/env.ts` using Zod (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, Flutterwave public key if needed, `NEXT_PUBLIC_SENTRY_DSN`). Fails fast at startup on missing vars.
- Only `NEXT_PUBLIC_`-prefixed vars reach the client (runtime-config APIs were removed in 16). Server-only secrets (none needed for client-token model) would use unprefixed vars + `connection()` for runtime reads.
- `.env.example` committed; `.env.local` git-ignored. Environments: local (`http://127.0.0.1:8000`), staging, prod (`https://api.crestapp.ng`). `next.config.ts` `images.remotePatterns` for backend media host.

## 14. File naming & coding conventions
- Files/dirs **kebab-case** (`property-card.tsx`, `use-contracts.ts`); React components **PascalCase** exports; hooks `useX`; Zod schemas `xSchema`; types PascalCase.
- One primary export per component file; feature barrels via `index.ts`.
- Imports ordered (external → alias → relative); path alias `@/*` → `src/*`.
- No default exports for utilities (named only); pages/layouts use default per Next convention.
- ESLint flat config + Prettier + `eslint-config-next`; enforce `@typescript-eslint/consistent-type-imports`, no-floating-promises, exhaustive-deps.

## 15. Performance considerations
- **RSC for public pages** → fast first paint + SEO for property search/detail; cache with `fetch` `next: { revalidate, tags }` and invalidate on relevant admin actions.
- **Client caching** via TanStack Query staleTime/placeholderData; `useInfiniteQuery` for search & messages; prefetch on hover for property cards.
- **Images:** `next/image` with `remotePatterns`; note Next 16 defaults (`minimumCacheTTL` 4h, `qualities:[75]`).
- **Code-split** heavy client-only pieces (selfie/camera capture, charts, react-table admin) via `dynamic()`; keep client bundles at leaves.
- **Turbopack** dev/build (default). Monitor with Lighthouse/Web Vitals (Next 16 dropped build-size metrics).

## 16. Testing strategy
- **Unit** (Vitest + RTL): utils, schemas, guards, hooks.
- **Integration** (RTL + **MSW** mocking the Laravel API using real response shapes from the Postman collection): forms, query hooks, error/empty/loading states.
- **E2E** (Playwright): critical journeys — register → KYC → search → quick-create contract → payment link; login/guard redirects; messaging/block.
- **Contract fidelity:** MSW handlers are generated from Postman examples so tests fail if the frontend assumes fields the API doesn't return.
- CI: typecheck + lint + unit/integration on PR; E2E on main. Coverage gates on `lib/` and feature `api.ts`/`schema.ts`.

## 17. Phased implementation roadmap (empty repo → production)
- **Phase 0 — Foundations:** deps (TanStack Query, Zustand, RHF, Zod, shadcn init, sonner, lucide), Tailwind v4 tokens from Figma, `env.ts`, `apiClient`+error model, QueryClient provider, base layouts, ESLint/Prettier, Vitest+MSW+Playwright skeleton, `proxy.ts` stub.
- **Phase 1 — Auth:** register, login, forgot/reset, verify; `sessionStore`, token cookie, `useAuth`, `AuthGuard`, guest redirects. (Figma: Account Creation.)
- **Phase 2 — KYC onboarding:** URL-stepped wizard, ID upload (front/back), selfie capture, processing/success, `KycGuard`. (Figma: KYC.)
- **Phase 3 — Public property surface (RSC):** search with filters (URL state), listing detail, metadata/OG. (Figma: Home, Search Property, Listing.)
- **Phase 4 — Property ownership:** post rental/sale, media upload, my-properties, verification document upload + status, activate/deactivate.
- **Phase 5 — Contracts & payments:** quick-create flow, fee breakdown, accept/reject, Flutterwave payment link + status polling, contract list/detail.
- **Phase 6 — Communication & support:** messaging (conversations, send, block/unblock), notifications, support tickets, fraud report.
- **Phase 7 — Admin Dashboard:** separate persona/surface under `/admin/*` (RoleGate=admin) — analytics overview (listed/approved/rejected property counts, transaction trend, KYC donut — assembled client-side from multiple `*/statistics` + `find-users-admin` responses, no single overview endpoint exists), property review/approval queue, KYC verification queue, transactions, documents, user directory (via `find-users-admin`, KYC-scoped). Figma has a dedicated "Dashboard" page for this — confirmed distinct from the client-app screens, not yet inspected in detail.
- **Phase 8 — Hardening:** a11y pass, CSP/security headers, Sentry, E2E coverage, performance budget, staging→prod.

> **Screen-coverage gap (from Figma vs backend):** The Figma file has 3 top-level pages: "Mobile & Web App" (client-facing — currently covers Account Creation, KYC, Home, Search, Listing), "Dashboard" (admin — sidebar confirms Property Reviews/Transactions/Documents/KYC Verification/Users/Profile/Settings, not yet inspected screen-by-screen), and "Logo Branding" (not yet inspected — may resolve the design-token TODOs in `globals.css`). Backend implies additional **not-yet-designed** client screens: contracts/fees/payment, messaging + blocking, support/fraud, notifications, document e-signature workflow, profile/credibility/ratings. Flag these for design before their phases. On the admin side, the backend still lacks: user suspend/activate, a non-KYC-scoped user directory, and an admin support desk — flag for backend work before Phase 7.

## 18. Architectural decisions & reasoning (ADR summary)
1. **Feature-first structure** — scales to the ~13 backend modules without a tangled layer soup; each feature is independently ownable/testable.
2. **Client-stored token, direct-to-Laravel** *(user decision)* — fastest path given a frozen token API and no Next server tier desired; abstraction (`apiClient`) isolates the choice for a later BFF migration. Trade-off: XSS exposure, mitigated by CSP + hygiene.
3. **Hybrid rendering with a public/private hard line** — SEO + speed on public property pages via RSC, while authed data stays client-side because the token is browser-held. The absolute rule prevents accidental token use in RSC.
4. **TanStack Query for all authed data** — purpose-built caching/mutations/pagination for a REST API; removes bespoke fetching state.
5. **Zod as the single source for types + validation** — external backend means runtime validation is worth the cost; kills type/response drift.
6. **shadcn/ui over a component kit** *(user decision)* — ownable, accessible, matches a bespoke Figma system without fighting a vendor theme.
7. **`proxy.ts` optimistic-only** — Next 16 mandates Node runtime + no heavy work; real enforcement is server-side + client guards.
8. **Zustand over Redux/Context for globals** — minimal footprint for the small amount of genuine global client state.
9. **URL-driven wizards/filters** — refresh/share/back correctness for KYC and search.
10. **No axios / no runtime config / ESLint CLI** — align with Next 16 removals and keep the bundle lean.

## 19. Risks, trade-offs & future scalability
- **Token XSS exposure** (client-stored) — highest risk; enforce strict CSP, sanitize any HTML, audit deps, short token life, plan BFF migration path.
- **Backend drift / undocumented fields** — mitigated by Zod response parsing + MSW contract tests; keep this doc + schemas updated.
- **Design gaps** — several backend modules lack Figma; roadmap phases will stall without designs (see §17 gap list).
- **Bearer token + RSC boundary discipline** — a dev could accidentally fetch authed data in RSC; lint rule/PR checklist + `publicFetch` naming reduce this.
- **Payment link/webhook reconciliation** — frontend only polls status; ensure clear pending/expired UX and link regeneration.
- **Scalability** — feature modules + Query keys support growth; if a server tier is later desired, introduce Route Handlers as a BFF behind the same `apiClient` interface without touching features. Cache Components/`use cache` can be adopted for public pages when it stabilizes. i18n/multi-currency structure is present (NGN/USD) for later expansion.

## Prioritized implementation checklist (start here)
1. **Scaffold foundations** — install deps; `shadcn init`; Tailwind v4 tokens from Figma; `src/` structure; path alias.
2. **`config/env.ts`** (Zod-validated) + `.env.example` (`NEXT_PUBLIC_API_URL`).
3. **`lib/api/client.ts`** — `apiClient` + `publicFetch` + `ApiError` normalization (422 + `error_code`).
4. **`lib/query` provider** + root `Providers` + `sonner` toaster.
5. **`proxy.ts`** optimistic guards; route groups `(public)/(auth)/(onboarding)/(client)`.
6. **Auth feature** — schemas, api, hooks, `sessionStore`, token cookie, `useAuth`, `AuthGuard`, guest redirects; build register/login/forgot/reset/verify.
7. **Guards** — `RoleGate`, `KycGuard`, `VerifiedGate`.
8. **KYC wizard** (URL steps + RHF + upload/selfie).
9. **Public property search + detail (RSC)** with URL filters + metadata.
10. **Property ownership** (post, media, my-properties, verification).
11. **Contracts + Flutterwave payments.**
12. **Messaging/blocking, notifications, support.**
13. **Admin suite.**
14. **Testing harness** (Vitest+RTL+MSW from Postman examples; Playwright journeys) — stand up in Phase 0, expand each phase.
15. **Hardening** — CSP/security headers, Sentry, a11y, perf budget, staging→prod.
