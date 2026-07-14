# Design Fidelity Notes

> Scope: pure visual-fidelity decisions made while rebuilding screens pixel-perfect against Figma — flattening choices, inferred breakpoints, token splits, and copy that wasn't confirmed by a design pull. **Not** for design-vs-backend API mismatches (see `docs/design-vs-backend-gaps.md`) and **not** for implementation bugs (see `docs/bug-report-csrf-and-otp-leak.md`).

## Login / Welcome screen (`aDI3HOS6NVQWnLdIx5Zvif`, node `1395:1540`)

### Flattened assets (user-approved, see `docs/design/account-creation-pixel-perfect-plan.md`)
- **Logo lockup** (`public/images/auth/shared/logo-lockup.png`): the "Crest" wordmark is set in SF Pro (Apple system font), not legally available as a webfont. Exported the icon + wordmark together as one flattened PNG via `get_screenshot` on node `1398:4833`, rather than reproducing live text.
- **Background decoration** (`public/images/auth/login/background-decoration.png`): the left panel has ~15 overlapping blurred/rotated/blend-mode shapes. Live CSS blur/blend-mode renders subtly differently across browsers vs. Figma's compositor, so this was flattened to one exported PNG (`get_screenshot` on node `1398:1483`, the background container without the text/house/dots overlays) and used as a CSS `background-image`.

### Inferred / unconfirmed
- **Mobile breakpoint**: Figma only has a 1440px desktop frame for this screen. The marketing panel is hidden below Tailwind's `lg` breakpoint (1024px) — an inferred choice, not a designed one. Revisit if/when a mobile frame is provided.
- **Carousel slides 2 & 3 copy**: the 3-dot indicator confirms this is a real 3-slide rotating carousel, and slide 1's headline/subheading are pulled verbatim from Figma. Slides 2 ("Connect Directly With Landlords") and 3 ("Your Safety Comes First") use headlines surfaced during earlier design research, but their **subheadings were never pulled from a Figma node** — the current subtext for those two is a reasonable placeholder, not confirmed copy. See `src/features/auth/components/auth-marketing-panel.tsx`. Replace once those slide nodes are identified and pulled.
- **Email field placeholder**: Figma's mockup shows `successayomide@gmail.com` styled identically to the password field's `Enter` placeholder (same 50%-opacity treatment) — read as fake demo content standing in for a placeholder, not literal copy to ship. Used `Enter your email` instead, matching the password field's placeholder convention.

### Token decisions
- **`--auth-heading: #141a33`** was added as a new, narrowly-scoped token rather than overwriting the existing `--foreground: #111827`. The existing value was inferred from mixed sources and already backs shipped KYC screens; overwriting it risked a silent regression there. `--auth-heading` is applied only to the auth `<h1>` for now.
- **`--input`** was corrected from a placeholder `#e5e7eb` to the confirmed `rgba(102, 102, 102, 0.16)` (this token is shared/global, so the correction applies everywhere, not just auth).
- **`--input-background: #f9fafb`** is intentionally distinct from the existing `--muted: #f9f9f9` — they're visually close but not the same value, and conflating them would drift silently if either is tuned later.
- Google button background `rgba(0,0,0,0.06)` is single-use so far — implemented as an arbitrary-opacity Tailwind utility (`bg-black/[0.06]`) rather than a new token; promote to a token only if it recurs on another screen.

### Functional addition riding along with the visual pass
- **Real password show/hide toggle** (`src/components/ui/password-input.tsx`): the Figma mockup shows a static "hide" (eye-slash) icon with no toggled-open state — password fields had zero toggle behavior before this pass. The "hidden" state uses the real exported Figma icon (`icon-hide.svg`) for exact fidelity; the "shown" state falls back to `lucide-react`'s `Eye` icon since Figma never designed that state.

## Asset expiry
All Figma CDN asset URLs pulled 2026-07-14 expire ~7 days out. Everything referenced above has already been downloaded to `public/images/auth/{shared,login}/` and is served locally — none of the shipped code references a live `figma.com/api/mcp/asset/...` URL.
