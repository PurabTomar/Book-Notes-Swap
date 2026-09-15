# SATI Swap — Frontend Design Direction

> **Status:** v1.0 | **Date:** Sep 15, 2026

---

## 1. Positioning

**Do not** make SATI Swap look like an e-commerce site (`Products → Cart → Checkout → Orders`). The core experience is:

> **Community → Listing → Chat → Campus Exchange**

The home screen should feel like a **student communication app**, not Amazon/OLX/OLX-style marketplace. We borrow the *information hierarchy* and *navigation patterns* of a messaging app, but we do **not** copy any brand's logo, color identity, proprietary icons, or visual assets.

---

## 2. Brand

| Attribute | Value |
|---|---|
| Name | **SATI Swap** |
| Tagline | Buy • Sell • Share • Connect |
| Style | Campus-native, chat-first, playful but clean |
| Personality | Friendly, trustworthy, student-to-student |

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Primary (SATI green) | `#10b981` | CTAs, verified badges, sent bubbles |
| Primary dark | `#059669` | Hover / pressed states |
| App background (dark) | `#0b141a` | App shell — chat wallpaper feel |
| Chat surface | `#202c33` | Panels, bubbles (received) |
| Surface | `#111b21` | Cards, modal surfaces |
| Border | `rgba(255,255,255,.08)` | Hairlines |
| Text primary | `#e9edef` | Body text |
| Text muted | `#8696a0` | Meta, timestamps, placeholders |
| Sent bubble | `#005c4b` | Outgoing messages |
| Danger | `#ef4444` | Errors, removed |
| Free/donate accent | `#f59e0b` | "FREE" badge |
| WhatsApp (link-out) | `#25d366` | Only pre-chat CTA fallback |

### Typography

- **System font stack** (Roboto/Segoe UI) — matches native app feel, zero webfont cost.
- Headings: 800 weight, tight letter-spacing.
- Body: 400, `15px` on mobile.
- Timestamps/meta: `12px`, muted.

---

## 3. Navigation Model — WhatsApp-inspired (not copied)

### Mobile: fixed bottom tab bar

```
┌───────────────────────────────┐
│         SATI SWAP      🔍 ⋮   │   <- Header (brand, search shortcut, menu)
├───────────────────────────────┤
│                               │
│        Current Screen         │
│                               │
├───────────────────────────────┤
│  Chats   Updates   Saved   ☰  │   <- Bottom nav (4 tabs)
└───────────────────────────────┘
```

| Tab | Destination |
|---|---|
| Chats | Home feed (chat-style listing list) |
| Updates | Status-style "recently posted" quick glance |
| Saved | Favorites |
| ☰ (Profile) | Profile + My Listings + Settings |

**Floating Action Button (＋)** — bottom-right, above the tab bar. Opens the category picker start of the Sell flow.

### Desktop: same navigation reflowed to a left rail (Phase 2)

---

## 4. Screen-by-Screen Direction

### 4.1 Auth / Onboarding
- Minimal card on phone-width column.
- "Continue with SATI email".
- After first login: onboarding sheet collects branch, year, semester, avatar.
- Verify screen: "We sent a verification link to your SATI email."

### 4.2 Home (Chats feed)
Each listing renders as a **conversation-style row**:

```
┌────────────────────────────────┐
│ [cover thumb] Book title…      │
│               EN M III • Sem 3 │
│               ₹180    2m ago   │
├────────────────────────────────┤
│ [cover thumb] CSE Lab Manual   │
│               FREE      1h ago │
├────────────────────────────────┤
│ [avatar]   PYQ pack – Sem 4    │
│            by Aman • CSE       │
│            ₹80       yesterday│
└────────────────────────────────┘
```

Row anatomy:
- 44px rounded thumb (or avatar for seller-focused items)
- Two-line text (title bold, meta muted)
- Right column: price/free + time-ago
- Verified buyer/seller shows a green check

### 4.3 Listing Detail
- Full-width image carousel (swipe, dots)
- Title, chips (category / condition / semester)
- Seller row: avatar, name, branch • year, verified badge
- Price tag (or FREE accent)
- Primary CTA: **"Chat with Seller"** (green bubble button)
- Secondary: **☆ Save**, **Report**
- Description block
- Pickup point row: 📍 SATI Library / Main Gate / etc.

### 4.4 Chat
```
┌────────────────────────────────┐
│ ‹  Aman    CSE • 2nd Year   ⋮ │
├────────────────────────────────┤
│   Hi! Is the book still        │
│   available?            9:42P  │
│                      ┌─────────┐
│   Yes, it is!         │  9:43P  │
│                      └─────────┘
│   Can we meet near the         │
│   library tomorrow?     9:43P  │
├────────────────────────────────┤
│  [Type a message…]           ➤ │
└────────────────────────────────┘
```
- Outgoing bubble: `#005c4b`, incoming: `#202c33`
- Timestamps inside bubble footer
- Read receipts (✓✓) — Phase 2
- Chat header shows seller profile + listing summary

### 4.5 Sell Flow (＋)
Bottom-sheet category picker:

```
What are you sharing?
┌────────┐ ┌────────┐ ┌────────┐
│ 📚 Book │ │ 📝 Notes│ │ 🧪 Lab  │
│        │ │        │ │ Manual  │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│ 📄 PYQ │ │ 📐 D'ing│ │ 🧮 Calc │
│        │ │ Equipmt │ │        │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐
│ 📎 Othr │ │ 🎁 FREE │
└────────┘ └────────┘
```

Then a modal form: photos (multi-upload grid) → title → subject → condition → price/Free toggle → pickup point.

### 4.6 Search
- Full overlap search screen (like messenger search).
- Recent searches chips.
- Result column + filter bottom sheet (branch, semester, category, price, condition, sort).

### 4.7 Profile
- Big avatar, name, branch • year • semester.
- Stats: listings / reviews / verified badge.
- Menu: My Listings, Saved, Reports I made, Privacy, Logout.

### 4.8 Updates (Status-style)
- Horizontal scroll of "Recently posted" avatars with unread-dot style days-old counters.

---

## 5. Motion & Feel

| Interaction | Motion |
|---|---|
| Tab switch | Instant (no slide) — native feel |
| Bottom sheet open | 240ms ease-out translateY |
| Message send | Bubble fades in 120ms |
| Like/favorite | Spring scale 1→0.8→1 |
| New chat row | Subtle highlight flash on realtime insert |
| Skeleton load | Shimmer (already present) |

---

## 6. Copy / Microcopy

| Context | Copy |
|---|---|
| Empty feed | "Nothing here yet. Be the first to share a book!" |
| Empty chat | "Start the conversation — ask about the book." |
| Unverified banner | "Verify with your SATI email to start selling." |
| Free badge | "FREE" |
| Primary CTA | "Chat with Seller" |
| Pickup hint | "Pick up: SATI Library (common)" |

---

## 7. Dark/Light

- **Dark-first** (matches chat apps). Light theme follows in Phase 2.
- Both themes share the same token names via CSS variables.

---

## 8. Accessibility Targets

- Touch targets ≥ 44px
- Contrast ≥ 4.5:1 for text
- Full keyboard navigation (tab order) on desktop
- `aria-live` for realtime message inserts
- Image alt text required on all listing content