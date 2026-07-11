# Bug Report — CSRF blocking all frontend requests + OTP code leaked in response

**Reported by:** Frontend team
**Affects:** `api.crestapp.ng` (Laravel backend)
**Severity:** 🔴 Blocker (Issue 1) + 🔴 Security (Issue 2)
**Frontend action needed:** None — both issues are backend-only.

---

## Issue 1: CSRF error blocks every request from the frontend (Blocker)

### What's happening

When the browser calls the API, it fails with:

```
419 CSRF token mismatch
```

But when we call the *exact same endpoint* with the *exact same data* using a command-line tool (`curl`, no browser involved), it works fine.

### Why (in plain terms)

Browsers automatically attach an `Origin` header to requests (e.g. `Origin: http://localhost:3000`) telling the server "this request came from this website." Command-line tools like `curl` don't send this header unless told to.

Laravel has a package called **Sanctum** that handles authentication two different ways:

1. **Token mode** (what this app is built on): the frontend sends `Authorization: Bearer <token>` on every request. No cookies, no sessions, no CSRF needed. Simple.
2. **"Stateful SPA" mode**: instead of a token, the frontend uses Laravel's session + cookies, and must also send a matching CSRF token on every request, otherwise Laravel rejects it with `419`.

Sanctum decides which mode to use based on a config list of "stateful domains" (`SANCTUM_STATEFUL_DOMAINS` in `.env`, or `config/sanctum.php`). **If a domain is on that list, Sanctum switches to mode 2 (cookies + CSRF) for any request whose `Origin` matches it** — even if that request is sending a perfectly valid Bearer token.

**Someone added the frontend's domain (`localhost:3000`, and possibly the production frontend domain) to that stateful-domains list.** That's why:
- `curl` (no `Origin` header) → still works (mode 1, token-based)
- The real browser (`Origin: http://localhost:3000`) → gets switched into mode 2 → 419, because our frontend never does the cookie/CSRF dance (and isn't supposed to — we agreed on token-based auth for this app)

### How to reproduce it yourself

```bash
# Works fine (no Origin header, behaves like a normal API client):
curl -X POST "https://api.crestapp.ng/api/auth/verification/send" \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"type":"phone","identifier":"+2348012345678"}'
# → 200 OK

# Fails (Origin header added, exactly like a real browser sends):
curl -X POST "https://api.crestapp.ng/api/auth/verification/send" \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"type":"phone","identifier":"+2348012345678"}'
# → 419 CSRF token mismatch
```

### The fix

Open `config/sanctum.php` (or check the `.env` file for `SANCTUM_STATEFUL_DOMAINS`) and **remove the frontend's domain(s)** from that list — `localhost:3000`, and whatever the production frontend domain is. These API routes should stay in plain token mode (mode 1 above) for every domain the Next.js frontend runs on.

> If there's a *different* reason someone needs cookie/session auth (e.g. a separate admin panel expects it), that's fine — just make sure only *that* app's domain is in the stateful list, not the domain(s) this Next.js app runs on.

### How to verify the fix

Run the second `curl` command above again (the one with `Origin: http://localhost:3000`). It should return `200 OK`, not `419`, once the domain is removed from the stateful list.

---

## Issue 2: The OTP code is returned in the API response (Security — please prioritize)

### What's happening

When `POST /api/auth/verification/send` succeeds, the response body currently looks like this:

```json
{
  "message": "Verification code has been sent to your phone.",
  "code": "286793"
}
```

### Why this is a problem

The whole point of a one-time code (OTP) is that only the person with access to the phone/email can see it. If the code is also sent back in the API response, **anyone who can see that network request — or send one themselves — gets the code without ever touching the phone or inbox.** This completely bypasses phone/email verification. Any user (or bot) could:
1. Call `verification/send` for someone else's phone/email
2. Read the `code` field straight from the response
3. Call `verification/verify` with that code — verified, without ever proving they own that phone/email

### The fix

Remove `code` from the JSON response entirely. The code should only ever be delivered via the actual SMS/email, never in the HTTP response. This is likely a debug line left in from testing the SMS fix — please double check it isn't also happening on other verification-related endpoints (e.g. password reset).

### How to verify the fix

Run the first `curl` command from Issue 1 above (the one that returns `200 OK`). Confirm the response body only contains `message`, with no `code` field.

---

## Summary for whoever picks this up

| Issue | Where | Fix | Priority |
|---|---|---|---|
| CSRF blocks all frontend requests | `config/sanctum.php` / `.env` → `SANCTUM_STATEFUL_DOMAINS` | Remove the frontend's domain(s) from the stateful list | Blocker — nothing works from the browser until this is fixed |
| OTP code returned in response | `verification/send` response (and check `verify`/password-reset too) | Remove the `code` field from the JSON response | Security — must not reach production like this |

Both are backend-only changes. The frontend needs no changes for either issue.
