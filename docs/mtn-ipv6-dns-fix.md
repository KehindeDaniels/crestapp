# MTN "can't reach the app/api" — IPv6 (AAAA) DNS issue

**Status:** ✅ RESOLVED 2026-08-03 — DNS moved to Cloudflare (see "Resolution" at the bottom).
**Date:** 2026-08-02
**Scope:** Infrastructure / DNS only — **not** an app code bug (frontend or backend).

---

## Symptom

On **MTN** (and potentially other carriers with broken IPv6), users **can't reach**
`app.crestapp.ng`, `admin.crestapp.ng`, or `api.crestapp.ng` — the page **keeps loading
forever** (no error, just a spinner). General internet works fine on the same connection.

- **Switching networks** (e.g. to a different carrier / Wi-Fi) → works.
- **Turning on the Cloudflare "1.1.1.1" app** → all three work.
- **Turning it off** → all three fail again.

So it's specific to the carrier's path to our host, not the app.

---

## Root cause: broken IPv6 (AAAA records MTN can't route to)

Each site is **dual-stack** — it publishes **both** an IPv4 (`A`) and an IPv6 (`AAAA`)
address:

| Host | IPv4 (A) — works | IPv6 (AAAA) — MTN can't reach |
|---|---|---|
| `api.crestapp.ng` | `72.60.93.53` | `2a02:4780:27:1370:0:2159:c681:4` |
| `app.crestapp.ng` | `88.222.222.193` | `2a02:4780:84:…` |
| `admin.crestapp.ng` | `84.32.84.117` | `2a02:4780:84:f868:ab3f:6c08:6baa:ac9f` |

The `2a02:4780::/29` addresses are **Hostinger's IPv6 range**. What happens:

1. On MTN, phones have IPv6 and **prefer the IPv6 (AAAA) address** when a site offers one.
2. **MTN's IPv6 route to Hostinger is broken** — packets go into a black hole (no response).
3. The phone tries IPv6, gets nothing, and **hangs** instead of quickly falling back to the
   working IPv4 address → the endless spinner.
4. **Other sites work** because their IPv6 works on MTN, or they don't publish IPv6 at all.
5. The **1.1.1.1 app** routes traffic through Cloudflare, bypassing MTN's broken IPv6 path —
   so all three suddenly work.

This is a **well-known MTN / Nigerian-carrier issue**: any site publishing IPv6 to a host the
carrier can't reach over IPv6 will hang like this.

### How this was confirmed

- **Authoritative nameservers:** `byte.dns-parking.com`, `pixel.dns-parking.com` (Hostinger).
- Each subdomain is its **own DNS zone** in Hostinger, each containing an `@ AAAA` record.
  Example — `api.crestapp.ng` zone:
  ```
  @   A     72.60.93.53                       ← IPv4 (works on MTN)
  @   AAAA  2a02:4780:27:1370:0:2159:c681:4   ← IPv6 (MTN can't reach → hangs)  ⚠️
  @   MX / TXT (mail)
  www CNAME api.crestapp.ng.
  ```
- The root `crestapp.ng` zone has **only an A record** (no AAAA), so the root isn't affected —
  only the `api` / `app` / `admin` subdomains are.

---

## The fix

**Delete the `@ AAAA` (IPv6) record in each of the 3 zones:** `api`, `app`, `admin.crestapp.ng`.

This leaves the IPv4 `A` records, which work on every Nigerian network. It's the standard,
low-risk fix for this exact symptom.

### Steps (Hostinger hPanel) — repeat for each of the 3 subdomains

**Before you start:** screenshot each zone's records (backup). Hostinger also keeps automatic
DNS snapshots, and re-adding an AAAA later takes seconds.

1. Log in to **hpanel.hostinger.com**.
2. Top menu → **Domains**.
3. Open the **DNS Zone Editor** (click the domain → **DNS / Nameservers**). Because
   `api`/`app`/`admin` are separate zones, select/enter the specific subdomain
   (e.g. `api.crestapp.ng`).
4. In **DNS Records**, find the row with **Type = `AAAA`** (Name `@`) — match the value in the
   table above.
5. Click the **🗑 delete** icon on that AAAA row → **confirm**.
6. ⚠️ **Leave the `A` record (IPv4) untouched.** Don't touch MX, TXT, or CNAME either.
7. Repeat for the other two subdomains.

