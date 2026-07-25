# Shortlet — Simple Business Requirements (BRD) for UI / UX / Frontend

**Audience:** Product, design, and frontend developers  
**Backend plan:** `docs/plans&progress/Shortlet_Implementation_Plan.md`  
**Last updated:** 2026-07-22

This document explains **what the app should feel like and do on screen**, in plain language. It is not a technical API spec.

---

## 1. What is Shortlet on Crest?

Crest already helps people **rent long-term** or **buy/sell** property (offers, contracts, escrow).

**Shortlet** is the “book a place for a few nights” product — like booking a hotel room or Airbnb stay:

1. An owner lists a place and its rooms.
2. A guest picks dates and room(s).
3. Guest pays online.
4. Booking is confirmed automatically after payment.
5. The stay **ends by itself** after the booked nights. There is **no checkout button**.

---

## 2. Two kinds of users (roles)

| Role | Who they are | What they do in the app |
|------|----------------|-------------------------|
| **Shortlet owner** | Host / property manager | Create listings, add rooms, set calendar (open/block), see bookings, get paid for stays |
| **Shortlet user** | Guest | Search, view, quote price, book, pay, see my bookings, cancel (when allowed) |

Users can **switch role** from profile (same pattern as landlord/tenant today).

**UI implication:** After role switch, show the matching home experience (Owner dashboard vs Guest browse). Do not mix both full UIs in one cluttered screen; use clear tabs or a role-aware home.

---

## 3. Core user journeys

### 3.1 Owner — list a shortlet

1. Switch to **Shortlet owner**.
2. Tap **Add shortlet**.
3. Enter property basics (title, description, address, photos later).
4. Set **price per night**, cleaning fee, min nights, check-in time.
5. Add **one or more rooms** (name, beds, capacity, optional own price).
6. Save as draft → add at least one room → **Activate**.
7. On activate, the system opens the calendar for months ahead (nights become bookable).

**UX notes**

- Block “Activate” until there is at least one active room (show a clear tip).
- Multi-room: treat rooms as separate bookable units under one listing (not just “bedrooms” text).

### 3.2 Owner — manage availability

1. Open listing → pick a room → **Calendar**.
2. Select date range → **Open** or **Block** (e.g. personal use / maintenance).
3. Optionally set a **special nightly price** for those dates.

**UX notes**

- Calendar should show colours: available / blocked / booked / on-hold (waiting for payment).
- Owner cannot casually overwrite booked nights (backend protects this); show a friendly message if they try.

### 3.3 Guest — find and book

1. Switch to **Shortlet user** (or land on guest browse).
2. Search: city, **check-in date**, **number of nights**, guests, price filters.
3. Results: only places free for those nights.
4. Open listing → see rooms and which are free.
5. Select room(s) → **Get quote** (price breakdown + stay end time).
6. Confirm → **Book** (creates a hold) → **Pay now**.
7. After successful payment → **Confirmed**. Show booking details and countdown / stay window.

**UX notes**

- Always show **nights (n)** and that the stay lasts **24 × n hours** from check-in time.
- Show **“Stay ends automatically at …”** — never a Checkout button.
- While unpaid, show **“Complete payment by …”** (hold expires; rooms free up again).

### 3.4 During / after the stay

- No check-in / check-out screens required for v1.
- When the end time passes, booking becomes **Completed** in the background.
- Guest and owner can still open the booking history.

### 3.5 Cancel

- Guest or owner can cancel (rules/refunds can tighten later).
- UI: reason optional, confirm dialog, then status **Cancelled** and nights free again.

---

## 4. Screens the frontend should plan for

### Guest

| Screen | Purpose |
|--------|---------|
| Shortlet home / search | Dates, nights, location, filters |
| Search results | Cards with price/night, city, photos |
| Listing detail | Description, rooms, amenities, availability for selected dates |
| Quote / review | Breakdown: nights × rates, cleaning, service fee, total, ends-at |
| Payment | Open gateway checkout (Flutterwave/Paystack); return to success/fail |
| My bookings | List + filters (upcoming, past, cancelled) |
| Booking detail | Status, rooms, times, pay CTA if pending |

