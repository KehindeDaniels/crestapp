# Figma Links — Crest App

## Which file key to use — read this first

There are now **three** Figma file keys that have come up. Only one is actually usable via the Figma MCP tools right now:

| Key                      | Slug               | MCP access                                           | Use for                                                                                     |
| ------------------------ | ------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `MSrs3Woe4rF8yM8PVYRYSa` | `Crest-App`        | ❌ No access — not shared with the connected account | This is the **canonical** file per the project owner, but we can't read it yet.             |
| `GQO1uIkdHaiFCXHdsD5KuE` | `Crest-App--Copy-` | ✅ Access (original working copy)                    | Superseded — kept for reference only, don't add new links against this one.                 |
| `aDI3HOS6NVQWnLdIx5Zvif` | `Crest-App--Copy-` | ✅ Full access (shared specifically for this)        | **Use this one for all new links.** A personal duplicate the user made and shared directly. |

**Caveat:** the working copy (`aDI3HOS6NVQWnLdIx5Zvif`) was duplicated from the _old_ copy (`GQO1uIkdHaiFCXHdsD5KuE`), not from the canonical file (`MSrs3Woe4rF8yM8PVYRYSa`). It's **unconfirmed** whether it includes the 6 newer screens (5 listing-type variants + History) that were only seen linked against the canonical file so far. Verify before assuming they're there.

Once `MSrs3Woe4rF8yM8PVYRYSa` is shared with `kehindedaniels501@gmail.com` (even Viewer access), everything can move to that file directly and this three-file situation goes away.

---

## Account Creation — sub-screens (confirmed accessible, `aDI3HOS6NVQWnLdIx5Zvif`)

Screen-by-screen breakdown, in flow order. Status column tracks the pixel-perfect rebuild pass (`docs/design/account-creation-pixel-perfect-plan.md`), not just functional completeness:

| Screen                                                                    | Node                                                | Status                                                                                                                    | Link                                                                                           |
| ------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Welcome / Login                                                           | `1395-1540`                                         | ✅ Built (Phase 3, pixel-perfect)                                                                                         | [link](https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1395-1540) |
| Create Account (name/email)                                               | `1398-6180`                                         | 🚧 Built (Phase 1, placeholder styling)                                                                                   | [link](https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1398-6180) |
| Verify Email                                                              | `1398-6371`                                         | 🚧 Built (Phase 1, placeholder styling)                                                                                   | [link](https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1398-6371) |
| Phone Number                                                              | `1398-6492`                                         | 🚧 Built (Phase 1, placeholder styling)                                                                                   | [link](https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1398-6492) |
| Verify Phone                                                              | `1453-1567`                                         | 🚧 Built (Phase 1, placeholder styling)                                                                                   | [link](https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1453-1567) |
| Create Password                                                           | `1398-7558`                                         | 🚧 Built (Phase 1, placeholder styling)                                                                                   | [link](https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1398-7558) |
| Create Password (flow/variant states)                                     | `1398-6568`                                         | 🚧 Built (Phase 1, placeholder styling)                                                                                   | [link](https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1398-6568) |
| After Creating (previously missed)                                        | `1398-9807`                                         | ⬜ Not built (Phase 3 scope, not yet pulled)                                                                              | [link](https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1398-9807) |
| After Account Creation (post-login, distinct from "After Creating" above) | unknown — no node link available, only a screenshot | ✅ Built (Phase 2.7, approximated from screenshot, not a node pull) — `/welcome`, `src/app/(onboarding)/welcome/page.tsx` | screenshot only: `docs/design/screenshots/after account creation.png`                          |

`node-id=0-1` was also included but is very likely just the page/canvas root, not a distinct screen — not listed as a screen here, flagging in case it turns out to matter.

> Add more feature breakdowns below in this same per-screen format as they're provided — one row per screen, not one link per whole feature (see reasoning in conversation: section-level pulls are unreliable and burn the Figma rate limit faster).

---

## Overview — other features (not yet broken into sub-screens)

