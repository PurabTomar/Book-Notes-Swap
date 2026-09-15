# SATI Swap — Codebase Design / Architecture

> **Status:** v1.0 | **Date:** Sep 15, 2026

---

## 1. Principles

1. **Deep modules** — each module exposes a thin interface and hides implementation inside subfolders.
2. **Mobile-first** — every component and page is designed for phone screens first; desktop is a bonus.
3. **RLS-first security** — access control enforced in the database layer, never trusted at the UI.
4. **Realtime by default** — chat and feed use Supabase Realtime channels.
5. **No secrets in the client** — service-role key stays server-side only.
6. **Fetch via lib modules** — components never call `supabase.from(...)` directly; they call typed repository functions.

---

## 2. Tech Stack (Current)

| Layer | Choice |
|---|---|
| UI | React 18 + Vite 5 |
| Styling | Plain CSS modules (current) → plan for Tailwind in Phase 2 |
| Router | react-router-dom v6 |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Deployment | Vercel |

## 3. Target Directory Structure

```
src/
  main.jsx                    # entry + router
  App.jsx                     # layout + route table
  index.css                   # global styles + design tokens
  lib/
    supabase.js               # client factory, isConfigured flag
    format.js                 # price/time/id helpers
    validation.js             # shared form validators (title, price, contact)
  data/
    constants.js              # categories, conditions, semesters, branches
    branches.js               # SATI branch list + subject maps per branch
  repositories/               # <-- NEW: typed data access layer
    listingsRepo.js           # fetchFeed, fetchById, create, updateStatus
    chatRepo.js               # startConversation, fetchMessages, sendMessage
    profileRepo.js            # getProfile, createProfile, updateProfile
    favoritesRepo.js          # addFavorite, removeFavorite, listFavorites
    imagesRepo.js             # uploadListingImage, deleteImage, getSignedUrl
  hooks/                      # <-- NEW: reusable React logic
    useListings.js            # feed + filters + realtime refresh
    useChat.js                # realtime conversation subscription
    useProfile.js             # auth state → profile
    useFavorites.js           # favorite toggle + list
  components/                 # presentational (no DB calls)
    layout/
      Header.jsx
      BottomNav.jsx           # <-- mobile bottom navigation (chats/updates/saved/profile)
      FloatingActionButton.jsx # + button
    chat/
      ConversationRow.jsx
      NewChatPreview.jsx
      MessageBubble.jsx
      MessageInput.jsx
    listing/
      ListingCard.jsx
      ListingDetailView.jsx
      CategoryPicker.jsx
      ImageCarousel.jsx
      ConditionBadge.jsx
      PriceTag.jsx
    shared/
      EmptyState.jsx
      Avatar.jsx
      Badge.jsx
      Spinner.jsx
      Toast.jsx
  pages/
    AuthPage.jsx              # login/signup
    VerifyPage.jsx            # SATI verification
    HomePage.jsx              # /  (chat-list style feed)
    SearchPage.jsx            # /search
    ListingDetailPage.jsx     # /listing/:id
    NewListingPage.jsx        # /new
    MyListingsPage.jsx        # /my-listings
    FavoritesPage.jsx         # /saved
    ChatListPage.jsx          # /chats
    ChatPage.jsx              # /chat/:conversationId
    ProfilePage.jsx           # /profile
    OnboardingPage.jsx        # /onboarding (first-run profile)
    admin/
      AdminDashboardPage.jsx  # /admin (phase 2)
supabase/
  schema.sql                  # v2 schema (profiles, listings, images, chat)
  seed.sql                    # sample data
  policies.sql                # RLS policies
docs/
  SPEC.md
  DOMAIN_MODEL.md
  ARCHITECTURE.md
  FRONTEND.md
  TDD.md
  WEBAPP_TESTING.md
  CODE_REVIEW.md
  BUG_DIAGNOSIS.md
  TICKETS.md
```

---

## 4. Module Boundaries & Dependency Rules

```
pages ──→ repositories ──→ lib/supabase.js
   │              │
   │              └──→ hooks
   │
   └──→ components (presentational, props-only)
              │
              └──→ data/constants.js

RULES:
- pages MAY import hooks + repositories
- hooks MAY import repositories
- repositories MAY import lib + config only (NO components, NO hooks)
- components MAY import constants + format; NEVER call supabase directly
- lib MUST NOT import anything from app layers
```

### Repository interface contracts (so features are testable & swappable)