### Owner

| Screen | Purpose |
|--------|---------|
| Owner home | Active listings, upcoming bookings, quick actions |
| Create / edit listing | Form + rooms list |
| Room calendar | Month view + block/open |
| Owner bookings | Incoming stays, guest info (minimal), status |
| Booking detail | Same as guest, owner actions (cancel if allowed) |

### Shared

| Screen | Purpose |
|--------|---------|
| Role switch | Profile → switch to shortlet owner / user |
| Empty states | No listings / no results / no bookings |
| Errors | Hold expired, room taken, payment failed — clear next step |

---

## 5. Statuses (show these in the UI)

| Status | Guest sees | Owner sees |
|--------|------------|------------|
| **Pending payment** | “Pay to confirm” + timer | “Guest holding dates” |
| **Confirmed** | “You’re booked” + stay window | “Upcoming stay” |
| **Completed** | “Stay finished” | “Completed” |
| **Expired** | “Payment window ended” | Hold released |
| **Cancelled** | Cancelled | Cancelled |

---

## 6. Pricing display rules

Always show:

- Nightly rate(s) per room  
- Number of nights  
- Cleaning fee (if any)  
- Service / platform fee (if any)  
- **Total**  
- Currency (NGN default)

Quote and booking total must match what was shown before payment (backend freezes rates at booking time).

---

## 7. What we are **not** building in the UI for v1

- Checkout / check-in kiosk flows  
- Request-to-book (owner must approve before pay) — v1 is **instant book after pay**  
- Channel manager / Airbnb calendar sync  
- Complex dynamic pricing editor (beyond simple date price override)  
- Full owner payout wallet UI (ops can be manual at first)

---

## 8. Copy snippets (suggested)

- “Stays end automatically. No checkout needed.”
- “Your stay is for **{n} nights** ({24×n} hours from check-in).”
- “Complete payment within **{minutes} minutes** to keep this booking.”
- “These dates were just taken. Pick other dates or another room.”
- “Add at least one room before you can publish this shortlet.”

---

## 9. Frontend ↔ backend mapping (high level)

| UI action | Backend area |
|-----------|----------------|
| Switch role | `PUT /api/profile/role` |
| Create listing + rooms | `POST /api/shortlets` |
| Activate listing | `PUT /api/shortlets/{id}` status=active |
| Calendar / block | `GET/PUT .../rooms/{id}/calendar|availability` |
| Search | `POST /api/shortlets/search` |
| Detail | `GET /api/shortlets/browse/{id}` |
| Quote | `POST /api/shortlets/quote` |
| Book (hold) | `POST /api/shortlets/bookings` |
| Pay | `POST /api/shortlets/bookings/{id}/pay` (payment link) |
| My / owner bookings | `GET .../bookings/mine` / `.../owner` |
| Cancel | `POST .../bookings/{id}/cancel` |

Exact payloads are in Postman / backend plan; this BRD is for **product behaviour and screens**.

---

## 10. Success criteria for the frontend release

- Guest can search → quote → book → pay → see confirmed stay with auto end time.  
- Owner can publish multi-room listing, block dates, see bookings.  
- No checkout UI anywhere.  
- Pending payment expiry is visible and understandable.  
- Double-booking is impossible from the user’s point of view (error + refresh).  
- Role switch lands users on the right experience.

---

## 11. Open product questions for design/frontend

1. Can someone book **multiple rooms** in one stay in the first UI, or only one room per booking at launch? (Backend supports multiple.)  
2. After payment, success page: deep-link to booking detail or home?  
3. Show map on search results in v1 or later?  
4. Photo upload: reuse existing property media flow — confirm UX in create listing wizard.
