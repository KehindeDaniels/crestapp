# Design Fidelity Notes

> Scope: pure visual-fidelity decisions made while rebuilding screens pixel-perfect against Figma — flattening choices, inferred breakpoints, token splits, and copy that wasn't confirmed by a design pull. **Not** for design-vs-backend API mismatches (see `docs/design-vs-backend-gaps.md`) and **not** for implementation bugs (see `docs/bug-report-csrf-and-otp-leak.md`).

## Login / Welcome screen (`aDI3HOS6NVQWnLdIx5Zvif`, node `1395:1540`)

### Flattened assets (user-approved, see `docs/design/account-creation-pixel-perfect-plan.md`) — revised, see below
- **Logo lockup** (`public/images/auth/shared/logo-lockup.png`): the "Crest" wordmark is set in SF Pro (Apple system font), not legally available as a webfont. Exported the icon + wordmark together as one flattened PNG via `get_screenshot` on node `1398:4833`, rather than reproducing live text. Still flattened — this decision stands.
- **House illustration** (`public/images/auth/login/house-illustration.png`): a real raster illustration (not a CSS-reproducible shape composition), exported as its own asset. Still flattened — this decision stands.

### Background/text: reverted from a flattened image back to live CSS
The initial pass for the marketing panel's background hit a real bug — exporting just the decorative blend-mode shapes layer (node `1398:1483`) in isolation rendered it against a transparent/white backdrop instead of the opaque navy rect (`1398:1482`) it's designed to sit on, since several shapes use `mix-blend-mode: plus-lighter`, which needs that navy backdrop to mean anything (confirmed by compositing the export over navy in code and seeing zero change — genuinely washed-out pixels, not unrendered transparency).

The fix at the time was to export the *entire* panel (background + headline + house + dots, node `1398:1481`) as one flattened image — technically correct pixel-for-pixel, but the wrong tradeoff: it baked the headline into non-selectable, non-screen-reader-readable raster pixels, and made true responsiveness impossible (a raster image can only crop/scale, not reflow). Reverted per explicit user direction: **only the house illustration should be an image; the navy background, "rays of light," headline, and subheading should all be live CSS.**

Current approach (`src/features/auth/components/auth-marketing-panel.tsx`):
- Navy base (`bg-[#061d52]`) + a radial-gradient glow + two blurred, rotated `linear-gradient` bars approximate the original's ~15-shape blend-mode composition. This is a **visual approximation, not pixel-identical** — reproducing that many overlapping blurred/rotated/blend-mode shapes in live CSS was exactly the problem the original "flatten it" call was trying to avoid. Revisit with a closer CSS reproduction (or ask for more shapes to be exported as reference) if the current approximation looks too far off in a live visual check.
- Headline/subheading are live text again (DM Sans Bold / Inter Regular via the existing `--font-heading` token), restoring both accessibility and the ability to actually vary copy per slide later.

### Per-screen slides, confirmed (not a carousel — no timer, no auto-rotation)
The 3-dot indicator isn't decorative or animated — it reflects **which screen you're on**, confirmed by reading the user-exported screenshots for every auth screen (`docs/design/screenshots/`). Each screen statically shows one of 3 slides; `src/features/auth/components/auth-marketing-panel.tsx` picks the slide from `usePathname()` via a `SLIDE_INDEX_BY_PATH` map. Confirmed mapping:

| Route | Slide | Headline | Illustration |
|---|---|---|---|
| `/login` | 0 | "A safer way To Rent Or Buy Homes" | `login/house-illustration.png` |
| `/register` | 1 | "Connect Directly With Landlords" | `register/landlord-illustration.png` |
| `/register/verify-email` | 2 | "Your Safety Comes First" | `login/key-lock.svg` |
| `/register/phone` | 0 | (same as login) | (same as login) |
| `/register/verify-phone` | 0 | (same as login) | (same as login) |
| `/register/password` (all 5 password-strength states checked) | 0 | (same as login) | (same as login) |

