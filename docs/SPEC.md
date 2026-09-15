# SATI Swap — Project Specification

> **Status:** Draft v1.0  
> **Author:** SATI Swap Team  
> **Date:** Sep 15, 2026  

---

## 1. Executive Summary

**SATI Swap** is a private, campus-exclusive marketplace + study-resource community for students at **Samrat Ashok Technological Institute (SATI), Vidisha**. Verified students can buy, sell, exchange, donate, and discover textbooks, handwritten notes, lab manuals, previous-year papers, engineering drawing material, calculators, and other academic resources.

The experience is modeled after a familiar messaging app (WhatsApp-style) so students instantly understand the flow: **Chats → Listing → Chat Seller → Campus Exchange**.

### Problem Statement

| Pain Point | Current Reality | SATI Swap Solution |
|---|---|---|
| Cost | Textbooks/lab manuals are expensive | Peer-to-peer resale and donation |
| Waste | Seniors discard resources after each semester | Active secondary marketplace |
| Fragmentation | Resources scattered across WhatsApp/Telegram groups | Centralized, searchable platform |
| Trust | Students hesitate to buy from strangers | SATI-only verification + student profiles |

### Core Differentiator
> **Verified SATI Student → SATI Resources → SATI Pickup → SATI Community**

---

## 2. Scope

### MVP (Phase 1) — Build First
1. **SATI Authentication** — email/password login, profile with name, branch, year, semester, photo
2. **Marketplace Feed** — WhatsApp-style chat-list UI of active listings
3. **Listings** — create, view, search, filter (category, branch, semester, price, condition)
4. **Chat** — real-time buyer↔seller messaging (Supabase Realtime)
5. **Sell/Upload** — photo upload, category picker, title, subject, condition, price, description
6. **Search** — full-text search + filters
7. **Favorites** — save listings to revisit

### Phase 2 — Trust + Intelligence
- Student verification flow
- Ratings & reviews after exchange
- Reports & moderation
- Notifications
- AI listing detection (photo → book metadata)
- Smart price suggestion

### Phase 3 — SATI Ecosystem
- Study groups / communities
- Free Corner (donations)
- Campus Pickup points (library, main gate)
- Notes Library (curated)
- Event/announcement feed

### Out of Scope (for now)
- In-app payments (transactions stay cash/UPI between students)
- Native mobile apps
- Multi-college support
- Lost & Found

---

## 3. User Roles

### Student (primary)
- Register → Verify (SATI email/process) → Profile → Browse → Chat → Exchange
- Can create listings, mark sold, flag others' listings

### Admin
- Manage users, listings, reports, categories, verification queue
- Analytics dashboard

---

## 4. Functional Requirements

### FR-1 Authentication & Profiles
| ID | Requirement |
|----|-------------|
| FR-1.1 | Student registers with SATI email |
| FR-1.2 | Profile captures: full_name, email, branch, year, semester, avatar |
| FR-1.3 | `is_verified` flag gates posting & chatting |
| FR-1.4 | Auth via Supabase Auth (email/password) |

### FR-2 Marketplace Feed
| ID | Requirement |
|----|-------------|
| FR-2.1 | Home shows active listings as chat-like cards |
| FR-2.2 | Each card: photo, title, seller name, branch, year, price/free badge |
| FR-2.3 | Realtime updates on new listings |
| FR-2.4 | For seller equity, show most recent first |

### FR-3 Listings
| ID | Requirement |
|----|-------------|
| FR-3.1 | Categories: Books, Notes, Lab Manuals, PYQs, Drawing, Calculators, Stationery, Other |
| FR-3.2 | Fields: title, description, category, subject, condition, price, is_free, photos, pickup_point |
| FR-3.3 | Status lifecycle: `active → reserved → sold` / `active → removed` |
| FR-3.4 | Only owner can edit/delete/reserve/mark-sold |
| FR-3.5 | Up to 6 photos per listing |
| FR-3.6 | Price ≥ 0, `is_free` overrides price display |

### FR-4 Search & Filters
| ID | Requirement |
|----|-------------|
| FR-4.1 | Debounced full-text search on title/subject/description |
| FR-4.2 | Filters: category, branch, semester, condition, price (free/paid), sort |
| FR-4.3 | "Clear all filters" action |

### FR-5 Chat & Messaging
| ID | Requirement |
|----|-------------|
| FR-5.1 | Student opens a listing → "Chat with Seller" |
| FR-5.2 | Conversation requires both participants on-call (RLS enforced) |
| FR-5.3 | Real-time message delivery (Supabase Realtime) |
| FR-5.4 | Unread read markers |
| FR-5.5 | Buyer and seller can only access their own conversations |

### FR-6 Sell / Upload
| ID | Requirement |
|----|-------------|
| FR-6.1 | FAB (＋) opens category picker → form |
| FR-6.2 | Photo upload to Supabase Storage (bucket `listing-images`) |
| FR-6.3 | Server-side size/type validation |
| FR-6.4 | Free/donate toggle |

### FR-7 Favorites
| ID | Requirement |
|----|-------------|
| FR-7.1 | Save/unsave a listing |
| FR-7.2 | Dedicated "Saved" tab |
| FR-7.3 | Notify owner when interested (future notification) |

### FR-8 Admin (Phase 2)
| ID | Requirement |
|----|-------------|
| FR-8.1 | Admin dashboard route (`/admin`) |
| FR-8.2 | Toggle user verification |
| FR-8.3 | Remove listings & ban users |
| FR-8.4 | Review reports |

---

## 5. Non-Functional Requirements

