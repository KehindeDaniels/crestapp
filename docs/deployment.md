# Deployment — Crest frontend (static export → Hostinger)

This app is built as a **static site** (`next build` with `output: "export"` →
an `out/` folder of plain HTML/JS/CSS), then uploaded to Hostinger shared
hosting — the same way the existing `admin.crestapp.ng` SPA is deployed. No
Node server, no VPS, no Vercel.

Confirmed by the build: all 40 routes are `○ (Static)`, there is no middleware,
and `out/` contains `index.html`, per-route `.../index.html` files, a hashed
`_next/static/` bundle, and a generated `.htaccess`.

---

## 1. One decision before you deploy: root vs subdomain

`crestapp.ng` currently runs a **live WordPress site** (its files are in that
domain's `public_html`). You cannot serve both. Pick one:

- **Option A — replace it.** Deploy the app to `crestapp.ng`. The WordPress
  site is retired. **Back it up first** (that site's Dashboard → Files →
  Backups, and/or a WordPress export) — never clear a live site without a
  restore point.
- **Option B — keep it (recommended, non-destructive).** Create a new subdomain
  `app.crestapp.ng` (Hostinger → the Business plan → Subdomains), and deploy the
  app there. WordPress stays at `crestapp.ng` as the marketing/landing site.

The only thing this changes in the build is one env var (§2) and which
`public_html` you upload into (§4).

---

## 2. Set env vars, then build

Both values are **baked into the static bundle at build time**, so they must be
correct *before* you run the build. They live in `.env.local` (git-ignored):

```
NEXT_PUBLIC_API_URL=https://api.crestapp.ng      # already correct — do not change
NEXT_PUBLIC_APP_URL=https://crestapp.ng          # Option A (root)
# — or —
NEXT_PUBLIC_APP_URL=https://app.crestapp.ng      # Option B (subdomain)
```

`NEXT_PUBLIC_APP_URL` is currently `http://localhost:3000` (for local dev). Set
it to the real deploy URL before building for production.

Then:

```bash
pnpm install
pnpm build          # writes ./out
```

`out/` is the complete, deployable site (including `.htaccess`).

---

## 3. Backend must allow the frontend origin (CORS) — flag to backend team

The app calls `api.crestapp.ng` directly from the browser with a Bearer token.
The Laravel API's CORS config (`config/cors.php` → `allowed_origins`) **must
include the exact deploy origin**:

- Option A → `https://crestapp.ng`
- Option B → `https://app.crestapp.ng`

If login/API calls fail in production with CORS errors in the browser console,
this is the cause. This is a backend change, not a frontend one.

---

## 4. Upload `out/` to `public_html`

Two ways — pick whichever you're comfortable with.

### Option 1 — File Manager (matches how admin was deployed)
1. Hostinger → Websites → the target site → **Tools ▸ File Manager** (or
   Dashboard → Files → File Manager).
2. Open that site's **`public_html`**.
   - **Option A (root):** first **delete the existing WordPress files** in
     `crestapp.ng`'s `public_html` (after backing up, §1). The folder should end
     up empty.
   - **Option B (subdomain):** `app.crestapp.ng`'s `public_html` starts empty.
3. Upload **the contents of `out/`** (not the `out` folder itself) into
   `public_html` — including the hidden **`.htaccess`** (enable "show hidden
   files" in the file manager if you don't see it locally).

### Option 2 — SSH / rsync (faster, repeatable; SSH is enabled on this plan)
```bash
# from the project root, after `pnpm build`
rsync -avz --delete out/ \
  u559531649@<hostinger-ssh-host>:domains/<site>/public_html/
```
`--delete` clears stale files from the previous deploy (the admin site has
accumulated old hashed bundles from not doing this — worth avoiding). Get the
exact SSH host/port from the site's Dashboard → Advanced → SSH Access.

---

## 5. Point the domain (Option A only)

If deploying to the root and the WordPress site was pointed via a specific
document root, make sure `crestapp.ng` serves the `public_html` you uploaded to.
For a subdomain (Option B), creating `app.crestapp.ng` in Hostinger already
wires its own `public_html` — no DNS change needed (it's the same Hostinger
account/IP).

SSL: Hostinger issues Let's Encrypt automatically for domains/subdomains on the
plan; confirm it's active for the deploy host so `https://` works (the app sets
secure cookies only over HTTPS).

---

## 6. Post-deploy smoke test

1. Load the site → landing page renders.
2. `/login` → log in with a real account → lands on `/home` (confirms CORS +
   API + auth cookie all work end-to-end).
3. Open a property (`/properties/view?id=…`) via a card, hard-refresh that URL →
   it still loads (confirms the query-param routing + directory serving).
4. Deep links with params (offers, shortlet detail, booking, room calendar) work
   on hard refresh, not just via in-app navigation.

---

## 7. Redeploying (every future update)

```bash
# set NEXT_PUBLIC_APP_URL for prod if not already, then:
pnpm build
# re-upload out/ contents to public_html (rsync --delete, or clear + re-upload)
```
Because build assets are content-hashed and `.htaccess` sets `must-revalidate`
on HTML, browsers pick up a new deploy immediately without a hard refresh.

---

## What going static cost us (all deliberate, see next.config.ts)

- **`proxy.ts` middleware removed.** Its only job was optimistic auth redirects;
  real enforcement is the Laravel API + the client `AuthGuard`. The one behavior
  no client guard covered (a logged-in user visiting `/login` → `/home`) is now
  handled by `GuestGuard` on the auth layout — fires just after hydration
  instead of at the edge, so a brief flash of the auth screen is possible.
- **Dynamic `[id]` routes → query-param routes.** `/properties/123` is now
  `/properties/view?id=123`; likewise for offers, shortlet detail, bookings, and
  the room calendar (`/shortlets/manage/rooms?listing=&room=`). Deep links still
  work; the URLs just look different.
- **`next/image` optimization off** (`unoptimized`) — no server to run it;
  images are served as-is from `api.crestapp.ng`.
- **Dynamic OG image removed** — `opengraph-image.tsx` used a runtime renderer
  (`next/og`) that can't run statically. Add a static `opengraph-image.png` to
  `src/app/` later if a social-share card image is wanted.