This is **not** a clean repeating 0-1-2-0-1-2 cycle — screens 4-6 (phone, verify-phone, password) all show slide 0, not continuing the cycle. That's what every exported screenshot for those screens actually shows, so it's reproduced as-is rather than "corrected" into an idealized pattern. `forgot-password`, `reset-password`, and the not-yet-built `register/success` aren't in Figma yet and fall back to slide 0.

The slide-1 illustration (`register/landlord-illustration.png`, a landlord pointing at a house) came from a fresh `get_design_context` pull on node `1398:6180` — it wasn't among the two SVGs exported directly (`key-lock.svg`, used for slide 2; the user's re-exported house SVG was left unused since the already-working `house-illustration.png` PNG, pulled from the same original Figma asset, made re-wiring it pure churn for no fidelity gain).

### Layout: fixed absolute offsets replaced with flex distribution
The Figma frame positions everything with fixed pixel offsets against a 708×1024 canvas (headline at `top:115px`, house frame at `top:365px` height `404px`, dots at `top:835px`). Ported literally, this overflows vertically on real desktop viewports shorter than ~860px — the dot indicator (the bottom-most element) gets pushed below the fold and clipped, which is exactly the "scrolling and a cut bottom" bug the user caught. Replaced with a `flex flex-col justify-between` layout: headline block, then a `flex-1 min-h-0` region holding the house illustration (sized via `aspect-ratio` + `height: 100%` so it shrinks proportionally instead of overflowing, capped at the original 404px on tall viewports), then the dot indicator — so everything compresses together on short viewports instead of one element going off-screen.

### Page-level scroll bug (`/register` specifically, but the fix is general)
`(auth)/layout.tsx` was `flex min-h-screen` — a `min-height`, not a fixed height, so when a screen's form content (e.g. `/register`'s three fields + terms text) was taller than the viewport, the *whole flex row* grew past 100vh, and the document scrolled. The marketing panel has its own fixed `h-screen`, so during that scroll it didn't stay pinned — it visually "scrolled away" while the still-too-tall form kept going, which read as a broken layout, not just a long page. Other screens never hit this because their content happened to be short enough to fit.

Fixed generally, not just for `/register`: at `lg`+, the outer container is now `h-screen overflow-hidden` (a hard cap, not a minimum) and the form column is `h-full overflow-y-auto` — so the page itself never scrolls and the marketing panel never moves, and if any screen's content is ever taller than the viewport, only the form column scrolls internally, contained within the white area. Below `lg` (mobile, where the marketing panel is hidden anyway) the layout reverts to normal document scrolling — there's no split-panel to keep pinned there.

### Inferred / unconfirmed
- **Mobile breakpoint**: Figma only has a 1440px desktop frame for this screen. The marketing panel is hidden below Tailwind's `lg` breakpoint (1024px) — an inferred choice, not a designed one. Revisit if/when a mobile frame is provided.
- **Panel width responsiveness**: Figma's frame is a fixed 708px (at a 1440px canvas), which doesn't fit as a hard-coded value between the `lg` breakpoint (1024px) and ~1440px without crowding the 379px form column. Used `clamp(360px, 49vw, 708px)` so the panel scales fluidly and only hits the exact Figma value at ~1445px+ viewports — an inferred responsive strategy, not a designed one (Figma has no intermediate breakpoint frames to check against).
- **Headline/body text sizing below the `xl` breakpoint**: Figma's type sizes (40px/24px) are only confirmed at the 1440px frame. Stepped them down at `lg`/`xl` (28px/16px → 40px/24px) so the panel doesn't look oversized on 1024–1279px viewports — an inferred scale, not a designed one.
- **Email field placeholder**: Figma's mockup shows `successayomide@gmail.com` styled identically to the password field's `Enter` placeholder (same 50%-opacity treatment) — read as fake demo content standing in for a placeholder, not literal copy to ship. Used `Enter your email` instead, matching the password field's placeholder convention.