```js
// listingsRepo.js
export async function fetchActiveListings({ filters, page }) -> Promise<Listing[]>
export async function fetchListingById(id) -> Promise<Listing | null>
export async function createListing(payload) -> Promise<Listing>
export async function updateListingStatus(id, status, { ownerOnly = true }) -> Promise<void>

// chatRepo.js
export async function startOrResumeConversation({ listingId, buyerId, sellerId }) -> Promise<Conversation>
export async function fetchConversationsFor(userId) -> Promise<ConversationWithPreview[]>
export async function fetchMessages(conversationId) -> Promise<Message[]>
export async function sendMessage({ conversationId, senderId, text }) -> Promise<Message>
export function subscribeToConversation(conversationId, onMessage) -> UnsubscribeFn

// favoritesRepo.js
export async function isFavorited(userId, listingId) -> Promise<bool>
export async function toggleFavorite(userId, listingId) -> Promise<bool>
```

---

## 5. Real-time Architecture

```
Supabase Realtime
   │
   ├── channel 'feed'            -> table: listings  (POSTGRES_CHANGES)
   │      └── pages/HomePage consumes -> useListings hook
   │
   └── channel 'conversation:{id}' -> table: messages (POSTGRES_CHANGES)
          └── pages/ChatPage consumes -> useChat hook
```

Subscription lifecycle is **owned by hooks** and cleaned up on unmount. Each page subscribes once.

---

## 6. Authentication Flow

```
Boot ──> supabase.auth.getSession()
          │
          ├── no session ──> <AuthPage/>
          │
          └── session ──> fetch profile table
                             │
                             ├── no profile row ──> <OnboardingPage/> (create profile)
                             ├── profile !verified ──> <VerifyPage/>
                             └── profile verified ──> <App/> main shell
```

- The `useProfile` hook exposes `{ session, profile, loading, refresh }`.
- Route guard `<RequireAuth>` wraps all protected routes.

---

## 7. Styling System

Current: plain CSS with custom properties (`:root` tokens in `index.css`).

Target design tokens (Phase 2, if Tailwind adopted):

```css
:root {
  --color-primary: #10b981;          /* SATI green (WhatsApp-adjacent, not identical) */
  --color-primary-dark: #059669;
  --color-bg-app: #0b141a;           /* dark chat wallpaper (mobile) */
  --color-bg-chat: #202c33;
  --color-surface: #111b21;
  --color-border: rgba(255,255,255,.08);
  --color-text: #e9edef;
  --color-text-soft: #8696a0;
  --color-bubble-out: #005c4b;       /* sent bubbles */
  --color-bubble-in: #202c33;        /* received bubbles */
  --color-danger: #ef4444;
  --color-whatsapp: #25d366;
  --radius-sm: 8px;
  --radius: 14px;
  --radius-lg: 20px;
}
```

---

## 8. Database Migration Plan

`supabase/schema.sql` v2 adds:

1. `profiles` table + trigger that auto-creates a profile row on auth signup
2. `listings` v2 — adds `seller_id`, `category`, `pickup_point`, `updated_at`, replaces open-contact fields (contact_email/phone/whatsapp removed → contact happens in-app via chat)
3. `listing_images`
4. `conversations`, `conversation_participants`, `messages`
5. `favorites`
6. `reviews`, `reports` (Phase 2)
7. Updated indexes: `listings(category/status/semester/created_at)`, `messages(conversation_id, created_at)`, full-text index on `listings(title, description)`
8. RLS policies per matrix in SPEC §7
9. Realtime publication for `listings`, `messages`

---

## 9. State Management Decision

**No external state library.** React context + hooks are sufficient:

| State type | Mechanism |
|---|---|
| Auth session | `supabase.auth` + `useProfile` hook |
| Server data | Per-page local state + repos |
| Realtime | Subscription hooks |
| UI (filters, tabs) | Local component state |

Rationale: app is small, avoids zustand/redux overhead, keeps bundle lean. Revisit only if cross-tab syncing needs arise.

---

## 10. Rollout Plan (aligned with TICKETS.md)

| Milestone | Deliverable |
|---|---|
| M0 | Schema v2 + RLS + seed (SQL) |
| M1 | Auth + Profiles + Onboarding |
| M2 | Feed + Search + Listing Detail |
| M3 | Create Listing + Images |
| M4 | Chat (realtime) |
| M5 | Favorites + My Listings + Profile |
| M6 | WhatsApp-style shell (BottomNav, dark theme) |
| M7 | Hardening: e2e tests, RLS audit, a11y pass |

Each milestone is independently demoable.