# SATI Swap — Implementation Tickets

> **Status:** v1.0 | **Date:** Sep 15, 2026
> Ordered top-to-bottom; each ticket blocks the next milestone. Tracer-bullet style: every milestone is demoable alone.

---

## Milestone Map

| Milestone | Tickets | Demo |
|---|---|---|
| M0 — Data | T1–T3 | Verified via SQL editor |
| M1 — Auth | T4–T8 | Signup/login → profile → home |
| M2 — Feed | T9–T12 | Browse/search/detail (fake + real) |
| M3 — Create | T13–T16 | Post with photos → appears in feed |
| M4 — Chat | T17–T20 | Two browsers chat in realtime |
| M5 — Locker | T21–T24 | Favorites + My Listings + Profile |
| M6 — Shell | T25–T27 | PWA-able shell, dark theme, FAB |
| M7 — Harden | T28–T31 | e2e, RLS audit, a11y, deploy |

---

## M0 — Data Layer

### T1. Schema v2 (`supabase/schema.sql`)
- [ ] Add `profiles` table with FK to `auth.users`
- [ ] Upgrade `listings` v2: `seller_id`, `category`, `pickup_point`, `updated_at`, drop open-contact columns
- [ ] Add `listing_images`, `conversations`, `conversation_participants`, `messages`, `favorites`
- [ ] Update all indexes + add full-text index on `listings(title, description)`
- [ ] Add trigger: auto-create `profiles` row on `auth.users` insert
- [ ] Add trigger: touch `updated_at` on listing update

**Definition of done:** SQL runs clean in Supabase SQL Editor twice (idempotent).

### T2. RLS Policies (`supabase/policies.sql`)
Implement the policy matrix from `SPEC §7`.
- [ ] `profiles`: own-row CRUD
- [ ] `listings`: read active OR owner; write owner-only
- [ ] `images`: owner (via listing.seller_id)
- [ ] `conversations` + participants: participant-only
- [ ] `messages`: participant-only
- [ ] `favorites`: own-row
- [ ] Storage bucket `listing-images`: authenticated upload, public read

**DoD:** Using `anon` key, non-participant cannot select `messages` rows (verified via SQL). Owner-only updates enforced.

### T3. Seed Data v2 (`supabase/seed.sql`)
- [ ] 3 verified profiles with branches/years
- [ ] 6 listings across categories
- [ ] 2 conversations + messages
- [ ] 3 favorites

**DoD:** Home feed shows seeded rows.

---

## M1 — Authentication

### T4. Auth context + routing guards
- [ ] `lib/supabase.js` stays config-driven
- [ ] `hooks/useProfile.js` (session + profile + refresh)
- [ ] `<RequireAuth>` + `<RequireVerified>` route guards
- [ ] `pages/AuthPage.jsx` (login/signup)

**DoD:** unauthenticated → AuthPage; authenticated → app shell.

### T5. Profile auto-create on signup
- [ ] Supabase trigger (T1) creates row
- [ ] `pages/OnboardingPage.jsx` fills branch/year/semester/avatar

**DoD:** new signup lands on onboarding, not a dead state.

### T6. Avatar upload + profile page
- [ ] `repositories/imagesRepo.uploadAvatar`
- [ ] `pages/ProfilePage.jsx` displays & edits profile
- [ ] Avatar storage bucket + RLS (T2)

**DoD:** you can set your avatar and see it in header.

### T7. Verified badge plumbing
- [ ] `is_verified` surfaced in profile query
- [ ] Badge component in card rows + detail + chat header

**DoD:** verified students show green check.

### T8. Logout + session persistence
- [ ] Logout button (profile menu)
- [ ] Refresh-token persistence via supabase-js defaults
- [ ] Route redirect on session expiry

**DoD:** refresh keeps you logged in; logout clears state.

---

## M2 — Feed

### T9. Chatter-style listing feed (`HomePage` rework)
- [ ] `repositories/listingsRepo.fetchActiveListings`
- [ ] `hooks/useListings` (filters + realtime refresh)
- [ ] `components/listing/ListingCard` → conversation-row style
- [ ] Real-time `POSTGRES_CHANGES` subscription

**DoD:** home renders rows like in FRONTEND §4.2; new listing appears live.

### T10. Search + filters
- [ ] Debounced full-text search
- [ ] Filter bottom sheet: category, branch, semester, condition, free/paid, sort
- [ ] `components/listing/CategoryPicker` reused by search

**DoD:** `"Engineering Mathematics"` + branch CS filters correctly.

### T11. Listing detail page
- [ ] `fetchListingById`
- [ ] Image carousel (`ImageCarousel`)
- [ ] Seller row + verified badge
- [ ] "Chat with Seller" (stubs to chat route for now)
- [ ] ☆ Save + Report actions