### After
1. Wait ~**15–30 min** (TTL is 1800s).
2. Test on the **MTN phone WITHOUT the 1.1.1.1 app** → should load.
3. Optional: **dnschecker.org** → enter `api.crestapp.ng`, type **AAAA** → should show **no
   record** (only the A/IPv4 remains).

---

## What removing the AAAA does / doesn't affect

**Not affected (unchanged):**
- **Email** — runs on **MX** records (`mx1/mx2.hostinger.com`) + SPF/DKIM/DMARC, which are
  separate and untouched.
- **The websites** — still served over their **IPv4 (A)** records; work exactly as now.
- **HTTPS / SSL certificates** — per-hostname, not per-IP-type; unaffected.
- **Root domain / WordPress** — already IPv4-only; unchanged.
- **Other records** — `www`, `ftp`, mail autodiscover, TXT, etc. all untouched.

**Only change:** clients stop being offered the (broken) IPv6 address and use IPv4 — which
works everywhere. The hang disappears.

**Edge case (non-issue):** the only clients that could be affected are IPv6-only-with-no-IPv4
networks, which effectively don't exist for end users — and even true IPv6-only mobile networks
use **NAT64/DNS64** to reach IPv4-only sites. So no real user loses access.

---

## Caveats

- **Reversible:** Hostinger keeps DNS snapshots; re-adding an AAAA is trivial if IPv6 is ever
  fixed properly.
- **Auto-recreation:** Hostinger *sometimes* auto-recreates an AAAA for hosted sites (likely how
  these got there). If the MTN hang returns, re-check for a returned AAAA and delete it again, or
  ask Hostinger support to stop auto-adding IPv6 to these subdomains.
- **Longer-term option:** moving DNS to **Cloudflare** (free plan) gives explicit control (add
  only IPv4 records) plus reliable anycast resolution across all carriers.

---

## Plain-English version (for a non-technical owner)

> We found why the app won't load on MTN. Each of our three sites (app, admin, api) advertises
> **two addresses** — one MTN can reach (IPv4) and one it can't (IPv6). Phones on MTN try the
> unreachable one first and just keep loading. **Fix:** remove the "IPv6 (AAAA)" records so every
> phone uses the address that works. It's quick, safe, reversible, and doesn't affect email or the
> sites — it's a common MTN issue in Nigeria and this is the standard fix.

---

## Update (2026-08-03): manual AAAA deletion DOESN'T stick → move to Cloudflare

Deleting the AAAA records in hPanel **did not hold**. Hostinger **auto-recreates** them (confirmed
against the authoritative zone, not caching). After the CDN was toggled, IPv6 came back on **all
three** subdomains — including `api`, which had been cleaned. The manual approach is whack-a-mole
on this setup.

**State on 2026-08-03:**
- `api.crestapp.ng` — A `72.60.93.53` **+ AAAA (recreated)** ❌
- `app.crestapp.ng` — A `72.60.93.53` **+ AAAA (recreated)** ❌ (CDN disabled, but IPv6 returned)
- `admin.crestapp.ng` — still **ALIAS → `admin.crestapp.ng.cdn.hstgr.net`** ❌ (CDN still on)

### Durable fix: move DNS to Cloudflare (free)

Cloudflare becomes the **authoritative DNS** for `crestapp.ng`, so Hostinger's auto-AAAA no longer
applies (Hostinger is out of the DNS path). Publish **only IPv4 `A` records (no AAAA)**, and
optionally **proxy** the web records through Cloudflare's edge (reliable for MTN carriers, free
SSL, hides the origin IP).

**Steps:**
1. Create a free Cloudflare account → **Add a site** → `crestapp.ng`.
2. Let Cloudflare import existing records, then **verify every record below is present** —
   especially email (MX/SPF/DKIM/DMARC), or email breaks.
3. Cloudflare gives you **2 nameservers**. At the **domain registrar** (where `crestapp.ng` is
   registered — it is **not** Hostinger; current nameservers are `byte/pixel.dns-parking.com`),
   change the nameservers to Cloudflare's two.
4. Wait for Cloudflare to show **Active**.
5. Ensure `api` / `app` / `admin` are **`A` records → origin IPv4, with NO AAAA**.
6. (Recommended) set the **web** records to **Proxied (orange cloud)** and SSL/TLS mode = **Full**.
   **Keep all email records DNS-only (grey cloud)** — MX/DKIM must never be proxied.

### Full DNS export — recreate these in Cloudflare's single `crestapp.ng` zone

**Web / app (the fix — `A` only, NO AAAA):**

