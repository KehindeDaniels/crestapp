# Design vs Backend Gaps

> Running log of mismatches between the Figma designs and the actual backend API contract (`Crest App Laravel API Collection.postman_collection (1).json`). Updated at the end of every phase. This is about **design ↔ endpoint shape mismatches** — for live implementation bugs found by testing (e.g. the CSRF/OTP issues), see `docs/bug-report-csrf-and-otp-leak.md`.

## How to read this
- **Field the API needs but the design doesn't show** → we added a form field not in Figma, always defaulted/flagged in code with a comment.
- **Field the design shows but the API doesn't use** → we render it cosmetically without wiring it to any endpoint.
- **Undocumented response shape** → the Postman collection has no example response for that endpoint, so we built against a best-effort assumption and flagged it as unverified.

---

## Phase 1 — Auth (Account Creation)

| Gap | Detail | What we did |
|---|---|---|
| Missing role picker | `POST /api/auth/register` requires `role` (tenant/landlord/seller/buyer/lawyer/surveyor). No screen in the Account Creation flow (Welcome/Login → Create Account → Verify Email → Phone → Verify Phone → Create Password) lets the user pick one. | Defaulted to `"tenant"` in `src/app/(auth)/register/password/page.tsx`, marked `TODO(product)`. **Needs a product decision**: missing screen, post-registration onboarding step, or role inferred from entry point. |
| Google login unusable | Figma shows a "Log In with Google" button; `POST /api/auth/login/google` has an empty example in Postman — no documented request/response shape. | Button renders (matches design) but is `disabled`, with a `TODO(backend)` comment. Not wired up. |
| Password strength thresholds | Figma shows exactly 3 labels (Weak/Fair/Strong) on the Create Password screen with no documented cutoffs. | Inferred mapping in `src/app/(auth)/register/password/password-strength.tsx`: 4/4 requirements met = Strong, 2–3 = Fair, 0–1 = Weak. Adjust if a real spec surfaces. |
| Phone OTP send — no documented example | `POST /api/auth/verification/send` collection example only shows `type: "email"`; phone case had zero example and an empty `response: []`. | Built against the documented email shape, assumed phone works identically. Live testing later surfaced two real backend bugs here — see `docs/bug-report-csrf-and-otp-leak.md`. |

## Phase 2 — KYC

| Gap | Detail | What we did |
|---|---|---|
| Missing document number field | `POST /api/kyc/submit` requires `document_number`, but no KYC screen (intro → upload ID → selfie → processing/success) shows a field for it. | Added a real "Document Number" input in `src/app/(onboarding)/kyc/id/page.tsx` — this is user-entered data, not something safe to default (unlike `role`). Flagged in code comments. |
| Country/Region field unused by the API | The Upload ID screen shows a "Choose your Country/Region" dropdown, but `kyc/submit`'s payload has no country field at all — it's not consumed anywhere. | Rendered as a static, cosmetic-only input (defaults to "Nigeria"), not wired to any endpoint. Also skipped wiring `GET /api/platform/configuration/countries` since that endpoint has zero documented response shape either — not worth guessing at a shape for a field the API doesn't use. |
| `document_type` enum only partially confirmed | Postman's only example uses `"national_id"`. Figma's ID-type tabs show 3 options (National ID card / Driver License / International Passport). | Added all 3 as `KYC_DOCUMENT_TYPES` in `src/features/kyc/types.ts`, but only `national_id` is confirmed against a real example — the other two are inferred from the UI, not the backend contract. Verify before relying on them. |
| File upload response shape undocumented | `POST /api/platform/files/upload` (used to turn ID/selfie photos into the URLs `kyc/submit` needs) has an empty `response: []` in Postman. | `parseUploadUrl()` in `src/features/kyc/api.ts` defensively checks several likely field names (`url`, `file_url`, `path`, nested under `data`) and **throws loudly** if none match, rather than silently returning something wrong. Needs live confirmation once the CSRF issue is fixed. |
| KYC submit response shape undocumented | `POST /api/kyc/submit` has `"response": []` — no example at all. | Assumed only `{ message: string }` is safe to rely on; no other fields are read from this response. |
| No live camera capture | Figma's selfie screen shows "Look directly into the camera" with a live face-scan graphic (corner brackets, scanning animation). | Implemented as a plain file input with `capture="user"` (triggers the native camera app on mobile, opens a file picker on desktop) — no `getUserMedia` video stream/live preview. Deliberate simplification, not a missing feature we forgot. |
| KYC status check not built | `POST /api/kyc/find-single` (with `include_kyc: true`) could theoretically answer "what's my KYC status," but its only documented example response includes `user` + `profile` and **no `kyc` field at all**, even with `include_kyc` set. | Skipped building a `useMyKycStatus()` hook — the response shape for actual KYC status is unconfirmed. `KycGuard` (built in Phase 1) stays prop-driven, waiting on this. |

---

## Not yet compared (future phases — flagging now, not asserting a mismatch)
These are things noticed during the initial capability check, before the relevant Figma screens were inspected in detail. Revisit when that phase starts:
- **No single `GET /properties/{id}`** — property detail is fetched via `search` with an `id` filter. Fine for now; worth double-checking the Search Property / Listing Figma screens don't assume a dedicated detail endpoint's response shape.
- **Notifications**: only mark-single-read exists — no mark-all or delete. Check if any screen implies a "mark all as read" action.
- **No saved/favorites endpoint** — check if any property card in Figma shows a heart/save icon.
- **Messaging is REST-only, no websocket** — if the messaging screens imply live typing indicators/online presence, that's a gap (would need polling instead).
- **Admin Dashboard** (separate Figma page, Phase 7) — not inspected screen-by-screen yet; expect gaps once it is (see `docs/frontend-blueprint.md` §17 for what's already known to be missing on the backend: user suspend/activate, non-KYC user directory, admin support desk, single stats-overview endpoint).