File key for these is still the canonical one (`MSrs3Woe4rF8yM8PVYRYSa`) — **not currently readable**, kept here as a reference until either that file is shared or equivalent working-copy links are provided.

| Screen                          | Status                                                            | Link                                                                                                |
| ------------------------------- | ------------------------------------------------------------------| ---------------------------------------------------------------------------------------------------|
| KYC                              | ✅ Built (Phase 2, pixel-perfect pass done Phase 3 — see below)  | [node 1398-7021](https://www.figma.com/design/MSrs3Woe4rF8yM8PVYRYSa/Crest-App?node-id=1398-7021)  |
| Home                             | 🚧 Placeholder only (Phase 3 scope)                              | [node 1411-2864](https://www.figma.com/design/MSrs3Woe4rF8yM8PVYRYSa/Crest-App?node-id=1411-2864)  |
| Search Property                  | ⬜ Not started (Phase 3)                                          | [node 1417-5223](https://www.figma.com/design/MSrs3Woe4rF8yM8PVYRYSa/Crest-App?node-id=1417-5223)  |
| Listing Welcome                  | ⬜ Not started (Phase 3/4)                                        | [node 1465-6444](https://www.figma.com/design/MSrs3Woe4rF8yM8PVYRYSa/Crest-App?node-id=1465-6444)  |
| Listing for Sale (apartment)     | ⬜ Not started (Phase 4)                                          | [node 1422-6880](https://www.figma.com/design/MSrs3Woe4rF8yM8PVYRYSa/Crest-App?node-id=1422-6880)  |
| Listing for Rent (apartment)     | ⬜ Not started (Phase 4)                                          | [node 1465-3206](https://www.figma.com/design/MSrs3Woe4rF8yM8PVYRYSa/Crest-App?node-id=1465-3206)  |
| Listing for Airbnb (apartment)   | ⬜ Not started (Phase 4)                                          | [node 1465-4815](https://www.figma.com/design/MSrs3Woe4rF8yM8PVYRYSa/Crest-App?node-id=1465-4815)  |
| Listing for Sale (land)          | ⬜ Not started (Phase 4)                                          | [node 1510-5552](https://www.figma.com/design/MSrs3Woe4rF8yM8PVYRYSa/Crest-App?node-id=1510-5552)  |
| Listing for Rent (land)          | ⬜ Not started (Phase 4)                                          | [node 1510-8337](https://www.figma.com/design/MSrs3Woe4rF8yM8PVYRYSa/Crest-App?node-id=1510-8337)  |
| History                          | ⬜ Not started (Phase 5/6 — likely transaction/contract history) | [node 1514-13694](https://www.figma.com/design/MSrs3Woe4rF8yM8PVYRYSa/Crest-App?node-id=1514-13694)|

### KYC — working-copy links (use `aDI3HOS6NVQWnLdIx5Zvif`) — pixel-perfect pass done Phase 3, worked from screenshots in `docs/design/screenshots/kyc/`

| Screen                               |        Node | Link                                                                                   |
| ------------------------------------ | ----------: | -------------------------------------------------------------------------------------- |
| KYC intro (root)                     | `1398-7021` | https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1398-7021 |
| KYC (sub)                            | `1398-7022` | https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1398-7022 |
| Upload Identification Card           | `1404-1759` | https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1404-1759 |
| Upload Identification Card (variant) | `1411-2496` | https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1411-2496 |
| Take a Selfie                        | `1411-2496` | https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1411-2496 |
| Scanning / Capture guidance          | `1453-2052` | https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1453-2052 |
| Additional selfie/capture screen     | `1411-2805` | https://www.figma.com/design/aDI3HOS6NVQWnLdIx5Zvif/Crest-App--Copy-?node-id=1411-2805 |

## Other Figma pages (not yet linked individually)

- **Dashboard** — separate admin persona, Phase 7, not yet inspected screen-by-screen (see `docs/frontend-blueprint.md` §17).
- **Logo Branding** — likely resolves the design-token `TODO`s in `src/app/globals.css` (secondary/accent tint, success green, destructive/border colors, dark mode) — not yet inspected.