### Token decisions
- **`--auth-heading: #141a33`** was added as a new, narrowly-scoped token rather than overwriting the existing `--foreground: #111827`. The existing value was inferred from mixed sources and already backs shipped KYC screens; overwriting it risked a silent regression there. `--auth-heading` is applied only to the auth `<h1>` for now.
- **`--input`** was corrected from a placeholder `#e5e7eb` to the confirmed `rgba(102, 102, 102, 0.16)` (this token is shared/global, so the correction applies everywhere, not just auth).
- **`--input-background: #f9fafb`** is intentionally distinct from the existing `--muted: #f9f9f9` — they're visually close but not the same value, and conflating them would drift silently if either is tuned later.
- Google button background `rgba(0,0,0,0.06)` is single-use so far — implemented as an arbitrary-opacity Tailwind utility (`bg-black/[0.06]`) rather than a new token; promote to a token only if it recurs on another screen.

### Functional addition riding along with the visual pass
- **Real password show/hide toggle** (`src/components/ui/password-input.tsx`): the Figma mockup shows a static "hide" (eye-slash) icon with no toggled-open state — password fields had zero toggle behavior before this pass. The "hidden" state uses the real exported Figma icon (`icon-hide.svg`) for exact fidelity; the "shown" state falls back to `lucide-react`'s `Eye` icon since Figma never designed that state. Now used on both Login and Create Password.

## Create Password screen (`aDI3HOS6NVQWnLdIx5Zvif`, nodes `1398:7558` / `1398:6568`)

### Password strength bar + checklist
Confirmed from both node pulls (both landed on the 0%-empty variant, not the colored states): track `#edecef`, neutral/empty fill `#605d67`, unmet-checklist-circle border `#9d9aa4`, 16px circle, checklist text `#666`. **Not confirmed**: the exact Weak/Fair/Strong fill colors and the "(Weak)"/"(Fair)"/"(Strong)" label — those were only visible in the user-exported screenshots (`docs/design/screenshots/Onboarding Screen-AC-Create Password{3,-4,-5}.png`), not in any pulled node data. Approximated with the app's existing `--destructive` (Weak) and `--success` (Strong) tokens; "Fair" has no existing token so uses a one-off amber (`#f59e0b`) — promote to a token only if amber recurs elsewhere. Bar width is a continuous `metCount/4` rather than the 3 discrete widths eyeballed from the screenshots (~33/66/100%) — more proportionate across all 4 requirements and close enough to the screenshots to not be worth hardcoding three magic-number breakpoints.

### Confirmed screen-specific sizing that differs from Login
- **Inputs are 48px tall here** (`h-[48px]` in both node pulls), not the 54px used on Login/other screens. Confirmed twice, not a one-off — implemented as `<PasswordInput className="h-12" />`, overriding the shared `size="xl"` (54px) variant's height via `tailwind-merge` rather than adding a new global input size for one screen.
- **Subheading uses `#585d65` at 14px**, not Login's `#666` at 16px. Single-use so far — arbitrary Tailwind value, not a new token.
- The submit button stays 54px (`size="xl"`, unmodified) even though the inputs above it are 48px — this is what both node pulls literally show, not an inconsistency introduced here.

### Wizard step dots diverge from the literal Figma export, deliberately
Every register-wizard screenshot (Create Account through Create Password) shows the same 3 marketing dots — Figma reuses the login-screen carousel indicator across all of them rather than giving the wizard its own progress UI. Reproduced literally, this means dots stop moving in a functioning progress sense (phone/verify-phone/password all "look like step 1"), which reads as broken once the dots respond to real navigation instead of sitting static in a screenshot. Per explicit product direction, the register wizard now gets its own dot count matching its actual step count (5, one per `WIZARD_STEPS` in `auth-marketing-panel.tsx`) with the active dot tracking the current step — `/login` (not part of the wizard) keeps the original 3-dot marketing-slide indicator.

## Asset expiry
All Figma CDN asset URLs pulled 2026-07-14 expire ~7 days out. Everything referenced above has already been downloaded to `public/images/auth/{shared,login,register}/` and is served locally — none of the shipped code references a live `figma.com/api/mcp/asset/...` URL.