| NFR | Requirement |
|-----|-------------|
| NFR-1 | **Security** — Row Level Security on all tables; service role key never in frontend |
| NFR-2 | **Mobile-first** — WhatsApp-like UX optimized for phones |
| NFR-3 | **Performance** — listings load < 1.5s on 4G; images lazy-loaded |
| NFR-4 | **Realtime** — chat messages delivered < 500ms |
| NFR-5 | **Accessibility** — WCAG 2.1 AA |
| NFR-6 | **Compliance** — no Ph no/email exposed to unauthenticated users |
| NFR-7 | **Backup** — nightly Supabase PITR (free tier includes daily) |
| NFR-8 | **Resilience** — graceful offline/"not configured" states |
| NFR-9 | **Privacy** — users can delete their account & listings |

---

## 6. Database Schema (v2 — replaces hackathon schema)

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | references auth.users |
| full_name | text | required |
| email | text unique | lowercase |
| branch | text | CS/IT/EC/EE/ME/Civil |
| year | smallint | 1–4 |
| semester | smallint | 1–8 |
| avatar_url | text | storage path |
| is_verified | boolean default false | |
| created_at | timestamptz | |

### `listings`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| seller_id | uuid FK → profiles | |
| title | text | 1–200 chars |
| description | text | |
| category | text | enum |
| subject | text | |
| condition | text | New/Good/Fair |
| price | numeric | ≥ 0; null if free |
| is_free | boolean | default false |
| status | text | active/reserved/sold/removed |
| pickup_point | text | library/main-gate/cafeteria/other |
| created_at | timestamptz default now() | |
| updated_at | timestamptz | trigger-updated |

### `listing_images`
| Column | Type |
|--------|------|
| id | uuid PK |
| listing_id | uuid FK → listings |
| image_url | text |
| position | smallint |
| created_at | timestamptz |

### `conversations`
| Column | Type |
|--------|------|
| id | uuid PK |
| listing_id | uuid FK → listings |
| created_at | timestamptz |

### `conversation_participants`
| Column | Type |
|--------|------|
| conversation_id | uuid FK |
| user_id | uuid FK |
| PRIMARY KEY (conversation_id, user_id) |

### `messages`
| Column | Type |
|--------|------|
| id | uuid PK |
| conversation_id | uuid FK |
| sender_id | uuid FK |
| message | text |
| is_read | boolean default false |
| created_at | timestamptz |

### `favorites`
| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid FK |
| listing_id | uuid FK |
| created_at | timestamptz |
| UNIQUE (user_id, listing_id) |

### `reviews` (Phase 2)
| Column | Type |
|--------|------|
| id | uuid PK |
| reviewer_id | uuid FK |
| reviewee_id | uuid FK |
| listing_id | uuid FK |
| rating | smallint 1–5 |
| comment | text |
| created_at | timestamptz |

### `reports` (Phase 2)
| Column | Type |
|--------|------|
| id | uuid PK |
| reporter_id | uuid FK |
| listing_id | uuid FK nullable |
| reported_user_id | uuid FK nullable |
| reason | text |
| status | text open/resolved/dismissed |
| created_at | timestamptz |

---

## 7. Security & RLS Policy Matrix

| Table | Select | Insert | Update | Delete |
|-------|--------|--------|--------|--------|
| profiles | authenticated (own row fields) | own row only | own row only | own row only |
| listings | authenticated (status='active' OR owner) | authenticated + verified | owner only | owner only |
| listing_images | authenticated | owner of parent listing | owner | owner |
| conversations | participant only | creator only | participant | participant |
| conversation_participants | participant only | participant | — | participant |
| messages | participant only | participant only | — | — |
| favorites | own rows | own rows | own rows | own rows |

---

## 8. API Surface (client-side)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /auth/v1/signup | Register |
| POST | /auth/v1/token | Login |
| GET | /rest/v1/profiles?select=* | Fetch profile |
| GET | /rest/v1/listings?select=* | Fetch feed |
| POST | /rest/v1/listings | Create listing |
| PATCH | /rest/v1/listings?id=eq.{id} | Update listing |
| DELETE | /rest/v1/listings?id=eq.{id} | Delete listing |
| POST | /storage/v1/object/listing-images/* | Upload photo |
| — | Realtime channel `conversation:{id}` | Live messages |

---

## 9. User Journeys

### A. Onboarding
```
Open app → Login/Signup → Create profile (name/branch/year/photo)
→ Verify (SATI email) → Home (feed)
```

### B. Buy a book
```
Search/filter → Open listing card → Inspect details & seller
→ "Chat with Seller" → Agree on price/pickup → Exchange at pickup point
→ Rate each other
```

### C. Sell a book
```
Tap ＋ → Choose category → Upload photos → Fill details → Set price/free
→ Publish → Reply to chats → Mark sold after exchange
```

---

## 10. Open Questions (blocking decisions)

1. **Alumni access?** — Restrict to current students only, or allow alumni? (Affects `profiles.year` validation + verification flow.)
2. **Payments** — Cash/UPI off-platform (default), or in-app escrow later? (Escrow requires server-side functions.)
3. **Verification method** — SATI email auto-approve, manual QR proof, or admin-approve matrix?
4. **Desktop support** — Mobile-first only, or full responsive desktop (current build is responsive)?
5. **Chat scope** — 1:1 only, or group/community chats in MVP?
6. **Branch data** — Which branches exist at SATI currently (this changes the branch dropdown)?

---

## 11. Success Metrics (MVP)

- 200 registered verified students in first month
- 100 active listings
- 60% of listings get ≥ 1 chat
- 3.5/5 average seller rating by end of Phase 2
- < 2s median time-to-interact (search → chat open)