| Type | Name | Value | Proxy |
|---|---|---|---|
| A | `@` (root) | `72.60.93.53` | Proxied (optional) |
| A | `api` | `72.60.93.53` | Proxied (optional) |
| A | `app` | `72.60.93.53` | Proxied (optional) |
| A | `admin` | **confirm origin IP** — disable its CDN to reveal the direct A, or likely `72.60.93.53` | Proxied (optional) |
| CNAME | `www` | `crestapp.ng` | Proxied (optional) |

**Email — copy EXACTLY, keep all DNS-only (grey cloud):**

| Type | Name | Value | Priority |
|---|---|---|---|
| MX | `@` | `mx1.hostinger.com` | 5 |
| MX | `@` | `mx2.hostinger.com` | 10 |
| TXT | `@` | `v=spf1 a mx include:_spf.mail.hostinger.com include:_spf.mlsend.com ~all` | — |
| TXT | `@` | `brevo-code:c8630cc2eb9da68ffc50d27b3fa39ad6` | — |
| TXT | `@` | `mailerlite-domain-verification=3bafae053f66f63a360507ee28aa2d794c2783b1` | — |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` | — |
| CNAME | `litesrv._domainkey` | `litesrv._domainkey.mlsend.com` | — |
| CNAME | `hostingermail-a._domainkey` | `hostingermail-a.dkim.mail.hostinger.com` | — |
| CNAME | `hostingermail-b._domainkey` | `hostingermail-b.dkim.mail.hostinger.com` | — |
| CNAME | `hostingermail-c._domainkey` | `hostingermail-c.dkim.mail.hostinger.com` | — |
| CNAME | `brevo1._domainkey` | `b1.crestapp-ng.dkim.brevo.com` | — |
| CNAME | `brevo2._domainkey` | `b2.crestapp-ng.dkim.brevo.com` | — |
| CNAME | `autodiscover` | `autodiscover.mail.hostinger.com` | — |
| CNAME | `autoconfig` | `autoconfig.mail.hostinger.com` | — |

**⚠️ Do NOT create any `AAAA` records.** Skip `ftp` and the per-subdomain `www`/`autodiscover`
records unless actually used.

### Why this fixes it permanently
- Hostinger no longer serves DNS → it can't re-add the IPv6 (AAAA) records.
- Only IPv4 is published → MTN (and all carriers) reach it.
- With the proxy on, visitors hit Cloudflare's well-routed edge instead of Hostinger directly.

### Alternative (less certain)
Ask Hostinger support to **permanently disable IPv6/AAAA auto-provisioning** for these sites.
May or may not hold, depending on their platform — Cloudflare is the reliable option.

---

## Resolution (2026-08-03) ✅

Moved DNS for `crestapp.ng` to **Cloudflare (Free plan)**.

- **Registrar:** HostAfrica / DomainKing.ng (`domainking.ng`). Nameservers changed there from
  `byte/pixel.dns-parking.com` → `dahlia.ns.cloudflare.com` + `devin.ns.cloudflare.com`.
- DNSSEC was already **off** ("Unsigned" per ICANN), so no extra step was needed.
- In Cloudflare, all records set to **DNS only (grey cloud)** — including web (api/app/admin/root)
  and email (MX/SPF/DKIM/DMARC). **No AAAA records** were imported or added.
- Cloudflare's import brought over only A/CNAME/MX/TXT — **zero AAAA** — which is the fix.

**Verified after activation:**

| Host | IPv4 | IPv6 |
|---|---|---|
| api.crestapp.ng | `72.60.93.53` | **none** ✅ |
| app.crestapp.ng | `72.60.93.53` | **none** ✅ |
| admin.crestapp.ng | `147.79.120.143` (still a CDN IP) | **none** ✅ |

Nameservers now `dahlia/devin.ns.cloudflare.com`; MX still `mx1/mx2.hostinger.com` (email intact).

**Why this is permanent:** Cloudflare is now authoritative, so Hostinger can no longer
auto-recreate the AAAA records (which was the whack-a-mole in the 2026-08-03 update above).

### Optional follow-ups (not required)
- Tidy `admin` to point at the direct origin (`72.60.93.53`) instead of the CDN IP, for consistency.
- Later, flip the **web** records (api/app/admin/root) to **Proxied (orange cloud)** + set
  **SSL/TLS = Full** to gain Cloudflare's CDN/caching/DDoS/WAF and free SSL. Keep all **email**
  records DNS-only (never proxy MX/DKIM).