**DoD:** URL `/listing/:id` renders full detail.

### T12. Updates tab (status-style)
- [ ] Horizontal avatar rail of recent listings
- [ ] Tapping a status opens the listing detail

**DoD:** Updates tab shows newest 10 items with day counters.

---

## M3 — Create Listing

### T13. Category picker bottom sheet
- [ ] `components/listing/CategoryPicker` (full FRONTEND §4.5 grid)
- [ ] FAB (＋) opens it

**DoD:** every category opens the sell form with category preselected.

### T14. Multi-photo upload
- [ ] `imagesRepo.uploadListingImage` (position-aware)
- [ ] `components/listing/ImageDropzone` (multi, compress client-side)
- [ ] Remove/reorder images

**DoD:** 6 photos upload and display; list supports growth to 6.

### T15. Sell form
- [ ] `pages/NewListingPage.jsx` v2 (title/subject/condition/price/free/pickup)
- [ ] `lib/validation.js` shared validators
- [ ] Price-or-free invariant enforced

**DoD:** creating a listing shows instantly in feed (Realtime).

### T16. My Listings + status management
- [ ] `pages/MyListingsPage.jsx`
- [ ] Mark sold / reserve / remove actions (owner-only, RLS-backed)
- [ ] Status chips

**DoD:** owner can move own listing active→reserved→sold→removed.

---

## M4 — Chat

### T17. Start conversation
- [ ] `chatRepo.startOrResumeConversation` (create or reuse)
- [ ] "Chat with Seller" wired to real conversation creation
- [ ] Redirect to `/chat/:id`

**DoD:** buyer → seller creates 2-participant conversation.

### T18. Chat list
- [ ] `pages/ChatListPage.jsx`
- [ ] `chatRepo.fetchConversationsFor`
- [ ] Preview = last message, unread count, time
- [ ] Realtime last-message updates

**DoD:** Chats tab lists conversations with previews.

### T19. Chat window
- [ ] `pages/ChatPage.jsx` with `useChat` subscription
- [ ] `MessageBubble`, `MessageInput`
- [ ] Sent/received bubble styling (FRONTEND §4.4)
- [ ] Auto-scroll to bottom; optimistic append

**DoD:** two browser sessions exchange messages < 500ms.

### T20. Read receipts + unread badge
- [ ] `is_read` toggled on view
- [ ] Unread dot on conversation rows + tab badge

**DoD:** opening a chat clears its unread state on next fetch.

---

## M5 — Locker

### T21. Favorites
- [ ] `favoritesRepo.toggleFavorite`, `isFavorited`
- [ ] ☆ button on detail + card
- [ ] `pages/FavoritesPage.jsx` (Saved tab)

**DoD:** saved items persist and appear in Saved tab.

### T22. Full profile page
- [ ] Display all profile fields
- [ ] Edit mode

**DoD:** profile is editable and reflects in cards.

### T23. Report action (build-time)
- [ ] `reports` table enabled + RLS
- [ ] Report dialog on listing detail
- [ ] `reportsRepo.submitReport`

**DoD:** any student can file a report; admin sees it in Phase 2.

### T24. Delete account / data
- [ ] Privacy: delete profile + anonymize listings + keep reviews (invariant §9)

**DoD:** account deletion works end-to-end.

---

## M6 — Shell

### T25. Bottom nav + app shell rework
- [ ] `components/layout/BottomNav` (Chats / Updates / Saved / ☰)
- [ ] FAB overlay
- [ ] Remove old header-only chrome on mobile

**DoD:** all core routes navigable from bottom tabs on mobile.

### T26. Dark theme tokens
- [ ] Apply FRONTEND token palette in `index.css`
- [ ] Bubbles, badges, chips, cards restyled

**DoD:** visual refresh matches chat-app feel (no brand copying).

### T27. Desktop shell (optional stretch)
- [ ] Left rail on ≥ 900px

**DoD:** desktop shell usable; no layout breakage.

---

## M7 — Hardening & Launch

### T28. Playwright e2e (WEBAPP_TESTING.md)
- [ ] Login/onboarding flow
- [ ] Create listing flow
- [ ] Chat flow (2 contexts)
- [ ] Favorites + profile flows

**DoD:** CI-green e2e suite.

### T29. RLS security audit
- [ ] Attempt cross-tenant reads via anon client — written check
- [ ] `security-checklist.md` output with evidence rows

**DoD:** no unauthorized reads/writes recorded.

### T30. Accessibility pass
- [ ] Keyboard-nav, focus rings, aria-live for messages, contrast check

**DoD:** Lighthouse a11y ≥ 95.

### T31. Deploy + env config
- [ ] Vercel project + VITE env vars
- [ ] `.env.vercel` documented
- [ ] `npm run build` green

**DoD:** `satiswap.vercel.app` live with seed data.