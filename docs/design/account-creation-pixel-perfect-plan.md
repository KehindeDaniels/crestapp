# Plan: Account Creation Flow — Pixel-Perfect UI Rebuild

> Persisted from the approved plan-mode blueprint (2026-07-14) so it survives beyond the planning session. Referenced from `docs/handoff.md` once this phase is underway.

## Context

The auth flow (login + 5-step register wizard) was built earlier this session with correct functionality but generic/placeholder styling — a deliberate "functionality first, then one polish pass" approach the user explicitly signed off on. That polish pass starts now. The user wants **pixel-perfect** fidelity to the real Figma designs (file `aDI3HOS6NVQWnLdIx5Zvif`, now fully accessible), not an approximation, and asked for the blueprint itself to be saved as a real doc in the repo so it survives beyond this session.

Real Figma data pulled for the Login/Welcome screen (node `1395:1540`) revealed the actual design is a **split-screen layout** — a navy left marketing panel with a 3-slide auto-rotating carousel, and a white right form panel — completely different from the current plain centered card. It also revealed: a second font (DM Sans, for headlines) alongside the existing Inter; precise color/spacing values not previously captured; real downloadable image/icon assets (**expiring ~7 days from pull, 2026-07-13** — must be downloaded to the repo immediately, never referenced live from Figma's CDN); 54px-tall inputs/buttons vs. the current ~36px default; and a real hide/show password icon implying working toggle behavior, not just decoration.

Investigating the Postman collection (at the user's request) also surfaced a real flow correction: `POST /api/auth/register` returns no access token — only `POST /api/auth/login` does — so any profile/role/KYC step needs to happen **after** login, not immediately after registration. The current code already redirects register-success → `/login` (correct), but does so silently (toast + instant redirect) rather than through an explicit confirmation screen — which is exactly what the previously-unaccounted-for "After Creating" Figma node (`1398-9807`) turns out to be.

## Decisions confirmed by the user
1. **Logo wordmark**: "Crest" uses SF Pro (Apple system font, not legally available as a webfont). Export the icon+wordmark together as **one flattened image asset** from Figma — guarantees exact fidelity for the one element a live-text substitute can't match.
2. **Background decoration**: the left panel's ~15 overlapping blurred/rotated/blend-mode shapes should be **flattened to one exported image** from Figma, used as a CSS `background-image` — blur/rotation/blend-mode render subtly differently in live CSS vs. Figma's compositor, so this is the only option that's actually pixel-identical.
3. **"After Creating" screen is real scope** — build it as an explicit confirmation screen with a "Continue to Login" button. This does NOT change the actual navigation target (already correctly `/login`) — it replaces the current silent toast+instant-redirect with a real intermediate screen matching Figma.
4. **"Complete Profile / Select Role" is a discovered gap, explicitly OUT of scope for this pass** — no Figma design exists for it yet, and it's a functional flow addition (needs a post-login screen calling some profile-update endpoint), not visual polish. Document clearly, do not build.

## Recommended approach

### 0. Persist this blueprint (this file)

### 1. Asset pipeline (before any component code)
Download and permanently save Figma assets for the Login screen now (already pulled, expiring soonest): house illustration, Crest logo+wordmark lockup (flattened per decision #1), flattened background decoration (per decision #2), hide/show icon, Google "G" icon, divider line SVG. Convention: `public/images/auth/shared/` (reused: logo, eye icons, google icon, divider) and `public/images/auth/login/` (screen-specific: house illustration, background). Repeat this download step immediately after pulling each subsequent screen's Figma data — assets are perishable, don't batch downloads for later.

### 2. Layout architecture
- New `src/features/auth/components/auth-marketing-panel.tsx` (`"use client"`) — owns the 3-slide carousel (local `useState` + `setInterval`, no new dependency), the flattened background image, house illustration, headline (DM Sans Bold 40px/48px) + subheading, and the 3-dot indicator. Slide content is a small local array (3 known headline/subtext pairs from earlier session research).
- `src/app/(auth)/layout.tsx` stays a Server Component, restructured to a flex split-screen shell: fixed 708px marketing panel (`hidden ... lg:block` — hidden below 1024px, since Figma is 1440px-desktop-only and no mobile frame exists; flag this breakpoint choice as inferred, not designed) + flexible right column centered to `max-w-[379px]`. Translate Figma's absolute positioning into normal flexbox rather than replicating literal offsets.
- Applies automatically to `forgot-password`/`reset-password` too (shared layout) — reasonable default, not yet Figma-verified for those two screens specifically.

### 3. Fonts
- Add DM Sans in `src/app/layout.tsx` via `next/font/google` (confirmed available), weight 700 only (bold headline use), as `--font-dm-sans`. Add a `--font-heading` mapping in `globals.css`'s `@theme inline` block (→ `font-heading` Tailwind utility). Inter remains the site-wide default, untouched.

### 4. Design tokens (`src/app/globals.css`)
- Do **not** overwrite `--foreground` with the newly-confirmed `#141a33` — that token is app-wide and was inferred from mixed sources; overwriting risks silently regressing already-shipped KYC screens. Add a new, narrowly-scoped `--auth-heading: #141a33` token instead (mapped to `text-auth-heading`), applied only to auth-screen `<h1>`s.
- Add real confirmed values as reusable tokens (recur across every field/button): `--input: rgba(102,102,102,0.16)` (corrects the existing placeholder value), `--input-background: #f9fafb` (distinct from `--muted`, do not conflate), `--input-placeholder: rgba(102,102,102,0.5)`, `--button-border: rgba(6,29,82,0.16)`, each with a matching `@theme inline` `--color-*` mapping.
- `rgba(0,0,0,0.06)` Google-button background: single-use so far, use Tailwind's arbitrary-opacity utility (`bg-black/[0.06]`) rather than minting a token; promote later only if it recurs.

### 5. Component sizing
- `src/components/ui/button.tsx`: add an `xl: "h-[54px] rounded-lg px-6 text-base font-semibold has-[>svg]:px-4"` size to the existing `cva` (confirmed structure already has `xs/sm/lg/icon` etc.) — normal shadcn workflow, not a deviation. `defaultVariants` stays `size: "default"`; auth screens pass `size="xl"` explicitly.
- `src/components/ui/input.tsx`: confirmed currently a plain function, no `cva`. Introduce the same `cva` pattern as `button.tsx` for consistency: `size: "default" | "xl"`, `xl: "h-[54px] rounded-lg px-4"` wired to the new `--input-background`/`--input-placeholder` tokens.
- New `src/components/ui/password-input.tsx` — wraps `Input size="xl"` with real show/hide toggle (local `useState<boolean>`, `Eye`/`EyeOff` from `lucide-react` unless the real Figma icon asset is used instead for exact fidelity — prefer the real asset). Placed in `components/ui/` (not auth-scoped) since password fields will likely recur outside auth later (e.g. account settings). **Explicitly flag in a code comment**: this is a functional addition riding along with the visual pass (today's password fields have zero toggle behavior) — not silently smuggled in.

### 6. New primitives
No shadcn `carousel` primitive — overkill for 3 non-interactive auto-rotating slides with no drag/touch; the custom `AuthMarketingPanel` (§2) covers it. No other new primitives needed yet; revisit `progress` only if Create Password's Figma pull shows a matching treatment.

### 7. New screen: "After Creating" confirmation
- New route `src/app/(auth)/register/success/page.tsx` (or similar — confirm exact naming against Figma copy once pulled). Shows a confirmation message + "Continue to Login" button.
- `register/password/page.tsx`'s `onSuccess` changes from `wizard.reset(); toast.success(...); router.push("/login")` to `wizard.reset(); router.push("/register/success")`; the new success screen's button does the actual `router.push("/login")` (optionally keeping a toast there too).
- Pull Figma data for node `1398-9807` before building this screen (not yet pulled).

### 8. Rollout order (incremental, matching the rate-limit history)
1. **Login/Welcome** — all shared infrastructure gets built here once (marketing panel, split layout, tokens, `size="xl"`, DM Sans, asset pipeline). Every other screen consumes it.
2. **`VerifyCodeForm`** (shared by Verify Email + Verify Phone) — pull Verify Email (`1398-6371`) in full; spot-check Verify Phone (`1453-1567`) via a lighter metadata call only.
3. **Create Account** (`register/page.tsx`, node `1398-6180`).
4. **Phone Number** (`register/phone/page.tsx`, node `1398-6492`).
5. **Create Password** (`register/password/page.tsx` + `password-strength.tsx`, nodes `1398-7558`/`1398-6568`) — depends on `PasswordInput` from step 1, pulled after it exists.
6. **"After Creating"** success screen (§7, node `1398-9807`).
7. **forgot-password / reset-password** — follow-on mini-phase, reusing the shell/components already built; no Figma pulled yet for these two.

Pull each remaining screen's Figma data 1-2 at a time, immediately before implementing it — not all upfront. Download that screen's assets immediately after each pull (§1).

### 9. Documentation
- **New `docs/design-fidelity-notes.md`** (separate from `docs/design-vs-backend-gaps.md`, whose header explicitly scopes it to Figma-vs-backend-API mismatches only — mixing in pure visual decisions would dilute an established convention). Log there: the SF Pro→image decision, the background→image decision, the inferred mobile breakpoint, the `--auth-heading` vs `--foreground` split and why.
- **`docs/handoff.md`**: new "Phase 3 — Auth UI polish (pixel-perfect pass)" section, marked in-progress, appended to incrementally as each screen ships (not written once at the end). Include the password-toggle functional addition here (working show/hide behavior is exactly the kind of implemented-surface fact this doc tracks) and the discovered "Complete Profile/Select Role" gap (§ Context) as a flagged next-phase item.
- **`docs/figma-links.md`**: update each screen's Status column from "Built (Phase 1, placeholder styling)" to "Built (Phase 3, pixel-perfect)" incrementally as it ships.

## Critical files
- `src/app/(auth)/layout.tsx`, `src/features/auth/components/auth-marketing-panel.tsx` (new)
- `src/app/layout.tsx` (DM Sans), `src/app/globals.css` (tokens)
- `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/password-input.tsx` (new)
- `src/app/(auth)/login/login-form.tsx` and all 5 register-wizard page files (visual rework only, existing hook/schema/API logic untouched)
- `src/app/(auth)/register/success/page.tsx` (new)
- `docs/design/account-creation-pixel-perfect-plan.md` (this file), `docs/design-fidelity-notes.md` (new), `docs/handoff.md`, `docs/figma-links.md`

## Verification
No test infra (standing instruction) — same manual discipline as every prior phase:
1. `pnpm typecheck`, `pnpm build`, `pnpm lint` clean after each screen ships.
2. Visual check via the Figma `get_screenshot` tool output compared side-by-side against the running dev server (`pnpm dev`), for each screen as it's rebuilt — this is the actual "pixel-perfect" verification step, not just a functional smoke test.
3. Confirm no regression to existing functional behavior (real API calls, validation, navigation) — the wizard/hooks/schema layer is untouched, so this should be a pure visual diff, but verify the full register→login flow still works end-to-end after the new success screen is added.
4. Confirm downloaded assets render correctly from `public/images/auth/` (not from expiring Figma CDN URLs) before considering any screen "done."
